/**
 * Integration tests for content loading via useContent composable.
 * Tests successful loading, caching behavior, and error handling.
 *
 * Validates: Requirements 4.2, 4.4, 4.5
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Sample test data
const mockBlogEntries = [
  {
    id: 'entry-1',
    type: 'poem',
    title: 'First Entry',
    text: 'Some text',
    intro: 'Intro text',
    date: '2021-01-01',
    entryDate: '2021-06-15',
    image: 'image1.jpg',
    imageRight: '© Author',
    tags: ['poem'],
    url: 'first-entry'
  },
  {
    id: 'entry-2',
    type: 'text',
    title: 'Second Entry',
    text: 'More text',
    intro: 'Another intro',
    date: '2022-03-10',
    entryDate: '2022-04-01',
    image: 'image2.jpg',
    imageRight: '© Author 2',
    tags: ['shortstory'],
    url: 'second-entry'
  }
]

const mockBooks = [
  {
    id: 'book-1',
    title: 'Test Book',
    subtitle: 'A subtitle',
    type: 'poem',
    description: '<p>Short desc</p>',
    descriptionLong: '<p>Long desc</p>',
    quote: 'A quote',
    url: 'test-book',
    image: 'book1.jpg',
    imageRight: '© Publisher',
    hasShopLinks: true,
    shop: { key: '123', types: ['ebook'], provider: 'bod' }
  }
]

const mockTags = [
  { id: 'poem', de: 'Gedichte', en: 'Poems' },
  { id: 'shortstory', de: 'Kurzgeschichte', en: 'Short story' }
]

describe('Content Loading Integration', () => {
  let useContent

  beforeEach(async () => {
    // Reset modules to clear module-level cache between tests
    vi.resetModules()

    // Set up fresh fetch mock before each test
    globalThis.fetch = vi.fn()

    // Dynamically import to get a fresh module instance (clears cache)
    const mod = await import('../../src/composables/useContent.js')
    useContent = mod.useContent
  })

  describe('Successful loading (Requirement 4.2)', () => {
    it('fetchBlogEntries populates blogEntries ref with fetched data', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([...mockBlogEntries])
      })

      const { blogEntries, fetchBlogEntries, error } = useContent()
      await fetchBlogEntries()

      expect(error.value).toBeNull()
      expect(blogEntries.value).toHaveLength(2)
      // Should be sorted by entryDate descending
      expect(blogEntries.value[0].id).toBe('entry-2')
      expect(blogEntries.value[1].id).toBe('entry-1')
    })

    it('fetchBooks populates books ref with fetched data', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([...mockBooks])
      })

      const { books, fetchBooks, error } = useContent()
      await fetchBooks()

      expect(error.value).toBeNull()
      expect(books.value).toHaveLength(1)
      expect(books.value[0].title).toBe('Test Book')
    })

    it('fetchTags populates tags ref with fetched data', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([...mockTags])
      })

      const { tags, fetchTags, error } = useContent()
      await fetchTags()

      expect(error.value).toBeNull()
      expect(tags.value).toHaveLength(2)
      expect(tags.value[0].id).toBe('poem')
    })

    it('fetches from correct URLs', async () => {
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      })

      const { fetchBlogEntries, fetchBooks, fetchTags } = useContent()

      await fetchBlogEntries()
      expect(globalThis.fetch).toHaveBeenCalledWith('/content/blog-entries.json')

      await fetchBooks()
      expect(globalThis.fetch).toHaveBeenCalledWith('/content/books.json')

      await fetchTags()
      expect(globalThis.fetch).toHaveBeenCalledWith('/content/tags.json')
    })

    it('sets isLoading to false after successful fetch', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([...mockBlogEntries])
      })

      const { isLoading, fetchBlogEntries } = useContent()
      await fetchBlogEntries()

      expect(isLoading.value).toBe(false)
    })
  })

  describe('Caching behavior (Requirement 4.4)', () => {
    it('fetchBlogEntries only makes one network request on repeated calls', async () => {
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([...mockBlogEntries])
      })

      const { fetchBlogEntries, blogEntries } = useContent()

      await fetchBlogEntries()
      await fetchBlogEntries()
      await fetchBlogEntries()

      // Only one fetch call despite three invocations
      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
      expect(blogEntries.value).toHaveLength(2)
    })

    it('fetchBooks only makes one network request on repeated calls', async () => {
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([...mockBooks])
      })

      const { fetchBooks, books } = useContent()

      await fetchBooks()
      await fetchBooks()

      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
      expect(books.value).toHaveLength(1)
    })

    it('fetchTags only makes one network request on repeated calls', async () => {
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([...mockTags])
      })

      const { fetchTags, tags } = useContent()

      await fetchTags()
      await fetchTags()

      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
      expect(tags.value).toHaveLength(2)
    })

    it('cached data is returned immediately without network delay', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([...mockBlogEntries])
      })

      const { fetchBlogEntries, blogEntries } = useContent()

      // First call fetches from network
      await fetchBlogEntries()
      expect(blogEntries.value).toHaveLength(2)

      // Second call should return cached data (no new fetch mock needed)
      await fetchBlogEntries()
      expect(blogEntries.value).toHaveLength(2)
    })
  })

  describe('Error handling (Requirement 4.5)', () => {
    it('sets error ref on network failure without crashing', async () => {
      globalThis.fetch.mockRejectedValueOnce(new Error('Network error'))

      const { fetchBlogEntries, error, blogEntries } = useContent()
      await fetchBlogEntries()

      expect(error.value).toBe('Content could not be loaded.')
      expect(blogEntries.value).toEqual([])
    })

    it('sets error ref on HTTP 404 response', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const { fetchBooks, error, books } = useContent()
      await fetchBooks()

      expect(error.value).toBe('Content could not be loaded.')
      expect(books.value).toEqual([])
    })

    it('sets error ref on HTTP 500 response', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const { fetchTags, error, tags } = useContent()
      await fetchTags()

      expect(error.value).toBe('Content could not be loaded.')
      expect(tags.value).toEqual([])
    })

    it('sets isLoading to false after error', async () => {
      globalThis.fetch.mockRejectedValueOnce(new Error('Network error'))

      const { fetchBlogEntries, isLoading } = useContent()
      await fetchBlogEntries()

      expect(isLoading.value).toBe(false)
    })

    it('does not throw when fetch fails', async () => {
      globalThis.fetch.mockRejectedValueOnce(new Error('Network error'))

      const { fetchBlogEntries } = useContent()

      // Should not throw
      await expect(fetchBlogEntries()).resolves.toBeUndefined()
    })
  })
})
