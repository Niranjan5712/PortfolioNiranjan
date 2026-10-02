import type { CSSProperties, ReactElement } from 'react'
import { PRODUCT_ICON_COMPONENTS } from '@/components/sections/products/ProductCard'
import { FILM, frameNumber } from '@/lib/filmRoll'
import { ACCENTS, type Product } from '@/types/profile'

interface FilmStripProps {
  products: Product[]
}

const SPROCKETS =
  'absolute inset-x-0 h-[9px] bg-[linear-gradient(90deg,transparent_7px,var(--background)_7px,var(--background)_17px,transparent_17px)] bg-[length:24px_100%] opacity-90'

export function FilmStrip({ products }: FilmStripProps): ReactElement {
  return (
    <div
      data-film-strip
      aria-hidden
      className="pointer-events-none hidden poster-stage:absolute poster-stage:inset-x-[-4%] poster-stage:top-1/2 poster-stage:block poster-stage:-translate-y-1/2 poster-stage:rotate-[-4deg] poster-stack:relative poster-stack:-mx-5 poster-stack:mb-10 poster-stack:block poster-stack:rotate-[-2deg]"
    >
      <div data-film-track className="w-max">
        <div className="relative flex w-max animate-film-drift bg-[#0d1024] py-[24px] shadow-[0_30px_60px_-30px_rgba(13,16,36,.6)] motion-reduce:animate-none dark:bg-[#05070f]">
          <span className={`${SPROCKETS} top-[8px]`} />
          <span className={`${SPROCKETS} bottom-[8px]`} />
          {Array.from({ length: FILM.copies }, (_, copy) =>
            products.map((p, i) => {
              const Icon = PRODUCT_ICON_COMPONENTS[p.icon]
              return (
                <div
                  key={`${copy}-${p.id}`}
                  data-film-frame={i}
                  style={{ '--c': ACCENTS[p.accent] } as CSSProperties}
                  className="relative mx-[5px] h-[92px] w-[150px] overflow-hidden rounded-[6px] bg-white/[.05] ring-1 ring-white/10"
                >
                  <span
                    data-film-flash
                    className="absolute inset-0 bg-[radial-gradient(circle,rgb(255_255_255/.55),color-mix(in_srgb,var(--c)_35%,transparent)_60%,transparent)] opacity-0"
                  />
                  <span data-film-thumb className="relative flex h-full flex-col justify-between p-2.5">
                    <span className="flex items-center justify-between">
                      <Icon className="size-5 text-(color:--c)" strokeWidth={1.8} />
                      <span className="font-mono text-[10px] text-white/45">{frameNumber(i)}</span>
                    </span>
                    <span className="text-[12px] leading-tight font-semibold text-white/85">{p.shortName}</span>
                  </span>
                </div>
              )
            }),
          )}
        </div>
      </div>
    </div>
  )
}
