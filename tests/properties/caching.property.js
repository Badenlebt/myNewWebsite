import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property test for categories caching (useContent composable)
 * Feature: content-sync-and-restructure, Property 5: Categories caching prevents redundant fetches
 *
 * For any number of calls N (N >= 2) to fetchCategories() within a single session,
 * the composable SHALL make exactly one network request, with subsequent calls
 * returning the cached data.
 *
 * Validates: Requirements 4.7
 */

// Sample categories data returned by the mock fetch
const MOCK_CATEGORIES = [
  { id: 'poem', de: 'Gedicht', en: 'Poem' },
  { id: 'shortstory', de: 'Kurzgeschichte', en: 'Short story' }
]

describe('Property 5: Categories caching prevents redundant fetches', () => {
  let fetchMock

  beforeEach(() => {
    // Mock global fetch to return categories data
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_CATEGORIES)
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  /**
   * Feature: content-sync-and-restructure, Property 5: Categories caching prevents redundant fetches
   * Validates: Requirements 4.7
   *
   * For any N >= 2, calling fetchCategories() N times results in exactly one fetch call.
   */
  it('fetchCategories() makes exactly one network request regardless of how many times it is called', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 10 }),
        async (n) => {
          // Reset modules to clear the module-level categoriesCache between iterations
          vi.resetModules()

          // Re-stub fetch after module reset (resetModules clears module cache but not global stubs)
          fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(MOCK_CATEGORIES)
          })
          vi.stubGlobal('fetch', fetchMock)

          // Dynamically import to get a fresh module instance with cleared cache
          const { useContent } = await import('../../src/composables/useContent.js')
          const { fetchCategories, categories } = useContent()

          // Call fetchCategories N times sequentially
          for (let i = 0; i < n; i++) {
            await fetchCategories()
          }

          // Verify: fetch was called exactly once (caching prevents redundant fetches)
          const categoriesFetchCalls = fetchMock.mock.calls.filter(
            call => call[0] && call[0].includes('categories')
          )
          expect(categoriesFetchCalls).toHaveLength(1)

          // Verify: categories ref contains the expected data after all calls
          expect(categories.value).toEqual(MOCK_CATEGORIES)
          expect(categories.value).toHaveLength(2)
          expect(categories.value[0].id).toBe('poem')
          expect(categories.value[1].id).toBe('shortstory')
        }
      ),
      { numRuns: 100 }
    )
  })
})
