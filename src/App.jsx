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
  { id: 'ladunki', title: 'Ładunki i obwody', color: '#7048e8' },
  { id: 'prad', title: 'Przepływ prądu', color: '#f76707' },
  { id: 'wzory', title: 'Wzory i obliczenia', color: '#1c7ed6' },
  { id: 'powtorka', title: 'Powtórka', color: '#2b8a3e' },
]

export const SECTIONS = [
  // kolejność jak w zeszycie: elektryzowanie → obwód → skutki → kierunek → ośrodki → napięcie, natężenie, praca i moc → przedrostki → zadania
  { id: 'elektrostatyka', group: 'ladunki', icon: '🎈', title: 'Elektryzowanie i ładunki', desc: 'Balon i sweter, przewodniki i izolatory, indukcja.', C: Electrostatics },
  { id: 'obwod', group: 'ladunki', icon: '🔌', title: 'Symulator obwodu', desc: 'Zbuduj obwód, zamknij wyłącznik, zobacz prąd i elektrony.', C: CircuitSim },
  { id: 'symbole', group: 'ladunki', icon: '✏️', title: 'Symbole', desc: 'Rozpoznaj symbole elementów obwodu.', C: SymbolGame },
  { id: 'zagadki', group: 'ladunki', icon: '🧩', title: 'Zagadki obwodowe', desc: 'Czy żarówka świeci? Prąd jak woda.', C: CircuitPuzzles },
  { id: 'skutki', group: 'prad', icon: '💡', title: 'Skutki prądu', desc: 'Cieplny, świetlny, mechaniczny, chemiczny…', C: Effects },
  { id: 'kierunki', group: 'prad', icon: '🔄', title: 'Kierunek prądu', desc: 'Prąd od „+” do „−”, elektrony od „−” do „+”.', C: DirectionGame },
  { id: 'osrodki', group: 'prad', icon: '🧊', title: 'Ciała stałe, ciecze, gazy', desc: 'Co przenosi ładunek w różnych ośrodkach?', C: Media },
  { id: 'wzory', group: 'wzory', icon: '🔺', title: 'Trójkąty wzorów', desc: 'U = E/q, I = q/t, P = U·I, W = U·I·t', C: Triangles },
  { id: 'trening', group: 'wzory', icon: '🧠', title: 'Trening wzorów i piramid', desc: 'Ułóż piramidę, złóż wzór z klocków, symbole i jednostki.', C: FormulaTrainer },
  { id: 'jednostki', group: 'wzory', icon: '📏', title: 'Jednostki i przedrostki', desc: 'mA, kV, kWh, Ah – zamieniaj bez pomyłek.', C: Units },
  { id: 'wzor-obliczenie', group: 'wzory', icon: '🧪', title: 'Wzór → obliczenie', desc: 'Najpierw ułóż wzór, potem policz – wynik jest sprawdzany.', C: FormulaToCalc },
  { id: 'zadania', group: 'wzory', icon: '🧮', title: 'Zadania obliczeniowe', desc: 'Dane, szukane, wzór, wynik – krok po kroku.', C: Problems },
  { id: 'quiz', group: 'powtorka', icon: '🏆', title: 'Sprawdzian', desc: 'Quiz z całego działu z oceną jak w szkole.', C: Quiz },
  { id: 'notatki', group: 'powtorka', icon: '📒', title: 'Ściąga', desc: 'Notatki z lekcji – uporządkowane i poprawione.', C: Notes },
]

const groupColor = (g) => GROUPS.find((x) => x.id === g).color
const readHash = () => window.location.hash.replace('#', '') || 'start'

export default function App() {
  const [route, setRoute] = useState(readHash)
  const [menuOpen, setMenuOpen] = useState(false)
  const { data, record } = useProgress()
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

  const idx = SECTIONS.findIndex((s) => s.id === route)
  const current = SECTIONS[idx]
  const prev = idx > 0 ? SECTIONS[idx - 1] : null
  const next = idx >= 0 && idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null

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
          <SectionList route={route} data={data} />
        </aside>

        <main className="main" ref={mainRef}>
          {current ? <current.C record={record} /> : <Home data={data} />}
          {current && (
            <nav className="pager">
              {prev ? (
                <a href={`#${prev.id}`} className="pager-btn">
                  <small>← poprzedni</small>
                  <span>{prev.icon} {prev.title}</span>
                </a>
              ) : <span />}
              {next && (
                <a href={`#${next.id}`} className="pager-btn next">
                  <small>następny →</small>
                  <span>{next.icon} {next.title}</span>
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
        <a href="#quiz" className={route === 'quiz' ? 'active' : ''}>
          <span>🏆</span>Sprawdzian
        </a>
        <a href="#notatki" className={route === 'notatki' ? 'active' : ''}>
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
            <SectionList route={route} data={data} onPick={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

function SectionList({ route, data, onPick }) {
  return GROUPS.map((g) => (
    <div key={g.id} className="side-group" style={{ '--g': g.color }}>
      <div className="side-group-title">{g.title}</div>
      {SECTIONS.filter((s) => s.group === g.id).map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`side-link ${route === s.id ? 'active' : ''}`}
          onClick={onPick}
        >
          <span className="side-icon">{s.icon}</span>
          <span className="side-label">{s.title}</span>
          {data[s.id] && <span className="side-badge">{data[s.id].ok}</span>}
        </a>
      ))}
    </div>
  ))
}

function Home({ data }) {
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
                  </span>
                  {p && <span className="tile-progress">✔ {p.ok}/{p.all}</span>}
                </a>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
