type Callback = (entries: Array<Pick<IntersectionObserverEntry, 'isIntersecting' | 'target'>>) => void

interface ObserverRecord {
  callback: Callback
  targets: Set<Element>
}

const observers = new Set<ObserverRecord>()

export class MockIntersectionObserver {
  private record: ObserverRecord

  constructor(callback: Callback) {
    this.record = { callback, targets: new Set() }
    observers.add(this.record)
  }

  observe(target: Element): void {
    this.record.targets.add(target)
  }

  unobserve(target: Element): void {
    this.record.targets.delete(target)
  }

  disconnect(): void {
    observers.delete(this.record)
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

export function setIntersecting(target: Element, isIntersecting: boolean): void {
  observers.forEach((o) => {
    if (o.targets.has(target)) o.callback([{ isIntersecting, target }])
  })
}
