import { expect, test } from '@playwright/test'

test('loader greets in many languages, welcomes, wipes away, and plays again on reload', async ({ page }) => {
  await page.addInitScript(`
    window.__greetings = []
    new MutationObserver(() => {
      const text = document.querySelector('[data-testid="loader-greeting"]')?.textContent
      if (text && window.__greetings.at(-1) !== text) window.__greetings.push(text)
    }).observe(document, { childList: true, subtree: true, characterData: true })
  `)
  await page.goto('/')
  const loader = page.getByTestId('loader')
  await expect(loader).toHaveAttribute('data-phase', 'greeting')
  await expect(loader.locator('[style*="scaleX"]')).toHaveCount(0)
  await expect(loader).toContainText('Niranjan’s portfolio', { timeout: 6000 })
  await expect(loader).toHaveCount(0, { timeout: 8000 })
  const seen = (await page.evaluate('window.__greetings')) as string[]
  expect(seen[0]).toBe('Hello')
  expect(seen).toEqual(expect.arrayContaining(['வணக்கம்', 'नमस्ते', 'こんにちは', 'مرحبا']))
  expect(await page.evaluate('document.documentElement.hasAttribute("data-loading")')).toBe(false)

  await page.reload()
  await expect(page.getByTestId('loader-greeting')).toHaveText('Hello')
  await expect(loader).toContainText('Niranjan’s portfolio', { timeout: 6000 })
  await expect(loader).toHaveCount(0, { timeout: 8000 })
})

test.describe('product line (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'poster stage is desktop-only')

  test('flies each poster in and lands the last one centred on top of the pile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('loader')).toHaveCount(0, { timeout: 8000 })
    const section = page.locator('#products')
    await expect(section).toHaveAttribute('data-mode', 'stage')

    const lastCard = section.locator('article').last()
    await expect(lastCard).toHaveCSS('opacity', '0')
    await expect(section.locator('[data-film-strip]')).toBeVisible()
    await expect(section.locator('[data-projector]')).toBeVisible()
    const trackX = (): Promise<unknown> =>
      page.evaluate('new DOMMatrix(getComputedStyle(document.querySelector("[data-film-track]")).transform).m41')

    const stageTop = await page.evaluate(
      'document.querySelector("[data-poster-stage]").parentElement.getBoundingClientRect().top + window.scrollY',
    )
    await page.evaluate(`window.scrollTo(0, ${Number(stageTop) - 64 + 9000})`)
    await expect(lastCard).toHaveCSS('opacity', '1')
    await expect(section.getByTestId('frame-counter')).toHaveText('08')
    await expect.poll(async () => Number(await trackX())).toBeLessThan(-400)

    const viewport = page.viewportSize() ?? { width: 1280, height: 720 }
    await expect
      .poll(async () => {
        const box = await lastCard.boundingBox()
        return box ? Math.abs(box.x + box.width / 2 - viewport.width / 2) : Infinity
      })
      .toBeLessThan(40)
  })
})

test.describe('product line (mobile)', () => {
  test.skip(({ isMobile }) => !isMobile, 'stacked fly-in is mobile-only')

  test('stacks the posters vertically and flies each in as it scrolls into view', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('loader')).toHaveCount(0, { timeout: 8000 })
    const section = page.locator('#products')
    await expect(section).toHaveAttribute('data-mode', 'stack')
    await expect(section.locator('[data-film-strip]')).toBeVisible()
    await expect(section.locator('[data-projector]')).toBeHidden()

    const cards = section.locator('article')
    const first = await cards.nth(0).boundingBox()
    const second = await cards.nth(1).boundingBox()
    expect(second?.y ?? 0).toBeGreaterThan((first?.y ?? 0) + (first?.height ?? 0) - 40)

    await cards.nth(2).scrollIntoViewIfNeeded()
    await page.evaluate('window.scrollBy(0, 300)')
    await expect
      .poll(() => page.evaluate('Number(getComputedStyle(document.querySelectorAll("#products article")[2]).opacity)'))
      .toBeGreaterThan(0.5)
  })
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('skips the loader and keeps the product line as a native carousel', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('loader')).toHaveCount(0)
    await expect(page.locator('#products')).not.toHaveAttribute('data-mode')
    await expect(page.locator('[data-film-strip]')).toBeHidden()
    await expect(page.locator('#products article').last()).toBeAttached()
  })
})
