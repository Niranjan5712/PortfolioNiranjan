import { CONFETTI_COLORS, confettiPieces } from '@/lib/confetti'

describe('confettiPieces', () => {
  it('makes the same burst every time', () => {
    expect(confettiPieces(10)).toEqual(confettiPieces(10))
    expect(confettiPieces(36)).toHaveLength(36)
  })

  it('shoots every piece upwards first, then lets it fall below its peak', () => {
    confettiPieces(60).forEach((p) => {
      expect(p.peakY).toBeLessThan(0)
      expect(p.endY).toBeGreaterThan(p.peakY)
      expect(Math.abs(p.endX)).toBeGreaterThanOrEqual(Math.abs(p.peakX))
    })
  })

  it('fans out to both sides with brand colours and mixed shapes', () => {
    const pieces = confettiPieces(36)
    expect(pieces.some((p) => p.peakX < 0)).toBe(true)
    expect(pieces.some((p) => p.peakX > 0)).toBe(true)
    expect(new Set(pieces.map((p) => p.color)).size).toBe(CONFETTI_COLORS.length)
    expect(new Set(pieces.map((p) => p.shape)).size).toBe(2)
  })

  it('keeps a cannon inside its spread', () => {
    const spread = { minDeg: 255, maxDeg: 265, minDistance: 200, maxDistance: 220 }
    confettiPieces(30, spread).forEach((p) => {
      expect(p.peakX).toBeLessThan(0)
      expect(Math.hypot(p.peakX, p.peakY)).toBeGreaterThanOrEqual(199)
      expect(Math.hypot(p.peakX, p.peakY)).toBeLessThanOrEqual(221)
    })
  })
})
