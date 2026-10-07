import type { Engine } from '@tsparticles/engine'

let enginePromise: Promise<Engine> | null = null

/**
 * Lazily loads tsParticles (engine + basic bundle + text shape) on first use, in its own chunk.
 * The promise is shared app-wide; when loading fails it is forgotten so a later call retries.
 *
 *   const engine = await loadParticlesEngine()
 *   const container = await engine.load({ element, options })
 */
export function loadParticlesEngine(): Promise<Engine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const [{ tsParticles }, { loadBasic }, { loadTextShape }] = await Promise.all([
        import('@tsparticles/engine'),
        import('@tsparticles/basic'),
        import('@tsparticles/shape-text'),
      ])
      await loadBasic(tsParticles)
      await loadTextShape(tsParticles)
      return tsParticles
    })().catch((error: unknown) => {
      enginePromise = null
      throw error
    })
  }
  return enginePromise
}
