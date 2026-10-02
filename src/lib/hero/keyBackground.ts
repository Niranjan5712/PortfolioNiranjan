export interface KeyOptions {
  threshold: number
  maxChroma: number
  feather: number
  /** Enclosed candidate regions at least this fraction of the frame are checked for a checkerboard signature. */
  minEnclosedRatio: number
  /** Brightness splitting the two checkerboard tones. */
  checkerSplit: number
  /** Minimum share of each tone for an enclosed region to count as backdrop. */
  minToneShare: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export const DEFAULT_KEY: KeyOptions = {
  threshold: 224,
  maxChroma: 10,
  feather: 28,
  minEnclosedRatio: 0.0008,
  checkerSplit: 241,
  minToneShare: 0.18,
}

function lumAt(data: Uint8ClampedArray, i: number): number {
  return (data[i] + data[i + 1] + data[i + 2]) / 3
}

function chromaAt(data: Uint8ClampedArray, i: number): number {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  return Math.max(r, g, b) - Math.min(r, g, b)
}

function removeEnclosedCheckerboard(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  isBg: Uint8Array,
  isCandidate: (p: number) => boolean,
  opts: KeyOptions,
): void {
  const total = width * height
  const minSize = Math.max(4, Math.round(total * opts.minEnclosedRatio))
  const visited = new Uint8Array(total)
  const members = new Int32Array(total)

  for (let start = 0; start < total; start++) {
    if (isBg[start] || visited[start] || !isCandidate(start)) continue
    let head = 0
    let tail = 0
    let light = 0
    const visit = (q: number): void => {
      if (!visited[q] && !isBg[q] && isCandidate(q)) {
        visited[q] = 1
        members[tail++] = q
      }
    }
    members[tail++] = start
    visited[start] = 1
    while (head < tail) {
      const p = members[head++]
      if (lumAt(data, p * 4) >= opts.checkerSplit) light++
      const x = p % width
      if (x > 0) visit(p - 1)
      if (x < width - 1) visit(p + 1)
      if (p >= width) visit(p - width)
      if (p < total - width) visit(p + width)
    }
    const size = tail
    const lightShare = light / size
    const isChecker = size >= minSize && lightShare >= opts.minToneShare && 1 - lightShare >= opts.minToneShare
    if (isChecker) for (let i = 0; i < size; i++) isBg[members[i]] = 1
  }
}

/**
 * Makes the light, colourless backdrop transparent. Pixels connected to the frame border are
 * removed (flood fill), plus enclosed pockets that carry the two-tone checkerboard signature,
 * so uniform bright highlights inside the subject survive.
 * Returns the number of pixels cleared.
 */
export function keyBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  opts: KeyOptions = DEFAULT_KEY,
): number {
  const total = width * height
  const isBg = new Uint8Array(total)
  const stack = new Int32Array(total)
  let sp = 0

  const isCandidate = (p: number): boolean => {
    const i = p * 4
    return chromaAt(data, i) <= opts.maxChroma && lumAt(data, i) >= opts.threshold
  }
  const seed = (p: number): void => {
    if (!isBg[p] && isCandidate(p)) {
      isBg[p] = 1
      stack[sp++] = p
    }
  }

  for (let x = 0; x < width; x++) {
    seed(x)
    seed((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    seed(y * width)
    seed(y * width + width - 1)
  }

  while (sp > 0) {
    const p = stack[--sp]
    const x = p % width
    if (x > 0) seed(p - 1)
    if (x < width - 1) seed(p + 1)
    if (p >= width) seed(p - width)
    if (p < total - width) seed(p + width)
  }

  removeEnclosedCheckerboard(data, width, height, isBg, isCandidate, opts)

  let cleared = 0
  for (let p = 0; p < total; p++) {
    if (isBg[p]) {
      data[p * 4 + 3] = 0
      cleared++
    }
  }

  for (let p = 0; p < total; p++) {
    if (isBg[p]) continue
    const x = p % width
    const touchesBg =
      (x > 0 && isBg[p - 1]) ||
      (x < width - 1 && isBg[p + 1]) ||
      (p >= width && isBg[p - width]) ||
      (p < total - width && isBg[p + width])
    if (!touchesBg) continue
    const i = p * 4
    if (chromaAt(data, i) > opts.maxChroma * 2) continue
    const fade = (opts.threshold - lumAt(data, i)) / opts.feather
    data[i + 3] = Math.round(data[i + 3] * Math.min(1, Math.max(0.15, fade)))
  }

  return cleared
}

export function alphaBounds(data: Uint8ClampedArray, width: number, height: number, minAlpha = 24): Rect | null {
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < minAlpha) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  if (maxX < 0) return null
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
}

export function padRect(rect: Rect, padRatio: number, maxWidth: number, maxHeight: number): Rect {
  const pad = Math.round(Math.max(rect.width, rect.height) * padRatio)
  const x = Math.max(0, rect.x - pad)
  const y = Math.max(0, rect.y - pad)
  return {
    x,
    y,
    width: Math.min(maxWidth, rect.x + rect.width + pad) - x,
    height: Math.min(maxHeight, rect.y + rect.height + pad) - y,
  }
}
