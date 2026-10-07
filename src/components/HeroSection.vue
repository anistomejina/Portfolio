<script setup lang="ts">
import ProfileIntro from '@/components/ProfileIntro.vue'
import ProfileOrbitCard from '@/components/ProfileOrbitCard.vue'
</script>

<template>
  <section class="hero-wrap">
    <div class="hero">
      <ProfileIntro />
      <ProfileOrbitCard />
    </div>
  </section>
</template>

<style scoped>
/* 640px band with the two-column grid vertically centred inside it. */
.hero-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 640px;
  padding: 56px 0 72px;
}

.hero {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: 64px;
  width: 100%;
}

/* Intro on top, photo ring centred below (the 64px gap becomes the row gap). */
@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
  }
}
</style>
