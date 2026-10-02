import { alphaBounds, keyBackground, type Rect } from '@/lib/hero/keyBackground'

export type Frame = ImageBitmap | HTMLCanvasElement

export interface ExtractedFrame {
  index: number
  frame: Frame
  width: number
  height: number
  bounds: Rect | null
}

export interface ExtractOptions {
  count: number
  width: number
  signal?: AbortSignal
  onFrame: (frame: ExtractedFrame) => void
}

export type FrameExtractor = (src: string, opts: ExtractOptions) => Promise<void>

function waitFor(el: HTMLVideoElement, event: 'loadeddata' | 'seeked', signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = (): void => {
      el.removeEventListener(event, done)
      el.removeEventListener('error', fail)
      resolve()
    }
    const fail = (): void => {
      el.removeEventListener(event, done)
      reject(new Error(`video ${event} failed`))
    }
    el.addEventListener(event, done, { once: true })
    el.addEventListener('error', fail, { once: true })
    signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true })
  })
}

async function toFrame(canvas: HTMLCanvasElement): Promise<Frame> {
  if (typeof createImageBitmap === 'function') return createImageBitmap(canvas)
  const copy = document.createElement('canvas')
  copy.width = canvas.width
  copy.height = canvas.height
  copy.getContext('2d')?.drawImage(canvas, 0, 0)
  return copy
}

/** Decodes evenly spaced frames from a video, removes the light backdrop, and streams them out. */
export const extractFrames: FrameExtractor = async (src, { count, width, signal, onFrame }) => {
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.src = src

  try {
    await waitFor(video, 'loadeddata', signal)
    const scale = Math.min(1, width / video.videoWidth)
    const w = Math.round(video.videoWidth * scale)
    const h = Math.round(video.videoHeight * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('2d context unavailable')
    const lastTime = Math.max(0, video.duration - 0.05)

    for (let index = 0; index < count; index++) {
      if (signal?.aborted) return
      video.currentTime = count === 1 ? 0 : (index / (count - 1)) * lastTime
      await waitFor(video, 'seeked', signal)
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(video, 0, 0, w, h)
      const image = ctx.getImageData(0, 0, w, h)
      keyBackground(image.data, w, h)
      ctx.putImageData(image, 0, 0)
      const bounds = index === 0 ? alphaBounds(image.data, w, h) : null
      onFrame({ index, frame: await toFrame(canvas), width: w, height: h, bounds })
    }
  } finally {
    video.removeAttribute('src')
    video.load()
  }
}
