import { useState } from 'react'
import { fmt, isClose, parseNum } from '../lib/physics.js'

/**
 * Zadanie z odpowiedzią liczbową.
 * generate() zwraca { q, answer, unit, explain, steps? }, gdzie steps to
 * { dane: [], szukane, wzor, obliczenia } – rozwiązanie w stylu zeszytu.
 */
export default function NumberTask({ generate, onResult }) {
  const [task, setTask] = useState(generate)
  const [value, setValue] = useState('')
  const [state, setState] = useState(null) // null | 'ok' | 'bad' | 'shown'
  const [tries, setTries] = useState(0)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const check = (e) => {
    e.preventDefault()
    if (state === 'ok' || state === 'shown') return
    const n = parseNum(value)
    if (Number.isNaN(n)) {
      setState('nan')
      return
    }
    const ok = isClose(n, task.answer, 0.005)
    // liczymy tylko pierwszą próbę
    if (tries === 0) {
      setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
      onResult?.(ok)
    }
    setTries((t) => t + 1)
    setState(ok ? 'ok' : 'bad')
  }

  const reveal = () => {
    if (tries === 0) {
      setScore((s) => ({ ok: s.ok, all: s.all + 1 }))
      onResult?.(false)
    }
    setState('shown')
  }

  const next = () => {
    setTask(generate())
    setValue('')
    setState(null)
    setTries(0)
  }

  const finished = state === 'ok' || state === 'shown'

  return (
    <div className="card game-card">
      <div className="score">
        Wynik: <b>{score.ok}</b> / {score.all}
      </div>
      <p className="question">{task.q}</p>
      <form className="num-form" onSubmit={check}>
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (state === 'bad' || state === 'nan') setState(null)
          }}
          placeholder="Twoja odpowiedź"
          disabled={finished}
          aria-label="Odpowiedź"
        />
        <span className="unit">{task.unit}</span>
        {!finished && (
          <button className="btn primary" type="submit">
            Sprawdź
          </button>
        )}
        {!finished && (
          <button className="btn" type="button" onClick={reveal}>
            Pokaż rozwiązanie
          </button>
        )}
      </form>
      {state === 'nan' && <div className="feedback bad">Wpisz liczbę, np. 0,05 albo 3600.</div>}
      {state === 'bad' && (
        <div className="feedback bad">
          Jeszcze nie. Sprawdź jednostki i przecinek – spróbuj ponownie albo zobacz rozwiązanie.
        </div>
      )}
      {finished && (
        <div className={state === 'ok' ? 'feedback ok' : 'feedback info'}>
          <div>
            {state === 'ok' ? 'Brawo! ' : ''}Odpowiedź: <b>{fmt(task.answer)} {task.unit}</b>
          </div>
          {task.steps ? <Steps steps={task.steps} /> : <div className="explain">{task.explain}</div>}
          <button className="btn primary" onClick={next}>
            Następne →
          </button>
        </div>
      )}
    </div>
  )
}

function Steps({ steps }) {
  return (
    <div className="steps">
      <div className="steps-cols">
        <div>
          <div className="steps-h">Dane:</div>
          {steps.dane.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div>
          <div className="steps-h">Szukane:</div>
          <div>{steps.szukane}</div>
        </div>
      </div>
      <div className="steps-h">Rozwiązanie:</div>
      {steps.obliczenia.map((l) => (
        <div key={l} className="formula-inline">
          {l}
        </div>
      ))}
      {steps.odp && (
        <div>
          <b>Odp.:</b> {steps.odp}
        </div>
      )}
    </div>
  )
}
