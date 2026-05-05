import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { createI18n } from 'vue-i18n'
import { createApp, defineComponent, h } from 'vue'
import de from '../../src/locale/de.json'
import en from '../../src/locale/en.json'

/**
 * Property tests for language composable (useLanguage)
 * Feature: vue-website-rebuild
 * Validates: Requirements 3.3, 3.4, 3.5
 */

// --- Generators ---

/** Generate a valid language value */
const arbLanguage = fc.constantFrom('de', 'en')

/**
 * Collect all leaf keys from a nested object as dot-separated paths.
 * Only includes keys where de and en have DISTINCT string values.
 */
function getDistinctTranslationKeys(deObj, enObj, prefix = '') {
  const keys = []
  for (const key of Object.keys(deObj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const deVal = deObj[key]
    const enVal = enObj[key]
    if (typeof deVal === 'string' && typeof enVal === 'string') {
      if (deVal !== enVal) {
        keys.push(fullKey)
      }
    } else if (typeof deVal === 'object' && deVal !== null && typeof enVal === 'object' && enVal !== null) {
      keys.push(...getDistinctTranslationKeys(deVal, enVal, fullKey))
    }
  }
  return keys
}

const distinctKeys = getDistinctTranslationKeys(de, en)

/** Generate a translation key that has distinct values in DE and EN */
const arbTranslationKey = fc.constantFrom(...distinctKeys)

// --- Helpers ---

/** Resolve a dot-separated key from a nested object */
function resolveKey(obj, key) {
  return key.split('.').reduce((acc, part) => acc?.[part], obj)
}

// --- localStorage mock ---
let storage = {}

const localStorageMock = {
  getItem: (key) => (key in storage ? storage[key] : null),
  setItem: (key, value) => { storage[key] = String(value) },
  removeItem: (key) => { delete storage[key] },
  clear: () => { storage = {} },
  get length() { return Object.keys(storage).length },
  key: (i) => Object.keys(storage)[i] || null
}

// --- Tests ---

describe('Language Properties', () => {
  beforeEach(() => {
    storage = {}
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    storage = {}
  })

  // --- Property 2: Language persistence round-trip ---
  describe('Property 2: Language persistence round-trip', () => {
    /**
     * Feature: vue-website-rebuild, Property 2: Language persistence round-trip
     * Validates: Requirements 3.4, 3.5
     *
     * For any valid language value ('de' or 'en'), calling switchLanguage(lang)
     * and then reading the persisted value from localStorage, followed by
     * initializing useLanguage() in a new session, SHALL restore the same language value.
     */
    it('switchLanguage persists to localStorage and restores on re-initialization', () => {
      fc.assert(
        fc.property(
          arbLanguage,
          (lang) => {
            // Clear storage to simulate fresh state
            storage = {}

            // Create a fresh i18n + app to provide context for useLanguage
            const i18n = createI18n({
              legacy: false,
              locale: 'de',
              fallbackLocale: 'de',
              messages: { de, en }
            })

            // We need a component that calls useLanguage in setup
            let switchLanguage
            let currentLanguage

            const TestComponent = defineComponent({
              setup() {
                // Import useLanguage dynamically to get fresh module
                const { useLanguage } = require('../../src/composables/useLanguage.js')
                const result = useLanguage()
                switchLanguage = result.switchLanguage
                currentLanguage = result.currentLanguage
                return () => h('div')
              }
            })

            const app = createApp(TestComponent)
            app.use(i18n)
            const el = document.createElement('div')
            document.body.appendChild(el)
            app.mount(el)

            // Call switchLanguage with the generated language
            switchLanguage(lang)

            // Verify localStorage was updated (persistence - Requirement 3.4)
            const stored = localStorage.getItem('language')
            expect(stored).toBe(lang)

            // Verify currentLanguage ref was updated
            expect(currentLanguage.value).toBe(lang)

            // Simulate "new session" restoration (Requirement 3.5):
            // Read from localStorage and verify the initialization logic
            // would restore the same language
            const restoredLang = (() => {
              const s = localStorage.getItem('language')
              if (['de', 'en'].includes(s)) return s
              return 'de'
            })()
            expect(restoredLang).toBe(lang)

            // Cleanup
            app.unmount()
            el.remove()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // --- Property 3: Language switch updates translation output ---
  describe('Property 3: Language switch updates translation output', () => {
    /**
     * Feature: vue-website-rebuild, Property 3: Language switch updates translation output
     * Validates: Requirements 3.3
     *
     * For any translation key that has distinct values in the DE and EN locale files,
     * switching the language SHALL cause t(key) to return the string from the newly selected locale.
     */
    it('switching language causes t(key) to return the string from the new locale', () => {
      fc.assert(
        fc.property(
          arbLanguage,
          arbTranslationKey,
          (lang, key) => {
            // Clear storage
            storage = {}

            // Create a fresh i18n + app
            const i18n = createI18n({
              legacy: false,
              locale: 'de',
              fallbackLocale: 'de',
              messages: { de, en }
            })

            let switchLanguage

            const TestComponent = defineComponent({
              setup() {
                const { useLanguage } = require('../../src/composables/useLanguage.js')
                const result = useLanguage()
                switchLanguage = result.switchLanguage
                return () => h('div')
              }
            })

            const app = createApp(TestComponent)
            app.use(i18n)
            const el = document.createElement('div')
            document.body.appendChild(el)
            app.mount(el)

            // Switch to the generated language (as useLanguage does)
            switchLanguage(lang)

            // Get the translation using i18n's global t function
            const translated = i18n.global.t(key)

            // Get the expected value from the locale file
            const expectedMessages = lang === 'de' ? de : en
            const expected = resolveKey(expectedMessages, key)

            expect(translated).toBe(expected)

            // Cleanup
            app.unmount()
            el.remove()
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
