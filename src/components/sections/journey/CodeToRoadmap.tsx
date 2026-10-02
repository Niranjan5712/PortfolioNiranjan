import { useRef, type ReactElement } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '@/lib/gsap'

const TOKEN_KINDS = {
  name: 'name',
  call: 'call',
  arg: 'arg',
  punct: 'punct',
} as const

type TokenKind = (typeof TOKEN_KINDS)[keyof typeof TOKEN_KINDS]

interface CodeToken {
  text: string
  kind: TokenKind
}

interface MorphRow {
  code: CodeToken[]
  step: string
  outcome: string
}

const T = TOKEN_KINDS

export const MORPH_ROWS: readonly MorphRow[] = [
  {
    code: [
      { text: 'docs', kind: T.name },
      { text: ' = ', kind: T.punct },
      { text: 'rag.retrieve', kind: T.call },
      { text: '(', kind: T.punct },
      { text: 'query', kind: T.arg },
      { text: ')', kind: T.punct },
    ],
    step: 'Discover',
    outcome: 'Confirm who has the problem first',
  },
  {
    code: [
      { text: 'model', kind: T.name },
      { text: '.fit', kind: T.call },
      { text: '(', kind: T.punct },
      { text: 'data, epochs=20', kind: T.arg },
      { text: ')', kind: T.punct },
    ],
    step: 'Prioritise',
    outcome: '10+ ideas narrowed to 5 products',
  },
  {
    code: [
      { text: 'api', kind: T.name },
      { text: '.deploy', kind: T.call },
      { text: '(', kind: T.punct },
      { text: 'model', kind: T.arg },
      { text: ')', kind: T.punct },
    ],
    step: 'Ship',
    outcome: '8 AI products delivered',
  },
]

const TOKEN_CLASS: Record<TokenKind, string> = {
  name: 'text-white',
  call: 'text-[#b8b2ff]',
  arg: 'text-[#5fe3d0]',
  punct: 'text-white/45',
}

/** On desktop the morph scrubs along with the `[data-journey-timeline]` element in the same section. */
export function CodeToRoadmap(): ReactElement {
  const reducedMotion = usePrefersReducedMotion()
  const cardRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const card = cardRef.current
      if (reducedMotion || !card) return
      const build = (trigger: HTMLElement, start: string, end: string): void => {
        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger, start, end, scrub: 0.5, invalidateOnRefresh: true },
        })
        tl.fromTo(
          '[data-code-line]',
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 1, stagger: 0.45, ease: 'steps(22)' },
          0,
        )
        tl.addLabel('morph', '+=0.4')
        gsap.utils.toArray<HTMLElement>('[data-morph-row]', card).forEach((row, i) => {
          const at = `morph+=${i * 0.8}`
          const code = row.querySelector('[data-code-line]')
          const step = row.querySelector('[data-roadmap-card]')
          if (code) tl.to(code, { opacity: 0, y: -10, filter: 'blur(6px)', duration: 0.5 }, at)
          if (step) tl.fromTo(step, { opacity: 0, y: 14, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, `${at}+=0.15`)
        })
        tl.to('[data-file-code]', { opacity: 0, duration: 0.3 }, 'morph')
        tl.fromTo('[data-file-roadmap]', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 'morph+=0.15')
        tl.fromTo('[data-morph-fill]', { scaleX: 0 }, { scaleX: 1, duration: tl.duration(), ease: 'none' }, 0)
      }
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const sync = card.closest('section')?.querySelector<HTMLElement>('[data-journey-timeline]')
        if (sync) build(sync, 'top 70%', 'bottom 85%')
        else build(card, 'top 85%', 'bottom 30%')
      })
      mm.add('(max-width: 1023px)', () => build(card, 'top 85%', 'bottom 30%'))
      return () => mm.revert()
    },
    { scope: cardRef, dependencies: [reducedMotion] },
  )

  return (
    <figure
      ref={cardRef}
      data-code-to-roadmap
      aria-label="From AI engineer to AI product"
      className="dark relative m-0 mt-7 overflow-hidden rounded-[26px] border border-white/10 bg-[#0B0E22] p-5 text-white shadow-[0_30px_70px_-40px_color-mix(in_srgb,var(--iris)_70%,transparent)] sm:p-6"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--iris)_35%,transparent),transparent_70%)]"
      />
      <header className="relative mb-4 flex items-center gap-3">
        <span aria-hidden className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-rose/80" />
          <i className="size-2.5 rounded-full bg-sun/80" />
          <i className="size-2.5 rounded-full bg-lagoon/80" />
        </span>
        <span aria-hidden className="relative hidden font-mono text-[12.5px] text-white/60 sm:inline">
          <span data-file-code className={reducedMotion ? 'opacity-0' : ''}>
            engineer.py
          </span>
          <span data-file-roadmap className={`absolute inset-0 ${reducedMotion ? '' : 'opacity-0'}`}>
            roadmap.md
          </span>
        </span>
        <span className="ml-auto flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap text-white/55 uppercase">
          AI engineer
          <span aria-hidden className="relative h-0.5 w-12 overflow-hidden rounded-full bg-white/15 sm:w-16">
            <span
              data-morph-fill
              className="absolute inset-0 origin-left bg-[linear-gradient(90deg,var(--iris),var(--lagoon))]"
            />
          </span>
          <span className="text-white">AI product</span>
        </span>
      </header>

      <ol aria-label="Roadmap" className="relative m-0 grid list-none gap-2.5 p-0">
        {MORPH_ROWS.map((row, i) => (
          <li key={row.step} data-morph-row className="grid">
            {!reducedMotion && (
              <code
                data-code-line
                aria-hidden
                className="flex items-center gap-3 self-center font-mono text-[13.5px] whitespace-nowrap [grid-area:1/1]"
              >
                <span className="w-4 text-right text-white/30">{i + 1}</span>
                <span>
                  {row.code.map((t, j) => (
                    <span key={j} className={TOKEN_CLASS[t.kind]}>
                      {t.text}
                    </span>
                  ))}
                </span>
              </code>
            )}
            <div
              data-roadmap-card
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 [grid-area:1/1]"
            >
              <span className="grid size-8 flex-none place-items-center rounded-xl bg-[linear-gradient(135deg,var(--iris),var(--lagoon))] text-[12px] font-bold">
                0{i + 1}
              </span>
              <div className="min-w-0">
                <h4 className="m-0 text-[15px] leading-tight font-semibold">{row.step}</h4>
                <p className="m-0 truncate text-[13.5px] text-white/65">{row.outcome}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  )
}
