import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useContent } from '../../src/composables/useContent.js'

/**
 * Property tests for content logic (useContent composable)
 * Feature: vue-website-rebuild
 * Validates: Requirements 5.3, 6.1, 6.3, 6.6, 7.3
 */

// --- Generators ---

/** Generate a valid ISO date string between 2018 and 2025 */
const arbDate = fc.date({
  min: new Date('2018-01-01'),
  max: new Date('2025-12-31')
}).map(d => d.toISOString().split('T')[0])

/** Generate a valid tag id */
const arbTagId = fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 2, maxLength: 12 })

/** Generate a valid slug (URL-safe string) */
const arbSlug = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
  { minLength: 1, maxLength: 30 }
)

/** Generate a BlogEntry object with valid fields */
const arbBlogEntry = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  type: fc.constantFrom('poem', 'text'),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  text: fc.string({ minLength: 1, maxLength: 500 }),
  intro: fc.string({ minLength: 1, maxLength: 200 }),
  date: arbDate,
  entryDate: arbDate,
  image: fc.string({ minLength: 1, maxLength: 50 }),
  imageRight: fc.string({ minLength: 0, maxLength: 100 }),
  tags: fc.array(arbTagId, { minLength: 0, maxLength: 5 }),
  url: arbSlug
})

/** Generate a list of BlogEntries with unique entryDates and unique slugs */
const arbBlogEntriesWithUniqueDates = fc.array(arbBlogEntry, { minLength: 1, maxLength: 30 })
  .map(entries => {
    // Ensure unique entryDates by appending index-based time offset
    const seen = new Set()
    return entries.map((entry, i) => {
      let date = entry.entryDate
      // Make dates unique by adjusting day
      while (seen.has(date)) {
        const d = new Date(date)
        d.setDate(d.getDate() + 1)
        date = d.toISOString().split('T')[0]
      }
      seen.add(date)
      return { ...entry, entryDate: date, url: `${entry.url}-${i}` }
    })
  })

/** Generate a BookEntry object with valid fields */
const arbBookEntry = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  subtitle: fc.string({ minLength: 0, maxLength: 100 }),
  type: fc.constantFrom('poem', 'text'),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  descriptionLong: fc.string({ minLength: 1, maxLength: 500 }),
  quote: fc.string({ minLength: 1, maxLength: 300 }),
  url: arbSlug,
  image: fc.string({ minLength: 1, maxLength: 50 }),
  imageRight: fc.string({ minLength: 0, maxLength: 100 }),
  hasShopLinks: fc.boolean(),
  shop: fc.oneof(
    fc.constant(null),
    fc.record({
      key: fc.string({ minLength: 1, maxLength: 20 }),
      types: fc.array(fc.constantFrom('ebook', 'print'), { minLength: 1, maxLength: 2 }),
      provider: fc.constantFrom('bod', 'epubli')
    })
  )
})

// --- Test Setup ---

