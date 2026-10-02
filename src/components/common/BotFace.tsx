import { useEffect, useId, useRef, type ReactElement } from 'react'
import { useFinePointer } from '@/hooks/useFinePointer'
import type { TwinMood } from '@/lib/twin/chatState'
import { cn } from '@/lib/utils'

interface BotFaceProps {
  className?: string
  mood?: TwinMood
  followPointer?: boolean
}

const PUPIL_RANGE = 2.2

export function BotFace({ className, mood = 'idle', followPointer = false }: BotFaceProps): ReactElement {
  const gradientId = `bot-grad-${useId().replace(/:/g, '')}`
  const svgRef = useRef<SVGSVGElement>(null)
  const isFinePointer = useFinePointer()
  const isTracking = followPointer && isFinePointer

  useEffect(() => {
    const svg = svgRef.current
    if (!isTracking || !svg) return
    let frame = 0
    const onMove = (e: PointerEvent): void => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = svg.getBoundingClientRect()
        const dx = e.clientX - (box.left + box.width / 2)
        const dy = e.clientY - (box.top + box.height / 2)
        const dist = Math.hypot(dx, dy) || 1
        const reach = Math.min(1, dist / 280) * PUPIL_RANGE
        svg.style.setProperty('--px', `${((dx / dist) * reach).toFixed(2)}px`)
        svg.style.setProperty('--py', `${((dy / dist) * reach).toFixed(2)}px`)
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [isTracking])

  const pupilTransform = mood === 'thinking' ? 'translate(1.8px, -2.4px)' : 'translate(var(--px, 0px), var(--py, 0px))'

  return (
    <svg
      ref={svgRef}
      className={cn('block overflow-visible', className)}
      viewBox="0 0 64 64"
      aria-hidden
      data-testid="bot-face"
      data-mood={mood}
    >
      <defs>
        <radialGradient id={gradientId} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#9C8CFF" />
          <stop offset=".6" stopColor="#5A48F5" />
          <stop offset="1" stopColor="#2B1D8F" />
        </radialGradient>
      </defs>
      <line x1="32" y1="10" x2="32" y2="4" stroke="#5A48F5" strokeWidth="2.5" strokeLinecap="round" />
      <circle
        cx="32"
        cy="4"
        r="3.2"
        fill="#FFB547"
        className={cn(mood !== 'idle' && 'motion-safe:animate-pulse')}
      />
      <circle cx="32" cy="36" r="26" fill={`url(#${gradientId})`} />
      <ellipse cx="25" cy="24" rx="9" ry="5" fill="#fff" opacity=".18" />
      <g data-part="eyes" className="origin-center [transform-box:fill-box] motion-safe:animate-blink">
        <ellipse cx="23.5" cy="34" rx="4" ry="5.4" fill="#fff" />
        <ellipse cx="40.5" cy="34" rx="4" ry="5.4" fill="#fff" />
        <g data-part="pupils" className="transition-transform duration-300 ease-out" style={{ transform: pupilTransform }}>
          <circle cx="23.5" cy="35" r="2.3" fill="#1B1066" />
          <circle cx="40.5" cy="35" r="2.3" fill="#1B1066" />
        </g>
      </g>
      <circle cx="17" cy="43" r="3.4" fill="#F2567B" opacity=".45" />
      <circle cx="47" cy="43" r="3.4" fill="#F2567B" opacity=".45" />
      {mood === 'talking' ? (
        <ellipse
          data-part="mouth-talking"
          cx="32"
          cy="46.5"
          rx="4.6"
          ry="3.4"
          fill="#fff"
          className="origin-center [transform-box:fill-box] motion-safe:animate-talk"
        />
      ) : (
        <path
          data-part="mouth"
          d={mood === 'thinking' ? 'M28 46.5 Q32 47.5 36 46.5' : 'M26 45 Q32 50 38 45'}
          stroke="#fff"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}
