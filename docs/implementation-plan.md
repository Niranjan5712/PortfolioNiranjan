# Portfolio React Rebuild — Implementation Plan

Grounding doc for continuity across agent sessions. Update the status of each phase as work lands.

## Goal

Rebuild `../Niranjan Sivakumar — AI Product Manager.html` as a React app with product-page-grade animations:

- Hero: `public/media/hero-3d.mp4` (3D figure) is scroll-scrubbed frame-by-frame on a canvas while the hero is pinned (Apple-style), then scales/slides aside. Hotspot cards appear at set scroll points. Drag + arrow-key rotation retained.
- Intro: `public/media/intro.mp4` in "Meet me in two minutes"; card expands to full-bleed on scroll, muted preview loop, click to play with sound.

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8, React 19, TypeScript 6 |
| Styling | Tailwind CSS v4, shadcn/ui (radix-nova preset) |
| Animation | GSAP + ScrollTrigger (`@gsap/react`), Lenis smooth scroll |
| Unit tests | Jest 30 + `@swc/jest` + React Testing Library |
| E2E tests | Playwright (Desktop Chrome + Pixel 7) |

shadcn installation commands used:

- `npx shadcn@latest init -t vite -b radix -p nova -y --no-monorepo --no-rtl`

## Design tokens

Defined in `src/index.css`. Brand colours available as Tailwind utilities: `iris`, `lagoon`, `sun`, `rose`, `iris-soft`, `ink`, `ink-soft`, `surface`, `line`. Dark mode via `.dark` on `<html>` (set pre-render in `index.html` from `localStorage.theme` or `prefers-color-scheme`).

## Phases

| # | Phase | Status |
| --- | --- | --- |
| 1 | Scaffold: Vite, Tailwind, shadcn, Jest, Playwright, tokens, media | [COMPLETE] |
| 2 | Port content: `src/data/profile.ts` + static section components + unit tests | [COMPLETE] |
| 3 | 3D hero: frame extraction engine, scroll pin/scrub, hotspots, drag, tests | [COMPLETE] |
| 4 | Intro video: scroll-expand, preview loop, player, tests | [COMPLETE] |
| 5a | Motion: Lenis smooth scroll, word-reveal headings, counters, nav scroll progress, timeline fill, funnel animation | [COMPLETE] |
| 5b | Motion: loader, product line horizontal pin, magnetic buttons, card tilt + "How I ship" pipeline redesign | [COMPLETE] |
| 6 | AI twin chatbot port + tests | [COMPLETE] |
| 7 | E2E suite for critical flows + final QA (reduced motion, mobile, dark mode) | Pending |

### Refresh round (approved 8-step plan, one checkpoint per step)

| # | Step | Status |
| --- | --- | --- |
| R1 | Content pass: AI PM skills, 1-line process steps, 3 clear principles, product copy, short journey (no CGPA), Ask section removed, chatbot renamed Ninja (third person, ≤4 lines) | [COMPLETE] |
| R2 | Multilingual greeting loader + "Welcome to Niranjan's portfolio" curved wipe (now plays on every load, see R10) | [COMPLETE] |
| R3 | "How I ship" pipeline redesign: glass pitch cards, prism gate, particle beams, shipped tiles | [COMPLETE] |
| R4 | Product line film roll: 35mm strip, projector beam, dust, frame counter | [COMPLETE] |
| R5 | Intro video inside a realistic phone, title removed | [COMPLETE] |
| R6 | "Beyond the roadmap" concert stage: spotlights, confetti, floating chips | [COMPLETE] |
| R7 | Giant NIRANJAN wordmark in the footer (Amplitude style) | [COMPLETE] |
| R8 | Phase 7 QA: full test pass (tsc, lint, build, Jest, full e2e on desktop + mobile) and layout fixes | [COMPLETE] |

### Refresh round 2 (approved, one checkpoint per step)

| # | Step | Status |
| --- | --- | --- |
| R9 | Ninja speaks like a person: friendly prose answers, no labelled fields or bullets; per-product `twinSummary` | [COMPLETE] |
| R10 | Loader plays the full greeting on every load/reload; no bottom progress bar; slower greetings | [COMPLETE] |
| R11 | Journey: education card removed (Ninja still answers it), replaced by a scroll-linked "engineer → PM" code-to-roadmap morph | [COMPLETE] |
| R12 | Awards fly-by: scroll-scrubbed jet with a contrail that dissipates to reveal the cards, plus a border beam | [COMPLETE] |
| R13 | Interest tiles: Reading (turning pages), Podcasts (equaliser), Hiking (drawn trail + climber) | [COMPLETE] |
| R14 | Wordmark glitch: RGB split, slice shifts, neon flicker; off with reduced motion | [COMPLETE] |

