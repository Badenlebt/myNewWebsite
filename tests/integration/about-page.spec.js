/**
 * Integration tests for the About Me page.
 * Navigates to /ueber-mich, verifies content renders; switches to EN, verifies English.
 *
 * Validates: Requirements 10.1, 10.2, 10.5
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { ref, nextTick } from 'vue'

// Mock useContent composable
vi.mock('@/composables/useContent', async () => {
  const { ref: vueRef } = await import('vue')
  return {
    useContent: () => ({
      blogEntries: vueRef([]),
      books: vueRef([]),
      tags: vueRef([]),
      categories: vueRef([]),
      isLoading: vueRef(false),
      error: vueRef(null),
      fetchBlogEntries: vi.fn().mockResolvedValue(undefined),
      fetchBooks: vi.fn().mockResolvedValue(undefined),
      fetchTags: vi.fn().mockResolvedValue(undefined),
      fetchCategories: vi.fn().mockResolvedValue(undefined),
      getBlogBySlug: vi.fn().mockReturnValue(undefined),
      getBookBySlug: vi.fn().mockReturnValue(undefined),
      getLatestEntries: vi.fn().mockReturnValue([]),
      getEntriesByTag: vi.fn().mockReturnValue([]),
      getEntriesByCategory: vi.fn().mockReturnValue([]),
      getTagLabel: vi.fn().mockReturnValue(''),
      getCategoryLabel: vi.fn().mockReturnValue('')
    })
  }
})

// Mock useHead composable
const setHeadSpy = vi.fn()
vi.mock('@/composables/useHead', () => ({
  useHead: () => ({
    setHead: setHeadSpy
  })
}))

// Mock useLanguage composable
vi.mock('@/composables/useLanguage', async () => {
  const { ref: vueRef } = await import('vue')
  const lang = vueRef('de')
  return {
    useLanguage: () => ({
      currentLanguage: lang,
      switchLanguage: vi.fn((l) => { lang.value = l })
    })
  }
})

import AboutMePage from '@/pages/AboutMePage.vue'
import HomePage from '@/pages/HomePage.vue'
import App from '@/App.vue'

const messages = {
  de: {
    global: { title: 'Michael Hitzelberger', subtitle: 'Gedichte, Bücher und mehr', moreLinks: 'Weitere Links', social: 'Social Media' },
    links: { start: 'Start', blog: 'Blog', books: 'Bücher', keinhorn: 'Das Keinhorn', albertAmeise: 'Albert Ameise', herzgedanken: 'Herzgedanken', imprint: 'Impressum', aboutMe: 'Über mich', startUrl: '/', blogUrl: '/blog', booksUrlPart: '/buecher/', keinhornUrl: '/buecher/das-keinhorn', albertAmeiseUrl: '/buecher/albert-ameise', herzgedankenUrl: '/buecher/herzgedanken', aboutMeUrl: '/ueber-mich', imprintUrl: '/impressum' },
    blog: { title: 'Blog', count: 'Einträge', tagChosen: 'mit dem Tag', categoryChosen: 'in der Kategorie', categories: 'Kategorien', tags: 'Schlagwörter' },
    buttons: { toTop: 'Nach oben' },
    aboutMe: {
      title: 'Über mich',
      text0: 'Ich bin Diplom-Informatiker (Bioinformatik), wohne mit meiner Familie in Aglasterhausen und arbeite bei der DB Cargo AG als Manager IT Development.',
      text1: 'In meiner Freizeit schreibe ich Gedichte und Geschichten. Außerdem engagiere ich mich ehrenamtlich bei der <a href="https://www.kolping-aglasterhausen.de" target="_blank" rel="noopener">Kolpingsfamilie Aglasterhausen</a> und bei den <a href="https://www.kandelschiffer.de" target="_blank" rel="noopener">Kandelschiffern</a>.',
      text2: 'Für meine Töchter habe ich Gute-Nacht-Geschichten über Albert Ameise erfunden, die ich inzwischen auch als Buch veröffentlicht habe:',
      text3: 'Hier auf der Seite werde ich daneben auch zu verschiedenen anderen Themen Beiträge veröffentlichen.'
    },
    welcome: { title: 'WILLKOMMEN', subtitle: 'auf meiner Seite!', text: 'Willkommen' },
    books: { homeTitle: 'Bücher', homeIntro: 'Intro', moreLink: 'Mehr' }
  },
  en: {
    global: { title: 'Michael Hitzelberger', subtitle: 'Poems, books and more', moreLinks: 'More links', social: 'Social media' },
    links: { start: 'Home', blog: 'Blog', books: 'Books', keinhorn: 'Das Keinhorn', albertAmeise: 'Albert Ameise', herzgedanken: 'Herzgedanken', imprint: 'Imprint', aboutMe: 'About me', startUrl: '/', blogUrl: '/blog', booksUrlPart: '/books/', keinhornUrl: '/books/das-keinhorn', albertAmeiseUrl: '/books/albert-ameise', herzgedankenUrl: '/books/herzgedanken', aboutMeUrl: '/about-me', imprintUrl: '/imprint' },
    blog: { title: 'Blog', count: 'entries', tagChosen: 'with tag', categoryChosen: 'in category', categories: 'Categories', tags: 'Tags' },
    buttons: { toTop: 'Back to top' },
    aboutMe: {
      title: 'About me',
      text0: 'I am a computer scientist (bioinformatics), living with my family in Aglasterhausen and working at DB Cargo AG as Manager IT Development.',
      text1: 'In my free time I write poems and stories. I also volunteer at the <a href="https://www.kolping-aglasterhausen.de" target="_blank" rel="noopener">Kolping Family Aglasterhausen</a> and the <a href="https://www.kandelschiffer.de" target="_blank" rel="noopener">Kandelschiffer</a>.',
      text2: 'For my daughters I invented bedtime stories about Albert the Ant, which I have since published as a book:',
      text3: 'On this site I will also publish posts on various other topics.'
    }
  }
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomePage },
      { path: '/ueber-mich', component: AboutMePage },
      { path: '/about-me', component: AboutMePage },
      { path: '/:pathMatch(.*)*', component: { template: '<div class="not-found-page">Not found</div>' } }
    ]
  })
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

async function mountApp(router, i18n, initialRoute = '/') {
  await router.push(initialRoute)
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [router, i18n],
      stubs: {
        BlogCard: { template: '<div class="blog-card-stub"></div>' }
      }
    }
  })
  await flushPromises()
  await nextTick()
  return wrapper
}

describe('About Page Integration', () => {
  let router

  beforeEach(() => {
    router = createTestRouter()
    setHeadSpy.mockClear()
  })

  describe('German route /ueber-mich (Requirement 10.1)', () => {
    it('renders the About page at /ueber-mich', async () => {
      const i18n = createTestI18n('de')
      const wrapper = await mountApp(router, i18n, '/ueber-mich')

      expect(wrapper.find('.about-page').exists()).toBe(true)
    })

    it('displays German content on /ueber-mich', async () => {
      const i18n = createTestI18n('de')
      const wrapper = await mountApp(router, i18n, '/ueber-mich')

      expect(wrapper.text()).toContain('Über mich')
      expect(wrapper.text()).toContain('Diplom-Informatiker')
      expect(wrapper.text()).toContain('Aglasterhausen')
      expect(wrapper.text()).toContain('DB Cargo AG')
    })

    it('displays biographical paragraphs', async () => {
      const i18n = createTestI18n('de')
      const wrapper = await mountApp(router, i18n, '/ueber-mich')

      expect(wrapper.text()).toContain('Gedichte und Geschichten')
      expect(wrapper.text()).toContain('Albert Ameise')
      expect(wrapper.text()).toContain('verschiedenen anderen Themen')
    })

    it('contains links to Kolping and Kandelschiffer', async () => {
      const i18n = createTestI18n('de')
      const wrapper = await mountApp(router, i18n, '/ueber-mich')

      const html = wrapper.html()
      expect(html).toContain('kolping-aglasterhausen.de')
      expect(html).toContain('kandelschiffer.de')
    })

    it('calls setHead with correct title', async () => {
      const i18n = createTestI18n('de')
      await mountApp(router, i18n, '/ueber-mich')

      expect(setHeadSpy).toHaveBeenCalled()
      const headCall = setHeadSpy.mock.calls[0][0]
      expect(headCall.title).toContain('Über mich')
      expect(headCall.title).toContain('Michael Hitzelberger')
    })
  })

  describe('English route /about-me (Requirement 10.2)', () => {
    it('renders the About page at /about-me', async () => {
      const i18n = createTestI18n('en')
      const wrapper = await mountApp(router, i18n, '/about-me')

      expect(wrapper.find('.about-page').exists()).toBe(true)
    })

    it('displays English content on /about-me when locale is EN', async () => {
      const i18n = createTestI18n('en')
      const wrapper = await mountApp(router, i18n, '/about-me')

      expect(wrapper.text()).toContain('About me')
      expect(wrapper.text()).toContain('computer scientist')
      expect(wrapper.text()).toContain('Aglasterhausen')
      expect(wrapper.text()).toContain('DB Cargo AG')
    })

    it('displays English biographical paragraphs', async () => {
      const i18n = createTestI18n('en')
      const wrapper = await mountApp(router, i18n, '/about-me')

      expect(wrapper.text()).toContain('poems and stories')
      expect(wrapper.text()).toContain('Albert the Ant')
      expect(wrapper.text()).toContain('various other topics')
    })
  })

  describe('Language switching (Requirement 10.5)', () => {
    it('switches from German to English content when locale changes', async () => {
      const i18n = createTestI18n('de')
      const wrapper = await mountApp(router, i18n, '/ueber-mich')

      // Verify German content first
      expect(wrapper.text()).toContain('Über mich')
      expect(wrapper.text()).toContain('Diplom-Informatiker')

      // Switch locale to English
      i18n.global.locale.value = 'en'
      await nextTick()
      await flushPromises()

      // Verify English content
      expect(wrapper.text()).toContain('About me')
      expect(wrapper.text()).toContain('computer scientist')
    })

    it('both /ueber-mich and /about-me render the same component', async () => {
      const i18n = createTestI18n('de')

      const wrapper1 = await mountApp(router, i18n, '/ueber-mich')
      const aboutPageDE = wrapper1.find('.about-page')
      expect(aboutPageDE.exists()).toBe(true)

      const router2 = createTestRouter()
      const i18n2 = createTestI18n('en')
      const wrapper2 = await mountApp(router2, i18n2, '/about-me')
      const aboutPageEN = wrapper2.find('.about-page')
      expect(aboutPageEN.exists()).toBe(true)
    })
  })
})
