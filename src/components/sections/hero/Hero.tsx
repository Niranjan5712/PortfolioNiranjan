import { useRef, useState, type ReactElement } from 'react'
import { Play } from 'lucide-react'
import { Magnetic } from '@/components/common/Magnetic'
import { HeroHotspot } from '@/components/sections/hero/HeroHotspot'
import { HeroStage } from '@/components/sections/hero/HeroStage'
import { Button } from '@/components/ui/button'
import { useCycle } from '@/hooks/useCycle'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '@/lib/gsap'
import { revealedCount, revealThresholds } from '@/lib/hero/heroTimeline'
import type { HeroContent } from '@/types/profile'

interface HeroProps {
  content: HeroContent
  videoSrc: string
}

const DIAL_CIRCUMFERENCE = 2 * Math.PI * 22
const PIN_LENGTH = '+=170%'
const OUTLINE_WORD = 'ai product manager · ai product manager · '

function SplitWord({ text, offset }: { text: string; offset: number }): ReactElement {
  return (
    <span className="block overflow-hidden pb-[0.06em]" aria-hidden>
      {[...text].map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className="inline-block animate-rise motion-reduce:animate-none"
          style={{ animationDelay: `${0.15 + (offset + i) * 0.038}s` }}
        >
          {ch}
        </span>
      ))}
    </span>
  )
}

