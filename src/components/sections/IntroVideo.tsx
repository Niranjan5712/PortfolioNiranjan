import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Clock, Play } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { PhoneFrame } from '@/components/sections/PhoneFrame'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { gsap, useGSAP } from '@/lib/gsap'

interface IntroVideoProps {
  src: string
  label: string
  duration: string
}

const INTRO_MODES = {
  preview: 'preview',
  playing: 'playing',
} as const

type IntroMode = (typeof INTRO_MODES)[keyof typeof INTRO_MODES]

const POSTER_TIME = 2

function sideInset(viewportWidth: number): number {
  return viewportWidth < 821 ? 12 : Math.round(Math.min(viewportWidth * 0.07, 140))
}

export function IntroVideo({ src, label, duration }: IntroVideoProps): ReactElement {
  const reducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mode, setMode] = useState<IntroMode>(INTRO_MODES.preview)
  const isPlaying = mode === INTRO_MODES.playing

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause()
          return
        }
        if (!isPlaying && !reducedMotion) video.play().catch(() => {})
      },
      { threshold: 0.35 },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [isPlaying, reducedMotion])

  useGSAP(
    () => {
      if (reducedMotion) return
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'top 15%',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          '[data-intro-card]',
          { clipPath: () => `inset(0px ${sideInset(window.innerWidth)}px round 48px)` },
          { clipPath: 'inset(0px 0px round 0px)' },
          0,
        )
        .fromTo(
          '[data-intro-phone]',
          { y: 90, scale: 0.86, rotationY: -24, rotationX: 10, rotationZ: -6, transformPerspective: 1400 },
          { y: 0, scale: 1, rotationY: 0, rotationX: 0, rotationZ: 0, transformPerspective: 1400 },
          0,
        )
        .fromTo('[data-intro-copy]', { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, 0.1)
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  )

  function playWithSound(): void {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video.loop = false
    video.currentTime = 0
    setMode(INTRO_MODES.playing)
    video.play().catch((error: unknown) => console.error('Intro video failed to play', error))
  }

  function backToPreview(): void {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.loop = true
    video.currentTime = POSTER_TIME
    setMode(INTRO_MODES.preview)
  }

  return (
    <section id="intro" ref={rootRef} aria-label="Intro video" className="relative">
      <div
        data-intro-card
        className="dark relative overflow-hidden bg-background py-[clamp(56px,8vw,120px)] text-foreground [clip-path:inset(0px_0px_round_0px)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_15%_20%,color-mix(in_srgb,var(--iris)_28%,transparent),transparent_70%),radial-gradient(50%_50%_at_90%_85%,color-mix(in_srgb,var(--lagoon)_22%,transparent),transparent_70%)]"
        />
        <div className="relative mx-auto grid w-[min(1160px,100%-40px)] items-center gap-[clamp(32px,5vw,72px)] md:grid-cols-[1.1fr_.9fr]">
          <div data-intro-copy>
            <SectionHeading
              eyebrow="Meet me"
              className="mb-8"
              title="The person behind the products."
              description="Who I am, how I think about AI products, and why I work best between the code and the C-suite."
            />
            <p className="m-0 inline-flex items-center gap-2 text-[15px] text-ink-soft">
              <Clock className="size-4" aria-hidden />
              {duration}
            </p>
          </div>
          <figure data-intro-phone className="m-0 w-[min(290px,68vw,calc((100svh-200px)*9/19.5))] min-w-[220px] justify-self-center">
            <PhoneFrame>
              <div data-mode={mode} className="group absolute inset-0">
                <video
                  ref={videoRef}
                  className="size-full object-cover"
                  src={`${src}#t=${POSTER_TIME}`}
                  aria-label={label}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  controls={isPlaying}
                  onEnded={backToPreview}
                />
                {!isPlaying && (
                  <>
                    <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
                    <button
                      type="button"
                      onClick={playWithSound}
                      aria-label="Play intro with sound"
                      className="absolute inset-0 grid cursor-pointer place-items-center outline-none"
                    >
                      <span className="relative grid size-22 place-items-center rounded-full border border-white/40 bg-white/15 shadow-[0_20px_60px_-10px_rgba(0,0,0,.6)] backdrop-blur-xl transition-transform duration-500 ease-out-expo group-hover:scale-110 group-has-focus-visible:scale-110">
                        <span aria-hidden className="absolute inset-0 animate-ping-sun rounded-full border border-white/50 motion-reduce:animate-none" />
                        <Play className="ml-1 size-8 fill-white text-white" aria-hidden />
                      </span>
                      <span className="absolute inset-x-0 bottom-9 text-center text-sm font-semibold tracking-wide text-white">
                        Play with sound · {duration}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </PhoneFrame>
          </figure>
        </div>
      </div>
    </section>
  )
}
