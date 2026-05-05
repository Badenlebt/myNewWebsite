<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import MenuBar from '@/components/MenuBar.vue'
import FooterSection from '@/components/FooterSection.vue'
import arrowUpIcon from '@/assets/svg/arrow-up-light.svg'

const showScrollTop = ref(false)

function handleScroll() {
  showScrollTop.value = window.scrollY > window.innerHeight
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div id="app">
    <header>
      <MenuBar />
    </header>
    <router-view />
    <FooterSection />

    <Transition name="fade">
      <button
        v-show="showScrollTop"
        class="scroll-top-btn"
        title="Nach oben"
        @click="scrollToTop"
      >
        <img :src="arrowUpIcon" alt="Nach oben" />
      </button>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  flex-shrink: 0;
}
</style>

<style lang="scss">
/* Global style to offset all page main elements below the fixed menu */
main {
  flex: 1;
  padding-top: 96px !important;
}

.scroll-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 900;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(40, 45, 55, 0.85);
  backdrop-filter: blur(8px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: background 0.2s ease, transform 0.2s ease, opacity 0.3s ease;

  &:hover {
    background: rgba(57, 16, 123, 0.8);
    transform: scale(1.1);
  }

  img {
    width: 20px;
    height: 20px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
