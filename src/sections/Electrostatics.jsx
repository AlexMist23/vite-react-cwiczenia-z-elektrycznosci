import { useEffect, useState } from 'react'
import AnswerBtn from '../components/AnswerBtn.jsx'
import BookRef from '../components/BookRef.jsx'
import PeriodicTable from '../components/PeriodicTable.jsx'
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
          <p>
            Uwaga: „nadmiar” pojawia się dopiero <b>po</b> potarciu. Przed pocieraniem i balon, i sweter są
            obojętne (wszystkie ładunki w parach), więc żaden nie ma czego „oddawać”. Naelektryzowany balon
            rzeczywiście chętnie pozbyłby się nadmiaru – i robi to, gdy dotkniemy go ręką lub metalem (mówimy,
            że się <b>rozładowuje</b>).
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
  { name: 'balonik potarty swetrem', q: -1, why: 'guma zabrała elektrony z wełny, więc balonik ma ich nadmiar – jest naładowany ujemnie' },
  { name: 'szklana pałeczka potarta jedwabiem', q: 1, why: 'szkło oddało elektrony jedwabiowi, więc ma ich niedobór – jest naładowana dodatnio' },
  { name: 'bursztyn potarty wełną', q: -1, why: 'bursztyn zabrał elektrony z wełny, więc jest naładowany ujemnie' },
  { name: 'sweter po potarciu balonika', q: 1, why: 'sweter oddał elektrony balonikowi, więc ma ich niedobór – jest naładowany dodatnio' },
  { name: 'ciało naładowane ujemnie', q: -1, why: 'ma nadmiar elektronów – ładunek ujemny' },
  { name: 'ciało naładowane dodatnio', q: 1, why: 'ma niedobór elektronów – ładunek dodatni' },
  { name: 'nienaelektryzowany pasek folii aluminiowej', q: 0, why: 'nie jest naelektryzowany – ma tyle samo protonów co elektronów (obojętny)' },
  { name: 'skrawek papieru (obojętny)', q: 0, why: 'jest obojętny – ma tyle samo ładunków dodatnich co ujemnych' },
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
        ? `Oba ciała mają ładunek ${t.a.q > 0 ? 'dodatni' : 'ujemny'}, a ładunki tego samego znaku się odpychają.`
        : 'Jedno ciało jest naładowane dodatnio, a drugie ujemnie – ładunki przeciwnych znaków się przyciągają.'
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
          <div>
            <b>{answer === t.correct ? 'Dobrze! ' : 'Nie. '}</b>
            {why}
          </div>
          <ul className="force-sides">
            {[t.a, t.b].map((x) => (
              <li key={x.name}>
                <b>{x.q > 0 ? '➕' : x.q < 0 ? '➖' : '⚪'} {x.name[0].toUpperCase() + x.name.slice(1)}</b>: {x.why}.
              </li>
            ))}
          </ul>
          <button className="btn primary" onClick={() => { setT(forceTask()); setAnswer(null) }}>
            Następne →
          </button>
        </div>
      )}
    </div>
  )
}

