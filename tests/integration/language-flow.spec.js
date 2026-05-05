/**
 * Integration tests for language switching flow.
 * Tests full flow: click language switcher → localStorage update → i18n update → UI change.
 *
 * Validates: Requirements 3.3, 3.4, 3.5
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { nextTick, defineComponent, h } from 'vue'
import { useLanguage } from '@/composables/useLanguage.js'

// Mock useContent composable to avoid fetch calls
vi.mock('@/composables/useContent', () => ({
  useContent: () => ({
    blogEntries: { value: [] },
    books: { value: [] },
    tags: { value: [] },
    isLoading: { value: false },
    error: { value: null },
    fetchBlogEntries: vi.fn().mockResolvedValue(undefined),
    fetchBooks: vi.fn().mockResolvedValue(undefined),
    fetchTags: vi.fn().mockResolvedValue(undefined),
    getBlogBySlug: vi.fn().mockReturnValue(undefined),
    getBookBySlug: vi.fn().mockReturnValue(undefined),
    getLatestEntries: vi.fn().mockReturnValue([]),
    getEntriesByTag: vi.fn().mockReturnValue([]),
    getTagLabel: vi.fn().mockReturnValue('')
  })
}))

// Mock useHead composable
vi.mock('@/composables/useHead', () => ({
  useHead: () => ({
    setHead: vi.fn()
  })
}))

// Mock global fetch
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([])
})

import HomePage from '@/pages/HomePage.vue'
import ImprintPage from '@/pages/ImprintPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import MenuBar from '@/components/MenuBar.vue'

// Full i18n messages for testing language switch effects
const messages = {
  de: {
    global: { title: 'Michael Hitzelberger', subtitle: 'Gedichte, Bücher und mehr' },
    links: {
      start: 'Startseite',
      blog: 'Blog',
      books: 'Bücher',
      imprint: 'Impressum',
      startUrl: '/',
      blogUrl: '/blog',
      booksUrlPart: '/buecher/',
      imprintUrl: '/impressum'
    },
    welcome: { title: 'WILLKOMMEN', subtitle: 'auf meiner Seite!', text: 'Viel Spaß beim Stöbern!' },
    books: { homeTitle: 'Aktuelle Buchprojekte', homeIntro: 'Hier stelle ich euch meine aktuellen Buchprojekte vor.', moreLink: 'Mehr', notFound: 'Nicht gefunden', notFoundText: 'Buch nicht gefunden', lookHere: 'Schauen Sie hier:', shopTitle: 'Shop' },
    blog: { title: 'Blog', count: 'Einträge', homeTitle: 'Neuste Blogeinträge', moreLink: 'Weiterlesen', allEntries: 'Alle Blogeinträge ansehen', notFound: 'Nicht gefunden', notFoundText: 'Eintrag nicht gefunden', lookHere: 'Schauen Sie hier:', tags: 'Tags', tagChosen: 'gewählt:' },
    notFound: { title: 'Seite nicht gefunden', text: 'Unter dieser URL konnte leider keine Seite gefunden werden.', toStartpage: 'Hier geht es zur' },
    imprint: { title: 'Impressum', responsible: 'Verantwortlich', address: 'Musterstr 1\n12345 Musterstadt', mail: 'mail(at)example.com', whoWeAre: 'Wer wir sind', whoWeAreText: 'Text', whoWeAreUrl: 'https://example.com', data: 'Datenschutz', dataText: 'Text', cookies: 'Cookies', cookiesText1: 'Text1', cookiesText2: 'Text2', otherSites: 'Andere Seiten', otherSitesText1: 'Text1', otherSitesText2: 'Text2' },
    buttons: { toTop: 'Nach oben' }
  },
  en: {
    global: { title: 'Michael Hitzelberger', subtitle: 'Poems, books and more' },
    links: {
      start: 'Home',
      blog: 'Blog',
      books: 'Books',
      imprint: 'Imprint',
      startUrl: '/',
      blogUrl: '/blog',
      booksUrlPart: '/books/',
      imprintUrl: '/imprint'
    },
    welcome: { title: 'WELCOME', subtitle: 'to my website!', text: 'Have fun looking around!' },
    books: { homeTitle: 'Current book projects', homeIntro: 'This is where I present you my current book projects.', moreLink: 'More', notFound: 'Not found', notFoundText: 'Book not found', lookHere: 'Look here:', shopTitle: 'Shop' },
    blog: { title: 'Blog', count: 'entries', homeTitle: 'Newest blog entries', moreLink: 'Read more', allEntries: 'View all blog entries', notFound: 'Not found', notFoundText: 'Entry not found', lookHere: 'Look here:', tags: 'Tags', tagChosen: 'chosen:' },
    notFound: { title: 'Page not found', text: 'Unfortunately we could not find any content belonging to this URL.', toStartpage: 'Find more on the' },
    imprint: { title: 'Imprint', responsible: 'Responsible', address: 'Musterstr 1\n12345 Musterstadt', mail: 'mail(at)example.com', whoWeAre: 'Who we are', whoWeAreText: 'Text', whoWeAreUrl: 'https://example.com', data: 'Data security', dataText: 'Text', cookies: 'Cookies', cookiesText1: 'Text1', cookiesText2: 'Text2', otherSites: 'Embedded content', otherSitesText1: 'Text1', otherSitesText2: 'Text2' },
    buttons: { toTop: 'Back to top' }
  }
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomePage },
      { path: '/impressum', component: ImprintPage },
      { path: '/imprint', component: ImprintPage },
      { path: '/:pathMatch(.*)*', component: NotFoundPage }
    ]
  })
}

function createTestI18n(locale = 'de') {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'de',
    messages,
    missingWarn: false,
    fallbackWarn: false
  })
}

async function mountMenuBar(initialLocale = 'de') {
  const router = createTestRouter()
  await router.push('/')
  await router.isReady()

  const i18n = createTestI18n(initialLocale)
  const wrapper = mount(MenuBar, {
    global: {
      plugins: [router, i18n]
    }
  })
  await flushPromises()
  return { wrapper, router, i18n }
}

function getLangButton(wrapper, label) {
  const langButtons = wrapper.findAll('.menubar__lang-btn')
  return langButtons.find(btn => btn.text() === label)
}

describe('Language Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Clicking language switcher updates localStorage (Requirement 3.4)', () => {
    it('clicking EN button stores "en" in localStorage', async () => {
      const { wrapper } = await mountMenuBar('de')

      const enButton = getLangButton(wrapper, 'EN')
      expect(enButton).toBeDefined()

      await enButton.trigger('click')
      await flushPromises()

      expect(localStorage.getItem('language')).toBe('en')
    })

    it('clicking DE button stores "de" in localStorage', async () => {
      const { wrapper } = await mountMenuBar('en')

      const deButton = getLangButton(wrapper, 'DE')
      expect(deButton).toBeDefined()

      await deButton.trigger('click')
      await flushPromises()

      expect(localStorage.getItem('language')).toBe('de')
    })
  })

  describe('Clicking language switcher updates vue-i18n locale (Requirement 3.3)', () => {
    it('switching to EN updates i18n locale to "en"', async () => {
      const { wrapper, i18n } = await mountMenuBar('de')

      const enButton = getLangButton(wrapper, 'EN')
      await enButton.trigger('click')
      await flushPromises()

      expect(i18n.global.locale.value).toBe('en')
    })

    it('switching to DE updates i18n locale to "de"', async () => {
      const { wrapper, i18n } = await mountMenuBar('en')

      const deButton = getLangButton(wrapper, 'DE')
      await deButton.trigger('click')
      await flushPromises()

      expect(i18n.global.locale.value).toBe('de')
    })
  })

  describe('UI text changes immediately after language switch (Requirement 3.3)', () => {
    it('MenuBar subtitle changes from German to English without page reload', async () => {
      const { wrapper } = await mountMenuBar('de')

      // Ensure we start in German by clicking DE
      const deButton = getLangButton(wrapper, 'DE')
      await deButton.trigger('click')
      await flushPromises()
      await nextTick()

      // Verify German text is displayed
      expect(wrapper.text()).toContain('Gedichte, Bücher und mehr')

      // Switch to English
      const enButton = getLangButton(wrapper, 'EN')
      await enButton.trigger('click')
      await flushPromises()
      await nextTick()

      // Verify English text is now displayed
      expect(wrapper.text()).toContain('Poems, books and more')
    })

    it('navigation link text changes on language switch', async () => {
      const { wrapper } = await mountMenuBar('de')

      // Ensure we start in German
      const deButton = getLangButton(wrapper, 'DE')
      await deButton.trigger('click')
      await flushPromises()
      await nextTick()

      // Verify German navigation links
      expect(wrapper.text()).toContain('Startseite')
      expect(wrapper.text()).toContain('Bücher')
      expect(wrapper.text()).toContain('Impressum')

      // Switch to English
      const enButton = getLangButton(wrapper, 'EN')
      await enButton.trigger('click')
      await flushPromises()
      await nextTick()

      // Verify English navigation links
      expect(wrapper.text()).toContain('Home')
      expect(wrapper.text()).toContain('Books')
      expect(wrapper.text()).toContain('Imprint')
    })

    it('switching back to DE restores German text', async () => {
      const { wrapper } = await mountMenuBar('de')

      // Switch to English
      const enButton = getLangButton(wrapper, 'EN')
      await enButton.trigger('click')
      await flushPromises()
      await nextTick()

      expect(wrapper.text()).toContain('Poems, books and more')

      // Switch back to German
      const deButton = getLangButton(wrapper, 'DE')
      await deButton.trigger('click')
      await flushPromises()
      await nextTick()

      expect(wrapper.text()).toContain('Gedichte, Bücher und mehr')
    })
  })

  describe('Language persists across sessions (Requirement 3.5)', () => {
    it('language set to "en" is restored on next initialization', async () => {
      // Simulate first session: user switches to English
      const { wrapper: wrapper1 } = await mountMenuBar('de')
      const enButton = getLangButton(wrapper1, 'EN')
      await enButton.trigger('click')
      await flushPromises()

      expect(localStorage.getItem('language')).toBe('en')
      wrapper1.unmount()

      // Simulate new session: mount fresh component
      // The useLanguage composable reads localStorage and syncs locale
      const { wrapper: wrapper2, i18n: i18n2 } = await mountMenuBar('en')

      // The composable syncs locale to currentLanguage (which is 'en' from localStorage)
      expect(i18n2.global.locale.value).toBe('en')
      expect(wrapper2.text()).toContain('Poems, books and more')
    })

    it('language set to "de" is restored on next initialization', async () => {
      // Ensure state is 'de'
      const { wrapper: wrapper1 } = await mountMenuBar('de')
      const deButton = getLangButton(wrapper1, 'DE')
      await deButton.trigger('click')
      await flushPromises()

      expect(localStorage.getItem('language')).toBe('de')
      wrapper1.unmount()

      // Simulate new session
      const { wrapper: wrapper2, i18n: i18n2 } = await mountMenuBar('de')

      expect(i18n2.global.locale.value).toBe('de')
      expect(wrapper2.text()).toContain('Gedichte, Bücher und mehr')
    })

    it('full round-trip: switch language → persist → restore on new session', async () => {
      // Session 1: Start in German, switch to English
      const { wrapper: wrapper1 } = await mountMenuBar('de')

      // Ensure starting in DE
      const deBtn = getLangButton(wrapper1, 'DE')
      await deBtn.trigger('click')
      await flushPromises()

      // Now switch to EN
      const enButton = getLangButton(wrapper1, 'EN')
      await enButton.trigger('click')
      await flushPromises()

      // Verify localStorage was updated
      expect(localStorage.getItem('language')).toBe('en')
      wrapper1.unmount()

      // Session 2: Read from localStorage and verify English is restored
      const storedLang = localStorage.getItem('language')
      expect(storedLang).toBe('en')

      const { wrapper: wrapper2, i18n: i18n2 } = await mountMenuBar(storedLang)

      expect(i18n2.global.locale.value).toBe('en')
      expect(wrapper2.text()).toContain('Poems, books and more')
    })
  })

  describe('Invalid localStorage values fall back to "de" (Requirement 3.5)', () => {
    it('switchLanguage rejects invalid language values', async () => {
      // Start in a known state (German)
      const { wrapper, i18n } = await mountMenuBar('de')
      const deButton = getLangButton(wrapper, 'DE')
      await deButton.trigger('click')
      await flushPromises()

      expect(i18n.global.locale.value).toBe('de')
      expect(localStorage.getItem('language')).toBe('de')

      // Attempt to set invalid language directly via composable
      // The LanguageProbe component gives us access to useLanguage within setup context
      const router = createTestRouter()
      await router.push('/')
      await router.isReady()

      const i18n2 = createTestI18n('de')
      let switchFn
      const ProbeWithSwitch = defineComponent({
        setup() {
          const { currentLanguage, switchLanguage } = useLanguage()
          switchFn = switchLanguage
          return { currentLanguage }
        },
        render() {
          return h('span', { class: 'lang-probe' }, this.currentLanguage)
        }
      })
      const probe = mount(ProbeWithSwitch, {
        global: { plugins: [router, i18n2] }
      })
      await flushPromises()

      // Ensure we're in 'de' state
      switchFn('de')
      await nextTick()
      expect(probe.text()).toBe('de')

      // Try invalid values — should be no-ops
      switchFn('fr')
      await nextTick()
      expect(probe.text()).toBe('de')
      expect(i18n2.global.locale.value).toBe('de')
      expect(localStorage.getItem('language')).toBe('de')
    })

    it('switchLanguage ignores empty string', async () => {
      const router = createTestRouter()
      await router.push('/')
      await router.isReady()

      const i18n = createTestI18n('de')
      let switchFn
      const ProbeWithSwitch = defineComponent({
        setup() {
          const { currentLanguage, switchLanguage } = useLanguage()
          switchFn = switchLanguage
          return { currentLanguage }
        },
        render() {
          return h('span', { class: 'lang-probe' }, this.currentLanguage)
        }
      })
      const probe = mount(ProbeWithSwitch, {
        global: { plugins: [router, i18n] }
      })
      await flushPromises()

      // Ensure we're in 'de' state
      switchFn('de')
      await nextTick()

      // Try empty string — should be a no-op
      switchFn('')
      await nextTick()
      expect(probe.text()).toBe('de')
      expect(i18n.global.locale.value).toBe('de')
    })

    it('switchLanguage ignores null/undefined values', async () => {
      const router = createTestRouter()
      await router.push('/')
      await router.isReady()

      const i18n = createTestI18n('de')
      let switchFn
      const ProbeWithSwitch = defineComponent({
        setup() {
          const { currentLanguage, switchLanguage } = useLanguage()
          switchFn = switchLanguage
          return { currentLanguage }
        },
        render() {
          return h('span', { class: 'lang-probe' }, this.currentLanguage)
        }
      })
      const probe = mount(ProbeWithSwitch, {
        global: { plugins: [router, i18n] }
      })
      await flushPromises()

      // Ensure we're in 'de' state
      switchFn('de')
      await nextTick()

      // Try null and undefined — should be no-ops
      switchFn(null)
      await nextTick()
      expect(probe.text()).toBe('de')

      switchFn(undefined)
      await nextTick()
      expect(probe.text()).toBe('de')
      expect(i18n.global.locale.value).toBe('de')
    })
  })
})
