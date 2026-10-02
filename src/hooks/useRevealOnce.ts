import { useEffect, useRef, useState, type RefObject } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface RevealOptions {
  threshold?: number
  rootMargin?: string
}

interface RevealState<T extends Element> {
  ref: RefObject<T | null>
  isRevealed: boolean
}

export function useRevealOnce<T extends Element>({
  threshold = 0.2,
  rootMargin = '0px 0px -10% 0px',
}: RevealOptions = {}): RevealState<T> {
  const ref = useRef<T>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || hasIntersected || reducedMotion) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setHasIntersected(true)
        io.disconnect()
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasIntersected, reducedMotion, threshold, rootMargin])

  return { ref, isRevealed: hasIntersected || reducedMotion }
}
