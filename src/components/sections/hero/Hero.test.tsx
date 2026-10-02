import { act, render, screen } from '@testing-library/react'
import { Hero } from '@/components/sections/hero/Hero'
import { HeroHotspot } from '@/components/sections/hero/HeroHotspot'
import { HeroStage } from '@/components/sections/hero/HeroStage'
import { profile } from '@/data/profile'
import type { FrameExtractor } from '@/lib/hero/extractFrames'

describe('Hero', () => {
  it('exposes the full name as the h1 accessible name and the pitch', () => {
    render(<Hero content={profile.hero} videoSrc="/media/hero-3d.mp4" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Niranjan Sivakumar' })).toBeInTheDocument()
    expect(screen.getByText(/turn ambiguous AI ideas into products that ship/i)).toBeInTheDocument()
  })

  it('cycles through the role titles', () => {
    jest.useFakeTimers()
    render(<Hero content={profile.hero} videoSrc="/media/hero-3d.mp4" />)
    expect(screen.getByText(profile.hero.roles[0])).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(2800))
    expect(screen.getByText(profile.hero.roles[1])).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('links the CTAs to the products and intro sections', () => {
    render(<Hero content={profile.hero} videoSrc="/media/hero-3d.mp4" />)
    expect(screen.getByRole('link', { name: 'See the products' })).toHaveAttribute('href', '#products')
    expect(screen.getByRole('link', { name: /watch my intro/i })).toHaveAttribute('href', '#intro')
  })

  it('renders the 3D stage with every hotspot hidden until scrolled', () => {
    render(<Hero content={profile.hero} videoSrc="/media/hero-3d.mp4" />)
    expect(screen.getByRole('img', { name: /3D sculpture of Niranjan/ })).toBeInTheDocument()
    expect(screen.getByTestId('hero-canvas')).toBeInTheDocument()
    profile.hero.hotspots.forEach((h) =>
      expect(screen.getByTestId(`hotspot-${h.id}`)).toHaveAttribute('data-active', 'false'),
    )
  })
})

describe('HeroStage', () => {
  const progressRef = { current: 0 }

  it('shows a loading status until the first frame arrives', () => {
    const extract: FrameExtractor = () => new Promise(() => {})
    render(<HeroStage src="/v.mp4" progressRef={progressRef} reducedMotion={false} extract={extract} />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading 3D')
  })

  it('falls back to a plain looping video when frames cannot be extracted', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const extract: FrameExtractor = async () => {
      throw new Error('no codec')
    }
    const { container } = render(<HeroStage src="/v.mp4" progressRef={progressRef} reducedMotion={false} extract={extract} />)
    await screen.findByText((_, el) => el?.getAttribute('data-status') === 'error')
    const video = container.querySelector('video')
    expect(video).toHaveAttribute('src', '/v.mp4')
    expect(video?.muted).toBe(true)
    spy.mockRestore()
  })
})

describe('HeroHotspot', () => {
  const [right, left] = profile.hero.hotspots

  it('anchors right-side hotspots from the left edge', () => {
    render(<HeroHotspot hotspot={right} />)
    expect(screen.getByTestId(`hotspot-${right.id}`)).toHaveStyle({ left: `${right.x}%` })
  })

  it('anchors left-side hotspots from the right edge', () => {
    render(<HeroHotspot hotspot={left} />)
    expect(screen.getByTestId(`hotspot-${left.id}`)).toHaveStyle({ right: `${100 - left.x}%` })
  })

  it('numbers the hotspot and hides it from assistive tech when inactive', () => {
    render(<HeroHotspot hotspot={right} index={1} isActive={false} />)
    const el = screen.getByTestId(`hotspot-${right.id}`)
    expect(el).toHaveAttribute('data-active', 'false')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).toHaveTextContent('02')
  })
})
