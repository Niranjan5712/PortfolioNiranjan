import { chromium } from '@playwright/test'

const url = process.argv[2] ?? 'http://localhost:5173/'
const out = process.argv[3] ?? 'test-results/hero'
const theme = process.argv[4] ?? 'light'
const width = Number(process.argv[5] ?? 1440)
const height = width < 800 ? 844 : 900

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width, height }, colorScheme: theme })
page.on('console', (m) => m.type() === 'error' && console.log('console error:', m.text()))
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForFunction(() => document.querySelector('[data-status]')?.getAttribute('data-status') !== 'loading', null, {
  timeout: 20000,
})
console.log('stage status:', await page.getAttribute('[data-status]', 'data-status'))
await page.waitForTimeout(1800)

const pin = height * 1.7
for (const p of [0, 0.15, 0.4, 0.6, 0.8, 0.97]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(pin * p))
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${out}/${width}-${theme}-${String(Math.round(p * 100)).padStart(3, '0')}.png` })
}
await browser.close()
