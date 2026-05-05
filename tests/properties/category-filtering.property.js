import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useContent } from '../../src/composables/useContent.js'

/**
 * Property tests for category filtering (useContent composable)
 * Feature: content-sync-and-restructure
 * Properties 3 & 4
 * Validates: Requirements 6.1, 6.3, 6.5
 */

// --- Valid domain values ---

const VALID_CATEGORIES = ['poem', 'shortstory']
const VALID_TAGS = ['german', 'english', 'limerick', 'hommage', 'antologie', 'kurzgeschichtentriell', 'spezielle-form']

// --- Generators ---

/** Generate a valid category ID */
const arbCategoryId = fc.constantFrom(...VALID_CATEGORIES)

/** Generate a valid tag ID */
const arbTagId = fc.constantFrom(...VALID_TAGS)

/** Generate a valid ISO date string */
const arbDate = fc.date({
  min: new Date('2007-01-01'),
  max: new Date('2026-12-31')
}).map(d => d.toISOString().split('T')[0])

/** Generate a valid slug */
const arbSlug = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
  { minLength: 1, maxLength: 30 }
)

/** Generate a BlogEntry object with valid categories and tags */
const arbBlogEntry = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  type: fc.constantFrom('poem', 'text'),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  text: fc.string({ minLength: 1, maxLength: 200 }),
  intro: fc.string({ minLength: 1, maxLength: 100 }),
  date: arbDate,
  entryDate: arbDate,
  image: fc.string({ minLength: 1, maxLength: 50 }),
  imageRight: fc.string({ minLength: 0, maxLength: 50 }),
  tags: fc.array(arbTagId, { minLength: 0, maxLength: 4 }),
  categories: fc.array(arbCategoryId, { minLength: 1, maxLength: 2 }),
  url: arbSlug
})

/** Generate a list of BlogEntry objects */
const arbBlogEntryList = fc.array(arbBlogEntry, { minLength: 0, maxLength: 30 })

// --- Test Setup ---

describe('Category Filtering Properties', () => {
  let content

  beforeEach(() => {
    content = useContent()
    // Reset state for each test
    content.blogEntries.value = []
  })

  // --- Property 3: Category filtering correctness ---
  describe('Property 3: Category filtering correctness', () => {
    /**
     * Feature: content-sync-and-restructure, Property 3: Category filtering correctness
     * Validates: Requirements 6.1, 6.5
     *
     * For any category ID and for any list of blog entries (each having a `categories` array),
     * getEntriesByCategory(categoryId) SHALL return exactly those entries where
     * entry.categories.includes(categoryId) is true, and no others.
     */
    it('getEntriesByCategory returns exactly entries containing the category', () => {
      fc.assert(
        fc.property(
          arbBlogEntryList,
          arbCategoryId,
          (entries, categoryId) => {
            content.blogEntries.value = entries

            const result = content.getEntriesByCategory(categoryId)
            const expected = entries.filter(e => (e.categories || []).includes(categoryId))

            // Same length — no extra or missing entries
            expect(result).toHaveLength(expected.length)

            // Every returned entry must contain the category
            for (const entry of result) {
              expect((entry.categories || [])).toContain(categoryId)
            }

            // Every entry with the category must be in the result
            for (const entry of expected) {
              expect(result).toContainEqual(entry)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // --- Property 4: Combined category and tag filtering ---
  describe('Property 4: Combined category and tag filtering', () => {
    /**
     * Feature: content-sync-and-restructure, Property 4: Combined category and tag filtering
     * Validates: Requirements 6.3
     *
     * For any category ID, for any tag ID, and for any list of blog entries,
     * filtering by both category and tag simultaneously SHALL return exactly those entries
     * where entry.categories.includes(categoryId) && entry.tags.includes(tagId) is true,
     * and no others.
     */
    it('filtering by both category and tag returns only entries matching both conditions', () => {
      fc.assert(
        fc.property(
          arbBlogEntryList,
          arbCategoryId,
          arbTagId,
          (entries, categoryId, tagId) => {
            content.blogEntries.value = entries

            // Combined filtering: category AND tag
            const result = content.getEntriesByCategory(categoryId)
              .filter(entry => entry.tags.includes(tagId))

            const expected = entries.filter(
              e => (e.categories || []).includes(categoryId) && e.tags.includes(tagId)
            )

            // Same length — no extra or missing entries
            expect(result).toHaveLength(expected.length)

            // Every returned entry must match both conditions
            for (const entry of result) {
              expect((entry.categories || [])).toContain(categoryId)
              expect(entry.tags).toContain(tagId)
            }

            // Every entry matching both conditions must be in the result
            for (const entry of expected) {
              expect(result).toContainEqual(entry)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
