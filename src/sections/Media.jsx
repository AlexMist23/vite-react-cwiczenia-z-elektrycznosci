import { useState } from 'react'
import AnswerBtn from '../components/AnswerBtn.jsx'
import { shuffle } from '../lib/physics.js'

// Animacja nośników ładunku między elektrodami: „+” po lewej, „−” po prawej.
function Chamber({ kind }) {
  const particles = []
  const rows = [30, 60, 90, 120]
  rows.forEach((y, r) => {
    for (let i = 0; i < 5; i++) {
      const delay = -((i * 1.1 + r * 0.45) % 5.5)
      if (kind === 'solid') {
        particles.push({ y, type: 'e', delay })
      } else if (kind === 'liquid') {
        particles.push({ y: y + (i % 2 ? 6 : -6), type: i % 2 ? 'neg' : 'pos', delay: delay * 1.6 })
      } else {
        const type = i % 3 === 0 ? 'pos' : i % 3 === 1 ? 'e' : 'neg'
        particles.push({ y: y + (i % 2 ? 7 : -7), type, delay })
      }
    }
  })
  return (
    <svg viewBox="0 0 300 150" className={`chamber ${kind}`}>
      <rect x="0" y="0" width="300" height="150" className="chamber-bg" />
      {kind === 'solid' &&
        Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={30 + (i % 10) * 27} cy={22 + Math.floor(i / 10) * 33} r="9" className="lattice" />
        ))}
      {particles.map((p, i) => (
        <g key={i} className={`mover ${p.type === 'pos' ? 'to-right' : 'to-left'} ${p.type}`} style={{ animationDelay: `${p.delay}s` }}>
          <circle cx="0" cy={p.y} r={p.type === 'e' ? 5 : 8} />
          <text x="0" y={p.y + 3.5} textAnchor="middle">
            {p.type === 'pos' ? '+' : '−'}
          </text>
        </g>
      ))}
      <rect x="0" y="0" width="14" height="150" className="electrode plus" />
      <rect x="286" y="0" width="14" height="150" className="electrode minus" />
      <text x="7" y="80" textAnchor="middle" className="electrode-label">+</text>
      <text x="293" y="80" textAnchor="middle" className="electrode-label">−</text>
    </svg>
  )
}

const MEDIA = [
  {
    kind: 'solid',
    title: 'Ciała stałe (metale)',
    carriers: 'elektrony swobodne',
    text: 'W metalach prąd to uporządkowany ruch elektronów swobodnych. Jony dodatnie siedzą w sieci krystalicznej i tylko drgają.',
    examples: 'drut miedziany, aluminiowy przewód, grafit w ołówku',
  },
  {
    kind: 'liquid',
    title: 'Ciecze (elektrolity)',
    carriers: 'jony dodatnie i ujemne',
    text: 'W roztworach soli, kwasów i zasad prąd to uporządkowany ruch jonów: dodatnie płyną do „−”, ujemne do „+”.',
    examples: 'woda z solą, kwas w akumulatorze, sok z cytryny',
  },
  {
    kind: 'gas',
    title: 'Gazy (zjonizowane)',
    carriers: 'jony i elektrony',
    text: 'Gaz zwykle jest izolatorem, ale gdy zostanie zjonizowany, prąd płynie dzięki ruchowi jonów oraz elektronów.',
    examples: 'błyskawica, neonówka, świetlówka, iskra',
  },
]

const ITEMS = [
  ['Miedziany przewód w ścianie', 'solid'],
  ['Woda z rozpuszczoną solą kuchenną', 'liquid'],
  ['Błyskawica podczas burzy', 'gas'],
  ['Kwas siarkowy w akumulatorze samochodowym', 'liquid'],
  ['Świecąca neonówka (reklama)', 'gas'],
  ['Aluminiowa folia', 'solid'],
  ['Grafit w ołówku', 'solid'],
  ['Sok z cytryny z wbitymi elektrodami', 'liquid'],
  ['Iskra przeskakująca między przewodami', 'gas'],
  ['Złoty styk w telefonie', 'solid'],
  ['Świetlówka (lampa jarzeniowa)', 'gas'],
  ['Woda morska', 'liquid'],
]

const LABEL = {
  solid: 'Elektrony',
  liquid: 'Jony (dodatnie i ujemne)',
  gas: 'Jony i elektrony',
}

export default function Media({ record }) {
  const [order, setOrder] = useState(() => shuffle(ITEMS))
  const [idx, setIdx] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const [name, correct] = order[idx]
  const choose = (k) => {
    if (answer) return
    const ok = k === correct
    setAnswer(k)
    setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
    record('osrodki', ok)
  }
  const next = () => {
    setAnswer(null)
    if (idx + 1 < order.length) setIdx(idx + 1)
    else {
      setOrder(shuffle(ITEMS))
      setIdx(0)
    }
  }

  return (
    <div className="section">
      <h2>Prąd w ciałach stałych, cieczach i gazach</h2>
      <div className="callout info">
        <b>Prąd elektryczny</b> to uporządkowany ruch <b>ładunków elektrycznych</b>. W metalach są to
        elektrony (ładunki ujemne), ale w cieczach i gazach płyną też <b>jony dodatnie</b> – dlatego
        mówimy ogólnie o ładunkach, a nie tylko o ujemnych.
      </div>

      <div className="media-grid">
        {MEDIA.map((m) => (
          <div key={m.kind} className="card media-card">
            <h3>{m.title}</h3>
            <Chamber kind={m.kind} />
            <p>
              <b>Nośniki ładunku:</b> {m.carriers}
            </p>
            <p className="small">{m.text}</p>
            <p className="small muted">Przykłady: {m.examples}</p>
          </div>
        ))}
      </div>

      <div className="card game-card">
        <div className="score">
          Wynik: <b>{score.ok}</b> / {score.all}
        </div>
        <p className="question">
          Co przenosi ładunek? <b>{name}</b>
        </p>
        <div className="answers three">
          {Object.entries(LABEL).map(([k, t]) => (
            <AnswerBtn key={k} id={k} answer={answer} correct={correct} choose={choose}>
              {t}
            </AnswerBtn>
          ))}
        </div>
        {answer && (
          <div className={answer === correct ? 'feedback ok' : 'feedback bad'}>
            {answer === correct ? 'Dobrze! ' : 'Nie tym razem. '}
            {MEDIA.find((m) => m.kind === correct).title}: {MEDIA.find((m) => m.kind === correct).carriers}.
            <button className="btn primary" onClick={next}>
              Następne →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
