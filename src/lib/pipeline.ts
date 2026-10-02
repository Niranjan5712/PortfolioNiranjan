export const PIPELINE = {
  width: 560,
  height: 448,
  ideaX: 20,
  ideaWidth: 124,
  ideaHeight: 28,
  ideaY0: 52,
  ideaGap: 38,
  gateX: 266,
  gateWidth: 28,
  prismTip: 16,
  stubGap: 24,
  productX: 380,
  productWidth: 172,
  productHeight: 50,
  productY0: 60,
  productGap: 76,
} as const

export interface PrismFacets {
  outline: string
  left: string
  right: string
}

/** Timeline positions (0..1) at which each process step becomes current. */
export const STEP_STARTS = [0, 0.16, 0.4, 0.6, 0.8] as const

export const STEP_STATES = {
  done: 'done',
  current: 'current',
  upcoming: 'upcoming',
} as const

export type StepState = (typeof STEP_STATES)[keyof typeof STEP_STATES]

export function pickKeptIdeas(ideaCount: number, keepCount: number): number[] {
  if (keepCount <= 0) return []
  if (keepCount === 1) return [0]
  const step = (ideaCount - 1) / (keepCount - 1)
  return Array.from({ length: keepCount }, (_, i) => Math.round(i * step))
}

export function ideaCenterY(index: number): number {
  return PIPELINE.ideaY0 + index * PIPELINE.ideaGap + PIPELINE.ideaHeight / 2
}

export function productCenterY(index: number): number {
  return PIPELINE.productY0 + index * PIPELINE.productGap + PIPELINE.productHeight / 2
}

export function beamPath(ideaIndex: number, productIndex: number): string {
  const p = PIPELINE
  const x1 = p.ideaX + p.ideaWidth
  const xg = p.gateX + p.gateWidth / 2
  const x2 = p.productX
  const y1 = ideaCenterY(ideaIndex)
  const y2 = productCenterY(productIndex)
  const yg = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1 + 70} ${y1}, ${xg - 50} ${yg}, ${xg} ${yg} C ${xg + 50} ${yg}, ${x2 - 60} ${y2}, ${x2} ${y2}`
}

export function stubPath(ideaIndex: number): string {
  const y = ideaCenterY(ideaIndex)
  return `M ${PIPELINE.ideaX + PIPELINE.ideaWidth} ${y} L ${PIPELINE.gateX - PIPELINE.stubGap} ${y}`
}

/** A tall hexagonal prism spanning the idea column, split into a darker left and lighter right facet. */
export function prismFacets(top: number, bottom: number): PrismFacets {
  const { gateX, gateWidth, prismTip } = PIPELINE
  const l = gateX
  const r = gateX + gateWidth
  const c = gateX + gateWidth / 2
  const pts = (list: number[][]): string => list.map(([x, y]) => `${x},${y}`).join(' ')
  return {
    outline: pts([[c, top - prismTip], [r, top], [r, bottom], [c, bottom + prismTip], [l, bottom], [l, top]]),
    left: pts([[c, top - prismTip], [c, bottom + prismTip], [l, bottom], [l, top]]),
    right: pts([[c, top - prismTip], [r, top], [r, bottom], [c, bottom + prismTip]]),
  }
}

export function activeStepFor(progress: number): number {
  return Math.max(0, STEP_STARTS.filter((s) => progress >= s).length - 1)
}

export function stepState(index: number, activeStep: number | null): StepState | undefined {
  if (activeStep === null) return undefined
  if (index < activeStep) return STEP_STATES.done
  return index === activeStep ? STEP_STATES.current : STEP_STATES.upcoming
}
