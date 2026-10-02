function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function easeOutExpo(t: number): number {
  const x = clamp01(t)
  return x === 1 ? 1 : 1 - 2 ** (-10 * x)
}

export function countValue(target: number, t: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(target * easeOutExpo(t) * factor) / factor
}

export function scrollProgress(scrollY: number, docHeight: number, viewportHeight: number): number {
  const distance = docHeight - viewportHeight
  return distance <= 0 ? 0 : clamp01(scrollY / distance)
}

interface Box {
  left: number
  top: number
  width: number
  height: number
}

interface Point {
  x: number
  y: number
}

interface Tilt {
  rotateX: number
  rotateY: number
  glareX: number
  glareY: number
}

export function magneticOffset(pointerX: number, pointerY: number, box: Box, strength: number): Point {
  return {
    x: (pointerX - (box.left + box.width / 2)) * strength,
    y: (pointerY - (box.top + box.height / 2)) * strength,
  }
}

export function tiltAngles(pointerX: number, pointerY: number, box: Box, maxDeg: number): Tilt {
  const px = clamp01((pointerX - box.left) / box.width)
  const py = clamp01((pointerY - box.top) / box.height)
  return {
    rotateX: (0.5 - py) * 2 * maxDeg + 0,
    rotateY: (px - 0.5) * 2 * maxDeg + 0,
    glareX: Math.round(px * 100),
    glareY: Math.round(py * 100),
  }
}

export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}
