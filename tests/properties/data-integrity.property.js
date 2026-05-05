import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import blogEntries from '../../public/content/blog-entries.json'
import tags from '../../public/content/tags.json'
import categories from '../../public/content/categories.json'

/**
 * Property tests for data integrity across content JSON files
 * Feature: content-sync-and-restructure
 * Properties 1, 2, 6, 7
 * Validates: Requirements 4.3, 4.4, 4.5, 4.6, 11.1, 11.2, 11.3, 11.4
 */

// --- Derived sets for referential integrity checks ---
const validTagIds = new Set(tags.map(t => t.id))
const validCategoryIds = new Set(categories.map(c => c.id))

// --- Generators ---

/** Pick a random blog entry from the actual data */
const arbBlogEntry = fc.constantFrom(...blogEntries)

describe('Data Integrity Properties', () => {
  // --- Property 1: Category-type consistency ---
  describe('Property 1: Category-type consistency', () => {
    /**
     * Feature: content-sync-and-restructure, Property 1: Category-type consistency
     * Validates: Requirements 4.4, 4.5, 4.6, 11.4
     *
     * For any blog entry in blog-entries.json, if its `type` field is "poem" then its
     * `categories` array SHALL contain "poem", and if its `type` field is "text" then
     * its `categories` array SHALL contain "shortstory". Furthermore, the `categories`
     * field SHALL be a non-empty array of strings.
     */
    it('entries with type "poem" have category "poem", type "text" have category "shortstory"', () => {
      fc.assert(
        fc.property(
          arbBlogEntry,
          (entry) => {
            // categories must be a non-empty array
            expect(entry.categories).toBeDefined()
            expect(Array.isArray(entry.categories)).toBe(true)
            expect(entry.categories.length).toBeGreaterThan(0)

            // Every element in categories must be a string
            for (const cat of entry.categories) {
              expect(typeof cat).toBe('string')
            }

            // Type-category consistency
            if (entry.type === 'poem') {
              expect(entry.categories).toContain('poem')
            } else if (entry.type === 'text') {
              expect(entry.categories).toContain('shortstory')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // --- Property 2: Tag/category separation ---
  describe('Property 2: Tag/category separation', () => {
    /**
     * Feature: content-sync-and-restructure, Property 2: Tag/category separation
     * Validates: Requirements 4.3, 11.1, 11.2, 11.3
     *
     * For any blog entry in blog-entries.json, its `tags` array SHALL NOT contain
     * "poem" or "shortstory". Additionally, for any tag object in tags.json, its
     * `id` SHALL NOT be "poem" or "shortstory".
     */
    it('no blog entry tags contain "poem" or "shortstory"', () => {
      fc.assert(
        fc.property(
          arbBlogEntry,
          (entry) => {
            expect(entry.tags).not.toContain('poem')
            expect(entry.tags).not.toContain('shortstory')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('tags.json has no "poem" or "shortstory" entries', () => {
      // This is a direct assertion on the tags data (not property-based since
      // it's a fixed dataset check, but included for completeness)
      const tagIds = tags.map(t => t.id)
      expect(tagIds).not.toContain('poem')
      expect(tagIds).not.toContain('shortstory')
    })
  })

  // --- Property 6: Tags referenced in blog entries exist in tags.json ---
  describe('Property 6: Tags referenced in blog entries exist in tags.json', () => {
    /**
     * Feature: content-sync-and-restructure, Property 6: Tags referential integrity
     * Validates: Requirements 4.3, 8.1, 8.2, 8.3
     *
     * For any blog entry and for any tag in its `tags` array, the tag SHALL match
     * the `id` field of at least one entry in the updated tags.json.
     */
    it('every tag referenced in any blog entry exists in tags.json', () => {
      fc.assert(
        fc.property(
          arbBlogEntry,
          (entry) => {
            for (const tag of entry.tags) {
              expect(validTagIds.has(tag)).toBe(true)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // --- Property 7: Categories referenced in blog entries exist in categories.json ---
  describe('Property 7: Categories referenced in blog entries exist in categories.json', () => {
    /**
     * Feature: content-sync-and-restructure, Property 7: Categories referential integrity
     * Validates: Requirements 4.1, 4.2
     *
     * For any blog entry and for any category in its `categories` array, the category
     * SHALL match the `id` field of at least one entry in categories.json.
     */
    it('every category referenced in any blog entry exists in categories.json', () => {
      fc.assert(
        fc.property(
          arbBlogEntry,
          (entry) => {
            for (const category of entry.categories) {
              expect(validCategoryIds.has(category)).toBe(true)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
