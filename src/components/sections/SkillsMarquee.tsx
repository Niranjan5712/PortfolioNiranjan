import type { ReactElement } from 'react'
import { cn } from '@/lib/utils'

interface SkillsMarqueeProps {
  rows: string[][]
}

export function SkillsMarquee({ rows }: SkillsMarqueeProps): ReactElement {
  return (
    <div aria-label="Skills" role="region" className="group grid gap-3 overflow-hidden border-y border-line bg-surface py-[18px]">
      <h2 className="sr-only">Skills</h2>
      {rows.map((items, r) => (
        <div
          key={r}
          className={cn(
            'flex w-max gap-3 group-hover:[animation-play-state:paused]',
            r % 2 === 0 ? 'animate-marquee' : 'animate-marquee-reverse',
          )}
        >
          {[...items, ...items].map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              aria-hidden={i >= items.length}
              className={cn(
                'rounded-full border border-line bg-background px-[18px] py-2 text-[15px] whitespace-nowrap text-ink-soft',
                i % 5 === 0 && 'border-ink bg-ink font-semibold text-background',
              )}
            >
              {skill}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
