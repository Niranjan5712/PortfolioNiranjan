import { act, renderHook } from '@testing-library/react'
import { useCycle } from '@/hooks/useCycle'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

describe('useCycle', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('advances and wraps around on an interval', () => {
    const { result } = renderHook(() => useCycle(3, 1000))
    expect(result.current).toBe(0)
    act(() => jest.advanceTimersByTime(1000))
    expect(result.current).toBe(1)
    act(() => jest.advanceTimersByTime(2000))
    expect(result.current).toBe(0)
  })

  it('stays put when disabled', () => {
    const { result } = renderHook(() => useCycle(3, 1000, false))
    act(() => jest.advanceTimersByTime(5000))
    expect(result.current).toBe(0)
  })
})

describe('usePrefersReducedMotion', () => {
  it('reflects the media query', () => {
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })
})
