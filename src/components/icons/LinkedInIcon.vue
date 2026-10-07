<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Rendered width and height in px. */
    size?: number
  }>(),
  { size: 16 },
)
</script>

<template>
  <!-- Rounded square with the "in" letters knocked out, filled with the current text colour. -->
  <svg
    class="linkedin-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill-rule="evenodd"
      d="M5 2h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm2.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM6 10v8h3v-8H6Zm5 0v8h3v-4c0-1.1.6-1.8 1.6-1.8s1.4.7 1.4 1.8v4h3v-4.3c0-2.5-1.2-3.9-3.4-3.9-1.3 0-2.3.6-2.8 1.4V10H11Z"
    />
  </svg>
</template>
