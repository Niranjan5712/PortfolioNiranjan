import {
  launchPose,
  pilePose,
  POSTER_TIMING,
  restPose,
  slapPose,
  swoopPose,
  topPosterIndex,
} from '@/lib/productFlight'

const VW = 1440
const VH = 900

describe('poster flight poses', () => {
  it('launches every card far away, off to one side, spinning and invisible', () => {
    for (let i = 0; i < 8; i++) {
      const p = launchPose(i, VW, VH)
      expect(p.z).toBeLessThan(-1000)
      expect(Math.abs(p.x)).toBeGreaterThan(VW * 0.3)
      expect(Math.abs(p.rotationY)).toBeGreaterThanOrEqual(360)
      expect(p.opacity).toBe(0)
    }
  })

  it('alternates the side each card flies in from', () => {
    const sides = [0, 1, 2, 3].map((i) => Math.sign(launchPose(i, VW, VH).x))
    expect(new Set(sides).size).toBe(2)
    expect(sides[0]).not.toBe(sides[1])
  })

  it('curves the path: the swoop is closer, slower-spinning and visible', () => {
    const launch = launchPose(2, VW, VH)
    const swoop = swoopPose(2, VW, VH)
    expect(swoop.z).toBeGreaterThan(launch.z)
    expect(Math.abs(swoop.rotationY)).toBeLessThan(Math.abs(launch.rotationY))
    expect(swoop.opacity).toBe(1)
  })

  it('slaps in slightly closer than rest, then rests flat and centred', () => {
    const slap = slapPose(3)
    const rest = restPose(3)
    expect(slap.z).toBeGreaterThan(rest.z)
    expect(slap.scale).toBeGreaterThan(rest.scale)
    expect(rest).toMatchObject({ x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, scale: 1 })
    expect(Math.abs(rest.rotationZ)).toBeLessThanOrEqual(2)
  })

  it('pushes older posters deeper into a messy pile and hides the oldest', () => {
    const near = pilePose(0, 1)
    const far = pilePose(0, 3)
    expect(far.z).toBeLessThan(near.z)
    expect(Math.abs(near.rotationZ)).toBeGreaterThan(Math.abs(restPose(0).rotationZ))
    expect(pilePose(0, 4).opacity).toBe(1)
    expect(pilePose(0, 5).opacity).toBe(0)
  })

  it('gives each card the same pose on every visit', () => {
    expect(launchPose(5, VW, VH)).toEqual(launchPose(5, VW, VH))
    expect(pilePose(5, 2)).toEqual(pilePose(5, 2))
  })
})

describe('topPosterIndex', () => {
  it('counts a poster as on top once it has slapped in', () => {
    const slap = POSTER_TIMING.slapAt
    expect(topPosterIndex(0, 8)).toBe(0)
    expect(topPosterIndex((1 + slap - 0.01) / 8, 8)).toBe(0)
    expect(topPosterIndex((1 + slap + 0.01) / 8, 8)).toBe(1)
    expect(topPosterIndex(1, 8)).toBe(7)
  })
})
