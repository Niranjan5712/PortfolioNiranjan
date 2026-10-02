import { TWIN_SHORT_HELLO } from '@/data/twin'
import type { Product, Profile } from '@/types/profile'

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** True when any keyword starts a word in the question ("award" matches "awards", "db" does not match "feedback"). */
export function mentions(question: string, words: readonly string[]): boolean {
  return words.some((w) => new RegExp(`(^|[^a-z0-9])${escapeRegExp(w)}`).test(question))
}

/** "a, b and c" */
export function listText(items: readonly string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

/** "Product Discovery" → "product discovery", but acronyms like "AI" or "PRD" stay. */
function casual(skill: string): string {
  return skill.replace(/\b[A-Z][a-z]+\b/g, (w) => w.toLowerCase())
}

function findProduct(q: string, products: Product[]): Product | undefined {
  return products.find(
    (p) => mentions(q, p.keywords) || q.includes(p.name.toLowerCase()) || q.includes(p.shortName.toLowerCase()),
  )
}

function skillsAnswer(p: Profile): string {
  return [
    `On the product side, he is strongest at ${listText(p.skills.product.slice(0, 4).map(casual))}.`,
    `For AI products, he brings ${listText(p.skills.aiProduct.slice(1, 5).map(casual))}.`,
    `He is also hands-on with ${listText(p.skills.analytics.slice(3, 6))}.`,
  ].join(' ')
}

function awardsAnswer(p: Profile): string {
  const lines = p.awards.map((a) => {
    const issuer = a.issuer.split(',').slice(-1)[0].trim()
    return `The ${issuer} gave him the ${a.title} ${lowerFirst(a.detail)}`
  })
  return `He has ${p.awards.length} defence recognitions. ${lines.join(' ')}`
}

function defenceAnswer(p: Profile): string {
  const defence = p.products.filter((pr) => pr.sector === 'Defence')
  const clients = [...new Set(defence.map((pr) => pr.client))]
  const parts = clients.map(
    (c) => `${listText(defence.filter((pr) => pr.client === c).map((pr) => pr.name.split(',')[0]))} for the ${c}`,
  )
  return `He has built ${defence.length} defence products: ${parts.join(', plus ')}.`
}

function rolesAnswer(p: Profile): string {
  const [current, ...past] = p.roles
  const since = current.period.split('–')[0].trim()
  const company = (r: Profile['roles'][number]): string => r.company.split(',')[0]
  const titles = [...new Set(past.map((r) => r.title))]
  const before =
    titles.length === 1
      ? `an ${titles[0]} at ${listText(past.map(company))}`
      : listText(past.map((r) => `an ${r.title} at ${company(r)}`))
  return `He is currently an ${current.title} at ${company(current)} (since ${since}). Before that, he was ${before}.`
}

function prAnswer(p: Profile): string {
  const [artists, shows] = p.beyond.numbers
  return `Outside tech, he runs PR for live events. He has coordinated ${artists.value}${artists.suffix} artists across ${shows.value}${shows.suffix} concerts and shows, positioning them much like a product launch.`
}

function statsAnswer(p: Profile): string {
  return `A few numbers: ${listText(p.stats.map((s) => `${s.value}${s.suffix ?? ''} ${s.label}`))}.`
}

const LIST_INTENT = ['all', 'list', 'which products', 'what products', 'ai products', 'products', 'built', 'build']

export function answerQuestion(raw: string, p: Profile): string | null {
  const q = raw.toLowerCase().trim()
  if (!q) return null
  if (/^(hi|hello|hey|hii+)\b/.test(q) && q.length < 14) return TWIN_SHORT_HELLO

  const product = findProduct(q, p.products)
  if (product && !mentions(q, LIST_INTENT)) return product.twinSummary

  if (mentions(q, ['contact', 'email', 'reach', 'phone', 'call', 'linkedin', 'github', 'connect', 'hire']))
    return `The easiest way is email: ${p.contact.email}. You can also call him on ${p.contact.phone} or connect on LinkedIn at ${p.contact.linkedin.replace(/^https?:\/\/(www\.)?/, '')}.`

  if (mentions(q, ['award', 'recogni', 'won', 'achiev', 'honou', 'honor'])) return awardsAnswer(p)

  if (mentions(q, ['educat', 'degree', 'college', 'university', 'srm', 'master', 'study', 'studied']))
    return `He holds an ${p.education.degree.replace(/^(\S+\.)\s/, '$1 in ')} from ${p.education.school} (${p.education.period}). It covered ${lowerFirst(p.education.coursework)}`

  if (mentions(q, ['why pm', 'why product', 'engineer to', 'engineering', 'switch', 'transition', 'became', 'move into']))
    return 'He started as an AI engineer building RAG and vision systems, and noticed the hardest problems were about what to build. So he moved into product. His engineering background keeps his specs realistic.'

  if (mentions(q, ['prioriti', 'roadmap', 'idea', 'discover', 'decide', 'say no']))
    return 'He weighs every idea on the same evidence: who has the problem, how badly, and what already exists. At Xerago that turned 10+ leadership ideas into 5 delivered products.'

  if (mentions(q, ['sop', 'root cause', 'root-cause', 'bug', 'backlog', '75']))
    return 'He wrote a root-cause process for recurring bugs, so the team fixes the cause rather than the symptom. It is now used company-wide and has resolved 75% of the issues it found.'

  if (mentions(q, ['skill', 'tool', 'stack', 'strength', 'good at', 'tech'])) return skillsAnswer(p)

  if (mentions(q, ['defence', 'defense', 'army', 'navy', 'military'])) return defenceAnswer(p)

  if (mentions(q, ['product', 'project', 'built', 'build', 'portfolio', 'work on', 'shipped', 'delivered', 'made']))
    return `He has shipped ${p.products.length} AI products: ${listText(p.products.map((pr) => pr.shortName))}. Ask me about any one of them!`

  if (mentions(q, ['ship', 'deliver', 'launch', 'last mile']))
    return 'He prototypes early, writes specs engineers trust, and stays with a product all the way through compliance and support.'

  if (mentions(q, ['rag', 'llm', 'hallucin', 'ai engineer', 'model', 'ocr', 'yolo']))
    return 'Yes, he started as an AI engineer. He built RAG pipelines and LLM integrations that cut the hallucination rate by 5%, and OCR + RAG systems that turn documents into structured data. He has also trained YOLO and CNN vision models.'

  if (mentions(q, ['current', 'xerago', 'now', 'present', 'today', 'analyst', 'role', 'job', 'bonbloc']))
    return rolesAnswer(p)

  if (mentions(q, ['compliance', 'gdpr', 'soc', 'governance', 'privacy']))
    return 'He handles data governance on every product, including GDPR and SOC 2 documentation. The Customer Journey Assister is even self-hosted, so client data stays private.'

  if (mentions(q, ['pr ', 'pr?', 'public relation', 'event', 'celebr', 'concert', 'outside work'])) return prAnswer(p)

  if (mentions(q, ['hobby', 'hobbies', 'interest', 'free time', 'fun']))
    return `When he is offline, he enjoys ${listText(p.beyond.interests.map((i) => i.replace(/^\P{L}+/u, '').toLowerCase()))}. It keeps his thinking fresh.`

  if (mentions(q, ['metric', 'result', 'impact', 'number'])) return statsAnswer(p)

  if (mentions(q, ['who', 'experience', 'career', 'summar', 'background', 'about', 'resume', '30-second', 'years', 'niranjan']))
    return 'Niranjan is an AI product manager who started out as an AI engineer. He has shipped 8 AI products for enterprise clients, the Indian Army and the Indian Navy.'

  if (mentions(q, ['where', 'location', 'based', 'relocat', 'remote', 'city'])) return `He is based in ${p.contact.location}.`

  const skillNames = Object.values(p.skills)
    .flat()
    .map((s) => s.toLowerCase())
  if (mentions(q, skillNames)) return skillsAnswer(p)

  return null
}

export function fallbackAnswer(email: string): string {
  return `Hmm, I don't have that one yet. Try asking about his products, experience, awards or skills, or email him at ${email}.`
}
