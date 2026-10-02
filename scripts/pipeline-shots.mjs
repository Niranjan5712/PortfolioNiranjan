import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/pipeline', theme = 'light', width = '1440'] = process.argv.slice(2)
const vh = 900

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height: vh }, colorScheme: theme })
await page.goto(url)
await page.getByTestId('loader').waitFor({ state: 'detached', timeout: 10000 })
await page.waitForTimeout(600)

if (Number(width) < 1024) {
  const figure = page.locator('[data-pipeline-figure]')
  await figure.scrollIntoViewIfNeeded()
  for (const offset of [0, 250, 500]) {
    await page.evaluate((y) => window.scrollBy(0, y), offset ? 250 : 0)
    await page.waitForTimeout(1400)
    await page.screenshot({ path: `${out}/${width}-${theme}-m${offset}.png` })
  }
  await browser.close()
  process.exit(0)
}

const start = await page.evaluate((h) => {
  const el = document.querySelector('[data-pipeline]')
  const r = el.getBoundingClientRect()
  return r.top + window.scrollY + r.height / 2 - h * 0.54
}, vh)

for (const p of [0, 0.22, 0.5, 0.7, 0.88, 1.02]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(start + p * vh * 1.5))
  await page.waitForTimeout(1400)
  await page.screenshot({ path: `${out}/${width}-${theme}-${String(Math.round(p * 100)).padStart(3, '0')}.png` })
}
await browser.close()
