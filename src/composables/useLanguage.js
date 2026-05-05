import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const ALLOWED_LANGUAGES = ['de', 'en']
const STORAGE_KEY = 'language'

function getInitialLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (ALLOWED_LANGUAGES.includes(stored)) {
    return stored
  }
  return 'de'
}

const currentLanguage = ref(getInitialLanguage())

export function useLanguage() {
  const { locale } = useI18n()

  // Sync on first use in case locale drifted
  locale.value = currentLanguage.value

  function switchLanguage(lang) {
    if (!ALLOWED_LANGUAGES.includes(lang)) return
    currentLanguage.value = lang
    locale.value = lang
    localStorage.setItem(STORAGE_KEY, lang)
  }

  return {
    currentLanguage,
    switchLanguage
  }
}
