<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@/composables/useHead'

const { t } = useI18n()
const { setHead } = useHead()

onMounted(() => {
  setHead({
    title: `${t('aboutMe.title')} – ${t('global.title')}`,
    description: t('aboutMe.text0')
  })
})
</script>

<template>
  <main class="about-page">
    <article class="about-content">
      <h1>{{ t('aboutMe.title') }}</h1>

      <section class="about-section">
        <p>{{ t('aboutMe.text0') }}</p>
        <p v-html="t('aboutMe.text1')"></p>
        <p>{{ t('aboutMe.text2') }} <router-link :to="t('links.albertAmeiseUrl')">{{ t('links.albertAmeise') }}</router-link></p>
        <p>{{ t('aboutMe.text3') }} <router-link :to="t('links.keinhornUrl')">{{ t('links.keinhorn') }}</router-link></p>
        <p>{{ t('aboutMe.text4') }}</p>
      </section>
    </article>
  </main>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.about-page {
  max-width: 800px;
  margin: 0 auto;
  padding: $spacing-xl $spacing-md;

  @include respond-to('md') {
    padding: $spacing-xxl $spacing-lg;
  }
}

.about-content {
  h1 {
    margin-bottom: $spacing-xl;
    color: $color-white;
    font-size: 2rem;
  }
}

.about-section {
  margin-bottom: $spacing-xl;

  p {
    margin-bottom: $spacing-sm;
    line-height: 1.7;
    color: rgba($color-white, 0.85);
  }

  a,
  :deep(a) {
    color: $color-purple-light;
    text-decoration: underline;
    @include transition(color);

    &:hover {
      color: color.adjust($color-purple-light, $lightness: 10%);
    }
  }
}
</style>
