import { useId, type ReactElement } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const ILLUSTRATIONS = {
  reading: 'reading',
  podcasts: 'podcasts',
  hiking: 'hiking',
  plain: 'plain',
} as const

type Illustration = (typeof ILLUSTRATIONS)[keyof typeof ILLUSTRATIONS]

export function illustrationFor(interest: string): Illustration {
  const text = interest.toLowerCase()
  if (/read|book/.test(text)) return ILLUSTRATIONS.reading
  if (/podcast|music|listen/.test(text)) return ILLUSTRATIONS.podcasts
  if (/hik|trek|mountain/.test(text)) return ILLUSTRATIONS.hiking
  return ILLUSTRATIONS.plain
}

const SVG = 'h-auto max-h-[64px] w-full max-w-[96px] overflow-visible'

function Book(): ReactElement {
  return (
    <svg viewBox="0 0 96 64" className={SVG}>
      <path d="M48 14 Q30 6 8 10 V54 Q30 50 48 58 Q66 50 88 54 V10 Q66 6 48 14 Z" fill="var(--iris)" opacity=".18" />
      <path d="M48 16 Q31 9 12 12 V50 Q31 47 48 54 Z" fill="var(--card)" stroke="var(--iris)" strokeWidth="1.6" />
      <path d="M48 16 Q65 9 84 12 V50 Q65 47 48 54 Z" fill="var(--card)" stroke="var(--iris)" strokeWidth="1.6" />
      {[22, 28, 34, 40].map((y) => (
        <path key={y} d={`M18 ${y - 2} Q31 ${y - 5} 43 ${y}`} stroke="var(--iris)" strokeOpacity=".35" strokeWidth="1.4" fill="none" />
      ))}
      {[0, 1].map((i) => (
        <path
          key={i}
          data-page
          d="M48 16 Q65 9 84 12 V50 Q65 47 48 54 Z"
          fill="var(--card)"
          stroke="var(--iris)"
          strokeWidth="1.6"
          className="animate-page-turn [transform-box:view-box] [transform-origin:48px_35px] motion-reduce:hidden"
          style={{ animationDelay: `${i * 1.6}s` }}
        />
      ))}
    </svg>
  )
}

function Headphones(): ReactElement {
  const bars = [0.55, 0.9, 0.7, 1, 0.6]
  return (
    <svg viewBox="0 0 96 64" className={SVG}>
      <path d="M16 40 V32 a32 26 0 0 1 64 0 V40" fill="none" stroke="var(--lagoon)" strokeWidth="4" strokeLinecap="round" />
      <rect x="9" y="36" width="14" height="22" rx="6" fill="var(--lagoon)" />
      <rect x="73" y="36" width="14" height="22" rx="6" fill="var(--lagoon)" />
      {bars.map((h, i) => (
        <rect
          key={i}
          data-eq-bar
          x={33 + i * 7}
          y={58 - 26 * h}
          width="4"
          height={26 * h}
          rx="2"
          fill="var(--iris)"
          className="animate-eq [transform-box:fill-box] [transform-origin:bottom] motion-reduce:animate-none"
          style={{ animationDelay: `${-i * 0.18}s`, animationDuration: `${0.7 + (i % 3) * 0.18}s` }}
        />
      ))}
    </svg>
  )
}

function Mountain({ isAnimated }: { isAnimated: boolean }): ReactElement {
  const trailId = `trail-${useId().replace(/[^\w-]/g, '')}`
  const trail = 'M10 58 C24 56 26 48 36 46 S50 40 52 34 S60 24 66 14'
  return (
    <svg viewBox="0 0 96 64" className={SVG}>
      <path d="M2 60 L36 26 L48 36 L66 12 L94 60 Z" fill="var(--sun)" opacity=".22" />
      <path d="M58 23 L66 12 L74 23 L69 21 L66 24 L62 21 Z" fill="var(--card)" opacity=".9" />
      <path id={trailId} d={trail} fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="3 3" />
      <path
        data-trail
        d={trail}
        pathLength={1}
        fill="none"
        stroke="var(--sun)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="1"
        className="animate-trail-draw motion-reduce:animate-none"
      />
      <g className="animate-flag [transform-box:fill-box] [transform-origin:left_center] motion-reduce:animate-none">
        <line x1="66" y1="14" x2="66" y2="2" stroke="var(--foreground)" strokeWidth="1.4" />
        <path d="M66 2 L76 5 L66 8 Z" fill="var(--rose)" />
      </g>
      <g data-hiker>
        <circle r="3.6" fill="var(--iris)" stroke="var(--card)" strokeWidth="1.5" cx={isAnimated ? 0 : 66} cy={isAnimated ? 0 : 14} />
        {isAnimated && (
          <animateMotion dur="4s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.8;1" calcMode="linear">
            <mpath href={`#${trailId}`} />
          </animateMotion>
        )}
      </g>
    </svg>
  )
}

interface InterestTilesProps {
  interests: string[]
}

export function InterestTiles({ interests }: InterestTilesProps): ReactElement {
  const reducedMotion = usePrefersReducedMotion()
  return (
    <ul className="m-0 mt-6 grid flex-1 list-none grid-cols-3 gap-3 p-0">
      {interests.map((interest) => {
        const kind = illustrationFor(interest)
        const label = interest.replace(/^\P{L}+/u, '')
        return (
          <li
            key={interest}
            data-interest
            data-illustration={kind}
            className="group/tile flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-[color-mix(in_srgb,var(--iris)_7%,transparent)] px-3 py-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_var(--iris)]"
          >
            <span aria-hidden className="grid h-[64px] w-full place-items-center">
              {kind === ILLUSTRATIONS.reading && <Book />}
              {kind === ILLUSTRATIONS.podcasts && <Headphones />}
              {kind === ILLUSTRATIONS.hiking && <Mountain isAnimated={!reducedMotion} />}
              {kind === ILLUSTRATIONS.plain && <span className="text-[32px]">{interest.match(/^\P{L}+/u)?.[0].trim()}</span>}
            </span>
            <span className="text-[15px] font-semibold text-ink">{label}</span>
          </li>
        )
      })}
    </ul>
  )
}
