import { useEffect, useState, type ReactElement } from 'react'
import { nextTypedLength, typingDelay } from '@/lib/twin/chatState'

interface TypedTextProps {
  text: string
  isTyping: boolean
  onDone: () => void
  onProgress?: () => void
}

const BURST = 2
const SETTLE_MS = 120

export function TypedText({ text, isTyping, onDone, onProgress }: TypedTextProps): ReactElement {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!isTyping) return
    const isComplete = shown >= text.length
    const id = window.setTimeout(
      () => (isComplete ? onDone() : setShown((n) => nextTypedLength(n, text.length, BURST))),
      isComplete ? SETTLE_MS : typingDelay(text[shown - 1]),
    )
    return () => window.clearTimeout(id)
  }, [isTyping, shown, text, onDone])

  useEffect(() => {
    if (isTyping) onProgress?.()
  }, [isTyping, shown, onProgress])

  if (!isTyping) return <>{text}</>

  return (
    <>
      {text.slice(0, shown)}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current align-baseline" aria-hidden />
    </>
  )
}
