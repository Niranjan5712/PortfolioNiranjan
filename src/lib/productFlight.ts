export interface PosterPose {
  x: number
  y: number
  z: number
  rotationX: number
  rotationY: number
  rotationZ: number
  scale: number
  opacity: number
}

/** Timeline positions inside each card's 1-unit segment. */
export const POSTER_TIMING = {
  fadeIn: 0.05,
  swoopAt: 0.3,
  slapAt: 0.5,
  settle: 0.08,
  knock: 0.14,
  unitVh: 0.7,
  perspective: 1400,
} as const

export const PILE_LIMIT = 4

const DIRECTIONS = [
  { x: -1, y: 0.55 },
  { x: 1, y: -0.5 },
  { x: -0.85, y: -0.75 },
  { x: 0.9, y: 0.7 },
] as const

const TILTS = [-1.6, 1.2, -0.8, 1.5, -1.2, 0.9, -1.4, 1.1] as const

function direction(i: number): (typeof DIRECTIONS)[number] {
  return DIRECTIONS[i % DIRECTIONS.length]
}

function spin(i: number): 1 | -1 {
  return i % 2 === 0 ? -1 : 1
}

export function restTilt(i: number): number {
  return TILTS[i % TILTS.length]
}

export function launchPose(i: number, vw: number, vh: number): PosterPose {
  const d = direction(i)
  return {
    x: d.x * vw * 0.75,
    y: d.y * vh * 0.8,
    z: -1800,
    rotationX: -d.y * 80,
    rotationY: spin(i) * 540,
    rotationZ: spin(i) * -220,
    scale: 0.7,
    opacity: 0,
  }
}

export function swoopPose(i: number, vw: number, vh: number): PosterPose {
  const d = direction(i)
  return {
    x: -d.x * vw * 0.07,
    y: -vh * 0.05,
    z: -420,
    rotationX: -d.y * 22,
    rotationY: spin(i) * 140,
    rotationZ: spin(i) * -28,
    scale: 0.95,
    opacity: 1,
  }
}

export function slapPose(i: number): PosterPose {
  return { x: 0, y: 0, z: 170, rotationX: 0, rotationY: 0, rotationZ: restTilt(i) * 2, scale: 1.05, opacity: 1 }
}

export function restPose(i: number): PosterPose {
  return { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: restTilt(i), scale: 1, opacity: 1 }
}

/** Pose of a card knocked back into the pile, `depth` cards below the top one. */
export function pilePose(i: number, depth: number): PosterPose {
  const side = i % 2 === 0 ? -1 : 1
  return {
    x: side * (46 + (i % 3) * 26),
    y: -depth * 16 + (i % 2) * 22,
    z: -depth * 100,
    rotationX: 0,
    rotationY: 0,
    rotationZ: restTilt(i) * 4 + side * depth * 1.5,
    scale: 1,
    opacity: depth > PILE_LIMIT ? 0 : 1,
  }
}

export function topPosterIndex(progress: number, count: number): number {
  const t = progress * count
  return Math.min(count - 1, Math.max(0, Math.floor(t - POSTER_TIMING.slapAt)))
}
