import '@testing-library/jest-dom'
import { MockIntersectionObserver } from '@/test/intersectionObserver'

window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

window.ResizeObserver = class {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

window.HTMLMediaElement.prototype.load = (): void => {}
window.HTMLMediaElement.prototype.play = (): Promise<void> => Promise.resolve()
window.HTMLMediaElement.prototype.pause = (): void => {}
window.HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement['getContext']
