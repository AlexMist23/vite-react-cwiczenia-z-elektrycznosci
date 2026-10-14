import { useState } from 'react'
import FormulaBuilder from '../components/FormulaBuilder.jsx'
import Pyramid from '../components/Pyramid.jsx'
import PyramidPicker, { HintButton, poolFor } from '../components/PyramidPicker.jsx'
import { clean, fmt, isClose, parseNum, pick } from '../lib/physics.js'
import { NAMES, letters } from '../lib/formulas.js'

const f = (x) => fmt(clean(x))
const UNITS = { E: 'J', W: 'J', U: 'V', q: 'C', I: 'A', t: 's', P: 'W' }

// Dla każdego trójkąta: losowanie „ładnych” liczb i treść zadania dla każdej szukanej wielkości.
const SCENARIOS = {
  E: {
    values: () => {
      const U = pick([1.5, 4.5, 6, 9, 12, 24, 230])
      const q = pick([2, 5, 10, 20, 40])
      return { U, q, E: U * q }
    },
    text: {
      E: (v) => `Między biegunami baterii o napięciu ${f(v.U)} V przepłynął ładunek ${f(v.q)} C. Jaką energię przeniósł ten ładunek?`,
      U: (v) => `Przeniesienie ładunku ${f(v.q)} C między biegunami źródła wymagało energii ${f(v.E)} J. Jakie jest napięcie źródła?`,
      q: (v) => `Źródło o napięciu ${f(v.U)} V przekazało energię ${f(v.E)} J. Jaki ładunek przepłynął?`,
    },
  },
  q: {
    values: () => {
      const I = pick([0.2, 0.5, 1.5, 2, 3, 5])
      const t = pick([2, 4, 5, 10, 20, 60])
      return { I, t, q: I * t }
    },
    text: {
      q: (v) => `Przez żarówkę płynie prąd o natężeniu ${f(v.I)} A. Jaki ładunek przepłynie przez nią w czasie ${f(v.t)} s?`,
      I: (v) => `W czasie ${f(v.t)} s przez przewodnik przepłynął ładunek ${f(v.q)} C. Jakie jest natężenie prądu?`,
      t: (v) => `Przez przewodnik płynie prąd o natężeniu ${f(v.I)} A. W jakim czasie przepłynie ładunek ${f(v.q)} C?`,
    },
  },
  P: {
    values: () => {
      const U = pick([4.5, 6, 12, 230])
      const I = pick([0.5, 2, 4, 5, 10])
      return { U, I, P: U * I }
    },
    text: {
      P: (v) => `Urządzenie podłączone do napięcia ${f(v.U)} V pobiera prąd ${f(v.I)} A. Jaka jest jego moc?`,
      U: (v) => `Urządzenie o mocy ${f(v.P)} W pobiera prąd o natężeniu ${f(v.I)} A. Pod jakim napięciem pracuje?`,
      I: (v) => `Urządzenie o mocy ${f(v.P)} W podłączono do napięcia ${f(v.U)} V. Jakie natężenie prądu płynie?`,
    },
  },
  W: {
    values: () => {
      const U = pick([4.5, 6, 12, 230])
      const I = pick([0.5, 1, 2, 4])
      const t = pick([10, 30, 60, 120])
      return { U, I, t, W: U * I * t }
    },
    text: {
      W: (v) => `Silnik zasilany napięciem ${f(v.U)} V pobiera prąd ${f(v.I)} A i pracuje przez ${f(v.t)} s. Jaką pracę wykonał prąd?`,
      U: (v) => `Prąd o natężeniu ${f(v.I)} A płynął przez ${f(v.t)} s i wykonał pracę ${f(v.W)} J. Jakie było napięcie?`,
      I: (v) => `Przy napięciu ${f(v.U)} V w czasie ${f(v.t)} s prąd wykonał pracę ${f(v.W)} J. Jakie było natężenie prądu?`,
      t: (v) => `Urządzenie pracuje przy napięciu ${f(v.U)} V i pobiera prąd ${f(v.I)} A. Jak długo musi działać, żeby prąd wykonał pracę ${f(v.W)} J?`,
    },
  },
}

function newTask(pool, prev) {
  const options = pool.flatMap((t) => Object.keys(SCENARIOS[t.id].text).map((target) => ({ tri: t, target })))
  const fresh = options.filter((o) => !(prev && o.tri === prev.tri && o.target === prev.target))
  const { tri, target } = pick(fresh)
  const sc = SCENARIOS[tri.id]
  const values = sc.values()
  const known = [tri.top, ...tri.bottom].filter((l) => l !== target)
  return { tri, target, values, known, text: sc.text[target](values), key: Math.random() }
}

