<script setup lang="ts">
import { computed } from 'vue'

import ProjectCard from '@/components/ProjectCard.vue'
import type { Project } from '@/types/content'

const props = defineProps<{
  projects: Project[]
}>()

/** The first project gets the large card; the others share the side stack (designed for two). */
const lead = computed<Project | undefined>(() => props.projects[0])
const others = computed(() => props.projects.slice(1))
</script>

<template>
  <div v-if="lead" class="projects-showcase" :class="{ 'projects-showcase--solo': !others.length }">
    <ProjectCard :project="lead" variant="featured" />

    <div v-if="others.length" class="projects-side-stack">
      <ProjectCard
        v-for="project in others"
        :key="project.slug"
        :project="project"
        variant="compact"
      />
    </div>
  </div>
</template>

<style scoped>
/* Featured card on the left, as tall as the two stacked compact cards on the right. */
.projects-showcase {
  display: grid;
  grid-template-columns: minmax(0, 1.32fr) minmax(300px, 1fr);
  align-items: stretch;
  gap: 20px;
}

/* A single project spans the whole row instead of leaving an empty column. */
.projects-showcase--solo {
  grid-template-columns: minmax(0, 1fr);
}

.projects-side-stack {
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 860px) {
  .projects-showcase {
    grid-template-columns: minmax(0, 1fr);
  }

  /* The compact cards sit side by side under the featured card. */
  .projects-side-stack {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
  }
}

@media (max-width: 640px) {
  .projects-side-stack {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
