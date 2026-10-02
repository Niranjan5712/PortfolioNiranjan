import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/awards', theme = 'light', width = '1440'] = process.argv.slice(2)

const height = Number(width) < 768 ? 844 : 900
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height }, colorScheme: theme })
await page.goto(url)
await page.getByTestId('loader').waitFor({ state: 'detached', timeout: 15000 })
await page.waitForTimeout(600)

const box = await page.evaluate(() => {
  const r = document.querySelector('[data-airspace]').getBoundingClientRect()
  return { top: r.top + window.scrollY, height: r.height }
})
const start = box.top - height * 0.8
const end = box.top + box.height - height * 0.4

for (const [i, f] of [0.15, 0.4, 0.62, 0.8, 1].entries()) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(start + f * (end - start)))
  await page.waitForTimeout(1500)
  const beam = await page.evaluate(() => document.querySelector('[data-award]').dataset.beam)
  console.log(`shot ${i} (${f}): beam ${beam}`)
  await page.screenshot({ path: `${out}/${width}-${theme}-${i}.png` })
}
await browser.close()
