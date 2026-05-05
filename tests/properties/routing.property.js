import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createApp, defineComponent, h, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
import de from '../../src/locale/de.json'
import en from '../../src/locale/en.json'

/**
 * Property tests for routing
 * Feature: vue-website-rebuild
 * Validates: Requirements 2.2, 11.1
 */

// --- Stub components for Property 1 (route resolution only) ---

const HomePage = defineComponent({ name: 'HomePage', setup() { return () => h('div', 'home') } })
const BlogPage = defineComponent({ name: 'BlogPage', setup() { return () => h('div', 'blog') } })
const BlogEntryPage = defineComponent({ name: 'BlogEntryPage', setup() { return () => h('div', 'blog-entry') } })
const BookDetailPage = defineComponent({ name: 'BookDetailPage', setup() { return () => h('div', 'book-detail') } })
const ImprintPage = defineComponent({ name: 'ImprintPage', setup() { return () => h('div', 'imprint') } })
const NotFoundPage = defineComponent({ name: 'NotFoundPage', setup() { return () => h('div', 'not-found') } })

const routes = [
  { path: '/', component: HomePage },
  { path: '/home', redirect: '/' },
  { path: '/start', redirect: '/' },
  { path: '/blog', component: BlogPage },
  { path: '/blog/:slug', component: BlogEntryPage },
  { path: '/books/:slug', component: BookDetailPage },
  { path: '/buecher/:slug', component: BookDetailPage },
  { path: '/impressum', component: ImprintPage },
  { path: '/imprint', component: ImprintPage },
  { path: '/:pathMatch(.*)*', component: NotFoundPage }
]

// --- Defined route path patterns ---

const staticPaths = ['/', '/home', '/start', '/blog', '/impressum', '/imprint']

/**
 * Check if a path matches any defined route (excluding the catch-all).
 */
function isDefinedRoute(path) {
  if (staticPaths.includes(path)) return true
  const paramPrefixes = ['/blog/', '/books/', '/buecher/']
  for (const prefix of paramPrefixes) {
    if (path.startsWith(prefix)) {
      const rest = path.slice(prefix.length)
      if (rest.length > 0 && !rest.includes('/')) return true
    }
  }
  return false
}

// --- Generators ---

/**
 * Generate arbitrary URL path strings that are NOT in the set of defined routes.
 * Uses path-safe characters to avoid router warnings about double slashes.
 */
const arbUndefinedPath = fc.tuple(
  fc.array(
    fc.stringOf(
      fc.constantFrom(
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_'
      ),
      { minLength: 1, maxLength: 15 }
    ),
    { minLength: 1, maxLength: 4 }
  )
).map(([segments]) => '/' + segments.join('/'))
  .filter(path => !isDefinedRoute(path))

// --- Helper to create a fresh router with memory history ---

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes
  })
}

// --- Tests ---

describe('Routing Properties', () => {
  // --- Property 1: Undefined routes resolve to 404 ---
  describe('Property 1: Undefined routes resolve to 404', () => {
    /**
     * Feature: vue-website-rebuild, Property 1: Undefined routes resolve to 404
     * Validates: Requirements 2.2
     *
     * For any URL path string that is not in the set of defined routes,
     * the router SHALL resolve to the NotFoundPage component.
     */
    it('any undefined path resolves to NotFoundPage component', () => {
      fc.assert(
        fc.property(
          arbUndefinedPath,
          (path) => {
            const router = createTestRouter()
            const resolved = router.resolve(path)

            // The catch-all route should match, which uses NotFoundPage
            const matchedRoute = resolved.matched[resolved.matched.length - 1]
            expect(matchedRoute).toBeDefined()
            expect(matchedRoute.components.default).toBe(NotFoundPage)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // --- Property 12: Route navigation sets document title ---
  describe('Property 12: Route navigation sets document title', () => {
    let storage = {}

    beforeEach(() => {
      storage = {}
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: (key) => (key in storage ? storage[key] : null),
          setItem: (key, value) => { storage[key] = String(value) },
          removeItem: (key) => { delete storage[key] },
          clear: () => { storage = {} },
          get length() { return Object.keys(storage).length },
          key: (i) => Object.keys(storage)[i] || null
        },
        writable: true,
        configurable: true
      })

      // Mock fetch for useContent composable
      globalThis.fetch = vi.fn(async (url) => {
        if (url.includes('blog-entries.json')) {
          return { ok: true, json: async () => [] }
        }
        if (url.includes('books.json')) {
          return { ok: true, json: async () => [] }
        }
        if (url.includes('tags.json')) {
          return { ok: true, json: async () => [] }
        }
        return { ok: true, json: async () => [] }
      })
    })

    afterEach(() => {
      storage = {}
      vi.restoreAllMocks()
    })

    /**
     * Feature: vue-website-rebuild, Property 12: Route navigation sets document title
     * Validates: Requirements 11.1
     *
     * For any route in the router configuration that maps to a page component,
     * navigating to that route SHALL result in document.title being set to a non-empty string.
     */
    it('navigating to any defined route sets document.title to a non-empty string', async () => {
      // Routes that directly render a page component (not redirects)
      // For parameterized routes, we use sample slugs
      const testPaths = [
        '/',
        '/blog',
        '/blog/test-slug',
        '/books/test-slug',
        '/buecher/test-slug',
        '/impressum',
        '/imprint',
        '/nonexistent-page-xyz'  // catch-all → NotFoundPage
      ]

      const arbDefinedPath = fc.constantFrom(...testPaths)

      await fc.assert(
        fc.asyncProperty(
          arbDefinedPath,
          async (path) => {
            // Reset document.title before each navigation
            document.title = ''

            const i18n = createI18n({
              legacy: false,
              locale: 'de',
              fallbackLocale: 'de',
              messages: { de, en }
            })

            const router = createRouter({
              history: createMemoryHistory(),
              routes: [
                { path: '/', component: () => import('../../src/pages/HomePage.vue') },
                { path: '/home', redirect: '/' },
                { path: '/start', redirect: '/' },
                { path: '/blog', component: () => import('../../src/pages/BlogPage.vue') },
                { path: '/blog/:slug', component: () => import('../../src/pages/BlogEntryPage.vue') },
                { path: '/books/:slug', component: () => import('../../src/pages/BookDetailPage.vue') },
                { path: '/buecher/:slug', component: () => import('../../src/pages/BookDetailPage.vue') },
                { path: '/impressum', component: () => import('../../src/pages/ImprintPage.vue') },
                { path: '/imprint', component: () => import('../../src/pages/ImprintPage.vue') },
                { path: '/:pathMatch(.*)*', component: () => import('../../src/pages/NotFoundPage.vue') }
              ]
            })

            // Navigate before mounting
            router.push(path)
            await router.isReady()

            const app = createApp({
              setup() {
                return () => h(RouterView)
              }
            })
            app.use(router)
            app.use(i18n)

            const el = document.createElement('div')
            document.body.appendChild(el)
            app.mount(el)

            // Wait for component to mount and onMounted to fire
            await nextTick()
            await nextTick()
            // Allow async operations (fetch calls in onMounted) to settle
            await new Promise(resolve => setTimeout(resolve, 50))
            await nextTick()

            expect(document.title).toBeTruthy()
            expect(document.title.length).toBeGreaterThan(0)

            app.unmount()
            el.remove()
          }
        ),
        { numRuns: 100 }
      )
    }, 30000) // Extended timeout for 100 iterations with async mounting
  })
})
