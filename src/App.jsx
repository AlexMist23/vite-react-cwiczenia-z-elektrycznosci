import { useEffect, useState } from 'react'
import { useProgress } from './lib/progress.js'
import Notes from './sections/Notes.jsx'
import CircuitSim from './sections/CircuitSim.jsx'
import SymbolGame from './sections/SymbolGame.jsx'
import DirectionGame from './sections/DirectionGame.jsx'
import Media from './sections/Media.jsx'
import Effects from './sections/Effects.jsx'
import Triangles from './sections/Triangles.jsx'
import Units from './sections/Units.jsx'
import Problems from './sections/Problems.jsx'
import Quiz from './sections/Quiz.jsx'
import Electrostatics from './sections/Electrostatics.jsx'
import CircuitPuzzles from './sections/CircuitPuzzles.jsx'

export const SECTIONS = [
  { id: 'elektrostatyka', icon: '🎈', title: 'Elektryzowanie i ładunki', desc: 'Balon i sweter, przewodniki i izolatory, indukcja.', C: Electrostatics },
  { id: 'obwod', icon: '🔌', title: 'Symulator obwodu', desc: 'Zbuduj obwód, zamknij wyłącznik, zobacz prąd i elektrony.', C: CircuitSim },
  { id: 'zagadki', icon: '🧩', title: 'Zagadki obwodowe', desc: 'Czy żarówka świeci? Prąd jak woda.', C: CircuitPuzzles },
  { id: 'kierunki', icon: '🔄', title: 'Kierunek prądu', desc: 'Prąd od „+” do „−”, elektrony od „−” do „+”.', C: DirectionGame },
  { id: 'symbole', icon: '✏️', title: 'Symbole', desc: 'Rozpoznaj symbole elementów obwodu.', C: SymbolGame },
  { id: 'osrodki', icon: '🧊', title: 'Ciała stałe, ciecze, gazy', desc: 'Co przenosi ładunek w różnych ośrodkach?', C: Media },
  { id: 'skutki', icon: '💡', title: 'Skutki prądu', desc: 'Cieplny, świetlny, mechaniczny, chemiczny…', C: Effects },
  { id: 'wzory', icon: '🔺', title: 'Trójkąty wzorów', desc: 'U = E/q, I = q/t, P = U·I, W = U·I·t', C: Triangles },
  { id: 'jednostki', icon: '📏', title: 'Jednostki i przedrostki', desc: 'mA, kV, kWh, Ah – zamieniaj bez pomyłek.', C: Units },
  { id: 'zadania', icon: '🧮', title: 'Zadania obliczeniowe', desc: 'Dane, szukane, wzór, wynik – krok po kroku.', C: Problems },
  { id: 'quiz', icon: '🏆', title: 'Sprawdzian', desc: 'Quiz z całego działu z oceną jak w szkole.', C: Quiz },
  { id: 'notatki', icon: '📒', title: 'Ściąga', desc: 'Notatki z lekcji – uporządkowane i poprawione.', C: Notes },
]

const readHash = () => window.location.hash.replace('#', '') || 'start'

export default function App() {
  const [route, setRoute] = useState(readHash)
  const { data, record, reset } = useProgress()

  useEffect(() => {
    const on = () => {
      setRoute(readHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const current = SECTIONS.find((s) => s.id === route)

  return (
    <div className="app">
      <header className="topbar">
        <a href="#start" className="brand">
          <span className="bolt">⚡</span> Prąd elektryczny <small>klasa 8</small>
        </a>
        <nav className="nav">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={route === s.id ? 'active' : ''} title={s.title}>
              <span>{s.icon}</span>
              <span className="nav-label">{s.title}</span>
            </a>
          ))}
        </nav>
      </header>

      <main className="main">
        {current ? (
          <current.C record={record} />
        ) : (
          <Home data={data} reset={reset} />
        )}
      </main>

      <footer className="footer">Ćwiczenia z elektryczności · fizyka, klasa 8</footer>
    </div>
  )
}

function Home({ data, reset }) {
  const total = Object.values(data).reduce((a, s) => ({ ok: a.ok + s.ok, all: a.all + s.all }), { ok: 0, all: 0 })
  return (
    <div className="section">
      <div className="hero">
        <h1>Ćwiczenia z prądu elektrycznego ⚡</h1>
        <p>
          Obwody, kierunek prądu i ruch elektronów, napięcie, natężenie, praca i moc. Wybierz ćwiczenie –
          każde możesz powtarzać dowolnie wiele razy.
        </p>
        {total.all > 0 && (
          <p className="hero-stats">
            Twoje odpowiedzi: <b>{total.ok}</b> poprawnych z {total.all}
            <button className="chip" onClick={reset}>wyzeruj postępy</button>
          </p>
        )}
      </div>
      <div className="tiles">
        {SECTIONS.map((s) => {
          const p = data[s.id]
          return (
            <a key={s.id} href={`#${s.id}`} className="card tile">
              <span className="tile-icon">{s.icon}</span>
              <b>{s.title}</b>
              <small>{s.desc}</small>
              {p && (
                <span className="tile-progress">
                  ✔ {p.ok} / {p.all}
                </span>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
