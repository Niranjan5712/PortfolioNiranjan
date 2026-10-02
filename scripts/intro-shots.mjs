import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/intro', theme = 'light', width = '1440'] = process.argv.slice(2)

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, colorScheme: theme })
await page.goto(url)
await page.getByTestId('loader').waitFor({ state: 'detached', timeout: 10000 })
await page.waitForTimeout(600)

const top = await page.evaluate(() => document.querySelector('#intro').getBoundingClientRect().top + window.scrollY)
const vh = 900
for (const [name, offset] of [
  ['enter', top - vh * 0.7],
  ['mid', top - vh * 0.45],
  ['full', top - vh * 0.1],
]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(offset))
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `${out}/${width}-${theme}-${name}.png` })
}

await page.getByRole('button', { name: 'Play intro with sound' }).click()
await page.waitForTimeout(1500)
const state = await page.evaluate(() => {
  const v = document.querySelector('#intro video')
  return { muted: v.muted, paused: v.paused, controls: v.controls, time: v.currentTime.toFixed(1) }
})
console.log('after play', state)
await page.screenshot({ path: `${out}/${width}-${theme}-playing.png` })
await browser.close()
