/**
 * Unit tests for AboutMePage component.
 * Verifies renders biographical content, sets head title.
 *
 * Validates: Requirements 10.3, 10.4
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'

const mockSetHead = vi.fn()

vi.mock('@/composables/useHead', () => ({
  useHead: () => ({ setHead: mockSetHead })
}))

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: { value: 'de' },
    switchLanguage: vi.fn()
  })
}))

import AboutMePage from '@/pages/AboutMePage.vue'

const deMessages = {
  global: { title: 'Michael Hitzelberger' },
  aboutMe: {
    title: 'Über mich',
    text0: 'Ich bin Diplom-Informatiker (Bioinformatik), wohne mit meiner Familie in Aglasterhausen und arbeite bei der DB Cargo AG als Manager IT Development.',
    text1: 'In meiner Freizeit schreibe ich Gedichte und Geschichten.',
    text2: 'Für meine Töchter habe ich Gute-Nacht-Geschichten über Albert Ameise erfunden.',
    text3: 'Hier auf der Seite werde ich daneben auch zu verschiedenen anderen Themen Beiträge veröffentlichen.'
  },
  links: {
    keinhornUrl: '/buecher/keinhorn',
    keinhorn: 'Das Keinhorn'
  }
}

const enMessages = {
  global: { title: 'Michael Hitzelberger' },
  aboutMe: {
    title: 'About me',
    text0: 'I am a computer scientist (bioinformatics), living with my family in Aglasterhausen.',
    text1: 'In my free time I write poems and stories.',
    text2: 'For my daughters I invented bedtime stories about Albert the Ant.',
    text3: 'On this site I will also publish posts on various other topics.'
  },
  links: {
    keinhornUrl: '/books/keinhorn',
    keinhorn: 'Das Keinhorn'
  }
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/ueber-mich', component: AboutMePage },
      { path: '/about-me', component: AboutMePage }
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

async function mountAboutMe(locale = 'de') {
  const router = createTestRouter()
  await router.push('/ueber-mich')
  await router.isReady()

  const i18n = createTestI18n(locale)

  const wrapper = mount(AboutMePage, {
    global: {
      plugins: [router, i18n]
    }
  })
  await flushPromises()
  return { wrapper, router }
}

describe('AboutMePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Content rendering', () => {
    it('renders the aboutMe.title heading', async () => {
      const { wrapper } = await mountAboutMe('de')
      expect(wrapper.find('h1').text()).toBe('Über mich')
    })

    it('renders text0 content (biographical info)', async () => {
      const { wrapper } = await mountAboutMe('de')
      expect(wrapper.text()).toContain('Ich bin Diplom-Informatiker (Bioinformatik)')
    })

    it('renders text1 content', async () => {
      const { wrapper } = await mountAboutMe('de')
      expect(wrapper.text()).toContain('In meiner Freizeit schreibe ich Gedichte und Geschichten')
    })

    it('renders text2 content', async () => {
      const { wrapper } = await mountAboutMe('de')
      expect(wrapper.text()).toContain('Für meine Töchter habe ich Gute-Nacht-Geschichten über Albert Ameise erfunden')
    })

    it('renders text3 content', async () => {
      const { wrapper } = await mountAboutMe('de')
      expect(wrapper.text()).toContain('Hier auf der Seite werde ich daneben auch zu verschiedenen anderen Themen')
    })
  })

  describe('Head management', () => {
    it('calls setHead with title containing "Über mich"', async () => {
      await mountAboutMe('de')
      expect(mockSetHead).toHaveBeenCalled()
      const callArg = mockSetHead.mock.calls[0][0]
      expect(callArg.title).toContain('Über mich')
    })

    it('calls setHead with title containing global title', async () => {
      await mountAboutMe('de')
      const callArg = mockSetHead.mock.calls[0][0]
      expect(callArg.title).toContain('Michael Hitzelberger')
    })

    it('calls setHead with description from text0', async () => {
      await mountAboutMe('de')
      const callArg = mockSetHead.mock.calls[0][0]
      expect(callArg.description).toContain('Diplom-Informatiker')
    })
  })

  describe('Semantic HTML', () => {
    it('uses <main> element', async () => {
      const { wrapper } = await mountAboutMe('de')
      expect(wrapper.find('main').exists()).toBe(true)
    })

    it('uses <article> element', async () => {
      const { wrapper } = await mountAboutMe('de')
      expect(wrapper.find('article').exists()).toBe(true)
    })
  })
})
