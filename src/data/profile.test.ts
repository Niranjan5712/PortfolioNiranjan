import { profile } from '@/data/profile'

describe('profile data', () => {
  it('lists all 8 shipped products with unique ids', () => {
    const ids = profile.products.map((p) => p.id)
    expect(ids).toHaveLength(8)
    expect(new Set(ids).size).toBe(8)
  })

  it('marks exactly the 5 prioritised Xerago products for the funnel', () => {
    expect(profile.products.filter((p) => p.inFunnel)).toHaveLength(5)
  })

  it('gives every product a short problem, solution and impact', () => {
    profile.products.forEach((p) => {
      expect(p.problem.length).toBeGreaterThan(20)
      expect(p.problem.length).toBeLessThanOrEqual(90)
      expect(p.solution.length).toBeGreaterThan(20)
      expect(p.solution.length).toBeLessThanOrEqual(95)
      expect(p.result.value.length).toBeLessThanOrEqual(8)
      expect(p.result.label).toBeTruthy()
    })
  })

  it('keeps hedged wording on targets and estimates', () => {
    const talkToDb = profile.products.find((p) => p.id === 'talk-to-db')
    const examiner = profile.products.find((p) => p.id === 'examiner')
    expect(talkToDb?.result.label).toMatch(/target/)
    expect(examiner?.result.label).toMatch(/estimated/)
  })

  it('covers prioritisation, backlog health and shipping principles', () => {
    expect(profile.principles.map((p) => p.id)).toEqual(['prioritisation', 'backlog', 'shipping'])
  })

  it('places hotspots inside the stage bounds', () => {
    profile.hero.hotspots.forEach((h) => {
      expect(h.x).toBeGreaterThanOrEqual(0)
      expect(h.x).toBeLessThanOrEqual(100)
      expect(h.y).toBeGreaterThanOrEqual(0)
      expect(h.y).toBeLessThanOrEqual(100)
    })
  })
})
