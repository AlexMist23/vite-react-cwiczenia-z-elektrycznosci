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
  ['Głośnik', '🔈', 'dźwiękowy', 'W głośniku jest magnes i cewka: prąd w cewce działa jak magnes (skutek magnetyczny) i porusza membraną, a drgająca membrana wytwarza dźwięk.', ['magnetyczny']],
  ['Dzwonek do drzwi', '🔔', 'dźwiękowy', 'Elektromagnes w dzwonku (skutek magnetyczny) przyciąga młoteczek, który uderza w dzwonek i słychać dźwięk.', ['magnetyczny']],
  ['Słuchawki', '🎧', 'dźwiękowy', 'W słuchawkach są malutkie głośniki z magnesem i cewką – prąd porusza membraną i powstaje dźwięk.', ['magnetyczny']],
  ['Elektromagnes w dźwigu na złomowisku', '🏗️', 'magnetyczny', 'Gdy płynie prąd, elektromagnes przyciąga żelazny złom; po wyłączeniu prądu złom odpada.'],
]

const deal = () => shuffle(DEVICES).slice(0, 8)

export default function Effects({ record }) {
  const [cards, setCards] = useState(deal)
  const [picked, setPicked] = useState({})

  // przy głośniku czy dzwonku dobry jest i skutek dźwiękowy, i magnetyczny (działa tam elektromagnes)
  const isOk = (card, effect) => effect === card[2] || (card[4] ?? []).includes(effect)
  const choose = (card, effect) => {
    if (picked[card[0]]) return
    setPicked((p) => ({ ...p, [card[0]]: effect }))
    record('skutki', isOk(card, effect))
  }

  const answered = Object.keys(picked).length
  const good = cards.filter((c) => picked[c[0]] && isOk(c, picked[c[0]])).length

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
          {cards.map((card) => {
            const [name, icon, correct, why, alt = []] = card
            const p = picked[name]
            const ok = p && isOk(card, p)
            return (
              <div key={name} className={`device ${p ? (ok ? 'ok' : 'bad') : ''}`}>
                <div className="device-name">
                  <span className="effect-icon">{icon}</span> {name}
                </div>
                <div className="chips">
                  {Object.keys(EFFECTS).map((k) => (
                    <button
                      key={k}
                      className={`chip ${p && (k === correct || alt.includes(k)) ? 'right' : ''} ${p === k && !ok ? 'wrong' : ''}`}
                      disabled={!!p}
                      onClick={() => choose(card, k)}
                    >
                      {EFFECTS[k].icon} {k}
                    </button>
                  ))}
                </div>
                {p && (
                  <div className="material-why">
                    <b>{ok ? '✔ Dobrze. ' : `✘ To skutek ${[correct, ...alt].join(' i ')}. `}</b>
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
