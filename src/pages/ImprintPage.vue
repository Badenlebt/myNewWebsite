<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@/composables/useHead'

const { t } = useI18n()
const { setHead } = useHead()

onMounted(() => {
  setHead({
    title: `${t('imprint.title')} – ${t('global.title')}`,
    description: t('imprint.responsible')
  })
})
</script>

<template>
  <main class="imprint-page">
    <article class="imprint-content">
      <h1>{{ t('imprint.title') }}</h1>

      <section class="imprint-section">
        <p class="responsible">{{ t('imprint.responsible') }}</p>
        <address>
          <span v-for="(line, i) in t('imprint.address').split('\n')" :key="i">
            {{ line }}<br v-if="i < t('imprint.address').split('\n').length - 1" />
          </span>
        </address>
        <p class="mail">{{ t('imprint.mail') }}</p>
      </section>

      <section class="imprint-section">
        <h2>{{ t('imprint.whoWeAre') }}</h2>
        <p>{{ t('imprint.whoWeAreText') }}</p>
        <p><a :href="t('imprint.whoWeAreUrl')" target="_blank" rel="noopener">{{ t('imprint.whoWeAreUrl') }}</a></p>
      </section>

      <section class="imprint-section">
        <h2>{{ t('imprint.data') }}</h2>
        <p>{{ t('imprint.dataText') }}</p>
      </section>

      <section class="imprint-section">
        <h2>{{ t('imprint.cookies') }}</h2>
        <p>{{ t('imprint.cookiesText1') }}</p>
        <p>{{ t('imprint.cookiesText2') }}</p>
      </section>

      <section class="imprint-section">
        <h2>{{ t('imprint.otherSites') }}</h2>
        <p>{{ t('imprint.otherSitesText1') }}</p>
        <p>{{ t('imprint.otherSitesText2') }}</p>
      </section>
    </article>
  </main>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.imprint-page {
  max-width: 800px;
  margin: 0 auto;
  padding: $spacing-xl $spacing-md;

  @include respond-to('md') {
    padding: $spacing-xxl $spacing-lg;
  }
}

.imprint-content {
  h1 {
    margin-bottom: $spacing-xl;
    color: $color-white;
    font-size: 2rem;
  }
}

.imprint-section {
  margin-bottom: $spacing-xl;

  h2 {
    margin-bottom: $spacing-sm;
    font-size: 1.3rem;
    color: $color-white;
  }

  p {
    margin-bottom: $spacing-sm;
    line-height: 1.7;
    color: rgba($color-white, 0.85);
  }

  address {
    font-style: normal;
    line-height: 1.7;
    margin-bottom: $spacing-sm;
    color: rgba($color-white, 0.85);
  }

  .responsible {
    font-weight: 600;
    color: $color-white;
  }

  .mail {
    color: rgba($color-white, 0.6);
  }

  a {
    color: $color-purple-light;
    text-decoration: underline;
    @include transition(color);

    &:hover {
      color: color.adjust($color-purple-light, $lightness: 10%);
    }
  }
}
</style>