#### R9 notes

- `Product.twinSummary` holds a hand-written, resume-faithful summary (≤320 characters, keeping the "designed to / target / estimated" hedges). Ninja returns it for any product question.
- `answerEngine.ts` builds every other answer as sentences: `listText()` gives "a, b and c", `casual()` lowercases skill names but keeps acronyms, and roles, awards, defence, PR and metrics are composed from profile data.
- Tests forbid `Label:` lines and `•` bullets, require answers to end in punctuation, and check that each product returns its summary.

#### R11 notes

- `journey/CodeToRoadmap.tsx` replaces `EducationCard` (deleted). Education stays in `profile.education` for Ninja.
- It is a dark editor card with an `engineer.py` → `roadmap.md` file name and an "AI engineer ── AI product" track (`data-morph-fill`). It has 3 rows (`data-morph-row`), each stacking a syntax-coloured code line (`data-code-line`) over a roadmap card (`data-roadmap-card`): Discover / Prioritise ("10+ ideas narrowed to 5 products") / Ship ("8 AI products delivered").
- One scrubbed GSAP timeline types the code (clip-path with `steps`) and then morphs each row: the code blurs out and the card rises in. On desktop it is synced to the experience timeline: it finds `[data-journey-timeline]` in the same section, from `top 70%` to `bottom 85%`. It looks the element up in the DOM because the timeline's React ref isn't attached yet when the child's layout effect runs. On mobile it scrubs over the card itself.
- With reduced motion, the code layer isn't rendered and the finished roadmap shows.
- Tests: `Journey.test.tsx`, plus the e2e case in `e2e/motion.spec.ts`. Visual QA: `node scripts/journey-shots.mjs <url> <outDir> <light|dark> <width>` logs each card's opacity per frame.

#### R12 notes

- `Awards.tsx` wraps the cards in `[data-airspace]` with a decorative `[data-flyby]` overlay (aria-hidden, not rendered with reduced motion). The overlay holds an SVG jet with a pulsing afterburner (`data-jet`, `animate-afterburner`) and the smoke: a continuous soft band (`data-smoke-band`) plus 26 puffs from `src/lib/contrail.ts` (`contrailPuffs()`, 13 columns × 2 rows, deterministic, ordered by x, covering the full height).
- On md+ the smoke has an SVG `feTurbulence` + `feDisplacementMap` filter for wispy edges. It's applied through the `--smoke-filter` variable, and left off on phones for performance.
- There's one scroll-scrubbed timeline on the airspace (`top 80%` → `bottom 40%`):
  1. The jet crosses (xPercent −15 → 118) while the band stretches behind it (`scaleX` from the left) and each puff swells in as the jet passes its x.
  2. The jet fades out.
  3. The smoke clears: the band lifts and fades, the puffs drift up and outward and fade (staggered), and the displacement scale rises from 18 to 70.
  4. Each card goes from opacity 0.12 / blur 10px / scale 0.97 to sharp.

  Scrolling back replays it.
- Border beam (Magic UI style): every card has `[data-border-beam]`, a 2px ring cut out with a `mask` shorthand that carries `exclude` (a Tailwind `mask` shorthand would reset `mask-composite`). It contains a rotating conic gradient (`animate-beam-spin`) and fades in when `data-beam="on"`, which is set once scroll progress reaches 0.92.
- The section uses `overflow-x-clip` so the jet's exit doesn't create horizontal scroll, while the smoke can still drift vertically.
- Tests: `contrail.test.ts`, `Awards.test.tsx`, plus the e2e case in `e2e/motion.spec.ts` (cards hidden, then revealed, beam on, no horizontal scroll). Visual QA: `node scripts/awards-shots.mjs <url> <outDir> <light|dark> <width>`.

#### R13 notes

