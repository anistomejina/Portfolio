<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div class="app-shell">
    <div class="page">
      <NavBar />
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  /* Hides horizontal overflow from off-screen reveal transforms without creating a scroll container. */
  overflow-x: clip;
}

.page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 80px 96px;
}

@media (max-width: 640px) {
  .page {
    padding: 32px 20px 64px;
  }
}
</style>
