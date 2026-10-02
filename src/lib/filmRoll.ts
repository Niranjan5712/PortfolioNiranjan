export const FILM = {
  copies: 4,
  /** How far the strip advances (px) over the whole pinned scroll. */
  scrollShiftPx: 560,
  tiltDeg: -4,
  dustCount: 22,
} as const

export interface DustMote {
  left: number
  top: number
  size: number
  durationS: number
  delayS: number
  driftX: number
}

/** Deterministic 0..1 value for a seed, so dust sits in the same place on every render. */
function hash(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Dust motes floating inside the projector beam (left/top in % of the stage). */
export function dustMotes(count: number = FILM.dustCount): DustMote[] {
  return Array.from({ length: count }, (_, i) => {
    const spread = 0.25 + hash(i + 1) * 0.5
    return {
      left: Math.round(spread * 1000) / 10,
      top: Math.round((8 + hash(i + 101) * 80) * 10) / 10,
      size: 1.5 + Math.round(hash(i + 201) * 25) / 10,
      durationS: 6 + Math.round(hash(i + 301) * 60) / 10,
      delayS: -Math.round(hash(i + 401) * 80) / 10,
      driftX: Math.round((hash(i + 501) - 0.5) * 60),
    }
  })
}

export function frameNumber(index: number): string {
  return String(index + 1).padStart(2, '0')
}