- The "When I'm offline" card renders `src/components/sections/beyond/InterestTiles.tsx`: three equal tiles in a 3-column grid (`[data-interest]`, `data-illustration` = reading / podcasts / hiking / plain). Each tile has an SVG illustration above the label; the label has its emoji stripped.
- `illustrationFor()` maps the interest text by keyword, so a new interest falls back to its emoji (`plain`).
- Reading: an open book with two pages (`data-page`) that keep turning around the spine (`animate-page-turn`, offset by 1.6s).
- Podcasts: headphones with five equaliser bars (`data-eq-bar`, `animate-eq`, varied durations).
- Hiking: a mountain where the trail draws itself (`data-trail`, `animate-trail-draw`, 4s) while a hiker dot climbs it with SVG `animateMotion` on the same 4s cycle. A flag waves at the summit.
- With reduced motion, the turning pages and `animateMotion` aren't rendered, the other animations are off, and the hiker sits at the summit.
- Keyframes are in `src/index.css` (`page-turn`, `eq`, `trail-draw`, `flag`). Tests are in `ClosingSections.test.tsx`. Visual QA: `node scripts/interests-shots.mjs <url> <outDir> <light|dark> <width>`.

#### Deployment

- Live at https://niranjan5712.github.io/PortfolioNiranjan/. Source: https://github.com/Niranjan5712/PortfolioNiranjan (branch `main`).
- `.github/workflows/deploy.yml` runs on every push to `main`: `npm install` → `npm test` → `npm run build` → GitHub Pages. It uses `npm install` rather than `npm ci` because the Windows-generated lock file lacks Linux-only optional packages.
- `vite.config.ts` uses `base: './'` and the media paths in `src/data/site.ts` are relative, so the build works under the `/PortfolioNiranjan/` sub-path as well as locally. Check a build under the sub-path with `npx vite preview --base /PortfolioNiranjan/ --port 4300` plus `node scripts/subpath-check.mjs`.

#### R8 notes (QA)

