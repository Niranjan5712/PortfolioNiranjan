import { alphaBounds, keyBackground, padRect } from '@/lib/hero/keyBackground'

type Px = [number, number, number]

function makeImage(width: number, height: number, paint: (x: number, y: number) => Px): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = paint(x, y)
      const i = (y * width + x) * 4
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = 255
    }
  }
  return data
}

const alpha = (data: Uint8ClampedArray, width: number, x: number, y: number): number => data[(y * width + x) * 4 + 3]

const CHECKER = (x: number, y: number): Px => ((x + y) % 2 === 0 ? [250, 250, 250] : [229, 229, 229])
const GREY: Px = [150, 150, 150]
const HIGHLIGHT: Px = [245, 245, 245]
const ORANGE: Px = [250, 200, 120]

describe('keyBackground', () => {
  it('clears a checkerboard backdrop connected to the border', () => {
    const data = makeImage(8, 8, CHECKER)
    expect(keyBackground(data, 8, 8)).toBe(64)
    expect(alpha(data, 8, 3, 3)).toBe(0)
  })

  it('keeps the subject, including bright highlights enclosed by it', () => {
    const data = makeImage(9, 9, (x, y) => {
      if (x === 4 && y === 4) return HIGHLIGHT
      if (x >= 2 && x <= 6 && y >= 2 && y <= 6) return GREY
      return CHECKER(x, y)
    })
    keyBackground(data, 9, 9)
    expect(alpha(data, 9, 0, 0)).toBe(0)
    expect(alpha(data, 9, 4, 4)).toBe(255)
    expect(alpha(data, 9, 3, 4)).toBe(255)
  })

  it('removes enclosed checkerboard pockets but keeps enclosed uniform highlights', () => {
    const size = 20
    const pocket = (x: number, y: number): boolean => x >= 4 && x <= 9 && y >= 4 && y <= 9
    const shine = (x: number, y: number): boolean => x >= 12 && x <= 15 && y >= 4 && y <= 9
    const data = makeImage(size, size, (x, y) => {
      if (pocket(x, y)) return CHECKER(x, y)
      if (shine(x, y)) return HIGHLIGHT
      if (x >= 2 && x <= 17 && y >= 2 && y <= 11) return GREY
      return CHECKER(x, y)
    })
    keyBackground(data, size, size)
    expect(alpha(data, size, 6, 6)).toBe(0)
    expect(alpha(data, size, 13, 6)).toBe(255)
  })

  it('never removes saturated colour even when it is light', () => {
    const data = makeImage(6, 6, (x, y) => (x === 0 && y === 0 ? ORANGE : CHECKER(x, y)))
    keyBackground(data, 6, 6)
    expect(alpha(data, 6, 0, 0)).toBe(255)
  })

  it('feathers light subject pixels on the silhouette edge', () => {
    const data = makeImage(6, 6, (x, y) => {
      if (x === 3 && y === 3) return [210, 210, 210]
      if (x >= 2 && x <= 4 && y >= 2 && y <= 4) return GREY
      return CHECKER(x, y)
    })
    keyBackground(data, 6, 6)
    const edge = alpha(data, 6, 2, 3)
    expect(edge).toBe(255)
    const lightData = makeImage(5, 5, (x, y) => (x === 2 && y === 2 ? [215, 215, 215] : CHECKER(x, y)))
    keyBackground(lightData, 5, 5)
    const feathered = alpha(lightData, 5, 2, 2)
    expect(feathered).toBeGreaterThan(0)
    expect(feathered).toBeLessThan(255)
  })
})

describe('alphaBounds', () => {
  it('returns the tight box around visible pixels', () => {
    const data = makeImage(10, 10, (x, y) => (x >= 3 && x <= 5 && y >= 2 && y <= 7 ? GREY : CHECKER(x, y)))
    keyBackground(data, 10, 10)
    expect(alphaBounds(data, 10, 10)).toEqual({ x: 3, y: 2, width: 3, height: 6 })
  })

  it('returns null for a fully transparent frame', () => {
    const data = makeImage(4, 4, CHECKER)
    keyBackground(data, 4, 4)
    expect(alphaBounds(data, 4, 4)).toBeNull()
  })
})

describe('padRect', () => {
  it('pads proportionally and clamps to the frame', () => {
    expect(padRect({ x: 10, y: 10, width: 20, height: 40 }, 0.1, 100, 100)).toEqual({ x: 6, y: 6, width: 28, height: 48 })
    expect(padRect({ x: 1, y: 1, width: 98, height: 98 }, 0.1, 100, 100)).toEqual({ x: 0, y: 0, width: 100, height: 100 })
  })
})
