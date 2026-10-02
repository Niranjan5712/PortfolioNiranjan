import { useEffect, useRef, type RefObject } from 'react'
import { useFinePointer } from '@/hooks/useFinePointer'
import { tiltAngles } from '@/lib/motion'

const RESTING = { '--rx': '0deg', '--ry': '0deg', '--gx': '50%', '--gy': '50%', '--glare': '0' } as const

export function useTilt<T extends HTMLElement>(maxDeg = 6): RefObject<T | null> {
  const ref = useRef<T>(null)
  const isEnabled = useFinePointer()

  useEffect(() => {
    const el = ref.current
    if (!el || !isEnabled) return
    const apply = (vars: Record<string, string>): void =>
      Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v))
    const onMove = (e: PointerEvent): void => {
      const t = tiltAngles(e.clientX, e.clientY, el.getBoundingClientRect(), maxDeg)
      apply({ '--rx': `${t.rotateX}deg`, '--ry': `${t.rotateY}deg`, '--gx': `${t.glareX}%`, '--gy': `${t.glareY}%`, '--glare': '1' })
    }
    const onLeave = (): void => apply(RESTING)
    el.dataset.tilt = 'true'
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      delete el.dataset.tilt
      apply(RESTING)
    }
  }, [isEnabled, maxDeg])

  return ref
}
