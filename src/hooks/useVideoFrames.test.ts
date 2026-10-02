import { renderHook, waitFor } from '@testing-library/react'
import { FRAME_STATUS, useVideoFrames } from '@/hooks/useVideoFrames'
import type { FrameExtractor } from '@/lib/hero/extractFrames'

function fakeFrame(): HTMLCanvasElement {
  return document.createElement('canvas')
}

describe('useVideoFrames', () => {
  it('streams frames into the ref and reports progress, then ready', async () => {
    const extract: FrameExtractor = async (_src, { count, onFrame }) => {
      for (let index = 0; index < count; index++) {
        onFrame({ index, frame: fakeFrame(), width: 100, height: 50, bounds: index === 0 ? { x: 40, y: 10, width: 20, height: 30 } : null })
      }
    }
    const { result } = renderHook(() => useVideoFrames('/v.mp4', { count: 3, width: 100, extract }))
    await waitFor(() => expect(result.current.status).toBe(FRAME_STATUS.ready))
    expect(result.current.loaded).toBe(3)
    expect(result.current.framesRef.current.filter(Boolean)).toHaveLength(3)
    expect(result.current.boundsRef.current).toEqual({ x: 38, y: 8, width: 24, height: 34 })
  })

  it('falls back to the full frame when no subject bounds are found', async () => {
    const extract: FrameExtractor = async (_src, { onFrame }) => {
      onFrame({ index: 0, frame: fakeFrame(), width: 80, height: 40, bounds: null })
    }
    const { result } = renderHook(() => useVideoFrames('/v.mp4', { count: 1, width: 80, extract }))
    await waitFor(() => expect(result.current.status).toBe(FRAME_STATUS.ready))
    expect(result.current.boundsRef.current).toEqual({ x: 0, y: 0, width: 80, height: 40 })
  })

  it('reports an error when extraction fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const extract: FrameExtractor = async () => {
      throw new Error('decode failed')
    }
    const { result } = renderHook(() => useVideoFrames('/v.mp4', { count: 2, width: 80, extract }))
    await waitFor(() => expect(result.current.status).toBe(FRAME_STATUS.error))
    spy.mockRestore()
  })

  it('aborts extraction on unmount', async () => {
    let signal: AbortSignal | undefined
    const extract: FrameExtractor = (_src, opts) => {
      signal = opts.signal
      return new Promise(() => {})
    }
    const { unmount } = renderHook(() => useVideoFrames('/v.mp4', { count: 2, width: 80, extract }))
    unmount()
    expect(signal?.aborted).toBe(true)
  })
})
