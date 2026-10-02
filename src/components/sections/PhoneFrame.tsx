import type { ReactElement, ReactNode } from 'react'

interface PhoneFrameProps {
  children: ReactNode
}

const BUTTON = 'absolute w-[4px] rounded-[2px] bg-[linear-gradient(90deg,#1c1e26,#5b5e6b_45%,#2a2c35)]'

export function PhoneFrame({ children }: PhoneFrameProps): ReactElement {
  return (
    <div data-phone className="relative [transform:perspective(1400px)_rotateY(-10deg)_rotateX(4deg)]">
      <span data-phone-button className={`${BUTTON} top-[17%] -left-[3px] h-[5%]`} />
      <span data-phone-button className={`${BUTTON} top-[25%] -left-[3px] h-[9%]`} />
      <span data-phone-button className={`${BUTTON} top-[36%] -left-[3px] h-[9%]`} />
      <span data-phone-button className={`${BUTTON} top-[28%] -right-[3px] h-[14%]`} />
      <div className="relative rounded-[54px] bg-[linear-gradient(145deg,#6a6d7a,#2a2c35_30%,#474a56_55%,#1d1e25_80%,#5a5d6a)] p-[3px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.3),0_0_0_1px_rgba(0,0,0,.55),0_50px_100px_-30px_rgba(90,72,245,.55),0_30px_60px_-30px_rgba(0,0,0,.7)]">
        <div className="rounded-[51px] bg-black p-[8px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]">
          <div
            data-phone-screen
            className="relative aspect-[9/19.5] overflow-hidden rounded-[43px] bg-black [clip-path:inset(0_round_43px)] [transform:translateZ(0)]"
          >
            {children}
            <span
              data-phone-island
              aria-hidden
              className="pointer-events-none absolute top-[9px] left-1/2 z-10 flex h-[26px] w-[32%] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[9px]"
            >
              <i className="size-[9px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#3d4a8a,#0b0f24_60%)] ring-1 ring-white/10" />
            </span>
            <span
              data-phone-glare
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(115deg,rgba(255,255,255,.2)_0%,rgba(255,255,255,.05)_28%,transparent_42%)]"
            />
          </div>
        </div>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 h-8 w-[80%] -translate-x-1/2 rounded-[50%] bg-black/45 blur-xl"
      />
    </div>
  )
}
