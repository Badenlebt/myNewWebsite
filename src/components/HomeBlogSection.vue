<script setup>
import { useI18n } from 'vue-i18n'
import BlogCard from '@/components/BlogCard.vue'

const { t } = useI18n()

defineProps({
  entries: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <section class="home-blog-section">
    <div class="home-blog-section__container">
      <h2 class="home-blog-section__title">{{ t('blog.homeTitle') }}</h2>

      <div class="home-blog-section__list">
        <BlogCard
          v-for="entry in entries"
          :key="entry.id"
          :entry="entry"
        />
      </div>

      <div class="home-blog-section__view-all">
        <router-link to="/blog" class="home-blog-section__link">
          {{ t('blog.allEntries') }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.home-blog-section {
  padding: $spacing-xxl $spacing-md;
  background-color: $color-white;

  @include respond-to('md') {
    padding: $spacing-xxl $spacing-lg;
  }

  &__container {
    max-width: $breakpoint-xl;
    margin: 0 auto;
  }

  &__title {
    text-align: center;
    margin-bottom: $spacing-xl;
    color: $color-gunmetal;
    font-size: 1.8rem;

    @include respond-to('md') {
      font-size: 2rem;
    }
  }

  &__list {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-lg;

    @include respond-to('sm') {
      grid-template-columns: repeat(2, 1fr);
    }

    @include respond-to('lg') {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__view-all {
    text-align: center;
    margin-top: $spacing-xl;
  }

  &__link {
    display: inline-block;
    color: $color-white;
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    padding: $spacing-sm $spacing-xl;
    border-radius: 6px;
    background-color: $color-purple-medium;
    @include transition(background-color, transform);

    &:hover {
      background-color: $color-purple-dark;
      transform: translateY(-2px);
      color: $color-white;
    }
  }
}
</style>
