import { render, screen, within } from '@testing-library/react'
import { HowIShip } from '@/components/sections/how-i-ship/HowIShip'
import { IdeaFunnel } from '@/components/sections/how-i-ship/IdeaFunnel'
import { OperatingPrinciples } from '@/components/sections/how-i-ship/OperatingPrinciples'
import { profile } from '@/data/profile'

const funnelProducts = profile.products.filter((p) => p.inFunnel).map((p) => p.shortName)

describe('IdeaFunnel', () => {
  it('draws every pitch, beams the kept ones to products and stops the rest at the gate', () => {
    const { container } = render(<IdeaFunnel ideaCount={10} products={funnelProducts} />)
    expect(container.querySelectorAll('[data-idea]')).toHaveLength(10)
    expect(container.querySelectorAll('[data-idea][data-kept="true"]')).toHaveLength(5)
    expect(container.querySelectorAll('[data-beam]')).toHaveLength(5)
    expect(container.querySelectorAll('[data-stub]')).toHaveLength(5)
    expect(container.querySelectorAll('[data-cross]')).toHaveLength(5)
    expect(screen.getByText('Pitch 01')).toBeInTheDocument()
    expect(screen.getByText('Pitch 10')).toBeInTheDocument()
    funnelProducts.forEach((name) => expect(screen.getByText(name)).toBeInTheDocument())
  })

  it('labels the three stages of the pipeline', () => {
    render(<IdeaFunnel ideaCount={10} products={funnelProducts} />)
    expect(screen.getByText('10+ PITCHES')).toBeInTheDocument()
    expect(screen.getByText('PRIORITISE')).toBeInTheDocument()
    expect(screen.getByText('5 SHIPPED')).toBeInTheDocument()
  })

  it('renders a glowing prism gate, glass pitches and solid shipped tiles', () => {
    const { container } = render(<IdeaFunnel ideaCount={10} products={funnelProducts} />)
    expect(container.querySelectorAll('[data-gate] polygon')).toHaveLength(3)
    expect(container.querySelector('[data-prism-sweep]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-beam-glow]')).toHaveLength(5)
    expect(screen.getAllByText('SHIPPED ✓')).toHaveLength(5)
  })

  it('blurs and fades the rejected pitches in the finished state', () => {
    const { container } = render(<IdeaFunnel ideaCount={10} products={funnelProducts} />)
    const rejected = container.querySelectorAll<SVGGElement>('[data-kept="false"] [data-idea-chip]')
    expect(rejected).toHaveLength(5)
    rejected.forEach((chip) => {
      expect(chip).toHaveAttribute('opacity', '0.32')
      expect(chip.style.filter).toContain('blur')
    })
  })

  it('sends particles along each beam only when live', () => {
    const { container, rerender } = render(<IdeaFunnel ideaCount={10} products={funnelProducts} />)
    expect(container.querySelectorAll('[data-particle]')).toHaveLength(0)
    rerender(<IdeaFunnel ideaCount={10} products={funnelProducts} isLive />)
    expect(container.querySelectorAll('[data-particle]')).toHaveLength(15)
    expect(container.querySelector('[data-particle] mpath')?.getAttribute('href')).toMatch(/^#.+-path-0$/)
  })
})

describe('HowIShip', () => {
  it('shows the ideas-to-products headline and all five steps in order', () => {
    render(<HowIShip steps={profile.process} funnelProducts={funnelProducts} />)
    const region = screen.getByRole('region', { name: 'How I ship' })
    expect(within(region).getByRole('heading', { level: 2 })).toHaveTextContent('10+ ideas in. 5 shipped products out.')
    const steps = within(region).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(steps.map((t) => t?.split(' · ')[0])).toEqual(['Discover', 'Prioritise', 'Define', 'Prove', 'Ship'])
  })

  it('shows every step at full strength until scroll sync takes over', () => {
    render(<HowIShip steps={profile.process} funnelProducts={funnelProducts} />)
    const items = within(screen.getByRole('list', { name: 'My process' })).getAllByRole('listitem')
    items.forEach((li) => expect(li).not.toHaveAttribute('data-state'))
  })
})

describe('OperatingPrinciples', () => {
  it('renders focus, quality and engineering depth with their proof points', () => {
    render(<OperatingPrinciples principles={profile.principles} />)
    expect(screen.getByText('Focus')).toBeInTheDocument()
    expect(screen.getByText('Quality')).toBeInTheDocument()
    expect(screen.getByText('Engineering depth')).toBeInTheDocument()
    expect(screen.getByText('10+ → 5')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})
