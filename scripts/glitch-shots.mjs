import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/glitch', theme = 'light', width = '1440'] = process.argv.slice(2)

const height = Number(width) < 768 ? 844 : 900
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height }, colorScheme: theme })
await page.goto(url)
await page.getByTestId('loader').waitFor({ state: 'detached', timeout: 10000 })
await page.waitForTimeout(600)

await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await page.locator('[data-glitch-layer]').first().waitFor({ state: 'attached', timeout: 10000 })
await page.waitForTimeout(2000)

const footer = page.locator('footer')
for (const [label, ms] of [['calm', 0], ['split-a', 2150], ['split-b', 2300], ['split-c', 2420]]) {
  await page.evaluate(`(() => {
    const els = [document.querySelector('[data-wordmark]'), ...document.querySelectorAll('[data-glitch-layer]')]
    els.flatMap((el) => el.getAnimations()).forEach((a) => { a.pause(); a.currentTime = ${ms} })
  })()`)
  await page.waitForTimeout(150)
  await footer.screenshot({ path: `${out}/${width}-${theme}-${label}.png` })
}
await browser.close()
