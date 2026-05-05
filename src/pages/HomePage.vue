<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContent } from '@/composables/useContent'
import { useHead } from '@/composables/useHead'
import WelcomeSection from '@/components/WelcomeSection.vue'
import HomeBooksSection from '@/components/HomeBooksSection.vue'
import HomeBlogSection from '@/components/HomeBlogSection.vue'

const { t } = useI18n()
const { books, blogEntries, isLoading, error, fetchBlogEntries, fetchBooks } = useContent()
const { setHead } = useHead()

const latestEntries = () => blogEntries.value.slice(0, 3)

onMounted(async () => {
  setHead({
    title: `${t('global.title')} – ${t('global.subtitle')}`,
    description: t('welcome.text').split('\n')[0]
  })
  await Promise.all([fetchBlogEntries(), fetchBooks()])
})
</script>

<template>
  <main class="home-page">
    <WelcomeSection />

    <section v-if="error" class="error-message" aria-live="polite">
      <p>{{ error }}</p>
    </section>

    <template v-if="!isLoading">
      <HomeBooksSection :books="books" />
      <HomeBlogSection :entries="latestEntries()" />
    </template>
  </main>
</template>

<style lang="scss" scoped>
.home-page {
  width: 100%;
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #c0392b;
}
</style>
