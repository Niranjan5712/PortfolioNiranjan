import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Magnetic } from '@/components/common/Magnetic'
import { useTilt } from '@/hooks/useTilt'

function TiltProbe(): ReactElement {
  const ref = useTilt<HTMLDivElement>(8)
  return <div ref={ref} data-testid="card" />
}

function withFinePointer(): () => void {
  const original = window.matchMedia
  window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes('pointer: fine') })) as typeof window.matchMedia
  return () => {
    window.matchMedia = original
  }
}

describe('useTilt', () => {
  it('does nothing on touch or coarse pointers', () => {
    render(<TiltProbe />)
    expect(screen.getByTestId('card')).not.toHaveAttribute('data-tilt')
  })

  it('tilts toward the pointer and resets on leave', () => {
    const restore = withFinePointer()
    render(<TiltProbe />)
    const card = screen.getByTestId('card')
    card.getBoundingClientRect = (): DOMRect => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect
    expect(card).toHaveAttribute('data-tilt', 'true')

    card.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 0 }))
    expect(card.style.getPropertyValue('--rx')).toBe('8deg')
    expect(card.style.getPropertyValue('--ry')).toBe('8deg')
    expect(card.style.getPropertyValue('--glare')).toBe('1')

    card.dispatchEvent(new MouseEvent('pointerleave'))
    expect(card.style.getPropertyValue('--rx')).toBe('0deg')
    expect(card.style.getPropertyValue('--glare')).toBe('0')
    restore()
  })
})

describe('Magnetic', () => {
  it('only becomes magnetic with a fine pointer', () => {
    const { unmount } = render(
      <Magnetic>
        <a href="#x">Go</a>
      </Magnetic>,
    )
    expect(screen.getByRole('link').parentElement).toHaveAttribute('data-magnetic', 'false')
    unmount()

    const restore = withFinePointer()
    render(
      <Magnetic>
        <a href="#x">Go</a>
      </Magnetic>,
    )
    expect(screen.getByRole('link').parentElement).toHaveAttribute('data-magnetic', 'true')
    restore()
  })
})
