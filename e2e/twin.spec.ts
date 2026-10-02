import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('loader')).toHaveCount(0, { timeout: 8000 })
})

test('opens Ninja, greets, and answers from the resume', async ({ page }) => {
  const launcher = page.getByRole('button', { name: 'Chat with Ninja', exact: true })
  await launcher.click()
  const dialog = page.getByRole('dialog', { name: 'Chat with Ninja' })
  await expect(dialog).toHaveAttribute('data-state', 'open')
  await expect(dialog.getByTestId('twin-answer').first()).toContainText("I'm Ninja", { timeout: 10000 })

  await dialog.getByRole('textbox', { name: 'Ask a question' }).fill('What awards has he won?')
  await dialog.getByRole('button', { name: 'Send' }).click()
  await expect(dialog.getByTestId('twin-thinking')).toBeVisible()
  await expect(dialog.getByTestId('twin-live')).toContainText('Best Innovation', { timeout: 20000 })
  await expect(dialog.getByTestId('twin-status')).toHaveText('Online now')

  await dialog.getByRole('button', { name: 'Close chat' }).click()
  await expect(dialog).toHaveAttribute('data-state', 'closed')
})

test('explains a product in friendly plain language', async ({ page }) => {
  await page.getByRole('button', { name: 'Chat with Ninja', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Chat with Ninja' })
  await dialog.getByRole('button', { name: 'Tell me about Talk to DB' }).click()
  const live = dialog.getByTestId('twin-live')
  await expect(live).toContainText('plain English', { timeout: 20000 })
  await expect(live).not.toContainText('Problem:')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveAttribute('data-state', 'closed')
})

test('the redundant Ask section is gone', async ({ page }) => {
  await expect(page.locator('#ask')).toHaveCount(0)
})
