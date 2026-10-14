import { TRIANGLES } from '../lib/formulas.js'

/** Wybór piramidy do ćwiczeń: każda osobno albo wszystkie razem. */
export const PYRAMID_CHOICES = [
  { id: 'all', label: '🔀 Wszystkie piramidy' },
  // podpisujemy wzorem na wielkość z nazwy piramidy, jak na lekcji (U = E / q, I = q / t…)
  ...TRIANGLES.map((t) => ({ id: t.id, label: `${t.title}: ${t.formulas[{ E: 'U', q: 'I' }[t.id] ?? t.id]}` })),
]

export const poolFor = (id) => (id === 'all' ? TRIANGLES : TRIANGLES.filter((t) => t.id === id))

export default function PyramidPicker({ value, onChange }) {
  return (
    <div className="pyramid-picker" role="group" aria-label="Wybierz piramidę">
      {PYRAMID_CHOICES.map((c) => (
        <button key={c.id} className={`chip ${value === c.id ? 'active' : ''}`} onClick={() => onChange(c.id)}>
          {c.label}
        </button>
      ))}
    </div>
  )
}

/** Podpowiedź: ukryta piramida, którą można odsłonić – wtedy zadanie jest bez punktu. */
export function HintButton({ onReveal }) {
  return (
    <button className="chip hint-chip" onClick={onReveal}>
      💡 Nie pamiętasz? Odsłoń piramidę (to zadanie będzie bez punktu)
    </button>
  )
}
