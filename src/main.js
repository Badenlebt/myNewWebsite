import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import de from './locale/de.json'
import en from './locale/en.json'
import './scss/main.scss'
import { initMatomo } from './composables/useMatomo'

const savedLanguage = localStorage.getItem('language')
const defaultLocale = (savedLanguage === 'de' || savedLanguage === 'en') ? savedLanguage : 'de'

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'de',
  messages: { de, en }
})

const app = createApp(App)

app.use(router)
app.use(i18n)

app.mount('#app')

// Initialize Matomo tracking
initMatomo()
