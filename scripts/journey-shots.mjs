import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/journey', theme = 'light', width = '1440'] = process.argv.slice(2)

const height = Number(width) < 768 ? 844 : 900
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height }, colorScheme: theme })
await page.goto(url)
await page.getByTestId('loader').waitFor({ state: 'detached', timeout: 15000 })
await page.waitForTimeout(600)

const isMobile = Number(width) < 1024
const anchor = await page.evaluate((mobile) => {
  const el = document.querySelector(mobile ? '[data-code-to-roadmap]' : '#journey ol[aria-label="Experience"]')
  const r = el.getBoundingClientRect()
  return { top: r.top + window.scrollY, height: r.height }
}, isMobile)

const fractions = [0, 0.35, 0.65, 1]
for (const [i, f] of fractions.entries()) {
  const y = isMobile
    ? anchor.top - height * 0.85 + f * (anchor.height + height * 0.55)
    : anchor.top - height * 0.7 + f * anchor.height
  await page.evaluate((v) => window.scrollTo(0, v), Math.round(y))
  await page.waitForTimeout(2000)
  const state = await page.evaluate(() =>
    [...document.querySelectorAll('[data-roadmap-card]')].map((c) => Number(getComputedStyle(c).opacity).toFixed(2)).join(' '),
  )
  console.log(`shot ${i}: roadmap opacity ${state}`)
  await page.screenshot({ path: `${out}/${width}-${theme}-${i}.png` })
}
await browser.close()
