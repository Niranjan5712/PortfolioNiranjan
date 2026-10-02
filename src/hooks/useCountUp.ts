import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { countValue } from '@/lib/motion'

interface CountUpOptions {
  active: boolean
  decimals?: number
  durationMs?: number
}

export function useCountUp(target: number, { active, decimals = 0, durationMs = 1600 }: CountUpOptions): number {
  const reducedMotion = usePrefersReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active || reducedMotion) return
    const start = performance.now()
    let raf = 0
    const tick = (): void => {
      const t = (performance.now() - start) / durationMs
      setValue(countValue(target, t, decimals))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, reducedMotion, target, decimals, durationMs])

  return reducedMotion ? target : value
}
