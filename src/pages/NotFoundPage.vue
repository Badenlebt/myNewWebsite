<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@/composables/useHead'

const { t } = useI18n()
const { setHead } = useHead()

onMounted(() => {
  setHead({
    title: `${t('notFound.title')} – ${t('global.title')}`,
    description: t('notFound.text')
  })
})
</script>

<template>
  <main class="not-found-page">
    <section class="not-found-content">
      <h1>{{ t('notFound.title') }}</h1>
      <p>{{ t('notFound.text') }}</p>
      <p>
        {{ t('notFound.toStartpage') }}
        <router-link to="/">{{ t('links.start') }}</router-link>
      </p>
    </section>
  </main>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: $spacing-xl $spacing-md;
}

.not-found-content {
  text-align: center;

  h1 {
    font-size: 2.5rem;
    margin-bottom: $spacing-md;
    color: $color-white;
  }

  p {
    margin-bottom: $spacing-sm;
    font-size: 1.1rem;
    color: rgba($color-white, 0.7);
  }

  a {
    color: $color-purple-light;
    text-decoration: underline;
    font-weight: 600;
    @include transition(color);

    &:hover {
      color: color.adjust($color-purple-light, $lightness: 10%);
    }
  }
}
</style>
