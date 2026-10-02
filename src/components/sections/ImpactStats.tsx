import type { CSSProperties, ReactElement } from 'react'
import { Section } from '@/components/common/Section'
import { SectionHeading } from '@/components/common/SectionHeading'
import { useCountUp } from '@/hooks/useCountUp'
import { useRevealOnce } from '@/hooks/useRevealOnce'
import { ACCENTS, type Stat } from '@/types/profile'

interface ImpactStatsProps {
  stats: Stat[]
}

export function formatStat(stat: Pick<Stat, 'value' | 'decimals' | 'suffix'>): string {
  return `${stat.value.toFixed(stat.decimals ?? 0)}${stat.suffix ?? ''}`
}

function StatCard({ stat, index }: { stat: Stat; index: number }): ReactElement {
  const { ref, isRevealed } = useRevealOnce<HTMLElement>({ threshold: 0.4 })
  const value = useCountUp(stat.value, { active: isRevealed, decimals: stat.decimals ?? 0 })

  return (
    <article
      ref={ref}
      data-revealed={isRevealed}
      style={{ '--c': ACCENTS[stat.accent], transitionDelay: `${index * 0.1}s` } as CSSProperties}
      className="relative translate-y-8 overflow-hidden rounded-[26px] border border-line bg-surface px-6 py-7 opacity-0 transition duration-700 ease-out-expo before:absolute before:-top-8 before:-right-8 before:size-28 before:scale-50 before:rounded-full before:bg-(color:--c) before:opacity-15 before:transition-transform before:duration-1000 before:ease-out-expo data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 data-[revealed=true]:before:scale-100"
    >
      <strong className="block text-[clamp(40px,5vw,62px)] leading-none font-bold tracking-[-0.05em] tabular-nums">
        <span aria-hidden data-testid={`stat-${stat.id}`}>
          {formatStat({ ...stat, value })}
        </span>
        <span className="sr-only">{formatStat(stat)}</span>
      </strong>
      <span className="mt-2.5 block text-[17px] leading-tight font-semibold">{stat.label}</span>
      <span className="mt-1.5 block text-[15px] leading-snug text-ink-soft">{stat.detail}</span>
    </article>
  )
}

export function ImpactStats({ stats }: ImpactStatsProps): ReactElement {
  return (
    <Section id="impact" ariaLabel="Impact">
      <SectionHeading
        eyebrow="Results"
        title="Results, not roadmaps."
        description="Two-plus years building enterprise AI, the last one owning discovery, prioritisation and delivery. Here is what that produced."
      />
      <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={s.id} stat={s} index={i} />
        ))}
      </div>
    </Section>
  )
}
