import { createApp } from 'vue'

import App from '@/App.vue'
import router from '@/router'

// Initialise theme and locale before the first render (sets <html data-theme> and <html lang>).
import '@/composables/useTheme'
import '@/composables/useLocale'

import '@/assets/main.css'

createApp(App).use(router).mount('#app')
