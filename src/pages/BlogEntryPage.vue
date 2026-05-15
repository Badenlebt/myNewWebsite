<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useContent } from '@/composables/useContent'
import { useHead } from '@/composables/useHead'
import { useLanguage } from '@/composables/useLanguage'

const route = useRoute()
const { t } = useI18n()
const { blogEntries, tags, categories, fetchBlogEntries, fetchTags, fetchCategories, getBlogBySlug, getTagLabel, getCategoryLabel } = useContent()
const { setHead } = useHead()
const { currentLanguage } = useLanguage()

const entry = computed(() => getBlogBySlug(route.params.slug))

const displayTitle = computed(() => {
  if (!entry.value) return ''
  // Use English title if available and language is English, otherwise fallback to German
  return currentLanguage.value === 'en' && entry.value.titleEnglish 
    ? entry.value.titleEnglish 
    : entry.value.title
})

const displayText = computed(() => {
  if (!entry.value) return ''
  // Use English text if available and language is English, otherwise fallback to German
  return currentLanguage.value === 'en' && entry.value.textEnglish 
    ? entry.value.textEnglish 
    : entry.value.text
})

const displayIntro = computed(() => {
  if (!entry.value) return ''
  // Use English intro if available and language is English, otherwise fallback to German
  return currentLanguage.value === 'en' && entry.value.introEnglish 
    ? entry.value.introEnglish 
    : entry.value.intro
})

function formatText(text, type) {
  if (type === 'text') return text
  // For poems, convert \n to <br>
  return text.replace(/\n/g, '<br>')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const locale = currentLanguage.value === 'de' ? 'de-DE' : 'en-US'
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
}

function updateHead() {
  if (entry.value) {
    setHead({
      title: `${displayTitle.value} – ${t('global.title')}`,
      description: displayIntro.value.replace(/\n/g, ' '),
      ogImage: `/images/blog/${entry.value.image}`,
      ogType: 'article'
    })
  } else {
    setHead({
      title: `${t('blog.notFound')} – ${t('global.title')}`,
      description: t('blog.notFoundText')
    })
  }
}

onMounted(async () => {
  await Promise.all([fetchBlogEntries(), fetchTags(), fetchCategories()])
  updateHead()
})

watch(() => route.params.slug, () => {
  updateHead()
})
</script>

<template>
  <main class="blog-entry-page">
    <article v-if="entry" :class="['blog-entry', `type-${entry.type}`]">
      <figure v-if="entry.image" class="entry-image">
        <img
          :src="`/images/blog/${entry.image}`"
          :alt="displayTitle"
          loading="lazy"
        />
      </figure>

      <header class="entry-header">
        <h1>{{ displayTitle }}</h1>
        <time :datetime="entry.entryDate" class="entry-date">{{ formatDate(entry.entryDate) }}</time>
      </header>

      <div
        class="entry-text"
        :class="{ poem: entry.type === 'poem', prose: entry.type === 'text' }"
        v-html="formatText(displayText, entry.type)"
      ></div>

      <p class="entry-copyright">© Michael Hitzelberger, {{ formatDate(entry.date) }}</p>

      <div v-if="entry.imageRight" class="entry-image-credit">
        <span>{{ currentLanguage === 'en' ? 'Image: ' : 'Bild: ' }}</span><span v-html="entry.imageRight"></span>
      </div>

      <footer class="entry-meta">
        <div v-if="entry.categories && entry.categories.length" class="meta-section">
          <span class="meta-label">{{ t('blog.categories') }}</span>
          <div class="meta-badges">
            <router-link
              v-for="catId in entry.categories"
              :key="catId"
              :to="`/blog?category=${catId}`"
              class="tag-badge"
            >
              {{ getCategoryLabel(catId, currentLanguage) }}
            </router-link>
          </div>
        </div>

        <div v-if="entry.tags && entry.tags.length" class="meta-section">
          <span class="meta-label">{{ t('blog.tags') }}</span>
          <div class="meta-badges">
            <router-link
              v-for="tagId in entry.tags"
              :key="tagId"
              :to="`/blog?tag=${tagId}`"
              class="tag-badge"
            >
              {{ getTagLabel(tagId, currentLanguage) }}
            </router-link>
          </div>
        </div>
      </footer>
    </article>

    <section v-else-if="blogEntries.length > 0" class="not-found">
      <h1>{{ t('blog.notFound') }}</h1>
      <p>{{ t('blog.notFoundText') }}</p>
      <p>
        {{ t('blog.lookHere') }}
        <router-link to="/blog">{{ t('blog.title') }}</router-link>
      </p>
    </section>
  </main>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.blog-entry-page {
  max-width: 800px;
  margin: 0 auto;
  padding: $spacing-xl $spacing-md;

  @include respond-to('md') {
    padding: $spacing-xxl $spacing-lg;
  }
}

