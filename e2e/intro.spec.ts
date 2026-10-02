import { expect, test } from '@playwright/test'

test('intro video starts as a muted preview and plays with sound on demand', async ({ page }) => {
  await page.goto('/')
  const intro = page.locator('#intro')
  await intro.scrollIntoViewIfNeeded()
  const video = intro.locator('video')

  await expect(intro.locator('[data-phone]')).toBeVisible()
  await expect(intro.locator('[data-phone-island]')).toBeVisible()
  await expect(intro.locator('figcaption')).toHaveCount(0)
  await expect(intro.getByText('The AI Whisperer')).toHaveCount(0)
  await expect(video).not.toHaveAttribute('controls')
  expect(await video.evaluate((el) => (el as unknown as { muted: boolean }).muted)).toBe(true)

  await intro.getByRole('button', { name: 'Play intro with sound' }).click()

  await expect(video).toHaveAttribute('controls')
  expect(await video.evaluate((el) => (el as unknown as { muted: boolean }).muted)).toBe(false)
  await expect(intro.getByRole('button', { name: 'Play intro with sound' })).toHaveCount(0)
})
