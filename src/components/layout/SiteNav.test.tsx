import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNav } from '@/components/layout/SiteNav'

const links = [
  { label: 'Products', href: '#products' },
  { label: 'Journey', href: '#journey' },
]

describe('SiteNav', () => {
  beforeEach(() => document.documentElement.classList.remove('dark'))

  it('renders the brand, section links and contact CTA', () => {
    render(<SiteNav brand="Niranjan" links={links} />)
    expect(screen.getByRole('link', { name: 'Niranjan' })).toHaveAttribute('href', '#top')
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '#products')
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '#contact')
  })

  it('switches theme from the toggle', async () => {
    render(<SiteNav brand="Niranjan" links={links} />)
    await userEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }))
    expect(document.documentElement).toHaveClass('dark')
    expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument()
  })
})

describe('SiteFooter', () => {
  it('credits the owner', () => {
    render(<SiteFooter name="Niranjan Sivakumar" wordmark="Niranjan" />)
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Niranjan Sivakumar')
  })
})
