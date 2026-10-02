import { useEffect, useState } from 'react'

export function useCycle(length: number, intervalMs: number, enabled = true): number {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!enabled || length <= 1) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), intervalMs)
    return () => window.clearInterval(id)
  }, [length, intervalMs, enabled])

  return index
}
