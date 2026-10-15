import { useEffect, useState } from 'react'
import { ArrowRight, Ban, Check, Circle, Magnet, Minus, MoveHorizontal, Plus, RotateCcw, Waves, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Answers, Callout, Feedback, Panel, Question, Readout, ScoreDots, Section, Verdict } from '@/components/app/kit.jsx'
import { cn } from '@/lib/utils'
import AnswerBtn from '../components/AnswerBtn.jsx'
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
    <Panel title="Balon i wełniany sweter">
      <p className="text-sm text-muted-foreground">
        Para <b className="text-current-flow">+</b><b className="text-electron">−</b> to ładunki, które się równoważą
        (proton i elektron). Pocieraj i patrz, które ładunki się przemieszczają.
      </p>
      <svg viewBox="0 0 520 232" className="drawing mx-auto max-w-140">
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
      <div className="flex flex-wrap gap-2">
        <Button disabled={moved >= MAX_MOVED} onClick={rub}>
          Potrzyj balon swetrem
        </Button>
        <Button variant="outline" onClick={() => { setMoved(0); setFlying(null) }}>
          <RotateCcw data-icon="inline-start" />
          Od nowa
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <Readout label="ładunek swetra" value={sign(sw)} />
        <Readout label="ładunek balonu" value={sign(bl)} />
        <Readout label="razem" value={sign(sw + bl)} />
      </div>
      {moved > 0 && (
        <div className="flex flex-col gap-2 text-sm">
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
          <p className="text-muted-foreground">
            Balon jest izolatorem, więc dodatkowe elektrony zostają tam, gdzie go potarto – nie rozpływają się
            po całym balonie.
          </p>
        </div>
      )}
    </Panel>
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
    <Panel>
      <Question>
        Zbliżamy: <b className="text-sec">{t.a.name}</b> i <b className="text-sec">{t.b.name}</b>. Co się stanie?
      </Question>
      <Answers cols="two">
        {['przyciągają', 'odpychają'].map((x) => (
          <AnswerBtn key={x} id={x} answer={answer} correct={t.correct} choose={choose}>
            {x === 'przyciągają' ? <Magnet className="size-5 text-sec" /> : <MoveHorizontal className="size-5 text-sec" />}
            {x === 'przyciągają' ? 'Przyciągają się' : 'Odpychają się'}
          </AnswerBtn>
        ))}
      </Answers>
      {answer && (
        <Feedback tone={answer === t.correct ? 'ok' : 'bad'}>
          <div>
            <Verdict ok={answer === t.correct}>{answer === t.correct ? 'Dobrze!' : 'Nie.'}</Verdict> {why}
          </div>
          <ul className="flex flex-col gap-1.5">
            {[t.a, t.b].map((x) => {
              const Sign = x.q > 0 ? Plus : x.q < 0 ? Minus : Circle
              return (
                <li key={x.name} className="flex gap-2">
                  <Sign
                    className={cn(
                      'mt-1 size-4 shrink-0',
                      x.q > 0 ? 'text-current-flow' : x.q < 0 ? 'text-electron' : 'text-muted-foreground',
                    )}
                  />
                  <span>
                    <b>{x.name[0].toUpperCase() + x.name.slice(1)}</b>: {x.why}.
                  </span>
                </li>
              )
            })}
          </ul>
          <Button onClick={() => { setT(forceTask()); setAnswer(null) }}>
            Następne
            <ArrowRight data-icon="inline-end" />
          </Button>
        </Feedback>
      )}
    </Panel>
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

const KIND_ICON = { p: Zap, s: Waves, i: Ban }
const KIND_WORD = { p: 'przewodnik', s: 'półprzewodnik', i: 'izolator' }

function KindLabel({ k }) {
  const Icon = KIND_ICON[k]
  return (
    <>
      <Icon className="size-4.5 shrink-0 text-sec" />
      {KIND_WORD[k]}
    </>
  )
}

