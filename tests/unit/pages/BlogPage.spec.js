/**
 * Unit tests for BlogPage component.
 * Verifies category filter buttons, combined filtering with query params.
 *
 * Validates: Requirements 6.1, 6.3
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
    text: 'Ein Gedicht',
    intro: 'Frühling kommt',
    date: '2020-03-28',
    entryDate: '2021-04-13',
    image: 'Fruehling.jpg',
    tags: ['german'],
    categories: ['poem'],
    url: 'fruehlingsgedicht'
  },
  {
    id: 'ocean',
    type: 'poem',
    title: 'Ocean',
    text: 'The ocean',
    intro: 'A poem about the ocean',
    date: '2020-05-01',
    entryDate: '2021-05-01',
    image: 'Ocean.jpg',
    tags: ['english'],
    categories: ['poem'],
    url: 'ocean'
  },
  {
    id: 'reise',
    type: 'text',
    title: 'Die Reise',
    text: 'Eine Geschichte',
    intro: 'Eine kurze Reise',
    date: '2021-01-15',
    entryDate: '2021-06-01',
    image: 'Reise.jpg',
    tags: ['german'],
    categories: ['shortstory'],
    url: 'die-reise'
  }
])

const mockTags = ref([
  { id: 'german', de: 'Deutsch', en: 'German' },
  { id: 'english', de: 'Englisch', en: 'English' }
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
    getBlogBySlug: vi.fn(),
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

// Stub BlogCard to simplify rendering
vi.mock('@/components/BlogCard.vue', () => ({
  default: {
    name: 'BlogCard',
    props: ['entry'],
    template: '<div class="blog-card-stub" :data-id="entry.id">{{ entry.title }}</div>'
  }
}))

import BlogPage from '@/pages/BlogPage.vue'

const messages = {
  de: {
    global: { title: 'Michael Hitzelberger' },
    blog: {
      title: 'Blog',
      count: 'Einträge',
      categories: 'Kategorien',
      tags: 'Schlagwörter',
      categoryChosen: 'in der Kategorie',
      tagChosen: 'mit dem Schlagwort',
      moreLink: 'Weiterlesen'
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

function createTestRouter(initialRoute = '/blog') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/blog', component: BlogPage },
      { path: '/blog/:slug', component: { template: '<div>Entry</div>' } }
    ]
  })
  return router
}

async function mountBlogPage(query = {}) {
  const router = createTestRouter()
  const queryStr = Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')
  const path = queryStr ? `/blog?${queryStr}` : '/blog'
  await router.push(path)
  await router.isReady()

  const i18n = createTestI18n('de')

  const wrapper = mount(BlogPage, {
    global: {
      plugins: [router, i18n]
    }
  })
  await flushPromises()
  return { wrapper, router }
}

describe('BlogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentLanguage.value = 'de'
  })

  describe('Category filter buttons', () => {
    it('renders one button per category', async () => {
      const { wrapper } = await mountBlogPage()
      const categoryButtons = wrapper.findAll('.category-button')
      expect(categoryButtons.length).toBe(2)
    })

    it('renders category labels in German', async () => {
      const { wrapper } = await mountBlogPage()
      const categoryButtons = wrapper.findAll('.category-button')
      const labels = categoryButtons.map(b => b.text())
      expect(labels).toContain('Gedicht')
      expect(labels).toContain('Kurzgeschichte')
    })

    it('marks active category button when query param is set', async () => {
      const { wrapper } = await mountBlogPage({ category: 'poem' })
      const categoryButtons = wrapper.findAll('.category-button')
      const activeBtn = categoryButtons.find(b => b.classes().includes('active'))
      expect(activeBtn).toBeDefined()
      expect(activeBtn.text()).toBe('Gedicht')
    })
  })

  describe('Combined filtering', () => {
    it('shows only entries matching both category and tag when both are set', async () => {
      const { wrapper } = await mountBlogPage({ category: 'poem', tag: 'german' })
      const cards = wrapper.findAll('.blog-card-stub')
      // Only "Frühlingsgedicht" matches category=poem AND tag=german
      expect(cards.length).toBe(1)
      expect(cards[0].text()).toContain('Frühlingsgedicht')
    })

    it('shows entries matching only category when only category is set', async () => {
      const { wrapper } = await mountBlogPage({ category: 'poem' })
      const cards = wrapper.findAll('.blog-card-stub')
      // "Frühlingsgedicht" and "Ocean" match category=poem
      expect(cards.length).toBe(2)
    })

    it('shows entries matching only tag when only tag is set', async () => {
      const { wrapper } = await mountBlogPage({ tag: 'german' })
      const cards = wrapper.findAll('.blog-card-stub')
      // "Frühlingsgedicht" and "Die Reise" match tag=german
      expect(cards.length).toBe(2)
    })

    it('shows all entries when no filters are active', async () => {
      const { wrapper } = await mountBlogPage()
      const cards = wrapper.findAll('.blog-card-stub')
      expect(cards.length).toBe(3)
    })
  })

  describe('Active filter badges', () => {
    it('displays category filter badge when category is active', async () => {
      const { wrapper } = await mountBlogPage({ category: 'poem' })
      const badges = wrapper.findAll('.filter-badge')
      const categoryBadge = badges.find(b => b.text().includes('Kategorien'))
      expect(categoryBadge).toBeDefined()
      expect(categoryBadge.text()).toContain('Gedicht')
    })

    it('displays tag filter badge when tag is active', async () => {
      const { wrapper } = await mountBlogPage({ tag: 'german' })
      const badges = wrapper.findAll('.filter-badge')
      const tagBadge = badges.find(b => b.text().includes('Schlagwörter'))
      expect(tagBadge).toBeDefined()
      expect(tagBadge.text()).toContain('Deutsch')
    })

    it('does not display filter badges when no filters are active', async () => {
      const { wrapper } = await mountBlogPage()
      const activeFilters = wrapper.find('.active-filters')
      expect(activeFilters.exists()).toBe(false)
    })

    it('displays both badges when both filters are active', async () => {
      const { wrapper } = await mountBlogPage({ category: 'poem', tag: 'german' })
      const badges = wrapper.findAll('.filter-badge')
      expect(badges.length).toBe(2)
    })
  })
})