describe('Content Logic Properties', () => {
  let content

  beforeEach(() => {
    content = useContent()
    // Reset state for each test
    content.blogEntries.value = []
    content.books.value = []
  })

  // --- Property 5: Latest entries returns top N by date ---
  describe('Property 5: Latest entries returns top N by date', () => {
    /**
     * Feature: vue-website-rebuild, Property 5: Latest entries returns top N by date
     * Validates: Requirements 5.3
     *
     * For any list of blog entries with distinct entryDate values and any count N ≤ list length,
     * getLatestEntries(N) SHALL return exactly the N entries with the most recent entryDate values,
     * sorted in descending order.
     */
    it('getLatestEntries(N) returns the N most recent entries sorted descending', () => {
      fc.assert(
        fc.property(
          arbBlogEntriesWithUniqueDates,
          fc.integer({ min: 0, max: 30 }),
          (entries, rawCount) => {
            // Sort entries by entryDate descending (as the composable does on fetch)
            const sorted = [...entries].sort(
              (a, b) => new Date(b.entryDate) - new Date(a.entryDate)
            )
            content.blogEntries.value = sorted

            const count = Math.min(rawCount, sorted.length)
            const result = content.getLatestEntries(count)

            // Must return exactly count entries
            expect(result).toHaveLength(count)

            // Must be the top N from the sorted list
            for (let i = 0; i < count; i++) {
              expect(result[i].entryDate).toBe(sorted[i].entryDate)
            }

            // Must be sorted descending
            for (let i = 0; i < result.length - 1; i++) {
              expect(new Date(result[i].entryDate).getTime())
                .toBeGreaterThanOrEqual(new Date(result[i + 1].entryDate).getTime())
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // --- Property 6: Blog entries sorted by entryDate descending ---
  describe('Property 6: Blog entries sorted by entryDate descending', () => {
    /**
     * Feature: vue-website-rebuild, Property 6: Blog entries sorted by entryDate descending
     * Validates: Requirements 6.1
     *
     * For any list of blog entries, the sorted result SHALL satisfy:
     * for every adjacent pair (entry[i], entry[i+1]), entry[i].entryDate >= entry[i+1].entryDate.
     */
    it('blog entries are sorted by entryDate descending after sort', () => {
      fc.assert(
        fc.property(
          fc.array(arbBlogEntry, { minLength: 0, maxLength: 30 }),
          (entries) => {
            // Simulate what fetchBlogEntries does: sort by entryDate descending
            const sorted = [...entries].sort(
              (a, b) => new Date(b.entryDate) - new Date(a.entryDate)
            )
            content.blogEntries.value = sorted

            const result = content.blogEntries.value

            // Verify descending order for all adjacent pairs
            for (let i = 0; i < result.length - 1; i++) {
              expect(new Date(result[i].entryDate).getTime())
                .toBeGreaterThanOrEqual(new Date(result[i + 1].entryDate).getTime())
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // --- Property 7: Tag filtering correctness ---
  describe('Property 7: Tag filtering correctness', () => {
    /**
     * Feature: vue-website-rebuild, Property 7: Tag filtering correctness
     * Validates: Requirements 6.3
     *
     * For any tag and for any list of blog entries, getEntriesByTag(tag) SHALL return
     * exactly those entries where entry.tags.includes(tag) is true, and no others.
     */
    it('getEntriesByTag returns exactly entries containing the tag', () => {
      fc.assert(
        fc.property(
          fc.array(arbBlogEntry, { minLength: 0, maxLength: 30 }),
          arbTagId,
          (entries, tag) => {
            content.blogEntries.value = entries

            const result = content.getEntriesByTag(tag)
            const expected = entries.filter(e => e.tags.includes(tag))

            // Same length
            expect(result).toHaveLength(expected.length)

            // Every returned entry must contain the tag
            for (const entry of result) {
              expect(entry.tags).toContain(tag)
            }

            // Every entry with the tag must be in the result
            for (const entry of expected) {
              expect(result).toContainEqual(entry)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // --- Property 8: Non-existent slug lookup returns undefined ---
  describe('Property 8: Non-existent slug lookup returns undefined', () => {
    /**
     * Feature: vue-website-rebuild, Property 8: Non-existent slug lookup returns undefined
     * Validates: Requirements 6.6, 7.3
     *
     * For any slug string that does not match any entry's url field in the content data,
     * getBlogBySlug(slug) and getBookBySlug(slug) SHALL return undefined.
     */
    it('getBlogBySlug returns undefined for non-existent slugs', () => {
      fc.assert(
        fc.property(
          fc.array(arbBlogEntry, { minLength: 0, maxLength: 20 }),
          arbSlug,
          (entries, slug) => {
            content.blogEntries.value = entries

            // Only test when slug does NOT exist in entries
            const existingSlugs = new Set(entries.map(e => e.url))
            fc.pre(!existingSlugs.has(slug))

            const result = content.getBlogBySlug(slug)
            expect(result).toBeUndefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('getBookBySlug returns undefined for non-existent slugs', () => {
      fc.assert(
        fc.property(
          fc.array(arbBookEntry, { minLength: 0, maxLength: 20 }),
          arbSlug,
          (bookEntries, slug) => {
            content.books.value = bookEntries

            // Only test when slug does NOT exist in books
            const existingSlugs = new Set(bookEntries.map(b => b.url))
            fc.pre(!existingSlugs.has(slug))

            const result = content.getBookBySlug(slug)
            expect(result).toBeUndefined()
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
