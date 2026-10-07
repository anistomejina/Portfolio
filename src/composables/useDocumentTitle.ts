import { onBeforeUnmount, watch, type WatchSource } from 'vue'

/**
 * Keeps `document.title` in sync with a reactive source while the calling component is mounted,
 * and restores the title that was in place before it once the component unmounts.
 *
 *   useDocumentTitle(() => pageTitle(project.value?.title ?? copy.value.projects.notFoundTitle))
 */
export function useDocumentTitle(source: WatchSource<string>): void {
  if (typeof document === 'undefined') return

  const previousTitle = document.title

  watch(
    source,
    (title) => {
      if (title) document.title = title
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    document.title = previousTitle
  })
}
