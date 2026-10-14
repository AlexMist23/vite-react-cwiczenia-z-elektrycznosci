import { useState } from 'react'
import AnswerBtn from '../components/AnswerBtn.jsx'
import FormulaBuilder from '../components/FormulaBuilder.jsx'
import Pyramid from '../components/Pyramid.jsx'
import { pick, shuffle } from '../lib/physics.js'
import { NAMES, TRIANGLES, letters, samePyramid } from '../lib/formulas.js'

const ALL_LETTERS = Object.keys(NAMES)

const MODES = [
  { id: 'piramida', label: '🔺 Ułóż piramidę' },
  { id: 'wzor', label: '🧱 Ułóż wzór' },
  { id: 'symbole', label: '🔤 Symbol i jednostka' },
]

export default function FormulaTrainer({ record }) {
  const [mode, setMode] = useState('piramida')
  const [score, setScore] = useState({ ok: 0, all: 0 })
  const result = (ok) => {
    setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
    record('trening', ok)
  }

  return (
    <div className="section">
      <h2>Trening wzorów i piramid</h2>
      <p className="lead">
        Najpierw naucz się piramid na pamięć, potem przekształcaj wzory bez podglądania. Na górze piramidy
        jest to, co powstaje z mnożenia (E, q, P, W), na dole – to, co mnożymy.
      </p>
      <div className="seg wrap">
        {MODES.map((m) => (
          <button key={m.id} className={mode === m.id ? 'active' : ''} onClick={() => setMode(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="card game-card">
        <div className="score">
          Wynik: <b>{score.ok}</b> / {score.all}
        </div>
        {mode === 'piramida' && <PyramidDrill onResult={result} />}
        {mode === 'wzor' && <BuildDrill onResult={result} />}
        {mode === 'symbole' && <SymbolDrill onResult={result} />}
      </div>
    </div>
  )
}

/* ---------- 1. Ułóż piramidę z liter ---------- */

function newPyramidTask() {
  const tri = pick(TRIANGLES)
  const given = pick(Object.values(tri.formulas))
  const extra = shuffle(ALL_LETTERS.filter((l) => !letters(tri).includes(l))).slice(0, 2)
  return { tri, given, pool: shuffle([...letters(tri), ...extra]) }
}

function PyramidDrill({ onResult }) {
  const [task, setTask] = useState(newPyramidTask)
  const [cells, setCells] = useState(() => letters(task.tri).map(() => ''))
  const [state, setState] = useState(null) // null | 'ok' | 'bad' | 'shown'
  const [tries, setTries] = useState(0)
  const finished = state === 'ok' || state === 'shown'
  const used = cells.filter(Boolean)

  const put = (l) => {
    if (finished) return
    const i = cells.indexOf('')
    if (i < 0) return
    setCells((c) => c.map((x, k) => (k === i ? l : x)))
    setState(null)
  }
  const clear = (i) => {
    if (finished) return
    setCells((c) => c.map((x, k) => (k === i ? '' : x)))
    setState(null)
  }
  const check = () => {
    const ok = samePyramid(cells, task.tri)
    if (tries === 0) onResult(ok)
    setTries((n) => n + 1)
    setState(ok ? 'ok' : 'bad')
  }
  const reveal = () => {
    if (tries === 0) onResult(false)
    setCells(letters(task.tri))
    setState('shown')
  }
  const next = () => {
    const t = newPyramidTask()
    setTask(t)
    setCells(letters(t.tri).map(() => ''))
    setState(null)
    setTries(0)
  }

  const cls = state === 'ok' ? 'right' : state === 'bad' ? 'wrong' : ''

  return (
    <>
      <p className="question">
        Ułóż piramidę dla wzoru <span className="formula">{task.given}</span>
      </p>
      <p className="muted">
        Klikaj litery – wypełniają piramidę od góry. Kliknij literę w piramidzie, żeby ją zdjąć.
      </p>
      <div className="pyramid-play">
        <Pyramid cells={cells.map((l) => ({ label: l, cls: l ? `filled ${cls}` : '' }))} onCell={clear} />
        <div className="builder-tiles">
          {task.pool.map((l) => (
            <button key={l} className="tile-btn letter" onClick={() => put(l)} disabled={finished || used.includes(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {!finished && (
        <div className="btn-row">
          <button className="btn primary" onClick={check} disabled={cells.includes('')}>
            Sprawdź
          </button>
          <button className="btn" onClick={reveal}>
            Pokaż piramidę
          </button>
        </div>
      )}
      {state === 'bad' && (
        <div className="feedback bad">
          Coś nie pasuje. Na górze stoi wielkość, która jest iloczynem pozostałych (np. P = U · I → P na górze).
        </div>
      )}
      {finished && (
        <div className={state === 'ok' ? 'feedback ok' : 'feedback info'}>
          <div>
            {state === 'ok' ? 'Brawo! ' : ''}
            {task.tri.title}: {Object.values(task.tri.formulas).join(',  ')}
          </div>
          <button className="btn primary" onClick={next}>
            Następne →
          </button>
        </div>
      )}
    </>
  )
}

/* ---------- 2. Ułóż wzór z klocków ---------- */

function newBuildTask() {
  const tri = pick(TRIANGLES)
  const target = pick(letters(tri))
  return { tri, target, key: Math.random() }
}

function BuildDrill({ onResult }) {
  const [task, setTask] = useState(newBuildTask)
  const [done, setDone] = useState(false)
  const [hint, setHint] = useState(false)
  const { tri, target } = task
  const known = letters(tri).filter((l) => l !== target)

  const next = () => {
    setTask(newBuildTask())
    setDone(false)
    setHint(false)
  }

  return (
    <>
      <p className="question">
        Ułóż wzór na <b>{target}</b> ({NAMES[target][0]}), gdy znasz:{' '}
        {known.map((k) => `${k} (${NAMES[k][0]})`).join(', ')}.
      </p>
      {hint ? (
        <div className="hint-pyramid">
          <Pyramid cells={letters(tri).map((l) => ({ label: l, cls: l === target ? 'covered' : '' }))} />
        </div>
      ) : (
        !done && (
          <button className="chip" onClick={() => setHint(true)}>
            💡 podpowiedź: pokaż piramidę
          </button>
        )
      )}
      <FormulaBuilder
        key={task.key}
        target={target}
        vars={letters(tri)}
        formula={tri.formulas[target]}
        onDone={(ok) => {
          onResult(ok && !hint)
          setDone(true)
        }}
      />
      {done && (
        <button className="btn primary" onClick={next}>
          Następne →
        </button>
      )}
    </>
  )
}

/* ---------- 3. Symbol, nazwa i jednostka ---------- */

function newSymbolTask() {
  const sym = pick(ALL_LETTERS)
  const [name, unit] = NAMES[sym]
  const kind = pick(['name', 'unit', 'symbol'])
  if (kind === 'name') {
    const opts = shuffle([...new Set(ALL_LETTERS.map((l) => NAMES[l][0]))].filter((n) => n !== name)).slice(0, 3)
    return { q: <>Co oznacza symbol <span className="formula">{sym}</span>?</>, right: name, options: shuffle([name, ...opts]) }
  }
  if (kind === 'unit') {
    const opts = shuffle([...new Set(ALL_LETTERS.map((l) => NAMES[l][1]))].filter((u) => u !== unit)).slice(0, 3)
    return { q: <>Jaka jest jednostka wielkości: {name} ({sym})?</>, right: unit, options: shuffle([unit, ...opts]) }
  }
  // E i W mają ten sam opis jednostki, więc przy symbolu pytamy o nazwę, a nie o jednostkę
  const opts = shuffle(ALL_LETTERS.filter((l) => l !== sym)).slice(0, 3)
  return { q: <>Jakim symbolem oznaczamy: {name}?</>, right: sym, options: shuffle([sym, ...opts]) }
}

function SymbolDrill({ onResult }) {
  const [task, setTask] = useState(newSymbolTask)
  const [answer, setAnswer] = useState(null)
  const choose = (a) => {
    if (answer) return
    setAnswer(a)
    onResult(a === task.right)
  }
  return (
    <>
      <p className="question">{task.q}</p>
      <div className="answers two">
        {task.options.map((o) => (
          <AnswerBtn key={o} id={o} answer={answer} correct={task.right} choose={choose}>
            {o}
          </AnswerBtn>
        ))}
      </div>
      {answer && (
        <div className={answer === task.right ? 'feedback ok' : 'feedback bad'}>
          {answer === task.right ? 'Dobrze!' : `Poprawnie: ${task.right}.`}
          <button
            className="btn primary"
            onClick={() => {
              setTask(newSymbolTask())
              setAnswer(null)
            }}
          >
            Następne →
          </button>
        </div>
      )}
    </>
  )
}