// ---------- Przewodnik czy izolator ----------
// kind: p – przewodnik, s – półprzewodnik, i – izolator; els – pierwiastki, z których jest zbudowany
const MATERIALS = [
  { name: 'aluminium', kind: 'p', els: ['Al'], why: 'Metal – ma elektrony swobodne, które łatwo się przemieszczają. Z aluminium robi się np. przewody wysokiego napięcia.' },
  { name: 'miedź', kind: 'p', els: ['Cu'], why: 'Metal i jeden z najlepszych przewodników – dlatego przewody w domu i w kablach są miedziane.' },
  { name: 'złoto', kind: 'p', els: ['Au'], why: 'Metal, bardzo dobry przewodnik, który nie rdzewieje i nie koroduje – pokrywa się nim styki w elektronice.' },
  { name: 'żelazo', kind: 'p', els: ['Fe'], why: 'Metal – ma elektrony swobodne, więc przewodzi prąd (gorzej niż miedź, ale przewodzi).' },
  { name: 'srebro', kind: 'p', els: ['Ag'], why: 'Metal – najlepszy przewodnik ze wszystkich pierwiastków, ale za drogi na zwykłe przewody.' },
  { name: 'grafit (ołówek)', kind: 'p', els: ['C'], why: 'Grafit to czysty węgiel – niemetal, ale wyjątkowy: ma elektrony swobodne i przewodzi. Linia narysowana ołówkiem może zamknąć obwód!' },
  { name: 'moneta', kind: 'p', els: ['Cu', 'Ni', 'Zn', 'Fe'], why: 'Monety są z metali: stopów miedzi, niklu i cynku albo ze stali pokrytej mosiądzem (stop miedzi i cynku). Same metale – więc przewodzą.' },
  { name: 'stalowy gwóźdź', kind: 'p', els: ['Fe', 'C'], why: 'Stal to żelazo z odrobiną węgla. Prawie w całości metal – przewodzi prąd.' },
  { name: 'woda z solą', kind: 'p', els: ['H', 'O', 'Na', 'Cl'], why: 'Woda (H₂O) i sól kuchenna (NaCl). Sól rozpada się w wodzie na jony Na⁺ i Cl⁻, które mogą płynąć – dlatego roztwór przewodzi. Czysta woda destylowana prawie nie przewodzi.' },
  { name: 'krzem', kind: 's', els: ['Si'], why: 'Krzem to półmetal – półprzewodnik. W temperaturze pokojowej przewodzi słabo, ale z domieszkami pozwala sterować prądem – dlatego jest w każdym procesorze i panelu słonecznym.' },
  { name: 'german', kind: 's', els: ['Ge'], why: 'German to półmetal – półprzewodnik. Przewodzi słabo; robiono z niego pierwsze tranzystory.' },
  { name: 'guma', kind: 'i', els: ['C', 'H', 'S'], why: 'Guma to związek węgla i wodoru (z dodatkiem siarki). Elektrony są zajęte w wiązaniach – brak elektronów swobodnych, więc to izolator. Dlatego przewody okrywa się gumą lub plastikiem.' },
  { name: 'papier', kind: 'i', els: ['C', 'H', 'O'], why: 'Papier (celuloza) to związek węgla, wodoru i tlenu – izolator. Choć grafit z węgla przewodzi, w papierze węgiel jest związany z innymi atomami.' },
  { name: 'porcelana', kind: 'i', els: ['Si', 'Al', 'O'], why: 'Porcelana to związki krzemu, glinu i tlenu. Atomy metalu są związane z tlenem, więc nie ma elektronów swobodnych – to bardzo dobry izolator (izolatory na słupach).' },
  { name: 'szkło', kind: 'i', els: ['Si', 'O', 'Na', 'Ca'], why: 'Szkło to głównie krzem połączony z tlenem (plus trochę sodu i wapnia). Choć sam krzem jest półprzewodnikiem, a sód metalem, w szkle są związane z tlenem – izolator.' },
  { name: 'plastik (słomka)', kind: 'i', els: ['C', 'H'], why: 'Plastik to długie cząsteczki z węgla i wodoru. Elektrony są zajęte w wiązaniach – izolator. Z plastiku robi się obudowy wtyczek i osłony przewodów.' },
  { name: 'drewno (suche)', kind: 'i', els: ['C', 'H', 'O'], why: 'Drewno to związki węgla, wodoru i tlenu – suche jest izolatorem. Mokre może przewodzić, bo zawiera wodę z jonami.' },
  { name: 'korek', kind: 'i', els: ['C', 'H', 'O'], why: 'Korek to kora drzewa – związki węgla, wodoru i tlenu. Izolator.' },
  { name: 'gumka do ścierania', kind: 'i', els: ['C', 'H'], why: 'Gumka jest z gumy lub plastiku – związków węgla i wodoru. Izolator.' },
  { name: 'powietrze (suche)', kind: 'i', els: ['N', 'O', 'Ar'], why: 'Powietrze to głównie azot i tlen (i trochę argonu) – niemetale w postaci gazu. Izolator; przewodzi dopiero przy ogromnym napięciu (błyskawica).' },
]

const KIND_LABEL = { p: '⚡ przewodnik', s: '〰️ półprzewodnik', i: '🚫 izolator' }
const KIND_WORD = { p: 'przewodnik', s: 'półprzewodnik', i: 'izolator' }
const ROUND = 10

// w każdej rundzie jest jeden półprzewodnik, reszta losowo
const dealMaterials = () =>
  shuffle([pick(MATERIALS.filter((m) => m.kind === 's')), ...shuffle(MATERIALS.filter((m) => m.kind !== 's')).slice(0, ROUND - 1)])

