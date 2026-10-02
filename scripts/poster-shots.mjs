import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/posters', theme = 'light', width = '1440'] = process.argv.slice(2)
const isMobile = Number(width) < 640
const vh = isMobile ? 844 : 900

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height: vh }, colorScheme: theme, isMobile, hasTouch: isMobile })
page.setDefaultTimeout(20000)
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.getByTestId('loader').waitFor({ state: 'detached', timeout: 15000 })
const mode = await page.evaluate(() => document.querySelector('#products').dataset.mode ?? 'none')
console.log('mode:', mode)

const stageTop = await page.evaluate(() => {
  const stage = document.querySelector('[data-poster-stage]')
  const spacer = stage.parentElement.classList.contains('pin-spacer') ? stage.parentElement : stage
  return spacer.getBoundingClientRect().top + window.scrollY - 64
})

const unit = vh * 0.7
const points = mode === 'stage'
  ? [['0-flying', 0.28], ['0-landed', 0.75], ['1-flying', 1.32], ['1-slap', 1.52], ['3-landed', 3.8], ['8-pile', 8]]
  : [['stack-a', 0], ['stack-b', 1.2], ['stack-c', 2.4]]

for (const [name, u] of points) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(stageTop + u * unit))
  await page.waitForTimeout(1600)
  await page.screenshot({ path: `${out}/${width}-${theme}-${name}.png` })
}
await browser.close()
