import { expect, test } from '@playwright/test'

test('home page loads with the correct title and heading', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Niranjan Sivakumar/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Niranjan Sivakumar')
})

test('media assets are served', async ({ request }) => {
  for (const file of ['/media/hero-3d.mp4', '/media/intro.mp4']) {
    const res = await request.head(file)
    expect(res.ok()).toBeTruthy()
  }
})
