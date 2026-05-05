/**
 * Unit tests for ImprintPage component.
 * Verifies all legal sections are rendered in both languages.
 *
 * Validates: Requirements 8.1
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'

vi.mock('@/composables/useHead', () => ({
  useHead: () => ({ setHead: vi.fn() })
}))

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: { value: 'de' },
    switchLanguage: vi.fn()
  })
}))

vi.mock('@/composables/useContent', () => ({
  useContent: () => ({
    blogEntries: { value: [] },
    books: { value: [] },
    tags: { value: [] },
    isLoading: { value: false },
    error: { value: null },
    fetchBlogEntries: vi.fn(),
    fetchBooks: vi.fn(),
    fetchTags: vi.fn(),
    getBlogBySlug: vi.fn(),
    getBookBySlug: vi.fn(),
    getLatestEntries: vi.fn().mockReturnValue([]),
    getEntriesByTag: vi.fn().mockReturnValue([]),
    getTagLabel: vi.fn()
  })
}))

import ImprintPage from '@/pages/ImprintPage.vue'

const deMessages = {
  global: { title: 'Michael Hitzelberger' },
  imprint: {
    title: 'Impressum',
    responsible: 'Verantwortlich für den Inhalt und Datenschutz:',
    address: 'Michael Hitzelberger\nPostweg 2\n74858 Aglasterhausen',
    mail: "mail{'@'}mhitzelberger.de",
    whoWeAre: 'Wer wir sind',
    whoWeAreText: 'Die Adresse unserer Webseite ist:',
    whoWeAreUrl: 'https://mhitzelberger.de',
    data: 'Datenschutz',
    dataText: 'Mit der folgenden Datenschutzerklärung möchten wir Dich darüber aufklären.',
    cookies: 'Cookies',
    cookiesText1: 'Cookies sind Textdateien, die Daten von besuchten Websites enthalten.',
    cookiesText2: 'Diese Website benutzt Cookies, um Deine Interaktion aufzuzeichnen.',
    otherSites: 'Eingebettete Inhalte anderer Webseiten',
    otherSitesText1: 'Beiträge auf dieser Website können eingebettete Inhalte beinhalten.',
    otherSitesText2: 'Diese Websites können Daten über Dich sammeln.'
  }
}

const enMessages = {
  global: { title: 'Michael Hitzelberger' },
  imprint: {
    title: 'Imprint',
    responsible: 'Responsible for the website\'s content and data security:',
    address: 'Michael Hitzelberger\nPostweg 2\n74858 Aglasterhausen',
    mail: "mail{'@'}mhitzelberger.de",
    whoWeAre: 'Who we are',
    whoWeAreText: 'Our website\'s address is:',
    whoWeAreUrl: 'https://mhitzelberger.de',
    data: 'Data security',
    dataText: 'With the following data security declaration we want to inform you.',
    cookies: 'Cookies',
    cookiesText1: 'Cookies are text files containing data from visited websites.',
    cookiesText2: 'This website uses cookies to track your interactions.',
    otherSites: 'Embedded content from other websites',
    otherSitesText1: 'Postings on this website may contain embedded content.',
    otherSitesText2: 'These websites may collect data about you.'
  }
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/impressum', component: ImprintPage },
      { path: '/imprint', component: ImprintPage }
    ]
  })
}

function createTestI18n(locale = 'de') {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'de',
    messages: { de: deMessages, en: enMessages },
    missingWarn: false,
    fallbackWarn: false
  })
}

async function mountImprint(locale = 'de') {
  const router = createTestRouter()
  await router.push('/impressum')
  await router.isReady()

  const i18n = createTestI18n(locale)

  const wrapper = mount(ImprintPage, {
    global: {
      plugins: [router, i18n]
    }
  })
  await flushPromises()
  return { wrapper, router }
}

describe('ImprintPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('German (DE) content', () => {
    it('renders page title "Impressum"', async () => {
      const { wrapper } = await mountImprint('de')
      expect(wrapper.find('h1').text()).toBe('Impressum')
    })

    it('renders responsible person section', async () => {
      const { wrapper } = await mountImprint('de')
      expect(wrapper.text()).toContain('Verantwortlich für den Inhalt und Datenschutz:')
    })

    it('renders address', async () => {
      const { wrapper } = await mountImprint('de')
      expect(wrapper.text()).toContain('Michael Hitzelberger')
      expect(wrapper.text()).toContain('Postweg 2')
      expect(wrapper.text()).toContain('74858 Aglasterhausen')
    })

    it('renders "Wer wir sind" section', async () => {
      const { wrapper } = await mountImprint('de')
      const headings = wrapper.findAll('h2')
      const whoWeAre = headings.find(h => h.text() === 'Wer wir sind')
      expect(whoWeAre).toBeDefined()
      expect(wrapper.text()).toContain('Die Adresse unserer Webseite ist:')
    })

    it('renders "Datenschutz" section', async () => {
      const { wrapper } = await mountImprint('de')
      const headings = wrapper.findAll('h2')
      const dataSection = headings.find(h => h.text() === 'Datenschutz')
      expect(dataSection).toBeDefined()
      expect(wrapper.text()).toContain('Mit der folgenden Datenschutzerklärung')
    })

    it('renders "Cookies" section', async () => {
      const { wrapper } = await mountImprint('de')
      const headings = wrapper.findAll('h2')
      const cookiesSection = headings.find(h => h.text() === 'Cookies')
      expect(cookiesSection).toBeDefined()
      expect(wrapper.text()).toContain('Cookies sind Textdateien')
      expect(wrapper.text()).toContain('Diese Website benutzt Cookies')
    })

    it('renders "Eingebettete Inhalte" section', async () => {
      const { wrapper } = await mountImprint('de')
      const headings = wrapper.findAll('h2')
      const otherSites = headings.find(h => h.text() === 'Eingebettete Inhalte anderer Webseiten')
      expect(otherSites).toBeDefined()
      expect(wrapper.text()).toContain('Beiträge auf dieser Website können eingebettete Inhalte beinhalten')
      expect(wrapper.text()).toContain('Diese Websites können Daten über Dich sammeln')
    })

    it('renders website URL as a link', async () => {
      const { wrapper } = await mountImprint('de')
      const link = wrapper.find('a[href="https://mhitzelberger.de"]')
      expect(link.exists()).toBe(true)
    })

    it('has all 5 sections (h2 headings)', async () => {
      const { wrapper } = await mountImprint('de')
      const headings = wrapper.findAll('h2')
      expect(headings.length).toBe(4) // whoWeAre, data, cookies, otherSites
    })
  })

  describe('English (EN) content', () => {
    it('renders page title "Imprint"', async () => {
      const { wrapper } = await mountImprint('en')
      expect(wrapper.find('h1').text()).toBe('Imprint')
    })

    it('renders responsible person section in English', async () => {
      const { wrapper } = await mountImprint('en')
      expect(wrapper.text()).toContain("Responsible for the website's content and data security:")
    })

    it('renders "Who we are" section', async () => {
      const { wrapper } = await mountImprint('en')
      const headings = wrapper.findAll('h2')
      const whoWeAre = headings.find(h => h.text() === 'Who we are')
      expect(whoWeAre).toBeDefined()
      expect(wrapper.text()).toContain("Our website's address is:")
    })

    it('renders "Data security" section', async () => {
      const { wrapper } = await mountImprint('en')
      const headings = wrapper.findAll('h2')
      const dataSection = headings.find(h => h.text() === 'Data security')
      expect(dataSection).toBeDefined()
      expect(wrapper.text()).toContain('With the following data security declaration')
    })

    it('renders "Cookies" section in English', async () => {
      const { wrapper } = await mountImprint('en')
      const headings = wrapper.findAll('h2')
      const cookiesSection = headings.find(h => h.text() === 'Cookies')
      expect(cookiesSection).toBeDefined()
      expect(wrapper.text()).toContain('Cookies are text files')
      expect(wrapper.text()).toContain('This website uses cookies')
    })

    it('renders "Embedded content" section in English', async () => {
      const { wrapper } = await mountImprint('en')
      const headings = wrapper.findAll('h2')
      const otherSites = headings.find(h => h.text() === 'Embedded content from other websites')
      expect(otherSites).toBeDefined()
      expect(wrapper.text()).toContain('Postings on this website may contain embedded content')
      expect(wrapper.text()).toContain('These websites may collect data about you')
    })
  })

  describe('Semantic HTML', () => {
    it('uses <main> element', async () => {
      const { wrapper } = await mountImprint('de')
      expect(wrapper.find('main').exists()).toBe(true)
    })

    it('uses <article> element', async () => {
      const { wrapper } = await mountImprint('de')
      expect(wrapper.find('article').exists()).toBe(true)
    })

    it('uses <section> elements for content blocks', async () => {
      const { wrapper } = await mountImprint('de')
      const sections = wrapper.findAll('section')
      expect(sections.length).toBeGreaterThanOrEqual(4)
    })

    it('uses <address> element for address', async () => {
      const { wrapper } = await mountImprint('de')
      expect(wrapper.find('address').exists()).toBe(true)
    })
  })
})
