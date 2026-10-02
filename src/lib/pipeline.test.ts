import {
  activeStepFor,
  beamPath,
  ideaCenterY,
  PIPELINE,
  pickKeptIdeas,
  prismFacets,
  productCenterY,
  stepState,
  stubPath,
} from '@/lib/pipeline'

describe('pickKeptIdeas', () => {
  it('spreads kept ideas evenly from first to last', () => {
    expect(pickKeptIdeas(10, 5)).toEqual([0, 2, 5, 7, 9])
  })

  it('handles edge counts', () => {
    expect(pickKeptIdeas(10, 0)).toEqual([])
    expect(pickKeptIdeas(10, 1)).toEqual([0])
  })
})

describe('pipeline geometry', () => {
  it('keeps every idea and product inside the drawing', () => {
    expect(ideaCenterY(9) + PIPELINE.ideaHeight / 2).toBeLessThanOrEqual(PIPELINE.height)
    expect(productCenterY(4) + PIPELINE.productHeight / 2).toBeLessThanOrEqual(PIPELINE.height)
  })

  it('centres the product column on the idea column', () => {
    const ideasMid = (ideaCenterY(0) + ideaCenterY(9)) / 2
    const productsMid = (productCenterY(0) + productCenterY(4)) / 2
    expect(Math.abs(ideasMid - productsMid)).toBeLessThan(1)
  })

  it('runs beams from the idea edge, through the gate, to the product edge', () => {
    const d = beamPath(2, 1)
    expect(d.startsWith(`M ${PIPELINE.ideaX + PIPELINE.ideaWidth} ${ideaCenterY(2)}`)).toBe(true)
    expect(d).toContain(`${PIPELINE.gateX + PIPELINE.gateWidth / 2} ${(ideaCenterY(2) + productCenterY(1)) / 2}`)
    expect(d.endsWith(`${PIPELINE.productX} ${productCenterY(1)}`)).toBe(true)
  })

  it('stops dropped ideas short of the gate', () => {
    expect(stubPath(1).endsWith(`${PIPELINE.gateX - PIPELINE.stubGap} ${ideaCenterY(1)}`)).toBe(true)
  })

  it('keeps the gap between pitches, gate and products clear of overlap', () => {
    expect(PIPELINE.ideaX + PIPELINE.ideaWidth).toBeLessThan(PIPELINE.gateX - PIPELINE.stubGap)
    expect(PIPELINE.gateX + PIPELINE.gateWidth).toBeLessThan(PIPELINE.productX)
    expect(PIPELINE.productX + PIPELINE.productWidth).toBeLessThanOrEqual(PIPELINE.width)
  })
})

describe('prismFacets', () => {
  it('builds a pointed prism whose two facets meet on the centre line', () => {
    const { outline, left, right } = prismFacets(50, 400)
    const c = PIPELINE.gateX + PIPELINE.gateWidth / 2
    expect(outline.split(' ')).toHaveLength(6)
    expect(outline.startsWith(`${c},${50 - PIPELINE.prismTip}`)).toBe(true)
    expect(outline).toContain(`${c},${400 + PIPELINE.prismTip}`)
    expect(left).toContain(`${PIPELINE.gateX},50`)
    expect(right).toContain(`${PIPELINE.gateX + PIPELINE.gateWidth},400`)
  })
})

describe('step sync', () => {
  it('maps timeline progress to the current process step', () => {
    expect(activeStepFor(0)).toBe(0)
    expect(activeStepFor(0.2)).toBe(1)
    expect(activeStepFor(0.5)).toBe(2)
    expect(activeStepFor(0.7)).toBe(3)
    expect(activeStepFor(1)).toBe(4)
  })

  it('marks steps as done, current or upcoming', () => {
    expect(stepState(0, 2)).toBe('done')
    expect(stepState(2, 2)).toBe('current')
    expect(stepState(3, 2)).toBe('upcoming')
    expect(stepState(1, null)).toBeUndefined()
  })
})
