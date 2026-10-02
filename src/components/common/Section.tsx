import type { ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
  containerClassName?: string
  ariaLabel?: string
}

export function Section({ id, children, className, containerClassName, ariaLabel }: SectionProps): ReactElement {
  return (
    <section id={id} aria-label={ariaLabel} className={cn('relative py-[clamp(80px,11vw,140px)]', className)}>
      <div className={cn('mx-auto w-[min(1160px,100%-40px)]', containerClassName)}>{children}</div>
    </section>
  )
}
