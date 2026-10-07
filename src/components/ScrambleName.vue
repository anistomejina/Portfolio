<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

import { useTextScramble } from '@/composables/useTextScramble'
import { prefersReducedMotion } from '@/utils/motion'

const props = defineProps<{
  /** Read once at setup. Callers passing translated text must `:key` the component by it. */
  text: string
}>()

/** Pause before the intro run, so the effect starts once the page has settled. */
const INTRO_DELAY_MS = 150

// Captured once on purpose: the visible string and the accessible name always describe the same text.
const label = props.text
const { display, play } = useTextScramble(label, { revealDelayFrames: 4, frameInterval: 30 })

let introTimer: ReturnType<typeof setTimeout> | undefined

/** Plays a run unless one is in progress (handled by the composable) or motion is reduced. */
function scramble(): void {
  if (prefersReducedMotion()) return
  play()
}

onMounted(() => {
  introTimer = setTimeout(scramble, INTRO_DELAY_MS)
})

onBeforeUnmount(() => {
  clearTimeout(introTimer)
})
</script>

<template>
  <!-- Assistive tech reads the real text; the flickering copy is decorative. -->
  <h1 class="scramble-name" @mouseenter="scramble">
    <span class="sr-only">{{ label }}</span><span class="scramble-name__text" aria-hidden="true">{{ display }}</span><span class="cursor" aria-hidden="true" />
  </h1>
</template>

<style scoped>
.scramble-name {
  display: inline;
  color: inherit;
  font-family: var(--font-mono);
  font-size: clamp(34px, 6vw, 47px);
  font-weight: 400;
  cursor: default;
}

/* Underscore-style caret: an empty inline-block whose bottom edge sits on the baseline. */
.cursor {
  display: inline-block;
  width: 27px;
  height: 4px;
  margin-left: 2px;
  vertical-align: baseline;
  white-space: nowrap;
  background-color: var(--signal);
  border-radius: 1px;
  animation: scramble-caret-blink 1.1s step-end infinite;
}

/* Hard on / off cuts (step-end), visible for roughly half of each cycle. */
@keyframes scramble-caret-blink {
  0%,
  45% {
    opacity: 1;
  }

  50%,
  95% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cursor {
    animation: none;
  }
}
</style>
