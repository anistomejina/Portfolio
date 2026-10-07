<script setup lang="ts">
import PublicationCard from '@/components/PublicationCard.vue'
import RevealOnScroll from '@/components/RevealOnScroll.vue'
import type { Post } from '@/types/content'

defineProps<{
  posts: Post[]
  /** When set, every linkable card points here (home passes "/blog"); otherwise to /blog/<slug>. */
  archiveLink?: string
}>()

/** Each card starts 90ms after the previous one. */
const STAGGER_MS = 90
</script>

<template>
  <div v-if="posts.length" class="publication-list">
    <!-- Cards slide in alternately from the lower left and the lower right. -->
    <RevealOnScroll
      v-for="(post, position) in posts"
      :key="post.slug"
      :delay="position * STAGGER_MS"
      :direction="position % 2 === 0 ? 'left' : 'right'"
    >
      <PublicationCard :post="post" :index="position" :link-to="archiveLink" />
    </RevealOnScroll>
  </div>
</template>

<style scoped>
.publication-list {
  display: grid;
  gap: 18px;
}
</style>
