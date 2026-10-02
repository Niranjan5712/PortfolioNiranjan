import { profile } from '@/data/profile'
import { TWIN_SHORT_HELLO, TWIN_SUGGESTIONS } from '@/data/twin'
import { answerQuestion, fallbackAnswer, listText, mentions } from '@/lib/twin/answerEngine'

function ask(q: string): string {
  return answerQuestion(q, profile) ?? ''
}

const SAMPLE_QUESTIONS = [
  ...TWIN_SUGGESTIONS,
  'What is SARA?',
  'Tell me about the Examiner',
  'Which defence products?',
  'How does he handle bugs in the backlog?',
  'What are his hobbies?',
  'Where is he based?',
  'What does he do now?',
  'Show me his metrics',
]

describe('mentions', () => {
  it('matches keywords at the start of a word only', () => {
    expect(mentions('what awards?', ['award'])).toBe(true)
    expect(mentions('any feedback?', ['db'])).toBe(false)
    expect(mentions('talk to db please', ['db'])).toBe(true)
  })
})

describe('listText', () => {
  it('joins items the way people say them', () => {
    expect(listText(['a'])).toBe('a')
    expect(listText(['a', 'b'])).toBe('a and b')
    expect(listText(['a', 'b', 'c'])).toBe('a, b and c')
  })
})

describe('answerQuestion', () => {
  it('answers every built-in suggestion', () => {
    TWIN_SUGGESTIONS.forEach((q) => expect(answerQuestion(q, profile)).not.toBeNull())
  })

  it('keeps every answer short enough to read at a glance', () => {
    SAMPLE_QUESTIONS.forEach((q) => {
      const a = ask(q)
      expect(a.split('\n').length).toBeLessThanOrEqual(4)
      expect(a.length).toBeLessThanOrEqual(320)
    })
  })

  it('talks about Niranjan in the third person', () => {
    SAMPLE_QUESTIONS.forEach((q) => expect(ask(q)).not.toMatch(/\b(I'm|I am|my|I've)\b/))
  })

  it('greets short hellos', () => {
    expect(ask('hey')).toBe(TWIN_SHORT_HELLO)
  })

  it('replies in friendly sentences, never as labelled fields or bullet lists', () => {
    SAMPLE_QUESTIONS.forEach((q) => {
      const a = ask(q)
      expect(a).not.toMatch(/^(Problem|Solution|Impact|Email|Phone|LinkedIn|Product|AI product|Analytics):/m)
      expect(a).not.toContain('•')
      expect(a).toMatch(/[.!?]$/)
    })
  })

  it('explains a named product in plain language, keeping the hedged impact', () => {
    const a = ask('Tell me about Talk to DB')
    expect(a).toContain('Xerago')
    expect(a).toContain('plain English')
    expect(a).toMatch(/designed to block 100% of unsafe queries/)
    expect(ask('what is SARA?')).toContain('85 years')
    expect(ask('Tell me about the Examiner')).toContain('an estimated 50–60%')
  })

  it('has a friendly summary for every product', () => {
    profile.products.forEach((p) => {
      const a = ask(`Tell me about ${p.name}`)
      expect(a).toBe(p.twinSummary)
      expect(a.length).toBeLessThanOrEqual(320)
    })
  })

  it('lists every product by name for list-style questions', () => {
    const a = ask('What has he built?')
    profile.products.forEach((p) => expect(a).toContain(p.shortName))
  })

  it('answers awards, contact, education and skills from the profile', () => {
    expect(ask('What awards has he won?')).toContain('Best Innovation Award')
    expect(ask('How do I contact him?')).toContain(profile.contact.email)
    expect(ask('Where did he study?')).toContain('SRM University')
    expect(ask('Where did he study?')).not.toMatch(/cgpa|9\.34/i)
    expect(ask('Top skills?')).toMatch(/product discovery/i)
  })

  it('explains prioritisation and backlog health', () => {
    expect(ask('How does he prioritise?')).toContain('10+')
    expect(ask('How does he handle bugs in the backlog?')).toContain('75%')
  })

  it('prefers the specific answer over the generic list', () => {
    expect(ask('Which defence products?')).toContain('Examiner Intelligence System')
    expect(ask('Does he know RAG systems?')).toContain('RAG pipelines')
  })

  it('returns null when the resume has no answer', () => {
    expect(answerQuestion('What is your favourite colour?', profile)).toBeNull()
    expect(answerQuestion('   ', profile)).toBeNull()
  })

  it('offers a polite fallback with the email', () => {
    expect(fallbackAnswer('a@b.c')).toContain('a@b.c')
  })
})
