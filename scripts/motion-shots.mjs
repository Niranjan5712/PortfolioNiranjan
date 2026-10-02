import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/motion', theme = 'light', width = '1440'] = process.argv.slice(2)

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, colorScheme: theme })
await page.goto(url)
await page.waitForTimeout(1200)

async function wheelTo(selector, offsetRatio = 0.15) {
  for (let i = 0; i < 80; i++) {
    const top = await page.evaluate(
      (s) => document.querySelector(s).getBoundingClientRect().top,
      selector,
    )
    const target = 900 * offsetRatio
    if (Math.abs(top - target) < 40) break
    await page.mouse.wheel(0, Math.max(-500, Math.min(500, top - target)))
    await page.waitForTimeout(120)
  }
}

await page.mouse.move(Number(width) / 2, 450)

await wheelTo('#impact', 0.05)
await page.waitForTimeout(450)
await page.screenshot({ path: `${out}/${width}-${theme}-impact-counting.png` })
await page.waitForTimeout(2200)
await page.screenshot({ path: `${out}/${width}-${theme}-impact-done.png` })

await wheelTo('[data-testid="idea-funnel"]', 0.15)
await page.waitForTimeout(700)
await page.screenshot({ path: `${out}/${width}-${theme}-funnel-early.png` })
await page.waitForTimeout(2600)
await page.screenshot({ path: `${out}/${width}-${theme}-funnel-done.png` })

await wheelTo('#journey ol', 0.35)
await page.waitForTimeout(900)
await page.screenshot({ path: `${out}/${width}-${theme}-journey-start.png` })
await wheelTo('#journey ol li:last-child', 0.4)
await page.waitForTimeout(900)
await page.screenshot({ path: `${out}/${width}-${theme}-journey-end.png` })

const lenis = await page.evaluate(() => document.documentElement.className)
const bar = await page.evaluate(() => document.querySelector('[data-testid="scroll-progress"]').style.transform)
console.log('html classes:', lenis, '| progress bar:', bar)
await browser.close()