/** Symbol pierwiastka w żółtej plakietce. */
function ElChip({ e }) {
  return <span className="inline-block min-w-7.5 rounded-md bg-volt px-1.5 text-center text-sm font-extrabold text-foreground">{e}</span>
}
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
    <Panel>
      <ScoreDots items={items.map((x) => picked[x.name] && (picked[x.name] === x.kind ? 'ok' : 'bad'))} cur={summary ? -1 : idx} />

      {!summary ? (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-muted-foreground">
            Materiał {idx + 1} z {items.length}
          </div>
          <div className="text-2xl font-bold text-sec">{m.name}</div>
          <Answers cols="three">
            {['p', 's', 'i'].map((k) => (
              <AnswerBtn key={k} id={k} answer={p} correct={m.kind} choose={choose}>
                <KindLabel k={k} />
              </AnswerBtn>
            ))}
          </Answers>
          {p && (
            <Feedback tone={p === m.kind ? 'ok' : 'bad'}>
              <div>
                <Verdict ok={p === m.kind}>{p === m.kind ? 'Dobrze.' : `To ${KIND_WORD[m.kind]}.`}</Verdict> {m.why}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                Zbudowany z:
                {m.els.map((e) => (
                  <ElChip key={e} e={e} />
                ))}
              </div>
              <Button onClick={() => (idx + 1 < items.length ? setIdx(idx + 1) : setSummary(true))}>
                {idx + 1 < items.length ? 'Następny materiał' : 'Pokaż podsumowanie'}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Feedback>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-muted-foreground">
            Podsumowanie rundy: <b className="text-foreground">{good}</b> / {items.length} dobrze. Kliknij materiał, żeby
            zobaczyć jego pierwiastki.
          </div>
          <div className="grid gap-1.5">
            {items.map((x) => {
              const ok = picked[x.name] === x.kind
              return (
                <button
                  key={x.name}
                  type="button"
                  className={cn(
                    'grid grid-cols-1 items-center gap-0.5 rounded-lg border-2 bg-card px-3 py-2 text-left sm:grid-cols-[1.3fr_1fr_1.2fr] sm:gap-2',
                    ok ? 'border-success/50' : 'border-destructive/50 bg-destructive-soft',
                    focus === x && 'outline-3 outline-volt',
                  )}
                  onClick={() => setFocus(focus === x ? null : x)}
                >
                  <span className="flex items-center gap-1.5">
                    {ok ? <Check className="size-4 text-success" /> : <X className="size-4 text-destructive" />}
                    <b>{x.name}</b>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <KindLabel k={x.kind} />
                  </span>
                  <span className="flex flex-wrap gap-1">
                    {x.els.map((e) => (
                      <ElChip key={e} e={e} />
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
          <Button className="w-fit" onClick={restart}>
            Nowa runda
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      )}

      {/* układ okresowy dopiero po odpowiedzi – wcześniej podpowiadałby kolorami */}
      {(p || summary) && <PeriodicTable highlight={highlight} />}
    </Panel>
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
  return (
    <Panel>
      <Question>
        Do końca A obojętnej metalowej sztabki zbliżamy {t.body.name} (nie dotykamy). {question}
      </Question>
      <InductionDrawing neg={neg} state={answer ? 'split' : 'hidden'} />
      <Answers cols="two">
        {options.map(([id, label]) => (
          <AnswerBtn key={id} id={id} answer={answer} correct={correct} choose={choose}>{label}</AnswerBtn>
        ))}
      </Answers>
      {answer && (
        <Feedback tone={answer === correct ? 'ok' : 'bad'}>
          <div>
            <Verdict ok={answer === correct}>{answer === correct ? 'Dobrze!' : 'Nie.'}</Verdict>{' '}
            {neg
              ? 'Ujemny balonik odpycha elektrony swobodne na drugi koniec (B). Koniec A ma ich za mało, więc jest dodatni, a koniec B – ujemny.'
              : 'Dodatnia pałeczka przyciąga elektrony swobodne do końca A, więc A jest ujemny, a B (gdzie brakuje elektronów) – dodatni.'}{' '}
            Po odsunięciu ciała elektrony wracają i sztabka znów jest obojętna na całej długości.
          </div>
          <Button onClick={() => { setT(inductionTask()); setAnswer(null) }}>
            Następne
            <ArrowRight data-icon="inline-end" />
          </Button>
        </Feedback>
      )}
    </Panel>
  )
}

/**
 * Sztabka metalu obok naładowanego ciała.
 * state: 'hidden' – bez ładunków (pytanie), 'neutral' – ładunki w parach, 'split' – rozdzielone przez indukcję.
 */
function InductionDrawing({ neg, state, bodyFar = false }) {
  const endA = neg ? '+' : '−'
  const endB = neg ? '−' : '+'
  return (
    <svg viewBox="0 0 520 130" className="drawing mx-auto max-w-140">
      <g style={{ opacity: bodyFar ? 0.15 : 1, transition: 'opacity 0.4s' }}>
        <circle cx="70" cy="65" r="50" className={neg ? 'body-neg' : 'body-pos'} />
        <text x="70" y="74" textAnchor="middle" className="big-sign">{neg ? '−' : '+'}</text>
      </g>
      <rect x="160" y="40" width="320" height="50" rx="6" className="bar" />
      <text x="175" y="32" className="label small">A</text>
      <text x="465" y="32" className="label small">B</text>
      {state === 'split' &&
        [0, 1, 2].map((i) => (
          <g key={i}>
            <text x="180" y={56 + i * 14} className={endA === '+' ? 'ind pos' : 'ind neg'}>{endA}</text>
            <text x="455" y={56 + i * 14} className={endB === '+' ? 'ind pos' : 'ind neg'}>{endB}</text>
          </g>
        ))}
      {state === 'neutral' &&
        [215, 290, 365, 440].map((x) => (
          <g key={x}>
            <text x={x - 12} y="70" className="ind pos">+</text>
            <text x={x + 2} y="70" className="ind neg">−</text>
          </g>
        ))}
    </svg>
  )
}

/** Wyjaśnienie indukcji z pokazem: zbliż / odsuń naładowane ciało. */
function InductionTheory() {
  const [neg, setNeg] = useState(true)
  const [near, setNear] = useState(false)
  return (
    <>
      <Panel contentClassName="gap-3">
        <p>
          Naładowane ciało działa na ładunki w innym ciele <b>bez dotykania</b>. W metalowej sztabce są{' '}
          <b>elektrony swobodne</b> – gdy zbliżymy do niej naelektryzowane ciało, elektrony przesuwają się:
        </p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>ciało <b>ujemne</b> odpycha elektrony na drugi koniec sztabki,</li>
          <li>ciało <b>dodatnie</b> przyciąga elektrony do bliższego końca.</li>
        </ul>
        <p>
          Bliższy koniec ma wtedy ładunek <b>przeciwnego znaku</b> niż ciało, a dalszy – <b>tego samego znaku</b>. To
          jest <b>indukcja elektrostatyczna</b>.
        </p>
      </Panel>
      <Panel title="Pokaz">
        <InductionDrawing neg={neg} state={near ? 'split' : 'neutral'} bodyFar={!near} />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setNear((x) => !x)}>{near ? 'Odsuń ciało' : 'Zbliż ciało do końca A'}</Button>
          <Button variant="outline" onClick={() => setNeg((x) => !x)}>
            Zmień na ciało {neg ? 'dodatnie (+)' : 'ujemne (−)'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {near
            ? `Koniec A ma teraz ładunek ${neg ? 'dodatni' : 'ujemny'}, koniec B – ${neg ? 'ujemny' : 'dodatni'}. Sztabka jako całość nadal jest obojętna.`
            : 'Ciało jest daleko – ładunki w sztabce są wymieszane w parach, sztabka jest obojętna.'}
        </p>
      </Panel>
      <Callout tone="info" title="Dlatego naelektryzowany balonik przyciąga skrawki papieru">
        <p>
          W obojętnym ciele (także w izolatorze) ładunki się przesuwają: bliżej balonika są ładunki przeciwnego znaku,
          więc przyciąganie wygrywa z odpychaniem. Po odsunięciu ciała ładunki wracają na swoje miejsca.
        </p>
        <p>
          W <b>izolatorze</b> (papier) nie ma elektronów swobodnych – elektrony przesuwają się tylko na drugą stronę swoich
          cząsteczek. Podobnie naelektryzowany balonik odchyla <b>strumień wody</b> z kranu: cząsteczka wody z jednej
          strony ma przewagę ładunku dodatniego, a z drugiej – ujemnego.
        </p>
      </Callout>
      <Callout tone="info" title="Elektroskop i indukcja">
        <p>
          Gdy naelektryzowane ciało tylko <b>zbliżymy</b> do kulki elektroskopu (bez dotykania), wskazówka też się wychyla:
          ciało dodatnie przyciąga elektrony do kulki, a ujemne odpycha je na wskazówkę. Wskazówka wychyla się{' '}
          <b>niezależnie od znaku</b> ładunku i opada, gdy odsuniemy ciało.
        </p>
        <p>
          Tak samo działa chmura burzowa: jej spód jest naładowany ujemnie, więc odpycha elektrony w głąb ziemi, a
          powierzchnia ziemi pod chmurą elektryzuje się <b>dodatnio</b>.
        </p>
      </Callout>
    </>
  )
}

/** Elektroskop: listki z ładunkiem tego samego znaku odpychają się – tym bardziej, im większy ładunek. */
function ElectroscopeDemo() {
  const [q, setQ] = useState(0) // ładunek elektroskopu w umownych „porcjach”
  const [last, setLast] = useState(null)
  const angle = Math.min(Math.abs(q) * 13, 40)
  const sign = q > 0 ? '+' : '−'
  const touch = (dq, what) => {
    setQ((x) => Math.max(-4, Math.min(4, x + dq)))
    setLast(what)
  }
  const msg = {
    neg: 'Dotknęliśmy kulki ujemnym balonikiem: część jego nadmiarowych elektronów przeszła na elektroskop. Listki mają ładunek ujemny i się odpychają.',
    pos: 'Dotknęliśmy kulki dodatnią szklaną pałeczką: część elektronów z elektroskopu przeszła na pałeczkę. Listkom brakuje elektronów – mają ładunek dodatni i się odpychają.',
    hand: 'Dotknęliśmy kulki ręką: ładunek odpłynął przez nasze ciało do ziemi. Elektroskop jest obojętny, listki opadły.',
  }
  return (
    <Panel title="Pokaz: elektroskop" contentClassName="gap-3">
      <svg viewBox="0 0 300 200" className="drawing mx-auto max-w-80">
        <rect x="70" y="60" width="160" height="130" rx="8" className="bar" style={{ opacity: 0.35 }} />
        <circle cx="150" cy="30" r="14" className="bar" />
        <line x1="150" y1="44" x2="150" y2="120" className="sym" />
        {[-1, 1].map((d) => (
          <g key={d} transform={`rotate(${d * angle} 150 120)`} style={{ transition: 'transform 0.5s' }}>
            <line x1="150" y1="120" x2="150" y2="178" className="sym" strokeWidth="5" />
            {q !== 0 && (
              <text x={150 + d * 14} y="165" textAnchor="middle" className={q > 0 ? 'ind pos' : 'ind neg'}>
                {sign}
              </text>
            )}
          </g>
        ))}
        {q !== 0 && (
          <text x="150" y="35" textAnchor="middle" className={q > 0 ? 'ind pos' : 'ind neg'}>
            {sign}
          </text>
        )}
      </svg>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => touch(-2, 'neg')}>
          Dotknij ujemnym balonikiem
        </Button>
        <Button variant="outline" onClick={() => touch(2, 'pos')}>
          Dotknij dodatnią pałeczką
        </Button>
        <Button variant="outline" onClick={() => touch(-q, 'hand')}>
          Dotknij ręką
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {last ? msg[last] : 'Elektroskop jest obojętny – listki wiszą złożone. Dotknij kulki naelektryzowanym ciałem.'}
      </p>
    </Panel>
  )
}

/** Wyjaśnienie: elektryzowanie przez dotyk, zasada zachowania ładunku i elektroskop. */
function TouchTheory() {
  return (
    <>
      <Panel contentClassName="gap-3">
        <p>
          Ciało można naelektryzować także <b>przez dotyk</b>. Gdy naelektryzowanym ciałem dotkniemy ciała obojętnego,
          część elektronów przechodzi z jednego na drugie:
        </p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            z ciała naelektryzowanego <b>ujemnie</b> elektrony przechodzą <b>na</b> ciało obojętne,
          </li>
          <li>
            z ciała obojętnego elektrony przechodzą <b>na</b> ciało naelektryzowane <b>dodatnio</b>.
          </li>
        </ul>
        <p>
          W obu przypadkach dotknięte ciało ma potem ładunek <b>tego samego znaku</b> co ciało, którym go dotknęliśmy.
        </p>
      </Panel>
      <Callout tone="info" title="Zasada zachowania ładunku">
        <p>
          Ładunek nie powstaje ani nie znika. Łączny ładunek (liczony ze znakami + i −) pozostaje bez zmian – elektrony
          tylko przechodzą z ciała na ciało. Ile ich ubędzie w jednym, tyle przybędzie w drugim.
        </p>
      </Callout>
      <ElectroscopeDemo />
      <Callout tone="info" title="Do czego służy elektroskop?">
        <p>
          Elektroskop pokazuje, czy ciało jest naelektryzowane. Listki (albo wskazówka) mają ładunek tego samego znaku, więc
          się odpychają – im większy ładunek, tym bardziej się rozchylają. Elektroskop nie pokazuje jednak, czy ładunek jest
          dodatni, czy ujemny.
        </p>
      </Callout>
    </>
  )
}

/** Wyjaśnienie: przewodniki, półprzewodniki i izolatory – z układem okresowym do swobodnego oglądania. */
function ConductorsTheory() {
  return (
    <>
      <Panel contentClassName="gap-2">
        <p>
          <b>Przewodnik</b> – ładunki mogą się w nim swobodnie przemieszczać. W metalach są to <b>elektrony swobodne</b>.
          Przykłady: miedź, aluminium, żelazo, grafit, woda z solą.
        </p>
        <p>
          <b>Izolator</b> – ładunki praktycznie nie mogą się w nim przemieszczać. Przykłady: guma, plastik, szkło,
          porcelana, suche drewno, powietrze.
        </p>
        <p>
          <b>Półprzewodnik</b> – substancja, która w pewnych warunkach jest przewodnikiem, a w innych izolatorem (np.
          po oświetleniu albo podgrzaniu zaczyna przewodzić). Przykłady: krzem, german. Na tym działają ksero i drukarka
          laserowa.
        </p>
      </Panel>
      <Panel>
        <PeriodicTable />
      </Panel>
    </>
  )
}

function Charges() {
  return (
    <>
      <Panel contentClassName="gap-2">
        <p>Są dwa rodzaje ładunków: <b>dodatnie (+)</b> i <b>ujemne (−)</b>. Jednoimienne się <b>odpychają</b>, różnoimienne <b>przyciągają</b>.</p>
        <p>Atom: jądro (protony <b>+</b>, neutrony obojętne) i elektrony <b>−</b>. Przy elektryzowaniu przemieszczają się tylko <b>elektrony</b>.</p>
        <p><b>1 C</b> to ładunek około <b>6 · 10¹⁸</b> elektronów; jeden elektron ma ładunek <b>−1,6 · 10⁻¹⁹ C</b> (ładunek elementarny).</p>
      </Panel>
      <Callout tone="info" title="Ciało obojętne i naelektryzowane">
        <p>
          Ciało jest <b>obojętne</b>, gdy ma tyle samo protonów co elektronów. Ma <b>nadmiar elektronów</b> – jest
          naelektryzowane <b>ujemnie</b>; ma ich <b>niedobór</b> – jest naelektryzowane <b>dodatnio</b>.
        </p>
      </Callout>
    </>
  )
}

export default function Electrostatics({ record, sub = 'ladunki' }) {
  return (
    <Section>
      {sub === 'ladunki' && <Charges />}
      {sub === 'pocieranie' && (
        <>
          <RubDemo />
          <Callout tone="info" title="Od czego zależy siła elektryczna?">
            <p>
              Naelektryzowane ciała przyciągają się lub odpychają tym <b>silniej</b>, im <b>mocniej są naelektryzowane</b>{' '}
              (im więcej elektronów zyskały lub straciły) i im <b>bliżej</b> siebie się znajdują. Gdy się oddalają, siła
              maleje.
            </p>
          </Callout>
        </>
      )}
      {sub === 'dotyk-t' && <TouchTheory />}
      {sub === 'przyciaganie' && <ForceGame record={record} />}
      {sub === 'przewodniki-t' && <ConductorsTheory />}
      {sub === 'przewodniki' && <Conductors record={record} />}
      {sub === 'indukcja-t' && <InductionTheory />}
      {sub === 'indukcja' && <Induction record={record} />}
    </Section>
  )
}
