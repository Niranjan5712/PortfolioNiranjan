import { act, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { useRevealOnce } from '@/hooks/useRevealOnce'
import { setIntersecting } from '@/test/intersectionObserver'

function Probe(): ReactElement {
  const { ref, isRevealed } = useRevealOnce<HTMLDivElement>()
  return <div ref={ref} data-testid="probe" data-revealed={isRevealed} />
}

describe('useRevealOnce', () => {
  afterEach(() => jest.restoreAllMocks())

  it('reveals on first intersection and stays revealed', () => {
    render(<Probe />)
    const probe = screen.getByTestId('probe')
    expect(probe).toHaveAttribute('data-revealed', 'false')
    act(() => setIntersecting(probe, true))
    expect(probe).toHaveAttribute('data-revealed', 'true')
    act(() => setIntersecting(probe, false))
    expect(probe).toHaveAttribute('data-revealed', 'true')
  })

  it('is revealed immediately when reduced motion is preferred', () => {
    const original = window.matchMedia
    window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes('reduce') })) as typeof window.matchMedia
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveAttribute('data-revealed', 'true')
    window.matchMedia = original
  })
})
