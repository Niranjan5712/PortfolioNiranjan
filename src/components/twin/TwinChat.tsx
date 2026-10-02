import { ArrowUp, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactElement } from 'react'
import { BotFace } from '@/components/common/BotFace'
import { TypedText } from '@/components/twin/TypedText'
import { BOT_NAME } from '@/data/twin'
import { useCycle } from '@/hooks/useCycle'
import type { TwinChat as TwinChatState } from '@/hooks/useTwinChat'
import type { ChatMessage } from '@/lib/twin/chatState'
import { cn } from '@/lib/utils'
import type { SuggestedQuestion } from '@/types/profile'

interface TwinChatProps {
  chat: TwinChatState
  suggestions: string[]
  teasers: SuggestedQuestion[]
}

const TEASER_DELAY_MS = 4500
const TEASER_CYCLE_MS = 8000
const PANEL_LABEL = `Chat with ${BOT_NAME}`
const STATUS_TEXT = { idle: 'Online now', thinking: 'Thinking…', talking: 'Typing…' } as const

function lastAnswer(messages: ChatMessage[]): string {
  return [...messages].reverse().find((m) => m.role === 'bot' && m.status === 'done')?.text ?? ''
}

interface MessageRowProps {
  message: ChatMessage
  onTyped: (id: number) => void
  onProgress: () => void
}

function MessageRow({ message, onTyped, onProgress }: MessageRowProps): ReactElement {
  const handleDone = useCallback(() => onTyped(message.id), [onTyped, message.id])

  if (message.role === 'user')
    return (
      <li className="ml-auto max-w-[85%] rounded-[20px] rounded-br-md bg-iris px-4 py-2.5 text-[15px] leading-snug text-white motion-safe:animate-fade-up motion-safe:[animation-duration:.45s]">
        {message.text}
      </li>
    )

  return (
    <li className="flex max-w-[92%] items-end gap-2 motion-safe:animate-fade-up motion-safe:[animation-duration:.45s]">
      <BotFace className="size-7 shrink-0" />
      {message.status === 'thinking' ? (
        <span
          className="flex items-center gap-1 rounded-[20px] rounded-bl-md border border-line bg-surface px-4 py-3.5"
          data-testid="twin-thinking"
        >
          <span className="sr-only">Thinking</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden
              className="size-1.5 rounded-full bg-iris motion-safe:animate-typing-dot"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      ) : (
        <p
          className="m-0 rounded-[20px] rounded-bl-md border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line text-ink"
          data-testid="twin-answer"
        >
          <TypedText text={message.text} isTyping={message.status === 'typing'} onDone={handleDone} onProgress={onProgress} />
        </p>
      )}
    </li>
  )
}

