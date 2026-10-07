<script setup lang="ts">
defineProps<{
  /** Shell-path style label above the title, e.g. "~/projects". */
  eyebrow: string
  title: string
}>()
</script>

<template>
  <header class="section-header">
    <p class="eyebrow">{{ eyebrow }}</p>
    <h2 class="section-title">{{ title }}</h2>
  </header>
</template>

<style scoped>
.section-header {
  margin-bottom: 28px;
}

.eyebrow {
  margin-bottom: 15px;
  color: var(--signal-text);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.section-title {
  color: inherit;
  font-family: var(--font-mono);
  font-size: 30px;
  font-weight: 400;
}
</style>
