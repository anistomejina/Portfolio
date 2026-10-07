<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Rendered width and height in px. */
    size?: number
    strokeWidth?: number
  }>(),
  { size: 14, strokeWidth: 1.7 },
)
</script>

<template>
  <!-- Padlock: arched shackle over a body with rounded top corners and a flat bottom. -->
  <svg
    class="lock-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M7 10V8a5 5 0 0 1 10 0v2" />
    <path d="M8 10h8a2 2 0 0 1 2 2v7H6v-7a2 2 0 0 1 2-2Z" />
  </svg>
</template>
