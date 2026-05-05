/**
 * Unit tests for blog-entries.json content data.
 * Verifies all 9 new entries exist with correct fields.
 *
 * Validates: Requirements 1.1–1.9
 */
import { describe, it, expect } from 'vitest'
import blogEntries from '../../../public/content/blog-entries.json'

describe('blog-entries.json — new entries', () => {
  function findEntry(url) {
    return blogEntries.find(e => e.url === url)
  }

  describe('diese-zeiten', () => {
    const entry = findEntry('diese-zeiten')

    it('exists', () => {
      expect(entry).toBeDefined()
    })

    it('has type poem', () => {
      expect(entry.type).toBe('poem')
    })

    it('has tags ["german"]', () => {
      expect(entry.tags).toEqual(['german'])
    })

    it('has categories ["poem"]', () => {
      expect(entry.categories).toEqual(['poem'])
    })

    it('has date starting with 2026-03', () => {
      expect(entry.date.startsWith('2026-03')).toBe(true)
    })
  })

  describe('versteckte-leidenschaft', () => {
    const entry = findEntry('versteckte-leidenschaft')

    it('exists', () => {
      expect(entry).toBeDefined()
    })

    it('has type text', () => {
      expect(entry.type).toBe('text')
    })

    it('has tags including "antologie" and "german"', () => {
      expect(entry.tags).toContain('antologie')
      expect(entry.tags).toContain('german')
    })

    it('has categories ["shortstory"]', () => {
      expect(entry.categories).toEqual(['shortstory'])
    })

    it('has date starting with 2025-06', () => {
      expect(entry.date.startsWith('2025-06')).toBe(true)
    })
  })

  describe('the-emperor', () => {
    const entry = findEntry('the-emperor')

    it('exists', () => {
      expect(entry).toBeDefined()
    })

    it('has type poem', () => {
      expect(entry.type).toBe('poem')
    })

    it('has tags ["english"]', () => {
      expect(entry.tags).toEqual(['english'])
    })

    it('has categories ["poem"]', () => {
      expect(entry.categories).toEqual(['poem'])
    })

    it('has date starting with 2025-04', () => {
      expect(entry.date.startsWith('2025-04')).toBe(true)
    })
  })

  describe('im-bundestag', () => {
    const entry = findEntry('im-bundestag')

    it('exists', () => {
      expect(entry).toBeDefined()
    })

    it('has type poem', () => {
      expect(entry.type).toBe('poem')
    })

    it('has tags including "spezielle-form"', () => {
      expect(entry.tags).toContain('spezielle-form')
    })

    it('has categories ["poem"]', () => {
      expect(entry.categories).toEqual(['poem'])
    })

    it('has date starting with 2025-04', () => {
      expect(entry.date.startsWith('2025-04')).toBe(true)
    })
  })

  describe('magische-spiele', () => {
    const entry = findEntry('magische-spiele')

    it('exists', () => {
      expect(entry).toBeDefined()
    })

    it('has type text', () => {
      expect(entry.type).toBe('text')
    })

    it('has tags including "kurzgeschichtentriell"', () => {
      expect(entry.tags).toContain('kurzgeschichtentriell')
    })

    it('has categories ["shortstory"]', () => {
      expect(entry.categories).toEqual(['shortstory'])
    })

    it('has date starting with 2024-03', () => {
      expect(entry.date.startsWith('2024-03')).toBe(true)
    })
  })

  describe('koennen-diese-augen-luegen', () => {
    const entry = findEntry('koennen-diese-augen-luegen')

    it('exists', () => {
      expect(entry).toBeDefined()
    })

    it('has type text', () => {
      expect(entry.type).toBe('text')
    })

    it('has tags ["german"]', () => {
      expect(entry.tags).toEqual(['german'])
    })

    it('has categories ["shortstory"]', () => {
      expect(entry.categories).toEqual(['shortstory'])
    })

    it('has date starting with 2023-05', () => {
      expect(entry.date.startsWith('2023-05')).toBe(true)
    })
  })

  describe('advent', () => {
    const entry = findEntry('advent')

    it('exists', () => {
      expect(entry).toBeDefined()
    })

    it('has type poem', () => {
      expect(entry.type).toBe('poem')
    })

    it('has tags ["german"]', () => {
      expect(entry.tags).toEqual(['german'])
    })

    it('has categories ["poem"]', () => {
      expect(entry.categories).toEqual(['poem'])
    })

    it('has date starting with 2007-12', () => {
      expect(entry.date.startsWith('2007-12')).toBe(true)
    })
  })

  describe('natur', () => {
    const entry = findEntry('natur')

    it('exists', () => {
      expect(entry).toBeDefined()
    })

    it('has type poem', () => {
      expect(entry.type).toBe('poem')
    })

    it('has tags ["german"]', () => {
      expect(entry.tags).toEqual(['german'])
    })

    it('has categories ["poem"]', () => {
      expect(entry.categories).toEqual(['poem'])
    })

    it('has date starting with 2022-05', () => {
      expect(entry.date.startsWith('2022-05')).toBe(true)
    })
  })

  describe('dunkel-wandelnde-gestalten', () => {
    const entry = findEntry('dunkel-wandelnde-gestalten')

    it('exists', () => {
      expect(entry).toBeDefined()
    })

    it('has type poem', () => {
      expect(entry.type).toBe('poem')
    })

    it('has tags ["german"]', () => {
      expect(entry.tags).toEqual(['german'])
    })

    it('has categories ["poem"]', () => {
      expect(entry.categories).toEqual(['poem'])
    })

    it('has date starting with 2018-10', () => {
      expect(entry.date.startsWith('2018-10')).toBe(true)
    })
  })
})
