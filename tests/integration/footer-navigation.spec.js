/**
 * Integration tests for footer navigation.
 * Clicks category link in footer and verifies blog page loads with filter.
 *
 * Validates: Requirements 5.3, 5.4
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { ref, nextTick } from 'vue'

// Mock useContent composable
vi.mock('@/composables/useContent', async () => {
  const { ref: vueRef } = await import('vue')
  const cats = [
    { id: 'poem', de: 'Gedicht', en: 'Poem' },
    { id: 'shortstory', de: 'Kurzgeschichte', en: 'Short story' }
  ]
  const tgs = [
    { id: 'german', de: 'Deutsch', en: 'German' },
    { id: 'english', de: 'Englisch', en: 'English' },
    { id: 'limerick', de: 'Limericks', en: 'Limericks' }
  ]
  return {
    useContent: () => ({
      blogEntries: vueRef([]),
      books: vueRef([]),
      tags: vueRef(tgs),
      categories: vueRef(cats),
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
      getTagLabel: vi.fn((tagId, lang) => {
        const tag = tgs.find(t => t.id === tagId)
        return tag ? (tag[lang] || tag.de) : tagId
      }),
      getCategoryLabel: vi.fn((catId, lang) => {
        const cat = cats.find(c => c.id === catId)
        return cat ? (cat[lang] || cat.de) : catId
      })
    })
  }
})

// Mock useHead composable
vi.mock('@/composables/useHead', () => ({
  useHead: () => ({
    setHead: vi.fn()
  })
}))

// Mock useLanguage composable
vi.mock('@/composables/useLanguage', async () => {
  const { ref: vueRef } = await import('vue')
  return {
    useLanguage: () => ({
      currentLanguage: vueRef('de'),
      switchLanguage: vi.fn()
    })
  }
})

import FooterSection from '@/components/FooterSection.vue'
import BlogPage from '@/pages/BlogPage.vue'
import HomePage from '@/pages/HomePage.vue'
import App from '@/App.vue'

const messages = {
  de: {
    global: { title: 'Michael Hitzelberger', subtitle: 'Gedichte, Bücher und mehr', moreLinks: 'Weitere Links', social: 'Social Media' },
    links: { start: 'Start', blog: 'Blog', books: 'Bücher', keinhorn: 'Das Keinhorn', albertAmeise: 'Albert Ameise', herzgedanken: 'Herzgedanken', imprint: 'Impressum', aboutMe: 'Über mich', startUrl: '/', blogUrl: '/blog', booksUrlPart: '/buecher/', keinhornUrl: '/buecher/das-keinhorn', albertAmeiseUrl: '/buecher/albert-ameise', herzgedankenUrl: '/buecher/herzgedanken', aboutMeUrl: '/ueber-mich', imprintUrl: '/impressum' },
    blog: { title: 'Blog', count: 'Einträge', tagChosen: 'mit dem Tag', categoryChosen: 'in der Kategorie', categories: 'Kategorien', tags: 'Schlagwörter', moreLink: 'Weiterlesen', homeTitle: 'Neuste Blogeinträge', allEntries: 'Alle Blogeinträge ansehen' },
    buttons: { toTop: 'Nach oben' },
    welcome: { title: 'WILLKOMMEN', subtitle: 'auf meiner Seite!', text: 'Willkommen' },
    books: { homeTitle: 'Bücher', homeIntro: 'Intro', moreLink: 'Mehr' }
  },
  en: {
    global: { title: 'Michael Hitzelberger', subtitle: 'Poems, books and more', moreLinks: 'More links', social: 'Social media' },
    links: { start: 'Home', blog: 'Blog', books: 'Books', keinhorn: 'Das Keinhorn', albertAmeise: 'Albert Ameise', herzgedanken: 'Herzgedanken', imprint: 'Imprint', aboutMe: 'About me', startUrl: '/', blogUrl: '/blog', booksUrlPart: '/books/', keinhornUrl: '/books/das-keinhorn', albertAmeiseUrl: '/books/albert-ameise', herzgedankenUrl: '/books/herzgedanken', aboutMeUrl: '/about-me', imprintUrl: '/imprint' },
    blog: { title: 'Blog', count: 'entries', tagChosen: 'with tag', categoryChosen: 'in category', categories: 'Categories', tags: 'Tags', moreLink: 'Read more', homeTitle: 'Newest blog entries', allEntries: 'View all blog entries' },
    buttons: { toTop: 'Back to top' }
  }
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomePage },
      { path: '/blog', component: BlogPage },
      { path: '/:pathMatch(.*)*', component: { template: '<div class="not-found-page">Not found</div>' } }
    ]
  })
}

function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'de',
    fallbackLocale: 'de',
    messages,
    missingWarn: false,
    fallbackWarn: false
  })
}

describe('Footer Navigation Integration', () => {
  let router

  beforeEach(() => {
    router = createTestRouter()
  })

  describe('Category links in footer navigate to blog with filter (Requirement 5.3)', () => {
    it('renders category links in the footer', async () => {
      await router.push('/')
      await router.isReady()

      const i18n = createTestI18n()
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

      const footer = wrapper.find('.footer')
      expect(footer.exists()).toBe(true)

      // Check that category links are rendered
      expect(footer.text()).toContain('Kategorien')
      expect(footer.text()).toContain('Gedicht')
      expect(footer.text()).toContain('Kurzgeschichte')
    })

    it('clicking "Gedicht" category link navigates to /blog?category=poem', async () => {
      await router.push('/')
      await router.isReady()

      const i18n = createTestI18n()
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

      // Find the category link for "Gedicht" (poem)
      const footer = wrapper.find('.footer')
      const categoryLinks = footer.findAll('a[href="/blog?category=poem"]')
      expect(categoryLinks.length).toBeGreaterThanOrEqual(1)

      await categoryLinks[0].trigger('click')
      await flushPromises()
      await nextTick()

      expect(router.currentRoute.value.path).toBe('/blog')
      expect(router.currentRoute.value.query.category).toBe('poem')
    })

    it('clicking "Kurzgeschichte" category link navigates to /blog?category=shortstory', async () => {
      await router.push('/')
      await router.isReady()

      const i18n = createTestI18n()
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

      const footer = wrapper.find('.footer')
      const categoryLinks = footer.findAll('a[href="/blog?category=shortstory"]')
      expect(categoryLinks.length).toBeGreaterThanOrEqual(1)

      await categoryLinks[0].trigger('click')
      await flushPromises()
      await nextTick()

      expect(router.currentRoute.value.path).toBe('/blog')
      expect(router.currentRoute.value.query.category).toBe('shortstory')
    })
  })

  describe('Tag links in footer navigate to blog with filter (Requirement 5.4)', () => {
    it('renders tag links in the footer', async () => {
      await router.push('/')
      await router.isReady()

      const i18n = createTestI18n()
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

      const footer = wrapper.find('.footer')
      expect(footer.text()).toContain('Schlagwörter')
      expect(footer.text()).toContain('Deutsch')
      expect(footer.text()).toContain('Englisch')
    })

    it('clicking "Deutsch" tag link navigates to /blog?tag=german', async () => {
      await router.push('/')
      await router.isReady()

      const i18n = createTestI18n()
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

      const footer = wrapper.find('.footer')
      const tagLinks = footer.findAll('a[href="/blog?tag=german"]')
      expect(tagLinks.length).toBeGreaterThanOrEqual(1)

      await tagLinks[0].trigger('click')
      await flushPromises()
      await nextTick()

      expect(router.currentRoute.value.path).toBe('/blog')
      expect(router.currentRoute.value.query.tag).toBe('german')
    })

    it('blog page renders with filter active after footer navigation', async () => {
      await router.push('/')
      await router.isReady()

      const i18n = createTestI18n()
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

      // Navigate via router (simulating click)
      await router.push('/blog?category=poem')
      await flushPromises()
      await nextTick()

      // Blog page should be rendered with filter active
      expect(wrapper.find('.blog-page').exists()).toBe(true)
      expect(wrapper.find('.active-filters').exists()).toBe(true)
    })
  })
})
