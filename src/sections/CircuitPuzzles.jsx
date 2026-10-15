import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Droplets, MoveHorizontal, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Answers, Callout, Feedback, FlowLegend, Panel, Score, Section, Verdict } from '@/components/app/kit.jsx'
import { cn } from '@/lib/utils'
import AnswerBtn from '../components/AnswerBtn.jsx'
import { CutWires, Symbol } from '../components/Symbols.jsx'
import { makeAlong } from '../lib/pathFlow.js'
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

// Droga prądu w każdym obwodzie: ścieżki rysowane od bieguna „+” (u góry baterii) w stronę „−”.
// short – w obwodzie nie ma odbiornika, czyli zwarcie.
const LOOP = 'M40,110 V30 H300 V190 H40 Z'
const BYPASS = 'M40,110 V30 H110 V95 H230 V30 H300 V190 H40 Z'
const FLOWS = {
  series: (c) => ({ paths: c ? [LOOP] : [] }),
  'switch-shorts-bulb': (c) => ({ paths: [c ? BYPASS : LOOP], short: c }),
  'wire-shorts-bulb': (c) => ({ paths: c ? [BYPASS] : [], short: c }),
  'switch-parallel-wire': (c) => ({ paths: c ? [LOOP, 'M300,60 H370 V160 H300'] : [LOOP] }),
  'open-loop': () => ({ paths: [] }),
  'book-middle-wire': (c) => ({
    paths: c ? ['M40,110 V30 H210 V190 H40 Z', 'M210,30 H300 V190 H210'] : ['M40,110 V30 H210 V190 H40 Z'],
  }),
  'book-bulb-parallel-switch': (c) => ({ paths: [c ? LOOP : 'M40,110 V30 H170 V190 H40 Z'], short: c }),
  'series-bottom-switch': (c) => ({ paths: c ? [LOOP] : [] }),
  'book-bulb-shorted-top': (c) => ({ paths: c ? ['M40,140 V30 H300 V190 H40 Z'] : [], short: c }),
}

const SPEED = 40 // jednostek rysunku na sekundę – jak w symulatorze
const GAP_E = 34 // odstęp między elektronami
const GAP_I = 70 // odstęp między strzałkami prądu

/**
 * Ruch jak w symulatorze: elektrony (kółka z „−”) jadą po przewodzie od „−” do „+”,
 * a strzałki prądu obok przewodu – od „+” do „−”. Ścieżki są rysowane od bieguna „+”.
 * hide – kwadraty [x, y, pół-boku], w których elektron „chowa się” w elemencie; noArrows – gdzie nie rysować strzałek.
 */
