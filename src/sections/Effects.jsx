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
  ['Grzejnik elektryczny', '♨️', 'cieplny'],
  ['Czajnik elektryczny', '🫖', 'cieplny'],
  ['Toster', '🍞', 'cieplny'],
  ['Żelazko', '👕', 'cieplny'],
  ['Żarówka', '💡', 'świetlny'],
  ['Latarka', '🔦', 'świetlny'],
  ['Wentylator', '🌀', 'mechaniczny'],
  ['Wiertarka', '🛠️', 'mechaniczny'],
  ['Hulajnoga elektryczna', '🛴', 'mechaniczny'],
  ['Ładowanie akumulatora', '🔋', 'chemiczny'],
  ['Elektroliza wody (rozkład na wodór i tlen)', '💧', 'chemiczny'],
  ['Srebrzenie łyżeczki (galwanizacja)', '🥄', 'chemiczny'],
  ['Głośnik', '🔈', 'dźwiękowy'],
  ['Dzwonek do drzwi', '🔔', 'dźwiękowy'],
  ['Słuchawki', '🎧', 'dźwiękowy'],
  ['Elektromagnes w dźwigu na złomowisku', '🏗️', 'magnetyczny'],
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
          {cards.map(([name, icon, correct]) => {
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
