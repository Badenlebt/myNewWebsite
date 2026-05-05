import { ref } from 'vue'

// Module-level cache — shared across all component instances
let blogCache = null
let booksCache = null
let tagsCache = null
let categoriesCache = null

const blogEntries = ref([])
const books = ref([])
const tags = ref([])
const categories = ref([])
const isLoading = ref(false)
const error = ref(null)

async function fetchJSON(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return response.json()
}

async function fetchBlogEntries() {
  if (blogCache) {
    blogEntries.value = blogCache
    return
  }
  isLoading.value = true
  error.value = null
  try {
    const data = await fetchJSON('/content/blog-entries.json')
    // Sort by entryDate descending
    data.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
    blogCache = data
    blogEntries.value = data
  } catch (e) {
    error.value = 'Content could not be loaded.'
    console.warn('useContent: failed to fetch blog entries', e)
  } finally {
    isLoading.value = false
  }
}

async function fetchBooks() {
  if (booksCache) {
    books.value = booksCache
    return
  }
  isLoading.value = true
  error.value = null
  try {
    const data = await fetchJSON('/content/books.json')
    booksCache = data
    books.value = data
  } catch (e) {
    error.value = 'Content could not be loaded.'
    console.warn('useContent: failed to fetch books', e)
  } finally {
    isLoading.value = false
  }
}

async function fetchTags() {
  if (tagsCache) {
    tags.value = tagsCache
    return
  }
  isLoading.value = true
  error.value = null
  try {
    const data = await fetchJSON('/content/tags.json')
    tagsCache = data
    tags.value = data
  } catch (e) {
    error.value = 'Content could not be loaded.'
    console.warn('useContent: failed to fetch tags', e)
  } finally {
    isLoading.value = false
  }
}

async function fetchCategories() {
  if (categoriesCache) {
    categories.value = categoriesCache
    return
  }
  isLoading.value = true
  error.value = null
  try {
    const data = await fetchJSON('/content/categories.json')
    categoriesCache = data
    categories.value = data
  } catch (e) {
    error.value = 'Content could not be loaded.'
    console.warn('useContent: failed to fetch categories', e)
  } finally {
    isLoading.value = false
  }
}

function getBlogBySlug(slug) {
  return blogEntries.value.find(entry => entry.url === slug)
}

function getBookBySlug(slug) {
  return books.value.find(book => book.url === slug)
}

function getLatestEntries(count) {
  // blogEntries is already sorted by entryDate descending
  return blogEntries.value.slice(0, count)
}

function getEntriesByTag(tag) {
  return blogEntries.value.filter(entry => entry.tags.includes(tag))
}

function getEntriesByCategory(categoryId) {
  return blogEntries.value.filter(entry => (entry.categories || []).includes(categoryId))
}

function getTagLabel(tagId, lang) {
  const tagObj = tags.value.find(t => t.id === tagId)
  if (!tagObj) return tagId
  return tagObj[lang] || tagObj.de || tagId
}

function getCategoryLabel(categoryId, lang) {
  const cat = categories.value.find(c => c.id === categoryId)
  if (!cat) return categoryId
  return cat[lang] || cat.de || categoryId
}

export function useContent() {
  return {
    blogEntries,
    books,
    tags,
    categories,
    isLoading,
    error,
    fetchBlogEntries,
    fetchBooks,
    fetchTags,
    fetchCategories,
    getBlogBySlug,
    getBookBySlug,
    getLatestEntries,
    getEntriesByTag,
    getEntriesByCategory,
    getTagLabel,
    getCategoryLabel
  }
}
