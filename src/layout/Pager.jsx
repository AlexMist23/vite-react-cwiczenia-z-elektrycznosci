import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PAGES } from '@/data/sections.js'

/** Przyciski „poprzedni / następny” – przez wszystkie podstrony po kolei. */
export default function Pager({ section, sub }) {
  const idx = PAGES.findIndex((p) => p.s === section && p.u === sub)
  const prev = idx > 0 ? PAGES[idx - 1] : null
  const next = idx >= 0 && idx < PAGES.length - 1 ? PAGES[idx + 1] : null
  // w obrębie działu pokazujemy nazwę podstrony, a przy przejściu do innego działu – nazwę działu
  const label = (p) => (p.u && p.s === section ? p.u.title : p.s.title)

  return (
    <nav className="mt-10 grid grid-cols-2 gap-3" aria-label="Kolejne strony">
      {prev ? (
        <PagerLink href={`#${prev.hash}`} hint={prev.s === section ? 'Wcześniej w tym dziale' : 'Poprzedni dział'} label={label(prev)} />
      ) : (
        <span />
      )}
      {next && (
        <PagerLink next href={`#${next.hash}`} hint={next.s === section ? 'Dalej w tym dziale' : 'Następny dział'} label={label(next)} />
      )}
    </nav>
  )
}

function PagerLink({ href, hint, label, next = false }) {
  const Icon = next ? ChevronRight : ChevronLeft
  return (
    <a
      href={href}
      className={cn(
        'group flex items-center gap-2 rounded-xl border bg-card p-3 shadow-xs transition-colors hover:border-(--sec) md:p-4',
        next && 'col-start-2 flex-row-reverse text-right',
      )}
    >
      <Icon className="size-5 shrink-0 text-muted-foreground group-hover:text-(--sec)" />
      <span className="flex min-w-0 flex-col">
        <small className="text-xs text-muted-foreground">{hint}</small>
        <span className="truncate font-medium">{label}</span>
      </span>
    </a>
  )
}
