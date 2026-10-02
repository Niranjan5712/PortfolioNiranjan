import { chromium } from '@playwright/test'

const [url = 'http://localhost:5173/', out = 'test-results/loader', width = '1440'] = process.argv.slice(2)
const isMobile = Number(width) < 640

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: isMobile ? 844 : 900 },
  hasTouch: isMobile,
  isMobile,
})

async function frozenShot(name) {
  await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()))
  await page.screenshot({ path: `${out}/${width}-${name}.png` })
  await page.evaluate(() => document.getAnimations().forEach((a) => a.play()))
}

async function waitForGreeting(text) {
  await page.waitForFunction(
    (t) => document.querySelector('[data-testid="loader-greeting"]')?.textContent?.includes(t),
    text,
    { polling: 'raf' },
  )
}

await page.goto(url, { waitUntil: 'domcontentloaded' })
await waitForGreeting('Hello')
await page.waitForTimeout(450)
await frozenShot('1-hello')
for (const name of ['2-next', '3-later']) {
  const current = await page.getByTestId('loader-greeting').textContent()
  await page.waitForFunction(
    (t) => document.querySelector('[data-testid="loader-greeting"]')?.textContent !== t,
    current,
    { polling: 'raf' },
  )
  await page.waitForTimeout(130)
  await frozenShot(name)
}
await page.getByText('Niranjan’s portfolio').waitFor()
await page.waitForTimeout(700)
await page.screenshot({ path: `${out}/${width}-4-welcome.png` })
await page.locator('[data-phase="leaving"]').waitFor()
await page.waitForTimeout(400)
await page.screenshot({ path: `${out}/${width}-5-wipe.png` })

await page.reload({ waitUntil: 'domcontentloaded' })
await waitForGreeting('Hello')
await page.waitForTimeout(450)
await frozenShot('6-reload-hello')
await browser.close()
console.log('done')
