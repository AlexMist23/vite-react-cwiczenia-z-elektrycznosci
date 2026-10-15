import { useEffect, useRef, useState } from 'react'
import { useProgress } from './lib/progress.js'
import Notes from './sections/Notes.jsx'
import CircuitSim from './sections/CircuitSim.jsx'
import SymbolGame from './sections/SymbolGame.jsx'
import DirectionGame from './sections/DirectionGame.jsx'
import Media from './sections/Media.jsx'
import Effects from './sections/Effects.jsx'
import Triangles from './sections/Triangles.jsx'
import FormulaTrainer from './sections/FormulaTrainer.jsx'
import FormulaToCalc from './sections/FormulaToCalc.jsx'
import Units from './sections/Units.jsx'
import Problems from './sections/Problems.jsx'
import Quiz from './sections/Quiz.jsx'
import Electrostatics from './sections/Electrostatics.jsx'
import CircuitPuzzles from './sections/CircuitPuzzles.jsx'

export const GROUPS = [
  { id: 'ladunki', title: 'Elektryzowanie ciał', color: '#ae3ec9' },
  { id: 'obwody', title: 'Obwody elektryczne', color: '#7048e8' },
  { id: 'prad', title: 'Przepływ prądu', color: '#f76707' },
  { id: 'wzory', title: 'Wzory i obliczenia', color: '#1c7ed6' },
  { id: 'powtorka', title: 'Powtórka', color: '#2b8a3e' },
]

export const SECTIONS = [
  // kolejność jak w zeszycie: elektryzowanie → obwód (z kierunkiem prądu) → skutki → ośrodki → napięcie, natężenie, praca i moc → przedrostki → zadania
  { id: 'elektrostatyka', group: 'ladunki', icon: '🎈', title: 'Elektryzowanie i ładunki', desc: 'Balon i sweter, przewodniki i izolatory, indukcja.', C: Electrostatics, subs: [{ id: 'teoria', title: 'Ładunki i elektryzowanie', kind: 't' }, { id: 'przyciaganie', title: 'Przyciągają czy odpychają?', kind: 'c' }, { id: 'przewodniki', title: 'Przewodnik czy izolator?', kind: 'c' }, { id: 'indukcja', title: 'Indukcja', kind: 'c' }] },
  { id: 'obwod', group: 'obwody', icon: '🔌', title: 'Symulator obwodu', desc: 'Zbuduj obwód, zamknij wyłącznik, zobacz prąd i elektrony.', C: CircuitSim },
  { id: 'symbole', group: 'obwody', icon: '✏️', title: 'Symbole', desc: 'Rozpoznaj symbole elementów obwodu.', C: SymbolGame, subs: [{ id: 'sciaga', title: 'Ściąga symboli', kind: 't' }, { id: 'rozpoznaj', title: 'Rozpoznaj symbol', kind: 'c' }] },
  { id: 'zagadki', group: 'obwody', icon: '🧩', title: 'Zagadki obwodowe', desc: 'Czy żarówka świeci? Prąd jak woda.', C: CircuitPuzzles, subs: [{ id: 'zarowka', title: 'Czy żarówka świeci?', kind: 'c' }, { id: 'woda', title: 'Prąd jak woda', kind: 'c' }] },
  { id: 'kierunki', group: 'obwody', icon: '🔄', title: 'Kierunek prądu', desc: 'Prąd od „+” do „−”, elektrony od „−” do „+”.', C: DirectionGame, subs: [{ id: 'zasada', title: 'Zasada i pokaz', kind: 't' }, { id: 'cwiczenie', title: 'W którą stronę?', kind: 'c' }] },
  { id: 'skutki', group: 'prad', icon: '💡', title: 'Skutki prądu', desc: 'Cieplny, świetlny, mechaniczny, chemiczny…', C: Effects, subs: [{ id: 'rodzaje', title: 'Rodzaje skutków', kind: 't' }, { id: 'cwiczenie', title: 'Jaki skutek?', kind: 'c' }] },
  { id: 'osrodki', group: 'prad', icon: '🧊', title: 'Ciała stałe, ciecze, gazy', desc: 'Co przenosi ładunek w różnych ośrodkach?', C: Media, subs: [{ id: 'nosniki', title: 'Nośniki ładunku', kind: 't' }, { id: 'cwiczenie', title: 'Co przenosi ładunek?', kind: 'c' }] },
  { id: 'wzory', group: 'wzory', icon: '🔺', title: 'Trójkąty wzorów', desc: 'U = E/q, I = q/t, P = U·I, W = U·I·t', C: Triangles, subs: [{ id: 'piramidy', title: 'Piramidy i przykłady', kind: 't' }, { id: 'cwiczenie', title: 'Który wzór?', kind: 'c' }] },
  { id: 'trening', group: 'wzory', icon: '🧠', title: 'Trening wzorów i piramid', desc: 'Ułóż piramidę, złóż wzór z klocków, symbole i jednostki.', C: FormulaTrainer, subs: [{ id: 'piramida', title: 'Ułóż piramidę', kind: 'c' }, { id: 'wzor', title: 'Ułóż wzór', kind: 'c' }, { id: 'symbole', title: 'Symbol i jednostka', kind: 'c' }] },
  { id: 'jednostki', group: 'wzory', icon: '📏', title: 'Jednostki i przedrostki', desc: 'mA, kV, kWh, Ah – zamieniaj bez pomyłek.', C: Units, subs: [{ id: 'przedrostki', title: 'Przedrostki i jednostki', kind: 't' }, { id: 'cwiczenie', title: 'Zamień jednostki', kind: 'c' }] },
  { id: 'wzor-obliczenie', group: 'wzory', icon: '🧪', title: 'Wzór → obliczenie', desc: 'Najpierw ułóż wzór, potem policz – wynik jest sprawdzany.', C: FormulaToCalc },
  { id: 'zadania', group: 'wzory', icon: '🧮', title: 'Zadania obliczeniowe', desc: 'Dane, szukane, wzór, wynik – krok po kroku.', C: Problems },
  { id: 'quiz', group: 'powtorka', icon: '🏆', title: 'Sprawdzian', desc: 'Quiz z całego działu z oceną jak w szkole.', C: Quiz },
  { id: 'notatki', group: 'powtorka', icon: '📒', title: 'Ściąga', desc: 'Notatki z lekcji – uporządkowane i poprawione.', C: Notes },
]

