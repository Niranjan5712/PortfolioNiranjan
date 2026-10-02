import { render, screen, within } from '@testing-library/react'
import { FilmStrip } from '@/components/sections/products/FilmStrip'
import { ProductCard } from '@/components/sections/products/ProductCard'
import { ProductLine } from '@/components/sections/products/ProductLine'
import { ProjectorBeam } from '@/components/sections/products/ProjectorBeam'
import { profile } from '@/data/profile'
import { FILM } from '@/lib/filmRoll'

const talkToDb = profile.products[0]

describe('ProductCard', () => {
  it('tells the problem, solution and impact story', () => {
    render(<ProductCard product={talkToDb} index={0} />)
    const card = screen.getByRole('article', { name: talkToDb.name })
    expect(within(card).getByText('Problem')).toBeInTheDocument()
    expect(within(card).getByText(talkToDb.problem)).toBeInTheDocument()
    expect(within(card).getByText('Solution')).toBeInTheDocument()
    expect(within(card).getByText(talkToDb.solution)).toBeInTheDocument()
    expect(within(card).getByText('Impact')).toBeInTheDocument()
    expect(within(card).getByText(talkToDb.result.value)).toBeInTheDocument()
  })

  it('shows client, delivery status, position and capability tags', () => {
    render(<ProductCard product={talkToDb} index={0} />)
    expect(screen.getByText(`${talkToDb.client} · ${talkToDb.sector}`)).toBeInTheDocument()
    expect(screen.getByText(talkToDb.status)).toBeInTheDocument()
    expect(screen.getByText('01 / Product')).toBeInTheDocument()
    const tags = within(screen.getByRole('list', { name: 'Capabilities' })).getAllByRole('listitem')
    expect(tags).toHaveLength(talkToDb.tags.length)
  })
})

describe('FilmStrip', () => {
  it('repeats one frame per product so the strip can loop, hidden from screen readers', () => {
    const { container } = render(<FilmStrip products={profile.products} />)
    const strip = container.querySelector('[data-film-strip]')
    expect(strip).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelectorAll('[data-film-frame]')).toHaveLength(profile.products.length * FILM.copies)
    expect(container.querySelectorAll('[data-film-frame="0"] [data-film-thumb]')).toHaveLength(FILM.copies)
    expect(container.querySelectorAll('[data-film-flash]')).toHaveLength(profile.products.length * FILM.copies)
  })
})

describe('ProjectorBeam', () => {
  it('fills the beam with dust motes', () => {
    const { container } = render(<ProjectorBeam />)
    expect(container.querySelector('[data-projector]')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelectorAll('[data-dust]')).toHaveLength(FILM.dustCount)
  })
})

describe('ProductLine', () => {
  it('renders every product card under a count-based headline', () => {
    render(<ProductLine products={profile.products} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('8 AI products. Every one shipped.')
    expect(screen.getAllByRole('article')).toHaveLength(8)
  })

  it('sets the posters in a cinema with a film strip, projector and frame counter', () => {
    const { container } = render(<ProductLine products={profile.products} />)
    expect(container.querySelector('[data-film-strip]')).toBeInTheDocument()
    expect(container.querySelector('[data-projector]')).toBeInTheDocument()
    expect(screen.getByText('Frame')).toBeInTheDocument()
  })
})
