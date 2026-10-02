export const MESSAGE_STATUS = {
  queued: 'queued',
  thinking: 'thinking',
  typing: 'typing',
  done: 'done',
} as const

export type MessageStatus = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS]

export const TWIN_MOODS = {
  idle: 'idle',
  thinking: 'thinking',
  talking: 'talking',
} as const

export type TwinMood = (typeof TWIN_MOODS)[keyof typeof TWIN_MOODS]

export interface ChatMessage {
  id: number
  role: 'user' | 'bot'
  text: string
  status: MessageStatus
}

export interface ChatState {
  messages: ChatMessage[]
  nextId: number
}

export type ChatAction =
  | { type: 'ask'; question: string; answer: string; instant?: boolean }
  | { type: 'say'; text: string; instant?: boolean }
  | { type: 'advance'; id: number; status: MessageStatus }

export const INITIAL_CHAT: ChatState = { messages: [], nextId: 1 }

/** The bot message currently being worked on: the first one that is not finished. */
export function activeBotMessage(messages: ChatMessage[]): ChatMessage | undefined {
  return messages.find((m) => m.role === 'bot' && m.status !== MESSAGE_STATUS.done)
}

function botMessage(state: ChatState, id: number, text: string, instant = false): ChatMessage {
  const status = instant
    ? MESSAGE_STATUS.done
    : activeBotMessage(state.messages)
      ? MESSAGE_STATUS.queued
      : MESSAGE_STATUS.thinking
  return { id, role: 'bot', text, status }
}

function promoteNext(messages: ChatMessage[]): ChatMessage[] {
  if (messages.some((m) => m.role === 'bot' && (m.status === MESSAGE_STATUS.thinking || m.status === MESSAGE_STATUS.typing)))
    return messages
  const next = messages.find((m) => m.status === MESSAGE_STATUS.queued)
  return next ? messages.map((m) => (m === next ? { ...m, status: MESSAGE_STATUS.thinking } : m)) : messages
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ask':
      return {
        nextId: state.nextId + 2,
        messages: [
          ...state.messages,
          { id: state.nextId, role: 'user', text: action.question, status: MESSAGE_STATUS.done },
          botMessage(state, state.nextId + 1, action.answer, action.instant),
        ],
      }
    case 'say':
      return {
        nextId: state.nextId + 1,
        messages: [...state.messages, botMessage(state, state.nextId, action.text, action.instant)],
      }
    case 'advance':
      return {
        ...state,
        messages: promoteNext(state.messages.map((m) => (m.id === action.id ? { ...m, status: action.status } : m))),
      }
  }
}

export function moodFor(messages: ChatMessage[]): TwinMood {
  const active = activeBotMessage(messages)
  if (active?.status === MESSAGE_STATUS.thinking) return TWIN_MOODS.thinking
  if (active?.status === MESSAGE_STATUS.typing) return TWIN_MOODS.talking
  return TWIN_MOODS.idle
}

export function typingDelay(char: string | undefined): number {
  if (!char) return 16
  if (/[.!?]/.test(char)) return 170
  if (/[,;:]/.test(char)) return 80
  if (char === '\n') return 110
  return 16
}

export function nextTypedLength(shown: number, total: number, burst: number): number {
  return Math.min(total, shown + Math.max(1, burst))
}
