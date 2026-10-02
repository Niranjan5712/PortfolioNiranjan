import type { SuggestedQuestion } from '@/types/profile'

export const BOT_NAME = 'Ninja'

export const TWIN_GREETING =
  "Hi! 👋 I'm Ninja, Niranjan's AI assistant. Ask me about his AI products, how he works, his awards or how to reach him."

export const TWIN_SHORT_HELLO = "Hi! I'm Ninja. Ask me about Niranjan's products, experience, awards or contact details."

export const TWIN_SUGGESTIONS: string[] = [
  'Who is Niranjan?',
  'What has he built?',
  'Tell me about Talk to DB',
  'How does he prioritise?',
  'What awards has he won?',
  'Why product after engineering?',
  'Top skills?',
  'How do I contact him?',
]

export const TWIN_TEASERS: SuggestedQuestion[] = [
  { label: "Hi 👋 I'm Ninja. Ask me anything about Niranjan's work.", question: '' },
  { label: 'Curious about the 8 AI products he has shipped?', question: 'What has he built?' },
  { label: 'Ask me why he moved from engineering to product.', question: 'Why product after engineering?' },
  { label: 'He won a Best Innovation award from the Indian Army. Want the story?', question: 'What awards has he won?' },
  { label: 'Need his contact details? Just ask.', question: 'How do I contact him?' },
]
