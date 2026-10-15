import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Power, RefreshCw, RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BookRef, Callout, Chip, FlowLegend, Lead, Panel, Readout, Section } from '@/components/app/kit.jsx'
import { cn } from '@/lib/utils'
import { CutWires, Symbol } from '../components/Symbols.jsx'
import { fmt } from '../lib/physics.js'

const CELL_V = 1.5
const BULB_R = 12 // Ω – jedna żarówka (6 V / 0,5 A)
const SHORT_R = 0.2 // Ω – opór wewnętrzny baterii, gdy jest zwarcie
const BULB_P_NOMINAL = 3 // W

// Obwód jako łamana – po niej poruszają się elektrony i strzałki prądu.
// Kolejność punktów = obieg zgodny z ruchem wskazówek zegara.
const LOOP = [
  [60, 60], [540, 60], [540, 300], [60, 300],
]
const LOOP_SHORT = [
  [60, 60], [540, 60], [540, 300], [500, 300], [500, 360], [100, 360], [100, 300], [60, 300],
]

function makePath(points) {
  const segs = []
  let total = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    segs.push({ a, b, len, start: total })
    total += len
  }
  const at = (s) => {
    s = ((s % total) + total) % total
    const seg = segs.find((g) => s >= g.start && s < g.start + g.len) ?? segs[segs.length - 1]
    const k = (s - seg.start) / seg.len
    const dx = (seg.b[0] - seg.a[0]) / seg.len
    const dy = (seg.b[1] - seg.a[1]) / seg.len
    return {
      x: seg.a[0] + (seg.b[0] - seg.a[0]) * k,
      y: seg.a[1] + (seg.b[1] - seg.a[1]) * k,
      nx: dy, // normalna na zewnątrz obwodu
      ny: -dx,
      angle: (Math.atan2(seg.b[1] - seg.a[1], seg.b[0] - seg.a[0]) * 180) / Math.PI,
    }
  }
  return { total, at }
}

const PATH = makePath(LOOP)
const PATH_SHORT = makePath(LOOP_SHORT)

const CHALLENGES = [
  {
    text: 'Zamknij obwód tak, żeby żarówka świeciła.',
    check: (s) => s.closed && !s.short && s.I > 0,
  },
  {
    text: 'Odwróć baterię przy zamkniętym obwodzie. Zobacz, co stało się z kierunkiem prądu i elektronów.',
    check: (s) => s.closed && s.flipped,
  },
  {
    text: 'Ustaw obwód tak, żeby amperomierz pokazał 0,25 A.',
    check: (s) => s.closed && !s.short && Math.abs(s.I - 0.25) < 1e-6,
  },
  {
    text: 'Ustaw obwód tak, żeby moc wynosiła 3 W (P = U · I).',
    check: (s) => s.closed && !s.short && Math.abs(s.P - 3) < 1e-6,
  },
  {
    text: 'Przepuść przez obwód ładunek co najmniej 100 C (q = I · t). Możesz przyspieszyć czas.',
    check: (s) => s.q >= 100,
  },
  {
    text: 'Wywołaj zwarcie (tylko w symulacji!) i zobacz, co dzieje się z natężeniem prądu.',
    check: (s) => s.closed && s.short,
  },
]

