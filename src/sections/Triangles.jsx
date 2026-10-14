import { useState } from 'react'
import AnswerBtn from '../components/AnswerBtn.jsx'
import { pick, shuffle } from '../lib/physics.js'

const NAMES = {
  E: ['energia elektryczna', 'J (dżul)'],
  W: ['praca prądu', 'J (dżul)'],
  U: ['napięcie elektryczne', 'V (wolt)'],
  q: ['ładunek elektryczny', 'C (kulomb)'],
  I: ['natężenie prądu', 'A (amper)'],
  t: ['czas', 's (sekunda)'],
  P: ['moc', 'W (wat)'],
}

const TRIANGLES = [
  {
    id: 'E',
    title: 'Napięcie',
    top: 'E',
    bottom: ['q', 'U'],
    formulas: { E: 'E = U · q', U: 'U = E / q', q: 'q = E / U' },
    unit: '1 V = 1 J / 1 C',
  },
  {
    id: 'q',
    title: 'Natężenie prądu',
    top: 'q',
    bottom: ['I', 't'],
    formulas: { q: 'q = I · t', I: 'I = q / t', t: 't = q / I' },
    unit: '1 A = 1 C / 1 s',
  },
  {
    id: 'P',
    title: 'Moc prądu',
    top: 'P',
    bottom: ['U', 'I'],
    formulas: { P: 'P = U · I', U: 'U = P / I', I: 'I = P / U' },
    unit: '1 W = 1 V · 1 A',
  },
  {
    id: 'W',
    title: 'Praca prądu',
    top: 'W',
    bottom: ['U', 'I', 't'],
    formulas: { W: 'W = U · I · t', U: 'U = W / (I · t)', I: 'I = W / (U · t)', t: 't = W / (U · I)' },
    unit: '1 J = 1 V · 1 A · 1 s',
  },
]

function Triangle({ tri, covered, onCover }) {
  const n = tri.bottom.length
  const cell = (label, x, y) => (
    <g
      key={label + x}
      className={`tri-cell ${covered === label ? 'covered' : ''}`}
      onClick={() => onCover(label)}
      role="button"
      aria-label={`Zakryj ${label}`}
    >
      <circle cx={x} cy={y} r="24" className="tri-hit" />
      <text x={x} y={y + 11} textAnchor="middle" className="tri-letter">
        {label}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 200 180" className="triangle">
      <polygon points="100,8 194,174 6,174" className="tri-shape" />
      <line x1="53" y1="95" x2="147" y2="95" className="tri-line" />
      {n === 2 && <line x1="100" y1="95" x2="100" y2="174" className="tri-line" />}
      {n === 3 && (
        <>
          <line x1="76" y1="95" x2="76" y2="174" className="tri-line" />
          <line x1="124" y1="95" x2="124" y2="174" className="tri-line" />
        </>
      )}
      {cell(tri.top, 100, 62)}
      {n === 2 && tri.bottom.map((b, i) => cell(b, i ? 132 : 68, 140))}
      {n === 3 && tri.bottom.map((b, i) => cell(b, [48, 100, 152][i], 140))}
    </svg>
  )
}

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
              <Triangle tri={tri} covered={c} onCover={(l) => setCovered((s) => ({ ...s, [tri.id]: l }))} />
              <div className="formula">{c ? tri.formulas[c] : 'Kliknij literę'}</div>
              <small className="muted">{c ? `${c} – ${NAMES[c][0]} [${NAMES[c][1]}]` : tri.unit}</small>
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
            {answer === drill.right ? 'Dobrze!' : `Poprawny wzór: ${drill.right}.`}
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
