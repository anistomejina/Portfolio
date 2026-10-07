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

.stat:last-child {
  border-right: 0;
}

.stat-value {
  display: block;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 22px;
}

.stat-label {
  color: var(--text-muted);
  font-size: 11px;
}
</style>
