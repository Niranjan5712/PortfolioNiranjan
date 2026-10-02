import { render, screen } from '@testing-library/react'
import { BotFace } from '@/components/common/BotFace'

describe('BotFace', () => {
  it('smiles when idle', () => {
    const { container } = render(<BotFace />)
    expect(screen.getByTestId('bot-face')).toHaveAttribute('data-mood', 'idle')
    expect(container.querySelector('[data-part="mouth"]')).toBeInTheDocument()
  })

  it('moves its mouth while talking', () => {
    const { container } = render(<BotFace mood="talking" />)
    expect(container.querySelector('[data-part="mouth-talking"]')).toBeInTheDocument()
    expect(container.querySelector('[data-part="mouth"]')).not.toBeInTheDocument()
  })

  it('looks up and away while thinking', () => {
    const { container } = render(<BotFace mood="thinking" />)
    expect(container.querySelector<SVGGElement>('[data-part="pupils"]')?.style.transform).toContain('-2.4px')
  })
})
