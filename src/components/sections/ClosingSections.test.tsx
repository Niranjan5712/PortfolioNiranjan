import { act, render, screen } from '@testing-library/react'
import { Beyond, COUNT_MS } from '@/components/sections/Beyond'
import { Contact } from '@/components/sections/Contact'
import { profile } from '@/data/profile'
import { setIntersecting } from '@/test/intersectionObserver'

describe('Beyond', () => {
  afterEach(() => jest.useRealTimers())

  it('shows PR numbers and interests', () => {
    render(<Beyond content={profile.beyond} />)
    expect(screen.getByText('30+')).toBeInTheDocument()
    expect(screen.getByText('20+')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(profile.beyond.interests.length)
  })

  it('sets the PR card on a concert stage with sweeping spotlights', () => {
    const { container } = render(<Beyond content={profile.beyond} />)
    expect(container.querySelector('[data-stage]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-spotlight]')).toHaveLength(3)
  })

  it('shows each interest as a living tile with its own illustration', () => {
    const { container } = render(<Beyond content={profile.beyond} />)
    const tiles = [...container.querySelectorAll('[data-interest]')]
    expect(tiles.map((t) => t.getAttribute('data-illustration'))).toEqual(['reading', 'podcasts', 'hiking'])
    expect(tiles.map((t) => t.textContent)).toEqual(['Reading', 'Podcasts', 'Hiking'])
    expect(container.querySelectorAll('[data-page]').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('[data-eq-bar]').length).toBeGreaterThanOrEqual(5)
    expect(container.querySelector('[data-trail]')).toBeInTheDocument()
    expect(container.querySelector('[data-hiker] animateMotion')).toBeInTheDocument()
  })

  it('bursts confetti once the counters finish', () => {
    jest.useFakeTimers()
    const { container } = render(<Beyond content={profile.beyond} />)
    expect(container.querySelector('[data-confetti]')).not.toBeInTheDocument()
    act(() => setIntersecting(container.querySelector('[data-stage]') as Element, true))
    act(() => jest.advanceTimersByTime(COUNT_MS - 10))
    expect(container.querySelector('[data-confetti]')).not.toBeInTheDocument()
    act(() => jest.advanceTimersByTime(20))
    expect(container.querySelectorAll('[data-confetti-piece]').length).toBeGreaterThan(20)
  })

  it('never throws confetti with reduced motion', () => {
    jest.useFakeTimers()
    const original = window.matchMedia
    window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes('reduce') })) as typeof window.matchMedia
    const { container } = render(<Beyond content={profile.beyond} />)
    act(() => jest.advanceTimersByTime(COUNT_MS * 2))
    expect(container.querySelector('[data-confetti]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-hiker] animateMotion')).not.toBeInTheDocument()
    window.matchMedia = original
  })
})

describe('Contact', () => {
  it('links every contact channel safely', () => {
    render(<Contact contact={profile.contact} />)
    expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', `mailto:${profile.contact.email}`)
    expect(screen.getByRole('link', { name: 'Call' })).toHaveAttribute('href', profile.contact.phoneHref)
    const linkedin = screen.getByRole('link', { name: 'LinkedIn' })
    expect(linkedin).toHaveAttribute('href', profile.contact.linkedin)
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
