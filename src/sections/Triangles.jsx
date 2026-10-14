import { useState } from 'react'
import AnswerBtn from '../components/AnswerBtn.jsx'
import Pyramid from '../components/Pyramid.jsx'
import { pick, shuffle } from '../lib/physics.js'
import { NAMES, TRIANGLES, letters } from '../lib/formulas.js'
import { SCENARIOS, UNITS, substitute } from '../lib/scenarios.js'
import { clean, fmt } from '../lib/physics.js'

function newDrill() {
  const tri = pick(TRIANGLES)
  const target = pick(Object.keys(tri.formulas))
  const right = tri.formulas[target]
  // błędne odpowiedzi: typowe pomyłki przy przekształcaniu wzoru
  const { top, bottom } = tri
  let wrong
  if (target === top) {
    const [a, b, c] = bottom
    wrong = c
      ? [`${a} · ${b} / ${c}`, `${a} / (${b} · ${c})`, `${a} + ${b} + ${c}`]
      : [`${a} / ${b}`, `${b} / ${a}`, `${a} + ${b}`]
  } else {
    const [r1, r2] = bottom.filter((v) => v !== target)
    wrong = r2
      ? [`${top} · ${r1} · ${r2}`, `(${r1} · ${r2}) / ${top}`, `${top} · ${r1} / ${r2}`]
      : [`${top} · ${r1}`, `${r1} / ${top}`, `${top} − ${r1}`]
  }
  const wrongPool = wrong.map((w) => `${target} = ${w}`)
  const options = shuffle([right, ...wrongPool])
  return { tri, target, right, options }
}

export default function Triangles({ record }) {
  const [covered, setCovered] = useState({})
  // liczby do przykładów – osobno dla każdej piramidy; te same liczby pasują do każdej zakrytej litery
  const [examples, setExamples] = useState(() => Object.fromEntries(TRIANGLES.map((t) => [t.id, SCENARIOS[t.id].values()])))
  const reroll = (id) => setExamples((e) => ({ ...e, [id]: SCENARIOS[id].values() }))
  const [drill, setDrill] = useState(newDrill)
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const choose = (f) => {
    if (answer) return
    const ok = f === drill.right
    setAnswer(f)
    setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
    record('wzory', ok)
  }

  const known = [drill.tri.top, ...drill.tri.bottom].filter((v) => v !== drill.target)

  return (
    <div className="section">
      <h2>Magiczne trójkąty wzorów</h2>
      <p className="lead">
        Kliknij literę, której szukasz – „zakryj” ją palcem. To, co zostaje, mówi jak ją obliczyć: obok
        siebie = mnożymy, jedno nad drugim = dzielimy.
      </p>
      <div className="tri-grid">
        {TRIANGLES.map((tri) => {
          const c = covered[tri.id]
          return (
            <div key={tri.id} className="card tri-card">
              <h3>{tri.title}</h3>
              <Pyramid
                cells={letters(tri).map((l) => ({ label: l, cls: c === l ? 'covered' : '' }))}
                onCell={(i) => setCovered((s) => ({ ...s, [tri.id]: letters(tri)[i] }))}
              />
              <div className="formula">{c ? tri.formulas[c] : 'Kliknij literę'}</div>
              <small className="muted">{c ? `${c} – ${NAMES[c][0]} [${NAMES[c][1]}]` : tri.unit}</small>
              <Example tri={tri} target={c ?? tri.top} values={examples[tri.id]} onReroll={() => reroll(tri.id)} />
            </div>
          )
        })}
      </div>

      <div className="card game-card">
        <div className="score">
          Wynik: <b>{score.ok}</b> / {score.all}
        </div>
        <p className="question">
          Szukasz: <b>{drill.target}</b> ({NAMES[drill.target][0]}). Znasz:{' '}
          {known.map((k) => `${k} (${NAMES[k][0]})`).join(', ')}. Który wzór wybierzesz?
        </p>
        <div className="answers two">
          {drill.options.map((f) => (
            <AnswerBtn key={f} id={f} answer={answer} correct={drill.right} choose={choose}>
              <span className="formula-inline">{f}</span>
            </AnswerBtn>
          ))}
        </div>
        {answer && (
          <div className={answer === drill.right ? 'feedback ok' : 'feedback bad'}>
            {answer === drill.right ? 'Dobrze! ' : `Poprawny wzór: ${drill.right}. `}
            {drill.target === drill.tri.top
              ? `${drill.target} jest na górze trójkąta – zakryj je, a zostaje dół: litery obok siebie, więc mnożymy.`
              : `${drill.target} jest na dole – zakryj je, a zostaje ${drill.tri.top} nad pozostałymi literami, więc dzielimy ${drill.tri.top} przez nie.`}
            <button
              className="btn primary"
              onClick={() => {
                setDrill(newDrill())
                setAnswer(null)
              }}
            >
              Następne →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const f = (x) => fmt(clean(x))

/** Przykład z życia do piramidy: treść, dane, wzór i obliczenie dla zakrytej litery. */
function Example({ tri, target, values, onReroll }) {
  const known = letters(tri).filter((l) => l !== target)
  const formula = tri.formulas[target]
  return (
    <div className="tri-example">
      <div className="tri-example-head">
        <b>Przykład: szukamy {target}</b>
        <button className="chip" onClick={onReroll} title="Losuj nowe liczby">
          🎲 losuj
        </button>
      </div>
      <p>{SCENARIOS[tri.id].text[target](values)}</p>
      <div className="formula-inline">
        Dane: {known.map((k) => `${k} = ${f(values[k])} ${UNITS[k]}`).join(', ')}
      </div>
      <div className="formula-inline">{formula}</div>
      <div className="formula-inline">
        {target} = {substitute(formula, values)} = <b>{f(values[target])} {UNITS[target]}</b>
      </div>
    </div>
  )
}
