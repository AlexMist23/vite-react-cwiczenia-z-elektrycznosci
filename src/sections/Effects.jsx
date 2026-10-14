import { useState } from 'react'
import { shuffle } from '../lib/physics.js'

const EFFECTS = {
  cieplny: { icon: '🔥', desc: 'przewodnik się nagrzewa' },
  świetlny: { icon: '💡', desc: 'powstaje światło' },
  mechaniczny: { icon: '⚙️', desc: 'coś się porusza (silnik)' },
  chemiczny: { icon: '🧪', desc: 'zachodzi reakcja chemiczna' },
  dźwiękowy: { icon: '🔊', desc: 'powstaje dźwięk' },
  magnetyczny: { icon: '🧲', desc: 'przewodnik działa jak magnes' },
}

const DEVICES = [
  ['Grzejnik elektryczny', '♨️', 'cieplny', 'Prąd rozgrzewa spiralę grzejną, a ona ogrzewa powietrze w pokoju.'],
  ['Czajnik elektryczny', '🫖', 'cieplny', 'Prąd nagrzewa grzałkę na dnie czajnika, a grzałka podgrzewa wodę.'],
  ['Toster', '🍞', 'cieplny', 'Rozgrzane do czerwoności druciki opiekają chleb – liczy się ciepło.'],
  ['Żelazko', '👕', 'cieplny', 'Prąd nagrzewa stopę żelazka, która wygładza ubranie.'],
  ['Żarówka', '💡', 'świetlny', 'Żarówka ma świecić – choć przy okazji się grzeje, jej zadaniem jest światło.'],
  ['Latarka', '🔦', 'świetlny', 'Prąd z baterii zasila żarówkę lub diodę LED, która daje światło.'],
  ['Wentylator', '🌀', 'mechaniczny', 'Silnik elektryczny obraca łopatki – prąd wywołuje ruch.'],
  ['Wiertarka', '🛠️', 'mechaniczny', 'Silnik elektryczny obraca wiertło – to skutek mechaniczny.'],
  ['Hulajnoga elektryczna', '🛴', 'mechaniczny', 'Silnik w kole zamienia energię prądu na ruch hulajnogi.'],
  ['Ładowanie akumulatora', '🔋', 'chemiczny', 'Podczas ładowania prąd wywołuje w akumulatorze reakcje chemiczne – energia jest „magazynowana” chemicznie.'],
  ['Elektroliza wody (rozkład na wodór i tlen)', '💧', 'chemiczny', 'Prąd rozkłada wodę na dwa gazy: wodór i tlen – to reakcja chemiczna.'],
  ['Srebrzenie łyżeczki (galwanizacja)', '🥄', 'chemiczny', 'Prąd przenosi srebro z roztworu na łyżeczkę i pokrywa ją cienką warstwą – to skutek chemiczny.'],
  ['Głośnik', '🔈', 'dźwiękowy', 'Prąd porusza membraną głośnika, a drgająca membrana wytwarza dźwięk.'],
  ['Dzwonek do drzwi', '🔔', 'dźwiękowy', 'Elektromagnes w dzwonku uderza młoteczkiem w dzwonek i słychać dźwięk.'],
  ['Słuchawki', '🎧', 'dźwiękowy', 'W słuchawkach są malutkie głośniki – prąd zamienia się w dźwięk.'],
  ['Elektromagnes w dźwigu na złomowisku', '🏗️', 'magnetyczny', 'Gdy płynie prąd, elektromagnes przyciąga żelazny złom; po wyłączeniu prądu złom odpada.'],
]

const deal = () => shuffle(DEVICES).slice(0, 8)

export default function Effects({ record }) {
  const [cards, setCards] = useState(deal)
  const [picked, setPicked] = useState({})

  const choose = (name, effect, correct) => {
    if (picked[name]) return
    setPicked((p) => ({ ...p, [name]: effect }))
    record('skutki', effect === correct)
  }

  const answered = Object.keys(picked).length
  const good = cards.filter(([n, , c]) => picked[n] === c).length

  return (
    <div className="section">
      <h2>Skutki przepływu prądu</h2>
      <p className="lead">Prąd płynąc przez urządzenia wywołuje różne skutki. Poznaj je:</p>
      <div className="effects-legend">
        {Object.entries(EFFECTS).map(([k, e]) => (
          <div key={k} className="card effect-tile">
            <span className="effect-icon">{e.icon}</span>
            <b>{k}</b>
            <small>{e.desc}</small>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="score">
          Wynik: <b>{good}</b> / {answered} {answered === cards.length && '– koniec rundy!'}
        </div>
        <p className="question">Jaki skutek przepływu prądu jest najważniejszy w tym urządzeniu?</p>
        <div className="device-list">
          {cards.map(([name, icon, correct, why]) => {
            const p = picked[name]
            return (
              <div key={name} className={`device ${p ? (p === correct ? 'ok' : 'bad') : ''}`}>
                <div className="device-name">
                  <span className="effect-icon">{icon}</span> {name}
                </div>
                <div className="chips">
                  {Object.keys(EFFECTS).map((k) => (
                    <button
                      key={k}
                      className={`chip ${p && k === correct ? 'right' : ''} ${p === k && k !== correct ? 'wrong' : ''}`}
                      disabled={!!p}
                      onClick={() => choose(name, k, correct)}
                    >
                      {EFFECTS[k].icon} {k}
                    </button>
                  ))}
                </div>
                {p && (
                  <div className="material-why">
                    <b>{p === correct ? '✔ Dobrze. ' : `✘ To skutek ${correct}. `}</b>
                    {why}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {answered === cards.length && (
          <button
            className="btn primary"
            onClick={() => {
              setCards(deal())
              setPicked({})
            }}
          >
            Nowa runda →
          </button>
        )}
      </div>
    </div>
  )
}
