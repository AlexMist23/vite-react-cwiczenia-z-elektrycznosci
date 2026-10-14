import { useState } from 'react'
import AnswerBtn from '../components/AnswerBtn.jsx'
import BookRef from '../components/BookRef.jsx'
import { pick, shuffle } from '../lib/physics.js'

// ---------- Balon i sweter: elektryzowanie przez potarcie ----------
const SWEATER_PAIRS = 8
const BALLOON_PAIRS = 5
const MAX_MOVED = 6

function Charges({ plus, minus, cx, cy, w, h }) {
  const items = [
    ...Array.from({ length: plus }, () => '+'),
    ...Array.from({ length: minus }, () => '−'),
  ]
  const cols = 4
  return items.map((s, i) => {
    const x = cx - w / 2 + (w / cols) * ((i % cols) + 0.5)
    const y = cy - h / 2 + 22 * Math.floor(i / cols) + 14
    return (
      <g key={i} className={s === '+' ? 'chg pos' : 'chg neg'}>
        <circle cx={x} cy={y} r="9" />
        <text x={x} y={y + 4.5} textAnchor="middle">{s}</text>
      </g>
    )
  })
}

function RubDemo() {
  const [moved, setMoved] = useState(0)
  const sw = moved
  const bl = -moved
  const sign = (q) => (q > 0 ? `+${q}` : q < 0 ? `−${-q}` : '0')
  return (
    <div className="card">
      <h3>Balon i wełniany sweter</h3>
      <p className="small muted">
        Każde kółko to ładunek jednej cząstki. Pocieraj i patrz, które ładunki się przemieszczają.
      </p>
      <svg viewBox="0 0 520 230" className="circuit medium-circuit">
        <rect x="20" y="30" width="200" height="170" rx="30" className="sweater" />
        <text x="120" y="222" textAnchor="middle" className="label small">sweter</text>
        <Charges plus={SWEATER_PAIRS} minus={SWEATER_PAIRS - moved} cx={120} cy={110} w={180} h={150} />
        <ellipse cx="400" cy="110" rx="95" ry="90" className="balloon" />
        <text x="400" y="222" textAnchor="middle" className="label small">balon</text>
        <Charges plus={BALLOON_PAIRS} minus={BALLOON_PAIRS + moved} cx={400} cy={100} w={150} h={140} />
      </svg>
      <div className="btn-row">
        <button className="btn primary" disabled={moved >= MAX_MOVED} onClick={() => setMoved((m) => m + 1)}>
          Potrzyj balon swetrem
        </button>
        <button className="btn" onClick={() => setMoved(0)}>Od nowa</button>
      </div>
      <div className="readout three">
        <div><span>ładunek swetra</span><b>{sign(sw)}</b></div>
        <div><span>ładunek balonu</span><b>{sign(bl)}</b></div>
        <div><span>razem</span><b>{sign(sw + bl)}</b></div>
      </div>
      {moved > 0 && (
        <p className="small">
          Przy pocieraniu przechodzą tylko <b>elektrony</b> (ze swetra na balon). Protony zostają na miejscu.
          Balon ma nadmiar elektronów, więc jest naelektryzowany <b>ujemnie</b>, a sweter, któremu brakuje
          elektronów, <b>dodatnio</b>. Łączny ładunek wciąż wynosi zero – to <b>zasada zachowania ładunku</b>.
        </p>
      )}
    </div>
  )
}

// ---------- Przyciągają czy odpychają ----------
const BODIES = [
  { name: 'balonik potarty swetrem', q: -1 },
  { name: 'szklana pałeczka potarta jedwabiem', q: 1 },
  { name: 'bursztyn potarty wełną', q: -1 },
  { name: 'sweter po potarciu balonika', q: 1 },
  { name: 'ciało naładowane ujemnie', q: -1 },
  { name: 'ciało naładowane dodatnio', q: 1 },
  { name: 'nienaelektryzowany pasek folii aluminiowej', q: 0 },
  { name: 'skrawek papieru (obojętny)', q: 0 },
]

function forceTask() {
  let a, b
  do {
    a = pick(BODIES)
    b = pick(BODIES)
  } while (a === b || (a.q === 0 && b.q === 0))
  const correct = a.q * b.q > 0 ? 'odpychają' : 'przyciągają'
  return { a, b, correct }
}

