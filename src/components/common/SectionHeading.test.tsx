import { act, render, screen } from '@testing-library/react'
import { Section } from '@/components/common/Section'
import { SectionHeading } from '@/components/common/SectionHeading'
import { setIntersecting } from '@/test/intersectionObserver'

describe('SectionHeading', () => {
  it('renders eyebrow, title as h2 and description', () => {
    render(<SectionHeading eyebrow="Proof" title="Results" description="Numbers that matter" />)
    expect(screen.getByText('Proof')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Results' })).toBeInTheDocument()
    expect(screen.getByText('Numbers that matter')).toBeInTheDocument()
  })

  it('splits the title into words but keeps the readable heading name', () => {
    render(<SectionHeading title="Results, not roadmaps." />)
    expect(screen.getByRole('heading', { level: 2, name: 'Results, not roadmaps.' })).toBeInTheDocument()
    expect(screen.getByText('roadmaps.')).toBeInTheDocument()
  })

  it('reveals once it scrolls into view', () => {
    const { container } = render(<SectionHeading title="Results" />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveAttribute('data-revealed', 'false')
    act(() => setIntersecting(wrapper, true))
    expect(wrapper).toHaveAttribute('data-revealed', 'true')
  })

  it('omits optional parts when not provided', () => {
    const { container } = render(<SectionHeading title="Only title" />)
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })
})

describe('Section', () => {
  it('renders a section landmark with the given id', () => {
    render(
      <Section id="impact" ariaLabel="Impact">
        <p>content</p>
      </Section>,
    )
    const region = screen.getByRole('region', { name: 'Impact' })
    expect(region).toHaveAttribute('id', 'impact')
  })
})
