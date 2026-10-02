import { useId, useRef, type CSSProperties, type ReactElement } from 'react'
import { Medal, ShieldPlus } from 'lucide-react'
import { Section } from '@/components/common/Section'
import { SectionHeading } from '@/components/common/SectionHeading'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useTilt } from '@/hooks/useTilt'
import { contrailPuffs } from '@/lib/contrail'
import { gsap, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'
import type { Award } from '@/types/profile'

interface AwardsProps {
  awards: Award[]
}

const VARIANTS: Record<Award['variant'], string> = {
  iris: 'bg-[linear-gradient(140deg,#2B1D8F,#5A48F5_55%,#12B5A6)]',
  lagoon: 'bg-[linear-gradient(140deg,#0E3A5B,#12B5A6_55%,#FFB547)]',
}

const PUFFS = contrailPuffs()
const BEAM_ON_PROGRESS = 0.92

/** Shows only the 2px padding ring; the shorthand carries `exclude` so no longhand can reset it. */
const BEAM_MASK: CSSProperties = {
  mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
}

function BorderBeam(): ReactElement {
  return (
    <span
      aria-hidden
      data-border-beam
      className="pointer-events-none absolute inset-0 rounded-[inherit] p-[2px] opacity-0 transition-opacity duration-700 group-data-[beam=on]/award:opacity-100"
      style={BEAM_MASK}
    >
      <span className="absolute top-1/2 left-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 animate-beam-spin bg-[conic-gradient(from_0deg,transparent_0_250deg,#ffb547_300deg,#ffffff_345deg,transparent_360deg)] motion-reduce:animate-none" />
    </span>
  )
}

function AwardCard({ award, index }: { award: Award; index: number }): ReactElement {
  const tiltRef = useTilt<HTMLElement>(7)
  const Icon = index === 0 ? Medal : ShieldPlus
  return (
    <article
      ref={tiltRef}
      data-award
      className={cn(
        'tilt group/award relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[30px] p-9 text-white',
        VARIANTS[award.variant],
      )}
    >
      <span aria-hidden className="tilt-glare" />
      <BorderBeam />
      <Icon aria-hidden className="absolute top-7 right-7 size-16 opacity-70" strokeWidth={1.4} />
      <h3 className="m-0 mb-2 text-[clamp(24px,2.6vw,32px)] leading-[1.1] tracking-[-0.03em]">{award.title}</h3>
      <p className="m-0 text-base font-semibold opacity-95">{award.issuer}</p>
      <p className="m-0 mt-1 max-w-[42ch] text-base opacity-85">{award.detail}</p>
    </article>
  )
}

function Jet(): ReactElement {
  const id = `jet-${useId().replace(/[^\w-]/g, '')}`
  return (
    <svg viewBox="0 0 132 44" className="h-auto w-[clamp(100px,11vw,156px)] drop-shadow-[0_10px_14px_rgba(11,14,34,.35)]">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4f66" />
          <stop offset=".5" stopColor="#23273a" />
          <stop offset="1" stopColor="#3a3f55" />
        </linearGradient>
        <radialGradient id={`${id}-burn`} cx="1" cy=".5" r="1">
          <stop offset="0" stopColor="#fff6d6" />
          <stop offset=".35" stopColor="#ffb547" />
          <stop offset="1" stopColor="#ff5d73" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse data-afterburner cx="10" cy="22" rx="12" ry="4.5" fill={`url(#${id}-burn)`} className="animate-afterburner [transform-box:fill-box] [transform-origin:right_center]" />
      <path
        d="M130 22 L108 18.5 L82 17 L62 3 L52 3 L60 17 L30 18 L19 8 L12 8 L16 19 L8 20.5 L8 23.5 L16 25 L12 36 L19 36 L30 26 L60 27 L52 41 L62 41 L82 27 L108 25.5 Z"
        fill={`url(#${id}-body)`}
      />
      <path d="M104 20 Q112 22 104 24 L92 23.4 L92 20.6 Z" fill="#9fe8ff" opacity=".85" />
    </svg>
  )
}

export function Awards({ awards }: AwardsProps): ReactElement {
  const reducedMotion = usePrefersReducedMotion()
  const airspaceRef = useRef<HTMLDivElement>(null)
  const filterId = `smoke-${useId().replace(/[^\w-]/g, '')}`

  useGSAP(
    () => {
      const airspace = airspaceRef.current
      if (reducedMotion || !airspace) return
      const cards = gsap.utils.toArray<HTMLElement>('[data-award]', airspace)
      const setBeam = (isOn: boolean): void => cards.forEach((c) => (c.dataset.beam = isOn ? 'on' : 'off'))
      setBeam(false)

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: airspace,
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => setBeam(self.progress >= BEAM_ON_PROGRESS),
        },
      })

      tl.fromTo('[data-jet]', { xPercent: -15, yPercent: 8 }, { xPercent: 118, yPercent: -6, duration: 1 }, 0)
      tl.fromTo('[data-smoke-band]', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 1 }, 0)
      gsap.utils.toArray<HTMLElement>('[data-puff]', airspace).forEach((puff, i) => {
        const jetPassesAt = Math.max(0, (PUFFS[i].x + 15) / 133 - 0.04)
        tl.fromTo(puff, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: 'power2.out' }, jetPassesAt)
      })
      tl.to('[data-jet]', { opacity: 0, duration: 0.12 }, 0.88)
      tl.addLabel('clear', 1.05)
      tl.to('[data-smoke-band]', { opacity: 0, scaleY: 1.25, y: -30, duration: 0.8, ease: 'power1.in' }, 'clear+=0.1')
      tl.to(
        '[data-puff]',
        {
          x: (i: number) => PUFFS[i].driftX,
          y: (i: number) => PUFFS[i].driftY,
          scale: 1.45,
          opacity: 0,
          duration: 0.9,
          stagger: 0.035,
          ease: 'power1.in',
        },
        'clear',
      )
      tl.fromTo(`#${filterId} feDisplacementMap`, { attr: { scale: 18 } }, { attr: { scale: 70 }, duration: 1.2 }, 'clear')
      cards.forEach((card, i) =>
        tl.fromTo(
          card,
          { opacity: 0.12, scale: 0.97, filter: 'blur(10px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' },
          `clear+=${0.35 + i * 0.15}`,
        ),
      )
    },
    { scope: airspaceRef, dependencies: [reducedMotion] },
  )

  return (
    <Section id="awards" ariaLabel="Awards" className="overflow-x-clip pt-0">
      <SectionHeading
        eyebrow="Recognition"
        title="Recognised where the stakes are highest."
        description="Two defence products, two formal recognitions: one from the Indian Army, one from the Indian Navy."
      />
      <div ref={airspaceRef} data-airspace className="relative">
        <div className="grid gap-[22px] md:grid-cols-2">
          {awards.map((a, i) => (
            <AwardCard key={a.id} award={a} index={i} />
          ))}
        </div>

        {!reducedMotion && (
          <div data-flyby aria-hidden className="pointer-events-none absolute -inset-x-10 -inset-y-6 z-10">
            <svg className="absolute size-0">
              <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.009 0.014" numOctaves="3" seed="7" />
                <feDisplacementMap in="SourceGraphic" scale="18" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </svg>
            <div
              data-smoke
              className="absolute inset-0 md:[filter:var(--smoke-filter)]"
              style={{ '--smoke-filter': `url(#${filterId})` } as CSSProperties}
            >
              <span
                data-smoke-band
                className="absolute inset-x-[1%] inset-y-[4%] rounded-[50%] bg-[radial-gradient(farthest-side,rgba(255,255,255,.96)_58%,rgba(255,255,255,.6)_80%,rgba(255,255,255,0)_100%)] shadow-[0_30px_60px_-30px_rgba(90,72,245,.25)] blur-lg dark:bg-[radial-gradient(farthest-side,rgba(214,218,236,.9)_58%,rgba(214,218,236,.5)_80%,rgba(214,218,236,0)_100%)]"
              />
              {PUFFS.map((p, i) => (
                <span
                  key={i}
                  data-puff
                  className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,.95)_0,rgba(255,255,255,.7)_50%,rgba(255,255,255,0)_100%)] blur-[8px] dark:bg-[radial-gradient(closest-side,rgba(214,218,236,.9)_0,rgba(214,218,236,.6)_50%,rgba(214,218,236,0)_100%)]"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, height: `${p.size}%` }}
                />
              ))}
            </div>
            <div data-jet className="absolute inset-x-0 top-1/2 h-0">
              <span className="absolute top-0 left-0 -translate-x-full -translate-y-1/2 rotate-[-4deg]">
                <Jet />
              </span>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}
