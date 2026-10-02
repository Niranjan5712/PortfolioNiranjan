import type { ReactElement } from 'react'
import { Magnetic } from '@/components/common/Magnetic'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Button } from '@/components/ui/button'
import type { NavLink } from '@/types/profile'

interface SiteNavProps {
  brand: string
  links: NavLink[]
}

export function SiteNav({ brand, links }: SiteNavProps): ReactElement {
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 border-b border-transparent bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 w-[min(1160px,100%-40px)] items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5 text-lg font-bold tracking-tight no-underline">
          <i className="size-3 rounded-full bg-[conic-gradient(var(--iris),var(--lagoon),var(--sun),var(--iris))]" />
          {brand}
        </a>
        <ul className="m-0 hidden list-none gap-6 p-0 text-[15px] md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-ink-soft no-underline transition-colors hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Magnetic strength={0.25}>
            <Button asChild size="pill-sm">
              <a href="#contact">Get in touch</a>
            </Button>
          </Magnetic>
        </div>
      </div>
      <ScrollProgress />
    </nav>
  )
}
