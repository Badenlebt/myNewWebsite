import { describe, it, expect, beforeAll } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Property tests for content schema validation
 * Feature: vue-website-rebuild
 * Validates: Requirements 13.1, 13.2, 13.3
 */

// --- Load actual content files ---

const contentDir = resolve(process.cwd(), 'public/content')

let blogEntries
let books
let tags

beforeAll(() => {
  blogEntries = JSON.parse(readFileSync(resolve(contentDir, 'blog-entries.json'), 'utf-8'))
  books = JSON.parse(readFileSync(resolve(contentDir, 'books.json'), 'utf-8'))
  tags = JSON.parse(readFileSync(resolve(contentDir, 'tags.json'), 'utf-8'))
})

// --- Property 13: Content JSON schema validation ---
describe('Property 13: Content JSON schema validation', () => {
  /**
   * Feature: vue-website-rebuild, Property 13: Content JSON schema validation
   * **Validates: Requirements 13.1, 13.2**
   *
   * For any object in blog-entries.json, it SHALL contain all required fields
   * (id, type, title, text, intro, date, entryDate, image, imageRight, tags, url)
   * with correct types.
   */
  it('every blog entry has all required fields with correct types', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        (rawIndex) => {
          fc.pre(blogEntries.length > 0)
          const index = rawIndex % blogEntries.length
          const entry = blogEntries[index]

          // Required fields existence
          expect(entry).toHaveProperty('id')
          expect(entry).toHaveProperty('type')
          expect(entry).toHaveProperty('title')
          expect(entry).toHaveProperty('text')
          expect(entry).toHaveProperty('intro')
          expect(entry).toHaveProperty('date')
          expect(entry).toHaveProperty('entryDate')
          expect(entry).toHaveProperty('image')
          expect(entry).toHaveProperty('imageRight')
          expect(entry).toHaveProperty('tags')
          expect(entry).toHaveProperty('url')

          // Type checks
          expect(typeof entry.id).toBe('string')
          expect(['poem', 'text']).toContain(entry.type)
          expect(typeof entry.title).toBe('string')
          expect(typeof entry.text).toBe('string')
          expect(typeof entry.intro).toBe('string')
          expect(typeof entry.date).toBe('string')
          expect(typeof entry.entryDate).toBe('string')
          expect(typeof entry.image).toBe('string')
          expect(typeof entry.imageRight).toBe('string')
          expect(Array.isArray(entry.tags)).toBe(true)
          expect(typeof entry.url).toBe('string')

          // Tags array contains only strings
          for (const tag of entry.tags) {
            expect(typeof tag).toBe('string')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: vue-website-rebuild, Property 13: Content JSON schema validation
   * **Validates: Requirements 13.2**
   *
   * For any object in books.json, it SHALL contain all required fields
   * (id, title, subtitle, type, description, descriptionLong, quote, url, image, imageRight, hasShopLinks)
   * with correct types.
   */
  it('every book entry has all required fields with correct types', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        (rawIndex) => {
          fc.pre(books.length > 0)
          const index = rawIndex % books.length
          const entry = books[index]

          // Required fields existence
          expect(entry).toHaveProperty('id')
          expect(entry).toHaveProperty('title')
          expect(entry).toHaveProperty('subtitle')
          expect(entry).toHaveProperty('type')
          expect(entry).toHaveProperty('description')
          expect(entry).toHaveProperty('descriptionLong')
          expect(entry).toHaveProperty('quote')
          expect(entry).toHaveProperty('url')
          expect(entry).toHaveProperty('image')
          expect(entry).toHaveProperty('imageRight')
          expect(entry).toHaveProperty('hasShopLinks')

          // Type checks
          expect(typeof entry.id).toBe('string')
          expect(typeof entry.title).toBe('string')
          expect(typeof entry.subtitle).toBe('string')
          expect(['poem', 'text']).toContain(entry.type)
          expect(typeof entry.description).toBe('string')
          expect(typeof entry.descriptionLong).toBe('string')
          expect(typeof entry.quote).toBe('string')
          expect(typeof entry.url).toBe('string')
          expect(typeof entry.image).toBe('string')
          expect(typeof entry.imageRight).toBe('string')
          expect(typeof entry.hasShopLinks).toBe('boolean')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: vue-website-rebuild, Property 13: Content JSON schema validation
   * **Validates: Requirements 13.3**
   *
   * For any object in tags.json, it SHALL contain fields id (string), de (string), en (string).
   */
  it('every tag has id, de, and en fields as strings', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        (rawIndex) => {
          fc.pre(tags.length > 0)
          const index = rawIndex % tags.length
          const tag = tags[index]

          expect(tag).toHaveProperty('id')
          expect(tag).toHaveProperty('de')
          expect(tag).toHaveProperty('en')

          expect(typeof tag.id).toBe('string')
          expect(typeof tag.de).toBe('string')
          expect(typeof tag.en).toBe('string')
        }
      ),
      { numRuns: 100 }
    )
  })
})

// --- Property 14: Tags referenced in blog entries exist in tags.json ---
describe('Property 14: Tags referenced in blog entries exist in tags.json', () => {
  /**
   * Feature: vue-website-rebuild, Property 14: Tags referenced in blog entries exist in tags.json
   * **Validates: Requirements 13.3**
   *
   * For any blog entry and for any tag in its tags array, the tag SHALL match
   * the id field of at least one entry in tags.json.
   */
  it('every tag referenced in blog entries exists in tags.json', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        (rawIndex) => {
          fc.pre(blogEntries.length > 0)
          const index = rawIndex % blogEntries.length
          const entry = blogEntries[index]

          const validTagIds = new Set(tags.map(t => t.id))

          for (const tag of entry.tags) {
            expect(validTagIds.has(tag)).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
