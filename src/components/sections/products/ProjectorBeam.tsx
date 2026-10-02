import type { CSSProperties, ReactElement } from 'react'
import { dustMotes } from '@/lib/filmRoll'

const MOTES = dustMotes()

export function ProjectorBeam(): ReactElement {
  return (
    <div data-projector aria-hidden className="pointer-events-none absolute inset-0 hidden poster-stage:block">
      <div className="absolute inset-0 animate-flicker bg-[linear-gradient(180deg,color-mix(in_srgb,var(--iris)_16%,transparent),color-mix(in_srgb,var(--iris)_5%,transparent)_50%,transparent_80%)] [clip-path:polygon(44%_0,56%_0,92%_100%,8%_100%)] motion-reduce:animate-none dark:bg-[linear-gradient(180deg,rgb(255_255_255/.14),rgb(185_178_255/.05)_50%,transparent_80%)]" />
      <div className="absolute inset-0 motion-reduce:hidden">
        {MOTES.map((m, i) => (
          <span
            key={i}
            data-dust
            className="absolute animate-dust rounded-full bg-iris/60 dark:bg-white/80"
            style={
              {
                left: `${m.left}%`,
                top: `${m.top}%`,
                width: m.size,
                height: m.size,
                animationDuration: `${m.durationS}s`,
                animationDelay: `${m.delayS}s`,
                '--dx': `${m.driftX}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}
