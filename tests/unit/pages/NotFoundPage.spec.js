/**
 * Unit tests for NotFoundPage component.
 * Verifies "page not found" message and link to homepage.
 *
 * Validates: Requirements 2.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'

vi.mock('@/composables/useHead', () => ({
  useHead: () => ({ setHead: vi.fn() })
}))

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: { value: 'de' },
    switchLanguage: vi.fn()
  })
}))

vi.mock('@/composables/useContent', () => ({
  useContent: () => ({
    blogEntries: { value: [] },
    books: { value: [] },
    tags: { value: [] },
    isLoading: { value: false },
    error: { value: null },
    fetchBlogEntries: vi.fn(),
    fetchBooks: vi.fn(),
    fetchTags: vi.fn(),
    getBlogBySlug: vi.fn(),
    getBookBySlug: vi.fn(),
    getLatestEntries: vi.fn().mockReturnValue([]),
    getEntriesByTag: vi.fn().mockReturnValue([]),
    getTagLabel: vi.fn()
  })
}))

import NotFoundPage from '@/pages/NotFoundPage.vue'

const messages = {
  de: {
    global: { title: 'Michael Hitzelberger' },
    notFound: {
      title: 'Seite nicht gefunden',
      text: 'Unter dieser URL konnte leider keine Seite gefunden werden.',
      toStartpage: 'Hier geht es zur'
    },
    links: { start: 'Startseite' }
  },
  en: {
    global: { title: 'Michael Hitzelberger' },
    notFound: {
      title: 'Page not found',
      text: 'Unfortunately we could not find any content belonging to this URL.',
      toStartpage: 'Find more on the'
    },
    links: { start: 'Home' }
  }
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
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

async function mountNotFound(locale = 'de', route = '/nonexistent') {
  const router = createTestRouter()
  await router.push(route)
  await router.isReady()

  const i18n = createTestI18n(locale)

  const wrapper = mount(NotFoundPage, {
    global: {
      plugins: [router, i18n]
    }
  })
  await flushPromises()
  return { wrapper, router }
}

describe('NotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('German (DE) content', () => {
    it('renders "Seite nicht gefunden" title', async () => {
      const { wrapper } = await mountNotFound('de')
      expect(wrapper.find('h1').text()).toBe('Seite nicht gefunden')
    })

    it('renders explanation text', async () => {
      const { wrapper } = await mountNotFound('de')
      expect(wrapper.text()).toContain('Unter dieser URL konnte leider keine Seite gefunden werden.')
    })

    it('renders link text to startpage', async () => {
      const { wrapper } = await mountNotFound('de')
      expect(wrapper.text()).toContain('Hier geht es zur')
      expect(wrapper.text()).toContain('Startseite')
    })

    it('renders router-link to homepage', async () => {
      const { wrapper } = await mountNotFound('de')
      const link = wrapper.find('a[href="/"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Startseite')
    })
  })

  describe('English (EN) content', () => {
    it('renders "Page not found" title', async () => {
      const { wrapper } = await mountNotFound('en')
      expect(wrapper.find('h1').text()).toBe('Page not found')
    })

    it('renders explanation text in English', async () => {
      const { wrapper } = await mountNotFound('en')
      expect(wrapper.text()).toContain('Unfortunately we could not find any content belonging to this URL.')
    })

    it('renders link text to homepage in English', async () => {
      const { wrapper } = await mountNotFound('en')
      expect(wrapper.text()).toContain('Find more on the')
      expect(wrapper.text()).toContain('Home')
    })

    it('renders router-link to homepage', async () => {
      const { wrapper } = await mountNotFound('en')
      const link = wrapper.find('a[href="/"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Home')
    })
  })

  describe('Semantic HTML', () => {
    it('uses <main> element', async () => {
      const { wrapper } = await mountNotFound('de')
      expect(wrapper.find('main').exists()).toBe(true)
    })

    it('has a single h1 heading', async () => {
      const { wrapper } = await mountNotFound('de')
      const headings = wrapper.findAll('h1')
      expect(headings.length).toBe(1)
    })
  })

  describe('Different routes', () => {
    it('renders for any unknown route', async () => {
      const { wrapper } = await mountNotFound('de', '/some/random/path')
      expect(wrapper.find('h1').text()).toBe('Seite nicht gefunden')
    })
  })
})
