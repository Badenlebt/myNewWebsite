/**
 * Integration tests for navigation.
 * Tests route transitions, URL updates, and component rendering.
 *
 * Validates: Requirements 2.1, 2.4
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { nextTick } from 'vue'

// Mock useContent composable to avoid fetch calls
vi.mock('@/composables/useContent', () => ({
  useContent: () => ({
    blogEntries: { value: [] },
    books: { value: [] },
    tags: { value: [] },
    categories: { value: [] },
    isLoading: { value: false },
    error: { value: null },
    fetchBlogEntries: vi.fn().mockResolvedValue(undefined),
    fetchBooks: vi.fn().mockResolvedValue(undefined),
    fetchTags: vi.fn().mockResolvedValue(undefined),
    fetchCategories: vi.fn().mockResolvedValue(undefined),
    getBlogBySlug: vi.fn().mockReturnValue(undefined),
    getBookBySlug: vi.fn().mockReturnValue(undefined),
    getLatestEntries: vi.fn().mockReturnValue([]),
    getEntriesByTag: vi.fn().mockReturnValue([]),
    getEntriesByCategory: vi.fn().mockReturnValue([]),
    getTagLabel: vi.fn().mockReturnValue(''),
    getCategoryLabel: vi.fn().mockReturnValue('')
  })
}))

// Mock useHead composable
vi.mock('@/composables/useHead', () => ({
  useHead: () => ({
    setHead: vi.fn()
  })
}))

// Mock useLanguage composable
vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: { value: 'de' },
    switchLanguage: vi.fn()
  })
}))

// Mock global fetch
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([])
})

// Import page components (eagerly for use in test router)
import HomePage from '@/pages/HomePage.vue'
import BlogPage from '@/pages/BlogPage.vue'
import BlogEntryPage from '@/pages/BlogEntryPage.vue'
import BookDetailPage from '@/pages/BookDetailPage.vue'
import ImprintPage from '@/pages/ImprintPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import App from '@/App.vue'

// Minimal i18n messages for tests
const messages = {
  de: {
    global: { title: 'Michael Hitzelberger', subtitle: 'Gedichte, Bücher und mehr…', moreLinks: 'Weitere Links', social: 'Social Media' },
    links: { start: 'Start', blog: 'Blog', books: 'Bücher', keinhorn: 'Das Keinhorn', albertAmeise: 'Albert Ameise', herzgedanken: 'Herzgedanken', imprint: 'Impressum', aboutMe: 'Über mich', startUrl: '/', blogUrl: '/blog', booksUrlPart: '/buecher/', keinhornUrl: '/buecher/das-keinhorn', albertAmeiseUrl: '/buecher/albert-ameise', herzgedankenUrl: '/buecher/herzgedanken', aboutMeUrl: '/ueber-mich', imprintUrl: '/impressum' },
    welcome: { title: 'Willkommen', subtitle: '', text: 'Willkommen auf meiner Seite' },
    books: { homeTitle: 'Bücher', moreLink: 'Mehr', notFound: 'Nicht gefunden', notFoundText: 'Buch nicht gefunden', lookHere: 'Schauen Sie hier:', shopTitle: 'Shop' },
    blog: { title: 'Blog', count: 'Einträge', notFound: 'Nicht gefunden', notFoundText: 'Eintrag nicht gefunden', lookHere: 'Schauen Sie hier:', tags: 'Schlagwörter', tagChosen: 'gewählt:', categories: 'Kategorien', categoryChosen: 'in der Kategorie' },
    notFound: { title: 'Seite nicht gefunden', text: 'Diese Seite existiert nicht.', toStartpage: 'Zurück zur' },
    imprint: { title: 'Impressum', responsible: 'Verantwortlich', address: 'Musterstr 1\n12345 Musterstadt', mail: 'mail(at)example.com', whoWeAre: 'Wer wir sind', whoWeAreText: 'Text', whoWeAreUrl: 'https://example.com', data: 'Datenschutz', dataText: 'Text', cookies: 'Cookies', cookiesText1: 'Text1', cookiesText2: 'Text2', otherSites: 'Andere Seiten', otherSitesText1: 'Text1', otherSitesText2: 'Text2' },
    buttons: { toTop: 'Nach oben' }
  },
  en: {
    global: { title: 'Michael Hitzelberger', subtitle: 'Poems, Books and more…', moreLinks: 'More links', social: 'Social media' },
    links: { start: 'Home', blog: 'Blog', books: 'Books', keinhorn: 'Das Keinhorn', albertAmeise: 'Albert Ameise', herzgedanken: 'Herzgedanken', imprint: 'Imprint', aboutMe: 'About me', startUrl: '/', blogUrl: '/blog', booksUrlPart: '/books/', keinhornUrl: '/books/das-keinhorn', albertAmeiseUrl: '/books/albert-ameise', herzgedankenUrl: '/books/herzgedanken', aboutMeUrl: '/about-me', imprintUrl: '/imprint' },
    notFound: { title: 'Page not found', text: 'This page does not exist.', toStartpage: 'Back to' }
  }
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
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
  })
}

function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'de',
    fallbackLocale: 'de',
    messages,
    missingWarn: false,
    fallbackWarn: false
  })
}

async function mountApp(router, initialRoute = '/') {
  await router.push(initialRoute)
  await router.isReady()

  const i18n = createTestI18n()
  const wrapper = mount(App, {
    global: {
      plugins: [router, i18n]
    }
  })
  await flushPromises()
  await nextTick()
  return wrapper
}

describe('Navigation Integration', () => {
  let router

  beforeEach(() => {
    router = createTestRouter()
  })

  describe('Route renders correct page component (Requirement 2.1)', () => {
    it('/ renders HomePage', async () => {
      const wrapper = await mountApp(router, '/')

      expect(wrapper.find('.home-page').exists()).toBe(true)
    })

    it('/blog renders BlogPage', async () => {
      const wrapper = await mountApp(router, '/blog')

      expect(wrapper.find('.blog-page').exists()).toBe(true)
    })

    it('/blog/:slug renders BlogEntryPage', async () => {
      const wrapper = await mountApp(router, '/blog/test-entry')

      expect(wrapper.find('.blog-entry-page').exists()).toBe(true)
    })

    it('/books/:slug renders BookDetailPage', async () => {
      const wrapper = await mountApp(router, '/books/test-book')

      expect(wrapper.find('.book-detail-page').exists()).toBe(true)
    })

    it('/buecher/:slug renders BookDetailPage (German alias)', async () => {
      const wrapper = await mountApp(router, '/buecher/test-buch')

      expect(wrapper.find('.book-detail-page').exists()).toBe(true)
    })

    it('/impressum renders ImprintPage', async () => {
      const wrapper = await mountApp(router, '/impressum')

      expect(wrapper.find('.imprint-page').exists()).toBe(true)
    })

    it('/imprint renders ImprintPage (English alias)', async () => {
      const wrapper = await mountApp(router, '/imprint')

      expect(wrapper.find('.imprint-page').exists()).toBe(true)
    })
  })

  describe('Redirect routes (Requirement 2.1)', () => {
    it('/home redirects to /', async () => {
      const wrapper = await mountApp(router, '/home')

      expect(router.currentRoute.value.path).toBe('/')
      expect(wrapper.find('.home-page').exists()).toBe(true)
    })

    it('/start redirects to /', async () => {
      const wrapper = await mountApp(router, '/start')

      expect(router.currentRoute.value.path).toBe('/')
      expect(wrapper.find('.home-page').exists()).toBe(true)
    })
  })

  describe('Catch-all route renders NotFoundPage (Requirement 2.1)', () => {
    it('/nonexistent renders NotFoundPage', async () => {
      const wrapper = await mountApp(router, '/nonexistent')

      expect(wrapper.find('.not-found-page').exists()).toBe(true)
    })

    it('/some/deep/path renders NotFoundPage', async () => {
      const wrapper = await mountApp(router, '/some/deep/path')

      expect(wrapper.find('.not-found-page').exists()).toBe(true)
    })

    it('NotFoundPage displays translated message', async () => {
      const wrapper = await mountApp(router, '/unknown-page')

      expect(wrapper.text()).toContain('Seite nicht gefunden')
    })
  })

  describe('URL updates correctly after navigation', () => {
    it('URL updates when navigating from / to /blog', async () => {
      const wrapper = await mountApp(router, '/')

      expect(router.currentRoute.value.path).toBe('/')

      await router.push('/blog')
      await flushPromises()
      await nextTick()

      expect(router.currentRoute.value.path).toBe('/blog')
      expect(wrapper.find('.blog-page').exists()).toBe(true)
    })

    it('URL updates when navigating to parameterized route', async () => {
      const wrapper = await mountApp(router, '/')

      await router.push('/blog/my-poem')
      await flushPromises()
      await nextTick()

      expect(router.currentRoute.value.path).toBe('/blog/my-poem')
      expect(router.currentRoute.value.params.slug).toBe('my-poem')
      expect(wrapper.find('.blog-entry-page').exists()).toBe(true)
    })

    it('URL updates when navigating to book detail', async () => {
      const wrapper = await mountApp(router, '/')

      await router.push('/books/das-keinhorn')
      await flushPromises()
      await nextTick()

      expect(router.currentRoute.value.path).toBe('/books/das-keinhorn')
      expect(router.currentRoute.value.params.slug).toBe('das-keinhorn')
      expect(wrapper.find('.book-detail-page').exists()).toBe(true)
    })
  })

  describe('Browser back/forward simulation (Requirement 2.4)', () => {
    it('router.back() returns to previous page', async () => {
      const wrapper = await mountApp(router, '/')

      await router.push('/blog')
      await flushPromises()
      await nextTick()
      expect(wrapper.find('.blog-page').exists()).toBe(true)

      router.back()
      await flushPromises()
      await nextTick()

      expect(router.currentRoute.value.path).toBe('/')
      expect(wrapper.find('.home-page').exists()).toBe(true)
    })

    it('router.forward() goes to next page after back', async () => {
      const wrapper = await mountApp(router, '/')

      await router.push('/blog')
      await flushPromises()
      await nextTick()

      await router.push('/impressum')
      await flushPromises()
      await nextTick()
      expect(wrapper.find('.imprint-page').exists()).toBe(true)

      router.back()
      await flushPromises()
      await nextTick()
      expect(router.currentRoute.value.path).toBe('/blog')

      router.forward()
      await flushPromises()
      await nextTick()
      expect(router.currentRoute.value.path).toBe('/impressum')
      expect(wrapper.find('.imprint-page').exists()).toBe(true)
    })

    it('multiple back navigations traverse history correctly', async () => {
      const wrapper = await mountApp(router, '/')

      await router.push('/blog')
      await flushPromises()
      await nextTick()

      await router.push('/impressum')
      await flushPromises()
      await nextTick()

      await router.push('/blog/test-slug')
      await flushPromises()
      await nextTick()

      // Go back through history
      router.back()
      await flushPromises()
      await nextTick()
      expect(router.currentRoute.value.path).toBe('/impressum')

      router.back()
      await flushPromises()
      await nextTick()
      expect(router.currentRoute.value.path).toBe('/blog')

      router.back()
      await flushPromises()
      await nextTick()
      expect(router.currentRoute.value.path).toBe('/')
    })
  })

  describe('Route transitions update rendered component', () => {
    it('transitioning between pages swaps rendered component', async () => {
      const wrapper = await mountApp(router, '/')
      expect(wrapper.find('.home-page').exists()).toBe(true)
      expect(wrapper.find('.blog-page').exists()).toBe(false)

      await router.push('/blog')
      await flushPromises()
      await nextTick()
      expect(wrapper.find('.blog-page').exists()).toBe(true)
      expect(wrapper.find('.home-page').exists()).toBe(false)

      await router.push('/impressum')
      await flushPromises()
      await nextTick()
      expect(wrapper.find('.imprint-page').exists()).toBe(true)
      expect(wrapper.find('.blog-page').exists()).toBe(false)
    })

    it('redirect routes do not render intermediate component', async () => {
      const wrapper = await mountApp(router, '/home')

      // Should render HomePage directly (redirect target)
      expect(wrapper.find('.home-page').exists()).toBe(true)
      expect(router.currentRoute.value.path).toBe('/')
    })
  })
})
