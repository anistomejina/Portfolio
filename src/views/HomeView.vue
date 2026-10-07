<script setup lang="ts">
import { PhArrowRight } from '@phosphor-icons/vue'
import { computed } from 'vue'

import BinaryCursorTrail from '@/components/BinaryCursorTrail.vue'
import HeroSection from '@/components/HeroSection.vue'
import ProjectShowcase from '@/components/ProjectShowcase.vue'
import PublicationList from '@/components/PublicationList.vue'
import ScrollHint from '@/components/ScrollHint.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import { useLocale } from '@/composables/useLocale'
import { homeSectionIds } from '@/i18n/messages'

/** How many posts the home page previews (the archive has the rest). */
const HOME_POST_COUNT = 2

const { copy } = useLocale()

const projects = computed(() => copy.value.projects.items ?? [])
const recentPosts = computed(() => (copy.value.posts.items ?? []).slice(0, HOME_POST_COUNT))
</script>

<template>
  <main class="home">
    <BinaryCursorTrail />
    <HeroSection />
    <ScrollHint />

    <section :id="homeSectionIds.projects" class="home-section home-section--projects">
      <SectionHeader :eyebrow="copy.projects.eyebrow" :title="copy.projects.sectionTitle" />

      <ProjectShowcase :projects="projects" />

      <RouterLink to="/projects" class="see-all see-all--projects">
        {{ copy.projects.viewAllProjects }}
        <PhArrowRight :size="14" aria-hidden="true" focusable="false" />
      </RouterLink>
    </section>

    <section :id="homeSectionIds.blog" class="home-section home-section--posts posts-section">
      <SectionHeader :eyebrow="copy.posts.eyebrow" :title="copy.posts.sectionTitle" />

      <!-- On home every linkable card opens the archive rather than the post itself. -->
      <PublicationList :posts="recentPosts" archive-link="/blog" />

      <RouterLink to="/blog" class="see-all see-all--posts">
        {{ copy.posts.viewAllPosts }}
        <PhArrowRight :size="14" aria-hidden="true" focusable="false" />
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
/* Matches the router's hash offset, so native fragment scrolling (on first load) lands in the same place. */
.home-section {
  scroll-margin-top: 24px;
}

.home-section--projects {
  margin-top: 70px;
}

.home-section--posts {
  margin-top: 64px;
}

/* "View all" accent link: the arrow slides right on hover as the gap widens. */
.see-all {
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin: 28px auto 0;
  padding: 6px 4px;
  color: var(--signal-text);
  font-family: var(--font-mono);
  font-size: 12px;
  text-decoration: none;
  transition:
    gap 0.2s ease,
    color 0.2s ease;
}

.see-all:hover {
  gap: 12px;
  color: var(--signal);
}

.see-all:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 5px;
  border-radius: 4px;
}

@media (max-width: 640px) {
  .see-all--projects {
    margin-top: 22px;
  }

  .see-all--posts {
    margin-top: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .see-all {
    transition: none;
  }
}
</style>
