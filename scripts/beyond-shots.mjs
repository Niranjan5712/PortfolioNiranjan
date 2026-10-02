import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/beyond', theme = 'light', width = '1440'] = process.argv.slice(2)

const height = Number(width) < 768 ? 844 : 900
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height }, colorScheme: theme })
await page.goto(url)
await page.getByTestId('loader').waitFor({ state: 'detached', timeout: 10000 })
await page.waitForTimeout(600)

await page.locator('#beyond').scrollIntoViewIfNeeded()
await page.evaluate(() => {
  const el = document.querySelector('#beyond')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80)
})
await page.waitForTimeout(500)
await page.screenshot({ path: `${out}/${width}-${theme}-counting.png` })
await page.waitForTimeout(1700)
await page.screenshot({ path: `${out}/${width}-${theme}-burst.png` })
await page.waitForTimeout(1600)
await page.locator('#beyond').screenshot({ path: `${out}/${width}-${theme}-settled.png` })
await browser.close()
