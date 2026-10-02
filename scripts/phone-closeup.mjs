import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/intro/phone-closeup.png', theme = 'dark'] = process.argv.slice(2)

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: theme, deviceScaleFactor: 2 })
await page.goto(url)
await page.getByTestId('loader').waitFor({ state: 'detached', timeout: 10000 })
const top = await page.evaluate(() => document.querySelector('#intro').getBoundingClientRect().top + window.scrollY)
await page.evaluate((y) => window.scrollTo(0, y), Math.round(top - 900 * 0.1))
await page.waitForTimeout(2500)
await page.locator('[data-phone]').screenshot({ path: out })
await browser.close()
