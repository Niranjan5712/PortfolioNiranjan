import { useEffect, useRef, type ReactElement } from 'react'
import { scrollProgress } from '@/lib/motion'

export function ScrollProgress(): ReactElement {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = (): void => {
      raf = 0
      const root = document.documentElement
      const p = scrollProgress(window.scrollY, root.scrollHeight, window.innerHeight)
      barRef.current?.style.setProperty('transform', `scaleX(${p})`)
    }
    const onScroll = (): void => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5">
      <div
        ref={barRef}
        data-testid="scroll-progress"
        className="h-full origin-left scale-x-0 bg-[linear-gradient(90deg,var(--iris),var(--lagoon),var(--sun))]"
      />
    </div>
  )
}
