import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { TwinChat } from '@/components/twin/TwinChat'
import { profile } from '@/data/profile'
import { TWIN_GREETING, TWIN_SUGGESTIONS, TWIN_TEASERS } from '@/data/twin'
import { useTwinChat } from '@/hooks/useTwinChat'

function Harness(): ReactElement {
  const chat = useTwinChat(profile)
  return (
    <>
      <button type="button" onClick={() => chat.open('What awards have you won?')}>
        Ask awards
      </button>
      <TwinChat chat={chat} suggestions={TWIN_SUGGESTIONS} teasers={TWIN_TEASERS} />
    </>
  )
}

function conversation(): HTMLElement {
  return screen.getByRole('list', { name: 'Conversation', hidden: true })
}

function advance(ms: number): void {
  for (let t = 0; t < ms; t += 50) act(() => jest.advanceTimersByTime(50))
}

const originalMatchMedia = window.matchMedia

function preferReducedMotion(): void {
  window.matchMedia = (query: string): MediaQueryList =>
    ({ ...originalMatchMedia(query), matches: query.includes('reduce') }) as MediaQueryList
}

afterEach(() => {
  window.matchMedia = originalMatchMedia
  jest.useRealTimers()
})

describe('TwinChat (reduced motion, instant answers)', () => {
  beforeEach(preferReducedMotion)

  it('opens from the launcher with a greeting and closes with Escape', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const dialog = screen.getByRole('dialog', { name: /Ninja/i, hidden: true })
    expect(dialog).toHaveAttribute('data-state', 'closed')

    const launcher = screen.getByRole('button', { name: 'Chat with Ninja' })
    await user.click(launcher)
    expect(dialog).toHaveAttribute('data-state', 'open')
    expect(launcher).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('twin-answer')).toHaveTextContent(TWIN_GREETING)

    await user.keyboard('{Escape}')
    expect(dialog).toHaveAttribute('data-state', 'closed')
    expect(launcher).toHaveFocus()
  })

  it('answers typed questions and suggestion chips from the resume', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Chat with Ninja' }))

    await user.type(screen.getByRole('textbox', { name: 'Ask a question' }), 'What awards have you won?{Enter}')
    expect(within(conversation()).getByText('What awards have you won?')).toBeInTheDocument()
    expect(screen.getAllByTestId('twin-answer').at(-1)).toHaveTextContent('Best Innovation')
    expect(screen.getByTestId('twin-live')).toHaveTextContent('Best Innovation')

    await user.click(screen.getByRole('button', { name: 'How do I contact him?' }))
    expect(screen.getAllByTestId('twin-answer').at(-1)).toHaveTextContent(profile.contact.email)
  })

  it('opens straight into an answer when asked from elsewhere on the page', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Ask awards' }))
    const answers = screen.getAllByTestId('twin-answer')
    expect(answers).toHaveLength(1)
    expect(answers[0]).toHaveTextContent('Best Innovation')
  })

  it('does not send empty questions', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Chat with Ninja' }))
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })
})

describe('TwinChat (animated)', () => {
  beforeEach(() => jest.useFakeTimers())

  it('thinks, types, then settles, and the status follows along', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Ask awards' }))
    expect(screen.getByTestId('twin-thinking')).toBeInTheDocument()
    expect(screen.getByTestId('twin-status')).toHaveTextContent('Thinking…')

    advance(1000)
    expect(screen.queryByTestId('twin-thinking')).not.toBeInTheDocument()
    expect(screen.getByTestId('twin-status')).toHaveTextContent('Typing…')

    advance(30000)
    expect(screen.getByTestId('twin-status')).toHaveTextContent('Online now')
    expect(screen.getByTestId('twin-answer')).toHaveTextContent('Best Innovation')
  })

  it('shows teasers after a pause, cycles them, and opens with the teased question', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<Harness />)
    expect(screen.queryByTestId('twin-teaser')).not.toBeInTheDocument()

    act(() => jest.advanceTimersByTime(4600))
    expect(screen.getByTestId('twin-teaser')).toHaveTextContent(TWIN_TEASERS[0].label)
    act(() => jest.advanceTimersByTime(8000))
    expect(screen.getByTestId('twin-teaser')).toHaveTextContent(TWIN_TEASERS[1].label)

    await user.click(screen.getByRole('button', { name: TWIN_TEASERS[1].label }))
    expect(screen.queryByTestId('twin-teaser')).not.toBeInTheDocument()
    expect(within(conversation()).getByText(TWIN_TEASERS[1].question)).toBeInTheDocument()
  })

  it('lets visitors dismiss the teaser', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<Harness />)
    act(() => jest.advanceTimersByTime(4600))
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByTestId('twin-teaser')).not.toBeInTheDocument()
  })
})
