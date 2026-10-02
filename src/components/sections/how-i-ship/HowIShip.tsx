import { useRef, useState, type ReactElement } from 'react'
import { Section } from '@/components/common/Section'
import { SectionHeading } from '@/components/common/SectionHeading'
import { IdeaFunnel } from '@/components/sections/how-i-ship/IdeaFunnel'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '@/lib/gsap'
import { activeStepFor, stepState } from '@/lib/pipeline'
import type { ProcessStep } from '@/types/profile'

interface HowIShipProps {
  steps: ProcessStep[]
  funnelProducts: string[]
}

const LIVE_AT = 0.97
const HIDDEN_DASH = 1.05

function addPipelineTweens(tl: gsap.core.Timeline): void {
  tl.from('[data-pl-label]', { autoAlpha: 0, y: 8, duration: 0.06 }, 0)
    .from('[data-idea]', { autoAlpha: 0, x: -28, duration: 0.08, stagger: { amount: 0.1 } }, 0)
    .from('[data-gate]', { scaleY: 0, transformOrigin: '50% 50%', duration: 0.1, ease: 'power2.out' }, 0.16)
    .fromTo(
      '[data-kept="false"] [data-idea-chip]',
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
      {
        opacity: 0.32,
        y: 4,
        scale: 0.92,
        transformOrigin: '50% 50%',
        filter: 'blur(1.2px)',
        duration: 0.1,
        stagger: { amount: 0.04 },
        ease: 'power2.in',
      },
      0.28,
    )
    .fromTo('[data-stub]', { strokeDashoffset: HIDDEN_DASH }, { strokeDashoffset: 0, duration: 0.08, stagger: { amount: 0.04 } }, 0.26)
    .from('[data-cross]', { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.05, stagger: { amount: 0.04 } }, 0.32)
    .fromTo(
      '[data-beam], [data-beam-glow]',
      { strokeDashoffset: HIDDEN_DASH },
      { strokeDashoffset: 0, duration: 0.2, stagger: { amount: 0.1 } },
      0.4,
    )
    .from('[data-product]', { autoAlpha: 0, x: 28, duration: 0.1, stagger: { amount: 0.08 } }, 0.6)
    .from('[data-check]', { scale: 0, transformOrigin: '50% 50%', duration: 0.06, stagger: { amount: 0.08 }, ease: 'back.out(2.5)' }, 0.8)
    .set({}, {}, 1)
}

export function HowIShip({ steps, funnelProducts }: HowIShipProps): ReactElement {
  const reducedMotion = usePrefersReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<number | null>(null)
  const liveRef = useRef(false)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [isLive, setIsLive] = useState(false)

  useGSAP(
    () => {
      if (reducedMotion) return
      const syncLive = (progress: number): void => {
        const next = progress >= LIVE_AT
        if (next === liveRef.current) return
        liveRef.current = next
        setIsLive(next)
      }
      const reset = (): void => {
        activeRef.current = null
        liveRef.current = false
        setActiveStep(null)
        setIsLive(false)
      }
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stageRef.current,
            start: 'center 54%',
            end: '+=150%',
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const step = activeStepFor(self.progress)
              if (step !== activeRef.current) {
                activeRef.current = step
                setActiveStep(step)
              }
              syncLive(self.progress)
            },
          },
        })
        tl.fromTo('[data-steps-fill]', { scaleY: 0 }, { scaleY: 1, duration: 0.8 }, 0)
        addPipelineTweens(tl)
        return reset
      })

      mm.add('(max-width: 1023px)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '[data-pipeline-figure]',
            start: 'top 85%',
            end: 'bottom 55%',
            scrub: 0.5,
            onUpdate: (self) => syncLive(self.progress),
          },
        })
        addPipelineTweens(tl)
        return reset
      })

      return () => mm.revert()
    },
    { scope: stageRef, dependencies: [reducedMotion] },
  )

  return (
    <Section id="how-i-ship" ariaLabel="How I ship" className="pt-0">
      <SectionHeading
        eyebrow="How I ship"
        className="mb-[clamp(32px,5vw,56px)] max-w-[820px]"
        title={`10+ ideas in. ${funnelProducts.length} shipped products out.`}
        description="At Xerago, the CEO, COO and CTO pitch ideas. My job is to find the ones worth building, make them buildable, and get them into clients’ hands."
      />
      <div
        ref={stageRef}
        data-pipeline
        className="grid items-center gap-[clamp(28px,4vw,64px)] lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]"
      >
        <div className="relative">
          <div aria-hidden className="absolute top-[22px] bottom-[22px] left-[21px] w-0.5 bg-line">
            <div
              data-steps-fill
              className="size-full origin-top bg-[linear-gradient(var(--iris),var(--lagoon))]"
            />
          </div>
          <ol className="relative m-0 grid list-none gap-[clamp(14px,1.8vw,22px)] p-0" aria-label="My process">
            {steps.map((s, i) => (
              <li
                key={s.id}
                data-state={stepState(i, activeStep)}
                className="group/step relative grid grid-cols-[44px_1fr] items-start gap-3.5 transition-opacity duration-500 data-[state=upcoming]:opacity-35"
              >
                <b className="relative grid size-11 place-items-center rounded-[14px] bg-iris-soft font-bold text-iris transition-all duration-500 ease-out-expo group-data-[state=current]/step:scale-110 group-data-[state=current]/step:bg-iris group-data-[state=current]/step:text-white group-data-[state=current]/step:shadow-[0_0_0_6px_var(--iris-soft)] group-data-[state=done]/step:bg-iris group-data-[state=done]/step:text-white">
                  {i + 1}
                </b>
                <div>
                  <h3 className="m-0 text-[19px] leading-snug">
                    {s.title}
                    <span className="font-normal text-ink-soft"> · {s.headline}</span>
                  </h3>
                  <p className="m-0 mt-0.5 text-base text-ink-soft">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <IdeaFunnel ideaCount={10} products={funnelProducts} isLive={isLive} />
      </div>
    </Section>
  )
}
