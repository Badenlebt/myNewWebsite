/**
 * Unit tests for BlogEntryPage component.
 * Verifies categories and tags display separately with correct labels.
 *
 * Validates: Requirements 7.1, 7.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { ref } from 'vue'

const mockCurrentLanguage = ref('de')
const mockSetHead = vi.fn()
const mockFetchBlogEntries = vi.fn().mockResolvedValue(undefined)
const mockFetchTags = vi.fn().mockResolvedValue(undefined)
const mockFetchCategories = vi.fn().mockResolvedValue(undefined)

const mockBlogEntries = ref([
  {
    id: 'spring',
    type: 'poem',
    title: 'Frühlingsgedicht',
    text: 'Ein Gedicht über den Frühling',
    intro: 'Frühling kommt',
    date: '2020-03-28',
    entryDate: '2021-04-13',
    image: 'Fruehling.jpg',
    tags: ['german', 'hommage'],
    categories: ['poem'],
    url: 'fruehlingsgedicht'
  }
])

const mockTags = ref([
  { id: 'german', de: 'Deutsch', en: 'German' },
  { id: 'english', de: 'Englisch', en: 'English' },
  { id: 'hommage', de: 'Hommage', en: 'Hommage' }
])

const mockCategories = ref([
  { id: 'poem', de: 'Gedicht', en: 'Poem' },
  { id: 'shortstory', de: 'Kurzgeschichte', en: 'Short story' }
])

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: mockCurrentLanguage,
    switchLanguage: vi.fn()
  })
}))

vi.mock('@/composables/useContent', () => ({
  useContent: () => ({
    blogEntries: mockBlogEntries,
    books: ref([]),
    tags: mockTags,
    categories: mockCategories,
    isLoading: ref(false),
    error: ref(null),
    fetchBlogEntries: mockFetchBlogEntries,
    fetchBooks: vi.fn(),
    fetchTags: mockFetchTags,
    fetchCategories: mockFetchCategories,
    getBlogBySlug: (slug) => mockBlogEntries.value.find(e => e.url === slug),
    getBookBySlug: vi.fn(),
    getLatestEntries: vi.fn().mockReturnValue([]),
    getEntriesByTag: vi.fn().mockReturnValue([]),
    getEntriesByCategory: vi.fn().mockReturnValue([]),
    getTagLabel: (tagId, lang) => {
      const tag = mockTags.value.find(t => t.id === tagId)
      if (!tag) return tagId
      return tag[lang] || tag.de || tagId
    },
    getCategoryLabel: (categoryId, lang) => {
      const cat = mockCategories.value.find(c => c.id === categoryId)
      if (!cat) return categoryId
      return cat[lang] || cat.de || categoryId
    }
  })
}))

vi.mock('@/composables/useHead', () => ({
  useHead: () => ({ setHead: mockSetHead })
}))

import BlogEntryPage from '@/pages/BlogEntryPage.vue'

const messages = {
  de: {
    global: { title: 'Michael Hitzelberger' },
    blog: {
      title: 'Blog',
      categories: 'Kategorien',
      tags: 'Schlagwörter',
      notFound: 'Nicht gefunden',
      notFoundText: 'Der Eintrag wurde nicht gefunden.',
      lookHere: 'Schau hier:'
    }
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
      { path: '/blog/:slug', component: BlogEntryPage }
    ]
  })
}

async function mountBlogEntry(slug = 'fruehlingsgedicht') {
  const router = createTestRouter()
  await router.push(`/blog/${slug}`)
  await router.isReady()

  const i18n = createTestI18n('de')

  const wrapper = mount(BlogEntryPage, {
    global: {
      plugins: [router, i18n]
    }
  })
  await flushPromises()
  return { wrapper, router }
}

describe('BlogEntryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentLanguage.value = 'de'
  })

  describe('Categories section', () => {
    it('renders categories section with label "Kategorien"', async () => {
      const { wrapper } = await mountBlogEntry()
      const metaLabels = wrapper.findAll('.meta-label')
      const categoriesLabel = metaLabels.find(l => l.text() === 'Kategorien')
      expect(categoriesLabel).toBeDefined()
    })

    it('renders category badges for the entry', async () => {
      const { wrapper } = await mountBlogEntry()
      const metaSections = wrapper.findAll('.meta-section')
      // First meta-section is categories
      const categoriesSection = metaSections[0]
      const badges = categoriesSection.findAll('.tag-badge')
      expect(badges.length).toBe(1)
      expect(badges[0].text()).toBe('Gedicht')
    })

    it('category links point to /blog?category={id}', async () => {
      const { wrapper } = await mountBlogEntry()
      const metaSections = wrapper.findAll('.meta-section')
      const categoriesSection = metaSections[0]
      const badges = categoriesSection.findAll('.tag-badge')
      expect(badges[0].attributes('href')).toBe('/blog?category=poem')
    })
  })

  describe('Tags section', () => {
    it('renders tags section with label "Schlagwörter"', async () => {
      const { wrapper } = await mountBlogEntry()
      const metaLabels = wrapper.findAll('.meta-label')
      const tagsLabel = metaLabels.find(l => l.text() === 'Schlagwörter')
      expect(tagsLabel).toBeDefined()
    })

    it('renders tag badges for the entry', async () => {
      const { wrapper } = await mountBlogEntry()
      const metaSections = wrapper.findAll('.meta-section')
      // Second meta-section is tags
      const tagsSection = metaSections[1]
      const badges = tagsSection.findAll('.tag-badge')
      expect(badges.length).toBe(2)
      expect(badges[0].text()).toBe('Deutsch')
      expect(badges[1].text()).toBe('Hommage')
    })

    it('tag links point to /blog?tag={id}', async () => {
      const { wrapper } = await mountBlogEntry()
      const metaSections = wrapper.findAll('.meta-section')
      const tagsSection = metaSections[1]
      const badges = tagsSection.findAll('.tag-badge')
      expect(badges[0].attributes('href')).toBe('/blog?tag=german')
      expect(badges[1].attributes('href')).toBe('/blog?tag=hommage')
    })
  })

  describe('Entry content', () => {
    it('renders the entry title', async () => {
      const { wrapper } = await mountBlogEntry()
      expect(wrapper.find('h1').text()).toBe('Frühlingsgedicht')
    })

    it('renders the entry date', async () => {
      const { wrapper } = await mountBlogEntry()
      const time = wrapper.find('time')
      expect(time.exists()).toBe(true)
      expect(time.attributes('datetime')).toBe('2020-03-28')
    })

    it('renders the entry text', async () => {
      const { wrapper } = await mountBlogEntry()
      expect(wrapper.text()).toContain('Ein Gedicht über den Frühling')
    })
  })
})
