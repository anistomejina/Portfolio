<script setup lang="ts">
import { computed } from 'vue'

import { techIconFor } from '@/utils/techIcons'

const props = defineProps<{
  /** The chip's label, e.g. "Docker" or "Microsoft Azure". Unknown labels render nothing. */
  name: string
  size?: number
}>()

const icon = computed(() => techIconFor(props.name))
</script>

<template>
  <!-- Bodies come from the bundled, build-time icon data (src/utils/techIconData.ts), never from user input. -->
  <svg
    v-if="icon"
    class="tech-logo"
    :viewBox="icon.viewBox"
    :height="size ?? 14"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
    v-html="icon.body"
  />
</template>

<style scoped>
.tech-logo {
  flex: none;
  width: auto;
  max-width: 2.6em;
}
</style>
