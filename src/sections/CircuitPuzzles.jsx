import { useState } from 'react'
import AnswerBtn from '../components/AnswerBtn.jsx'
import BookRef from '../components/BookRef.jsx'
import { CutWires, Symbol } from '../components/Symbols.jsx'
import { pick, shuffle } from '../lib/physics.js'

// Bateria po lewej, żarówka u góry. Każda topologia mówi, czy żarówka świeci przy danym stanie wyłącznika.
const TOPOLOGIES = [
  {
    id: 'series',
    answer: 'C',
    shines: (closed) => closed,
    why: 'Wyłącznik jest połączony szeregowo z żarówką. Gdy go otworzymy, obwód jest przerwany.',
    wires: ['M40,110 V30 H300 V190 H40 Z'],
    sw: { x: 300, y: 110, rot: 90 },
  },
  {
    id: 'switch-shorts-bulb',
    answer: 'D',
    shines: (closed) => !closed,
    why: 'Zamknięty wyłącznik łączy oba końce żarówki zwykłym przewodem. Przewód prawie nie stawia oporu, więc prawie cały prąd płynie przez wyłącznik, a przez żarówkę – praktycznie nic. Uwaga: w tym obwodzie nie ma wtedy żadnego odbiornika, więc zamknięcie wyłącznika robi ZWARCIE baterii – rośnie natężenie, bateria i przewody się grzeją.',
    wires: ['M40,110 V30 H300 V190 H40 Z', 'M110,30 V95 H230 V30'],
    sw: { x: 170, y: 95, rot: 0 },
    dots: [[110, 30], [230, 30]],
  },
  {
    id: 'wire-shorts-bulb',
    answer: 'B',
    shines: () => false,
    why: 'Żarówkę „omija” zwykły przewód. Przewód prawie nie stawia oporu, więc prawie cały prąd płynie nim, a żarówka nie świeci. Uwaga: przy zamkniętym wyłączniku to ZWARCIE baterii – takiego obwodu nie wolno budować naprawdę.',
    wires: ['M40,110 V30 H300 V190 H40 Z', 'M110,30 V95 H230 V30'],
    sw: { x: 300, y: 110, rot: 90 },
    dots: [[110, 30], [230, 30]],
  },
  {
    id: 'switch-parallel-wire',
    answer: 'A',
    shines: () => true,
    why: 'Wyłącznik jest równolegle do zwykłego przewodu. Prąd i tak ma zamkniętą drogę przez przewód, więc stan wyłącznika nic nie zmienia.',
    wires: ['M40,110 V30 H300 V190 H40 Z', 'M300,60 H370 V160 H300'],
    sw: { x: 370, y: 110, rot: 90 },
    dots: [[300, 60], [300, 160]],
  },
  {
    id: 'open-loop',
    answer: 'B',
    shines: () => false,
    why: 'Obwód jest przerwany (na dole brakuje kawałka przewodu), więc prąd nie może popłynąć bez względu na wyłącznik.',
    wires: ['M150,190 H40 V30 H300 V190 H200'],
    sw: { x: 300, y: 110, rot: 90 },
  },
  // Układy jak w podręczniku: inne położenie żarówki, baterii i wyłącznika.
  {
    id: 'book-middle-wire',
    answer: 'A',
    shines: () => true,
    why: 'Środkowy przewód łączy górę z dołem obwodu, więc bateria, żarówka i ten przewód tworzą zamkniętą drogę niezależnie od wyłącznika. Wyłącznik jest tylko na dodatkowej, bocznej drodze – nic nie zmienia.',
    wires: ['M40,110 V30 H300 V190 H40 Z', 'M210,30 V190'],
    bulb: { x: 120, y: 30, rot: 0 },
    sw: { x: 300, y: 110, rot: 90 },
    dots: [[210, 30], [210, 190]],
  },
  {
    id: 'book-bulb-parallel-switch',
    answer: 'D',
    shines: (closed) => !closed,
    why: 'Żarówka i wyłącznik są połączone równolegle – każde w swojej gałęzi prosto do baterii. Gdy wyłącznik jest otwarty, prąd płynie przez żarówkę. Gdy go zamkniemy, bieguny baterii łączy sam przewód: prawie cały prąd płynie przez wyłącznik, a żarówka gaśnie. Uwaga: to ZWARCIE baterii.',
    wires: ['M40,110 V30 H300 V190 H40 Z', 'M170,30 V190'],
    bulb: { x: 170, y: 110, rot: 90 },
    sw: { x: 300, y: 110, rot: 90 },
    dots: [[170, 30], [170, 190]],
  },
  {
    id: 'series-bottom-switch',
    answer: 'C',
    shines: (closed) => closed,
    why: 'Bateria, żarówka i wyłącznik tworzą jedną pętlę (połączenie szeregowe). Otwarty wyłącznik przerywa obwód, a zamknięty go zamyka – wtedy żarówka świeci.',
    wires: ['M40,110 V30 H300 V190 H40 Z'],
    bulb: { x: 300, y: 110, rot: 90 },
    sw: { x: 170, y: 190, rot: 0 },
  },
  {
    id: 'book-bulb-shorted-top',
    answer: 'B',
    shines: () => false,
    why: 'Oba końce żarówki są połączone z górnym przewodem – są w tym samym punkcie obwodu, więc między nimi nie ma napięcia i przez żarówkę nie płynie prąd. Zamknięcie wyłącznika łączy bieguny baterii samym przewodem – to ZWARCIE.',
    wires: ['M40,140 V30 H300 V190 H40 Z', 'M40,80 H300'],
    bat: { x: 40, y: 140, rot: 90 },
    bulb: { x: 170, y: 80, rot: 0 },
    sw: { x: 300, y: 140, rot: 90 },
    dots: [[40, 80], [300, 80]],
  },
]

