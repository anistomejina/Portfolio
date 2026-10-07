<script setup lang="ts">
import type { ProfileStat } from '@/types/content'

defineProps<{
  stat: ProfileStat
}>()
</script>

<template>
  <div class="stat">
    <span class="stat-value">{{ stat.value }}</span>
    <span v-if="stat.label" class="stat-label">{{ stat.label }}</span>
  </div>
</template>

<style scoped>
/* One equal third of the hero stats strip; the strip's own border and radius frame the set. */
.stat {
  flex: 1;
  padding: 16px 18px;
  border-right: 0.5px solid var(--border);
}

/*
 * German labels can hold a word wider than a third of a 320px phone ("veröffentlichte"); the three
 * would then overflow the strip and the last one would be clipped. Keep equal thirds and let the
 * word hyphenate or break instead (see .stat-label). English keeps the default sizing.
 */
.stat:lang(de) {
  min-width: 0;
}

.stat:last-child {
  border-right: 0;
}

.stat-value {
  display: block;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 22px;
}

/*
 * On German pages (equal thirds above, hyphens: auto from main.css) a word wider than its third
 * hyphenates from 6 letters on, where the browser has a German dictionary, and otherwise breaks
 * rather than spilling out. Neither applies to English, whose words always fit their column.
 */
.stat-label {
  color: var(--text-muted);
  font-size: 11px;
  overflow-wrap: break-word;
  hyphenate-limit-chars: 6 3 3;
}
</style>
