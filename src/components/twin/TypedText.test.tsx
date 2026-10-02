import { act, render, screen } from '@testing-library/react'
import { TypedText } from '@/components/twin/TypedText'

function advance(ms: number): void {
  for (let t = 0; t < ms; t += 20) act(() => jest.advanceTimersByTime(20))
}

describe('TypedText', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('shows the full text straight away when not typing', () => {
    render(<TypedText text="Hello there." isTyping={false} onDone={jest.fn()} />)
    expect(screen.getByText('Hello there.')).toBeInTheDocument()
  })

  it('types the text out, then reports done', () => {
    const onDone = jest.fn()
    const onProgress = jest.fn()
    const { container } = render(<TypedText text="Hi, I build AI." isTyping onDone={onDone} onProgress={onProgress} />)
    expect(container.textContent).toBe('')
    advance(40)
    expect(container.textContent?.length).toBeGreaterThan(0)
    expect(container.textContent?.length).toBeLessThan(15)
    advance(2000)
    expect(container.textContent).toBe('Hi, I build AI.')
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(onProgress).toHaveBeenCalled()
  })
})
