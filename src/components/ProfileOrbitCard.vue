<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { site } from '@/config/site'
import { asset } from '@/utils/assets'

const { copy } = useLocale()

const photoSrc = asset(site.profilePhoto)
</script>

<template>
  <!-- Static portrait: a circular photo inside a thin outer ring (no animation despite the name). -->
  <div class="profile-orbit">
    <div class="rings">
      <div class="ring ring--outer">
        <div class="ring ring--core">
          <img
            v-if="photoSrc"
            class="profile-photo"
            :src="photoSrc"
            :alt="copy.accessibility.profilePhoto"
            width="310"
            height="310"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-orbit {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

/* 340px square at full size; shrinks to the column width on narrow phones. */
.rings {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(340px, 100%);
  aspect-ratio: 1;
}

.ring {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.ring--outer {
  width: 100%;
  height: 100%;
  border: 0.5px solid var(--border-strong);
}

/* 92.5% leaves an even ~12.75px gap between the photo and the outer ring. */
.ring--core {
  overflow: hidden;
  width: 92.5%;
  height: 92.5%;
}

.profile-photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
}
</style>
