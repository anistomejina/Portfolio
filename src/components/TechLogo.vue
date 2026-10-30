<script setup lang="ts">
import {
  PhBug,
  PhCrosshair,
  PhDatabase,
  PhHardDrives,
  PhHeartbeat,
  PhLockKey,
  PhMedal,
  PhPath,
  PhPresentationChart,
  PhShareNetwork,
  PhShieldCheck,
  PhShieldCheckered,
  PhTrophy,
  PhUsersThree,
} from '@phosphor-icons/vue'
import { computed, type Component } from 'vue'

import {
  ICON_BADGES,
  ICON_BADGES_CASE_SENSITIVE,
  TEXT_BADGES,
  type IconBadgeName,
} from '@/utils/techBadges'
import { techIconFor, techImageFor } from '@/utils/techIcons'

const props = defineProps<{
  /** The chip's label, e.g. "Docker" or "Microsoft Azure". Unknown labels render nothing. */
  name: string
  size?: number
}>()

const ICON_COMPONENTS: Record<IconBadgeName, Component> = {
  'shield-check': PhShieldCheck,
  'shield-checkered': PhShieldCheckered,
  crosshair: PhCrosshair,
  path: PhPath,
  'hard-drives': PhHardDrives,
  bug: PhBug,
  'lock-key': PhLockKey,
  network: PhShareNetwork,
  users: PhUsersThree,
  trophy: PhTrophy,
  presentation: PhPresentationChart,
  medal: PhMedal,
  database: PhDatabase,
  heartbeat: PhHeartbeat,
}

const height = computed(() => props.size ?? 14)
const key = computed(() => props.name.trim().toLowerCase())

// 1. a real logo (vector, then vendor image), 2. a line icon for a general skill,
// 3. a lettered tile for a named tool or cert.
const logo = computed(() => techIconFor(props.name))
const image = computed(() => (logo.value ? null : techImageFor(props.name)))
const iconName = computed(
  () => ICON_BADGES_CASE_SENSITIVE[props.name.trim()] ?? ICON_BADGES[key.value] ?? null,
)
const iconComponent = computed(() =>
  logo.value || image.value || !iconName.value ? null : ICON_COMPONENTS[iconName.value],
)
const tile = computed(() =>
  logo.value || image.value || iconComponent.value ? null : (TEXT_BADGES[key.value] ?? null),
)

/** Tile width grows with the letters so "NIST" fits as well as "N". */
const tileWidth = computed(() => (tile.value ? Math.max(16, tile.value.text.length * 6 + 6) : 16))
</script>

<template>
  <!-- Logo bodies come from the bundled, build-time icon data (src/utils/techIconData.ts), never from user input. -->
  <svg
    v-if="logo"
    class="tech-logo"
    :viewBox="logo.viewBox"
    :height="height"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
    v-html="logo.body"
  />
  <img
    v-else-if="image"
    class="tech-logo tech-logo--image"
    :src="image"
    alt=""
    :width="height"
    :height="height"
    loading="lazy"
    decoding="async"
  />
  <component
    :is="iconComponent"
    v-else-if="iconComponent"
    class="tech-logo tech-logo--icon"
    :size="height + 1"
    weight="regular"
    aria-hidden="true"
  />
  <svg
    v-else-if="tile"
    class="tech-logo"
    :viewBox="`0 0 ${tileWidth} 16`"
    :height="height"
    aria-hidden="true"
    focusable="false"
  >
    <rect :width="tileWidth" height="16" rx="3.5" :fill="tile.bg" />
    <text
      :x="tileWidth / 2"
      y="8.4"
      text-anchor="middle"
      dominant-baseline="middle"
      :fill="tile.fg"
      font-family="'JetBrains Mono', ui-monospace, monospace"
      font-size="8.5"
      font-weight="700"
    >
      {{ tile.text }}
    </text>
  </svg>
</template>

<style scoped>
.tech-logo {
  flex: none;
  width: auto;
  max-width: 2.6em;
}

.tech-logo--image {
  border-radius: 3px;
  object-fit: contain;
}

.tech-logo--icon {
  color: var(--signal-text);
}
</style>
