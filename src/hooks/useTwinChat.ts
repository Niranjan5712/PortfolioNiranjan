import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { TWIN_GREETING } from '@/data/twin'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { answerQuestion, fallbackAnswer } from '@/lib/twin/answerEngine'
import {
  activeBotMessage,
  chatReducer,
  INITIAL_CHAT,
  MESSAGE_STATUS,
  moodFor,
  type ChatMessage,
  type TwinMood,
} from '@/lib/twin/chatState'
import type { Profile } from '@/types/profile'

export interface TwinChat {
  messages: ChatMessage[]
  mood: TwinMood
  isOpen: boolean
  hasOpened: boolean
  open: (question?: string) => void
  close: () => void
  ask: (question: string) => void
  finishTyping: (id: number) => void
}

export function thinkingMs(text: string): number {
  return 520 + Math.min(text.length, 240) * 1.5
}

export function useTwinChat(profile: Profile): TwinChat {
  const instant = usePrefersReducedMotion()
  const [state, dispatch] = useReducer(chatReducer, INITIAL_CHAT)
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const hasGreeted = useRef(false)

  const active = activeBotMessage(state.messages)
  const activeId = active?.id
  const activeStatus = active?.status
  const activeText = active?.text ?? ''

  useEffect(() => {
    if (activeId === undefined || activeStatus !== MESSAGE_STATUS.thinking) return
    const id = window.setTimeout(
      () => dispatch({ type: 'advance', id: activeId, status: MESSAGE_STATUS.typing }),
      thinkingMs(activeText),
    )
    return () => window.clearTimeout(id)
  }, [activeId, activeStatus, activeText])

  const ask = useCallback(
    (question: string): void => {
      const q = question.trim()
      if (!q) return
      const answer = answerQuestion(q, profile) ?? fallbackAnswer(profile.contact.email)
      dispatch({ type: 'ask', question: q, answer, instant })
    },
    [profile, instant],
  )

  const open = useCallback(
    (question?: string): void => {
      setIsOpen(true)
      setHasOpened(true)
      const q = question?.trim()
      if (q) ask(q)
      else if (!hasGreeted.current) dispatch({ type: 'say', text: TWIN_GREETING, instant })
      hasGreeted.current = true
    },
    [ask, instant],
  )

  const close = useCallback((): void => setIsOpen(false), [])

  const finishTyping = useCallback(
    (id: number): void => dispatch({ type: 'advance', id, status: MESSAGE_STATUS.done }),
    [],
  )

  return { messages: state.messages, mood: moodFor(state.messages), isOpen, hasOpened, open, close, ask, finishTyping }
}
