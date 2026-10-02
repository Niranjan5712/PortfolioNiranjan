import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/footer', theme = 'light', width = '1440'] = process.argv.slice(2)

const height = Number(width) < 768 ? 844 : 900
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height }, colorScheme: theme })
await page.goto(url)
await page.getByTestId('loader').waitFor({ state: 'detached', timeout: 10000 })
await page.waitForTimeout(600)

await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight - window.innerHeight * 2.2))
await page.waitForTimeout(600)
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await page.waitForTimeout(350)
await page.screenshot({ path: `${out}/${width}-${theme}-rising.png` })
await page.waitForTimeout(1800)
await page.screenshot({ path: `${out}/${width}-${theme}-end.png` })
await browser.close()
