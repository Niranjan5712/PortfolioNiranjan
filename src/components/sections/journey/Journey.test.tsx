import { render, screen, within } from '@testing-library/react'
import { CodeToRoadmap, MORPH_ROWS } from '@/components/sections/journey/CodeToRoadmap'
import { Journey } from '@/components/sections/journey/Journey'
import { profile } from '@/data/profile'

function preferReducedMotion(): () => void {
  const original = window.matchMedia
  window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes('reduce') })) as typeof window.matchMedia
  return () => {
    window.matchMedia = original
  }
}

describe('CodeToRoadmap', () => {
  it('pairs each line of model code with the roadmap step it becomes', () => {
    const { container } = render(<CodeToRoadmap />)
    expect(screen.getByRole('figure', { name: 'From AI engineer to AI product' })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-morph-row]')).toHaveLength(MORPH_ROWS.length)
    expect(container.querySelectorAll('[data-code-line]')).toHaveLength(MORPH_ROWS.length)
    const roadmap = screen.getByRole('list', { name: 'Roadmap' })
    expect(within(roadmap).getAllByRole('listitem').map((li) => li.querySelector('h4')?.textContent)).toEqual([
      'Discover',
      'Prioritise',
      'Ship',
    ])
    expect(within(roadmap).getByText('10+ ideas narrowed to 5 products')).toBeInTheDocument()
  })

  it('shows the finished roadmap without the code layer when motion is reduced', () => {
    const restore = preferReducedMotion()
    const { container } = render(<CodeToRoadmap />)
    expect(container.querySelectorAll('[data-code-line]')).toHaveLength(0)
    expect(screen.getAllByRole('listitem')).toHaveLength(MORPH_ROWS.length)
    restore()
  })
})

describe('Journey', () => {
  it('lists every role newest first with short highlights', () => {
    render(<Journey roles={profile.roles} />)
    const timeline = screen.getByRole('list', { name: 'Experience' })
    const titles = within(timeline).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual(['AI Technical Product Analyst', 'AI Engineer', 'AI Engineer'])
    expect(within(timeline).getByText(/10\+ leadership ideas/)).toBeInTheDocument()
    profile.roles.forEach((r) => {
      expect(r.highlights.length).toBeLessThanOrEqual(3)
      r.highlights.forEach((h) => expect(h.length).toBeLessThanOrEqual(90))
    })
  })

  it('replaces the education card with the engineer-to-product morph', () => {
    const { container } = render(<Journey roles={profile.roles} />)
    expect(container).not.toHaveTextContent(profile.education.degree)
    expect(container.querySelector('[data-code-to-roadmap]')).toBeInTheDocument()
  })
})
