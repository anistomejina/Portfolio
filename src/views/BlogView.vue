<script setup lang="ts">
import { computed } from 'vue'

import PublicationList from '@/components/PublicationList.vue'
import { useLocale } from '@/composables/useLocale'

const { copy } = useLocale()
const labels = computed(() => copy.value.posts)

/** The archive lists every post in authored order: no slicing, no sorting, no archive link override. */
const posts = computed(() => labels.value.items)
</script>

<template>
  <main class="publications-page">
    <header class="publications-header">
      <p v-if="labels.eyebrow" class="publications-eyebrow">{{ labels.eyebrow }}</p>
      <h1 class="publications-title">{{ labels.archiveTitle }}</h1>
    </header>

    <!-- Re-keyed by slug inside the list, so cards that change between languages replay their entrance. -->
    <PublicationList :posts="posts" />
  </main>
</template>

<style scoped>
/* The gap between the nav pill and the eyebrow comes from this padding alone. */
.publications-page {
  padding-top: 72px;
}

/* Block (not flex) on purpose: the title's 14px bottom margin collapses into these 34px. */
.publications-header {
  max-width: 760px;
  margin-bottom: 34px;
}

.publications-eyebrow {
  margin-bottom: 18px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: var(--signal-text);
}

/* 30px below a 750px viewport, fluid up to 46px at 1150px. */
.publications-title {
  margin: 0 0 14px;
  font-family: var(--font-mono);
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 400;
  line-height: 1.15;
  color: var(--ink);
}

@media (max-width: 640px) {
  .publications-page {
    padding-top: 48px;
  }

  .publications-header {
    margin-bottom: 26px;
  }
}
</style>
