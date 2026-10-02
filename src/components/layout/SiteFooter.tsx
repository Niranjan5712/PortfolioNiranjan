import type { ReactElement } from 'react'
import { useRevealOnce } from '@/hooks/useRevealOnce'

interface SiteFooterProps {
  name: string
  wordmark: string
}

const LETTER_STAGGER_MS = 70
const GLITCH_OFFSET = '-2.2s'
const WORD_CLASS =
  'flex justify-center pb-[0.04em] text-[clamp(40px,15.5vw,224px)] leading-[0.82] font-extrabold tracking-[-0.06em] uppercase select-none'

const GLITCH_LAYERS = [
  { id: 'red', color: 'var(--rose)', animation: 'animate-glitch-red' },
  { id: 'cyan', color: 'var(--lagoon)', animation: 'animate-glitch-cyan' },
] as const

export function SiteFooter({ name, wordmark }: SiteFooterProps): ReactElement {
  const { ref, isRevealed } = useRevealOnce<HTMLDivElement>({ threshold: 0.3, rootMargin: '0px' })
  const letters = Array.from(wordmark)

  return (
    <footer className="relative z-[1] overflow-hidden pt-10 text-center text-sm text-ink-soft">
      <p className="m-0">
        Designed and shipped like a product by {name}. © {new Date().getFullYear()}
      </p>
      <div className="relative mx-auto mt-[clamp(16px,3vw,40px)] w-[min(1160px,100%-40px)]">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[10%] top-[30%] bottom-0 rounded-full bg-[radial-gradient(50%_60%_at_50%_70%,color-mix(in_srgb,var(--iris)_32%,transparent),transparent_75%)] blur-2xl"
        />
        <div
          ref={ref}
          data-wordmark
          data-risen={isRevealed}
          aria-hidden="true"
          className={`relative ${WORD_CLASS} ${isRevealed ? 'animate-neon-flicker motion-reduce:animate-none' : ''}`}
          style={isRevealed ? { animationDelay: GLITCH_OFFSET } : undefined}
        >
          {letters.map((letter, i) => (
            <span
              key={`${letter}-${i}`}
              data-wordmark-letter
              className={`inline-block bg-[linear-gradient(180deg,var(--iris)_0%,color-mix(in_srgb,var(--iris)_55%,transparent)_45%,transparent_92%)] bg-clip-text text-transparent [filter:drop-shadow(0_0_28px_color-mix(in_srgb,var(--iris)_45%,transparent))] transition-[transform,opacity] duration-[1100ms] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none ${
                isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-[60%] opacity-0'
              }`}
              style={{ transitionDelay: `${i * LETTER_STAGGER_MS}ms` }}
            >
              {letter}
            </span>
          ))}
        </div>
        {isRevealed &&
          GLITCH_LAYERS.map((layer) => (
            <div
              key={layer.id}
              data-glitch-layer={layer.id}
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 top-0 opacity-0 ${WORD_CLASS} ${layer.animation} motion-reduce:hidden`}
              style={{ animationDelay: GLITCH_OFFSET }}
            >
              {letters.map((letter, i) => (
                <span
                  key={`${letter}-${i}`}
                  className="inline-block bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(180deg, ${layer.color} 0%, color-mix(in srgb, ${layer.color} 55%, transparent) 45%, transparent 92%)` }}
                >
                  {letter}
                </span>
              ))}
            </div>
          ))}
      </div>
    </footer>
  )
}