const DESCRIPTIONS = {
  A: 'Świeci zawsze – niezależnie od wyłącznika',
  B: 'Nie świeci nigdy – niezależnie od wyłącznika',
  C: 'Świeci tylko, gdy wyłącznik jest zamknięty',
  D: 'Świeci tylko, gdy wyłącznik jest otwarty',
}

function PuzzleCircuit({ topo, closed, onToggle, showGlow }) {
  const lit = showGlow && topo.shines(closed)
  const bat = topo.bat ?? { x: 40, y: 110, rot: 90 } // „+” u góry, jak w podręczniku
  const bulb = topo.bulb ?? { x: 170, y: 30, rot: 0 }
  return (
    <svg viewBox="0 0 410 220" className="circuit small-circuit">
      <CutWires
        id={`puzzle-wires-${topo.id}`}
        holes={[
          [bat.x - 30, bat.y - 30, 60, 60],
          [bulb.x - 16, bulb.y - 16, 32, 32],
          [topo.sw.x - 24, topo.sw.y - 24, 48, 48],
        ]}
      >
        {topo.wires.map((d) => (
          <path key={d} d={d} className="wire" />
        ))}
      </CutWires>
      {topo.dots?.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill="var(--wire)" />
      ))}
      <g className="el">
        <Symbol type="cell" x={bat.x - 40} y={bat.y - 20} rotate={bat.rot} />
      </g>
      <g className="el">
        {lit && <circle cx={bulb.x} cy={bulb.y} r="34" className="glow" />}
        <Symbol type="bulb" x={bulb.x - 40} y={bulb.y - 20} rotate={bulb.rot} />
      </g>
      <g className="el clickable" onClick={onToggle}>
        <rect x={topo.sw.x - 24} y={topo.sw.y - 24} width="48" height="48" className="el-bg" />
        <Symbol
          type={closed ? 'switchClosed' : 'switchOpen'}
          x={topo.sw.x - 40}
          y={topo.sw.y - 20}
          rotate={topo.sw.rot}
        />
      </g>
    </svg>
  )
}

