import { useEffect, useRef, useState, type RefObject } from 'react'
import { extractFrames, type Frame, type FrameExtractor } from '@/lib/hero/extractFrames'
import { padRect, type Rect } from '@/lib/hero/keyBackground'

export const FRAME_STATUS = {
  loading: 'loading',
  ready: 'ready',
  error: 'error',
} as const

export type FrameStatus = (typeof FRAME_STATUS)[keyof typeof FRAME_STATUS]

export interface VideoFramesOptions {
  count: number
  width: number
  extract?: FrameExtractor
}

export interface VideoFrames {
  framesRef: RefObject<(Frame | undefined)[]>
  boundsRef: RefObject<Rect | null>
  loaded: number
  status: FrameStatus
}

const BOUNDS_PADDING = 0.06

export function useVideoFrames(src: string, { count, width, extract = extractFrames }: VideoFramesOptions): VideoFrames {
  const framesRef = useRef<(Frame | undefined)[]>([])
  const boundsRef = useRef<Rect | null>(null)
  const [loaded, setLoaded] = useState(0)
  const [status, setStatus] = useState<FrameStatus>(FRAME_STATUS.loading)

  useEffect(() => {
    const controller = new AbortController()
    framesRef.current = new Array(count)
    boundsRef.current = null
    setLoaded(0)
    setStatus(FRAME_STATUS.loading)
    let received = 0

    extract(src, {
      count,
      width,
      signal: controller.signal,
      onFrame: ({ index, frame, width: w, height: h, bounds }) => {
        if (controller.signal.aborted) return
        framesRef.current[index] = frame
        if (index === 0) boundsRef.current = bounds ? padRect(bounds, BOUNDS_PADDING, w, h) : { x: 0, y: 0, width: w, height: h }
        received++
        setLoaded(received)
      },
    })
      .then(() => {
        if (!controller.signal.aborted) setStatus(received > 0 ? FRAME_STATUS.ready : FRAME_STATUS.error)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        console.error('[hero] frame extraction failed', err)
        setStatus(FRAME_STATUS.error)
      })

    return () => {
      controller.abort()
      framesRef.current.forEach((f) => {
        if (f && 'close' in f) f.close()
      })
      framesRef.current = []
    }
  }, [src, count, width, extract])

  return { framesRef, boundsRef, loaded, status }
}