function ForceGame({ record }) {
  const [t, setT] = useState(forceTask)
  const [answer, setAnswer] = useState(null)
  const choose = (x) => {
    if (answer) return
    setAnswer(x)
    record('elektrostatyka', x === t.correct)
  }
  const why =
    t.a.q === 0 || t.b.q === 0
      ? 'Ciało naelektryzowane przyciąga też ciała obojętne: ładunki w nich przesuwają się tak, że bliżej są ładunki przeciwnego znaku.'
      : t.correct === 'odpychają'
        ? 'Ładunki tego samego znaku się odpychają.'
        : 'Ładunki przeciwnych znaków się przyciągają.'
  return (
    <div className="card game-card">
      <p className="question">
        Zbliżamy: <b>{t.a.name}</b> i <b>{t.b.name}</b>. Co się stanie?
      </p>
      <div className="answers two">
        {['przyciągają', 'odpychają'].map((x) => (
          <AnswerBtn key={x} id={x} answer={answer} correct={t.correct} choose={choose}>
            {x === 'przyciągają' ? '🧲 Przyciągają się' : '↔️ Odpychają się'}
          </AnswerBtn>
        ))}
      </div>
      {answer && (
        <div className={answer === t.correct ? 'feedback ok' : 'feedback bad'}>
          {answer === t.correct ? 'Dobrze! ' : 'Nie. '}
          {why}
          <button className="btn primary" onClick={() => { setT(forceTask()); setAnswer(null) }}>
            Następne →
          </button>
        </div>
      )}
    </div>
  )
}

// ---------- Przewodnik czy izolator ----------
const MATERIALS = [
  ['aluminium', true], ['miedź', true], ['złoto', true], ['żelazo', true], ['srebro', true],
  ['grafit (ołówek)', true], ['moneta', true], ['stalowy gwóźdź', true], ['woda z solą', true],
  ['guma', false], ['papier', false], ['porcelana', false], ['szkło', false], ['plastik (słomka)', false],
  ['drewno (suche)', false], ['korek', false], ['gumka do ścierania', false], ['powietrze (suche)', false],
]

