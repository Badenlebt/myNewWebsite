<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContent } from '@/composables/useContent.js'
import { useLanguage } from '@/composables/useLanguage.js'
import instagramIcon from '@/assets/svg/instagram-light.svg'
import facebookIcon from '@/assets/svg/facebook-light.svg'

const { t } = useI18n()
const { tags, categories, fetchTags, fetchCategories, getCategoryLabel, getTagLabel } = useContent()
const { currentLanguage } = useLanguage()

onMounted(() => {
  fetchTags()
  fetchCategories()
})
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <!-- More Links / Imprint -->
      <div class="footer__column">
        <strong class="footer__title">{{ t('global.moreLinks') }}</strong>
        <ul class="footer__list">
          <li>
            <router-link :to="t('links.imprintUrl')" class="footer__link">
              {{ t('links.imprint') }}
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Kategorien -->
      <div class="footer__column">
        <strong class="footer__title">{{ t('blog.categories') }}</strong>
        <ul class="footer__list">
          <li v-for="cat in categories" :key="cat.id">
            <router-link
              :to="`/blog?category=${cat.id}`"
              class="footer__link"
            >
              {{ getCategoryLabel(cat.id, currentLanguage) }}
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Schlagwörter -->
      <div class="footer__column">
        <strong class="footer__title">{{ t('blog.tags') }}</strong>
        <ul class="footer__list">
          <li v-for="tag in tags" :key="tag.id">
            <router-link
              :to="`/blog?tag=${tag.id}`"
              class="footer__link"
            >
              {{ getTagLabel(tag.id, currentLanguage) }}
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Social Media -->
      <div class="footer__column">
        <strong class="footer__title">{{ t('global.social') }}</strong>
        <div class="footer__social">
          <a
            href="https://www.instagram.com/michael.hitzelberger/"
            target="_blank"
            rel="noopener noreferrer"
            class="footer__social-link"
          >
            <img :src="instagramIcon" alt="Instagram" class="footer__social-icon" />
          </a>
          <a
            href="https://www.facebook.com/michael.hitzelberger/"
            target="_blank"
            rel="noopener noreferrer"
            class="footer__social-link"
          >
            <img :src="facebookIcon" alt="Facebook" class="footer__social-icon" />
          </a>
        </div>
      </div>

    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.footer {
  background-color: color.adjust($color-gunmetal, $lightness: -3%);
  padding: $spacing-xxl $spacing-lg;
  margin-top: 0;
  border-top: 1px solid rgba($color-white, 0.06);

  &__container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-xl;
    max-width: $breakpoint-xl;
    margin: 0 auto;

    @include respond-to('md') {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__column {
    display: flex;
    flex-direction: column;
  }

  &__title {
    color: $color-white;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: $spacing-md;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__link {
    color: rgba($color-white, 0.6);
    text-decoration: none;
    font-size: 0.9rem;
    @include transition(color);

    &:hover {
      color: $color-purple-light;
    }
  }

  &__social {
    display: flex;
    gap: $spacing-md;
  }

  &__social-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba($color-white, 0.06);
    @include transition(background-color, transform);

    &:hover {
      background: rgba($color-purple-light, 0.15);
      transform: scale(1.1);
    }
  }

  &__social-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
