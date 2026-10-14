import { useState } from 'react'
import FormulaBuilder from '../components/FormulaBuilder.jsx'
import PyramidChoice from '../components/PyramidChoice.jsx'
import PyramidPicker, { poolFor } from '../components/PyramidPicker.jsx'
import { clean, fmt, isClose, parseNum, pick } from '../lib/physics.js'
import { NAMES } from '../lib/formulas.js'
import { SCENARIOS, UNITS, substitute } from '../lib/scenarios.js'

const f = (x) => fmt(clean(x))

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
  // dobór piramidy: null – jeszcze nie, true/false – trafiony za 1. razem (przy jednej piramidzie pomijamy)
  const [pyrOk, setPyrOk] = useState(null)
  const [formulaOk, setFormulaOk] = useState(null) // null | true (za 1. razem) | false
  const [value, setValue] = useState('')
  const [state, setState] = useState(null) // null | 'ok' | 'bad' | 'nan' | 'shown'
  const [tries, setTries] = useState(0)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const { tri, target, values, known } = task
  const answer = values[target]
  const unit = UNITS[target]
  const choosePyr = pyr === 'all'
  const stepFormula = !choosePyr || pyrOk !== null
  const step2 = stepFormula && formulaOk !== null
  const n = choosePyr ? 1 : 0
  const finished = state === 'ok' || state === 'shown'

  // zadanie liczy się jako dobre, gdy piramida, wzór i wynik były dobre za pierwszym razem
  const finish = (ok) => {
    const all = ok && formulaOk && (!choosePyr || pyrOk)
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
    setPyrOk(null)
    setFormulaOk(null)
    setValue('')
    setState(null)
    setTries(0)
  }

  const formula = tri.formulas[target]
  const substituted = substitute(formula, values)

  return (
    <div className="section">
      <h2>Wzór → obliczenie</h2>
      <p className="lead">
        <b>Krok 1:</b> dobierz piramidę, która pasuje do zadania. <b>Krok 2:</b> ułóż z klocków wzór na szukaną
        wielkość. <b>Krok 3:</b> podstaw liczby i wpisz wynik – sprawdzimy go. Punkt dostajesz, gdy wszystko
        zrobisz dobrze za pierwszym razem. (Po wybraniu jednej piramidy krok 1 jest pomijany.)
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

        {choosePyr && (
          <>
            <h3 className="step-title">Krok 1: która piramida pasuje do zadania?</h3>
            <PyramidChoice key={task.key} correct={tri} needed={[target, ...known]} onDone={setPyrOk} />
          </>
        )}

        {stepFormula && (
          <>
            <h3 className="step-title">Krok {n + 1}: wzór</h3>
            <FormulaBuilder
              key={task.key}
              target={target}
              vars={[tri.top, ...tri.bottom]}
              formula={formula}
              onDone={(ok) => setFormulaOk(ok)}
            />
          </>
        )}

        {step2 && (
          <>
            <h3 className="step-title">Krok {n + 2}: obliczenie</h3>
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
