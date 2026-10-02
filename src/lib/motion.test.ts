import { countValue, easeOutExpo, magneticOffset, scrollProgress, splitWords, tiltAngles } from '@/lib/motion'

const rect = { left: 100, top: 100, width: 200, height: 100 }

describe('magneticOffset', () => {
  it('pulls toward the pointer relative to the element centre', () => {
    expect(magneticOffset(200, 150, rect, 0.3)).toEqual({ x: 0, y: 0 })
    expect(magneticOffset(300, 200, rect, 0.3)).toEqual({ x: 30, y: 15 })
    expect(magneticOffset(100, 100, rect, 0.5)).toEqual({ x: -50, y: -25 })
  })
})

describe('tiltAngles', () => {
  it('tilts away from the pointer and reports the glare position in percent', () => {
    expect(tiltAngles(200, 150, rect, 8)).toEqual({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 })
    expect(tiltAngles(300, 100, rect, 8)).toEqual({ rotateX: 8, rotateY: 8, glareX: 100, glareY: 0 })
    expect(tiltAngles(100, 200, rect, 8)).toEqual({ rotateX: -8, rotateY: -8, glareX: 0, glareY: 100 })
  })

  it('clamps pointers outside the element', () => {
    expect(tiltAngles(900, 900, rect, 6)).toEqual({ rotateX: -6, rotateY: 6, glareX: 100, glareY: 100 })
  })
})

describe('easeOutExpo', () => {
  it('starts at 0, ends at 1 and front-loads the motion', () => {
    expect(easeOutExpo(0)).toBe(0)
    expect(easeOutExpo(1)).toBe(1)
    expect(easeOutExpo(0.3)).toBeGreaterThan(0.8)
  })

  it('clamps out-of-range input', () => {
    expect(easeOutExpo(-1)).toBe(0)
    expect(easeOutExpo(2)).toBe(1)
  })
})

describe('countValue', () => {
  it('eases from 0 to the target and rounds to the given decimals', () => {
    expect(countValue(75, 0, 0)).toBe(0)
    expect(countValue(75, 1, 0)).toBe(75)
    expect(countValue(9.34, 1, 2)).toBe(9.34)
    expect(Number.isInteger(countValue(75, 0.4, 0))).toBe(true)
  })
})

describe('scrollProgress', () => {
  it('maps scroll position to 0..1 of the scrollable distance', () => {
    expect(scrollProgress(0, 3000, 1000)).toBe(0)
    expect(scrollProgress(1000, 3000, 1000)).toBe(0.5)
    expect(scrollProgress(2000, 3000, 1000)).toBe(1)
  })

  it('handles pages that do not scroll and overscroll', () => {
    expect(scrollProgress(0, 800, 1000)).toBe(0)
    expect(scrollProgress(2500, 3000, 1000)).toBe(1)
    expect(scrollProgress(-50, 3000, 1000)).toBe(0)
  })
})

describe('splitWords', () => {
  it('splits on whitespace and drops empty parts', () => {
    expect(splitWords('  Results, not   roadmaps. ')).toEqual(['Results,', 'not', 'roadmaps.'])
  })
})
