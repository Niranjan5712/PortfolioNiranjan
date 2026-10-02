import { useRef, type ReactElement } from 'react'
import { Section } from '@/components/common/Section'
import { SectionHeading } from '@/components/common/SectionHeading'
import { CodeToRoadmap } from '@/components/sections/journey/CodeToRoadmap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import type { Role } from '@/types/profile'

interface JourneyProps {
  roles: Role[]
}

const TIMELINE_START = 'top 70%'

export function Journey({ roles }: JourneyProps): ReactElement {
  const reducedMotion = usePrefersReducedMotion()
  const timelineRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reducedMotion || !timelineRef.current) return
      gsap.fromTo(
        '[data-timeline-fill]',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: timelineRef.current, start: TIMELINE_START, end: 'bottom 70%', scrub: 0.4 },
        },
      )
      gsap.utils.toArray<HTMLElement>('[data-role]', timelineRef.current).forEach((item) => {
        item.dataset.active = 'false'
        ScrollTrigger.create({
          trigger: item,
          start: TIMELINE_START,
          onEnter: () => (item.dataset.active = 'true'),
          onLeaveBack: () => (item.dataset.active = 'false'),
        })
      })
    },
    { scope: timelineRef, dependencies: [reducedMotion] },
  )

  return (
    <Section id="journey" ariaLabel="Journey">
      <div className="grid gap-[clamp(24px,6vw,90px)] lg:grid-cols-2">
        <div className="self-start lg:sticky lg:top-28">
          <SectionHeading
            eyebrow="The journey"
            className="mb-0"
            title="From building models to deciding what’s worth building."
            description="I started as an AI engineer, so my specs are buildable and I can prototype ideas myself."
          />
          <CodeToRoadmap />
        </div>

        <div ref={timelineRef} data-journey-timeline className="relative">
          <div aria-hidden className="absolute top-1.5 bottom-1.5 left-[11px] w-0.5 bg-line">
            <div
              data-timeline-fill
              className="size-full origin-top bg-[linear-gradient(var(--iris),var(--lagoon),var(--sun))]"
            />
          </div>
          <ol className="relative m-0 list-none p-0" aria-label="Experience">
            {roles.map((r) => (
              <li
                key={r.id}
                data-role
                className="group/role relative pb-13 pl-[50px] before:absolute before:top-1.5 before:left-[3px] before:size-[18px] before:rounded-full before:border-[3px] before:border-iris before:bg-iris before:shadow-[0_0_0_6px_var(--iris-soft)] before:transition-all before:duration-500 data-[active=false]:before:scale-75 data-[active=false]:before:border-line data-[active=false]:before:bg-surface data-[active=false]:before:shadow-none"
              >
                <div className="transition duration-700 ease-out-expo group-data-[active=false]/role:translate-x-4 group-data-[active=false]/role:opacity-35">
                  <p className="m-0 text-sm text-ink-soft">{r.period}</p>
                  <h3 className="m-0 mt-1 mb-0.5 text-2xl leading-tight tracking-[-0.02em]">{r.title}</h3>
                  <p className="m-0 mb-2.5 text-base font-semibold text-iris">{r.company}</p>
                  <ul className="m-0 grid gap-1.5 pl-[18px] text-base text-ink-soft">
                    {r.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  )
}
