import {
  activeBotMessage,
  chatReducer,
  INITIAL_CHAT,
  moodFor,
  nextTypedLength,
  typingDelay,
} from '@/lib/twin/chatState'

describe('chatReducer', () => {
  it('adds the question as done and starts thinking about the answer', () => {
    const s = chatReducer(INITIAL_CHAT, { type: 'ask', question: 'Hi?', answer: 'Hello.' })
    expect(s.messages).toEqual([
      { id: 1, role: 'user', text: 'Hi?', status: 'done' },
      { id: 2, role: 'bot', text: 'Hello.', status: 'thinking' },
    ])
    expect(s.nextId).toBe(3)
  })

  it('queues answers behind the one in progress and promotes them in order', () => {
    let s = chatReducer(INITIAL_CHAT, { type: 'say', text: 'one' })
    s = chatReducer(s, { type: 'say', text: 'two' })
    expect(s.messages.map((m) => m.status)).toEqual(['thinking', 'queued'])
    s = chatReducer(s, { type: 'advance', id: 1, status: 'typing' })
    expect(s.messages.map((m) => m.status)).toEqual(['typing', 'queued'])
    s = chatReducer(s, { type: 'advance', id: 1, status: 'done' })
    expect(s.messages.map((m) => m.status)).toEqual(['done', 'thinking'])
    expect(activeBotMessage(s.messages)?.text).toBe('two')
  })

  it('finishes instantly when motion is reduced', () => {
    const s = chatReducer(INITIAL_CHAT, { type: 'ask', question: 'Hi?', answer: 'Hello.', instant: true })
    expect(s.messages[1].status).toBe('done')
  })
})

describe('moodFor', () => {
  it('maps the active status to the avatar mood', () => {
    let s = chatReducer(INITIAL_CHAT, { type: 'say', text: 'x' })
    expect(moodFor(s.messages)).toBe('thinking')
    s = chatReducer(s, { type: 'advance', id: 1, status: 'typing' })
    expect(moodFor(s.messages)).toBe('talking')
    s = chatReducer(s, { type: 'advance', id: 1, status: 'done' })
    expect(moodFor(s.messages)).toBe('idle')
  })
})

describe('typing rhythm', () => {
  it('pauses longer after sentence ends, commas and line breaks', () => {
    expect(typingDelay('.')).toBeGreaterThan(typingDelay(','))
    expect(typingDelay(',')).toBeGreaterThan(typingDelay('a'))
    expect(typingDelay('\n')).toBeGreaterThan(typingDelay('a'))
  })

  it('always advances and never overshoots', () => {
    expect(nextTypedLength(0, 10, 0)).toBe(1)
    expect(nextTypedLength(9, 10, 3)).toBe(10)
  })
})
