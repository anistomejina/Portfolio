import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// BASE_PATH lets the same code run locally at "/" and on GitHub Pages at "/Portfolio/".
// The deploy workflow sets it; locally it falls back to the site root.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
