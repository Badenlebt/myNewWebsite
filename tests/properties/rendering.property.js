import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { defineComponent, h, ref, nextTick } from 'vue'
import de from '../../src/locale/de.json'
import en from '../../src/locale/en.json'

/**
 * Property tests for rendering (Properties 9, 10, 11)
 * Feature: vue-website-rebuild
 * Validates: Requirements 6.7, 7.1, 7.2, 7.4
 */

// --- Generators ---

/** Generate a valid ISO date string */
const arbDate = fc.date({
  min: new Date('2018-01-01'),
  max: new Date('2025-12-31')
}).map(d => d.toISOString().split('T')[0])

/** Generate a valid slug (URL-safe string) */
const arbSlug = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
  { minLength: 3, maxLength: 20 }
)

/** Generate a non-empty plain text string (no HTML) */
const arbText = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\n'.split('')),
  { minLength: 5, maxLength: 100 }
)

/** Generate a non-empty title string */
const arbTitle = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
  { minLength: 2, maxLength: 30 }
).filter(s => s.trim().length > 0)

/** Generate a valid tag id */
const arbTagId = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
  { minLength: 2, maxLength: 12 }
)

/** Generate a BlogEntry object with valid fields */
const arbBlogEntry = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  type: fc.constantFrom('poem', 'text'),
  title: arbTitle,
  text: arbText,
  intro: arbText,
  date: arbDate,
  entryDate: arbDate,
  image: fc.constant('test-image.jpg'),
  imageRight: fc.constant('© Test'),
  tags: fc.array(arbTagId, { minLength: 0, maxLength: 3 }),
  url: arbSlug
})

/** Generate a BookEntry object with valid fields */
const arbBookEntry = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: arbTitle,
  subtitle: fc.oneof(fc.constant(''), arbTitle),
  type: fc.constantFrom('poem', 'text'),
  description: fc.constant('<p>Short description</p>'),
  descriptionLong: fc.constant('<p>Extended description content</p>'),
  quote: arbText,
  url: arbSlug,
  image: fc.constant('test-cover.jpg'),
  imageRight: fc.constant('© Test Artist'),
  hasShopLinks: fc.boolean(),
  shop: fc.oneof(
    fc.constant(null),
    fc.record({
      key: fc.string({ minLength: 1, maxLength: 20 }),
      types: fc.array(fc.constantFrom('ebook', 'print'), { minLength: 1, maxLength: 2 }),
      provider: fc.constant('bod')
    })
  )
})

/** Generate a BookEntry that always has shop data when hasShopLinks is true */
const arbBookEntryWithConsistentShop = arbBookEntry.map(entry => {
  if (entry.hasShopLinks && !entry.shop) {
    return {
      ...entry,
      shop: { key: '12345', types: ['ebook', 'print'], provider: 'bod' }
    }
  }
  return entry
})

// --- Mock useContent to inject data directly ---

let mockBlogEntries = ref([])
let mockBooks = ref([])
let mockTags = ref([])
let mockCategories = ref([])

vi.mock('../../src/composables/useContent.js', () => ({
  useContent: () => ({
    blogEntries: mockBlogEntries,
    books: mockBooks,
    tags: mockTags,
    categories: mockCategories,
    isLoading: ref(false),
    error: ref(null),
    fetchBlogEntries: vi.fn(async () => {}),
    fetchBooks: vi.fn(async () => {}),
    fetchTags: vi.fn(async () => {}),
    fetchCategories: vi.fn(async () => {}),
    getBlogBySlug: (slug) => mockBlogEntries.value.find(e => e.url === slug),
    getBookBySlug: (slug) => mockBooks.value.find(b => b.url === slug),
    getLatestEntries: (count) => mockBlogEntries.value.slice(0, count),
    getEntriesByTag: (tag) => mockBlogEntries.value.filter(e => e.tags.includes(tag)),
    getEntriesByCategory: (catId) => mockBlogEntries.value.filter(e => (e.categories || []).includes(catId)),
    getTagLabel: (tagId) => tagId,
    getCategoryLabel: (catId) => catId
  })
}))

// Mock useHead to avoid side effects
vi.mock('../../src/composables/useHead.js', () => ({
  useHead: () => ({
    setHead: vi.fn()
  })
}))

// Import components after mocks are set up
import BlogEntryPage from '../../src/pages/BlogEntryPage.vue'
import BookDetailPage from '../../src/pages/BookDetailPage.vue'

// --- Helpers ---

function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'de',
    fallbackLocale: 'de',
    messages: { de, en }
  })
}

async function mountBlogEntry(entry) {
  mockBlogEntries.value = [entry]

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/blog/:slug', component: BlogEntryPage, name: 'blog-entry' },
      { path: '/', component: defineComponent({ setup() { return () => h('div', 'home') } }) }
    ]
  })

  router.push(`/blog/${entry.url}`)
  await router.isReady()

  const wrapper = mount(BlogEntryPage, {
    global: {
      plugins: [router, createTestI18n()],
      stubs: {
        'router-link': defineComponent({
          props: ['to'],
          setup(props, { slots }) {
            return () => h('a', { href: props.to }, slots.default?.())
          }
        })
      }
    }
  })

  await nextTick()
  return wrapper
}

