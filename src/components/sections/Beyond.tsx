import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'
import { Section } from '@/components/common/Section'
import { SectionHeading } from '@/components/common/SectionHeading'
import { InterestTiles } from '@/components/sections/beyond/InterestTiles'
import { useCountUp } from '@/hooks/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useRevealOnce } from '@/hooks/useRevealOnce'
import { CONFETTI_SHAPES, confettiPieces } from '@/lib/confetti'
import type { Beyond as BeyondContent, BeyondNumber } from '@/types/profile'

interface BeyondProps {
  content: BeyondContent
}

export const COUNT_MS = 1400
const CANNON = confettiPieces(24, { minDeg: 282, maxDeg: 330, minDistance: 170, maxDistance: 320 })
const CANNONS = [
  { side: 'left', className: 'left-[6%]', flip: 1 },
  { side: 'right', className: 'right-[6%]', flip: -1 },
] as const

const SPOTLIGHTS = [
  { left: '8%', color: 'var(--iris)', durationS: 6.5, delayS: 0 },
  { left: '38%', color: 'var(--lagoon)', durationS: 5.2, delayS: -1.6 },
  { left: '68%', color: 'var(--sun)', durationS: 7.4, delayS: -3.1 },
] as const

interface StageNumberProps {
  number: BeyondNumber
  isActive: boolean
}

function StageNumber({ number, isActive }: StageNumberProps): ReactElement {
  const value = useCountUp(number.value, { active: isActive, durationMs: COUNT_MS })
  return (
    <div>
      <strong className="block text-[48px] leading-none tracking-[-0.05em]">
        <span aria-hidden>
          {Math.round(value)}
          {number.suffix}
        </span>
        <span className="sr-only">
          {number.value}
          {number.suffix}
        </span>
      </strong>
      <span className="mt-1 block text-sm text-white/65">{number.label}</span>
    </div>
  )
}

function Confetti(): ReactElement {
  return (
    <div data-confetti aria-hidden className="pointer-events-none absolute inset-0 z-10">
      {CANNONS.map((cannon) => (
        <div key={cannon.side} className={`absolute bottom-0 ${cannon.className}`}>
          {CANNON.map((p, i) => (
            <i
              key={i}
              data-confetti-piece
              className={`absolute animate-confetti ${p.shape === CONFETTI_SHAPES.dot ? 'rounded-full' : 'rounded-[2px]'}`}
              style={
                {
                  width: p.shape === CONFETTI_SHAPES.dot ? p.size : p.size * 0.45,
                  height: p.size,
                  background: p.color,
                  animationDelay: `${p.delayMs}ms`,
                  '--peak-x': `${p.peakX * cannon.flip}px`,
                  '--peak-y': `${p.peakY}px`,
                  '--end-x': `${p.endX * cannon.flip}px`,
                  '--end-y': `${p.endY}px`,
                  '--spin': `${p.rotation * cannon.flip}deg`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function Beyond({ content }: BeyondProps): ReactElement {
  const reducedMotion = usePrefersReducedMotion()
  const { ref, isRevealed } = useRevealOnce<HTMLElement>({ threshold: 0.45 })
  const [hasBurst, setHasBurst] = useState(false)

  useEffect(() => {
    if (!isRevealed || reducedMotion) return
    const t = window.setTimeout(() => setHasBurst(true), COUNT_MS)
    return () => window.clearTimeout(t)
  }, [isRevealed, reducedMotion])

  return (
    <Section id="beyond" ariaLabel="Beyond the roadmap" className="pt-0 pb-[clamp(48px,6vw,80px)]">
      <SectionHeading eyebrow="Off the clock" title="Beyond the roadmap." />
      <div className="grid gap-[22px] md:grid-cols-[1.3fr_1fr]">
        <article
          ref={ref}
          data-stage
          className="dark relative isolate overflow-hidden rounded-[30px] border border-white/10 bg-[#0B0E22] p-[34px] text-white shadow-[0_40px_90px_-45px_color-mix(in_srgb,var(--iris)_80%,transparent)]"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            {SPOTLIGHTS.map((s) => (
              <span
                key={s.left}
                data-spotlight
                className="absolute -top-3 h-[150%] w-[34%] origin-top animate-spotlight opacity-70 mix-blend-screen [clip-path:polygon(44%_0,56%_0,100%_100%,0_100%)] motion-reduce:animate-none"
                style={{
                  left: s.left,
                  background: `linear-gradient(180deg, color-mix(in srgb, ${s.color} 60%, transparent), transparent 70%)`,
                  animationDuration: `${s.durationS}s`,
                  animationDelay: `${s.delayS}s`,
                }}
              />
            ))}
            {SPOTLIGHTS.map((s) => (
              <span
                key={`lamp-${s.left}`}
                className="absolute top-0 h-1.5 w-8 -translate-x-1/2 rounded-b-full"
                style={{ left: `calc(${s.left} + 17%)`, background: s.color, boxShadow: `0 0 18px 4px ${s.color}` }}
              />
            ))}
            <span className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(60%_80%_at_50%_100%,color-mix(in_srgb,var(--iris)_35%,transparent),transparent_70%)]" />
          </div>

          <p className="m-0 mb-3 inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.18em] text-white/70 uppercase">
            <i className="size-2 animate-pulse rounded-full bg-rose motion-reduce:animate-none" />
            Live events
          </p>
          <h3 className="m-0 mb-2.5 text-[26px] tracking-[-0.03em]">{content.title}</h3>
          <p className="m-0 max-w-[52ch] text-white/75">{content.detail}</p>
          <div className="mt-6 flex gap-10">
            {content.numbers.map((n) => (
              <StageNumber key={n.id} number={n} isActive={isRevealed} />
            ))}
          </div>
          {hasBurst && <Confetti />}
        </article>

        <article className="flex flex-col rounded-[30px] border border-line bg-surface p-[34px]">
          <h3 className="m-0 mb-2.5 text-[26px] tracking-[-0.03em]">When I’m offline</h3>
          <p className="m-0 text-ink-soft">What keeps my thinking fresh.</p>
          <InterestTiles interests={content.interests} />
        </article>
      </div>
    </Section>
  )
}
