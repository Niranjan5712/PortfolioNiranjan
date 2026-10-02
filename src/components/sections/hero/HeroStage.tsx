import { useEffect, useRef, type ReactElement, type RefObject } from 'react'
import { FRAME_STATUS, useVideoFrames } from '@/hooks/useVideoFrames'
import { damp, fitContain, frameForProgress, nearestLoaded, pingPong } from '@/lib/hero/heroTimeline'
import type { FrameExtractor } from '@/lib/hero/extractFrames'
import { cn } from '@/lib/utils'

interface HeroStageProps {
  src: string
  progressRef: RefObject<number>
  reducedMotion: boolean
  frameCount?: number
  extract?: FrameExtractor
  className?: string
}

const IDLE_FPS = 9
const IDLE_PROGRESS = 0.002
const SMOOTHING = 9

export function HeroStage({
  src,
  progressRef,
  reducedMotion,
  frameCount = 48,
  extract,
  className,
}: HeroStageProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const width = typeof window !== 'undefined' && window.innerWidth < 820 ? 560 : 900
  const { framesRef, boundsRef, loaded, status } = useVideoFrames(src, { count: frameCount, width, extract })
  const drag = useRef({ active: false, startX: 0, startFrame: 0, target: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let cw = 1
    let ch = 1
    const resize = (): void => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const r = canvas.getBoundingClientRect()
      cw = Math.max(1, r.width)
      ch = Math.max(1, r.height)
      canvas.width = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(canvas)

    let raf = 0
    let last = performance.now()
    let idleClock = 0
    let current = 0

    const draw = (index: number): void => {
      const frames = framesRef.current
      const bounds = boundsRef.current
      if (!bounds || frames.length === 0) return
      const base = Math.floor(index)
      const a = nearestLoaded(base, frames)
      if (a < 0) return
      const fit = fitContain(bounds.width, bounds.height, cw, ch)
      ctx.clearRect(0, 0, cw, ch)
      ctx.globalAlpha = 1
      ctx.drawImage(frames[a]!, bounds.x, bounds.y, bounds.width, bounds.height, fit.x, fit.y, fit.width, fit.height)
      const frac = index - base
      const next = frames[base + 1]
      if (a === base && next && frac > 0.02) {
        ctx.globalAlpha = frac
        ctx.drawImage(next, bounds.x, bounds.y, bounds.width, bounds.height, fit.x, fit.y, fit.width, fit.height)
        ctx.globalAlpha = 1
      }
    }

    const tick = (now: number): void => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (visible) {
        const progress = progressRef.current ?? 0
        let target: number
        if (drag.current.active) target = drag.current.target
        else if (!reducedMotion && progress < IDLE_PROGRESS) {
          idleClock += dt * IDLE_FPS
          target = pingPong(idleClock, frameCount)
        } else target = frameForProgress(progress, frameCount)
        current = reducedMotion ? target : damp(current, target, SMOOTHING, dt)
        draw(current)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onDown = (e: PointerEvent): void => {
      drag.current = { active: true, startX: e.clientX, startFrame: current, target: current }
      canvas.setPointerCapture(e.pointerId)
      canvas.dataset.dragging = 'true'
    }
    const onMove = (e: PointerEvent): void => {
      if (!drag.current.active) return
      const delta = ((e.clientX - drag.current.startX) / cw) * frameCount
      drag.current.target = Math.min(frameCount - 1, Math.max(0, drag.current.startFrame + delta))
    }
    const onUp = (): void => {
      drag.current.active = false
      idleClock = current
      delete canvas.dataset.dragging
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }, [framesRef, boundsRef, progressRef, reducedMotion, frameCount])

  const percent = Math.round((loaded / frameCount) * 100)
  const isWaiting = status === FRAME_STATUS.loading && loaded === 0

  return (
    <div className={cn('relative size-full', className)} data-status={status}>
      <div
        aria-hidden
        className="absolute bottom-[6%] left-1/2 h-[9%] w-[62%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--foreground)_22%,transparent),transparent)] blur-md"
      />
      <div
        aria-hidden
        className="absolute bottom-[4%] left-1/2 h-[14%] w-[78%] -translate-x-1/2 rounded-[50%] border border-dashed border-ink/20"
      />
      {status === FRAME_STATUS.error ? (
        <video
          className="absolute inset-0 size-full rounded-3xl object-cover"
          src={src}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
      ) : (
        <canvas
          ref={canvasRef}
          data-testid="hero-canvas"
          className="absolute inset-0 size-full cursor-grab touch-pan-y select-none data-[dragging=true]:cursor-grabbing"
        />
      )}
      {isWaiting && (
        <div className="absolute inset-0 grid place-items-center" role="status" aria-live="polite">
          <span className="rounded-full border border-line bg-surface/80 px-4 py-2 text-sm text-ink-soft backdrop-blur">
            Loading 3D {percent}%
          </span>
        </div>
      )}
    </div>
  )
}
