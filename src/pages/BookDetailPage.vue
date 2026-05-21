<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useContent } from '@/composables/useContent'
import { useHead } from '@/composables/useHead'
import { useStructuredData, generateBookSchema, generateBreadcrumbSchema } from '@/composables/useStructuredData'

const route = useRoute()
const { t } = useI18n()
const { books, fetchBooks, getBookBySlug } = useContent()
const { setHead } = useHead()

const book = computed(() => getBookBySlug(route.params.slug))

function formatQuote(quote, type) {
  if (type === 'poem') {
    return quote.replace(/\n/g, '<br>')
  }
  // For prose type, wrap paragraphs
  return quote.split('\n').map(p => `<p>${p}</p>`).join('')
}

function getShopUrl(shop) {
  if (!shop) return '#'
  if (shop.provider === 'bod') {
    return `https://www.bod.de/buchshop/${shop.key}`
  }
  return '#'
}

function updateHead() {
  if (book.value) {
    const title = book.value.subtitle
      ? `${book.value.title} – ${book.value.subtitle}`
      : book.value.title
    setHead({
      title: `${title} – ${t('global.title')}`,
      description: book.value.description.replace(/<[^>]*>/g, '').slice(0, 160),
      ogImage: `/images/books/${book.value.image}`
    })
    
    // Add structured data for book
    useStructuredData(generateBookSchema(book.value))
    
    // Add breadcrumb structured data
    useStructuredData(generateBreadcrumbSchema([
      { name: 'Home', url: 'https://mhitzelberger.de/' },
      { name: 'Bücher', url: 'https://mhitzelberger.de/#books' },
      { name: title, url: `https://mhitzelberger.de/books/${book.value.url}` }
    ]))
  } else {
    setHead({
      title: `${t('books.notFound')} – ${t('global.title')}`,
      description: t('books.notFoundText')
    })
  }
}

onMounted(async () => {
  await fetchBooks()
  updateHead()
})

watch(() => route.params.slug, () => {
  updateHead()
})
</script>

<template>
  <main class="book-detail-page">
    <article v-if="book" class="book-detail">
      <header class="book-header">
        <h1>{{ book.title }}</h1>
        <p v-if="book.subtitle" class="book-subtitle">{{ book.subtitle }}</p>
      </header>

      <section v-if="book.quote" class="book-quote" :class="{ poem: book.type === 'poem', prose: book.type === 'text' }">
        <blockquote v-html="formatQuote(book.quote, book.type)"></blockquote>
      </section>

      <div class="book-content">
        <figure class="book-cover">
          <img
            :src="`/images/books/${book.image}`"
            :alt="book.title"
            loading="lazy"
          />
          <figcaption v-if="book.imageRight">{{ book.imageRight }}</figcaption>
        </figure>

        <div class="book-description" v-html="book.descriptionLong"></div>
      </div>

      <section v-if="book.hasShopLinks && book.shop" id="shoplinks" class="book-shop">
        <h2>{{ t('books.shopTitle') }}</h2>

        <!-- BoD ShopWidget via iframe -->
        <div v-if="book.shop.provider === 'bod'" class="shop-widgets">
          <div v-for="shopType in book.shop.types" :key="shopType" class="shop-widget-container">
            <iframe
              :src="`/bod-widget.html?key=${book.shop.key}&swKey=${book.shop.swKey}&type=${shopType}`"
              class="bod-widget-iframe"
              frameborder="0"
              scrolling="no"
            ></iframe>
          </div>
        </div>

        <!-- Explicit links (e.g. epubli) -->
        <div v-else-if="book.shop.links" class="shop-links">
          <a
            v-for="link in book.shop.links"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="shop-link"
          >
            {{ link.label }}
          </a>
        </div>
      </section>
    </article>

    <section v-else-if="books.length > 0" class="not-found">
      <h1>{{ t('books.notFound') }}</h1>
      <p>{{ t('books.notFoundText') }}</p>
      <p>{{ t('books.lookHere') }}</p>
      <ul>
        <li v-for="b in books" :key="b.id">
          <router-link :to="`/books/${b.url}`">{{ b.title }}</router-link>
        </li>
      </ul>
    </section>
  </main>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.book-detail-page {
  max-width: 960px;
  margin: 0 auto;
  padding: $spacing-xl $spacing-md;

  @include respond-to('md') {
    padding: $spacing-xxl $spacing-lg;
  }
}

.book-header {
  margin-bottom: $spacing-xl;
  text-align: center;

  h1 {
    margin-bottom: $spacing-xs;
    color: $color-white;
    font-size: 2rem;

    @include respond-to('md') {
      font-size: 2.4rem;
    }
  }

  .book-subtitle {
    font-size: 1.2rem;
    color: $color-purple-light;
    font-style: italic;
  }
}

.book-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-xl;
  margin-bottom: $spacing-xl;

  @include respond-to('md') {
    grid-template-columns: 1fr 2fr;
    gap: $spacing-xxl;
  }
}

.book-cover {
  margin: 0;
  text-align: center;

  @include respond-to('md') {
    text-align: left;
  }

  img {
    width: 100%;
    max-width: 280px;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  figcaption {
    margin-top: $spacing-sm;
    font-size: 0.8rem;
    color: rgba($color-white, 0.5);
  }
}

.book-description {
  line-height: 1.8;
  color: rgba($color-white, 0.9);
  font-size: 1.02rem;

  :deep(p) {
    margin-bottom: 1em;
  }

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
    margin: 2rem auto;
    opacity: 0.4;
  }
}

.book-quote {
  margin: $spacing-xl 0;
  padding: $spacing-lg $spacing-xl;
  background: rgba($color-white, 0.04);
  border-left: 4px solid $color-purple-medium;
  border-radius: 0 8px 8px 0;

  blockquote {
    margin: 0;
    font-style: italic;
    line-height: 1.9;
    color: rgba($color-white, 0.85);
    font-size: 1.05rem;
  }

  &.poem blockquote {
    text-align: center;
    white-space: pre-line;
  }

  &.prose blockquote {
    text-align: left;

    :deep(p) {
      margin-bottom: 0.75em;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.book-shop {
  margin-top: $spacing-xl;
  padding-top: $spacing-lg;
  border-top: 1px solid rgba($color-white, 0.1);

  h2 {
    margin-bottom: $spacing-md;
    color: $color-white;
    font-size: 1.4rem;
  }

  .shop-widgets {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-lg;
    justify-content: center;

    .shop-widget-container {
      flex: 1;
      min-width: 250px;
      max-width: 400px;
    }

    .bod-widget-iframe {
      width: 100%;
      height: 280px;
      border: none;
      border-radius: 8px;
      background: #fff;
    }
  }

  .shop-links {
    display: flex;
    flex-wrap: wrap;
    gap: 6rem;
    justify-content: center;
  }

  .shop-link {
    display: inline-block;
    padding: $spacing-sm $spacing-xl;
    background: $color-purple-medium;
    color: $color-white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.95rem;
    @include transition(background-color, transform);

    &:hover {
      background: $color-purple-dark;
      transform: translateY(-2px);
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

  ul {
    list-style: none;
    padding: 0;
    margin-top: $spacing-md;
  }

  li {
    margin-bottom: $spacing-sm;
  }

  a {
    color: $color-purple-light;
    text-decoration: underline;
  }
}
</style>
