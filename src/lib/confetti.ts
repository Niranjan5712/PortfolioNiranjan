export const CONFETTI_COLORS = ['var(--iris)', 'var(--lagoon)', 'var(--sun)', 'var(--rose)', '#ffffff'] as const

export const CONFETTI_SHAPES = {
  strip: 'strip',
  dot: 'dot',
} as const

export type ConfettiShape = (typeof CONFETTI_SHAPES)[keyof typeof CONFETTI_SHAPES]

export interface ConfettiPiece {
  /** Peak of the arc, relative to the burst origin (px). */
  peakX: number
  peakY: number
  /** Where the piece lands after falling (px). */
  endX: number
  endY: number
  rotation: number
  color: string
  shape: ConfettiShape
  size: number
  delayMs: number
}

function hash(seed: number): number {
  const x = Math.sin(seed * 91.7 + 47.3) * 24634.6345
  return x - Math.floor(x)
}

export interface ConfettiSpread {
  minDeg: number
  maxDeg: number
  minDistance: number
  maxDistance: number
}

const DEFAULT_SPREAD: ConfettiSpread = { minDeg: 200, maxDeg: 340, minDistance: 110, maxDistance: 280 }

/** A deterministic upward burst: pieces fan out within the spread (screen angles, 270° = straight up), then fall. */
export function confettiPieces(count: number, spread: ConfettiSpread = DEFAULT_SPREAD): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((spread.minDeg + hash(i + 1) * (spread.maxDeg - spread.minDeg)) * Math.PI) / 180
    const distance = spread.minDistance + hash(i + 11) * (spread.maxDistance - spread.minDistance)
    const peakX = Math.round(Math.cos(angle) * distance)
    const peakY = Math.round(Math.sin(angle) * distance)
    return {
      peakX,
      peakY,
      endX: Math.round(peakX * 1.35),
      endY: Math.round(peakY + 140 + hash(i + 21) * 120),
      rotation: Math.round((hash(i + 31) - 0.5) * 1440),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      shape: hash(i + 41) > 0.35 ? CONFETTI_SHAPES.strip : CONFETTI_SHAPES.dot,
      size: Math.round(6 + hash(i + 51) * 6),
      delayMs: Math.round(hash(i + 61) * 120),
    }
  })
}