.entry-header {
  position: relative;
  z-index: 1;
  margin-top: -40px;
  margin-bottom: $spacing-lg;
  background: $color-white;
  border-radius: 8px 8px 0 0;
  padding: $spacing-xl $spacing-lg $spacing-md;
  text-align: left;

  h1 {
    margin-bottom: $spacing-xs;
    color: $color-gunmetal;
    font-size: 2rem;

    @include respond-to('md') {
      font-size: 2.4rem;
    }
  }

  .entry-date {
    color: $color-purple-dark;
    font-size: 0.9rem;
    display: block;
    text-align: left;
    font-style: italic;
  }
}

.entry-image {
  margin: 0 0 $spacing-lg 0;
  position: relative;
  z-index: 0;
  width: 100vw;
  max-width: $breakpoint-xl;
  left: 50%;
  transform: translateX(-50%);

  img {
    width: 100%;
    height: 30vh;
    object-fit: cover;
    display: block;

    @include respond-to('md') {
      height: 30vh;
    }
  }

  figcaption {
    margin-top: $spacing-sm;
    font-size: 0.8rem;
    color: rgba($color-white, 0.5);
    padding: 0 $spacing-md;
  }
}

.entry-text {
  line-height: 1.9;
  margin-top: $spacing-xxl;
  margin-bottom: $spacing-xxl;
  color: rgba($color-white, 0.9);
  font-size: 1.05rem;

  &.poem {
    white-space: pre-line;
    font-size: 1.1rem;
    margin-left: 2rem;

    @include respond-to('md') {
      margin-left: 6rem;
    }
  }

  &.prose {
    text-align: justify;

    :deep(p) {
      text-indent: 1.5em;

      &:first-child {
        text-indent: 0;
      }
      
      &.space-before {
        margin-top: 1em;
        text-indent: 0;
      }

      &.paragraph-divider {
        text-align: center;
      }
    }
  }
}

.entry-copyright {
  text-align: right;
  font-style: italic;
  font-size: 0.9rem;
  color: rgba($color-white, 0.6);
  margin-bottom: $spacing-md;
}

.entry-image-credit {
  font-size: 0.8rem;
  font-style: italic;
  color: rgba($color-white, 0.5);
  margin-bottom: $spacing-xl;

  :deep(a) {
    color: rgba($color-white, 0.6);
    text-decoration: underline;
  }
}

.entry-meta {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-md;
  padding-top: $spacing-lg;
  border-top: 1px solid rgba($color-white, 0.1);

  @include respond-to('md') {
    grid-template-columns: 1fr 1fr;
    gap: $spacing-xl;
  }

  .meta-section {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    align-items: center;
    text-align: center;
  }

  .meta-label {
    font-size: 0.8rem;
    color: rgba($color-white, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .meta-badges {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    justify-content: center;
  }

  .tag-badge {
    background: rgba($color-purple-light, 0.1);
    border: 1px solid rgba($color-purple-light, 0.2);
    border-radius: 1rem;
    padding: $spacing-xs $spacing-md;
    font-size: 0.85rem;
    text-decoration: none;
    color: $color-purple-light;
    @include transition(background-color, color, border-color);

    &:hover {
      background: $color-purple-medium;
      border-color: $color-purple-medium;
      color: $color-white;
    }
  }
}

.not-found {
  text-align: center;
  padding: $spacing-xxl $spacing-md;
  color: $color-white;

  h1 {
    margin-bottom: $spacing-md;
    color: $color-white;
  }

  p {
    color: rgba($color-white, 0.7);
    margin-bottom: $spacing-sm;
  }

  a {
    color: $color-purple-light;
    text-decoration: underline;
  }
}
</style>
