import { render, screen } from '@testing-library/react'
import { Awards } from '@/components/sections/Awards'
import { profile } from '@/data/profile'
import { contrailPuffs } from '@/lib/contrail'

function preferReducedMotion(): () => void {
  const original = window.matchMedia
  window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes('reduce') })) as typeof window.matchMedia
  return () => {
    window.matchMedia = original
  }
}

describe('Awards', () => {
  it('renders each award with its issuer and reason', () => {
    render(<Awards awards={profile.awards} />)
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Best Innovation Award' })).toBeInTheDocument()
    expect(screen.getByText(/Eastern Command, Indian Army/)).toBeInTheDocument()
    expect(screen.getByText(/Pilot Fatigue Management/)).toBeInTheDocument()
  })

  it('flies a jet over the cards, trailing a decorative contrail', () => {
    const { container } = render(<Awards awards={profile.awards} />)
    const flyby = container.querySelector('[data-flyby]')
    expect(flyby).toHaveAttribute('aria-hidden', 'true')
    expect(flyby?.querySelector('[data-jet] svg')).toBeInTheDocument()
    expect(flyby?.querySelectorAll('[data-puff]')).toHaveLength(contrailPuffs().length)
    expect(flyby?.querySelector('feTurbulence')).toBeInTheDocument()
  })

  it('gives every award card a border beam that starts switched off', () => {
    const { container } = render(<Awards awards={profile.awards} />)
    container.querySelectorAll('[data-award]').forEach((card) => {
      expect(card.querySelector('[data-border-beam]')).toBeInTheDocument()
      expect(card).not.toHaveAttribute('data-beam', 'on')
    })
  })

  it('skips the fly-by with reduced motion', () => {
    const restore = preferReducedMotion()
    const { container } = render(<Awards awards={profile.awards} />)
    expect(container.querySelector('[data-flyby]')).not.toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
    restore()
  })
})