async function mountBookDetail(book) {
  mockBooks.value = [book]

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/books/:slug', component: BookDetailPage, name: 'book-detail' },
      { path: '/', component: defineComponent({ setup() { return () => h('div', 'home') } }) }
    ]
  })

  router.push(`/books/${book.url}`)
  await router.isReady()

  const wrapper = mount(BookDetailPage, {
    global: {
      plugins: [router, createTestI18n()],
      stubs: {
        'router-link': defineComponent({
          props: ['to'],
          setup(props, { slots }) {
            return () => h('a', { href: props.to }, slots.default?.())
          }
        })
      }
    }
  })

  await nextTick()
  return wrapper
}

// --- Test Setup ---

describe('Rendering Properties', () => {
  beforeEach(() => {
    localStorage.clear()
    mockBlogEntries.value = []
    mockBooks.value = []
    mockTags.value = []
  })

  afterEach(() => {
    localStorage.clear()
  })

  // --- Property 9: Content type determines rendering style ---
  describe('Property 9: Content type determines rendering style', () => {
    /**
     * Feature: vue-website-rebuild, Property 9: Content type determines rendering style
     * Validates: Requirements 6.7, 7.4
     *
     * For any blog entry or book entry, if type === "poem" then the text/quote SHALL be
     * rendered with centered alignment; if type === "text" then it SHALL be rendered with
     * justified alignment and paragraph indentation.
     */
    it('blog entry poem type renders with centered alignment class, text type with prose class', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbBlogEntry,
          async (entry) => {
            const wrapper = await mountBlogEntry(entry)

            const textDiv = wrapper.find('.entry-text')
            expect(textDiv.exists()).toBe(true)

            if (entry.type === 'poem') {
              expect(textDiv.classes()).toContain('poem')
              expect(textDiv.classes()).not.toContain('prose')
            } else {
              expect(textDiv.classes()).toContain('prose')
              expect(textDiv.classes()).not.toContain('poem')
            }

            wrapper.unmount()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('book detail poem type renders quote with poem class, text type with prose class', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbBookEntryWithConsistentShop,
          async (book) => {
            const wrapper = await mountBookDetail(book)

            const quoteSection = wrapper.find('.book-quote')
            expect(quoteSection.exists()).toBe(true)

            if (book.type === 'poem') {
              expect(quoteSection.classes()).toContain('poem')
              expect(quoteSection.classes()).not.toContain('prose')
            } else {
              expect(quoteSection.classes()).toContain('prose')
              expect(quoteSection.classes()).not.toContain('poem')
            }

            wrapper.unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // --- Property 10: Book detail renders all required fields ---
  describe('Property 10: Book detail renders all required fields', () => {
    /**
     * Feature: vue-website-rebuild, Property 10: Book detail renders all required fields
     * Validates: Requirements 7.1
     *
     * For any valid BookEntry object, the rendered BookDetailPage SHALL contain the book's
     * title, subtitle (if non-empty), image, descriptionLong content, and quote text.
     */
    it('BookDetailPage renders title, subtitle (if non-empty), image, descriptionLong, and quote', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbBookEntryWithConsistentShop,
          async (book) => {
            const wrapper = await mountBookDetail(book)

            const html = wrapper.html()

            // Title must be rendered
            expect(html).toContain(book.title)

            // Subtitle rendered only if non-empty
            if (book.subtitle && book.subtitle.trim().length > 0) {
              expect(wrapper.find('.book-subtitle').exists()).toBe(true)
              // DOM text content may trim whitespace, so compare trimmed values
              expect(wrapper.find('.book-subtitle').text().trim()).toContain(book.subtitle.trim())
            } else {
              expect(wrapper.find('.book-subtitle').exists()).toBe(false)
            }

            // Image must be rendered with correct src
            const img = wrapper.find('.book-cover img')
            expect(img.exists()).toBe(true)
            expect(img.attributes('src')).toContain(book.image)

            // descriptionLong must be rendered
            const description = wrapper.find('.book-description')
            expect(description.exists()).toBe(true)
            expect(description.html()).toContain(book.descriptionLong)

            // Quote must be rendered
            const quote = wrapper.find('.book-quote blockquote')
            expect(quote.exists()).toBe(true)

            wrapper.unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // --- Property 11: Shop links visibility matches hasShopLinks ---
  describe('Property 11: Shop links visibility matches hasShopLinks', () => {
    /**
     * Feature: vue-website-rebuild, Property 11: Shop links visibility matches hasShopLinks
     * Validates: Requirements 7.2
     *
     * For any BookEntry, the shop links section SHALL be visible if and only if
     * entry.hasShopLinks === true.
     */
    it('shop links section visible iff hasShopLinks is true', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbBookEntryWithConsistentShop,
          async (book) => {
            const wrapper = await mountBookDetail(book)

            const shopSection = wrapper.find('.book-shop')

            if (book.hasShopLinks && book.shop) {
              expect(shopSection.exists()).toBe(true)
            } else {
              expect(shopSection.exists()).toBe(false)
            }

            wrapper.unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
