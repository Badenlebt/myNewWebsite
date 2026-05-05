<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguage } from '@/composables/useLanguage.js'
import logoSrc from '@/assets/svg/mh-new-2-light.svg'
import caretDownSrc from '@/assets/svg/caret-down-light.svg'

const { t } = useI18n()
const { currentLanguage, switchLanguage } = useLanguage()

// Compact mode on scroll
const isCompact = ref(false)

// Mobile menu toggle
const isMobileMenuOpen = ref(false)

// Books dropdown
const isBooksDropdownOpen = ref(false)

function handleScroll() {
  isCompact.value = window.scrollY > 50
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
  isBooksDropdownOpen.value = false
}

function toggleBooksDropdown() {
  isBooksDropdownOpen.value = !isBooksDropdownOpen.value
}

function closeBooksDropdown() {
  booksDropdownTimeout = setTimeout(() => {
    isBooksDropdownOpen.value = false
  }, 300)
}

function keepBooksDropdownOpen() {
  clearTimeout(booksDropdownTimeout)
}

let booksDropdownTimeout = null

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="menubar"
    :class="{ 'menubar--compact': isCompact }"
  >
    <div class="menubar__container">
      <!-- Logo and site title -->
      <div class="menubar__brand">
        <router-link :to="t('links.startUrl')" class="menubar__logo-link" @click="closeMobileMenu">
          <img :src="logoSrc" alt="MH" class="menubar__logo" />
        </router-link>
        <div class="menubar__titles">
          <span class="menubar__title">{{ t('global.title') }}</span>
          <span class="menubar__subtitle">{{ t('global.subtitle') }}</span>
        </div>
      </div>

      <!-- Hamburger toggle (mobile) -->
      <button
        class="menubar__hamburger"
        :class="{ 'menubar__hamburger--open': isMobileMenuOpen }"
        @click="toggleMobileMenu"
        aria-label="Toggle navigation menu"
        :aria-expanded="isMobileMenuOpen"
      >
        <span class="menubar__hamburger-line"></span>
        <span class="menubar__hamburger-line"></span>
        <span class="menubar__hamburger-line"></span>
      </button>

      <!-- Navigation -->
      <nav
        class="menubar__nav"
        :class="{ 'menubar__nav--open': isMobileMenuOpen }"
      >
        <ul class="menubar__links">
          <!-- Start -->
          <li class="menubar__item">
            <router-link
              :to="t('links.startUrl')"
              class="menubar__link"
              @click="closeMobileMenu"
            >
              {{ t('links.start') }}
            </router-link>
          </li>

          <!-- Blog -->
          <li class="menubar__item">
            <router-link
              :to="t('links.blogUrl')"
              class="menubar__link"
              @click="closeMobileMenu"
            >
              {{ t('links.blog') }}
            </router-link>
          </li>

          <!-- Books (dropdown) -->
          <li
            class="menubar__item menubar__item--dropdown"
            @mouseenter="keepBooksDropdownOpen(); isBooksDropdownOpen = true"
            @mouseleave="closeBooksDropdown"
          >
            <button
              class="menubar__link menubar__link--dropdown"
              @click="toggleBooksDropdown"
              :aria-expanded="isBooksDropdownOpen"
            >
              {{ t('links.books') }}
              <img :src="caretDownSrc" alt="" class="menubar__caret" />
            </button>
            <ul
              class="menubar__dropdown"
              :class="{ 'menubar__dropdown--open': isBooksDropdownOpen }"
              @mouseenter="keepBooksDropdownOpen"
              @mouseleave="closeBooksDropdown"
            >
              <li class="menubar__dropdown-item">
                <router-link
                  :to="t('links.keinhornUrl')"
                  class="menubar__dropdown-link"
                  @click="closeMobileMenu"
                >
                  {{ t('links.keinhorn') }}
                </router-link>
              </li>
              <li class="menubar__dropdown-item">
                <router-link
                  :to="t('links.albertAmeiseUrl')"
                  class="menubar__dropdown-link"
                  @click="closeMobileMenu"
                >
                  {{ t('links.albertAmeise') }}
                </router-link>
              </li>
              <li class="menubar__dropdown-item">
                <router-link
                  :to="t('links.herzgedankenUrl')"
                  class="menubar__dropdown-link"
                  @click="closeMobileMenu"
                >
                  {{ t('links.herzgedanken') }}
                </router-link>
              </li>
            </ul>
          </li>

          <!-- About Me -->
          <li class="menubar__item">
            <router-link
              :to="t('links.aboutMeUrl')"
              class="menubar__link"
              @click="closeMobileMenu"
            >
              {{ t('links.aboutMe') }}
            </router-link>
          </li>

        </ul>

        <!-- Language switcher -->
        <ul class="menubar__lang-switcher">
          <li
            class="menubar__lang-option"
            :class="{ 'menubar__lang-option--active': currentLanguage === 'de' }"
          >
            <button @click="switchLanguage('de')" class="menubar__lang-btn">DE</button>
          </li>
          <li
            class="menubar__lang-option"
            :class="{ 'menubar__lang-option--active': currentLanguage === 'en' }"
          >
            <button @click="switchLanguage('en')" class="menubar__lang-btn">EN</button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.menubar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: $color-gunmetal;
  padding: $spacing-md $spacing-lg;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
  transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.35s ease;

  &--compact {
    padding: $spacing-sm $spacing-lg;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);

    .menubar__logo {
      height: 32px;
    }

    .menubar__subtitle {
      opacity: 0;
      max-height: 0;
      margin: 0;
      overflow: hidden;
    }
  }

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: $breakpoint-xl;
    margin: 0 auto;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__logo-link {
    display: flex;
    align-items: center;
  }

  &__logo {
    height: 44px;
    transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  &__titles {
    display: flex;
    flex-direction: column;
  }

  &__title {
    color: $color-white;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.2;
  }

  &__subtitle {
    color: $color-purple-light;
    font-size: 0.8rem;
    line-height: 1.3;
    max-height: 1.5em;
    transition: opacity 0.35s ease, max-height 0.35s ease;
  }

  // Hamburger button (mobile only)
  &__hamburger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;

    @include respond-to('md') {
      display: none;
    }

    &-line {
      display: block;
      width: 100%;
      height: 2px;
      background-color: $color-white;
      border-radius: 2px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 0.2s ease;
    }

    &--open {
      .menubar__hamburger-line:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
      }
      .menubar__hamburger-line:nth-child(2) {
        opacity: 0;
      }
      .menubar__hamburger-line:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
      }
    }
  }

  // Navigation - mobile slide-in
  &__nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: $color-gunmetal;
    padding: 0 $spacing-lg;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.3s ease,
                padding 0.3s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

    @include respond-to('md') {
      display: flex;
      flex-direction: row;
      align-items: center;
      position: static;
      padding: 0;
      gap: $spacing-lg;
      max-height: none;
      overflow: visible;
      opacity: 1;
      box-shadow: none;
    }

    &--open {
      max-height: 400px;
      opacity: 1;
      padding: $spacing-md $spacing-lg $spacing-lg;
    }
  }

  &__links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    @include respond-to('md') {
      flex-direction: row;
      align-items: center;
      gap: $spacing-md;
    }
  }

  &__item {
    position: relative;

    &--dropdown {
      position: relative;
    }
  }

  &__link {
    color: $color-white;
    text-decoration: none;
    font-size: 0.95rem;
    padding: $spacing-xs $spacing-sm;
    border-radius: 4px;
    position: relative;
    @include transition(color, background-color);

    &:hover {
      color: $color-purple-light;
    }

    // Active route indicator
    &.router-link-active,
    &.router-link-exact-active {
      color: $color-purple-light;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: $spacing-sm;
        right: $spacing-sm;
        height: 2px;
        background-color: $color-purple-light;
        border-radius: 1px;

        @include respond-to('md') {
          bottom: -4px;
        }
      }
    }

    &--dropdown {
      display: flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
    }
  }

  &__caret {
    width: 12px;
    height: 12px;
    @include transition(transform);

    .menubar__dropdown--open + &,
    .menubar__item--dropdown:hover & {
      transform: rotate(180deg);
    }
  }

  // Dropdown
  &__dropdown {
    list-style: none;
    margin: 0;
    padding: 0;
    display: none;
    flex-direction: column;

    @include respond-to('md') {
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 200px;
      background-color: color.adjust($color-gunmetal, $lightness: -3%);
      border-radius: 6px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      padding: $spacing-sm 0;
      margin-top: 0;
      padding-top: calc($spacing-sm + 8px);
      transform: translateY(-8px);
      opacity: 0;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 0.2s ease;

      // Invisible bridge to prevent hover gap
      &::before {
        content: '';
        position: absolute;
        top: -20px;
        left: -10px;
        right: -10px;
        height: 20px;
      }
    }

    &--open {
      display: flex;

      @include respond-to('md') {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }

  &__dropdown-item {
    padding: 0;
  }

  &__dropdown-link {
    display: block;
    color: $color-white;
    text-decoration: none;
    padding: $spacing-xs $spacing-md;
    font-size: 0.9rem;
    @include transition(color, background-color);

    &:hover {
      color: $color-purple-light;
      background-color: rgba($color-purple-light, 0.1);
    }

    &.router-link-active {
      color: $color-purple-light;
    }
  }

  // Language switcher
  &__lang-switcher {
    list-style: none;
    margin: $spacing-md 0 0;
    padding: 0;
    display: flex;
    gap: $spacing-xs;

    @include respond-to('md') {
      margin: 0;
      margin-left: $spacing-sm;
      padding-left: $spacing-md;
      border-left: 1px solid rgba($color-white, 0.15);
    }
  }

  &__lang-option {
    &--active .menubar__lang-btn {
      color: $color-purple-light;
      border-color: $color-purple-light;
      background-color: rgba($color-purple-light, 0.08);
    }
  }

  &__lang-btn {
    background: none;
    border: 1px solid transparent;
    color: $color-white;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: inherit;
    padding: $spacing-xs $spacing-sm;
    border-radius: 4px;
    cursor: pointer;
    @include transition(color, border-color, background-color);

    &:hover {
      color: $color-purple-light;
      border-color: $color-purple-light;
    }
  }
}
</style>
