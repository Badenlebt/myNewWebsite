import { createRouter, createWebHistory } from 'vue-router'
import { trackPageView } from '@/composables/useMatomo'

const HomePage = () => import('@/pages/HomePage.vue')
const BlogPage = () => import('@/pages/BlogPage.vue')
const BlogEntryPage = () => import('@/pages/BlogEntryPage.vue')
const BookDetailPage = () => import('@/pages/BookDetailPage.vue')
const AboutMePage = () => import('@/pages/AboutMePage.vue')
const ImprintPage = () => import('@/pages/ImprintPage.vue')
const NotFoundPage = () => import('@/pages/NotFoundPage.vue')

const routes = [
  { path: '/', component: HomePage },
  { path: '/home', redirect: '/' },
  { path: '/start', redirect: '/' },
  { path: '/blog', component: BlogPage },
  { path: '/blog/:slug', component: BlogEntryPage },
  { path: '/books/:slug', component: BookDetailPage },
  { path: '/buecher/:slug', component: BookDetailPage },
  { path: '/ueber-mich', component: AboutMePage },
  { path: '/about-me', component: AboutMePage },
  { path: '/impressum', component: ImprintPage },
  { path: '/imprint', component: ImprintPage },
  { path: '/:pathMatch(.*)*', component: NotFoundPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Track page views on route changes
router.afterEach((to) => {
  // Use nextTick to ensure the page title is updated
  setTimeout(() => {
    const pageTitle = document.title
    const pageUrl = window.location.origin + to.fullPath
    trackPageView(pageTitle, pageUrl)
  }, 100)
})

export default router
