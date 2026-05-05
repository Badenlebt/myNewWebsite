/**
 * Unit tests for tags.json content data.
 * Verifies updated tags (no poem/shortstory, 3 new tags present).
 *
 * Validates: Requirements 8.1, 8.2, 8.3
 */
import { describe, it, expect } from 'vitest'
import tags from '../../../public/content/tags.json'

describe('tags.json', () => {
  it('has exactly 7 entries', () => {
    expect(tags).toHaveLength(7)
  })

  it('does NOT contain "poem"', () => {
    const poem = tags.find(t => t.id === 'poem')
    expect(poem).toBeUndefined()
  })

  it('does NOT contain "shortstory"', () => {
    const shortstory = tags.find(t => t.id === 'shortstory')
    expect(shortstory).toBeUndefined()
  })

  it('contains "antologie"', () => {
    const tag = tags.find(t => t.id === 'antologie')
    expect(tag).toBeDefined()
  })

  it('contains "kurzgeschichtentriell"', () => {
    const tag = tags.find(t => t.id === 'kurzgeschichtentriell')
    expect(tag).toBeDefined()
  })

  it('contains "spezielle-form"', () => {
    const tag = tags.find(t => t.id === 'spezielle-form')
    expect(tag).toBeDefined()
  })

  it('contains "german"', () => {
    const tag = tags.find(t => t.id === 'german')
    expect(tag).toBeDefined()
  })

  it('contains "english"', () => {
    const tag = tags.find(t => t.id === 'english')
    expect(tag).toBeDefined()
  })

  it('contains "limerick"', () => {
    const tag = tags.find(t => t.id === 'limerick')
    expect(tag).toBeDefined()
  })

  it('contains "hommage"', () => {
    const tag = tags.find(t => t.id === 'hommage')
    expect(tag).toBeDefined()
  })
})