function Conductors({ record }) {
  const [items, setItems] = useState(() => shuffle(MATERIALS).slice(0, 10))
  const [picked, setPicked] = useState({})
  const choose = (name, val, correct) => {
    if (name in picked) return
    setPicked((p) => ({ ...p, [name]: val }))
    record('elektrostatyka', val === correct)
  }
  const done = Object.keys(picked).length === items.length
  const good = items.filter(([n, c]) => picked[n] === c).length
  return (
    <div className="card">
      <h3>Przewodnik czy izolator?</h3>
      <p className="small muted">
        Przewodnik – ładunki mogą się w nim przemieszczać (w metalach są elektrony swobodne). Izolator –
        ładunki praktycznie nie mogą się przemieszczać.
      </p>
      <div className="material-grid">
        {items.map(([name, correct]) => {
          const p = picked[name]
          const state = p === undefined ? '' : p === correct ? 'ok' : 'bad'
          return (
            <div key={name} className={`device ${state}`}>
              <div className="device-name">{name}</div>
              <div className="chips">
                <button
                  className={`chip ${p !== undefined && correct ? 'right' : ''} ${p === true && !correct ? 'wrong' : ''}`}
                  disabled={p !== undefined}
                  onClick={() => choose(name, true, correct)}
                >
                  ⚡ przewodnik
                </button>
                <button
                  className={`chip ${p !== undefined && !correct ? 'right' : ''} ${p === false && correct ? 'wrong' : ''}`}
                  disabled={p !== undefined}
                  onClick={() => choose(name, false, correct)}
                >
                  🚫 izolator
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {done && (
        <div className="feedback info">
          Wynik: {good} / {items.length}.
          <button className="btn primary" onClick={() => { setItems(shuffle(MATERIALS).slice(0, 10)); setPicked({}) }}>
            Nowa runda →
          </button>
        </div>
      )}
    </div>
  )
}

// ---------- Indukcja elektrostatyczna ----------
function inductionTask() {
  const body = pick([
    { name: 'balonik naładowany ujemnie', q: -1 },
    { name: 'szklaną pałeczkę naładowaną dodatnio', q: 1 },
  ])
  const ask = pick(['A', 'B', 'flow'])
  return { body, ask }
}

function Induction({ record }) {
  const [t, setT] = useState(inductionTask)
  const [answer, setAnswer] = useState(null)
  const neg = t.body.q < 0
  // Koniec A jest bliżej ciała: pojawia się tam ładunek przeciwnego znaku.
  const correct = t.ask === 'flow' ? (neg ? 'AB' : 'BA') : t.ask === 'A' ? (neg ? '+' : '−') : neg ? '−' : '+'
  const options = t.ask === 'flow' ? [['AB', 'od A do B'], ['BA', 'od B do A']] : [['+', 'dodatnio'], ['−', 'ujemnie']]
  const question =
    t.ask === 'flow'
      ? 'W którą stronę przemieszczą się elektrony swobodne w sztabce?'
      : `Jak naładuje się koniec ${t.ask} sztabki?`
  const choose = (x) => {
    if (answer) return
    setAnswer(x)
    record('elektrostatyka', x === correct)
  }
  const endA = answer ? (neg ? '+' : '−') : ''
  const endB = answer ? (neg ? '−' : '+') : ''
  return (
    <div className="card game-card">
      <h3>Indukcja elektrostatyczna</h3>
      <p className="question">
        Do końca A obojętnej metalowej sztabki zbliżamy {t.body.name} (nie dotykamy). {question}
      </p>
      <svg viewBox="0 0 520 130" className="circuit medium-circuit">
        <circle cx="70" cy="65" r="50" className={neg ? 'body-neg' : 'body-pos'} />
        <text x="70" y="74" textAnchor="middle" className="big-sign">{neg ? '−' : '+'}</text>
        <rect x="160" y="40" width="320" height="50" rx="6" className="bar" />
        <text x="175" y="32" className="label small">A</text>
        <text x="465" y="32" className="label small">B</text>
        {answer && [0, 1, 2].map((i) => (
          <g key={i}>
            <text x="180" y={56 + i * 14} className={endA === '+' ? 'ind pos' : 'ind neg'}>{endA}</text>
            <text x="455" y={56 + i * 14} className={endB === '+' ? 'ind pos' : 'ind neg'}>{endB}</text>
          </g>
        ))}
      </svg>
      <div className="answers two">
        {options.map(([id, label]) => (
          <AnswerBtn key={id} id={id} answer={answer} correct={correct} choose={choose}>{label}</AnswerBtn>
        ))}
      </div>
      {answer && (
        <div className={answer === correct ? 'feedback ok' : 'feedback bad'}>
          {answer === correct ? 'Dobrze! ' : 'Nie. '}
          {neg
            ? 'Ujemny balonik odpycha elektrony swobodne na drugi koniec (B). Koniec A ma ich za mało, więc jest dodatni, a koniec B – ujemny.'
            : 'Dodatnia pałeczka przyciąga elektrony swobodne do końca A, więc A jest ujemny, a B (gdzie brakuje elektronów) – dodatni.'}{' '}
          Po odsunięciu ciała elektrony wracają i sztabka znów jest obojętna na całej długości.
          <button className="btn primary" onClick={() => { setT(inductionTask()); setAnswer(null) }}>
            Następne →
          </button>
        </div>
      )}
    </div>
  )
}

export default function Electrostatics({ record }) {
  return (
    <div className="section">
      <h2>Elektryzowanie ciał i ładunki</h2>
      <BookRef pages="16–28" topics="Elektryzowanie ciał · Ładunki elektryczne · Indukcja elektrostatyczna" />
      <div className="rule-box">
        <div>Są dwa rodzaje ładunków: <b>dodatnie (+)</b> i <b>ujemne (−)</b>. Jednoimienne się <b>odpychają</b>, różnoimienne <b>przyciągają</b>.</div>
        <div>Atom: jądro (protony <b>+</b>, neutrony obojętne) i elektrony <b>−</b>. Przy elektryzowaniu przemieszczają się tylko <b>elektrony</b>.</div>
        <div><b>1 C</b> to ładunek około <b>6 · 10¹⁸</b> elektronów; jeden elektron ma ładunek <b>−1,6 · 10⁻¹⁹ C</b> (ładunek elementarny).</div>
      </div>
      <RubDemo />
      <ForceGame record={record} />
      <Conductors record={record} />
      <Induction record={record} />
    </div>
  )
}
