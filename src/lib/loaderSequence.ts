export interface Greeting {
  text: string
  lang: string
  dir?: 'rtl'
}

export const GREETINGS: readonly Greeting[] = [
  { text: 'Hello', lang: 'en' },
  { text: 'வணக்கம்', lang: 'ta' },
  { text: 'नमस्ते', lang: 'hi' },
  { text: 'నమస్కారం', lang: 'te' },
  { text: 'നമസ്കാരം', lang: 'ml' },
  { text: 'ನಮಸ್ಕಾರ', lang: 'kn' },
  { text: 'নমস্কার', lang: 'bn' },
  { text: 'Bonjour', lang: 'fr' },
  { text: 'Hola', lang: 'es' },
  { text: 'こんにちは', lang: 'ja' },
  { text: '안녕하세요', lang: 'ko' },
  { text: 'مرحبا', lang: 'ar', dir: 'rtl' },
]

export const LOADER_TIMING = {
  firstGreetingMs: 600,
  greetingMs: 230,
  welcomeMs: 1000,
  maxFontWaitMs: 1500,
  exitMs: 1000,
} as const

export function greetingDelay(index: number): number {
  return index === 0 ? LOADER_TIMING.firstGreetingMs : LOADER_TIMING.greetingMs
}

export function greetingsDurationMs(count: number = GREETINGS.length): number {
  return Array.from({ length: count }, (_, i) => greetingDelay(i)).reduce((a, b) => a + b, 0)
}