- Results: `tsc` clean; `oxlint` 0 errors (8 pre-existing warnings: fast-refresh exports, `Date` in the footer, one setState in `useVideoFrames`); `vite build` OK (JS 173 kB gzip, just over Vite's 500 kB raw chunk warning); Jest 185/185; Playwright 49 passed, 7 skipped (project-specific desktop/mobile cases), covering desktop, mobile and the reduced-motion specs.
- Fix: Products section bottom padding trimmed to `clamp(24px,3vw,40px)`. Its full bottom padding stacked on Journey's top padding and left a 336px gap below the frame counter (now 236px desktop, 153px mobile).
- Accepted as is: on phones, Ninja's chat teaser floats over the footer credit line when scrolled to the very bottom. It's dismissible and only appears until the chat is first opened.

#### R14 notes

- Once the footer wordmark has risen, `SiteFooter.tsx` renders two decorative copies (`[data-glitch-layer]` red / cyan, aria-hidden). They use the same `WORD_CLASS` so they line up letter for letter, with a rose or lagoon gradient fill.
- Everything runs on a shared 5s cycle with `steps(1)` timing, so changes are hard cuts:
  - `glitch-red` / `glitch-cyan`: for about 0.5s per cycle the copies flash in as horizontal `clip-path` slices shifted in opposite directions (the RGB split).
  - `neon-flicker` on the main wordmark: opacity drops plus a small skew jolt during the same burst.
- `animationDelay: -2.2s` makes the first burst land about 2s after reveal, once the letters have finished rising.
- The footer's `overflow-hidden` keeps the shifted slices from causing horizontal scroll. With reduced motion the copies are hidden and the flicker is off.
- Keyframes are in `src/index.css`. Tests: `SiteFooter.test.tsx` plus the e2e case in `e2e/motion.spec.ts`. Visual QA (freezes frames mid-burst): `node scripts/glitch-shots.mjs <url> <outDir> <light|dark> <width>`.

## Commands

- `npm run dev` — dev server
- `npm test` — Jest unit tests
- `npm run test:e2e` — Playwright (builds + previews on :4173)
- `npm run build` — type-check + production build

## Structure (Phase 2)

- `src/types/profile.ts` — interfaces + `ACCENTS` / `PRODUCT_ICONS` const maps
- `src/data/profile.ts` — all copy; `src/data/site.ts` — media paths + chat suggestions
- `src/components/common` — `Section`, `SectionHeading`, `BotFace`
- `src/components/layout` — `SiteNav`, `ThemeToggle`, `SiteFooter`
- `src/components/sections` — `hero/`, `how-i-ship/`, `products/`, `journey/`, plus `SkillsMarquee`, `ImpactStats`, `Awards`, `IntroVideo`, `Beyond`, `Contact`
- `src/hooks/useTheme.ts`
- `scripts/shoot.mjs` — per-section screenshots for visual QA: `node scripts/shoot.mjs <url> <outDir> <light|dark> <width>`

Section order: Hero → Skills → Results → How I ship (funnel + 5 steps) → Operating principles (focus, quality, engineering depth) → Product line → Journey → Awards → Intro → Beyond → Contact. The "Ask my AI twin" section was removed as redundant with the floating chat.

Skills are grouped as `product`, `aiProduct` and `analytics` (no individual tools such as GitHub, Windsurf, Claude, Cursor or Excel; GDPR / SOC 2 / OWASP are summarised as "Data Governance"). Education shows no CGPA.

Copy rules: only facts from the resume; keep "target", "designed to" and "estimated" hedges; every product card = Problem → Solution → Impact (metric first), one short plain sentence each (length limits enforced in `profile.test.ts`); products without a resume number use their strongest real fact, never an invented metric. Hero badge is a positioning line, never job-seeking wording. Hero hotspots describe product qualities in plain words (no degrees or credentials).

shadcn components added: `npx shadcn@latest add badge`. Button gained `pill` / `pill-sm` sizes.

## 3D hero (Phase 3)

- `src/lib/gsap.ts` registers ScrollTrigger + `useGSAP` once; import GSAP from here.
- `src/lib/hero/extractFrames.ts` seeks the video into a canvas 48 times, keys the background (`keyBackground.ts`: border flood fill + enclosed checkerboard pockets + edge feather) and emits ImageBitmaps. Frame 0's alpha bounds (padded 6%) crop every draw.
- `src/hooks/useVideoFrames.ts` streams frames in (`loading` → `ready` / `error`); on error `HeroStage` falls back to a looping `<video>`.
- `src/lib/hero/heroTimeline.ts` holds the pure maths (frame for progress, ping-pong idle, reveal thresholds, damping, contain-fit).
- `HeroStage.tsx` draws on a canvas with a RAF loop: damped scrub, adjacent-frame blending, idle ping-pong at the top of the page, drag to scrub.
- `Hero.tsx` desktop timeline (≥821px): pinned from `top 64px` for 170% of the viewport. Copy blurs out → figure centres and grows → hotspots 01–04 reveal between 32% and 74% with a progress dial → closing line "Engineer-built. Product-led. Shipped." Mobile: no pin, scroll still drives the frames. Reduced motion: no ScrollTrigger, all hotspots shown.
- Measured in Chrome (dev server): all 48 frames ready in ~10 s on desktop (900px) and ~7 s on mobile (560px); first frame shows immediately. Bitmaps take roughly 85 MB on desktop / 35 MB on mobile. Possible later optimisation: pre-extracted WebP frame sprites.
- Visual QA: `node scripts/hero-shots.mjs <url> <outDir> <light|dark> <width>` screenshots the hero at several scroll progress points.

## Intro video (Phase 4)

- `IntroVideo.tsx`: full-bleed dark band. On scroll (`top bottom` → `top 15%`) its clip-path opens from an inset rounded card (12px sides on mobile, 7% up to 140px on desktop) to full width, while the phone frame rises/straightens and the copy fades up.
- Preview: muted loop, plays only while ≥35% visible (IntersectionObserver), never autoplays with reduced motion. `src` uses `#t=2` so the resting frame is not black.
- Glass play button ("Play intro with sound") restarts from 0 with sound and native controls; on `ended` it returns to the muted preview.
- Phone (R5): `PhoneFrame.tsx` is an iPhone-style device: 3px titanium gradient rim around an 8px black glass border (no offset side shadow, which created a double outline), 4 metallic side buttons (`data-phone-button`), a 9:19.5 screen (the 9:16 video is `object-cover`), Dynamic Island with a camera lens (`data-phone-island`), a glass glare (`data-phone-glare`), a soft floor shadow and a permanent slight tilt (rotateY −10°, rotateX 4°). The scroll timeline straightens it from a stronger 3D tilt. Width is capped by the viewport height (`(100svh − 200px) × 9/19.5`) so the whole phone is always in view. No visible video title; the video's accessible name is `MEDIA.introLabel`.
- Unit tests use `src/test/intersectionObserver.ts` (global mock + `setIntersecting` helper). E2E: `e2e/intro.spec.ts`.
- Visual QA: `node scripts/intro-shots.mjs <url> <outDir> <light|dark> <width>`.
- Seam fix: Chrome does not clip a video by `border-radius` + `overflow-hidden` inside a 3D-transformed parent, so the screen also uses `[clip-path:inset(0_round_43px)]` and `translateZ(0)`. Close-up QA: `scripts/phone-closeup.mjs`.

### Beyond the roadmap: concert stage (R6)

- `Beyond.tsx`: the PR card is a dark stage (`data-stage`) with 3 sweeping spotlight cones (`data-spotlight`, `animate-spotlight`, iris / lagoon / sun), lamps along the top, a floor glow and a pulsing "Live events" label. Counters count up over `COUNT_MS` (1400 ms) once the stage is 45% visible.
- When the counters finish, two confetti cannons fire from the bottom corners (`data-confetti`, `data-confetti-piece`, `animate-confetti`). The pieces come from `src/lib/confetti.ts` (`confettiPieces(count, spread)`, which is deterministic), and the right cannon mirrors the left. There's no confetti with reduced motion.
- Interest chips (`data-interest`) float with staggered durations and alternate tilts, centred in the card so there's no dead space.
- Bottom padding is trimmed to `clamp(48px,6vw,80px)` so it doesn't stack with Contact's top padding.
- Tests: `confetti.test.ts`, the Beyond block in `ClosingSections.test.tsx` (fake timers), and the e2e case in `e2e/motion.spec.ts`. Visual QA: `node scripts/beyond-shots.mjs <url> <outDir> <light|dark> <width>`.

### Giant wordmark footer (R7)

- `SiteFooter.tsx` takes a `wordmark` prop (`profile.hero.firstName`) and renders it huge and uppercase under the credit line, Amplitude-style. Each letter (`data-wordmark-letter`) has an iris-to-transparent vertical gradient fill (`bg-clip-text`), a soft iris drop-shadow glow and a blurred radial glow behind it.
- The letters rise in with a 70 ms stagger once the footer is 30% visible (`useRevealOnce`, `data-risen`). With reduced motion they're already in place.
- The wordmark is `aria-hidden` because the full name is already in the credit line. Its size is `clamp(40px, 15.5vw, 224px)` so it fits from 390 px phones up to desktop without horizontal scroll.
- Contact's bottom padding is trimmed to `clamp(24px,4vw,56px)` so there's no dead band above the footer.
- Tests: `SiteFooter.test.tsx`, plus the e2e case in `e2e/motion.spec.ts` (rises in at the page end, and the letters fit the viewport). Visual QA: `node scripts/footer-shots.mjs <url> <outDir> <light|dark> <width>`.

## Motion system (Phase 5a)

- `src/lib/motion.ts`: pure helpers (`easeOutExpo`, `countValue`, `scrollProgress`, `splitWords`).
- `useSmoothScroll` (called in `App`): Lenis driven by the GSAP ticker, synced to ScrollTrigger, anchor links offset by the 80px nav. Off with reduced motion.
- `useRevealOnce`: IntersectionObserver that flips `data-revealed` once; always revealed with reduced motion. Components animate with CSS transitions on `data-[revealed=true]` / `group-data-[revealed=true]/<name>` variants.
- `SectionHeading`: titles are split into words that rise in with a stagger; eyebrow and description fade up after. Title prop is now `string`.
- `ImpactStats`: cards fade up in sequence; numbers count up (`useCountUp`); the final value is always in an `sr-only` span.
- `ScrollProgress` (inside `SiteNav`): 2px gradient bar, `scaleX` written directly on scroll (no re-renders).
- `Journey`: GSAP scrubs the timeline fill; each role toggles `data-active` as the fill reaches it. Default markup is the finished state, so reduced motion shows it complete.
- `IdeaFunnel`: replaced in 5b by the scroll-scrubbed pipeline (see below).
- Jest: `lenis` is transformed (`transformIgnorePatterns`); `ResizeObserver` is stubbed in `setupTests.ts`.
- E2E: `e2e/motion.spec.ts`. Visual QA: `node scripts/motion-shots.mjs <url> <outDir> <light|dark> <width>`.

## Motion polish + pipeline (Phase 5b)

- References: GSAP/Codrops scroll-scrubbed SVG path drawing, Magic UI "Animated Beam", filter-funnel UX (show what was removed, not just what remains).
- `src/lib/pipeline.ts`: single source of geometry (`PIPELINE`, `beamPath`, `stubPath`, centres) and step sync (`STEP_STARTS`, `activeStepFor`, `stepState`).
- `IdeaFunnel.tsx` (presentational, redesigned in R3): a dark glass stage (both themes) with iris/lagoon glows and a faint grid. 10 glass pitch cards → a glowing hexagonal prism gate (`prismFacets`: dark left facet, light right facet, white centre edge, blurred glow, `animate-prism-sweep` light band) → 5 solid gradient product tiles with a "SHIPPED ✓" badge. Kept pitches beam through the prism (blurred glow stroke + crisp core, violet → white → teal like light through a prism). Rejected pitches fade, blur and shrink in place, with a rose ×. Default markup is the finished state. `isLive` adds 3 white particles per beam (`<animateMotion>` along the beam path), pulses the prism glow and makes the tiles glow.
- `useScrollTriggerAutoRefresh` (in `App`): calls `ScrollTrigger.refresh()` 200 ms after the page or any section changes size. Without it, fonts and media loading after the first layout left the pinned "How I ship" stage starting ~40px late.
- `HowIShip.tsx`: heading above, steps + diagram as one stage. Desktop (≥1024px) pins it (`center 54%`, `+=150%`) and scrubs one timeline: Discover (pitches in) → Prioritise (gate, drops) → Define (beams draw) → Prove (products in) → Ship (checks). Steps get `data-state` done/current/upcoming and a rail fills. Mobile scrubs without pinning. Start dash offset is 1.05 so round caps don't leave dots.
- `Loader.tsx` (rebuilt in R2, references: Dennis Snellenberg's greeting loader, Apple's "hello" intro): `index.html` sets `html[data-loading]` (skipped with reduced motion); CSS pauses `main` animations until the loader leaves.
  - Plays in full on every load and reload (R10 removed the once-per-session quick fade). There are 12 greetings from `src/lib/loaderSequence.ts` (`GREETINGS`, each with `lang`, Arabic `dir="rtl"`). "Hello" holds 600 ms, then each greeting holds 230 ms and blurs in over 110 ms (`animate-greet-swap`), so it is sharp for about half its slot. Then "Welcome to / Niranjan’s portfolio" blurs in (waits for fonts, max +1.5 s), and the dark panel slides up with a curved bottom edge (`loader-curve`, height shrinks to flat) while the text drifts up faster. About 5 s in total.
  - There is no progress bar (R10).
  - Visual QA: `node scripts/loader-shots.mjs <url> <outDir> <width>` freezes animations before each shot. Headless Chrome renders at about 10 fps here, so unfrozen mid-run shots look blurrier than a real browser.
- `ProductLine.tsx` ("wanted poster" line-up, replaces the sideways pin): see below.
- `Magnetic` (hero CTAs, nav, contact) and `useTilt` (product + award cards, with glare): fine pointers only, off with reduced motion. CSS utilities `tilt` / `tilt-glare` in `index.css`.
- E2E: `e2e/polish.spec.ts`, pipeline step sync in `e2e/motion.spec.ts`. Visual QA: `scripts/pipeline-shots.mjs`, `scripts/phase5b-shots.mjs`.

## Wanted-poster product line

- References: Codrops On-Scroll 3D Stack Motion and On-Scroll 3D Carousel, Codrops' Eduard Bodak portfolio breakdown (scattered cards flipping back, separate mobile and reduced-motion versions), Codrops cinematic 3D scroll (scroll as camera director).
- `src/lib/productFlight.ts` (tested): deterministic poses per card: `launchPose` (far back, off to alternating sides, spinning), `swoopPose` (curved mid-path), `slapPose` (closer than rest, slightly bigger), `restPose` (flat, centred, small tilt), `pilePose(i, depth)` (messy offsets and tilts, hidden past `PILE_LIMIT`), `topPosterIndex` for the counter.
- Desktop (≥1024px), `data-mode="stage"`: `[data-poster-stage]` pins at `top 64px` for `cards × 0.7vh`. Each card gets a 1-unit segment: fade in → launch to swoop → slap → settle; at the slap, older cards are knocked back into the pile, the camera shakes (`[data-poster-camera]`) and a glow pulses (`[data-poster-glow]`). Per-card `transformPerspective` with `zIndex = i + 1` keeps the incoming card on top. Pose values are functions so they recompute on resize.
- Mobile (<1024px), `data-mode="stack"`: vertical list; each card spins in from alternating sides, scrubbed from `top 98%` to `top 55%`.
- Reduced motion: no mode, native snap carousel.
- Cards are hidden with `opacity` (not `visibility`) so screen readers can always reach all 8.
- Film roll (R4): `FilmStrip.tsx` is a 35mm strip (sprocket rows punched in the page background colour) with one frame per product (icon, short name, frame number), repeated `FILM.copies` (4) times. It sits behind the pile, tilted −4°. Its inner row drifts with CSS (`animate-film-drift`, −25% over 80 s) and the outer `[data-film-track]` is scrubbed `FILM.scrollShiftPx` left over the pinned scroll. When card *i* launches, frame *i*'s thumbnail lifts off (`[data-film-thumb]`), a light flash fills the frame (`[data-film-flash]`), and the thumbnail drops back once the card has landed. `ProjectorBeam.tsx`: a soft flickering light cone (`animate-flicker`) with 22 dust motes from `dustMotes()` in `src/lib/filmRoll.ts` (`animate-dust`). The counter reads "FRAME 04 / 08" (`data-testid="frame-counter"`). Mobile stack: the strip sits above the cards and only drifts; no projector. Reduced motion: no strip or projector.
- CSS variants `poster-stage:` / `poster-stack:` in `index.css`. E2E in `e2e/polish.spec.ts`. Visual QA: `node scripts/poster-shots.mjs <url> <outDir> <light|dark> <width>`.

## Ninja chatbot (Phase 6, renamed in R1)

- Name: **Ninja**, "Niranjan's AI assistant" (`BOT_NAME` in `src/data/twin.ts`). Speaks about Niranjan in the third person.
- `src/lib/twin/answerEngine.ts`: pure, rule-based answers built only from `profile` (named product → contact → awards → education → why PM → prioritise → backlog → skills → defence → product list → ship → roles → compliance → PR → hobbies → metrics → summary → location → any named skill). Product answers are `Name · client` / Problem / Solution / Impact. Every answer is at most 4 lines and 320 characters, with no first-person wording (enforced in `answerEngine.test.ts`). Unknown questions get `fallbackAnswer` (no guessing, points to email).
- `src/lib/twin/chatState.ts`: reducer. User messages are `done`; a bot answer starts `thinking`, or `queued` behind one in progress, and the next queued answer is promoted when the current one is `done`. Reduced motion → answers arrive `done`. `moodFor` maps status to the avatar mood; `typingDelay` pauses on punctuation.
- `src/hooks/useTwinChat.ts`: open/close, greeting on first open (skipped when opened with a question), thinking → typing timer. Created in `App`; teasers call `open(question)`.
- `BotFace`: `mood` (idle smile / thinking eyes up / talking mouth), blinking, pupils follow the pointer (fine pointers only).
- `TwinChat.tsx`: floating launcher (float bob, unread badge, morphs to ×), teasers after 4.5 s cycling every 8 s until dismissed or opened, panel revealed by a circular clip-path from the launcher (full screen on mobile), header status Online now / Thinking… / Typing…, typewriter replies (`TypedText`), suggestion chips, composer, Escape to close, focus moves in and back to the launcher, `aria-live` region with finished answers only, `data-lenis-prevent` on scroll areas.
- Data: `src/data/twin.ts` (greeting, suggestions, teasers).
- E2E: `e2e/twin.spec.ts`. Visual QA: `node scripts/twin-shots.mjs <url> <outDir> <light|dark> <width>`.

## Media facts

- `hero-3d.mp4`: 1280×720, 10.0 s, grey 3D sculpture on a light background with a baked-in checkerboard (fake transparency). Subtle motion, not a 360° turn. Phase 3 must key out the light background per frame so it sits cleanly on both themes.
- `intro.mp4`: 720×1280 portrait, 80.8 s. Shown in a 9:16 frame.
- Playwright's bundled Chromium has no H.264, so videos don't render in e2e; `scripts/shoot.mjs` uses the installed Chrome channel.

## Notes / decisions

- Playwright runs with 2 workers / 60 s timeout: on this machine, launching 4+ Chromium instances at once starves the CPU and page loads time out.

- Videos are copied (not moved) from the workspace root into `public/media/`.
- ffmpeg is not available locally, so smooth scrubbing uses client-side frame extraction into canvases rather than re-encoding the MP4 with all-keyframes.
- The original chatbot's `window.claude.use` LLM path only works inside Claude artifacts; the React port will rely on the local keyword answer engine.
