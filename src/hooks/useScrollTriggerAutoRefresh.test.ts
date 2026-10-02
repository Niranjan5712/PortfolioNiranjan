import { renderHook } from '@testing-library/react'
import { useScrollTriggerAutoRefresh } from '@/hooks/useScrollTriggerAutoRefresh'
import { ScrollTrigger } from '@/lib/gsap'

describe('useScrollTriggerAutoRefresh', () => {
  const OriginalObserver = globalThis.ResizeObserver
  let notify: () => void = () => undefined
  let disconnect: jest.Mock
  let height = 1000

  beforeEach(() => {
    jest.useFakeTimers()
    disconnect = jest.fn()
    height = 1000
    Object.defineProperty(document.body, 'scrollHeight', { configurable: true, get: () => height })
    globalThis.ResizeObserver = class {
      constructor(cb: () => void) {
        notify = cb
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {
        disconnect()
      }
    } as unknown as typeof ResizeObserver
  })

  afterEach(() => {
    globalThis.ResizeObserver = OriginalObserver
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('refreshes once after the page height changes and settles', () => {
    const refresh = jest.spyOn(ScrollTrigger, 'refresh').mockImplementation(() => undefined)
    renderHook(() => useScrollTriggerAutoRefresh())

    height = 1040
    notify()
    height = 1080
    notify()
    expect(refresh).not.toHaveBeenCalled()
    jest.advanceTimersByTime(250)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('ignores resizes that keep the same height and disconnects on unmount', () => {
    const refresh = jest.spyOn(ScrollTrigger, 'refresh').mockImplementation(() => undefined)
    const { unmount } = renderHook(() => useScrollTriggerAutoRefresh())
    notify()
    jest.advanceTimersByTime(250)
    expect(refresh).not.toHaveBeenCalled()
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})
