import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntroVideo } from '@/components/sections/IntroVideo'
import { setIntersecting } from '@/test/intersectionObserver'

const LABEL = 'Niranjan’s intro video'

function renderIntro(): HTMLVideoElement {
  render(<IntroVideo src="/media/intro.mp4" label={LABEL} duration="1 min 20 sec" />)
  return screen.getByLabelText(LABEL) as HTMLVideoElement
}

describe('IntroVideo', () => {
  let play: jest.SpyInstance
  let pause: jest.SpyInstance

  beforeEach(() => {
    play = jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    pause = jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it('starts as a muted, looping preview without controls', () => {
    const video = renderIntro()
    expect(video.getAttribute('src')).toBe('/media/intro.mp4#t=2')
    expect(video.muted).toBe(true)
    expect(video.loop).toBe(true)
    expect(video).not.toHaveAttribute('controls')
    expect(screen.getByRole('button', { name: 'Play intro with sound' })).toBeInTheDocument()
    expect(screen.getAllByText(/1 min 20 sec/).length).toBeGreaterThan(0)
  })

  it('shows the video inside a realistic phone without a visible title', () => {
    const { container } = render(<IntroVideo src="/media/intro.mp4" label={LABEL} duration="1 min 20 sec" />)
    const phone = container.querySelector('[data-phone]')
    expect(phone).toContainElement(container.querySelector('video'))
    expect(container.querySelector('[data-phone-island]')).toBeInTheDocument()
    expect(container.querySelector('[data-phone-glare]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-phone-button]')).toHaveLength(4)
    expect(container.querySelector('figcaption')).not.toBeInTheDocument()
    expect(screen.queryByText(LABEL)).not.toBeInTheDocument()
  })

  it('plays the preview only while it is on screen', () => {
    const video = renderIntro()
    act(() => setIntersecting(video, true))
    expect(play).toHaveBeenCalledTimes(1)
    act(() => setIntersecting(video, false))
    expect(pause).toHaveBeenCalledTimes(1)
  })

  it('restarts with sound and native controls when the play button is pressed', async () => {
    const video = renderIntro()
    video.currentTime = 30
    await userEvent.click(screen.getByRole('button', { name: 'Play intro with sound' }))
    expect(video.muted).toBe(false)
    expect(video.loop).toBe(false)
    expect(video.currentTime).toBe(0)
    expect(video).toHaveAttribute('controls')
    expect(play).toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Play intro with sound' })).not.toBeInTheDocument()
  })

  it('does not restart the muted preview over a video playing with sound', async () => {
    const video = renderIntro()
    await userEvent.click(screen.getByRole('button', { name: 'Play intro with sound' }))
    play.mockClear()
    act(() => setIntersecting(video, true))
    expect(play).not.toHaveBeenCalled()
  })

  it('returns to the muted preview when the video ends', async () => {
    const video = renderIntro()
    await userEvent.click(screen.getByRole('button', { name: 'Play intro with sound' }))
    fireEvent.ended(video)
    expect(video.muted).toBe(true)
    expect(video.loop).toBe(true)
    expect(video).not.toHaveAttribute('controls')
    expect(screen.getByRole('button', { name: 'Play intro with sound' })).toBeInTheDocument()
  })

  it('never autoplays the preview when reduced motion is preferred', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({ ...original(query), matches: query.includes('reduce') })) as typeof window.matchMedia
    const video = renderIntro()
    act(() => setIntersecting(video, true))
    expect(play).not.toHaveBeenCalled()
    window.matchMedia = original
  })
})
