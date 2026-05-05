/**
 * Unit tests for BlogCard component.
 * Verifies props rendering and router-link navigation.
 *
 * Validates: Requirements 6.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { ref } from 'vue'

const mockCurrentLanguage = ref('de')

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: mockCurrentLanguage,
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
    getTagLabel: (tagId, lang) => {
      const labels = {
        poem: { de: 'Gedichte', en: 'Poems' },
        german: { de: 'Deutsch', en: 'German' }
      }
      return labels[tagId]?.[lang] || tagId
    }
  })
}))

vi.mock('@/composables/useHead', () => ({
  useHead: () => ({ setHead: vi.fn() })
}))

import BlogCard from '@/components/BlogCard.vue'

const messages = {
  de: {
    blog: { moreLink: 'Weiterlesen', tags: 'Tags' },
    links: { startUrl: '/', blogUrl: '/blog' }
  },
  en: {
    blog: { moreLink: 'Read more', tags: 'Tags' },
    links: { startUrl: '/', blogUrl: '/blog' }
  }
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

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/blog', component: { template: '<div>Blog</div>' } },
      { path: '/blog/:slug', component: { template: '<div>Entry</div>' } }
    ]
  })
}

const sampleEntry = {
  id: 'spring',
  type: 'poem',
  title: 'Frühlingsgedicht',
  text: 'Full poem text',
  intro: 'A beautiful spring poem about nature and renewal.',
  date: '2020-03-28',
  entryDate: '2021-04-13',
  image: 'Fruehling.jpg',
  imageRight: '© Photographer',
  tags: ['poem', 'german'],
  url: 'fruehlingsgedicht'
}

async function mountBlogCard(entry = sampleEntry, options = {}) {
  const router = createTestRouter()
  await router.push('/')
  await router.isReady()

  const i18n = createTestI18n(options.locale || 'de')

  const wrapper = mount(BlogCard, {
    props: { entry },
    global: {
      plugins: [router, i18n]
    }
  })
  await flushPromises()
  return { wrapper, router }
}

describe('BlogCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentLanguage.value = 'de'
  })

  describe('Props rendering', () => {
    it('renders entry title', async () => {
      const { wrapper } = await mountBlogCard()
      expect(wrapper.find('.blog-card__title').text()).toBe('Frühlingsgedicht')
    })

    it('renders entry intro text', async () => {
      const { wrapper } = await mountBlogCard()
      expect(wrapper.find('.blog-card__intro').text()).toBe(
        'A beautiful spring poem about nature and renewal.'
      )
    })

    it('renders entry image with correct src', async () => {
      const { wrapper } = await mountBlogCard()
      const img = wrapper.find('.blog-card__image img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/images/blog/Fruehling.jpg')
    })

    it('renders entry image with alt text', async () => {
      const { wrapper } = await mountBlogCard()
      const img = wrapper.find('.blog-card__image img')
      expect(img.attributes('alt')).toBe('Frühlingsgedicht')
    })

    it('renders formatted date', async () => {
      const { wrapper } = await mountBlogCard()
      const dateEl = wrapper.find('.blog-card__date')
      expect(dateEl.exists()).toBe(true)
      // Date should be formatted (German locale)
      expect(dateEl.text()).toContain('2020')
    })

    it('renders date with datetime attribute', async () => {
      const { wrapper } = await mountBlogCard()
      const dateEl = wrapper.find('.blog-card__date')
      expect(dateEl.attributes('datetime')).toBe('2020-03-28')
    })

    it('renders tag badges', async () => {
      const { wrapper } = await mountBlogCard()
      const tags = wrapper.findAll('.blog-card__tag-badge')
      expect(tags.length).toBe(2)
      expect(tags[0].text()).toBe('Gedichte')
      expect(tags[1].text()).toBe('Deutsch')
    })

    it('renders "read more" text', async () => {
      const { wrapper } = await mountBlogCard()
      expect(wrapper.find('.blog-card__more').text()).toBe('Weiterlesen')
    })
  })

  describe('Router-link', () => {
    it('wraps card in router-link to /blog/:slug', async () => {
      const { wrapper } = await mountBlogCard()
      const link = wrapper.find('a.blog-card')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/blog/fruehlingsgedicht')
    })

    it('tag badges link to /blog?tag=:tagId', async () => {
      const { wrapper } = await mountBlogCard()
      const tagLinks = wrapper.findAll('.blog-card__tag-badge')
      expect(tagLinks[0].attributes('href')).toBe('/blog?tag=poem')
      expect(tagLinks[1].attributes('href')).toBe('/blog?tag=german')
    })
  })

  describe('Different entries', () => {
    it('renders a different entry correctly', async () => {
      const entry = {
        ...sampleEntry,
        id: 'ocean',
        title: 'Ocean Waves',
        intro: 'A poem about the sea.',
        image: 'Ocean.jpg',
        tags: ['poem', 'english'],
        url: 'ocean-waves',
        date: '2022-06-15'
      }
      const { wrapper } = await mountBlogCard(entry)
      expect(wrapper.find('.blog-card__title').text()).toBe('Ocean Waves')
      expect(wrapper.find('.blog-card__intro').text()).toBe('A poem about the sea.')
      expect(wrapper.find('.blog-card__image img').attributes('src')).toBe('/images/blog/Ocean.jpg')
      expect(wrapper.find('a.blog-card').attributes('href')).toBe('/blog/ocean-waves')
    })
  })
})
