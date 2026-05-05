<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguage } from '@/composables/useLanguage'
import { useContent } from '@/composables/useContent'

const { t } = useI18n()
const { currentLanguage } = useLanguage()
const { getTagLabel } = useContent()

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
})

const formattedDate = computed(() => {
  const date = new Date(props.entry.entryDate)
  const locale = currentLanguage.value === 'de' ? 'de-DE' : 'en-US'
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const displayTitle = computed(() => {
  // Use English title if available and language is English, otherwise fallback to German
  return currentLanguage.value === 'en' && props.entry.titleEnglish 
    ? props.entry.titleEnglish 
    : props.entry.title
})

const displayIntro = computed(() => {
  // Use English intro if available and language is English, otherwise fallback to German
  return currentLanguage.value === 'en' && props.entry.introEnglish 
    ? props.entry.introEnglish 
    : props.entry.intro
})
</script>

<template>
  <router-link :to="`/blog/${entry.url}`" class="blog-card">
    <div class="blog-card__image">
      <img :src="`/images/blog/${entry.image}`" :alt="displayTitle" loading="lazy" />
    </div>
    <div class="blog-card__content">
      <h3 class="blog-card__title">{{ displayTitle }}</h3>
      <time class="blog-card__date" :datetime="entry.entryDate">{{ formattedDate }}</time>
      <p class="blog-card__intro">{{ displayIntro }}</p>
      <div class="blog-card__tags" @click.stop>
        <router-link
          v-for="tagId in entry.tags"
          :key="tagId"
          :to="`/blog?tag=${tagId}`"
          class="blog-card__tag-badge"
        >
          {{ getTagLabel(tagId, currentLanguage) }}
        </router-link>
      </div>
      <span class="blog-card__more">{{ t('blog.moreLink') }}</span>
    </div>
  </router-link>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.blog-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: $color-gunmetal;
  border-radius: 10px;
  overflow: hidden;
  background: $color-white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }

  &__image {
    flex-shrink: 0;
    width: 100%;
    height: 200px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;

      .blog-card:hover & {
        transform: scale(1.04);
      }
    }
  }

  &__content {
    flex: 1;
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
  }

  &__title {
    margin: 0 0 $spacing-xs;
    font-size: 1.1rem;
    font-weight: 700;
    color: $color-gunmetal;
    line-height: 1.3;
  }

  &__date {
    font-size: 0.8rem;
    color: $color-purple-medium;
    margin-bottom: $spacing-sm;
  }

  &__intro {
    margin: 0 0 $spacing-md;
    font-size: 0.88rem;
    line-height: 1.6;
    color: color.adjust($color-gunmetal, $lightness: 25%);
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
    margin-bottom: $spacing-sm;
  }

  &__tag-badge {
    display: inline-block;
    background: rgba($color-purple-light, 0.1);
    color: $color-purple-dark;
    border-radius: 1rem;
    padding: 2px $spacing-sm;
    font-size: 0.72rem;
    font-weight: 600;
    text-decoration: none;
    @include transition(background, color);

    &:hover {
      background: $color-purple-dark;
      color: $color-white;
    }
  }

  &__more {
    font-size: 0.85rem;
    font-weight: 600;
    color: $color-purple-dark;
    margin-top: auto;
  }
}
</style>