const groupColor = (g) => GROUPS.find((x) => x.id === g).color
const readHash = () => window.location.hash.replace('#', '') || 'start'
const KIND_ICON = { t: '📖', c: '✏️' }

// wszystkie strony po kolei (dział albo dział/podstrona) – do przycisków „poprzedni / następny”
const PAGES = SECTIONS.flatMap((s) =>
  s.subs ? s.subs.map((u) => ({ s, u, hash: `${s.id}/${u.id}` })) : [{ s, u: null, hash: s.id }],
)

export default function App() {
  const [route, setRoute] = useState(readHash)
  const [menuOpen, setMenuOpen] = useState(false)
  const { data, record, reset, resetSection } = useProgress()
  // zmiana klucza montuje dział od nowa – zerują się też wyniki w samych ćwiczeniach
  const [resetCount, setResetCount] = useState(0)
  const mainRef = useRef(null)

  useEffect(() => {
    const on = () => {
      setRoute(readHash())
      setMenuOpen(false)
      mainRef.current?.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const [secId, subId] = route.split('/')
  const current = SECTIONS.find((s) => s.id === secId)
  const sub = current?.subs ? current.subs.find((u) => u.id === subId) ?? current.subs[0] : null
  const pageIdx = current ? PAGES.findIndex((p) => p.s === current && p.u === sub) : -1
  const prev = pageIdx > 0 ? PAGES[pageIdx - 1] : null
  const next = pageIdx >= 0 && pageIdx < PAGES.length - 1 ? PAGES[pageIdx + 1] : null
  // w obrębie działu pokazujemy nazwę podstrony, a przy przejściu do innego działu – nazwę działu
  const pageLabel = (p) => (p.u && p.s === current ? `${KIND_ICON[p.u.kind]} ${p.u.title}` : `${p.s.icon} ${p.s.title}`)

  return (
    <div className="app" style={current ? { '--sec': groupColor(current.group) } : undefined}>
      <header className="topbar">
        <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Otwórz menu działów">
          <span />
          <span />
          <span />
        </button>
        {/* lewa strona: kategoria wybranej lekcji (na stronie głównej nazwa aplikacji) */}
        <a href="#start" className="brand">
          <span className="bolt">⚡</span>{' '}
          <span className="brand-text">{current ? GROUPS.find((g) => g.id === current.group).title : 'Prąd'}</span>
        </a>
        {/* prawa strona: nazwa wybranej lekcji, a bez lekcji nic */}
        {current && (
          <span className="topbar-title">
            {current.icon} {current.title}
          </span>
        )}
      </header>

      <div className="layout">
        <aside className="sidebar" aria-label="Działy">
          <SectionList current={current} sub={sub} data={data} />
        </aside>

        <main className="main" ref={mainRef}>
          {current && (
            <SectionProgress
              p={data[current.id]}
              onReset={() => {
                resetSection(current.id)
                setResetCount((n) => n + 1)
              }}
            />
          )}
          {current?.subs && <SubNav section={current} sub={sub} />}
          {current ? (
            <current.C key={`${current.id}-${resetCount}`} record={record} sub={sub?.id} />
          ) : (
            <Home data={data} onResetAll={reset} />
          )}
          {current && (
            <nav className="pager">
              {prev ? (
                <a href={`#${prev.hash}`} className="pager-btn">
                  <small>{prev?.s === current ? '← wcześniej w tym dziale' : '← poprzedni dział'}</small>
                  <span>{pageLabel(prev)}</span>
                </a>
              ) : <span />}
              {next && (
                <a href={`#${next.hash}`} className="pager-btn next">
                  <small>{next.s === current ? 'dalej w tym dziale →' : 'następny dział →'}</small>
                  <span>{pageLabel(next)}</span>
                </a>
              )}
            </nav>
          )}
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Szybka nawigacja">
        <a href="#start" className={route === 'start' ? 'active' : ''}>
          <span>🏠</span>Start
        </a>
        <button onClick={() => setMenuOpen(true)} className={menuOpen ? 'active' : ''}>
          <span>📚</span>Działy
        </button>
        <a href="#quiz" className={secId === 'quiz' ? 'active' : ''}>
          <span>🏆</span>Sprawdzian
        </a>
        <a href="#notatki" className={secId === 'notatki' ? 'active' : ''}>
          <span>📒</span>Ściąga
        </a>
      </nav>

      {menuOpen && (
        <div className="drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Działy">
            <div className="drawer-head">
              <b>Wszystkie działy</b>
              <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Zamknij">
                ✕
              </button>
            </div>
            <a href="#start" className={`side-link ${route === 'start' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              <span className="side-icon">🏠</span> Start
            </a>
            <SectionList current={current} sub={sub} data={data} onPick={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

function SectionProgress({ p, onReset }) {
  const [confirm, setConfirm] = useState(false)
  useEffect(() => setConfirm(false), [p])
  return (
    <div className="section-progress">
      <span>
        Twoje postępy w tym dziale:{' '}
        {p ? (
          <>
            <b>{p.ok}</b> poprawnych z {p.all}
          </>
        ) : (
          'jeszcze brak odpowiedzi'
        )}
      </span>
      {confirm ? (
        <span className="btn-row">
          <button className="chip danger-chip" onClick={onReset}>
            Tak, wyzeruj
          </button>
          <button className="chip" onClick={() => setConfirm(false)}>
            Anuluj
          </button>
        </span>
      ) : (
        <button className="chip" onClick={() => setConfirm(true)}>
          ↺ wyzeruj ten dział
        </button>
      )}
    </div>
  )
}

/** Zakładki podstron: najpierw wyjaśnienia 📖, potem ćwiczenia ✏️. */
function SubNav({ section, sub }) {
  return (
    <nav className="subnav" aria-label={`Części działu ${section.title}`}>
      {section.subs.map((u) => (
        <a key={u.id} href={`#${section.id}/${u.id}`} className={`subnav-link ${u.kind} ${u === sub ? 'active' : ''}`}>
          <span className="subnav-kind">{u.kind === 't' ? '📖 wyjaśnienie' : '✏️ ćwiczenie'}</span>
          <span>{u.title}</span>
        </a>
      ))}
    </nav>
  )
}

function SectionList({ current, sub, data, onPick }) {
  return GROUPS.map((g) => (
    <div key={g.id} className="side-group" style={{ '--g': g.color }}>
      <div className="side-group-title">{g.title}</div>
      {SECTIONS.filter((s) => s.group === g.id).map((s) => (
        <div key={s.id}>
          <a
            href={`#${s.id}`}
            className={`side-link ${current === s ? 'active' : ''}`}
            onClick={onPick}
          >
            <span className="side-icon">{s.icon}</span>
            <span className="side-label">{s.title}</span>
            {data[s.id] && <span className="side-badge">{data[s.id].ok}</span>}
          </a>
          {current === s && s.subs && (
            <div className="side-subs">
              {s.subs.map((u) => (
                <a
                  key={u.id}
                  href={`#${s.id}/${u.id}`}
                  className={`side-sub ${u === sub ? 'active' : ''}`}
                  onClick={onPick}
                >
                  {KIND_ICON[u.kind]} {u.title}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  ))
}

function Home({ data, onResetAll }) {
  const [confirm, setConfirm] = useState(false)
  const any = Object.keys(data).length > 0
  return (
    <div className="section">
      <div className="hero">
        <h1>Ćwiczenia z prądu elektrycznego ⚡</h1>
        <p>
          Ładunki, obwody, kierunek prądu i ruch elektronów, napięcie, natężenie, praca i moc. Wybierz
          ćwiczenie – każde możesz powtarzać dowolnie wiele razy.
        </p>
      </div>
      {GROUPS.map((g) => (
        <div key={g.id} className="tile-group" style={{ '--g': g.color }}>
          <h2 className="tile-group-title">{g.title}</h2>
          <div className="tiles">
            {SECTIONS.filter((s) => s.group === g.id).map((s) => {
              const p = data[s.id]
              return (
                <a key={s.id} href={`#${s.id}`} className="tile">
                  <span className="tile-icon">{s.icon}</span>
                  <span className="tile-text">
                    <b>{s.title}</b>
                    <small>{s.desc}</small>
                    {s.subs && (
                      <small className="tile-subs">
                        {s.subs.filter((u) => u.kind === 't').length > 0 && `📖 ${s.subs.filter((u) => u.kind === 't').length} `}
                        ✏️ {s.subs.filter((u) => u.kind === 'c').length}
                      </small>
                    )}
                  </span>
                  {p && <span className="tile-progress">✔ {p.ok}/{p.all}</span>}
                </a>
              )
            })}
          </div>
        </div>
      ))}
      <div className="reset-all">
        {confirm ? (
          <>
            <span>Na pewno wyzerować postępy we wszystkich działach?</span>
            <button
              className="chip danger-chip"
              onClick={() => {
                onResetAll()
                setConfirm(false)
              }}
            >
              Tak, wyzeruj wszystko
            </button>
            <button className="chip" onClick={() => setConfirm(false)}>
              Anuluj
            </button>
          </>
        ) : (
          <button className="chip" disabled={!any} onClick={() => setConfirm(true)}>
            ↺ Wyzeruj wszystkie postępy
          </button>
        )}
      </div>
    </div>
  )
}