function BulbGame({ record }) {
  const [topo, setTopo] = useState(() => pick(TOPOLOGIES))
  const [answer, setAnswer] = useState(null)
  const [closed, setClosed] = useState(false)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const choose = (k) => {
    if (answer) return
    const ok = k === topo.answer
    setAnswer(k)
    setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
    record('zagadki', ok)
  }
  const next = () => {
    let t
    do t = pick(TOPOLOGIES)
    while (t.id === topo.id)
    setTopo(t)
    setAnswer(null)
    setClosed(false)
  }

  return (
    <div className="card game-card">
      <div className="score">
        Wynik: <b>{score.ok}</b> / {score.all}
      </div>
      <h3>Czy żarówka świeci?</h3>
      <p className="question">Który opis pasuje do tego obwodu?</p>
      <PuzzleCircuit topo={topo} closed={closed} onToggle={() => answer && setClosed((c) => !c)} showGlow={!!answer} />
      {answer && (
        <p className="small muted center">
          Teraz możesz klikać wyłącznik i sprawdzić, kiedy żarówka świeci (wyłącznik:{' '}
          {closed ? 'zamknięty' : 'otwarty'}).
        </p>
      )}
      <div className="answers two">
        {Object.entries(DESCRIPTIONS).map(([k, d]) => (
          <AnswerBtn key={k} id={k} answer={answer} correct={topo.answer} choose={choose}>
            <b>{k}.</b> {d}
          </AnswerBtn>
        ))}
      </div>
      {answer && (
        <div className={answer === topo.answer ? 'feedback ok' : 'feedback bad'}>
          {answer === topo.answer ? 'Dobrze! ' : `Poprawnie: ${topo.answer}. `}
          {topo.why}
          <button className="btn primary" onClick={next}>
            Następny obwód →
          </button>
        </div>
      )}
    </div>
  )
}

// ---------- Prąd elektryczny a prąd wody ----------
const ANALOGY = [
  ['Pompa tłocząca wodę w górę', 'Źródło napięcia (bateria)'],
  ['Różnica poziomów wody', 'Napięcie elektryczne'],
  ['Przepływ wody w rurach', 'Prąd elektryczny'],
  ['Rury', 'Przewody'],
  ['Koło wodne napędzane spadającą wodą', 'Odbiornik, np. żarówka'],
  ['Zawór zamykający rurę', 'Wyłącznik'],
]

function WaterAnalogy({ record }) {
  const [options] = useState(() => shuffle(ANALOGY.map((p) => p[1])))
  const [sel, setSel] = useState({})
  const [checked, setChecked] = useState(false)
  const good = ANALOGY.filter(([w, e]) => sel[w] === e).length
  const complete = Object.keys(sel).length === ANALOGY.length

  return (
    <div className="card">
      <h3>Prąd elektryczny jest jak prąd wody</h3>
      <p className="small muted">Dopasuj elementy obwodu wodnego do elementów obwodu elektrycznego.</p>
      <div className="analogy">
        {ANALOGY.map(([w, e]) => (
          <div
            key={w}
            className={`analogy-row ${checked ? (sel[w] === e ? 'ok' : 'bad') : ''}`}
          >
            <span>💧 {w}</span>
            <span className="arrow">↔</span>
            <select
              value={sel[w] ?? ''}
              disabled={checked}
              onChange={(ev) => setSel((s) => ({ ...s, [w]: ev.target.value }))}
            >
              <option value="" disabled>wybierz…</option>
              {options.map((o) => (
                <option key={o} value={o}>⚡ {o}</option>
              ))}
            </select>
            {checked && sel[w] !== e && <span className="ok-text small">→ {e}</span>}
          </div>
        ))}
      </div>
      {!checked ? (
        <button
          className="btn primary"
          disabled={!complete}
          onClick={() => {
            setChecked(true)
            ANALOGY.forEach(([w, e]) => record('zagadki', sel[w] === e))
          }}
        >
          Sprawdź
        </button>
      ) : (
        <div className="feedback info">
          Wynik: {good} / {ANALOGY.length}. Bateria „podnosi” elektrony na wyższy poziom energii tak jak pompa
          wodę, a napięcie odpowiada różnicy poziomów wody.
          <button className="btn" onClick={() => { setSel({}); setChecked(false) }}>Jeszcze raz</button>
        </div>
      )}
    </div>
  )
}

export default function CircuitPuzzles({ record, sub = 'zarowka' }) {
  return (
    <div className="section">
      <h2>Zagadki obwodowe</h2>
      <BookRef pages="29–34" topics="Obwód prądu elektrycznego" />
      <p className="lead">
        Prąd płynie tylko w obwodzie <b>zamkniętym</b>. Jeśli końce żarówki połączy zwykły przewód,
        prawie cały prąd popłynie tym przewodem (prawie nie stawia oporu), a żarówka zgaśnie. Gdy w obwodzie
        nie zostaje żaden odbiornik, mamy <b>zwarcie</b>.
      </p>
      {sub === 'zarowka' && <BulbGame record={record} />}
      {sub === 'woda' && <WaterAnalogy record={record} />}
    </div>
  )
}
