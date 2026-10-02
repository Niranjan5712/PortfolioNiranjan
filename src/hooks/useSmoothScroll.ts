import { useEffect } from 'react'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, ScrollTrigger } from '@/lib/gsap'

const NAV_OFFSET = -80

export function useSmoothScroll(): void {
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    const lenis = new Lenis({ duration: 1.15, anchors: { offset: NAV_OFFSET } })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number): void => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [reducedMotion])
}
