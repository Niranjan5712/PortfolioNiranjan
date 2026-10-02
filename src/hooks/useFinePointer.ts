import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function useFinePointer(): boolean {
  const reducedMotion = usePrefersReducedMotion()
  return !reducedMotion && typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
}
