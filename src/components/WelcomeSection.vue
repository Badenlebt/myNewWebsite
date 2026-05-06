<script setup>
import { useI18n } from 'vue-i18n'
import mhLogo from '@/assets/svg/mh-new-3.svg'

const { t } = useI18n()
</script>

<template>
  <section class="welcome-section">
    <div class="welcome-content">
      <h1 class="welcome-title">{{ t('welcome.title') }}</h1>
      <p class="welcome-text">{{ t('welcome.text') }}</p>
    </div>
    <div class="welcome-logo">
      <img :src="mhLogo" alt="MH" class="welcome-logo__img" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.welcome-section {
  position: relative;
  width: 100%;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xxl $spacing-lg;
  background: linear-gradient(135deg, $color-purple-dark 0%, $color-purple-medium 100%);
  overflow: hidden;

  @include respond-to('md') {
    flex-direction: row;
    min-height: 70vh;
    padding: $spacing-xxl 6rem;
    gap: $spacing-xxl;
  }
}

.welcome-content {
  position: relative;
  z-index: 1;
  text-align: left;
  max-width: 600px;
  color: $color-white;

  @include respond-to('md') {
    flex: 1;
  }
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: $spacing-lg;
  color: $color-white;

  @include respond-to('md') {
    font-size: 3.5rem;
  }
}

.welcome-text {
  font-size: 1rem;
  line-height: 1.9;
  white-space: pre-line;
  color: rgba($color-white, 0.9);

  @include respond-to('md') {
    font-size: 1.15rem;
  }
}

.welcome-logo {
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: $spacing-xl;

  @include respond-to('md') {
    margin-top: 0;
    flex: 0 0 auto;
  }

  &__img {
    width: 200px;
    height: 200px;

    @include respond-to('md') {
      width: 350px;
      height: 350px;
    }

    @include respond-to('lg') {
      width: 420px;
      height: 420px;
    }
  }
}
</style>