export default function FormulaToCalc({ record }) {
  const [pyr, setPyr] = useState('all')
  const [task, setTask] = useState(() => newTask(poolFor('all')))
  const [hint, setHint] = useState(false)
  const [formulaOk, setFormulaOk] = useState(null) // null | true (za 1. razem) | false
  const [value, setValue] = useState('')
  const [state, setState] = useState(null) // null | 'ok' | 'bad' | 'nan' | 'shown'
  const [tries, setTries] = useState(0)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const { tri, target, values, known } = task
  const answer = values[target]
  const unit = UNITS[target]
  const step2 = formulaOk !== null
  const finished = state === 'ok' || state === 'shown'

  // zadanie liczy się jako dobre, gdy i wzór, i wynik były dobre za pierwszym razem
  const finish = (ok) => {
    const all = ok && formulaOk && !hint
    setScore((s) => ({ ok: s.ok + all, all: s.all + 1 }))
    record('wzor-obliczenie', all)
  }

  const check = (e) => {
    e.preventDefault()
    if (finished) return
    const n = parseNum(value)
    if (Number.isNaN(n)) {
      setState('nan')
      return
    }
    const ok = isClose(n, answer, 0.005)
    if (ok) finish(tries === 0)
    setTries((t) => t + 1)
    setState(ok ? 'ok' : 'bad')
  }

  const reveal = () => {
    finish(false)
    setState('shown')
  }

  const next = (choice = pyr) => {
    setTask(newTask(poolFor(choice), task))
    setHint(false)
    setFormulaOk(null)
    setValue('')
    setState(null)
    setTries(0)
  }

  const formula = tri.formulas[target]
  const substituted = formula
    .split('=')[1]
    .replace(/[A-Za-z]+/g, (l) => `${f(values[l])} ${UNITS[l]}`)
    .replace(/\//g, ':')

  return (
    <div className="section">
      <h2>Wzór → obliczenie</h2>
      <p className="lead">
        Każde zadanie ma dwa kroki. <b>Krok 1:</b> ułóż z klocków wzór na szukaną wielkość. <b>Krok 2:</b>{' '}
        podstaw liczby i wpisz wynik – sprawdzimy go.
      </p>
      <PyramidPicker
        value={pyr}
        onChange={(id) => {
          setPyr(id)
          next(id)
        }}
      />
      <div className="card game-card">
        <div className="score">
          Wynik: <b>{score.ok}</b> / {score.all}
        </div>
        <p className="question">{task.text}</p>
        <div className="steps-cols data-box">
          <div>
            <div className="steps-h">Dane:</div>
            {known.map((k) => (
              <div key={k} className="formula-inline">
                {k} = {f(values[k])} {UNITS[k]}
              </div>
            ))}
          </div>
          <div>
            <div className="steps-h">Szukane:</div>
            <div className="formula-inline">
              {target} = ? <span className="muted">({NAMES[target][0]})</span>
            </div>
          </div>
        </div>

        <h3 className="step-title">Krok 1: wzór</h3>
        {hint ? (
          <div className="hint-pyramid">
            <Pyramid cells={letters(tri).map((l) => ({ label: l, cls: l === target ? 'covered' : '' }))} />
          </div>
        ) : (
          !finished && <HintButton onReveal={() => setHint(true)} />
        )}
        <FormulaBuilder
          key={task.key}
          target={target}
          vars={[tri.top, ...tri.bottom]}
          formula={formula}
          onDone={(ok) => setFormulaOk(ok)}
        />

        {step2 && (
          <>
            <h3 className="step-title">Krok 2: obliczenie</h3>
            <p className="formula-inline">
              {target} = {substituted} = ?
            </p>
            <form className="num-form" onSubmit={check}>
              <input
                inputMode="decimal"
                value={value}
                autoFocus
                onChange={(e) => {
                  setValue(e.target.value)
                  if (state === 'bad' || state === 'nan') setState(null)
                }}
                placeholder="Wynik"
                disabled={finished}
                aria-label="Wynik"
              />
              <span className="unit">{unit}</span>
              {!finished && (
                <button className="btn primary" type="submit">
                  Sprawdź wynik
                </button>
              )}
              {!finished && tries > 0 && (
                <button className="btn" type="button" onClick={reveal}>
                  Pokaż wynik
                </button>
              )}
            </form>
            {state === 'nan' && <div className="feedback bad">Wpisz liczbę, np. 0,5 albo 120.</div>}
            {state === 'bad' && (
              <div className="feedback bad">Wynik się nie zgadza. Sprawdź mnożenie i dzielenie – spróbuj jeszcze raz.</div>
            )}
            {finished && (
              <div className={state === 'ok' ? 'feedback ok' : 'feedback info'}>
                <div>
                  {state === 'ok' ? 'Brawo! ' : ''}
                  <span className="formula-inline">
                    {target} = {substituted} = <b>{f(answer)} {unit}</b>
                  </span>
                </div>
                <button className="btn primary" onClick={() => next()}>
                  Następne zadanie →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
