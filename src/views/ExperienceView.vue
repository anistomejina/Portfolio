<script setup lang="ts">
import { ref } from 'vue'

import ExperienceEntryItem from '@/components/ExperienceEntryItem.vue'
import ExperienceToolbox from '@/components/ExperienceToolbox.vue'
import ScrambleName from '@/components/ScrambleName.vue'
import { useLocale } from '@/composables/useLocale'

const { copy } = useLocale()

/**
 * Single-open accordion: at most one entry is expanded. Everything starts collapsed, and the open
 * slug survives a language switch (slugs are identical in every locale).
 */
const expandedSlug = ref<string | null>(null)

function onToggle(slug: string): void {
  expandedSlug.value = expandedSlug.value === slug ? null : slug
}
</script>

<template>
  <main class="experience-page">
    <p class="eyebrow">{{ copy.experience.eyebrow }}</p>
    <div class="experience-title">
      <!-- Keyed by the text so a language switch remounts the heading and replays the scramble. -->
      <ScrambleName :key="copy.experience.pageTitle" :text="copy.experience.pageTitle" />
    </div>

    <div class="experience-list">
      <ExperienceEntryItem
        v-for="entry in copy.experience.entries"
        :key="entry.slug"
        :entry="entry"
        :is-open="expandedSlug === entry.slug"
        @toggle="onToggle(entry.slug)"
      />
    </div>

    <ExperienceToolbox
      v-if="copy.experience.toolbox.length"
      :columns="copy.experience.toolbox"
      :label="copy.experience.toolboxLabel"
    />
  </main>
</template>

<style scoped>
/* No top padding: the eyebrow sits right under the nav's bottom margin. */
.eyebrow {
  margin-bottom: 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--signal-text);
}

.experience-title {
  margin-bottom: 32px;
}

/* Hairlines between entries only: none above the first or below the last. */
.experience-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
}

.experience-list > :deep(.entry:not(:first-child)) {
  border-top: 0.5px solid var(--border);
}
</style>
