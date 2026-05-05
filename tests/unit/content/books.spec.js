/**
 * Unit tests for books.json content data.
 * Verifies Herzgedanken exists and Albert Ameise has shop links.
 *
 * Validates: Requirements 2.1, 3.1, 3.2
 */
import { describe, it, expect } from 'vitest'
import books from '../../../public/content/books.json'

describe('books.json', () => {
  describe('Herzgedanken', () => {
    const book = books.find(b => b.id === 'herzgedanken')

    it('exists', () => {
      expect(book).toBeDefined()
    })

    it('has id "herzgedanken"', () => {
      expect(book.id).toBe('herzgedanken')
    })

    it('has type "poem"', () => {
      expect(book.type).toBe('poem')
    })

    it('has hasShopLinks true', () => {
      expect(book.hasShopLinks).toBe(true)
    })

    it('has shop.provider "bod"', () => {
      expect(book.shop.provider).toBe('bod')
    })
  })

  describe('Albert Ameise', () => {
    const book = books.find(b => b.id === 'albert')

    it('exists', () => {
      expect(book).toBeDefined()
    })

    it('has hasShopLinks true', () => {
      expect(book.hasShopLinks).toBe(true)
    })

    it('has shop.provider "epubli"', () => {
      expect(book.shop.provider).toBe('epubli')
    })

    it('has shop.types including "print"', () => {
      expect(book.shop.types).toContain('print')
    })
  })
})