export function TwinChat({ chat, suggestions, teasers }: TwinChatProps): ReactElement {
  const { isOpen, hasOpened, messages, mood, open, close, ask, finishTyping } = chat
  const launcherRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)
  const [draft, setDraft] = useState('')
  const [isTeaserReady, setIsTeaserReady] = useState(false)
  const [isTeaserDismissed, setIsTeaserDismissed] = useState(false)

  const showTeaser = isTeaserReady && !isTeaserDismissed && !hasOpened
  const teaserIndex = useCycle(teasers.length, TEASER_CYCLE_MS, showTeaser)
  const teaser = teasers[teaserIndex]

  useEffect(() => {
    const id = window.setTimeout(() => setIsTeaserReady(true), TEASER_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const typesWithKeyboard = window.matchMedia('(pointer: fine)').matches
      ;(typesWithKeyboard ? inputRef.current : panelRef.current)?.focus({ preventScroll: true })
    } else if (wasOpen.current) launcherRef.current?.focus({ preventScroll: true })
    wasOpen.current = isOpen
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  const scrollToEnd = useCallback((): void => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [])

  useEffect(scrollToEnd, [messages, scrollToEnd])

  function submit(e: FormEvent): void {
    e.preventDefault()
    ask(draft)
    setDraft('')
  }

  return (
    <>
      {showTeaser && teaser && (
        <div
          key={teaserIndex}
          className="fixed right-5 bottom-[96px] z-[70] flex max-w-[min(300px,calc(100vw-40px))] items-start gap-1 rounded-[20px] rounded-br-md border border-line bg-surface py-2 pr-2 pl-4 text-left shadow-[0_20px_50px_-20px_color-mix(in_srgb,var(--iris)_60%,transparent)] motion-safe:animate-fade-up motion-safe:[animation-duration:.6s]"
          data-testid="twin-teaser"
        >
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-0 py-1 text-left text-[14px] leading-snug font-medium text-ink"
            onClick={() => open(teaser.question || undefined)}
          >
            {teaser.label}
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-ink-soft hover:bg-muted"
            onClick={() => setIsTeaserDismissed(true)}
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        aria-label={isOpen ? 'Minimise chat' : PANEL_LABEL}
        aria-expanded={isOpen}
        aria-controls="twin-panel"
        data-open={isOpen}
        className="group/launcher fixed right-5 bottom-5 z-[70] grid size-16 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 max-sm:data-[open=true]:hidden"
        onClick={() => (isOpen ? close() : open())}
      >
        <span className="col-start-1 row-start-1 size-full transition-[transform,opacity] duration-500 ease-out-expo group-data-[open=true]/launcher:scale-50 group-data-[open=true]/launcher:rotate-90 group-data-[open=true]/launcher:opacity-0">
          <span className="block size-full motion-safe:animate-float">
            <BotFace className="size-full drop-shadow-[0_14px_18px_rgba(90,72,245,.45)]" mood={mood} followPointer={!isOpen} />
          </span>
        </span>
        <span className="col-start-1 row-start-1 grid size-14 scale-50 -rotate-90 place-items-center rounded-full bg-iris text-white opacity-0 shadow-[0_14px_30px_-8px_rgba(90,72,245,.7)] transition-[transform,opacity] duration-500 ease-out-expo group-data-[open=true]/launcher:scale-100 group-data-[open=true]/launcher:rotate-0 group-data-[open=true]/launcher:opacity-100">
          <X className="size-6" />
        </span>
        {!hasOpened && (
          <span className="absolute top-0.5 right-0.5 grid size-5 place-items-center rounded-full bg-sun text-[11px] font-bold text-[#141833] motion-safe:animate-ping-sun" aria-hidden>
            1
          </span>
        )}
      </button>

      <div
        ref={panelRef}
        id="twin-panel"
        role="dialog"
        aria-label={PANEL_LABEL}
        tabIndex={-1}
        inert={!isOpen}
        data-state={isOpen ? 'open' : 'closed'}
        className={cn(
          'fixed inset-0 z-[65] flex flex-col overflow-hidden bg-background outline-none',
          'sm:inset-auto sm:right-5 sm:bottom-[100px] sm:h-[min(640px,calc(100dvh-130px))] sm:w-[400px] sm:rounded-[28px] sm:border sm:border-line sm:shadow-[0_40px_100px_-30px_color-mix(in_srgb,var(--iris)_55%,transparent)]',
          '[--ox:calc(100%-52px)] [--oy:calc(100%-52px)] sm:[--ox:calc(100%-32px)] sm:[--oy:calc(100%+48px)]',
          'invisible [clip-path:circle(0px_at_var(--ox)_var(--oy))] data-[state=open]:visible data-[state=open]:[clip-path:circle(150%_at_var(--ox)_var(--oy))]',
          'transition-[clip-path,visibility] duration-700 ease-out-expo motion-reduce:transition-none',
        )}
      >
        <header className="flex items-center gap-3 bg-[linear-gradient(135deg,var(--iris),#3B2BC4_60%,#2B1D8F)] px-5 py-4 text-white">
          <BotFace className="size-11 shrink-0" mood={mood} followPointer={isOpen} />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[16px] leading-tight font-semibold">
              {BOT_NAME} <span className="font-normal text-white/70">· Niranjan’s AI assistant</span>
            </p>
            <p className="m-0 mt-0.5 flex items-center gap-1.5 text-[13px] text-white/80" data-testid="twin-status">
              <span
                className={cn(
                  'size-2 rounded-full',
                  mood === 'idle' ? 'bg-lagoon motion-safe:animate-pulse-dot' : 'bg-sun motion-safe:animate-pulse',
                )}
                aria-hidden
              />
              {STATUS_TEXT[mood]}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close chat"
            className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white transition-colors hover:bg-white/25"
            onClick={close}
          >
            <X className="size-5" />
          </button>
        </header>

        <div ref={logRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-5" data-lenis-prevent>
          <ul className="m-0 flex list-none flex-col gap-3 p-0" aria-label="Conversation">
            {messages
              .filter((m) => m.status !== 'queued')
              .map((m) => (
                <MessageRow key={m.id} message={m} onTyped={finishTyping} onProgress={scrollToEnd} />
              ))}
          </ul>
        </div>

        <div className="sr-only" aria-live="polite" data-testid="twin-live">
          {lastAnswer(messages)}
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]" data-lenis-prevent>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="shrink-0 cursor-pointer rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap text-ink transition-colors hover:border-iris hover:text-iris"
              onClick={() => ask(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <form className="flex items-center gap-2 border-t border-line bg-surface px-4 py-3" onSubmit={submit}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Ask a question"
            placeholder="Ask about products, roles, awards…"
            maxLength={300}
            className="h-11 min-w-0 flex-1 rounded-full border border-line bg-background px-4 text-[15px] text-ink outline-none placeholder:text-ink-soft/70 focus:border-iris"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim()}
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-iris text-white transition-[transform,opacity] hover:scale-105 disabled:cursor-default disabled:opacity-40 disabled:hover:scale-100"
          >
            <ArrowUp className="size-5" />
          </button>
        </form>
      </div>
    </>
  )
}
