import type { Rect } from '@/lib/hero/keyBackground'

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function frameForProgress(progress: number, frameCount: number): number {
  if (frameCount <= 1) return 0
  return clamp01(progress) * (frameCount - 1)
}

export function pingPong(t: number, frameCount: number): number {
  if (frameCount <= 1) return 0
  const span = frameCount - 1
  const cycle = ((t % (span * 2)) + span * 2) % (span * 2)
  return cycle <= span ? cycle : span * 2 - cycle
}

export function revealThresholds(count: number, start: number, end: number): number[] {
  if (count <= 0) return []
  if (count === 1) return [start]
  const step = (end - start) / (count - 1)
  return Array.from({ length: count }, (_, i) => +(start + i * step).toFixed(4))
}

export function revealedCount(progress: number, thresholds: number[]): number {
  return thresholds.filter((t) => progress >= t).length
}

/** Frame-rate independent exponential smoothing toward a target. */
export function damp(current: number, target: number, lambda: number, dtSeconds: number): number {
  return target + (current - target) * Math.exp(-lambda * dtSeconds)
}

export function fitContain(srcWidth: number, srcHeight: number, dstWidth: number, dstHeight: number): Rect {
  const scale = Math.min(dstWidth / srcWidth, dstHeight / srcHeight)
  const width = srcWidth * scale
  const height = srcHeight * scale
  return { x: (dstWidth - width) / 2, y: (dstHeight - height) / 2, width, height }
}

export function nearestLoaded(index: number, loaded: ArrayLike<unknown>): number {
  const n = loaded.length
  const start = Math.round(Math.min(n - 1, Math.max(0, index)))
  for (let d = 0; d < n; d++) {
    if (start - d >= 0 && loaded[start - d]) return start - d
    if (start + d < n && loaded[start + d]) return start + d
  }
  return -1
}
