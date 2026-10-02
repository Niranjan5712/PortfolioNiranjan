import { CONTRAIL, contrailPuffs } from '@/lib/contrail'

describe('contrailPuffs', () => {
  it('is deterministic', () => {
    expect(contrailPuffs()).toEqual(contrailPuffs())
    expect(contrailPuffs()).toHaveLength(CONTRAIL.columns * CONTRAIL.rows)
  })

  it('lays puffs left to right in flight order so the trail forms behind the jet', () => {
    const xs = contrailPuffs().map((p) => p.x)
    expect([...xs].sort((a, b) => a - b)).toEqual(xs)
    expect(Math.min(...xs)).toBeLessThanOrEqual(5)
    expect(Math.max(...xs)).toBeGreaterThanOrEqual(95)
  })

  it('covers the full height so the cards are hidden behind the smoke', () => {
    contrailPuffs().forEach((p) => {
      expect(p.y - p.size / 2).toBeLessThanOrEqual(p.y < 50 ? 0 : 50)
      expect(p.y + p.size / 2).toBeGreaterThanOrEqual(p.y < 50 ? 50 : 100)
    })
  })

  it('drifts every puff upward as the smoke clears', () => {
    contrailPuffs().forEach((p) => {
      expect(p.driftY).toBeLessThan(0)
      expect(Math.abs(p.driftX)).toBeLessThanOrEqual(CONTRAIL.maxDriftX)
    })
  })
})
