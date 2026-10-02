export const CONTRAIL = {
  columns: 13,
  rows: 2,
  maxDriftX: 60,
} as const

export interface ContrailPuff {
  /** Centre, in % of the airspace. */
  x: number
  y: number
  /** Diameter, in % of the airspace height. */
  size: number
  /** How far the puff drifts as it clears (px). */
  driftX: number
  driftY: number
}

function hash(seed: number): number {
  const x = Math.sin(seed * 78.233 + 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/** A thick two-row trail of overlapping puffs, ordered left to right (the order the jet lays them). */
export function contrailPuffs(): ContrailPuff[] {
  const { columns, rows, maxDriftX } = CONTRAIL
  const puffs: ContrailPuff[] = []
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows; r++) {
      const i = c * rows + r
      const y = r === 0 ? 26 + hash(i + 1) * 6 : 68 + hash(i + 1) * 6
      puffs.push({
        x: Math.round((c / (columns - 1)) * 100 + (r === 0 ? 0 : 0.5)),
        y: Math.round(y),
        size: Math.round(66 + hash(i + 7) * 12),
        driftX: Math.round((hash(i + 13) - 0.5) * 2 * maxDriftX),
        driftY: -Math.round(40 + hash(i + 19) * 60),
      })
    }
  }
  return puffs
}
