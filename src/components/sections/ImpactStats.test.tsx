import { act, render, screen, within } from '@testing-library/react'
import { setIntersecting } from '@/test/intersectionObserver'
import { formatStat, ImpactStats } from '@/components/sections/ImpactStats'
import { SkillsMarquee } from '@/components/sections/SkillsMarquee'
import { profile } from '@/data/profile'

describe('formatStat', () => {
  it('applies decimals and suffix', () => {
    expect(formatStat({ value: 9.34, decimals: 2 })).toBe('9.34')
    expect(formatStat({ value: 75, suffix: '%' })).toBe('75%')
    expect(formatStat({ value: 10, suffix: '+' })).toBe('10+')
  })
})

describe('ImpactStats', () => {
  it('renders one card per stat with value, label and detail', () => {
    render(<ImpactStats stats={profile.stats} />)
    const region = screen.getByRole('region', { name: 'Impact' })
    expect(within(region).getAllByRole('article')).toHaveLength(profile.stats.length)
    expect(within(region).getByText('75%')).toBeInTheDocument()
    expect(within(region).getByText('AI products shipped')).toBeInTheDocument()
  })

  it('counts the visible number up from zero once the card is on screen', () => {
    jest.useFakeTimers()
    render(<ImpactStats stats={profile.stats} />)
    const counter = screen.getByTestId('stat-shipped')
    expect(counter).toHaveTextContent('0')
    act(() => setIntersecting(counter.closest('article') as Element, true))
    act(() => jest.advanceTimersByTime(2000))
    expect(counter).toHaveTextContent('8')
    jest.useRealTimers()
  })
})

describe('SkillsMarquee', () => {
  it('duplicates each row for a seamless loop but hides the copy from screen readers', () => {
    render(<SkillsMarquee rows={[['SQL', 'RAG']]} />)
    const items = screen.getAllByText('SQL', { selector: 'span' })
    expect(items).toHaveLength(2)
    expect(items[1]).toHaveAttribute('aria-hidden', 'true')
  })
})
