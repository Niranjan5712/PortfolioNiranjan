import { GREETINGS, LOADER_TIMING, greetingDelay, greetingsDurationMs } from '@/lib/loaderSequence'

describe('GREETINGS', () => {
  it('opens with Hello and greets in Indian and international scripts', () => {
    expect(GREETINGS).toHaveLength(12)
    expect(GREETINGS[0].text).toBe('Hello')
    const texts = GREETINGS.map((g) => g.text)
    expect(texts).toEqual(expect.arrayContaining(['வணக்கம்', 'नमस्ते', 'నమస్కారం', 'നമസ്കാരം', 'こんにちは', 'مرحبا']))
    expect(GREETINGS.find((g) => g.lang === 'ar')?.dir).toBe('rtl')
    expect(new Set(texts).size).toBe(GREETINGS.length)
  })
})

describe('greeting timing', () => {
  it('holds the first greeting longer, then steps through the rest slowly enough to read', () => {
    expect(greetingDelay(0)).toBe(LOADER_TIMING.firstGreetingMs)
    expect(greetingDelay(5)).toBe(LOADER_TIMING.greetingMs)
    expect(greetingDelay(0)).toBeGreaterThan(greetingDelay(1))
    expect(LOADER_TIMING.greetingMs).toBeGreaterThanOrEqual(200)
  })

  it('keeps the whole greeting run around 3 seconds', () => {
    expect(greetingsDurationMs()).toBe(LOADER_TIMING.firstGreetingMs + 11 * LOADER_TIMING.greetingMs)
    expect(greetingsDurationMs()).toBeLessThanOrEqual(3200)
  })
})
