import { createRouter, createWebHistory, type RouterScrollBehavior } from 'vue-router'

import { prefersReducedMotion } from '@/utils/motion'

/** Space left above an element when a URL hash scrolls to it. */
const HASH_SCROLL_OFFSET = 24

const scrollBehavior: RouterScrollBehavior = (to, _from, savedPosition) => {
  // Back/forward: restore where the visitor was.
  if (savedPosition) return savedPosition

  // /#projects, /blog/slug#section: glide to the target, leaving its scroll-margin-top (or 24px)
  // above it, so router scrolling, native fragment scrolling and in-page outline clicks agree.
  if (to.hash) {
    let selector = to.hash
    try {
      selector = decodeURIComponent(to.hash)
    } catch {
      // Malformed escape sequence: use the hash as written.
    }
    const target = document.getElementById(selector.slice(1))
    const margin = target ? Number.parseFloat(getComputedStyle(target).scrollMarginTop) : Number.NaN
    return {
      el: selector,
      top: margin > 0 ? margin : HASH_SCROLL_OFFSET,
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
