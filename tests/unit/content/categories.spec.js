/**
 * Unit tests for categories.json content data.
 * Verifies structure and entries.
 *
 * Validates: Requirements 4.1, 4.2
 */
import { describe, it, expect } from 'vitest'
import categories from '../../../public/content/categories.json'

describe('categories.json', () => {
  it('has exactly 2 entries', () => {
    expect(categories).toHaveLength(2)
  })

  it('contains "poem" with de "Gedicht" and en "Poem"', () => {
    const poem = categories.find(c => c.id === 'poem')
    expect(poem).toBeDefined()
    expect(poem.de).toBe('Gedicht')
    expect(poem.en).toBe('Poem')
  })

  it('contains "shortstory" with de "Kurzgeschichte" and en "Short story"', () => {
    const shortstory = categories.find(c => c.id === 'shortstory')
    expect(shortstory).toBeDefined()
    expect(shortstory.de).toBe('Kurzgeschichte')
    expect(shortstory.en).toBe('Short story')
  })
})
