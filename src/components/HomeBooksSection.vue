<script setup>
import { useI18n } from 'vue-i18n'
import { useLanguage } from '../composables/useLanguage'

const { t } = useI18n()
const { currentLanguage } = useLanguage()

const props = defineProps({
  books: {
    type: Array,
    default: () => []
  }
})

function getBookUrl(book) {
  if (currentLanguage.value === 'de') {
    return `/buecher/${book.url}`
  }
  return `/books/${book.url}`
}
</script>

<template>
  <section class="home-books-section">
    <div class="home-books-section__container">
      <h2 class="home-books-section__title">{{ t('books.homeTitle') }}</h2>
      <p class="home-books-section__intro">{{ t('books.homeIntro') }}</p>

      <div class="home-books-section__grid">
        <router-link
          v-for="book in books"
          :key="book.id"
          :to="getBookUrl(book)"
          class="book-card"
        >
          <img
            class="book-card__image"
            :src="`/images/books/${book.image}`"
            :alt="book.title"
            loading="lazy"
          />
          <span v-if="book.imageRight" class="book-card__credit">{{ book.imageRight }}</span>
          <div class="book-card__content">
            <h3 class="book-card__title">{{ book.title }}</h3>
            <div class="book-card__description" v-html="book.description"></div>
            <span class="book-card__link">{{ t('books.moreLink') }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../scss/variables' as *;
@use '../scss/mixins' as *;

.home-books-section {
  padding: $spacing-xxl $spacing-md;
  background-color: $color-gunmetal;
  color: $color-white;

  @include respond-to('md') {
    padding: $spacing-xxl $spacing-lg;
  }

  &__container {
    max-width: $breakpoint-xl;
    margin: 0 auto;
  }

  &__title {
    text-align: center;
    margin-bottom: $spacing-md;
    color: $color-white;
    font-size: 1.8rem;

    @include respond-to('md') {
      font-size: 2rem;
    }
  }

  &__intro {
    text-align: center;
    margin-bottom: $spacing-xl;
    color: rgba($color-white, 0.85);
    font-size: 1.05rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-xl;

    @include respond-to('sm') {
      grid-template-columns: repeat(2, 1fr);
    }

    @include respond-to('lg') {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

.book-card {
  text-decoration: none;
  color: $color-white;
  background: rgba($color-white, 0.04);
  border: 1px solid rgba($color-white, 0.08);
  border-radius: 10px;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.3s ease,
              box-shadow 0.3s ease,
              border-color 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    background: rgba($color-white, 0.08);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
    border-color: rgba($color-purple-light, 0.3);
  }

  &__image {
    height: 200px;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    display: block;
    margin-bottom: $spacing-xs;
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;

    .book-card:hover & {
      transform: scale(1.03);
    }
  }

  &__credit {
    display: block;
    font-size: 0.65rem;
    color: rgba($color-white, 0.4);
    margin-bottom: $spacing-lg;
    font-style: italic;
  }

  &__content {
    text-align: center;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__title {
    margin-bottom: $spacing-md;
    color: $color-white;
    font-size: 1.2rem;
  }

  &__description {
    margin-bottom: $spacing-md;
    font-size: 0.9rem;
    line-height: 1.6;
    color: rgba($color-white, 0.75);
    flex: 1;

    :deep(a) {
      color: $color-purple-light;
      text-decoration: underline;
    }

    :deep(.divider) {
      display: block;
      width: 25%;
      height: 3px;
      background: currentColor;
      border-radius: 2px;
      margin: 1.5rem auto;
      opacity: 0.4;
    }
  }

  &__link {
    display: inline-block;
    margin-top: auto;
    padding-top: $spacing-sm;
    color: $color-purple-light;
    font-weight: 600;
    font-size: 0.9rem;
    @include transition(color);

    .book-card:hover & {
      color: color.adjust($color-purple-light, $lightness: 10%);
    }
  }
}
</style>
