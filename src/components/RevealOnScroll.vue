<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { prefersReducedMotion } from '@/utils/motion'

const props = withDefaults(
  defineProps<{
    /** Delay before the entrance starts, in ms (lists pass index × 90). */
    delay?: number
    /** Side the element slides in from (lists alternate left / right). */
    direction?: 'left' | 'right'
  }>(),
  { delay: 0, direction: 'left' },
)

const root = ref<HTMLElement | null>(null)
/** Hidden-state styles only apply once JS has confirmed the animation can run. */
const ready = ref(false)
const visible = ref(false)
let observer: IntersectionObserver | null = null

const style = computed(() => ({ '--reveal-delay': `${props.delay}ms` }))

function disconnect(): void {
  observer?.disconnect()
  observer = null
}

onMounted(() => {
  const element = root.value
  if (!element || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
    visible.value = true
    return
  }

  ready.value = true
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        visible.value = true
        disconnect()
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.16 },
  )
  observer.observe(element)
})

onBeforeUnmount(disconnect)
</script>

<template>
  <div
    ref="root"
    class="reveal"
    :class="[
      `reveal--${direction}`,
      { 'reveal--ready': ready, 'reveal--visible': visible },
    ]"
    :style="style"
  >
    <slot />
  </div>
</template>

<style scoped>
.reveal {
  min-width: 0;
}

.reveal--ready {
  opacity: 0;
  filter: blur(7px);
  clip-path: inset(0 0 18% 0 round 20px);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms),
    transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms),
    filter 0.7s ease var(--reveal-delay, 0ms),
    clip-path 0.8s cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms);
}

.reveal--ready.reveal--left {
  transform: translate3d(-34px, 34px, 0);
}

.reveal--ready.reveal--right {
  transform: translate3d(34px, 34px, 0);
}

/* The rounded clip stays after the entrance (matches the reference look). */
.reveal--ready.reveal--visible {
  opacity: 1;
  filter: blur(0);
  transform: none;
  clip-path: inset(0 0 0 0 round 20px);
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .reveal--ready,
  .reveal--ready.reveal--left,
  .reveal--ready.reveal--right {
    opacity: 1;
    filter: none;
    transform: none;
    clip-path: none;
    transition: none;
  }
}
</style>
