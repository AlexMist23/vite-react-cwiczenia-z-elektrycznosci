import { useState } from 'react'
import {
  ArrowRight,
  BatteryCharging,
  BellRing,
  Cog,
  CookingPot,
  Drill,
  Droplets,
  Fan,
  Flame,
  FlaskConical,
  Flashlight,
  Headphones,
  Heater,
  Lightbulb,
  Magnet,
  Sandwich,
  Scooter,
  Shirt,
  Speaker,
  Utensils,
  Volume2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Chip, Feedback, IconBox, Lead, Panel, Question, ScoreDots, Section, Verdict } from '@/components/app/kit.jsx'
import { cn } from '@/lib/utils'
import { shuffle } from '../lib/physics.js'

const EFFECTS = {
  cieplny: { icon: Flame, desc: 'przewodnik się nagrzewa' },
  świetlny: { icon: Lightbulb, desc: 'powstaje światło' },
  mechaniczny: { icon: Cog, desc: 'coś się porusza (silnik)' },
  chemiczny: { icon: FlaskConical, desc: 'zachodzi reakcja chemiczna' },
  dźwiękowy: { icon: Volume2, desc: 'powstaje dźwięk' },
  magnetyczny: { icon: Magnet, desc: 'przewodnik działa jak magnes' },
}

const DEVICES = [
  ['Grzejnik elektryczny', Heater, 'cieplny', 'Prąd rozgrzewa spiralę grzejną, a ona ogrzewa powietrze w pokoju.'],
  ['Czajnik elektryczny', CookingPot, 'cieplny', 'Prąd nagrzewa grzałkę na dnie czajnika, a grzałka podgrzewa wodę.'],
  ['Toster', Sandwich, 'cieplny', 'Rozgrzane do czerwoności druciki opiekają chleb – liczy się ciepło.'],
  ['Żelazko', Shirt, 'cieplny', 'Prąd nagrzewa stopę żelazka, która wygładza ubranie.'],
  ['Żarówka', Lightbulb, 'świetlny', 'Żarówka ma świecić – choć przy okazji się grzeje, jej zadaniem jest światło.'],
  ['Latarka', Flashlight, 'świetlny', 'Prąd z baterii zasila żarówkę lub diodę LED, która daje światło.'],
  ['Wentylator', Fan, 'mechaniczny', 'Silnik elektryczny obraca łopatki – prąd wywołuje ruch.'],
  ['Wiertarka', Drill, 'mechaniczny', 'Silnik elektryczny obraca wiertło – to skutek mechaniczny.'],
  ['Hulajnoga elektryczna', Scooter, 'mechaniczny', 'Silnik w kole zamienia energię prądu na ruch hulajnogi.'],
  ['Ładowanie akumulatora', BatteryCharging, 'chemiczny', 'Podczas ładowania prąd wywołuje w akumulatorze reakcje chemiczne – energia jest „magazynowana” chemicznie.'],
  ['Elektroliza wody (rozkład na wodór i tlen)', Droplets, 'chemiczny', 'Prąd rozkłada wodę na dwa gazy: wodór i tlen – to reakcja chemiczna.'],
  ['Srebrzenie łyżeczki (galwanizacja)', Utensils, 'chemiczny', 'Prąd przenosi srebro z roztworu na łyżeczkę i pokrywa ją cienką warstwą – to skutek chemiczny.'],
  ['Głośnik', Speaker, 'dźwiękowy', 'W głośniku jest magnes i cewka: prąd w cewce działa jak magnes (skutek magnetyczny) i porusza membraną, a drgająca membrana wytwarza dźwięk.', ['magnetyczny']],
  ['Dzwonek do drzwi', BellRing, 'dźwiękowy', 'Elektromagnes w dzwonku (skutek magnetyczny) przyciąga młoteczek, który uderza w dzwonek i słychać dźwięk.', ['magnetyczny']],
  ['Słuchawki', Headphones, 'dźwiękowy', 'W słuchawkach są malutkie głośniki z magnesem i cewką – prąd porusza membraną i powstaje dźwięk.', ['magnetyczny']],
  ['Elektromagnes w dźwigu na złomowisku', Magnet, 'magnetyczny', 'Gdy płynie prąd, elektromagnes przyciąga żelazny złom; po wyłączeniu prądu złom odpada.'],
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
  const [name, Icon, correct, why, alt = []] = card
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
    <Section>
      <Lead>Prąd płynąc przez urządzenia wywołuje różne skutki. Poznaj je:</Lead>
      {sub === 'rodzaje' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(EFFECTS).map(([k, e]) => (
            <Card key={k}>
              <CardHeader className="justify-items-center text-center">
                <IconBox icon={e.icon} className="mb-1" />
                <CardTitle className="font-semibold capitalize">{k}</CardTitle>
                <CardDescription>{e.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
      {sub === 'cwiczenie' && (
        <Panel>
          <Question>Jaki skutek przepływu prądu jest najważniejszy w tym urządzeniu?</Question>
          <ScoreDots
            items={cards.map((c) => picked[c[0]] && (isOk(c, picked[c[0]]) ? 'ok' : 'bad'))}
            cur={summary ? -1 : idx}
          />

          {!summary ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm text-muted-foreground">
                Urządzenie {idx + 1} z {cards.length}
              </div>
              <div className="flex items-center gap-3 text-xl font-bold text-sec md:text-2xl">
                <IconBox icon={Icon} size="lg" />
                {name}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EFFECTS).map(([k, e]) => (
                  <Chip
                    key={k}
                    className="min-h-10 px-4 text-base"
                    state={p && (k === correct || alt.includes(k)) ? 'right' : p === k && !ok ? 'wrong' : undefined}
                    disabled={!!p}
                    onClick={() => choose(k)}
                  >
                    <e.icon />
                    {k}
                  </Chip>
                ))}
              </div>
              {p && (
                <Feedback tone={ok ? 'ok' : 'bad'}>
                  <div>
                    <Verdict ok={ok}>{ok ? 'Dobrze.' : `To skutek ${[correct, ...alt].join(' i ')}.`}</Verdict> {why}
                  </div>
                  <Button onClick={() => (idx + 1 < cards.length ? setIdx(idx + 1) : setSummary(true))}>
                    {idx + 1 < cards.length ? 'Następne urządzenie' : 'Pokaż podsumowanie'}
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                </Feedback>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-sm text-muted-foreground">
                Podsumowanie rundy: <b className="text-foreground">{good}</b> / {cards.length} dobrze.
              </div>
              <div className="grid gap-2.5">
                {cards.map((c) => {
                  const [n, Ic, cor, w, al = []] = c
                  const good1 = isOk(c, picked[n])
                  return (
                    <div
                      key={n}
                      className={cn(
                        'rounded-xl border-2 px-3 py-2.5',
                        good1 ? 'border-success bg-success-soft' : 'border-destructive bg-destructive-soft',
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                        <Ic className="size-5 text-sec" /> {n}
                        <span className="text-sm font-normal text-muted-foreground">
                          – {[cor, ...al].join(' i ')}
                          {!good1 && ` (Twoja odpowiedź: ${picked[n]})`}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm">{w}</p>
                    </div>
                  )
                })}
              </div>
              <Button className="w-fit" onClick={restart}>
                Nowa runda
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          )}
        </Panel>
      )}
    </Section>
  )
}
