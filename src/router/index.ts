import { createRouter, createWebHistory, type RouterScrollBehavior } from 'vue-router'

import { prefersReducedMotion } from '@/utils/motion'

/** Space left above an element when a URL hash scrolls to it. */
const HASH_SCROLL_OFFSET = 24

/** Longest wait for images still loading before a hash scroll starts anyway. */
const HASH_SCROLL_IMAGE_WAIT_MS = 1500

/**
 * Resolves once every eagerly loaded image that is still in flight has loaded or failed (or after
 * HASH_SCROLL_IMAGE_WAIT_MS). Images have no reserved height until they load (e.g. the hero image
 * of a project page), so scrolling earlier would stop one image-height short of the target.
 * Lazy images are not awaited: they load around the viewport and scroll anchoring absorbs them.
 */
function eagerImagesSettled(): Promise<void> {
  const pending = Array.from(document.images).filter(
    (image) => !image.complete && image.loading !== 'lazy',
  )
  if (pending.length === 0) return Promise.resolve()

  return new Promise((resolve) => {
    let remaining = pending.length
    const timer = window.setTimeout(resolve, HASH_SCROLL_IMAGE_WAIT_MS)
    const settle = () => {
      remaining -= 1
      if (remaining === 0) {
        window.clearTimeout(timer)
        resolve()
      }
    }
    for (const image of pending) {
      image.addEventListener('load', settle, { once: true })
      image.addEventListener('error', settle, { once: true })
    }
  })
}

const scrollBehavior: RouterScrollBehavior = async (to, _from, savedPosition) => {
  // Back/forward: restore where the visitor was.
  if (savedPosition) return savedPosition

  // /#projects, /blog/slug#section: glide to the target, always leaving 24px above it
  // (vue-router scrolls the window itself, so CSS scroll-margin-top is not consulted).
  if (to.hash) {
    let selector = to.hash
    try {
      selector = decodeURIComponent(to.hash)
    } catch {
      // Malformed escape sequence: use the hash as written.
    }
    await eagerImagesSettled()
    return {
      el: selector,
      top: HASH_SCROLL_OFFSET,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    }
  }

  // Any other navigation starts at the top.
  return { top: 0 }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/experience',
      name: 'experience',
      component: () => import('@/views/ExperienceView.vue'),
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
    },
    {
      path: '/projects/:slug',
      name: 'project-detail',
      component: () => import('@/views/ProjectDetailView.vue'),
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('@/views/BlogView.vue'),
    },
    {
      path: '/blog/:slug',
      name: 'blog-detail',
      component: () => import('@/views/BlogDetailView.vue'),
    },
    {
      // Unknown paths go home.
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
