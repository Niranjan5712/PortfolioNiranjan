import type { CSSProperties, ReactElement } from 'react'
import { Section } from '@/components/common/Section'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ACCENTS, type Principle } from '@/types/profile'

interface OperatingPrinciplesProps {
  principles: Principle[]
}

export function OperatingPrinciples({ principles }: OperatingPrinciplesProps): ReactElement {
  return (
    <Section id="principles" ariaLabel="Operating principles" className="pt-0">
      <SectionHeading
        eyebrow="Operating principles"
        title="Three habits behind every product."
        description="How I keep teams focused, products reliable and specs realistic."
      />
      <div className="grid gap-[22px] md:grid-cols-3">
        {principles.map((p) => (
          <article
            key={p.id}
            style={{ '--c': ACCENTS[p.accent] } as CSSProperties}
            className="flex flex-col gap-4 rounded-[30px] border border-line bg-surface p-8"
          >
            <span className="w-fit rounded-full bg-(color:--c)/15 px-3 py-1 text-[13px] font-semibold text-(color:--c)">
              {p.area}
            </span>
            <h3 className="m-0 text-[24px] leading-tight tracking-[-0.03em]">{p.headline}</h3>
            <p className="m-0 text-[15.5px] leading-normal text-ink-soft">{p.detail}</p>
            <div className="mt-auto flex items-baseline gap-2.5 border-t border-dashed border-line pt-4">
              <strong className="text-[34px] leading-none tracking-[-0.04em]">{p.proof}</strong>
              <span className="text-sm text-ink-soft">{p.proofLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