export function Hero({ content, videoSrc }: HeroProps): ReactElement {
  const reducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const progressRef = useRef(0)
  const revealedRef = useRef(0)
  const [revealed, setRevealed] = useState(0)
  const roleIndex = useCycle(content.roles.length, 2800, !reducedMotion)
  const thresholds = revealThresholds(content.hotspots.length, 0.32, 0.74)
  const shown = reducedMotion ? content.hotspots.length : revealed

  useGSAP(
    () => {
      if (reducedMotion) return
      const mm = gsap.matchMedia()

      mm.add('(min-width: 821px)', () => {
        const stageOuter = rootRef.current?.querySelector<HTMLElement>('[data-stage-outer]')
        const toCenter = (): number => {
          if (!stageOuter) return 0
          const r = stageOuter.getBoundingClientRect()
          return window.innerWidth / 2 - (r.left + r.width / 2)
        }
        const dial = rootRef.current?.querySelector<SVGCircleElement>('[data-dial-progress]')

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 64px',
            end: PIN_LENGTH,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progressRef.current = self.progress
              dial?.setAttribute('stroke-dashoffset', String(DIAL_CIRCUMFERENCE * (1 - self.progress)))
              const next = revealedCount(self.progress, thresholds)
              if (next !== revealedRef.current) {
                revealedRef.current = next
                setRevealed(next)
              }
            },
          },
        })

        tl.to('[data-hero-copy]', { autoAlpha: 0, x: -90, filter: 'blur(8px)', duration: 0.28, ease: 'power2.in' }, 0)
          .to('[data-stage-inner]', { x: toCenter, scale: 1.14, duration: 0.34, ease: 'power2.inOut' }, 0.02)
          .to('[data-scroll-hint]', { autoAlpha: 0, duration: 0.08 }, 0)
          .to('[data-outline-word]', { xPercent: -28, duration: 1 }, 0)
          .to('[data-aurora]', { scale: 1.25, rotate: 12, duration: 1 }, 0)
          .fromTo('[data-dial]', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.2)
          .fromTo(
            '[data-hero-outro]',
            { autoAlpha: 0, y: 40, filter: 'blur(10px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.12, ease: 'power2.out' },
            0.82,
          )
          .to('[data-dial]', { autoAlpha: 0, y: 16, duration: 0.08 }, 0.8)
          .to('[data-stage-inner]', { scale: 0.96, y: -30, duration: 0.16, ease: 'power1.inOut' }, 0.84)
      })

      mm.add('(max-width: 820px)', () => {
        gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
              progressRef.current = self.progress
            },
          },
        })
      })

      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  )

  const activeHotspot = shown > 0 ? content.hotspots[shown - 1] : null

  return (
    <header id="top" ref={rootRef} className="relative overflow-hidden">
      <div aria-hidden data-aurora className="pointer-events-none absolute inset-0 opacity-80 blur-[80px]">
        <span className="absolute top-[5%] left-[30%] size-[44vmax] animate-drift rounded-full bg-iris opacity-30" />
        <span className="absolute top-[35%] right-0 size-[34vmax] animate-drift rounded-full bg-lagoon opacity-25 [animation-delay:-6s]" />
        <span className="absolute top-[55%] left-[5%] size-[20vmax] animate-drift rounded-full bg-sun opacity-20 [animation-delay:-11s]" />
      </div>

      <div
        aria-hidden
        data-outline-word
        className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-[clamp(120px,21vw,300px)] leading-none font-extrabold tracking-[-0.05em] whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1.5px_color-mix(in_srgb,var(--foreground)_9%,transparent)]"
      >
        {OUTLINE_WORD.repeat(2)}
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-64px)] w-[min(1240px,100%-40px)] items-center gap-5 py-10 md:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] md:py-0">
        <div
          data-hero-copy
          className="relative z-[3] grid justify-items-center gap-6 text-center md:justify-items-start md:text-left"
        >
          <span
            className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-ink-soft"
            style={{ animationDelay: '0.2s' }}
          >
            <b className="size-2 animate-pulse-dot rounded-full bg-lagoon" />
            {content.badge}
          </span>
          <h1
            aria-label={`${content.firstName} ${content.lastName}`}
            className="m-0 text-[clamp(44px,6.4vw,98px)] leading-[.9] font-bold tracking-[-0.05em]"
          >
            <SplitWord text={content.firstName} offset={0} />{' '}
            <SplitWord text={content.lastName} offset={content.firstName.length} />
          </h1>
          <p
            className="m-0 h-[1.4em] animate-fade-up overflow-hidden text-[clamp(19px,2.2vw,25px)] font-semibold tracking-tight text-iris"
            style={{ animationDelay: '0.9s' }}
            aria-live="off"
          >
            <span key={roleIndex} className="inline-block animate-role-in motion-reduce:animate-none">
              {content.roles[roleIndex]}
            </span>
          </p>
          <p
            className="m-0 max-w-[44ch] animate-fade-up text-[clamp(17px,1.6vw,19px)] leading-normal text-ink-soft"
            style={{ animationDelay: '1.05s' }}
          >
            {content.pitch}
          </p>
          <div className="flex animate-fade-up flex-wrap justify-center gap-3 md:justify-start" style={{ animationDelay: '1.2s' }}>
            <Magnetic>
              <Button asChild size="pill" className="hover:shadow-[0_14px_34px_-12px_var(--iris)]">
                <a href="#products">See the products</a>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild size="pill" variant="outline" className="bg-surface/60 hover:border-iris">
                <a href="#intro">
                  <Play className="fill-current" />
                  Watch my intro
                </a>
              </Button>
            </Magnetic>
          </div>
        </div>

        <div
          data-stage-outer
          className="relative z-[2] order-first mx-auto aspect-square w-full max-w-[360px] md:order-none md:max-h-[calc(100svh-140px)] md:max-w-[calc(100svh-140px)]"
        >
          <div data-stage-inner className="relative size-full will-change-transform">
            <div
              className="relative size-full animate-bloom motion-reduce:animate-none"
              role="img"
              aria-label="3D sculpture of Niranjan at his desk, surrounded by the ideas he turns into products"
            >
              <HeroStage src={videoSrc} progressRef={progressRef} reducedMotion={reducedMotion} />
              {content.hotspots.map((h, i) => (
                <HeroHotspot key={h.id} hotspot={h} index={i} isActive={i < shown} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <p
        data-hero-outro
        className="pointer-events-none invisible absolute inset-x-0 bottom-[6%] z-[4] m-0 hidden text-center text-[clamp(28px,3.4vw,48px)] leading-none font-bold tracking-[-0.04em] opacity-0 md:block"
      >
        Engineer-built. Product-led. <span className="text-iris">Shipped.</span>
      </p>

      <div
        data-dial
        aria-hidden
        className="invisible absolute right-[max(24px,calc((100vw-1240px)/2))] bottom-7 z-[4] hidden items-center gap-3.5 opacity-0 md:flex"
      >
        <svg viewBox="0 0 52 52" className="size-[52px] -rotate-90">
          <circle cx="26" cy="26" r="22" fill="none" strokeWidth="3" stroke="var(--border)" />
          <circle
            data-dial-progress
            cx="26"
            cy="26"
            r="22"
            fill="none"
            strokeWidth="3"
            stroke="var(--iris)"
            strokeLinecap="round"
            strokeDasharray={DIAL_CIRCUMFERENCE}
            strokeDashoffset={DIAL_CIRCUMFERENCE}
          />
        </svg>
        <div className="min-w-[170px]">
          <span className="block text-[22px] leading-none font-bold tracking-[-0.04em] tabular-nums">
            {String(shown).padStart(2, '0')}
            <span className="text-ink-soft"> / {String(content.hotspots.length).padStart(2, '0')}</span>
          </span>
          <small className="mt-1 block text-[13px] text-ink-soft">{activeHotspot?.title ?? 'Scroll to explore'}</small>
        </div>
      </div>

      <div
        data-scroll-hint
        aria-hidden
        className="absolute bottom-6 left-1/2 z-[4] hidden h-[42px] w-[26px] -translate-x-1/2 rounded-[14px] border-2 border-line md:block"
      >
        <span className="absolute top-2 left-1/2 h-2 w-1 animate-wheel rounded-sm bg-ink-soft" />
      </div>
    </header>
  )
}
