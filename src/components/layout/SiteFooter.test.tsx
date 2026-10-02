import { act, render, screen } from '@testing-library/react'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { setIntersecting } from '@/test/intersectionObserver'

describe('SiteFooter', () => {
  it('credits the owner in plain text', () => {
    render(<SiteFooter name="Niranjan Shiva" wordmark="Niranjan" />)
    expect(screen.getByText(/Designed and shipped like a product by Niranjan Shiva/)).toBeInTheDocument()
  })

  it('spells a decorative giant wordmark one letter at a time, hidden from screen readers', () => {
    const { container } = render(<SiteFooter name="Niranjan Shiva" wordmark="Niranjan" />)
    const wordmark = container.querySelector('[data-wordmark]') as HTMLElement
    expect(wordmark).toHaveAttribute('aria-hidden', 'true')
    expect(wordmark.querySelectorAll('[data-wordmark-letter]')).toHaveLength(8)
    expect(wordmark.textContent).toBe('Niranjan')
  })

  it('rises the letters in once the footer scrolls into view', () => {
    const { container } = render(<SiteFooter name="Niranjan Shiva" wordmark="Niranjan" />)
    const wordmark = container.querySelector('[data-wordmark]') as HTMLElement
    expect(wordmark).toHaveAttribute('data-risen', 'false')
    act(() => setIntersecting(wordmark, true))
    expect(wordmark).toHaveAttribute('data-risen', 'true')
  })

  it('glitches the risen wordmark with red and cyan split layers and a neon flicker', () => {
    const { container } = render(<SiteFooter name="Niranjan Shiva" wordmark="Niranjan" />)
    const wordmark = container.querySelector('[data-wordmark]') as HTMLElement
    expect(container.querySelectorAll('[data-glitch-layer]')).toHaveLength(0)
    expect(wordmark.className).not.toContain('animate-neon-flicker')

    act(() => setIntersecting(wordmark, true))

    const layers = [...container.querySelectorAll('[data-glitch-layer]')]
    expect(layers.map((l) => l.getAttribute('data-glitch-layer'))).toEqual(['red', 'cyan'])
    layers.forEach((layer) => {
      expect(layer).toHaveAttribute('aria-hidden', 'true')
      expect(layer.textContent).toBe('Niranjan')
      expect(layer.className).toContain('motion-reduce:hidden')
    })
    expect(wordmark.className).toContain('animate-neon-flicker')
    expect(wordmark.className).toContain('motion-reduce:animate-none')
    expect(wordmark.textContent).toBe('Niranjan')
  })
})