export default function CircuitSim({ record }) {
  const [cells, setCells] = useState(2)
  const [bulbs, setBulbs] = useState(1)
  const [closed, setClosed] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [short, setShort] = useState(false)
  const [view, setView] = useState('both') // 'current' | 'electrons' | 'both'
  const [speedup, setSpeedup] = useState(1)
  const [meter, setMeter] = useState({ t: 0, q: 0 })
  const [offset, setOffset] = useState(0)
  const [done, setDone] = useState(() => new Set())

  const U = cells * CELL_V
  const R = short ? SHORT_R : bulbs * BULB_R
  const I = closed ? U / R : 0
  const P = U * I
  const bulbP = closed && !short ? I * I * BULB_R : 0
  const brightness = Math.min(1, Math.sqrt(bulbP / BULB_P_NOMINAL))
  const path = short ? PATH_SHORT : PATH
  // Plus po lewej => prąd w obwodzie zewnętrznym płynie przeciwnie do ruchu wskazówek zegara.
  const currentDir = flipped ? 1 : -1

  // Animacja: przesunięcie cząstek i liczniki t, q.
  const state = useRef({ I, speedup })
  state.current = { I, speedup }
  useEffect(() => {
    if (!closed) return
    let raf
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const { I: cur, speedup: sp } = state.current
      setOffset((o) => o + dt * Math.min(240, 25 + cur * 160))
      setMeter((m) => ({ t: m.t + dt * sp, q: m.q + cur * dt * sp }))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [closed])

  const status = { closed, flipped, short, I, P, q: meter.q }
  useEffect(() => {
    CHALLENGES.forEach((c, i) => {
      if (!done.has(i) && c.check(status)) {
        setDone((d) => new Set(d).add(i))
        record('obwod', true)
      }
    })
  })

  const electrons = useMemo(() => {
    const n = Math.floor(path.total / 28)
    const sp = path.total / n
    const shift = closed ? -currentDir * offset : 0
    return Array.from({ length: n }, (_, i) => path.at(i * sp + shift))
  }, [path, offset, closed, currentDir])

  const arrows = useMemo(() => {
    if (!closed) return []
    const n = Math.floor(path.total / 70)
    const sp = path.total / n
    return Array.from({ length: n }, (_, i) => path.at(i * sp + currentDir * offset * 0.6 + 14))
  }, [path, offset, closed, currentDir])

  const bulbXs = { 1: [300], 2: [220, 380], 3: [180, 300, 420] }[bulbs]
  // środki elementów na przewodzie i połowa ich długości wzdłuż przewodu
  const elements = [[300, 60, 6], [60, 180, 14], [540, 180, 16], ...bulbXs.map((cx) => [cx, 300, 14])]
  // strzałki przy baterii gasną, żeby nie zasłaniały znaków + i −
  const arrowOpacity = (p) => (Math.abs(p.y - 60) > 5 ? 1 : Math.min(1, Math.max(0, (Math.abs(p.x - 300) - 30) / 14)))
  const insideElement = (p) => elements.some(([x, y, h]) => Math.max(Math.abs(p.x - x), Math.abs(p.y - y)) < h + 7)
  const showE = view !== 'current'
  const showI = view !== 'electrons'

  return (
    <Section>
      <BookRef pages="29–31" topics="Obwód prądu elektrycznego, zwarcie" />
      <Lead>
        Zbuduj prosty obwód: źródło napięcia, przewody, wyłącznik i żarówki. Kliknij wyłącznik, żeby zamknąć obwód.
        Obserwuj, w którą stronę płynie <b className="text-current-flow">prąd</b>, a w którą poruszają się{' '}
        <b className="text-electron">elektrony</b>.
      </Lead>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <Panel className="self-start">
          <svg viewBox="0 0 600 410" className="drawing" role="img" aria-label="Schemat obwodu">
            <CutWires
              id="sim-wires"
              holes={[[268, 48, 64, 24], [528, 140, 24, 80], [48, 152, 24, 56], ...bulbXs.map((cx) => [cx - 16, 288, 32, 24])]}
            >
              {/* przewody */}
              <polyline
                points={LOOP.concat([LOOP[0]]).map((p) => p.join(',')).join(' ')}
                className="wire"
              />
              {short && (
                <polyline
                  points="100,300 100,360 500,360 500,300"
                  className="wire wire-short"
                />
              )}
              {short && (
                <>
                  <circle cx="100" cy="300" r="5" className="dot-junction" />
                  <circle cx="500" cy="300" r="5" className="dot-junction" />
                </>
              )}
            </CutWires>

            {/* elektrony – chowają się w elementach, zamiast być ucinane w połowie */}
            {showE &&
              electrons.filter((p) => !insideElement(p)).map((p, i) => (
                <g key={i} transform={`translate(${p.x} ${p.y})`} className={`electron ${closed ? '' : 'idle'}`}>
                  <circle r="6.5" />
                  <text y="3.6" textAnchor="middle">−</text>
                </g>
              ))}

            {/* bateria */}
            <g className="el">
              <rect x="268" y="30" width="64" height="60" className="el-bg" />
              <Symbol type="cell" x={260} y={40} rotate={flipped ? 180 : 0} />
              <text x="300" y="112" textAnchor="middle" className="label">
                {fmt(U)} V
              </text>
            </g>

            {/* wyłącznik – klikalny */}
            <g
              className="el clickable"
              onClick={() => setClosed((c) => !c)}
              role="button"
              aria-label={closed ? 'Otwórz wyłącznik' : 'Zamknij wyłącznik'}
            >
              <rect x="510" y="140" width="60" height="80" className="el-bg" />
              <Symbol type={closed ? 'switchClosed' : 'switchOpen'} x={500} y={160} rotate={90} />
              <text x="525" y="184" textAnchor="end" className="label small">
                kliknij
              </text>
            </g>

            {/* amperomierz */}
            <g className="el">
              <rect x="40" y="152" width="40" height="56" className="el-bg" />
              <Symbol type="ammeter" x={20} y={160} rotate={90} />
              <text x="92" y="186" className="label">
                {fmt(I, 3)} A
              </text>
            </g>

            {/* żarówki */}
            {bulbXs.map((cx) => (
              <g key={cx} className="el">
                <circle cx={cx} cy="300" r={18 + 26 * brightness} className="glow" style={{ opacity: brightness }} />
                <rect x={cx - 16} y="284" width="32" height="32" className="el-bg" />
                <Symbol type="bulb" x={cx - 40} y={280} />
              </g>
            ))}

            {/* strzałki prądu – nad elementami, żeby maska ich nie ucinała */}
            {showI &&
              arrows.map((p, i) => (
                <path
                  key={i}
                  d="M -9 -7 L 9 0 L -9 7 Z"
                  className="arrow-current"
                  style={{ opacity: arrowOpacity(p) }}
                  transform={`translate(${p.x + p.nx * 17} ${p.y + p.ny * 17}) rotate(${p.angle + (currentDir === 1 ? 0 : 180)})`}
                />
              ))}
            {short && (
              <text x="300" y="402" textAnchor="middle" className="label danger">
                ZWARCIE! Prąd omija żarówki.
              </text>
            )}
            {!closed && (
              <text x="300" y="200" textAnchor="middle" className="label muted">
                Obwód otwarty – prąd nie płynie
              </text>
            )}
          </svg>
          <FlowLegend />
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel contentClassName="gap-5">
            <label className="flex flex-col gap-2.5 text-[0.95rem]">
              <span>
                Napięcie źródła: <b>{fmt(U)} V</b> ({cells} × 1,5 V)
              </span>
              <Slider min={1} max={4} step={1} value={[cells]} onValueChange={([v]) => setCells(v)} />
            </label>
            <label className="flex flex-col gap-2.5 text-[0.95rem]">
              <span>
                Liczba żarówek (połączonych szeregowo): <b>{bulbs}</b>
              </span>
              <Slider min={1} max={3} step={1} value={[bulbs]} onValueChange={([v]) => setBulbs(v)} />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button variant={closed ? 'success' : 'outline'} onClick={() => setClosed((c) => !c)}>
                <Power data-icon="inline-start" />
                {closed ? 'Otwórz wyłącznik' : 'Zamknij wyłącznik'}
              </Button>
              <Button variant="outline" onClick={() => setFlipped((f) => !f)}>
                <RefreshCw data-icon="inline-start" />
                Odwróć baterię
              </Button>
              <Button
                variant="destructive"
                className={cn(short && 'bg-destructive text-white hover:bg-destructive/85')}
                onClick={() => setShort((s) => !s)}
              >
                <TriangleAlert data-icon="inline-start" />
                {short ? 'Usuń zwarcie' : 'Zrób zwarcie'}
              </Button>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              value={view}
              onValueChange={(v) => v && setView(v)}
              aria-label="Co pokazać"
              className="w-full"
            >
              {[
                ['current', 'Prąd'],
                ['electrons', 'Elektrony'],
                ['both', 'Oba'],
              ].map(([k, t]) => (
                <ToggleGroupItem key={k} value={k} className="flex-1">
                  {t}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Panel>

          <Panel>
            <div className="grid grid-cols-2 gap-2.5">
              <Readout label="U" value={`${fmt(U)} V`} note="napięcie" />
              <Readout label="I" value={`${fmt(I, 3)} A`} note={`${fmt(I * 1000, 1)} mA`} />
              <Readout label="P = U·I" value={`${fmt(P, 2)} W`} note="moc" />
              <Readout label="t" value={`${fmt(meter.t, 1)} s`} note="czas pracy" />
              <Readout label="q = I·t" value={`${fmt(meter.q, 2)} C`} note="ładunek" />
              <Readout label="W = U·I·t" value={`${fmt(U * meter.q, 1)} J`} note="praca prądu" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              <span className="mr-1">Tempo czasu:</span>
              {[1, 10, 60].map((k) => (
                <Chip key={k} active={speedup === k} onClick={() => setSpeedup(k)}>
                  ×{k}
                </Chip>
              ))}
              <Chip onClick={() => setMeter({ t: 0, q: 0 })}>
                <RotateCcw />
                zeruj
              </Chip>
            </div>
          </Panel>
        </div>
      </div>

      {short && closed && (
        <Callout tone="danger" title="Zwarcie!">
          <p>
            Przewód połączył bieguny źródła z pominięciem żarówek. Opór jest bardzo mały, więc natężenie prądu rośnie do{' '}
            {fmt(I, 1)} A. Przewody i bateria mocno się nagrzewają – w prawdziwym obwodzie grozi to pożarem. Dlatego w
            domu stosujemy bezpieczniki.
          </p>
        </Callout>
      )}

      <Panel title="Wyzwania">
        <ol className="grid gap-2">
          {CHALLENGES.map((c, i) => (
            <li key={i} className={cn('flex items-start gap-2.5', done.has(i) && 'text-muted-foreground line-through')}>
              <span
                className={cn(
                  'grid size-6.5 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-muted-foreground',
                  done.has(i) && 'bg-success text-white',
                )}
              >
                {done.has(i) ? <Check className="size-4" /> : i + 1}
              </span>
              {c.text}
            </li>
          ))}
        </ol>
      </Panel>

      <Callout tone="info" title="Czy wiesz, że…">
        <p>
          …elektrony w przewodzie poruszają się bardzo wolno (ułamki milimetra na sekundę), ale żarówka zapala się
          natychmiast? Elektrony są w całym przewodzie od początku – po zamknięciu obwodu wszystkie ruszają
          jednocześnie. W symulacji widać je też przy otwartym obwodzie (stoją w miejscu).
        </p>
      </Callout>
    </Section>
  )
}
