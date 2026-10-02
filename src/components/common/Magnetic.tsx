import { useEffect, useRef, type ReactElement, type ReactNode } from 'react'
import { useFinePointer } from '@/hooks/useFinePointer'
import { gsap } from '@/lib/gsap'
import { magneticOffset } from '@/lib/motion'

interface MagneticProps {
  children: ReactNode
  strength?: number
}

export function Magnetic({ children, strength = 0.3 }: MagneticProps): ReactElement {
  const ref = useRef<HTMLSpanElement>(null)
  const isEnabled = useFinePointer()

  useEffect(() => {
    const el = ref.current
    if (!el || !isEnabled) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const onMove = (e: PointerEvent): void => {
      const { x, y } = magneticOffset(e.clientX, e.clientY, el.getBoundingClientRect(), strength)
      xTo(x)
      yTo(y)
    }
    const onLeave = (): void => {
      xTo(0)
      yTo(0)
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      gsap.set(el, { clearProps: 'transform' })
    }
  }, [isEnabled, strength])

  return (
    <span ref={ref} data-magnetic={isEnabled} className="inline-block will-change-transform">
      {children}
    </span>
  )
}
