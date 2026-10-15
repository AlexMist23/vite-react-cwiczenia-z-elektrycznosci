import { Lightbulb, Shuffle } from 'lucide-react'
import { Chip } from './app/kit.jsx'
import { TRIANGLES } from '../lib/formulas.js'

/** Wybór piramidy do ćwiczeń: każda osobno albo wszystkie razem. */
export const PYRAMID_CHOICES = [
  { id: 'all', label: 'Wszystkie piramidy', icon: Shuffle },
  // podpisujemy wzorem na wielkość z nazwy piramidy, jak na lekcji (U = E / q, I = q / t…)
  ...TRIANGLES.map((t) => ({ id: t.id, label: `${t.title}: ${t.formulas[{ E: 'U', q: 'I' }[t.id] ?? t.id]}` })),
]

export const poolFor = (id) => (id === 'all' ? TRIANGLES : TRIANGLES.filter((t) => t.id === id))

export default function PyramidPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Wybierz piramidę">
      {PYRAMID_CHOICES.map((c) => (
        <Chip key={c.id} active={value === c.id} onClick={() => onChange(c.id)}>
          {c.icon && <c.icon />}
          {c.label}
        </Chip>
      ))}
    </div>
  )
}

/** Podpowiedź: ukryta piramida, którą można odsłonić – wtedy zadanie jest bez punktu. */
export function HintButton({ onReveal }) {
  return (
    <Chip className="w-fit" onClick={onReveal}>
      <Lightbulb />
      Nie pamiętasz? Odsłoń piramidę (to zadanie będzie bez punktu)
    </Chip>
  )
}
