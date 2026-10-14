import { useState } from 'react'
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
    <div className="pyr-choice">
      <div className="pyr-options">
        {TRIANGLES.map((tri) => (
          <button
            key={tri.id}
            className={`pyr-option ${wrong.includes(tri.id) ? 'wrong' : ''} ${done && tri === correct ? 'right' : ''}`}
            onClick={() => choose(tri)}
            disabled={done || wrong.includes(tri.id)}
            aria-label={`Piramida z literami ${letters(tri).join(', ')}`}
          >
            <Pyramid cells={letters(tri).map((l) => ({ label: l }))} />
          </button>
        ))}
      </div>
      {last && last !== correct && !done && (
        <div className="feedback bad">
          W tej piramidzie nie ma: {missing.map((l) => `${l} (${NAMES[l][0]})`).join(', ')}. Szukaj piramidy, w której
          są wszystkie wielkości z zadania: {needed.join(', ')}.
        </div>
      )}
      {done && (
        <div className="feedback ok">
          {wrong.length === 0 ? 'Dobrze! ' : 'Teraz dobrze. '}W tej piramidzie są wszystkie wielkości z zadania:{' '}
          {needed.join(', ')}.
        </div>
      )}
    </div>
  )
}
