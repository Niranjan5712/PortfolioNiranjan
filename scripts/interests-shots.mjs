import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/interests', theme = 'light', width = '1440'] = process.argv.slice(2)

const height = Number(width) < 768 ? 844 : 900
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height }, colorScheme: theme })
await page.goto(url)
await page.getByTestId('loader').waitFor({ state: 'detached', timeout: 10000 })
await page.waitForTimeout(600)

await page.evaluate(() => {
  const el = document.querySelector('[data-interest]')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 300)
})
await page.waitForTimeout(3500)

const card = page.locator('[data-interest]').first().locator('xpath=ancestor::*[.//h3][1]')
for (const [label, ms] of [['a', 0], ['b', 900], ['c', 900]]) {
  await page.waitForTimeout(ms)
  await card.screenshot({ path: `${out}/${width}-${theme}-${label}.png`, animations: 'allow' })
}
await page.locator('#beyond').screenshot({ path: `${out}/${width}-${theme}-section.png` })
await browser.close()
