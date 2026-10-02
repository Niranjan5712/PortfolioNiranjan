export const ACCENTS = {
  iris: 'var(--iris)',
  lagoon: 'var(--lagoon)',
  sun: 'var(--sun)',
  rose: 'var(--rose)',
} as const

export type Accent = keyof typeof ACCENTS

export const PRODUCT_ICONS = {
  database: 'database',
  shield: 'shield',
  route: 'route',
  people: 'people',
  camera: 'camera',
  mic: 'mic',
  exam: 'exam',
  plane: 'plane',
} as const

export type ProductIcon = keyof typeof PRODUCT_ICONS

export interface NavLink {
  label: string
  href: string
}

export interface Hotspot {
  id: string
  title: string
  detail: string
  x: number
  y: number
  side: 'left' | 'right'
}

export interface HeroContent {
  badge: string
  firstName: string
  lastName: string
  roles: string[]
  pitch: string
  hotspots: Hotspot[]
}

export interface Stat {
  id: string
  value: number
  decimals?: number
  suffix?: string
  label: string
  detail: string
  accent: Accent
}

export interface ProcessStep {
  id: string
  title: string
  headline: string
  detail: string
}

export interface Principle {
  id: string
  area: string
  headline: string
  proof: string
  proofLabel: string
  detail: string
  accent: Accent
}

export interface ProductResult {
  value: string
  label: string
}

export interface Product {
  id: string
  name: string
  shortName: string
  tagline: string
  client: string
  sector: string
  status: string
  problem: string
  solution: string
  result: ProductResult
  /** What Ninja says about the product: plain, friendly, at most 320 characters. */
  twinSummary: string
  tags: string[]
  accent: Accent
  icon: ProductIcon
  keywords: string[]
  inFunnel?: boolean
}

export interface Role {
  id: string
  period: string
  title: string
  company: string
  highlights: string[]
}

export interface Education {
  degree: string
  school: string
  period: string
  coursework: string
}

export interface Award {
  id: string
  title: string
  issuer: string
  detail: string
  variant: 'iris' | 'lagoon'
}

export interface Contact {
  email: string
  phone: string
  phoneHref: string
  location: string
  linkedin: string
  github: string
}

export interface Skills {
  product: string[]
  aiProduct: string[]
  analytics: string[]
}

export interface BeyondNumber {
  id: string
  value: number
  suffix: string
  label: string
}

export interface Beyond {
  title: string
  detail: string
  numbers: BeyondNumber[]
  interests: string[]
}

export interface SuggestedQuestion {
  label: string
  question: string
}

export interface Profile {
  name: string
  title: string
  summary: string
  nav: NavLink[]
  hero: HeroContent
  stats: Stat[]
  process: ProcessStep[]
  principles: Principle[]
  products: Product[]
  roles: Role[]
  education: Education
  awards: Award[]
  skills: Skills
  beyond: Beyond
  contact: Contact
}
