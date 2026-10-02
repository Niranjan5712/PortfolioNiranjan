import type { ReactElement, ReactNode } from 'react'
import { useRevealOnce } from '@/hooks/useRevealOnce'
import { splitWords } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: ReactNode
  className?: string
  align?: 'left' | 'center'
}

const WORD_STAGGER = 0.06

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = 'left',
}: SectionHeadingProps): ReactElement {
  const { ref, isRevealed } = useRevealOnce<HTMLDivElement>()
  const words = splitWords(title)

  return (
    <div
      ref={ref}
      data-revealed={isRevealed}
      className={cn('group/heading mb-14 max-w-[680px]', align === 'center' && 'mx-auto text-center', className)}
    >
      {eyebrow && (
        <p className="mb-4 translate-y-3 text-sm font-semibold uppercase tracking-[0.14em] text-iris opacity-0 transition duration-700 ease-out-expo group-data-[revealed=true]/heading:translate-y-0 group-data-[revealed=true]/heading:opacity-100">
          {eyebrow}
        </p>
      )}
      <h2 className="m-0 mb-3.5 text-[clamp(36px,5.4vw,64px)] font-bold leading-none tracking-[-0.04em]">
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
              <span
                className="inline-block translate-y-[110%] rotate-6 transition-transform duration-[900ms] ease-out-expo group-data-[revealed=true]/heading:translate-y-0 group-data-[revealed=true]/heading:rotate-0"
                style={{ transitionDelay: `${0.08 + i * WORD_STAGGER}s` }}
              >
                {word}
              </span>
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </h2>
      {description && (
        <p
          className="m-0 max-w-[56ch] translate-y-4 text-[19px] text-ink-soft opacity-0 transition duration-700 ease-out-expo group-data-[revealed=true]/heading:translate-y-0 group-data-[revealed=true]/heading:opacity-100"
          style={{ transitionDelay: `${0.2 + words.length * WORD_STAGGER}s` }}
        >
          {description}
        </p>
      )}
    </div>
  )
}
