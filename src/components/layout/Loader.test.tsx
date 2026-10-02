import { act, render, screen } from '@testing-library/react'
import { Loader } from '@/components/layout/Loader'
import { GREETINGS, LOADER_TIMING, greetingsDurationMs } from '@/lib/loaderSequence'

function preferReducedMotion(): () => void {
  const original = window.matchMedia
  window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes('reduce') })) as typeof window.matchMedia
  return () => {
    window.matchMedia = original
  }
}

async function advance(ms: number): Promise<void> {
  for (let elapsed = 0; elapsed < ms; elapsed += 10) act(() => jest.advanceTimersByTime(Math.min(10, ms - elapsed)))
  await act(async () => {
    await Promise.resolve()
  })
}

describe('Loader', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    document.documentElement.dataset.loading = ''
  })

  afterEach(() => jest.useRealTimers())

  it('greets in every language, welcomes the visitor, then wipes away', async () => {
    render(<Loader firstName="Niranjan" />)
    const loader = screen.getByTestId('loader')
    expect(loader).toHaveAttribute('data-phase', 'greeting')
    expect(screen.getByTestId('loader-greeting')).toHaveTextContent('Hello')
    expect(document.documentElement).toHaveAttribute('data-loading')

    await advance(LOADER_TIMING.firstGreetingMs)
    expect(screen.getByTestId('loader-greeting')).toHaveTextContent(GREETINGS[1].text)
    expect(screen.getByText(GREETINGS[1].text)).toHaveAttribute('lang', 'ta')

    await advance(greetingsDurationMs() - LOADER_TIMING.firstGreetingMs)
    expect(loader).toHaveAttribute('data-phase', 'welcome')
    expect(loader).toHaveTextContent('Welcome to')
    expect(loader).toHaveTextContent('Niranjan’s portfolio')
    expect(document.documentElement).toHaveAttribute('data-loading')

    await advance(LOADER_TIMING.welcomeMs)
    expect(loader).toHaveAttribute('data-phase', 'leaving')
    expect(screen.getByTestId('loader-curve')).toBeInTheDocument()
    expect(document.documentElement).not.toHaveAttribute('data-loading')

    await advance(LOADER_TIMING.exitMs)
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
  })

  it('plays the full greeting again on every load', async () => {
    const first = render(<Loader firstName="Niranjan" />)
    await advance(greetingsDurationMs())
    await advance(LOADER_TIMING.welcomeMs)
    await advance(LOADER_TIMING.exitMs)
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
    first.unmount()

    render(<Loader firstName="Niranjan" />)
    expect(screen.getByTestId('loader')).toHaveAttribute('data-phase', 'greeting')
    expect(screen.getByTestId('loader-greeting')).toHaveTextContent('Hello')
  })

  it('shows no progress bar while greeting', () => {
    render(<Loader firstName="Niranjan" />)
    expect(screen.getByTestId('loader').querySelector('[style*="scaleX"]')).toBeNull()
  })

  it('never shows with reduced motion', async () => {
    const restore = preferReducedMotion()
    render(<Loader firstName="Niranjan" />)
    await advance(0)
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
    expect(document.documentElement).not.toHaveAttribute('data-loading')
    restore()
  })
})
