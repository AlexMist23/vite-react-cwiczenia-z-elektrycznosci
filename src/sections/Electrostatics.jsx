import { useEffect, useState } from 'react'
import AnswerBtn from '../components/AnswerBtn.jsx'
import BookRef from '../components/BookRef.jsx'
import { pick, shuffle } from '../lib/physics.js'

// ---------- Balon i sweter: elektryzowanie przez potarcie ----------
// Para „+ −” to obojętny kawałek materii (proton i elektron). Pocieranie przenosi
// pojedyncze elektrony ze swetra na balon; protony zostają na miejscu.
const SWEATER_PAIRS = [
  [145, 85], [145, 115], [145, 145], [145, 175],
  [85, 85], [85, 115], [85, 145], [85, 175],
] // najpierw prawa kolumna – ta strona swetra dotyka balonu
const BALLOON_PAIRS = [[395, 60], [445, 60], [390, 105], [445, 105], [415, 150]]
// balon jest izolatorem: dodatkowe elektrony zostają tam, gdzie go potarto (lewy bok)
const BALLOON_EXTRA = [-10, 10, -30, 30, -50, 50].map((deg) => {
  const r = (deg * Math.PI) / 180
  return [Math.round(400 - 80 * Math.cos(r)), Math.round(105 + 75 * Math.sin(r))]
})
const MAX_MOVED = BALLOON_EXTRA.length

function Charge({ x, y, sign, cls = '' }) {
  return (
    <g className={`chg ${sign === '+' ? 'pos' : 'neg'} ${cls}`}>
      <circle cx={x} cy={y} r="9" />
      <text x={x} y={y + 4.5} textAnchor="middle">{sign}</text>
    </g>
  )
}

function Sweater() {
  return (
    <g className="sweater">
      <path
        className="sweater-body"
        d="M78,32 Q120,62 162,32 L205,46 Q222,58 232,118 L206,128 L190,92 L190,202 L50,202 L50,92 L34,128 L8,118 Q18,58 35,46 Z"
      />
      <path className="sweater-rib" d="M78,32 Q120,62 162,32 M84,34 Q120,56 156,34" />
      <path className="sweater-rib" d="M50,190 H190 M60,190 V202 M75,190 V202 M90,190 V202 M105,190 V202 M120,190 V202 M135,190 V202 M150,190 V202 M165,190 V202 M180,190 V202" />
      <path className="sweater-rib" d="M10,110 L35,120 M230,110 L205,120" />
    </g>
  )
}

function RubDemo() {
  const [moved, setMoved] = useState(0)
  const [flying, setFlying] = useState(null) // numer elektronu, który właśnie leci
  const sw = moved
  const bl = -moved
  const sign = (q) => (q > 0 ? `+${q}` : q < 0 ? `−${-q}` : '0')

  // zapas na wypadek, gdyby animacja się nie zakończyła (np. karta w tle)
  useEffect(() => {
    if (flying === null) return
    const t = setTimeout(() => setFlying(null), 900)
    return () => clearTimeout(t)
  }, [flying])

  const rub = () => {
    if (moved >= MAX_MOVED) return
    setFlying(moved)
    setMoved((m) => m + 1)
  }

  const from = flying !== null ? SWEATER_PAIRS[flying] : null
  const to = flying !== null ? BALLOON_EXTRA[flying] : null

  return (
    <div className="card">
      <h3>Balon i wełniany sweter</h3>
      <p className="small muted">
        Para <b className="c-current">+</b><b className="c-electron">−</b> to ładunki, które się równoważą
        (proton i elektron). Pocieraj i patrz, które ładunki się przemieszczają.
      </p>
      <svg viewBox="0 0 520 232" className="circuit medium-circuit">
        <Sweater />
        <text x="120" y="224" textAnchor="middle" className="label small">wełniany sweter</text>
        {SWEATER_PAIRS.map(([x, y], i) => (
          <g key={i}>
            <Charge x={x - 11} y={y} sign="+" />
            {i < moved ? (
              <circle cx={x + 11} cy={y} r="8" className="chg-hole" />
            ) : (
              <Charge x={x + 11} y={y} sign="−" />
            )}
          </g>
        ))}

        <ellipse cx="400" cy="105" rx="95" ry="90" className="balloon" />
        <path d="M400,195 l-7,10 h14 Z M400,205 q-8,12 4,24" className="balloon-knot" />
        <text x="470" y="224" textAnchor="middle" className="label small">balon</text>
        {BALLOON_PAIRS.map(([x, y], i) => (
          <g key={i}>
            <Charge x={x - 11} y={y} sign="+" />
            <Charge x={x + 11} y={y} sign="−" />
          </g>
        ))}
        {BALLOON_EXTRA.slice(0, moved).map(([x, y], i) =>
          i === flying ? null : <Charge key={i} x={x} y={y} sign="−" cls="extra" />,
        )}

        {flying !== null && (
          <g
            key={flying}
            className="fly"
            style={{ '--dx': `${to[0] - from[0] - 11}px`, '--dy': `${to[1] - from[1]}px` }}
            onAnimationEnd={() => setFlying(null)}
          >
            <Charge x={from[0] + 11} y={from[1]} sign="−" />
          </g>
        )}
      </svg>
      <div className="btn-row">
        <button className="btn primary" disabled={moved >= MAX_MOVED} onClick={rub}>
          Potrzyj balon swetrem
        </button>
        <button className="btn" onClick={() => { setMoved(0); setFlying(null) }}>Od nowa</button>
      </div>
      <div className="readout three">
        <div><span>ładunek swetra</span><b>{sign(sw)}</b></div>
        <div><span>ładunek balonu</span><b>{sign(bl)}</b></div>
        <div><span>razem</span><b>{sign(sw + bl)}</b></div>
      </div>
      {moved > 0 && (
        <div className="small rub-explain">
          <p>
            Przechodzą tylko <b>elektrony</b> – ze swetra na balon. Protony siedzą w jądrach atomów i się nie
            ruszają. Guma balonu mocniej „trzyma” elektrony niż wełna, dlatego płyną właśnie w tę stronę.
          </p>
          <p>
            Balon ma <b>nadmiar elektronów</b> → jest naelektryzowany <b>ujemnie</b>. Swetrowi elektronów{' '}
            <b>brakuje</b> (puste kółka) → jest naelektryzowany <b>dodatnio</b>. Łączny ładunek nadal wynosi
            zero – to <b>zasada zachowania ładunku</b>.
          </p>
          <p className="muted">
            Balon jest izolatorem, więc dodatkowe elektrony zostają tam, gdzie go potarto – nie rozpływają się
            po całym balonie.
          </p>
        </div>
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
