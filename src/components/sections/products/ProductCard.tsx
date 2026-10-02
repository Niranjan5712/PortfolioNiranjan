import type { CSSProperties, ReactElement } from 'react'
import { Camera, Database, FileCheck2, Mic, Plane, Route, ShieldCheck, Users, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTilt } from '@/hooks/useTilt'
import { ACCENTS, type Product, type ProductIcon } from '@/types/profile'

export const PRODUCT_ICON_COMPONENTS: Record<ProductIcon, LucideIcon> = {
  database: Database,
  shield: ShieldCheck,
  route: Route,
  people: Users,
  camera: Camera,
  mic: Mic,
  exam: FileCheck2,
  plane: Plane,
}

interface ProductCardProps {
  product: Product
  index: number
}

export function ProductCard({ product, index }: ProductCardProps): ReactElement {
  const Icon = PRODUCT_ICON_COMPONENTS[product.icon]
  const headingId = `product-${product.id}`
  const tiltRef = useTilt<HTMLDivElement>(5)

  return (
    <article
      aria-labelledby={headingId}
      data-poster
      style={{ '--c': ACCENTS[product.accent] } as CSSProperties}
      className="w-[min(440px,84vw)] flex-none snap-center poster-stage:col-start-1 poster-stage:row-start-1 poster-stage:w-[min(500px,58vw)] poster-stack:w-full poster-stack:max-w-[460px]"
    >
      <div
        ref={tiltRef}
        className="tilt relative flex h-full flex-col gap-4 rounded-[30px] border border-line bg-surface p-7 hover:shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--c)_55%,transparent)] poster-stage:shadow-[0_50px_90px_-40px_rgba(20,24,51,.45)] poster-stack:shadow-[0_30px_60px_-36px_rgba(20,24,51,.4)]"
      >
        <span aria-hidden className="tilt-glare" />
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-16 place-items-center rounded-[20px] bg-(color:--c)/15 text-(color:--c)">
            <Icon className="size-8" strokeWidth={1.8} aria-hidden />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="outline" className="h-6 px-2.5 text-[12px] text-ink-soft">
              {product.client} · {product.sector}
            </Badge>
            <Badge className="h-6 gap-1.5 bg-lagoon/15 px-2.5 text-[12px] text-ink">
              <i className="size-1.5 rounded-full bg-lagoon" />
              {product.status}
            </Badge>
          </div>
        </div>

        <div>
          <p className="m-0 text-[13px] font-semibold text-ink-soft tabular-nums">
            {String(index + 1).padStart(2, '0')} / Product
          </p>
          <h3 id={headingId} className="m-0 mt-1 text-[27px] leading-[1.1] tracking-[-0.03em]">
            {product.name}
          </h3>
          <p className="m-0 mt-1.5 text-[16px] font-medium text-(color:--c)">{product.tagline}</p>
        </div>

        <dl className="m-0 grid gap-3">
          <div>
            <dt className="text-[12px] font-semibold tracking-[0.12em] text-rose uppercase">Problem</dt>
            <dd className="m-0 mt-0.5 text-[15.5px] leading-snug text-ink-soft">{product.problem}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-semibold tracking-[0.12em] text-lagoon uppercase">Solution</dt>
            <dd className="m-0 mt-0.5 text-[15.5px] leading-snug text-ink">{product.solution}</dd>
          </div>
        </dl>

        <div className="mt-auto border-t border-dashed border-line pt-4">
          <p className="m-0 text-[12px] font-semibold tracking-[0.12em] text-(color:--c) uppercase">Impact</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <strong className="text-[34px] leading-none tracking-[-0.04em] whitespace-nowrap">{product.result.value}</strong>
            <span className="text-sm leading-snug text-ink-soft">{product.result.label}</span>
          </div>
        </div>

        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Capabilities">
          {product.tags.map((t) => (
            <li key={t} className="rounded-full border border-line px-2.5 py-1 text-[12px] text-ink-soft">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
