import { useEffect } from 'react'
import { ScrollTrigger } from '@/lib/gsap'

const SETTLE_MS = 200

function layoutSignature(sections: HTMLElement[]): number {
  return sections.reduce((sum, s) => sum + s.offsetHeight, document.body.scrollHeight)
}

/**
 * Re-measures every ScrollTrigger once the layout settles (fonts, images and media load after the first layout).
 * Sections are observed too, because a pinned section can change size without changing the page height.
 */
export function useScrollTriggerAutoRefresh(): void {
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const sections = [...document.querySelectorAll<HTMLElement>('section')]
    let last = layoutSignature(sections)
    let timer = 0
    const observer = new ResizeObserver(() => {
      const next = layoutSignature(sections)
      if (Math.abs(next - last) < 2) return
      last = next
      window.clearTimeout(timer)
      timer = window.setTimeout(() => ScrollTrigger.refresh(), SETTLE_MS)
    })
    observer.observe(document.body)
    sections.forEach((s) => observer.observe(s))
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [])
}
