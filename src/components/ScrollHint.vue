<script setup lang="ts">
import { PhCaretDown } from '@phosphor-icons/vue'
</script>

<template>
  <div class="scroll-hint" aria-hidden="true">
    <PhCaretDown class="scroll-hint__icon" :size="20" weight="regular" color="currentColor" />
  </div>
</template>

<style scoped>
.scroll-hint {
  display: flex;
  justify-content: center;
  margin-bottom: 56px;
  color: var(--text-muted);
}

.scroll-hint__icon {
  animation: scroll-hint-bob 2s ease-in-out infinite;
}

@keyframes scroll-hint-bob {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-hint__icon {
    animation: none;
  }
}
</style>
