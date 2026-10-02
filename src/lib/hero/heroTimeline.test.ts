import {
  clamp01,
  damp,
  fitContain,
  frameForProgress,
  nearestLoaded,
  pingPong,
  revealedCount,
  revealThresholds,
} from '@/lib/hero/heroTimeline'

describe('clamp01', () => {
  it('clamps to the unit range', () => {
    expect(clamp01(-0.5)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(3)).toBe(1)
  })
})

describe('frameForProgress', () => {
  it('maps scroll progress onto the frame range', () => {
    expect(frameForProgress(0, 48)).toBe(0)
    expect(frameForProgress(0.5, 49)).toBe(24)
    expect(frameForProgress(1, 48)).toBe(47)
    expect(frameForProgress(2, 48)).toBe(47)
  })

  it('handles single-frame clips', () => {
    expect(frameForProgress(0.7, 1)).toBe(0)
  })
})

describe('pingPong', () => {
  it('bounces between the first and last frame', () => {
    expect(pingPong(0, 5)).toBe(0)
    expect(pingPong(4, 5)).toBe(4)
    expect(pingPong(6, 5)).toBe(2)
    expect(pingPong(8, 5)).toBe(0)
    expect(pingPong(-1, 5)).toBe(1)
  })
})

describe('reveal schedule', () => {
  it('spreads thresholds evenly across the window', () => {
    expect(revealThresholds(4, 0.3, 0.75)).toEqual([0.3, 0.45, 0.6, 0.75])
    expect(revealThresholds(1, 0.3, 0.75)).toEqual([0.3])
    expect(revealThresholds(0, 0.3, 0.75)).toEqual([])
  })

  it('counts how many items are revealed at a given progress', () => {
    const t = [0.3, 0.45, 0.6, 0.75]
    expect(revealedCount(0.1, t)).toBe(0)
    expect(revealedCount(0.5, t)).toBe(2)
    expect(revealedCount(1, t)).toBe(4)
  })
})

describe('damp', () => {
  it('moves toward the target without overshooting', () => {
    const next = damp(0, 10, 8, 1 / 60)
    expect(next).toBeGreaterThan(0)
    expect(next).toBeLessThan(10)
  })

  it('is frame-rate independent', () => {
    const oneStep = damp(0, 10, 8, 2 / 60)
    const twoSteps = damp(damp(0, 10, 8, 1 / 60), 10, 8, 1 / 60)
    expect(oneStep).toBeCloseTo(twoSteps, 10)
  })
})

describe('fitContain', () => {
  it('letterboxes a wide source into a square', () => {
    expect(fitContain(200, 100, 100, 100)).toEqual({ x: 0, y: 25, width: 100, height: 50 })
  })
})

describe('nearestLoaded', () => {
  it('finds the closest available frame', () => {
    const loaded = [true, undefined, undefined, true, undefined]
    expect(nearestLoaded(1, loaded)).toBe(0)
    expect(nearestLoaded(2.6, loaded)).toBe(3)
    expect(nearestLoaded(4, loaded)).toBe(3)
  })

  it('returns -1 when nothing is loaded', () => {
    expect(nearestLoaded(0, [undefined, undefined])).toBe(-1)
  })
})
