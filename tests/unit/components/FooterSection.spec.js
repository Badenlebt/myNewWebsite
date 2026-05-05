/**
 * Unit tests for FooterSection component.
 * Verifies links and social icons rendering.
 *
 * Validates: Requirements 9.1
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { ref } from 'vue'

const mockCurrentLanguage = ref('de')
const mockFetchTags = vi.fn().mockResolvedValue(undefined)
const mockFetchCategories = vi.fn().mockResolvedValue(undefined)
const mockTags = ref([
  { id: 'german', de: 'Deutsch', en: 'German' },
  { id: 'english', de: 'Englisch', en: 'English' },
  { id: 'limerick', de: 'Limericks', en: 'Limericks' }
])
const mockCategories = ref([
  { id: 'poem', de: 'Gedicht', en: 'Poem' },
  { id: 'shortstory', de: 'Kurzgeschichte', en: 'Short story' }
])

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: mockCurrentLanguage,
    switchLanguage: vi.fn()
  })
}))

vi.mock('@/composables/useContent', () => ({
  useContent: () => ({
    blogEntries: { value: [] },
    books: { value: [] },
    tags: mockTags,
    categories: mockCategories,
    isLoading: { value: false },
    error: { value: null },
    fetchBlogEntries: vi.fn(),
    fetchBooks: vi.fn(),
    fetchTags: mockFetchTags,
    fetchCategories: mockFetchCategories,
    getBlogBySlug: vi.fn(),
    getBookBySlug: vi.fn(),
    getLatestEntries: vi.fn().mockReturnValue([]),
    getEntriesByTag: vi.fn().mockReturnValue([]),
    getEntriesByCategory: vi.fn().mockReturnValue([]),
    getTagLabel: (tagId, lang) => {
      const tag = mockTags.value.find(t => t.id === tagId)
      if (!tag) return tagId
      return tag[lang] || tag.de || tagId
    },
    getCategoryLabel: (categoryId, lang) => {
      const cat = mockCategories.value.find(c => c.id === categoryId)
      if (!cat) return categoryId
      return cat[lang] || cat.de || categoryId
    }
  })
}))

vi.mock('@/composables/useHead', () => ({
  useHead: () => ({ setHead: vi.fn() })
}))

import FooterSection from '@/components/FooterSection.vue'

const messages = {
  de: {
    global: { moreLinks: 'Weitere Links', social: 'Social Media' },
    links: { imprint: 'Impressum', imprintUrl: '/impressum' },
    blog: { tags: 'Schlagwörter', categories: 'Kategorien' },
    buttons: { toTop: 'Nach oben' }
  },
  en: {
    global: { moreLinks: 'More links', social: 'Social media' },
    links: { imprint: 'Imprint', imprintUrl: '/imprint' },
    blog: { tags: 'Tags', categories: 'Categories' },
    buttons: { toTop: 'Back to top' }
  }
}

function createTestI18n(locale = 'de') {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'de',
    messages,
    missingWarn: false,
    fallbackWarn: false
  })
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/blog', component: { template: '<div>Blog</div>' } },
      { path: '/impressum', component: { template: '<div>Imprint</div>' } },
      { path: '/imprint', component: { template: '<div>Imprint</div>' } }
    ]
  })
}

async function mountFooter(options = {}) {
  const router = createTestRouter()
  await router.push('/')
  await router.isReady()

  const i18n = createTestI18n(options.locale || 'de')

  const wrapper = mount(FooterSection, {
    global: {
      plugins: [router, i18n]
    }
  })
  await flushPromises()
  return { wrapper, router }
}

describe('FooterSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentLanguage.value = 'de'
  })

  describe('Links', () => {
    it('renders Impressum link', async () => {
      const { wrapper } = await mountFooter()
      const links = wrapper.findAll('.footer__link')
      const imprintLink = links.find(l => l.text() === 'Impressum')
      expect(imprintLink).toBeDefined()
      expect(imprintLink.attributes('href')).toBe('/impressum')
    })

    it('renders "More Links" section title', async () => {
      const { wrapper } = await mountFooter()
      const titles = wrapper.findAll('.footer__title')
      const moreLinksTitle = titles.find(t => t.text() === 'Weitere Links')
      expect(moreLinksTitle).toBeDefined()
    })

    it('renders tags section title', async () => {
      const { wrapper } = await mountFooter()
      const titles = wrapper.findAll('.footer__title')
      const tagsTitle = titles.find(t => t.text() === 'Schlagwörter')
      expect(tagsTitle).toBeDefined()
    })

    it('renders categories section title', async () => {
      const { wrapper } = await mountFooter()
      const titles = wrapper.findAll('.footer__title')
      const categoriesTitle = titles.find(t => t.text() === 'Kategorien')
      expect(categoriesTitle).toBeDefined()
    })

    it('renders tag links from content', async () => {
      const { wrapper } = await mountFooter()
      const links = wrapper.findAll('.footer__link')
      // Should have Impressum link + 2 category links + 3 tag links = 6
      expect(links.length).toBe(6)
    })

    it('tag links point to /blog?tag=:id', async () => {
      const { wrapper } = await mountFooter()
      const links = wrapper.findAll('.footer__link')
      const tagLinks = links.filter(l => l.attributes('href')?.includes('/blog?tag='))
      expect(tagLinks.length).toBe(3)
      expect(tagLinks[0].attributes('href')).toBe('/blog?tag=german')
      expect(tagLinks[1].attributes('href')).toBe('/blog?tag=english')
      expect(tagLinks[2].attributes('href')).toBe('/blog?tag=limerick')
    })

    it('category links point to /blog?category=:id', async () => {
      const { wrapper } = await mountFooter()
      const links = wrapper.findAll('.footer__link')
      const categoryLinks = links.filter(l => l.attributes('href')?.includes('/blog?category='))
      expect(categoryLinks.length).toBe(2)
      expect(categoryLinks[0].attributes('href')).toBe('/blog?category=poem')
      expect(categoryLinks[1].attributes('href')).toBe('/blog?category=shortstory')
    })

    it('fetches tags on mount', async () => {
      await mountFooter()
      expect(mockFetchTags).toHaveBeenCalled()
    })

    it('fetches categories on mount', async () => {
      await mountFooter()
      expect(mockFetchCategories).toHaveBeenCalled()
    })
  })

  describe('Social icons', () => {
    it('renders social media section title', async () => {
      const { wrapper } = await mountFooter()
      const titles = wrapper.findAll('.footer__title')
      const socialTitle = titles.find(t => t.text() === 'Social Media')
      expect(socialTitle).toBeDefined()
    })

    it('renders Instagram link', async () => {
      const { wrapper } = await mountFooter()
      const socialLinks = wrapper.findAll('.footer__social-link')
      const instagramLink = socialLinks.find(l =>
        l.attributes('href')?.includes('instagram')
      )
      expect(instagramLink).toBeDefined()
      expect(instagramLink.attributes('target')).toBe('_blank')
      expect(instagramLink.attributes('rel')).toBe('noopener noreferrer')
    })

    it('renders Facebook link', async () => {
      const { wrapper } = await mountFooter()
      const socialLinks = wrapper.findAll('.footer__social-link')
      const facebookLink = socialLinks.find(l =>
        l.attributes('href')?.includes('facebook')
      )
      expect(facebookLink).toBeDefined()
      expect(facebookLink.attributes('target')).toBe('_blank')
      expect(facebookLink.attributes('rel')).toBe('noopener noreferrer')
    })

    it('renders social icon images with alt text', async () => {
      const { wrapper } = await mountFooter()
      const icons = wrapper.findAll('.footer__social-icon')
      expect(icons.length).toBe(2)
      expect(icons[0].attributes('alt')).toBe('Instagram')
      expect(icons[1].attributes('alt')).toBe('Facebook')
    })
  })

  describe('Scroll to top', () => {
    it('renders scroll-to-top button', async () => {
      const { wrapper } = await mountFooter()
      const topBtn = wrapper.find('.footer__top-btn')
      expect(topBtn.exists()).toBe(true)
    })

    it('scroll-to-top button has correct title', async () => {
      const { wrapper } = await mountFooter()
      const topBtn = wrapper.find('.footer__top-btn')
      expect(topBtn.attributes('title')).toBe('Nach oben')
    })

    it('clicking scroll-to-top calls window.scrollTo', async () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      const { wrapper } = await mountFooter()
      const topBtn = wrapper.find('.footer__top-btn')
      await topBtn.trigger('click')
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
      scrollToSpy.mockRestore()
    })
  })
})
