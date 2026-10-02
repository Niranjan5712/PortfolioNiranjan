import { useRef, type ReactElement } from 'react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { FilmStrip } from '@/components/sections/products/FilmStrip'
import { ProductCard } from '@/components/sections/products/ProductCard'
import { ProjectorBeam } from '@/components/sections/products/ProjectorBeam'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { FILM } from '@/lib/filmRoll'
import { gsap, useGSAP } from '@/lib/gsap'
import {
  launchPose,
  pilePose,
  POSTER_TIMING,
  restPose,
  restTilt,
  slapPose,
  swoopPose,
  topPosterIndex,
  type PosterPose,
} from '@/lib/productFlight'
import type { Product } from '@/types/profile'

interface ProductLineProps {
  products: Product[]
}

const NAV_HEIGHT = 64
const T = POSTER_TIMING

function livePose(pose: () => PosterPose): gsap.TweenVars {
  return {
    x: () => pose().x,
    y: () => pose().y,
    z: () => pose().z,
    rotationX: () => pose().rotationX,
    rotationY: () => pose().rotationY,
    rotationZ: () => pose().rotationZ,
    scale: () => pose().scale,
  }
}

export function ProductLine({ products }: ProductLineProps): ReactElement {
  const reducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const total = String(products.length).padStart(2, '0')

  useGSAP(
    () => {
      const section = sectionRef.current
      if (reducedMotion || !section) return
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px)', () => {
        section.dataset.mode = 'stage'
        const stage = section.querySelector<HTMLElement>('[data-poster-stage]')
        const camera = section.querySelector<HTMLElement>('[data-poster-camera]')
        const glow = section.querySelector<HTMLElement>('[data-poster-glow]')
        const cards = gsap.utils.toArray<HTMLElement>('[data-poster]', section)
        if (!stage || !camera || !glow) return
        const vw = (): number => window.innerWidth
        const vh = (): number => window.innerHeight

        gsap.set(cards, { transformPerspective: T.perspective, zIndex: (i: number) => i + 1 })

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: `top ${NAV_HEIGHT}px`,
            end: () => `+=${cards.length * vh() * T.unitVh}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const top = topPosterIndex(self.progress, cards.length)
              if (counterRef.current) counterRef.current.textContent = String(top + 1).padStart(2, '0')
            },
          },
        })

        tl.fromTo('[data-film-track]', { x: 0 }, { x: -FILM.scrollShiftPx, duration: cards.length }, 0)

        cards.forEach((card, i) => {
          const slapAt = i + T.slapAt
          const frame = `[data-film-frame="${i}"]`
          tl.to(`${frame} [data-film-thumb]`, { autoAlpha: 0, y: -28, scale: 1.3, duration: 0.12, ease: 'power2.in' }, i)
            .fromTo(`${frame} [data-film-flash]`, { opacity: 0 }, { opacity: 1, duration: 0.05 }, i)
            .to(`${frame} [data-film-flash]`, { opacity: 0, duration: 0.4 }, i + 0.05)
            .to(`${frame} [data-film-thumb]`, { autoAlpha: 1, y: 0, scale: 1, duration: 0.15, ease: 'power2.out' }, i + 0.75)
          tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: T.fadeIn }, i)
            .fromTo(
              card,
              livePose(() => launchPose(i, vw(), vh())),
              { ...livePose(() => swoopPose(i, vw(), vh())), duration: T.swoopAt, ease: 'power1.in' },
              i,
            )
            .to(card, { ...slapPose(i), duration: T.slapAt - T.swoopAt, ease: 'power3.out' }, i + T.swoopAt)
            .to(card, { ...restPose(i), duration: T.settle, ease: 'power2.out' }, slapAt)

          cards.slice(0, i).forEach((older, j) => {
            tl.to(older, { ...pilePose(j, i - j), duration: T.knock, ease: 'power3.out' }, slapAt - 0.02)
          })

          tl.fromTo(
            camera,
            { x: 0, y: 0, rotation: 0 },
            { keyframes: { x: [0, -8, 6, -3, 0], y: [0, 5, -4, 1, 0], rotation: [0, -0.4, 0.3, 0] }, duration: 0.1 },
            slapAt,
          )
            .fromTo(glow, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1.1, duration: 0.04 }, slapAt)
            .to(glow, { autoAlpha: 0, scale: 1.3, duration: 0.2 }, slapAt + 0.04)
        })

        tl.fromTo('[data-products-progress]', { scaleX: 0 }, { scaleX: 1, duration: cards.length }, 0)

        return () => {
          delete section.dataset.mode
        }
      })

      mm.add('(max-width: 1023px)', () => {
        section.dataset.mode = 'stack'
        gsap.utils.toArray<HTMLElement>('[data-poster]', section).forEach((card, i) => {
          const side = i % 2 === 0 ? -1 : 1
          gsap.fromTo(
            card,
            {
              transformPerspective: 1000,
              x: () => side * window.innerWidth * 0.55,
              z: -600,
              rotationX: 24,
              rotationY: side * -110,
              rotationZ: side * 18,
              opacity: 0,
            },
            {
              x: 0,
              z: 0,
              rotationX: 0,
              rotationY: 0,
              rotationZ: restTilt(i),
              opacity: 1,
              ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 98%', end: 'top 55%', scrub: 0.6, invalidateOnRefresh: true },
            },
          )
        })
        return () => {
          delete section.dataset.mode
        }
      })

      return () => mm.revert()
    },
    { scope: sectionRef, dependencies: [reducedMotion, products.length] },
  )

  return (
    <section
      ref={sectionRef}
      id="products"
      aria-label="Product line"
      className="relative overflow-hidden pt-[clamp(80px,11vw,140px)] pb-[clamp(24px,3vw,40px)]"
    >
      <div className="mx-auto w-[min(1160px,100%-40px)]">
        <SectionHeading
          eyebrow="The product line"
          className="mb-9 max-w-[960px]"
          title={`${products.length} AI products. Every one shipped.`}
          description="Each one started with a real problem, added something new, and was carried through to delivery. Scroll through the line-up."
        />
      </div>
      <div data-poster-stage className="poster-stage:flex poster-stage:h-[calc(100svh-64px)] poster-stage:flex-col">
        <div data-poster-camera className="relative poster-stage:flex-1">
          <div
            data-poster-glow
            aria-hidden
            className="pointer-events-none invisible absolute inset-0 m-auto hidden size-[640px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--iris)_32%,transparent),transparent_65%)] poster-stage:block"
          />
          <ProjectorBeam />
          <FilmStrip products={products} />
          <div
            data-product-track
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(20px,calc((100vw-1160px)/2))] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden poster-stage:relative poster-stage:grid poster-stage:h-full poster-stage:snap-none poster-stage:place-items-center poster-stage:overflow-visible poster-stage:p-0 poster-stack:snap-none poster-stack:flex-col poster-stack:items-center poster-stack:gap-10 poster-stack:overflow-visible"
          >
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
        <div
          aria-hidden
          className="mx-auto hidden w-[min(1160px,100%-40px)] items-center gap-6 py-5 poster-stage:flex"
        >
          <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-line">
            <div
              data-products-progress
              className="h-full origin-left bg-[linear-gradient(90deg,var(--iris),var(--lagoon),var(--sun))]"
            />
          </div>
          <p className="m-0 flex shrink-0 items-baseline gap-2 font-mono text-[15px] font-semibold text-ink-soft tabular-nums">
            <span className="text-[11px] tracking-[0.2em] uppercase">Frame</span>
            <span ref={counterRef} data-testid="frame-counter" className="text-[26px] text-ink">
              01
            </span>{' '}
            / {total}
          </p>
        </div>
      </div>
    </section>
  )
}
