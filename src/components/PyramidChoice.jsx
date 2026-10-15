import { useState } from 'react'
import { Feedback } from './app/kit.jsx'
import { cn } from '@/lib/utils'
import Pyramid from './Pyramid.jsx'
import { NAMES, TRIANGLES, letters } from '../lib/formulas.js'

/**
 * Krok „dobierz piramidę”: uczeń wybiera, która z piramid pasuje do pytania.
 * needed – wielkości z pytania (szukana i dane). onDone(firstTry) – po dobrym wyborze.
 */
export default function PyramidChoice({ correct, needed, onDone }) {
  const [wrong, setWrong] = useState([])
  const [done, setDone] = useState(false)
  const [last, setLast] = useState(null)

  const choose = (tri) => {
    if (done || wrong.includes(tri.id)) return
    setLast(tri)
    if (tri === correct) {
      setDone(true)
      onDone(wrong.length === 0)
    } else {
      setWrong((w) => [...w, tri.id])
    }
  }

  const missing = last && last !== correct ? needed.filter((l) => !letters(last).includes(l)) : []

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {TRIANGLES.map((tri) => (
          <button
            key={tri.id}
            type="button"
            className={cn(
              'pyr-option rounded-xl border-2 bg-card p-2 transition-colors enabled:hover:border-sec enabled:hover:bg-primary-soft',
              wrong.includes(tri.id) && 'border-destructive bg-destructive-soft opacity-60',
              done && tri === correct && 'border-success bg-success-soft',
            )}
            onClick={() => choose(tri)}
            disabled={done || wrong.includes(tri.id)}
            aria-label={`Piramida z literami ${letters(tri).join(', ')}`}
          >
            <Pyramid cells={letters(tri).map((l) => ({ label: l }))} />
          </button>
        ))}
      </div>
      {last && last !== correct && !done && (
        <Feedback tone="bad">
          W tej piramidzie nie ma: {missing.map((l) => `${l} (${NAMES[l][0]})`).join(', ')}. Szukaj piramidy, w której
          są wszystkie wielkości z zadania: {needed.join(', ')}.
        </Feedback>
      )}
      {done && (
        <Feedback tone="ok">
          <div>
            {wrong.length === 0 ? 'Dobrze! ' : 'Teraz dobrze. '}W tej piramidzie są wszystkie wielkości z zadania:{' '}
            {needed.join(', ')}.
          </div>
        </Feedback>
      )}
    </div>
  )
}
