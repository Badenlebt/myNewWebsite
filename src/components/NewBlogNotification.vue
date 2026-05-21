<script setup>
import { computed, ref, onMounted, onUnmounted, onUpdated, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useContent } from '@/composables/useContent'

const router = useRouter()
const { t } = useI18n()
const { blogEntries } = useContent()

const scrollY = ref(0)
const pageHeight = ref(0)
const welcomeSectionHeight = ref(0)
const isInitialized = ref(false)

// Check if there's a new blog entry (newer than 8 days)
const newestEntry = computed(() => {
  if (!blogEntries.value || blogEntries.value.length === 0) return null
  
  const sorted = [...blogEntries.value].sort((a, b) => 
    new Date(b.entryDate) - new Date(a.entryDate)
  )
  
  const newest = sorted[0]
  const entryDate = new Date(newest.entryDate)
  const now = new Date()
  const daysDiff = (now - entryDate) / (1000 * 60 * 60 * 24)
  
  return daysDiff <= 8 ? newest : null
})

const notificationText = computed(() => {
  return t('blog.newEntry')
})

// Calculate position based on scroll - aligned with page scroll
const circleStyle = computed(() => {
  // Calculate the maximum scrollable distance
  const maxScroll = pageHeight.value - window.innerHeight
  
  // Start position: at the border between welcome and books sections
  // (welcomeSectionHeight minus half the circle height to center it on the border)
  const circleHeight = window.innerWidth >= 768 ? 140 : 120
  const startPosition = welcomeSectionHeight.value - (circleHeight / 2)
  
  if (maxScroll <= 0) {
    // If page doesn't scroll, stay at starting position
    return { top: `${startPosition}px` }
  }
  
  // Calculate scroll progress (0 to 1) - start moving immediately
  // Finish moving at 100% of page scroll (at the very bottom)
  const scrollProgress = Math.min(scrollY.value / maxScroll, 1)
  
  // End at 120px from top
  const endPosition = 120
  
  // Linear interpolation between start and end
  const currentPosition = startPosition - (scrollProgress * (startPosition - endPosition))
  
  return {
    top: `${currentPosition}px`
  }
})

const handleScroll = () => {
  scrollY.value = window.scrollY
}

const updatePageHeight = () => {
  pageHeight.value = document.documentElement.scrollHeight
}

const updateWelcomeSectionHeight = () => {
  nextTick(() => {
    const welcomeSection = document.querySelector('.welcome-section')
    if (welcomeSection) {
      const newHeight = welcomeSection.getBoundingClientRect().height + welcomeSection.offsetTop
      // Only update if there's a significant change to avoid unnecessary recalculations
      if (Math.abs(newHeight - welcomeSectionHeight.value) > 5) {
        welcomeSectionHeight.value = newHeight
      }
    }
  })
}

const goToNewestEntry = () => {
  if (newestEntry.value) {
    router.push(`/blog/${newestEntry.value.url}`)
  }
}

// Watch for content changes
watch(() => blogEntries.value.length, () => {
  if (blogEntries.value.length > 0) {
    setTimeout(() => {
      updatePageHeight()
      updateWelcomeSectionHeight()
    }, 200)
  }
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', () => {
    updatePageHeight()
    updateWelcomeSectionHeight()
  })
  
  // Wait for images to load
  window.addEventListener('load', () => {
    updatePageHeight()
    updateWelcomeSectionHeight()
  })
  
  // Initial measurements with progressive delays
  nextTick(() => {
    updatePageHeight()
    updateWelcomeSectionHeight()
    handleScroll()
    
    // Recalculate after short delay
    setTimeout(() => {
      updatePageHeight()
      updateWelcomeSectionHeight()
    }, 100)
    
    // Final recalculation after images should be loaded
    setTimeout(() => {
      updatePageHeight()
      updateWelcomeSectionHeight()
      isInitialized.value = true
    }, 500)
  })
})

onUpdated(() => {
  // Recalculate when component updates
  if (isInitialized.value) {
    updatePageHeight()
    updateWelcomeSectionHeight()
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updatePageHeight)
  window.removeEventListener('resize', updateWelcomeSectionHeight)
  window.removeEventListener('load', updatePageHeight)
  window.removeEventListener('load', updateWelcomeSectionHeight)
})
</script>

<template>
  <Transition name="fade">
    <div
      v-if="newestEntry"
      class="new-blog-notification"
      :style="circleStyle"
      @click="goToNewestEntry"
      role="button"
      :aria-label="t('blog.newEntryAriaLabel')"
      tabindex="0"
      @keydown.enter="goToNewestEntry"
      @keydown.space.prevent="goToNewestEntry"
    >
      <span class="notification-text" v-html="notificationText"></span>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.new-blog-notification {
  position: fixed;
  left: calc(50% + 600px + 30px); // Position to the right of content (max-width 1200px)
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, $color-purple-medium, $color-purple-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 900;
  box-shadow: 0 4px 20px 10px rgba($color-purple-bright, 0.6);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  will-change: top;
  
  @media (max-width: 1400px) {
    right: $spacing-md;
    left: auto;
  }
  
  @include respond-to('md') {
    width: 140px;
    height: 140px;
    left: calc(50% + 600px + 40px);
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 30px 15px rgba($color-purple-bright, 0.5);
  }

  &:focus {
    outline: 2px solid $color-purple-light;
    outline-offset: 4px;
  }

  .notification-text {
    color: $color-white;
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    line-height: 1.3;
    white-space: pre-line;
    padding: $spacing-sm;

    @include respond-to('md') {
      font-size: 1.1rem;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
