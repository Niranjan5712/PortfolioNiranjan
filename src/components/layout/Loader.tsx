import { useEffect, useState, type ReactElement } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { GREETINGS, LOADER_TIMING, greetingDelay } from '@/lib/loaderSequence'

interface LoaderProps {
  firstName: string
}

const LOADER_PHASES = {
  greeting: 'greeting',
  welcome: 'welcome',
  leaving: 'leaving',
  done: 'done',
} as const

type LoaderPhase = (typeof LOADER_PHASES)[keyof typeof LOADER_PHASES]

const PANEL = 'bg-[#0B0E22]'
const WIPE_EASE = 'ease-[cubic-bezier(.76,0,.24,1)]'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

interface WelcomeProps {
  firstName: string
}

function Welcome({ firstName }: WelcomeProps): ReactElement {
  return (
    <div className="grid animate-welcome justify-items-center gap-1 text-center">
      <p className="m-0 text-[clamp(15px,1.6vw,20px)] font-medium tracking-[0.2em] text-white/60 uppercase">
        Welcome to
      </p>
      <p className="m-0 bg-[linear-gradient(100deg,#fff_25%,#b8b2ff_60%,#5fe3d0)] bg-clip-text pb-[0.08em] text-[clamp(32px,7vw,96px)] leading-[1.02] font-bold tracking-[-0.045em] text-transparent">
        {firstName}’s portfolio
      </p>
    </div>
  )
}

export function Loader({ firstName }: LoaderProps): ReactElement | null {
  const reducedMotion = usePrefersReducedMotion()
  const [phase, setPhase] = useState<LoaderPhase>(() => (reducedMotion ? LOADER_PHASES.done : LOADER_PHASES.greeting))
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (phase !== LOADER_PHASES.greeting) return
    const isLast = index >= GREETINGS.length - 1
    const t = window.setTimeout(
      () => (isLast ? setPhase(LOADER_PHASES.welcome) : setIndex((i) => i + 1)),
      greetingDelay(index),
    )
    return () => window.clearTimeout(t)
  }, [phase, index])

  useEffect(() => {
    if (phase !== LOADER_PHASES.welcome) return
    let isCancelled = false
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    Promise.race([
      Promise.all([fontsReady, wait(LOADER_TIMING.welcomeMs)]),
      wait(LOADER_TIMING.welcomeMs + LOADER_TIMING.maxFontWaitMs),
    ]).then(() => {
      if (!isCancelled) setPhase(LOADER_PHASES.leaving)
    })
    return () => {
      isCancelled = true
    }
  }, [phase])

  useEffect(() => {
    if (phase !== LOADER_PHASES.leaving && phase !== LOADER_PHASES.done) return
    delete document.documentElement.dataset.loading
    if (phase !== LOADER_PHASES.leaving) return
    const t = window.setTimeout(() => setPhase(LOADER_PHASES.done), LOADER_TIMING.exitMs)
    return () => window.clearTimeout(t)
  }, [phase])

  if (phase === LOADER_PHASES.done) return null

  const greeting = GREETINGS[index]

  return (
    <div
      aria-hidden
      data-testid="loader"
      data-phase={phase}
      className="group fixed inset-0 z-[100] text-white data-[phase=leaving]:pointer-events-none"
    >
      <div
        className={`absolute inset-0 ${PANEL} transition-transform duration-[1000ms] ${WIPE_EASE} group-data-[phase=leaving]:-translate-y-full`}
      >
        <div
          data-testid="loader-curve"
          className={`absolute top-[calc(100%-1px)] right-[-10%] left-[-10%] h-[16vh] rounded-b-[50%] ${PANEL} transition-[height] duration-[1000ms] ${WIPE_EASE} group-data-[phase=leaving]:h-0`}
        />

        <div className="absolute inset-0 grid place-items-center px-6 transition duration-700 ease-[cubic-bezier(.65,0,.35,1)] group-data-[phase=leaving]:-translate-y-[12vh] group-data-[phase=leaving]:opacity-0">
          {phase === LOADER_PHASES.greeting ? (
            <p
              key={index}
              data-testid="loader-greeting"
              className={`m-0 flex items-center gap-[0.35em] text-[clamp(40px,6.5vw,84px)] leading-none font-semibold tracking-[-0.03em] ${
                index === 0 ? 'animate-greet' : 'animate-greet-swap'
              }`}
            >
              <span className="size-[0.16em] flex-none rounded-full bg-[linear-gradient(135deg,var(--iris),var(--lagoon))]" />
              <span lang={greeting.lang} dir={greeting.dir}>
                {greeting.text}
              </span>
            </p>
          ) : (
            <Welcome firstName={firstName} />
          )}
        </div>
      </div>
    </div>
  )
}
