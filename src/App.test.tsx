import { render, screen } from '@testing-library/react'
import { App } from '@/App'

describe('App', () => {
  it('renders the portfolio owner name as the only h1', () => {
    render(<App />)
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent('Niranjan Sivakumar')
  })

  it('has a target section for every nav link', () => {
    const { container } = render(<App />)
    const hrefs = Array.from(container.querySelectorAll('nav a[href^="#"]')).map((a) => a.getAttribute('href'))
    hrefs.forEach((href) => expect(container.querySelector(href as string)).not.toBeNull())
  })

  it('tells the story in product-page order', () => {
    const { container } = render(<App />)
    const order = Array.from(container.querySelectorAll('main > [id]')).map((el) => el.id)
    expect(order).toEqual([
      'top',
      'impact',
      'how-i-ship',
      'principles',
      'products',
      'journey',
      'awards',
      'intro',
      'beyond',
      'contact',
    ])
  })
})
