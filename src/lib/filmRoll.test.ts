import { dustMotes, FILM, frameNumber } from '@/lib/filmRoll'

describe('dustMotes', () => {
  it('creates the requested number of motes, the same on every call', () => {
    expect(dustMotes()).toHaveLength(FILM.dustCount)
    expect(dustMotes(5)).toEqual(dustMotes(5))
  })

  it('keeps every mote inside the projector beam and visibly small', () => {
    dustMotes(40).forEach((m) => {
      expect(m.left).toBeGreaterThanOrEqual(25)
      expect(m.left).toBeLessThanOrEqual(75)
      expect(m.top).toBeGreaterThanOrEqual(8)
      expect(m.top).toBeLessThanOrEqual(88)
      expect(m.size).toBeGreaterThanOrEqual(1.5)
      expect(m.size).toBeLessThanOrEqual(4)
      expect(m.durationS).toBeGreaterThanOrEqual(6)
      expect(m.delayS).toBeLessThanOrEqual(0)
    })
  })

  it('spreads motes out instead of stacking them', () => {
    const lefts = new Set(dustMotes().map((m) => Math.round(m.left / 5)))
    expect(lefts.size).toBeGreaterThan(5)
  })
})

describe('frameNumber', () => {
  it('pads frame numbers like a film counter', () => {
    expect(frameNumber(0)).toBe('01')
    expect(frameNumber(7)).toBe('08')
  })
})
