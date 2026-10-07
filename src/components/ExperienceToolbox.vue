<script setup lang="ts">
import { computed } from 'vue'

import type { ToolboxColumn } from '@/types/content'

const props = defineProps<{
  columns: ToolboxColumn[]
  /** Heading text (copy.experience.toolboxLabel). */
  label: string
}>()

/** Rows ready for display: "~/Category" → "Category", numbered "01", "02"... (empty rows dropped). */
const rows = computed(() =>
  props.columns
    .map((column) => ({
      key: column.label,
      title: column.label.replace(/^~\//, '').trim(),
      items: column.items.filter((item) => item.trim() !== ''),
    }))
    .filter((row) => row.title !== '' || row.items.length > 0)
    .map((row, position) => ({ ...row, number: String(position + 1).padStart(2, '0') })),
)
</script>

<template>
  <section class="toolbox" aria-labelledby="experience-toolbox-title">
    <header class="toolbox-heading">
      <p class="toolbox-eyebrow">~/skills</p>
      <h2 id="experience-toolbox-title" class="toolbox-title">{{ label }}</h2>
    </header>

    <div class="toolbox-list">
      <section v-for="row in rows" :key="row.key" class="toolbox-row">
        <header class="row-heading">
          <span class="row-index" aria-hidden="true">{{ row.number }}</span>
          <h3 class="row-title">{{ row.title }}</h3>
        </header>

        <ul v-if="row.items.length" class="skill-list">
          <li v-for="(item, index) in row.items" :key="`${index}-${item}`" class="skill-chip">{{ item }}</li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.toolbox {
  margin-top: clamp(48px, 7vw, 72px);
}

.toolbox-heading {
  margin-bottom: 22px;
}

.toolbox-eyebrow {
  margin-bottom: 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--signal-text);
}

/* Sans (Inter), unlike the rest of the page headings. */
.toolbox-title {
  font-size: clamp(24px, 3vw, 25px);
  font-weight: 600;
  line-height: 1.15;
  color: var(--ink);
}

/* A ruled table: one line above the first row, one under every row. */
.toolbox-list {
  border-top: 0.5px solid var(--border-strong);
}

.toolbox-row {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  align-items: center;
  gap: clamp(24px, 4vw, 56px);
  padding: 28px 0;
  border-bottom: 0.5px solid var(--border-strong);
}

.row-heading {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}

.row-index {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--signal-text);
}

.row-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  overflow-wrap: anywhere;
  color: var(--ink);
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 9px 16px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.25;
  overflow-wrap: anywhere;
  color: var(--text-secondary);
  background: transparent;
  border: 0.5px solid var(--border-strong);
  border-radius: 999px;
  transition:
    color 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

/* Hover tint only where hover really exists (no sticky tint after a tap). */
@media (hover: hover) {
  .skill-chip:hover {
    color: var(--signal-text);
    background: var(--signal-soft);
    border-color: var(--signal);
    transform: translateY(-1px);
  }
}

@media (max-width: 800px) {
  .toolbox-row {
    grid-template-columns: minmax(150px, 190px) minmax(0, 1fr);
    gap: 24px;
  }
}

@media (max-width: 640px) {
  .toolbox-heading {
    margin-bottom: 18px;
  }

  .toolbox-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
    padding: 24px 0;
  }

  .skill-list {
    gap: 8px;
  }

  /* Pills stretch to fill each line in a tidy grid. */
  .skill-chip {
    flex: 1 1 138px;
    justify-content: center;
    min-height: 42px;
    padding-inline: 14px;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skill-chip {
    transition: none;
  }
}
</style>
