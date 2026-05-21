<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useContent } from '@/composables/useContent'
import { useHead } from '@/composables/useHead'
import { useLanguage } from '@/composables/useLanguage'
import BlogCard from '@/components/BlogCard.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { blogEntries, tags, categories, isLoading, error, fetchBlogEntries, fetchTags, fetchCategories, getEntriesByTag, getEntriesByCategory, getTagLabel, getCategoryLabel } = useContent()
const { setHead } = useHead()
const { currentLanguage } = useLanguage()

const activeTag = ref(route.query.tag || null)
const activeCategory = ref(route.query.category || null)

// Watch for query param changes
watch(() => route.query.tag, (newTag) => {
  activeTag.value = newTag || null
})

watch(() => route.query.category, (newCategory) => {
  activeCategory.value = newCategory || null
})

const filteredEntries = computed(() => {
  let entries = blogEntries.value

  if (activeCategory.value) {
    entries = entries.filter(entry => (entry.categories || []).includes(activeCategory.value))
  }

  if (activeTag.value) {
    entries = entries.filter(entry => entry.tags.includes(activeTag.value))
  }

  return entries.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
})

function toggleTag(tagId) {
  const newTag = activeTag.value === tagId ? undefined : tagId
  router.push({ query: { ...route.query, tag: newTag } })
}

function toggleCategory(categoryId) {
  const newCategory = activeCategory.value === categoryId ? undefined : categoryId
  router.push({ query: { ...route.query, category: newCategory } })
}

function clearCategory() {
  router.push({ query: { ...route.query, category: undefined } })
}

function clearTag() {
  router.push({ query: { ...route.query, tag: undefined } })
}

onMounted(async () => {
  setHead({
    title: `${t('blog.title')} – ${t('global.title')}`,
    description: t('blog.title')
  })
  await Promise.all([fetchBlogEntries(), fetchTags(), fetchCategories()])
})
</script>

<template>
  <main class="blog-page">
    <section class="blog-header">
      <h1>{{ t('blog.title') }}</h1>
      <p class="entry-count">
        {{ filteredEntries.length }} {{ t('blog.count') }}
        <span v-if="activeCategory">
          {{ t('blog.categoryChosen') }}
          <strong>{{ getCategoryLabel(activeCategory, currentLanguage) }}</strong>
        </span>
        <span v-if="activeTag">
          {{ t('blog.tagChosen') }}
          <strong>{{ getTagLabel(activeTag, currentLanguage) }}</strong>
        </span>
      </p>
    </section>

    <section v-if="activeCategory || activeTag" class="active-filters" aria-label="Active filters">
      <span class="filters-label">Filter:</span>
      <button
        v-if="activeCategory"
        class="filter-badge"
        @click="clearCategory"
        :aria-label="`${t('blog.categories')}: ${getCategoryLabel(activeCategory, currentLanguage)} entfernen`"
      >
        {{ t('blog.categories') }}: {{ getCategoryLabel(activeCategory, currentLanguage) }} ✕
      </button>
      <button
        v-if="activeTag"
        class="filter-badge"
        @click="clearTag"
        :aria-label="`${t('blog.tags')}: ${getTagLabel(activeTag, currentLanguage)} entfernen`"
      >
        {{ t('blog.tags') }}: {{ getTagLabel(activeTag, currentLanguage) }} ✕
      </button>
    </section>

    <section class="blog-categories" aria-label="Categories">
      <span class="categories-label">{{ t('blog.categories') }}:</span>
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="category-button"
        :class="{ active: activeCategory === cat.id }"
        @click="toggleCategory(cat.id)"
        :aria-pressed="activeCategory === cat.id"
      >
        {{ cat[currentLanguage] || cat.de }}
      </button>
    </section>

    <section class="blog-tags" aria-label="Tags">
      <span class="tags-label">{{ t('blog.tags') }}:</span>
      <button
        v-for="tag in tags"
        :key="tag.id"
        class="tag-button"
        :class="{ active: activeTag === tag.id }"
        @click="toggleTag(tag.id)"
        :aria-pressed="activeTag === tag.id"
      >
        {{ tag[currentLanguage] || tag.de }}
      </button>
    </section>

    <section v-if="error" class="error-message" aria-live="polite">
      <p>{{ error }}</p>
    </section>

    <section v-if="!isLoading" class="blog-list" aria-label="Blog entries">
      <BlogCard
        v-for="entry in filteredEntries"
        :key="entry.id"
        :entry="entry"
      />
    </section>
  </main>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.blog-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: $spacing-xl $spacing-md;

  @include respond-to('md') {
    padding: $spacing-xxl $spacing-lg;
  }
}

