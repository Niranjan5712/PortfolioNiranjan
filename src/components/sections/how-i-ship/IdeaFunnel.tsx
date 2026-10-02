import { useId, type ReactElement } from 'react'
import {
  beamPath,
  ideaCenterY,
  PIPELINE,
  pickKeptIdeas,
  prismFacets,
  productCenterY,
  stubPath,
} from '@/lib/pipeline'

interface IdeaFunnelProps {
  ideaCount: number
  products: string[]
  isLive?: boolean
}

const PARTICLES_PER_BEAM = 3
const PARTICLE_DUR_S = 2.4

export function IdeaFunnel({ ideaCount, products, isLive = false }: IdeaFunnelProps): ReactElement {
  const p = PIPELINE
  const uid = useId()
  const ids = {
    beam: `${uid}-beam`,
    glass: `${uid}-glass`,
    tile: `${uid}-tile`,
    prismL: `${uid}-prism-l`,
    prismR: `${uid}-prism-r`,
    prismClip: `${uid}-prism-clip`,
    sweep: `${uid}-sweep`,
    blur: `${uid}-blur`,
    softBlur: `${uid}-soft-blur`,
    path: (k: number): string => `${uid}-path-${k}`,
  }
  const kept = pickKeptIdeas(ideaCount, products.length)
  const gateCenter = p.gateX + p.gateWidth / 2
  const gateTop = p.ideaY0
  const gateBottom = ideaCenterY(ideaCount - 1) + p.ideaHeight / 2
  const prism = prismFacets(gateTop, gateBottom)

  return (
    <figure
      data-pipeline-figure
      className="relative m-0 overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(160deg,#121735,#0B0E22_60%)] p-[clamp(14px,2.2vw,26px)] text-white shadow-[0_40px_90px_-40px_color-mix(in_srgb,var(--iris)_70%,transparent)]"
      aria-label={`Illustration: ${ideaCount} pitches pass a prioritisation gate and ${products.length} become shipped products`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_50%_50%,color-mix(in_srgb,var(--iris)_32%,transparent),transparent),radial-gradient(35%_45%_at_88%_50%,color-mix(in_srgb,var(--lagoon)_20%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(255_255_255/.045)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/.045)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(75%_65%_at_50%_50%,#000,transparent)]"
      />
      <svg
        viewBox={`0 0 ${p.width} ${p.height}`}
        className="relative block h-auto w-full overflow-visible"
        data-testid="idea-funnel"
        role="presentation"
      >
        <defs>
          <linearGradient id={ids.beam} gradientUnits="userSpaceOnUse" x1={p.ideaX + p.ideaWidth} x2={p.productX} y1="0" y2="0">
            <stop offset="0" stopColor="#a8a2ff" />
            <stop offset=".5" stopColor="#ffffff" />
            <stop offset="1" stopColor="#5fe3d0" />
          </linearGradient>
          <linearGradient id={ids.glass} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".16" />
            <stop offset="1" stopColor="#fff" stopOpacity=".04" />
          </linearGradient>
          <linearGradient id={ids.tile} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="var(--iris)" />
            <stop offset="1" stopColor="var(--lagoon)" />
          </linearGradient>
          <linearGradient id={ids.prismL} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6d5dfc" />
            <stop offset=".5" stopColor="#3b2fb8" />
            <stop offset="1" stopColor="#6d5dfc" />
          </linearGradient>
          <linearGradient id={ids.prismR} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#b9b2ff" />
            <stop offset=".5" stopColor="#5fe3d0" />
            <stop offset="1" stopColor="#b9b2ff" />
          </linearGradient>
          <linearGradient id={ids.sweep} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".85" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={ids.prismClip}>
            <polygon points={prism.outline} />
          </clipPath>
          <filter id={ids.blur} x="-200%" y="-20%" width="500%" height="140%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id={ids.softBlur} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          {kept.map((ideaIdx, k) => (
            <path key={`def-${ideaIdx}`} id={ids.path(k)} d={beamPath(ideaIdx, k)} />
          ))}
        </defs>

        <g fontSize="11.5" fontWeight="600" letterSpacing="1.4" fill="rgb(255 255 255 / .55)" data-pl-label>
          <text x={p.ideaX} y="26">
            {`${ideaCount}+ PITCHES`}
          </text>
          <text x={gateCenter} y="26" textAnchor="middle" fill="#b9b2ff">
            PRIORITISE
          </text>
          <text x={p.productX + p.productWidth} y="26" textAnchor="end">
            {`${products.length} SHIPPED`}
          </text>
        </g>

        <g data-gate>
          <polygon
            points={prism.outline}
            fill="var(--iris)"
            filter={`url(#${ids.blur})`}
            className={isLive ? 'animate-prism-glow' : undefined}
            opacity=".75"
          />
          <polygon points={prism.left} fill={`url(#${ids.prismL})`} />
          <polygon points={prism.right} fill={`url(#${ids.prismR})`} opacity=".92" />
          <line x1={gateCenter} y1={gateTop - p.prismTip} x2={gateCenter} y2={gateBottom + p.prismTip} stroke="#fff" strokeOpacity=".7" strokeWidth="1" />
          <g clipPath={`url(#${ids.prismClip})`} className="motion-reduce:hidden">
            <rect
              data-prism-sweep
              x={p.gateX}
              y={gateTop - 90}
              width={p.gateWidth}
              height="70"
              fill={`url(#${ids.sweep})`}
              className="animate-prism-sweep"
            />
          </g>
        </g>
        <text
          data-pl-label
          x={gateCenter}
          y={gateBottom + p.prismTip + 16}
          textAnchor="middle"
          fontSize="11.5"
          fill="rgb(255 255 255 / .45)"
        >
          same evidence for every idea
        </text>

        {kept.map((ideaIdx, k) => (
          <g key={`beam-${ideaIdx}`}>
            <path
              data-beam-glow
              d={beamPath(ideaIdx, k)}
              pathLength={1}
              strokeDasharray="1 2"
              strokeDashoffset="0"
              fill="none"
              stroke={`url(#${ids.beam})`}
              strokeWidth="7"
              strokeOpacity=".45"
              strokeLinecap="round"
              filter={`url(#${ids.softBlur})`}
            />
            <path
              data-beam
              d={beamPath(ideaIdx, k)}
              pathLength={1}
              strokeDasharray="1 2"
              strokeDashoffset="0"
              fill="none"
              stroke={`url(#${ids.beam})`}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        ))}

        {isLive && (
          <g data-particles className="motion-reduce:hidden">
            {kept.flatMap((_, k) =>
              Array.from({ length: PARTICLES_PER_BEAM }, (_, j) => (
                <circle key={`particle-${k}-${j}`} data-particle r={j === 0 ? 2.6 : 1.8} fill="#fff" opacity={j === 0 ? 1 : 0.7}>
                  <animateMotion
                    dur={`${PARTICLE_DUR_S}s`}
                    begin={`${(k * 0.3 + (j * PARTICLE_DUR_S) / PARTICLES_PER_BEAM).toFixed(2)}s`}
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes="0;1"
                    keySplines=".45 0 .55 1"
                  >
                    <mpath href={`#${ids.path(k)}`} />
                  </animateMotion>
                </circle>
              )),
            )}
          </g>
        )}

        {Array.from({ length: ideaCount }, (_, i) => {
          const isKept = kept.includes(i)
          const y = p.ideaY0 + i * p.ideaGap
          const cy = ideaCenterY(i)
          const crossX = p.gateX - p.stubGap + 4
          return (
            <g key={`idea-${i}`} data-idea data-kept={isKept}>
              {!isKept && (
                <>
                  <path
                    data-stub
                    d={stubPath(i)}
                    pathLength={1}
                    strokeDasharray="1 2"
                    strokeDashoffset="0"
                    fill="none"
                    stroke="#fff"
                    strokeOpacity=".18"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <g data-cross stroke="var(--rose)" strokeWidth="2" strokeLinecap="round">
                    <line x1={crossX} y1={cy - 4} x2={crossX + 8} y2={cy + 4} />
                    <line x1={crossX} y1={cy + 4} x2={crossX + 8} y2={cy - 4} />
                  </g>
                </>
              )}
              <g
                data-idea-chip
                opacity={isKept ? 1 : 0.32}
                style={isKept ? undefined : { filter: 'blur(1.2px)' }}
              >
                <rect
                  x={p.ideaX}
                  y={y}
                  width={p.ideaWidth}
                  height={p.ideaHeight}
                  rx="9"
                  fill={`url(#${ids.glass})`}
                  stroke={isKept ? '#b9b2ff' : '#fff'}
                  strokeOpacity={isKept ? 0.7 : 0.18}
                  strokeWidth="1"
                />
                <line
                  x1={p.ideaX + 9}
                  x2={p.ideaX + p.ideaWidth - 9}
                  y1={y + 0.75}
                  y2={y + 0.75}
                  stroke="#fff"
                  strokeOpacity=".35"
                />
                <circle cx={p.ideaX + 15} cy={cy} r="4" fill={isKept ? '#b9b2ff' : 'rgb(255 255 255 / .45)'} />
                <text x={p.ideaX + 27} y={cy + 4.5} fontSize="13" fill="rgb(255 255 255 / .88)">
                  {`Pitch ${String(i + 1).padStart(2, '0')}`}
                </text>
              </g>
            </g>
          )
        })}

        {products.map((name, k) => {
          const cy = productCenterY(k)
          const top = cy - p.productHeight / 2
          return (
            <g key={name} data-product>
              <rect
                x={p.productX}
                y={top}
                width={p.productWidth}
                height={p.productHeight}
                rx="14"
                fill={`url(#${ids.tile})`}
                className={isLive ? '[filter:drop-shadow(0_0_14px_color-mix(in_srgb,var(--lagoon)_55%,transparent))]' : undefined}
              />
              <rect
                x={p.productX + 0.5}
                y={top + 0.5}
                width={p.productWidth - 1}
                height={p.productHeight - 1}
                rx="13.5"
                fill="none"
                stroke="#fff"
                strokeOpacity=".28"
              />
              <text x={p.productX + 14} y={cy - 3} fontSize="14" fontWeight="700" fill="#fff">
                {name}
              </text>
              <g data-check>
                <rect x={p.productX + 14} y={cy + 4} width="68" height="15" rx="7.5" fill="#fff" fillOpacity=".22" />
                <text x={p.productX + 22} y={cy + 15} fontSize="9.5" fontWeight="700" letterSpacing=".8" fill="#fff">
                  SHIPPED ✓
                </text>
              </g>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
