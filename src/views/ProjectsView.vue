<script setup lang="ts">
import { computed } from 'vue'

import ProjectArchiveCard from '@/components/ProjectArchiveCard.vue'
import ScrambleName from '@/components/ScrambleName.vue'
import { useLocale } from '@/composables/useLocale'
import type { Project } from '@/types/content'

const { copy } = useLocale()

/** Zero-padded indexes ("01", "02"...) sort correctly as plain strings. */
function byIndex(a: Project, b: Project): number {
  if (a.index === b.index) return 0
  return a.index < b.index ? -1 : 1
}

/** Every project (locked and in-progress included), lowest index first. The first one is featured. */
const archive = computed(() => copy.value.projects.items.slice().sort(byIndex))
</script>

<template>
  <main class="projects-page">
    <header class="projects-header">
      <p class="projects-eyebrow">{{ copy.projects.pageEyebrow }}</p>
      <div class="projects-title">
        <!-- Keyed by the text so a language switch remounts the heading and replays the scramble. -->
        <ScrambleName :key="copy.projects.pageTitle" :text="copy.projects.pageTitle" />
      </div>
    </header>

    <section class="projects-archive" :aria-label="copy.projects.sectionTitle">
      <ProjectArchiveCard
        v-for="(project, position) in archive"
        :key="project.slug"
        :project="project"
        :featured="position === 0"
      />
    </section>
  </main>
</template>

<style scoped>
.projects-page {
  position: relative;
  /* 88px nav margin + 72px = 160px from the nav pill to the eyebrow. */
  padding-top: 72px;
}

.projects-header {
  max-width: 780px;
  margin-bottom: 38px;
}

.projects-eyebrow {
  margin-bottom: 18px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--signal-text);
}

.projects-title {
  margin-bottom: 22px;
}

.projects-archive {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
}

@media (max-width: 640px) {
  .projects-page {
    padding-top: 48px;
  }

  .projects-header {
    margin-bottom: 30px;
  }
}
</style>
