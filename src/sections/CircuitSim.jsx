import { useEffect, useMemo, useRef, useState } from 'react'
import { Symbol } from '../components/Symbols.jsx'
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
  const showE = view !== 'current'
  const showI = view !== 'electrons'

  return (
    <div className="section">
      <h2>Symulator obwodu elektrycznego</h2>
      <p className="lead">
        Zbuduj prosty obwód: źródło napięcia, przewody, wyłącznik i żarówki. Kliknij wyłącznik,
        żeby zamknąć obwód. Obserwuj, w którą stronę płynie <b className="c-current">prąd</b>, a w którą
        poruszają się <b className="c-electron">elektrony</b>.
      </p>

      <div className="sim-layout">
        <div className="card sim-card">
          <svg viewBox="0 0 600 410" className="circuit" role="img" aria-label="Schemat obwodu">
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

            {/* elektrony */}
            {showE &&
              electrons.map((p, i) => (
                <g key={i} transform={`translate(${p.x} ${p.y})`} className={`electron ${closed ? '' : 'idle'}`}>
                  <circle r="6.5" />
                  <text y="3.6" textAnchor="middle">−</text>
                </g>
              ))}

            {/* strzałki prądu */}
            {showI &&
              arrows.map((p, i) => (
                <path
                  key={i}
                  d="M -9 -7 L 9 0 L -9 7 Z"
                  className="arrow-current"
                  transform={`translate(${p.x + p.nx * 17} ${p.y + p.ny * 17}) rotate(${p.angle + (currentDir === 1 ? 0 : 180)})`}
                />
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

          <div className="legend">
            <span><i className="lg-current" /> kierunek prądu (umowny): od „+” do „−”</span>
            <span><i className="lg-electron" /> elektrony: od „−” do „+”</span>
          </div>
        </div>

        <div className="sim-side">
          <div className="card controls">
            <label>
              Napięcie źródła: <b>{fmt(U)} V</b> ({cells} × 1,5 V)
              <input type="range" min="1" max="4" value={cells} onChange={(e) => setCells(+e.target.value)} />
            </label>
            <label>
              Liczba żarówek (połączonych szeregowo): <b>{bulbs}</b>
              <input type="range" min="1" max="3" value={bulbs} onChange={(e) => setBulbs(+e.target.value)} />
            </label>
            <div className="btn-row">
              <button className={closed ? 'btn on' : 'btn'} onClick={() => setClosed((c) => !c)}>
                {closed ? 'Otwórz wyłącznik' : 'Zamknij wyłącznik'}
              </button>
              <button className="btn" onClick={() => setFlipped((f) => !f)}>
                Odwróć baterię
              </button>
              <button className={short ? 'btn danger on' : 'btn danger'} onClick={() => setShort((s) => !s)}>
                {short ? 'Usuń zwarcie' : 'Zrób zwarcie'}
              </button>
            </div>
            <div className="seg" role="radiogroup" aria-label="Co pokazać">
              {[
                ['current', 'Prąd'],
                ['electrons', 'Elektrony'],
                ['both', 'Oba'],
              ].map(([k, t]) => (
                <button key={k} className={view === k ? 'active' : ''} onClick={() => setView(k)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="card readout">
            <div><span>U</span><b>{fmt(U)} V</b><small>napięcie</small></div>
            <div><span>I</span><b>{fmt(I, 3)} A</b><small>{fmt(I * 1000, 1)} mA</small></div>
            <div><span>P = U·I</span><b>{fmt(P, 2)} W</b><small>moc</small></div>
            <div><span>t</span><b>{fmt(meter.t, 1)} s</b><small>czas pracy</small></div>
            <div><span>q = I·t</span><b>{fmt(meter.q, 2)} C</b><small>ładunek</small></div>
            <div><span>W = U·I·t</span><b>{fmt(U * meter.q, 1)} J</b><small>praca prądu</small></div>
            <div className="readout-foot">
              <span>Tempo czasu:</span>
              {[1, 10, 60].map((k) => (
                <button key={k} className={speedup === k ? 'chip active' : 'chip'} onClick={() => setSpeedup(k)}>
                  ×{k}
                </button>
              ))}
              <button className="chip" onClick={() => setMeter({ t: 0, q: 0 })}>
                zeruj
              </button>
            </div>
          </div>
        </div>
      </div>

      {short && closed && (
        <div className="callout danger">
          <b>Zwarcie!</b> Przewód połączył bieguny źródła z pominięciem żarówek. Opór jest bardzo mały,
          więc natężenie prądu rośnie do {fmt(I, 1)} A. Przewody i bateria mocno się nagrzewają – w
          prawdziwym obwodzie grozi to pożarem. Dlatego w domu stosujemy bezpieczniki.
        </div>
      )}

      <div className="card">
        <h3>Wyzwania</h3>
        <ol className="challenges">
          {CHALLENGES.map((c, i) => (
            <li key={i} className={done.has(i) ? 'done' : ''}>
              <span className="tick">{done.has(i) ? '✔' : i + 1}</span> {c.text}
            </li>
          ))}
        </ol>
      </div>

      <div className="callout info">
        <b>Czy wiesz, że…</b> elektrony w przewodzie poruszają się bardzo wolno (ułamki milimetra na
        sekundę), ale żarówka zapala się natychmiast? Elektrony są w całym przewodzie od początku –
        po zamknięciu obwodu wszystkie ruszają jednocześnie. W symulacji widać je też przy otwartym
        obwodzie (stoją w miejscu).
      </div>
    </div>
  )
}