.blog-header {
  margin-bottom: $spacing-lg;

  h1 {
    margin-bottom: $spacing-xs;
    color: $color-white;
    font-size: 2rem;
  }

  .entry-count {
    color: rgba($color-white, 0.7);
    font-size: 0.95rem;

    strong {
      color: $color-purple-light;
    }
  }
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;

  .filters-label {
    font-weight: 600;
    color: rgba($color-white, 0.8);
    font-size: 0.9rem;
  }

  .filter-badge {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    background: $color-purple-medium;
    border: 1px solid $color-purple-medium;
    border-radius: 1rem;
    padding: $spacing-xs $spacing-md;
    font-size: 0.85rem;
    font-family: inherit;
    color: $color-white;
    cursor: pointer;
    @include transition(background-color, border-color);

    &:hover {
      background: rgba($color-purple-medium, 0.7);
      border-color: rgba($color-purple-light, 0.5);
    }
  }
}

.blog-categories {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
  padding: $spacing-md;
  background: rgba($color-white, 0.04);
  border-radius: 8px;
  border: 1px solid rgba($color-white, 0.08);

  .categories-label {
    font-weight: 600;
    margin-right: $spacing-xs;
    color: rgba($color-white, 0.8);
    font-size: 0.9rem;
  }

  .category-button {
    background: rgba($color-white, 0.08);
    border: 1px solid rgba($color-white, 0.12);
    border-radius: 1rem;
    padding: $spacing-xs $spacing-md;
    font-size: 0.85rem;
    font-family: inherit;
    color: rgba($color-white, 0.85);
    cursor: pointer;
    @include transition(background-color, color, border-color);

    &:hover {
      background: rgba($color-purple-light, 0.15);
      border-color: rgba($color-purple-light, 0.3);
      color: $color-white;
    }

    &.active {
      background: $color-purple-medium;
      color: $color-white;
      border-color: $color-purple-medium;
    }
  }
}

.blog-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-xl;
  padding: $spacing-md;
  background: rgba($color-white, 0.04);
  border-radius: 8px;
  border: 1px solid rgba($color-white, 0.08);

  .tags-label {
    font-weight: 600;
    margin-right: $spacing-xs;
    color: rgba($color-white, 0.8);
    font-size: 0.9rem;
  }

  .tag-button {
    background: rgba($color-white, 0.08);
    border: 1px solid rgba($color-white, 0.12);
    border-radius: 1rem;
    padding: $spacing-xs $spacing-md;
    font-size: 0.85rem;
    font-family: inherit;
    color: rgba($color-white, 0.85);
    cursor: pointer;
    @include transition(background-color, color, border-color);

    &:hover {
      background: rgba($color-purple-light, 0.15);
      border-color: rgba($color-purple-light, 0.3);
      color: $color-white;
    }

    &.active {
      background: $color-purple-medium;
      color: $color-white;
      border-color: $color-purple-medium;
    }
  }
}

.blog-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.error-message {
  text-align: center;
  padding: $spacing-xl;
  color: #e74c3c;
  background: rgba(#e74c3c, 0.08);
  border-radius: 8px;
}
</style>
