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

export default function Effects({ record, sub = 'rodzaje' }) {
  const [cards, setCards] = useState(deal)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState({})
  const [summary, setSummary] = useState(false)

  // przy głośniku czy dzwonku dobry jest i skutek dźwiękowy, i magnetyczny (działa tam elektromagnes)
  const isOk = (card, effect) => effect === card[2] || (card[4] ?? []).includes(effect)
  const card = cards[idx]
  const [name, icon, correct, why, alt = []] = card
  const p = picked[name]
  const ok = p && isOk(card, p)
  const good = cards.filter((c) => picked[c[0]] && isOk(c, picked[c[0]])).length

  const choose = (effect) => {
    if (p) return
    setPicked((s) => ({ ...s, [name]: effect }))
    record('skutki', isOk(card, effect))
  }
  const restart = () => {
    setCards(deal())
    setIdx(0)
    setPicked({})
    setSummary(false)
  }

  return (
    <div className="section">
      <h2>Skutki przepływu prądu</h2>
      <p className="lead">Prąd płynąc przez urządzenia wywołuje różne skutki. Poznaj je:</p>
      {sub === 'rodzaje' && (
        <>
        <div className="effects-legend">
          {Object.entries(EFFECTS).map(([k, e]) => (
            <div key={k} className="card effect-tile">
              <span className="effect-icon">{e.icon}</span>
              <b>{k}</b>
              <small>{e.desc}</small>
            </div>
          ))}
        </div>

        </>
      )}
      {sub === 'cwiczenie' && (
        <>
        <div className="card">
          <p className="question">Jaki skutek przepływu prądu jest najważniejszy w tym urządzeniu?</p>
          <div className="carousel-dots" aria-label="Postęp rundy">
            {cards.map((c, i) => {
              const a = picked[c[0]]
              return (
                <span
                  key={c[0]}
                  className={`dot ${a ? (isOk(c, a) ? 'ok' : 'bad') : ''} ${!summary && i === idx ? 'cur' : ''}`}
                />
              )
            })}
          </div>

          {!summary ? (
            <div className="carousel-card">
              <div className="carousel-count">
                Urządzenie {idx + 1} z {cards.length}
              </div>
              <div className="carousel-name">
                <span className="effect-icon">{icon}</span> {name}
              </div>
              <div className="chips effect-choices">
                {Object.keys(EFFECTS).map((k) => (
                  <button
                    key={k}
                    className={`chip ${p && (k === correct || alt.includes(k)) ? 'right' : ''} ${p === k && !ok ? 'wrong' : ''}`}
                    disabled={!!p}
                    onClick={() => choose(k)}
                  >
                    {EFFECTS[k].icon} {k}
                  </button>
                ))}
              </div>
              {p && (
                <div className={ok ? 'feedback ok' : 'feedback bad'}>
                  <div>
                    <b>{ok ? '✔ Dobrze. ' : `✘ To skutek ${[correct, ...alt].join(' i ')}. `}</b>
                    {why}
                  </div>
                  <button
                    className="btn primary"
                    onClick={() => (idx + 1 < cards.length ? setIdx(idx + 1) : setSummary(true))}
                  >
                    {idx + 1 < cards.length ? 'Następne urządzenie →' : 'Pokaż podsumowanie →'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="carousel-card">
              <div className="carousel-count">
                Podsumowanie rundy: <b>{good}</b> / {cards.length} dobrze.
              </div>
              <div className="device-list">
                {cards.map((c) => {
                  const [n, ic, cor, w, al = []] = c
                  const good1 = isOk(c, picked[n])
                  return (
                    <div key={n} className={`device ${good1 ? 'ok' : 'bad'}`}>
                      <div className="device-name">
                        <span className="effect-icon">{ic}</span> {n}
                        <span className="muted small">
                          {' '}
                          – {[cor, ...al].map((k) => `${EFFECTS[k].icon} ${k}`).join(' i ')}
                          {!good1 && ` (Twoja odpowiedź: ${picked[n]})`}
                        </span>
                      </div>
                      <div className="material-why">{w}</div>
                    </div>
                  )
                })}
              </div>
              <button className="btn primary" onClick={restart}>
                Nowa runda →
              </button>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  )
}
