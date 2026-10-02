import { chromium } from '@playwright/test'

const [url = 'http://localhost:4300/PortfolioNiranjan/'] = process.argv.slice(2)

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const failures = []
page.on('response', (r) => r.status() >= 400 && failures.push(`${r.status()} ${r.url()}`))
page.on('requestfailed', (r) => failures.push(`failed ${r.url()}`))
page.on('pageerror', (e) => failures.push(`pageerror ${e.message}`))
await page.goto(url)
await page.getByTestId('loader').waitFor({ state: 'detached', timeout: 15000 })
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await page.waitForTimeout(2000)
const videos = await page.evaluate(() => [...document.querySelectorAll('video')].map((v) => v.currentSrc || v.src))
console.log('videos', videos)
console.log('wordmark', await page.locator('[data-wordmark]').textContent())
console.log(failures.length ? failures.join('\n') : 'no failed requests')
await browser.close()
