import { expect, test } from '@playwright/test'

test.describe('portfolio content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('presents every section of the product page', async ({ page }) => {
    for (const name of [
      'Impact',
      'How I ship',
      'Operating principles',
      'Product line',
      'Journey',
      'Awards',
      'Intro video',
      'Contact',
    ]) {
      await expect(page.getByRole('region', { name, exact: true })).toBeAttached()
    }
  })

  test('shows all 8 products with a problem, solution and impact', async ({ page }) => {
    const cards = page.getByRole('region', { name: 'Product line' }).getByRole('article')
    await expect(cards).toHaveCount(8)
    await expect(cards.first()).toContainText('Problem')
    await expect(cards.first()).toContainText('Solution')
    await expect(cards.first()).toContainText('Impact')
  })

  test('hides the CGPA and lists AI product skills', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('CGPA')
    await expect(page.getByText('AI Evals & Quality Metrics').first()).toBeAttached()
    await expect(page.getByText('Windsurf')).toHaveCount(0)
  })

  test('nav links scroll to their sections', async ({ page, isMobile }) => {
    test.skip(isMobile, 'section links are hidden on mobile')
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'How I ship' }).click()
    await expect(page).toHaveURL(/#how-i-ship$/)
    await expect(page.getByRole('heading', { name: /10\+ ideas in/ })).toBeInViewport()
  })

  test('theme toggle switches to dark and persists across reloads', async ({ page }) => {
    await page.getByRole('button', { name: /switch to dark theme/i }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})
