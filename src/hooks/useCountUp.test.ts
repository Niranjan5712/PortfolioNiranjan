import { act, renderHook } from '@testing-library/react'
import { useCountUp } from '@/hooks/useCountUp'

describe('useCountUp', () => {
  let now = 0
  let frames: FrameRequestCallback[] = []

  beforeEach(() => {
    now = 0
    frames = []
    jest.spyOn(performance, 'now').mockImplementation(() => now)
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => frames.push(cb))
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  function advance(ms: number): void {
    now += ms
    const pending = frames
    frames = []
    act(() => pending.forEach((cb) => cb(now)))
  }

  it('stays at 0 until active', () => {
    const { result } = renderHook(() => useCountUp(75, { active: false }))
    expect(result.current).toBe(0)
  })

  it('counts up to the target over the duration', () => {
    const { result, rerender } = renderHook(({ active }) => useCountUp(75, { active, durationMs: 1000 }), {
      initialProps: { active: false },
    })
    rerender({ active: true })
    advance(300)
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(75)
    advance(800)
    expect(result.current).toBe(75)
  })

  it('jumps straight to the target when reduced motion is preferred', () => {
    const original = window.matchMedia
    window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes('reduce') })) as typeof window.matchMedia
    const { result } = renderHook(() => useCountUp(8, { active: false }))
    expect(result.current).toBe(8)
    window.matchMedia = original
  })
})
