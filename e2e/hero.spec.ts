import { expect, test, type Page } from '@playwright/test'

async function scrollToY(page: Page, y: number): Promise<void> {
  await page.evaluate(`window.scrollTo(0, ${Math.round(y)})`)
}

async function scrollToPinProgress(page: Page, progress: number): Promise<void> {
  const height = page.viewportSize()?.height ?? 800
  await scrollToY(page, height * 1.7 * progress)
}

test.describe('hero choreography (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'pinned choreography is desktop-only')

  test('pins the hero and reveals hotspots one by one as you scroll', async ({ page }) => {
    await page.goto('/')
    const hero = page.locator('#top')
    const active = page.locator('[data-testid^="hotspot-"][data-active="true"]')
    await expect(active).toHaveCount(0)

    await scrollToPinProgress(page, 0.5)
    await expect.poll(() => active.count()).toBe(2)
    await expect.poll(async () => (await hero.boundingBox())?.y ?? -1).toBeCloseTo(64, 0)
    await expect(page.locator('[data-hero-copy]')).toBeHidden()

    await scrollToPinProgress(page, 0.95)
    await expect.poll(() => active.count()).toBe(4)
    await expect(page.getByText('Engineer-built. Product-led.')).toBeVisible()
  })

  test('scrolling back up restores the intro copy', async ({ page }) => {
    await page.goto('/')
    await scrollToPinProgress(page, 0.6)
    await expect(page.locator('[data-hero-copy]')).toBeHidden()
    await scrollToY(page, 0)
    await expect(page.locator('[data-hero-copy]')).toBeVisible()
    await expect(page.locator('[data-testid^="hotspot-"][data-active="true"]')).toHaveCount(0)
  })
})

test.describe('hero with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('shows every hotspot without pinning', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hotspots are desktop-only')
    await page.goto('/')
    await expect(page.locator('[data-testid^="hotspot-"][data-active="true"]')).toHaveCount(4)
    await scrollToY(page, page.viewportSize()?.height ?? 800)
    await expect.poll(async () => (await page.locator('#top').boundingBox())?.y ?? 0).toBeLessThan(0)
  })
})
