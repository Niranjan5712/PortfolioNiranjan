import { chromium } from '@playwright/test'

const url = process.argv[2] ?? 'http://localhost:5173/'
const out = process.argv[3] ?? 'test-results/shots'
const theme = process.argv[4] ?? 'light'
const width = Number(process.argv[5] ?? 1440)

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch())
const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
const ids = await page.$$eval('main > [id], main > [role=region]', (els) => els.map((e, i) => e.id || `region-${i}`))
for (const id of ids) {
  const loc = id.startsWith('region-') ? page.locator('main > [role=region]').first() : page.locator(`#${id}`)
  await loc.screenshot({ path: `${out}/${width}-${theme}-${id}.png` })
}
await browser.close()
