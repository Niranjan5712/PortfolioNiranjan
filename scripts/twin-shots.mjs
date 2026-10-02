import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/twin', theme = 'light', width = '1440'] = process.argv.slice(2)
const isMobile = Number(width) < 640

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: isMobile ? 844 : 900 },
  colorScheme: theme,
  hasTouch: isMobile,
  isMobile,
})
page.setDefaultTimeout(20000)
await page.goto(url, { waitUntil: 'domcontentloaded' })
console.log('loaded')
await page.getByTestId('twin-teaser').waitFor({ timeout: 15000 })
await page.waitForTimeout(700)
await page.screenshot({ path: `${out}/${width}-${theme}-teaser.png` })

await page.getByRole('button', { name: 'Chat with Ninja', exact: true }).click()
await page.waitForTimeout(260)
await page.screenshot({ path: `${out}/${width}-${theme}-reveal.png` })
await page.waitForTimeout(5000)
await page.screenshot({ path: `${out}/${width}-${theme}-greeting.png` })

const dialog = page.getByRole('dialog', { name: 'Chat with Ninja' })
await dialog.getByRole('textbox', { name: 'Ask a question' }).fill('Tell me about Talk to DB')
await dialog.getByRole('button', { name: 'Send' }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: `${out}/${width}-${theme}-thinking.png` })
await page.waitForTimeout(1600)
await page.screenshot({ path: `${out}/${width}-${theme}-typing.png` })
await dialog.getByTestId('twin-live').filter({ hasText: 'usable answers.' }).waitFor({ timeout: 20000 })
await page.waitForTimeout(400)
await page.screenshot({ path: `${out}/${width}-${theme}-answer.png` })
console.log('shots done')
await browser.close()
console.log('closed')
