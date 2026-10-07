import { getCurrentScope, onScopeDispose, readonly, ref, type Ref } from 'vue'

/** The 32 symbols random characters are drawn from: A–Z plus ! @ # $ % _ */
export const SCRAMBLE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%_'

export type TextScrambleOptions = {
  /** Ticks per revealed character (default 3; ScrambleName uses 4). */
  revealDelayFrames?: number
  /** Milliseconds between ticks (default 35; ScrambleName uses 30). */
  frameInterval?: number
}

export type TextScramble = {
  /** The string to render: the real text at rest, scrambled while running. */
  display: Readonly<Ref<string>>
  /** True while a run is in progress. */
  isRunning: Readonly<Ref<boolean>>
  /** Start a run (ignored while one is already running). */
  play: () => void
  /** Stop immediately and show the real text. */
  stop: () => void
}

const DEFAULT_REVEAL_DELAY_FRAMES = 3
const DEFAULT_FRAME_INTERVAL = 35

function randomSymbol(): string {
  return SCRAMBLE_ALPHABET.charAt(Math.floor(Math.random() * SCRAMBLE_ALPHABET.length))
}

/** Positive numeric option, or the fallback when missing / invalid. */
function positive(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
}

/**
 * Text "decrypt" effect: every character flickers through random symbols and one more character
 * locks in from the left every `revealDelayFrames` ticks. Spaces are preserved.
 * `text` is captured once (not reactive). Must be called from a component's setup();
 * the timer is cleared on unmount.
 */
export function useTextScramble(text: string, options: TextScrambleOptions = {}): TextScramble {
  const ticksPerChar = Math.max(
    1,
    Math.round(positive(options.revealDelayFrames, DEFAULT_REVEAL_DELAY_FRAMES)),
  )
  const tickMs = positive(options.frameInterval, DEFAULT_FRAME_INTERVAL)

  // Code points, so a name with an astral character (emoji, rare CJK) never gets split in half.
  const glyphs = Array.from(text)
  const lastTick = glyphs.length * ticksPerChar

  const display = ref(text)
  const isRunning = ref(false)

  let timer: ReturnType<typeof setInterval> | undefined
  let tick = 0

  function clearTimer(): void {
    if (timer !== undefined) {
      clearInterval(timer)
      timer = undefined
    }
  }

  function stop(): void {
    clearTimer()
    display.value = text
    isRunning.value = false
  }

  /** One frame: characters left of the reveal point are final, the rest are re-rolled. */
  function step(): void {
    tick += 1

    if (tick >= lastTick) {
      stop()
      return
    }

    const lockedCount = Math.floor(tick / ticksPerChar)
    let frame = ''
    for (let position = 0; position < glyphs.length; position += 1) {
      const glyph = glyphs[position] as string
      frame += position < lockedCount || /\s/.test(glyph) ? glyph : randomSymbol()
    }
    display.value = frame
  }

  function play(): void {
    if (isRunning.value || glyphs.length === 0) return

    isRunning.value = true
    tick = 0
    timer = setInterval(step, tickMs)
  }

  // Works in components and in any effect scope; nothing to register outside one.
  if (getCurrentScope()) onScopeDispose(clearTimer)

  return { display: readonly(display), isRunning: readonly(isRunning), play, stop }
}