function Conductors({ record }) {
  const [items, setItems] = useState(dealMaterials)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState({})
  const [summary, setSummary] = useState(false)
  const [focus, setFocus] = useState(null) // materiał podświetlony w podsumowaniu

  const m = items[idx]
  const p = picked[m.name]
  const good = items.filter((x) => picked[x.name] === x.kind).length

  const choose = (k) => {
    if (p) return
    setPicked((s) => ({ ...s, [m.name]: k }))
    record('elektrostatyka', k === m.kind)
  }
  const restart = () => {
    setItems(dealMaterials())
    setIdx(0)
    setPicked({})
    setSummary(false)
    setFocus(null)
  }

  // co podświetlić w układzie okresowym
  const highlight = summary ? (focus ? focus.els : [...new Set(items.flatMap((x) => x.els))]) : p ? m.els : []

  return (
    <div className="card">
      <h3>Przewodnik, półprzewodnik czy izolator?</h3>
      <p className="small muted">
        Przewodnik – ładunki mogą się w nim przemieszczać (w metalach są elektrony swobodne). Izolator – ładunki
        praktycznie nie mogą się przemieszczać. Półprzewodnik – przewodzi słabo. Po odpowiedzi zobaczysz w układzie
        okresowym, z jakich pierwiastków jest zbudowany materiał.
      </p>

      <div className="carousel-dots" aria-label="Postęp rundy">
        {items.map((x, i) => {
          const a = picked[x.name]
          return (
            <span
              key={x.name}
              className={`dot ${a ? (a === x.kind ? 'ok' : 'bad') : ''} ${!summary && i === idx ? 'cur' : ''}`}
            />
          )
        })}
      </div>

      {!summary ? (
        <div className="carousel-card">
          <div className="carousel-count">
            Materiał {idx + 1} z {items.length}
          </div>
          <div className="carousel-name">{m.name}</div>
          <div className="answers three">
            {['p', 's', 'i'].map((k) => (
              <AnswerBtn key={k} id={k} answer={p} correct={m.kind} choose={choose}>
                {KIND_LABEL[k]}
              </AnswerBtn>
            ))}
          </div>
          {p && (
            <div className={p === m.kind ? 'feedback ok' : 'feedback bad'}>
              <div>
                <b>{p === m.kind ? '✔ Dobrze. ' : `✘ To ${KIND_WORD[m.kind]}. `}</b>
                {m.why}
              </div>
              <div className="els-line">
                Zbudowany z:{' '}
                {m.els.map((e) => (
                  <span key={e} className="el-chip">{e}</span>
                ))}
              </div>
              <button
                className="btn primary"
                onClick={() => (idx + 1 < items.length ? setIdx(idx + 1) : setSummary(true))}
              >
                {idx + 1 < items.length ? 'Następny materiał →' : 'Pokaż podsumowanie →'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="carousel-card">
          <div className="carousel-count">
            Podsumowanie rundy: <b>{good}</b> / {items.length} dobrze. Kliknij materiał, żeby zobaczyć jego
            pierwiastki.
          </div>
          <div className="summary-list">
            {items.map((x) => {
              const ok = picked[x.name] === x.kind
              return (
                <button
                  key={x.name}
                  className={`summary-row ${ok ? 'ok' : 'bad'} ${focus === x ? 'sel' : ''}`}
                  onClick={() => setFocus(focus === x ? null : x)}
                >
                  <span>
                    {ok ? '✔' : '✘'} <b>{x.name}</b>
                  </span>
                  <span className="muted">{KIND_LABEL[x.kind]}</span>
                  <span>
                    {x.els.map((e) => (
                      <span key={e} className="el-chip">{e}</span>
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
          <button className="btn primary" onClick={restart}>
            Nowa runda →
          </button>
        </div>
      )}

      <PeriodicTable highlight={highlight} />
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

export default function Electrostatics({ record, sub = 'teoria' }) {
  return (
    <div className="section">
      <h2>Elektryzowanie ciał i ładunki</h2>
      <BookRef pages="16–28" topics="Elektryzowanie ciał · Ładunki elektryczne · Indukcja elektrostatyczna" />
      {sub === 'teoria' && (
        <>
        <div className="rule-box">
          <div>Są dwa rodzaje ładunków: <b>dodatnie (+)</b> i <b>ujemne (−)</b>. Jednoimienne się <b>odpychają</b>, różnoimienne <b>przyciągają</b>.</div>
          <div>Atom: jądro (protony <b>+</b>, neutrony obojętne) i elektrony <b>−</b>. Przy elektryzowaniu przemieszczają się tylko <b>elektrony</b>.</div>
          <div><b>1 C</b> to ładunek około <b>6 · 10¹⁸</b> elektronów; jeden elektron ma ładunek <b>−1,6 · 10⁻¹⁹ C</b> (ładunek elementarny).</div>
        </div>
        <RubDemo />
        </>
      )}
      {sub === 'przyciaganie' && <ForceGame record={record} />}
      {sub === 'przewodniki' && <Conductors record={record} />}
      {sub === 'indukcja' && <Induction record={record} />}
    </div>
  )
}
