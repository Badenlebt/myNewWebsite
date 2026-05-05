/**
 * Integration tests for category + tag filtering on the blog page.
 * Navigates to /blog?category=poem&tag=german and verifies correct entries shown.
 *
 * Validates: Requirements 6.1, 6.3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { ref, nextTick } from 'vue'

// Mock blog entries with different categories and tags
const mockBlogEntries = [
  { id: 'poem-german-1', type: 'poem', title: 'Frühling', url: 'fruehling', tags: ['german'], categories: ['poem'], date: '2021-04-13', entryDate: '2021-04-13', intro: 'Ein Gedicht', image: 'Fruehling.jpg' },
  { id: 'poem-german-2', type: 'poem', title: 'Natur', url: 'natur', tags: ['german'], categories: ['poem'], date: '2022-05-01', entryDate: '2022-05-01', intro: 'Natur Gedicht', image: 'Natur.jpg' },
  { id: 'poem-english', type: 'poem', title: 'The Emperor', url: 'the-emperor', tags: ['english'], categories: ['poem'], date: '2025-04-01', entryDate: '2025-04-01', intro: 'A poem', image: 'Emperor.jpg' },
  { id: 'story-german', type: 'text', title: 'Magische Spiele', url: 'magische-spiele', tags: ['german', 'kurzgeschichtentriell'], categories: ['shortstory'], date: '2024-03-01', entryDate: '2024-03-01', intro: 'Eine Geschichte', image: 'Spiele.jpg' },
  { id: 'story-english', type: 'text', title: 'Hidden Passion', url: 'hidden-passion', tags: ['english'], categories: ['shortstory'], date: '2025-06-01', entryDate: '2025-06-01', intro: 'A story', image: 'Passion.jpg' }
]

const mockCategories = [
  { id: 'poem', de: 'Gedicht', en: 'Poem' },
  { id: 'shortstory', de: 'Kurzgeschichte', en: 'Short story' }
]

const mockTags = [
  { id: 'german', de: 'Deutsch', en: 'German' },
  { id: 'english', de: 'Englisch', en: 'English' },
  { id: 'kurzgeschichtentriell', de: 'Kurzgeschichtentriell', en: 'Short story triel' }
]

// Mock useContent composable — use reactive refs so computed properties in BlogPage work
vi.mock('@/composables/useContent', async () => {
  const { ref: vueRef } = await import('vue')
  const entries = [
    { id: 'poem-german-1', type: 'poem', title: 'Frühling', url: 'fruehling', tags: ['german'], categories: ['poem'], date: '2021-04-13', entryDate: '2021-04-13', intro: 'Ein Gedicht', image: 'Fruehling.jpg' },
    { id: 'poem-german-2', type: 'poem', title: 'Natur', url: 'natur', tags: ['german'], categories: ['poem'], date: '2022-05-01', entryDate: '2022-05-01', intro: 'Natur Gedicht', image: 'Natur.jpg' },
    { id: 'poem-english', type: 'poem', title: 'The Emperor', url: 'the-emperor', tags: ['english'], categories: ['poem'], date: '2025-04-01', entryDate: '2025-04-01', intro: 'A poem', image: 'Emperor.jpg' },
    { id: 'story-german', type: 'text', title: 'Magische Spiele', url: 'magische-spiele', tags: ['german', 'kurzgeschichtentriell'], categories: ['shortstory'], date: '2024-03-01', entryDate: '2024-03-01', intro: 'Eine Geschichte', image: 'Spiele.jpg' },
    { id: 'story-english', type: 'text', title: 'Hidden Passion', url: 'hidden-passion', tags: ['english'], categories: ['shortstory'], date: '2025-06-01', entryDate: '2025-06-01', intro: 'A story', image: 'Passion.jpg' }
  ]
  const cats = [
    { id: 'poem', de: 'Gedicht', en: 'Poem' },
    { id: 'shortstory', de: 'Kurzgeschichte', en: 'Short story' }
  ]
  const tgs = [
    { id: 'german', de: 'Deutsch', en: 'German' },
    { id: 'english', de: 'Englisch', en: 'English' },
    { id: 'kurzgeschichtentriell', de: 'Kurzgeschichtentriell', en: 'Short story triel' }
  ]
  const blogEntriesRef = vueRef(entries)
  const categoriesRef = vueRef(cats)
  const tagsRef = vueRef(tgs)

  return {
    useContent: () => ({
      blogEntries: blogEntriesRef,
      books: vueRef([]),
      tags: tagsRef,
      categories: categoriesRef,
      isLoading: vueRef(false),
      error: vueRef(null),
      fetchBlogEntries: vi.fn().mockResolvedValue(undefined),
      fetchBooks: vi.fn().mockResolvedValue(undefined),
      fetchTags: vi.fn().mockResolvedValue(undefined),
      fetchCategories: vi.fn().mockResolvedValue(undefined),
      getBlogBySlug: vi.fn().mockReturnValue(undefined),
      getBookBySlug: vi.fn().mockReturnValue(undefined),
      getLatestEntries: vi.fn().mockReturnValue([]),
      getEntriesByTag: vi.fn((tagId) => entries.filter(e => e.tags.includes(tagId))),
      getEntriesByCategory: vi.fn((catId) => entries.filter(e => (e.categories || []).includes(catId))),
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

// Import page components
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

async function mountApp(router, initialRoute = '/') {
  await router.push(initialRoute)
  await router.isReady()

  const i18n = createTestI18n()
  const wrapper = mount(App, {
    global: {
      plugins: [router, i18n],
      stubs: {
        BlogCard: {
          props: ['entry'],
          template: '<div class="blog-card-stub" :data-entry-id="entry.id">{{ entry.title }}</div>'
        }
      }
    }
  })
  await flushPromises()
  await nextTick()
  return wrapper
}

describe('Category Filtering Integration', () => {
  let router

  beforeEach(() => {
    router = createTestRouter()
  })

  describe('Combined category + tag filtering (Requirements 6.1, 6.3)', () => {
    it('shows only entries matching both category=poem AND tag=german', async () => {
      const wrapper = await mountApp(router, '/blog?category=poem&tag=german')

      const cards = wrapper.findAll('.blog-card-stub')
      // Only poem-german-1 and poem-german-2 match both category=poem AND tag=german
      expect(cards.length).toBe(2)
      expect(cards[0].text()).toContain('Frühling')
      expect(cards[1].text()).toContain('Natur')
    })

    it('does not show entries that match only category but not tag', async () => {
      const wrapper = await mountApp(router, '/blog?category=poem&tag=german')

      const cards = wrapper.findAll('.blog-card-stub')
      const titles = cards.map(c => c.text())
      // The Emperor is poem but english, should not appear
      expect(titles).not.toContain('The Emperor')
    })

    it('does not show entries that match only tag but not category', async () => {
      const wrapper = await mountApp(router, '/blog?category=poem&tag=german')

      const cards = wrapper.findAll('.blog-card-stub')
      const titles = cards.map(c => c.text())
      // Magische Spiele is german but shortstory, should not appear
      expect(titles).not.toContain('Magische Spiele')
    })

    it('shows all poem entries when only category=poem is set', async () => {
      const wrapper = await mountApp(router, '/blog?category=poem')

      const cards = wrapper.findAll('.blog-card-stub')
      expect(cards.length).toBe(3) // poem-german-1, poem-german-2, poem-english
    })

    it('shows all german entries when only tag=german is set', async () => {
      const wrapper = await mountApp(router, '/blog?category=&tag=german')

      // Empty category param should be treated as no filter
      const wrapper2 = await mountApp(createTestRouter(), '/blog?tag=german')
      const cards = wrapper2.findAll('.blog-card-stub')
      // poem-german-1, poem-german-2, story-german all have tag=german
      expect(cards.length).toBe(3)
    })
  })

  describe('Filter badges display correctly', () => {
    it('displays category filter badge when category is active', async () => {
      const wrapper = await mountApp(router, '/blog?category=poem')

      const filterBadges = wrapper.findAll('.filter-badge')
      expect(filterBadges.length).toBeGreaterThanOrEqual(1)
      expect(wrapper.text()).toContain('Kategorien')
      expect(wrapper.text()).toContain('Gedicht')
    })

    it('displays tag filter badge when tag is active', async () => {
      const wrapper = await mountApp(router, '/blog?tag=german')

      const filterBadges = wrapper.findAll('.filter-badge')
      expect(filterBadges.length).toBeGreaterThanOrEqual(1)
      expect(wrapper.text()).toContain('Schlagwörter')
      expect(wrapper.text()).toContain('Deutsch')
    })

    it('displays both filter badges when both are active', async () => {
      const wrapper = await mountApp(router, '/blog?category=poem&tag=german')

      const filterBadges = wrapper.findAll('.filter-badge')
      expect(filterBadges.length).toBe(2)
    })

    it('shows entry count with active filter labels', async () => {
      const wrapper = await mountApp(router, '/blog?category=poem&tag=german')

      expect(wrapper.text()).toContain('2')
      expect(wrapper.text()).toContain('Einträge')
      expect(wrapper.text()).toContain('in der Kategorie')
      expect(wrapper.text()).toContain('Gedicht')
      expect(wrapper.text()).toContain('mit dem Tag')
      expect(wrapper.text()).toContain('Deutsch')
    })
  })
})
