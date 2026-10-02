import type { CSSProperties, ReactElement } from 'react'
import { cn } from '@/lib/utils'
import type { Hotspot } from '@/types/profile'

interface HeroHotspotProps {
  hotspot: Hotspot
  isActive?: boolean
  index?: number
}

export function HeroHotspot({ hotspot, isActive = true, index = 0 }: HeroHotspotProps): ReactElement {
  const isLeft = hotspot.side === 'left'
  const style: CSSProperties = isLeft
    ? { top: `${hotspot.y}%`, right: `${100 - hotspot.x}%` }
    : { top: `${hotspot.y}%`, left: `${hotspot.x}%` }

  return (
    <div
      data-testid={`hotspot-${hotspot.id}`}
      data-active={isActive}
      aria-hidden={!isActive}
      style={style}
      className={cn('group pointer-events-none absolute z-[3] hidden -translate-y-1/2 items-center md:flex', isLeft && 'flex-row-reverse')}
    >
      <i className="relative size-3.5 flex-none scale-0 rounded-full border-[3px] border-background bg-sun transition-transform duration-500 ease-out-expo group-data-[active=true]:scale-100 group-data-[active=true]:animate-ping-sun" />
      <i className="h-px w-0 flex-none bg-ink/40 transition-[width] duration-400 ease-out-expo group-data-[active=true]:w-14 group-data-[active=true]:delay-150" />
      <div className="w-[220px] translate-y-2.5 scale-95 rounded-2xl border border-line bg-surface/80 px-4 py-3 opacity-0 shadow-[0_20px_40px_-24px_rgba(20,24,51,.45)] backdrop-blur-md transition-[opacity,transform] duration-300 ease-out-expo group-data-[active=true]:translate-y-0 group-data-[active=true]:scale-100 group-data-[active=true]:opacity-100 group-data-[active=true]:delay-300 group-data-[active=true]:duration-500">
        <span className="mb-1 block text-[11px] font-semibold tracking-[0.14em] text-iris tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        <b className="block text-[15px] leading-tight">{hotspot.title}</b>
        <span className="mt-1 block text-[13px] leading-snug text-ink-soft">{hotspot.detail}</span>
      </div>
    </div>
  )
}