function MovingCharges({ paths, hide, noArrows }) {
  const [t, setT] = useState(0)
  useEffect(() => {
    const slow = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0.25 : 1
    let raf
    let last = performance.now()
    const tick = (now) => {
      setT((v) => v + Math.min(0.1, (now - last) / 1000) * slow)
      last = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  const routes = useMemo(() => paths.map(makeAlong), [paths])
  const inside = (p, [x, y, h]) => Math.abs(p.x - x) < h && Math.abs(p.y - y) < h

  return routes.map(({ along, length }, r) => {
    const nE = Math.max(1, Math.round(length / GAP_E))
    const nI = Math.max(1, Math.round(length / GAP_I))
    const electrons = Array.from({ length: nE }, (_, i) => along((i * length) / nE - t * SPEED)).filter(
      (p) => !hide.some((h) => inside(p, h)),
    )
    // strzałki po lewej stronie kierunku ruchu – dla pętli od „+” to strona zewnętrzna
    const arrows = Array.from({ length: nI }, (_, i) => along((i * length) / nI + t * SPEED))
      .map((p) => ({ ...p, x: p.x + p.dy * 14, y: p.y - p.dx * 14 }))
      .filter((p) => !noArrows.some((h) => inside(p, h)))
    return (
      <g key={r}>
        {electrons.map((p, i) => (
          <g key={`e${i}`} transform={`translate(${p.x} ${p.y})`} className="electron">
            <circle r="6" />
            <text y="3.6" textAnchor="middle">
              −
            </text>
          </g>
        ))}
        {arrows.map((p, i) => (
          <path key={`a${i}`} d="M -8 -6 L 8 0 L -8 6 Z" className="arrow-current" transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`} />
        ))}
      </g>
    )
  })
}

/** showGlow – po odpowiedzi: żarówka świeci (albo nie) i widać, którędy płynie prąd. */
function PuzzleCircuit({ topo, closed, onToggle, showGlow }) {
  const lit = showGlow && topo.shines(closed)
  const flow = showGlow ? FLOWS[topo.id](closed) : { paths: [] }
  const bat = topo.bat ?? { x: 40, y: 110, rot: 90 } // „+” u góry, jak w podręczniku
  const bulb = topo.bulb ?? { x: 170, y: 30, rot: 0 }
  return (
    <svg viewBox="0 0 410 236" className="drawing mx-auto max-w-115">
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
      {flow.short && (
        <text x="170" y="230" textAnchor="middle" className="label danger">
          ZWARCIE – prąd omija żarówkę
        </text>
      )}
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
      {/* nad elementami, tak jak w symulatorze; key – po zmianie drogi prądu ruch zaczyna się od nowa */}
      {flow.paths.length > 0 && (
        <MovingCharges
          key={flow.paths.join('|')}
          paths={flow.paths}
          hide={[
            [bat.x, bat.y, 30],
            [bulb.x, bulb.y, 18],
            [topo.sw.x, topo.sw.y, 24],
          ]}
          noArrows={[
            [bat.x, bat.y, 34],
            [bulb.x, bulb.y, 28],
          ]}
        />
      )}
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
    <Panel title="Który opis pasuje do tego obwodu?" score={<Score ok={score.ok} all={score.all} />}>
      <PuzzleCircuit topo={topo} closed={closed} onToggle={() => answer && setClosed((c) => !c)} showGlow={!!answer} />
      {answer && <FlowLegend />}
      {answer && (
        <p className="text-center text-sm text-muted-foreground">
          Teraz możesz klikać wyłącznik i sprawdzić, kiedy żarówka świeci (wyłącznik:{' '}
          {closed ? 'zamknięty' : 'otwarty'}).
        </p>
      )}
      <Answers cols="two">
        {Object.entries(DESCRIPTIONS).map(([k, d]) => (
          <AnswerBtn key={k} id={k} answer={answer} correct={topo.answer} choose={choose}>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-bold">{k}</span>
            {d}
          </AnswerBtn>
        ))}
      </Answers>
      {answer && (
        <Feedback tone={answer === topo.answer ? 'ok' : 'bad'}>
          <div>
            <Verdict ok={answer === topo.answer}>{answer === topo.answer ? 'Dobrze!' : `Poprawnie: ${topo.answer}.`}</Verdict>{' '}
            {topo.why}
          </div>
          <Button onClick={next}>
            Następny obwód
            <ArrowRight data-icon="inline-end" />
          </Button>
        </Feedback>
      )}
    </Panel>
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
    <Panel title="Dopasuj elementy obwodu wodnego do elementów obwodu elektrycznego">
      <div className="grid gap-2">
        {ANALOGY.map(([w, e]) => (
          <div
            key={w}
            className={cn(
              'grid grid-cols-1 items-center gap-2 rounded-lg border-2 px-2.5 py-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-2.5',
              checked && (sel[w] === e ? 'border-success bg-success-soft' : 'border-destructive bg-destructive-soft'),
            )}
          >
            <span className="flex items-center gap-2">
              <Droplets className="size-4 shrink-0 text-electron" />
              {w}
            </span>
            <MoveHorizontal className="hidden size-4 text-muted-foreground sm:block" />
            <Select
              value={sel[w]}
              disabled={checked}
              onValueChange={(v) => setSel((s) => ({ ...s, [w]: v }))}
            >
              <SelectTrigger className="w-full bg-card">
                <SelectValue placeholder="wybierz…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {checked && sel[w] !== e && <span className="text-sm text-success sm:col-start-3">→ {e}</span>}
          </div>
        ))}
      </div>
      {!checked ? (
        <Button
          className="w-fit"
          disabled={!complete}
          onClick={() => {
            setChecked(true)
            ANALOGY.forEach(([w, e]) => record('zagadki', sel[w] === e))
          }}
        >
          Sprawdź
        </Button>
      ) : (
        <Feedback tone="info">
          <div>
            Wynik: <b>{good}</b> / {ANALOGY.length}. Bateria „podnosi” elektrony na wyższy poziom energii tak jak
            pompa wodę, a napięcie odpowiada różnicy poziomów wody.
          </div>
          <Button variant="outline" onClick={() => { setSel({}); setChecked(false) }}>
            <RotateCcw data-icon="inline-start" />
            Jeszcze raz
          </Button>
        </Feedback>
      )}
    </Panel>
  )
}

/** Obwód do klikania w wyjaśnieniach: wyłącznik przełącza się od razu, żarówka świeci według topologii. */
function DemoCircuit({ topoId, caption }) {
  const [closed, setClosed] = useState(false)
  const topo = TOPOLOGIES.find((x) => x.id === topoId)
  return (
    <Panel title="Pokaz" contentClassName="gap-2">
      <PuzzleCircuit topo={topo} closed={closed} onToggle={() => setClosed((c) => !c)} showGlow />
      <FlowLegend />
      <p className="text-center text-sm text-muted-foreground">
        Kliknij wyłącznik. Teraz jest <b className="text-foreground">{closed ? 'zamknięty' : 'otwarty'}</b> –{' '}
        {caption(closed, topo.shines(closed))}
      </p>
    </Panel>
  )
}

function CircuitTheory() {
  return (
    <>
      <Panel contentClassName="gap-3">
        <p>
          <b>Prąd elektryczny w metalu to uporządkowany ruch elektronów swobodnych.</b> Elektrony swobodne poruszają się w
          metalu zawsze, ale bezładnie – prądem nazywamy dopiero ruch uporządkowany, w jedną stronę. W cieczach i gazach
          prąd płynie dzięki jonom.
        </p>
        <p>
          Między biegunami baterii jest <b>napięcie elektryczne</b>: gdy połączymy je przewodem, popłynie prąd. Bateria
          jest więc <b>źródłem napięcia</b>; są nimi też np. prądnice i baterie słoneczne. W <b>ogniwie</b> napięcie
          powstaje dzięki reakcjom chemicznym, a <b>bateria</b> to kilka ogniw we wspólnej obudowie (bateria 9 V to 6 ogniw
          po 1,5 V).
        </p>
        <p>Najprostszy obwód elektryczny składa się z:</p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li><b>źródła napięcia</b> (bateria, akumulator, zasilacz) – to ono „napędza” ładunki,</li>
          <li><b>przewodów</b> – drogi, którą płyną ładunki,</li>
          <li><b>odbiornika</b> (żarówka, silnik, grzałka) – zamienia energię prądu na światło, ruch, ciepło…,</li>
          <li><b>wyłącznika</b> – zamyka albo przerywa drogę prądu.</li>
        </ul>
      </Panel>
      <DemoCircuit
        topoId="series"
        caption={(closed) => (closed ? 'obwód jest zamknięty, płynie prąd i żarówka świeci.' : 'obwód jest przerwany, prąd nie płynie.')}
      />
      <Callout tone="info" title="Zapamiętaj">
        <p>Prąd płynie tylko w obwodzie <b>zamkniętym</b> – bieguny źródła napięcia muszą być połączone przewodnikiem.</p>
      </Callout>
      <Callout tone="warn" title="Dlaczego ptaki mogą siedzieć na przewodach?">
        <p>
          Ptak dotyka tylko jednego przewodu, a nie dotyka ziemi – nie zamyka obwodu, więc przez niego nie płynie prąd.
          Gdyby dotknął jednocześnie przewodu i słupa, zostałby porażony. Z tego samego powodu monter na izolowanym
          podnośniku może dotykać przewodu, ale nie może dotknąć słupa ani niczego połączonego z ziemią.
        </p>
      </Callout>
    </>
  )
}

function ShortTheory() {
  return (
    <>
      <Panel contentClassName="gap-3">
        <p>
          Zwykły przewód prawie nie stawia oporu. Jeśli połączymy nim oba końce żarówki, prawie cały prąd popłynie
          „na skróty” przewodem, a przez żarówkę – praktycznie nic. Żarówka gaśnie.
        </p>
        <p>
          Gdy bieguny źródła połączy sam przewód, bez żadnego odbiornika, mamy <b>zwarcie</b> – prąd płynie
          „łatwiejszą” drogą. Natężenie prądu bardzo rośnie, przewody i bateria mocno się nagrzewają, a bateria szybko się
          rozładowuje. Prąd zwarcia płynie zawsze, gdy połączymy przewodnikiem bieguny baterii – nawet jeśli obok jest
          żarówka.
        </p>
      </Panel>
      <DemoCircuit
        topoId="switch-shorts-bulb"
        caption={(closed, lit) =>
          lit
            ? 'prąd płynie przez żarówkę i ona świeci.'
            : 'wyłącznik łączy końce żarówki przewodem: prąd omija żarówkę, a w obwodzie nie ma odbiornika – to zwarcie.'
        }
      />
      <Callout tone="danger" title="Zwarcie jest niebezpieczne">
        <p>W prawdziwym obwodzie zwarcie grozi pożarem. Dlatego w domowej instalacji są bezpieczniki, które wtedy przerywają obwód.</p>
      </Callout>
    </>
  )
}

function WaterTheory() {
  return (
    <>
      <Panel contentClassName="gap-3">
        <p>
          Prąd elektryczny łatwiej zrozumieć, porównując go z obiegiem wody. Wyobraź sobie zamknięty obieg: <b>pompa</b>{' '}
          tłoczy wodę w górę, woda spływa <b>rurami</b> w dół i po drodze obraca <b>koło wodne</b>. <b>Zawór</b> może
          zamknąć rurę i zatrzymać przepływ.
        </p>
        <p>
          Im większa <b>różnica poziomów</b> między górą a dołem, tym mocniej woda napiera i tym więcej pracy może
          wykonać koło wodne.
        </p>
      </Panel>
      <Callout tone="info" title="Pomyśl, zanim przejdziesz dalej">
        <p>
          Który element obwodu elektrycznego działa jak pompa? Co odpowiada rurom, a co kołu wodnemu? Czym w obwodzie
          jest „różnica poziomów”? W następnym kroku dopasujesz pary.
        </p>
      </Callout>
    </>
  )
}

export default function CircuitPuzzles({ record, sub = 'zarowka' }) {
  return (
    <Section>
      {sub === 'obwod-t' && <CircuitTheory />}
      {sub === 'zwarcie-t' && <ShortTheory />}
      {sub === 'woda-t' && <WaterTheory />}
      {sub === 'zarowka' && <BulbGame record={record} />}
      {sub === 'woda' && <WaterAnalogy record={record} />}
    </Section>
  )
}
