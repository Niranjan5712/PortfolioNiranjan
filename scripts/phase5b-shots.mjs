import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/5b', theme = 'light', width = '1440'] = process.argv.slice(2)
const vh = 900

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height: vh }, colorScheme: theme })
await page.goto(url)
await page.waitForTimeout(600)
await page.screenshot({ path: `${out}/${width}-${theme}-loader.png` })
await page.waitForTimeout(2600)
await page.screenshot({ path: `${out}/${width}-${theme}-after-loader.png` })

const sectionTop = await page.evaluate(() => {
  const track = document.querySelector('[data-product-track]')
  return track.getBoundingClientRect().top + window.scrollY - 64 - 72
})
const pinned = await page.evaluate(() => document.querySelector('#products').dataset.pinned ?? 'no')
console.log('pinned:', pinned)

for (const [name, extra] of [
  ['start', 0],
  ['mid', 1.2],
  ['late', 2.6],
]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(sectionTop + extra * vh))
  await page.waitForTimeout(1400)
  await page.screenshot({ path: `${out}/${width}-${theme}-products-${name}.png` })
}

const award = page.locator('#awards article').first()
await award.scrollIntoViewIfNeeded()
await page.waitForTimeout(900)
const box = await award.boundingBox()
await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.2, { steps: 8 })
await page.waitForTimeout(400)
await page.screenshot({ path: `${out}/${width}-${theme}-award-tilt.png` })
await browser.close()
