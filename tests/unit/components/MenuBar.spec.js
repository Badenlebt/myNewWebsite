/**
 * Unit tests for MenuBar component.
 * Verifies navigation links, language switcher, and responsive toggle.
 *
 * Validates: Requirements 9.1, 9.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { ref } from 'vue'

const mockSwitchLanguage = vi.fn()
const mockCurrentLanguage = ref('de')
const mockFetchBooks = vi.fn().mockResolvedValue(undefined)
const mockBooks = ref([
  { id: 'keinhorn', title: 'Das Keinhorn', url: 'das-keinhorn' },
  { id: 'albert', title: 'Albert Ameise', url: 'albert-ameise' }
])

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: mockCurrentLanguage,
    switchLanguage: mockSwitchLanguage
  })
}))

vi.mock('@/composables/useContent', () => ({
  useContent: () => ({
    books: mockBooks,
    fetchBooks: mockFetchBooks,
    blogEntries: { value: [] },
    tags: { value: [] },
    isLoading: { value: false },
    error: { value: null },
    fetchBlogEntries: vi.fn(),
    fetchTags: vi.fn(),
    getBlogBySlug: vi.fn(),
    getBookBySlug: vi.fn(),
    getLatestEntries: vi.fn().mockReturnValue([]),
    getEntriesByTag: vi.fn().mockReturnValue([]),
    getTagLabel: vi.fn()
  })
}))

vi.mock('@/composables/useHead', () => ({
  useHead: () => ({ setHead: vi.fn() })
}))

import MenuBar from '@/components/MenuBar.vue'

const messages = {
  de: {
    global: { title: 'Michael Hitzelberger', subtitle: 'Gedichte, Bücher und mehr' },
    links: {
      start: 'Startseite',
      blog: 'Blog',
      books: 'Bücher',
      keinhorn: 'Das Keinhorn',
      albertAmeise: 'Albert Ameise',
      herzgedanken: 'Herzgedanken',
      aboutMe: 'Über mich',
      imprint: 'Impressum',
      startUrl: '/',
      blogUrl: '/blog',
      booksUrlPart: '/buecher/',
      keinhornUrl: '/buecher/das-keinhorn',
      albertAmeiseUrl: '/buecher/albert-ameise',
      herzgedankenUrl: '/buecher/herzgedanken',
      aboutMeUrl: '/ueber-mich',
      imprintUrl: '/impressum'
    },
    buttons: { toTop: 'Nach oben' }
  },
  en: {
    global: { title: 'Michael Hitzelberger', subtitle: 'Poems, books and more' },
    links: {
      start: 'Home',
      blog: 'Blog',
      books: 'Books',
      keinhorn: 'Das Keinhorn',
      albertAmeise: 'Albert Ameise',
      herzgedanken: 'Herzgedanken',
      aboutMe: 'About me',
      imprint: 'Imprint',
      startUrl: '/',
      blogUrl: '/blog',
      booksUrlPart: '/books/',
      keinhornUrl: '/books/das-keinhorn',
      albertAmeiseUrl: '/books/albert-ameise',
      herzgedankenUrl: '/books/herzgedanken',
      aboutMeUrl: '/about-me',
      imprintUrl: '/imprint'
    },
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
      { path: '/buecher/:slug', component: { template: '<div>Book</div>' } },
      { path: '/books/:slug', component: { template: '<div>Book</div>' } },
      { path: '/impressum', component: { template: '<div>Imprint</div>' } },
      { path: '/imprint', component: { template: '<div>Imprint</div>' } }
    ]
  })
}

async function mountMenuBar(options = {}) {
  const router = createTestRouter()
  await router.push(options.route || '/')
  await router.isReady()

  const i18n = createTestI18n(options.locale || 'de')

  const wrapper = mount(MenuBar, {
    global: {
      plugins: [router, i18n]
    }
  })
  await flushPromises()
  return { wrapper, router }
}

describe('MenuBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentLanguage.value = 'de'
  })

  describe('Navigation links', () => {
    it('renders Home link', async () => {
      const { wrapper } = await mountMenuBar()
      const links = wrapper.findAll('.menubar__link')
      const homeLink = links.find(l => l.text() === 'Startseite')
      expect(homeLink).toBeDefined()
    })

    it('renders Blog link', async () => {
      const { wrapper } = await mountMenuBar()
      const links = wrapper.findAll('.menubar__link')
      const blogLink = links.find(l => l.text() === 'Blog')
      expect(blogLink).toBeDefined()
    })

    it('renders Books dropdown button', async () => {
      const { wrapper } = await mountMenuBar()
      const booksBtn = wrapper.find('.menubar__link--dropdown')
      expect(booksBtn.exists()).toBe(true)
      expect(booksBtn.text()).toContain('Bücher')
    })

    it('renders Impressum link', async () => {
      const { wrapper } = await mountMenuBar()
      const links = wrapper.findAll('.menubar__link')
      const imprintLink = links.find(l => l.text() === 'Impressum')
      expect(imprintLink).toBeDefined()
    })

    it('renders book dropdown items from content', async () => {
      const { wrapper } = await mountMenuBar()
      const dropdownLinks = wrapper.findAll('.menubar__dropdown-link')
      expect(dropdownLinks.length).toBe(3)
      expect(dropdownLinks[0].text()).toBe('Das Keinhorn')
      expect(dropdownLinks[1].text()).toBe('Albert Ameise')
      expect(dropdownLinks[2].text()).toBe('Herzgedanken')
    })

    it('renders Über mich link', async () => {
      const { wrapper } = await mountMenuBar()
      const links = wrapper.findAll('.menubar__link')
      const aboutLink = links.find(l => l.text() === 'Über mich')
      expect(aboutLink).toBeDefined()
    })
  })

  describe('Language switcher', () => {
    it('renders DE and EN language buttons', async () => {
      const { wrapper } = await mountMenuBar()
      const langBtns = wrapper.findAll('.menubar__lang-btn')
      expect(langBtns.length).toBe(2)
      expect(langBtns[0].text()).toBe('DE')
      expect(langBtns[1].text()).toBe('EN')
    })

    it('marks current language as active', async () => {
      mockCurrentLanguage.value = 'de'
      const { wrapper } = await mountMenuBar()
      const langOptions = wrapper.findAll('.menubar__lang-option')
      expect(langOptions[0].classes()).toContain('menubar__lang-option--active')
      expect(langOptions[1].classes()).not.toContain('menubar__lang-option--active')
    })

    it('marks EN as active when currentLanguage is en', async () => {
      mockCurrentLanguage.value = 'en'
      const { wrapper } = await mountMenuBar()
      const langOptions = wrapper.findAll('.menubar__lang-option')
      expect(langOptions[0].classes()).not.toContain('menubar__lang-option--active')
      expect(langOptions[1].classes()).toContain('menubar__lang-option--active')
    })

    it('calls switchLanguage when DE button is clicked', async () => {
      const { wrapper } = await mountMenuBar()
      const langBtns = wrapper.findAll('.menubar__lang-btn')
      await langBtns[0].trigger('click')
      expect(mockSwitchLanguage).toHaveBeenCalledWith('de')
    })

    it('calls switchLanguage when EN button is clicked', async () => {
      const { wrapper } = await mountMenuBar()
      const langBtns = wrapper.findAll('.menubar__lang-btn')
      await langBtns[1].trigger('click')
      expect(mockSwitchLanguage).toHaveBeenCalledWith('en')
    })
  })

  describe('Responsive toggle (hamburger menu)', () => {
    it('renders hamburger button', async () => {
      const { wrapper } = await mountMenuBar()
      const hamburger = wrapper.find('.menubar__hamburger')
      expect(hamburger.exists()).toBe(true)
    })

    it('hamburger has correct aria-label', async () => {
      const { wrapper } = await mountMenuBar()
      const hamburger = wrapper.find('.menubar__hamburger')
      expect(hamburger.attributes('aria-label')).toBe('Toggle navigation menu')
    })

    it('nav is closed by default', async () => {
      const { wrapper } = await mountMenuBar()
      const nav = wrapper.find('.menubar__nav')
      expect(nav.classes()).not.toContain('menubar__nav--open')
    })

    it('clicking hamburger opens the nav', async () => {
      const { wrapper } = await mountMenuBar()
      const hamburger = wrapper.find('.menubar__hamburger')
      await hamburger.trigger('click')
      const nav = wrapper.find('.menubar__nav')
      expect(nav.classes()).toContain('menubar__nav--open')
    })

    it('clicking hamburger again closes the nav', async () => {
      const { wrapper } = await mountMenuBar()
      const hamburger = wrapper.find('.menubar__hamburger')
      await hamburger.trigger('click')
      await hamburger.trigger('click')
      const nav = wrapper.find('.menubar__nav')
      expect(nav.classes()).not.toContain('menubar__nav--open')
    })

    it('aria-expanded reflects menu state', async () => {
      const { wrapper } = await mountMenuBar()
      const hamburger = wrapper.find('.menubar__hamburger')
      expect(hamburger.attributes('aria-expanded')).toBe('false')
      await hamburger.trigger('click')
      expect(hamburger.attributes('aria-expanded')).toBe('true')
    })
  })

  describe('Brand section', () => {
    it('renders site title', async () => {
      const { wrapper } = await mountMenuBar()
      expect(wrapper.find('.menubar__title').text()).toBe('Michael Hitzelberger')
    })

    it('renders site subtitle', async () => {
      const { wrapper } = await mountMenuBar()
      expect(wrapper.find('.menubar__subtitle').text()).toBe('Gedichte, Bücher und mehr')
    })

    it('renders logo image', async () => {
      const { wrapper } = await mountMenuBar()
      const logo = wrapper.find('.menubar__logo')
      expect(logo.exists()).toBe(true)
      expect(logo.attributes('alt')).toBe('MH')
    })
  })
})
