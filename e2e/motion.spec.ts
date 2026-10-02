import { expect, test } from '@playwright/test'

test.describe('scroll motion', () => {
  test('headings reveal and counters reach their final values on scroll', async ({ page }) => {
    await page.goto('/')
    const impact = page.locator('#impact')
    const heading = impact.locator('[data-revealed]').first()
    await expect(heading).toHaveAttribute('data-revealed', 'false')

    await impact.locator('article').first().scrollIntoViewIfNeeded()
    await expect(heading).toHaveAttribute('data-revealed', 'true')
    await expect(page.getByTestId('stat-shipped')).toHaveText('8')
    await expect(page.getByTestId('stat-resolved')).toHaveText('75%')
  })

  test('nav progress bar grows as the page scrolls', async ({ page }) => {
    await page.goto('/')
    const bar = page.getByTestId('scroll-progress')
    const scale = async (): Promise<number> =>
      Number((await bar.getAttribute('style'))?.match(/scaleX\(([\d.]+)\)/)?.[1] ?? 0)
    await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight / 2)')
    await expect.poll(scale).toBeGreaterThan(0.3)
    await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)')
    await expect.poll(scale).toBeGreaterThan(0.98)
  })

  test('journey roles light up as the timeline fills', async ({ page }) => {
    await page.goto('/')
    const roles = page.locator('#journey [data-role]')
    await expect(roles.first()).toHaveAttribute('data-active', 'false')
    await roles.last().scrollIntoViewIfNeeded()
    await expect(page.locator('#journey [data-role][data-active="true"]')).toHaveCount(await roles.count())
  })

  test('model code morphs into roadmap steps as the journey scrolls', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('loader')).toHaveCount(0, { timeout: 10000 })
    const cards = page.locator('#journey [data-roadmap-card]')
    await expect(cards).toHaveCount(3)
    const opacity = async (i: number): Promise<number> =>
      Number(
        await page.evaluate(
          `Number(getComputedStyle(document.querySelectorAll("#journey [data-roadmap-card]")[${i}]).opacity)`,
        ),
      )
    await page.locator('#journey [data-code-to-roadmap]').scrollIntoViewIfNeeded()
    expect(await opacity(2)).toBeLessThan(0.5)
    await page.locator('#journey [data-role]').last().scrollIntoViewIfNeeded()
    await page.evaluate('window.scrollBy(0, window.innerHeight / 2)')
    await expect.poll(() => opacity(2)).toBeGreaterThan(0.95)
    await expect(page.locator('#journey')).not.toContainText('M.Sc.')
  })

  test('a jet flies over the awards and the smoke clears to reveal them', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('loader')).toHaveCount(0, { timeout: 10000 })
    const firstCard = page.locator('#awards [data-award]').first()
    const cardOpacity = async (): Promise<number> =>
      Number(await page.evaluate('Number(getComputedStyle(document.querySelector("#awards [data-award]")).opacity)'))
    await expect(page.locator('#awards [data-flyby] [data-jet] svg')).toBeAttached()
    await page.locator('#awards h2').scrollIntoViewIfNeeded()
    expect(await cardOpacity()).toBeLessThan(0.5)
    await page.evaluate(
      '(() => { const r = document.querySelector("[data-airspace]").getBoundingClientRect(); window.scrollBy(0, r.bottom - window.innerHeight * 0.35) })()',
    )
    await expect.poll(cardOpacity).toBeGreaterThan(0.95)
    await expect(firstCard).toHaveAttribute('data-beam', 'on')
    expect(await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')).toBe(true)
  })

  test('the PR stage throws confetti once its counters land', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('loader')).toHaveCount(0, { timeout: 10000 })
    const stage = page.locator('#beyond [data-stage]')
    await stage.scrollIntoViewIfNeeded()
    await expect(stage.locator('[data-spotlight]')).toHaveCount(3)
    await expect(page.locator('#beyond [data-confetti]')).toBeAttached()
  })

  test('the giant wordmark rises in at the foot of the page and fits the screen', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('loader')).toHaveCount(0, { timeout: 10000 })
    const wordmark = page.locator('[data-wordmark]')
    await expect(wordmark).toHaveAttribute('data-risen', 'false')
    await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)')
    await expect(wordmark).toHaveAttribute('data-risen', 'true')
    const fits = await page.evaluate(
      '(() => { const l = [...document.querySelectorAll("[data-wordmark-letter]")].map((e) => e.getBoundingClientRect()); return l[0].left >= 0 && l[l.length - 1].right <= window.innerWidth && document.documentElement.scrollWidth <= window.innerWidth })()',
    )
    expect(fits).toBe(true)
  })

  test('the risen wordmark glitches with split colour layers', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('loader')).toHaveCount(0, { timeout: 10000 })
    await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)')
    await expect(page.locator('[data-glitch-layer]')).toHaveCount(2)
    const names = await page.evaluate(
      '[document.querySelector("[data-wordmark]"), ...document.querySelectorAll("[data-glitch-layer]")].map((el) => getComputedStyle(el).animationName)',
    )
    expect(names).toEqual(['neon-flicker', 'glitch-red', 'glitch-cyan'])
  })
})

test.describe('how I ship pipeline (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'pinned step sync is desktop-only')

  test('highlights each process step in turn and goes live at the end', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('loader')).toHaveCount(0, { timeout: 10000 })
    const steps = page.locator('[aria-label="My process"] > li')
    const start = Number(
      await page.evaluate(
        '(() => { const r = document.querySelector("[data-pipeline]").getBoundingClientRect(); return r.top + window.scrollY + r.height / 2 - window.innerHeight * 0.54 })()',
      ),
    )
    const vh = page.viewportSize()?.height ?? 720

    await page.evaluate(`window.scrollTo(0, ${start + 10})`)
    await expect(steps.nth(0)).toHaveAttribute('data-state', 'current')
    await expect(steps.nth(4)).toHaveAttribute('data-state', 'upcoming')

    await page.evaluate(`window.scrollTo(0, ${start + vh * 1.5 * 0.5})`)
    await expect(steps.nth(2)).toHaveAttribute('data-state', 'current')
    await expect(steps.nth(0)).toHaveAttribute('data-state', 'done')

    await page.evaluate(`window.scrollTo(0, ${start + vh * 1.5 - 5})`)
    await expect(steps.nth(4)).toHaveAttribute('data-state', 'current')
    await expect(page.locator('[data-particle]')).toHaveCount(15)
  })
})

test.describe('scroll motion with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('shows final values and a filled timeline without animating', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('stat-shipped')).toHaveText('8')
    await expect(page.locator('#impact [data-revealed="false"]')).toHaveCount(0)
    await expect(page.locator('#journey [data-role][data-active="false"]')).toHaveCount(0)
  })
})
