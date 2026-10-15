import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Answers, Callout, Feedback, Panel, Question, Score, Section, Verdict } from '@/components/app/kit.jsx'
import AnswerBtn from '../components/AnswerBtn.jsx'
import { shuffle } from '../lib/physics.js'

// Animacja nośników ładunku między elektrodami: „+” po lewej, „−” po prawej.
function Chamber({ kind }) {
  const particles = []
  const rows = [30, 60, 90, 120]
  rows.forEach((y, r) => {
    for (let i = 0; i < 5; i++) {
      const delay = -((i * 1.1 + r * 0.45) % 5.5)
      if (kind === 'solid') {
        particles.push({ y, type: 'e', delay })
      } else if (kind === 'liquid') {
        particles.push({ y: y + (i % 2 ? 6 : -6), type: i % 2 ? 'neg' : 'pos', delay: delay * 1.6 })
      } else {
        const type = i % 3 === 0 ? 'pos' : i % 3 === 1 ? 'e' : 'neg'
        particles.push({ y: y + (i % 2 ? 7 : -7), type, delay })
      }
    }
  })
  return (
    <svg viewBox="0 0 300 150" className={`drawing chamber ${kind} rounded-lg`}>
      <rect x="0" y="0" width="300" height="150" className="chamber-bg" />
      {kind === 'solid' &&
        Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={30 + (i % 10) * 27} cy={22 + Math.floor(i / 10) * 33} r="9" className="lattice" />
        ))}
      {particles.map((p, i) => (
        <g key={i} className={`mover ${p.type === 'pos' ? 'to-right' : 'to-left'} ${p.type}`} style={{ animationDelay: `${p.delay}s` }}>
          <circle cx="0" cy={p.y} r={p.type === 'e' ? 5 : 8} />
          <text x="0" y={p.y + 3.5} textAnchor="middle">
            {p.type === 'pos' ? '+' : '−'}
          </text>
        </g>
      ))}
      <rect x="0" y="0" width="14" height="150" className="electrode plus" />
      <rect x="286" y="0" width="14" height="150" className="electrode minus" />
      <text x="7" y="80" textAnchor="middle" className="electrode-label">+</text>
      <text x="293" y="80" textAnchor="middle" className="electrode-label">−</text>
    </svg>
  )
}

const MEDIA = [
  {
    kind: 'solid',
    title: 'Ciała stałe (metale)',
    carriers: 'elektrony swobodne',
    text: 'W metalach prąd to uporządkowany ruch elektronów swobodnych. Jony dodatnie siedzą w sieci krystalicznej i tylko drgają.',
    examples: 'drut miedziany, aluminiowy przewód, grafit w ołówku',
  },
  {
    kind: 'liquid',
    title: 'Ciecze (elektrolity)',
    carriers: 'jony dodatnie i ujemne',
    text: 'W roztworach soli, kwasów i zasad prąd to uporządkowany ruch jonów: dodatnie płyną do „−”, ujemne do „+”.',
    examples: 'woda z solą, kwas w akumulatorze, sok z cytryny',
  },
  {
    kind: 'gas',
    title: 'Gazy (zjonizowane)',
    carriers: 'jony i elektrony',
    text: 'Gaz zwykle jest izolatorem, ale gdy zostanie zjonizowany, prąd płynie dzięki ruchowi jonów oraz elektronów.',
    examples: 'błyskawica, neonówka, świetlówka, iskra',
  },
]

const ITEMS = [
  ['Miedziany przewód w ścianie', 'solid', 'Miedź to metal – płyną w niej elektrony swobodne, a jony miedzi stoją w miejscu.'],
  ['Woda z rozpuszczoną solą kuchenną', 'liquid', 'Sól rozpada się w wodzie na jony Na⁺ i Cl⁻: dodatnie płyną do „−”, ujemne do „+”.'],
  ['Błyskawica podczas burzy', 'gas', 'Ogromne napięcie jonizuje powietrze – powstają jony i wolne elektrony, które przenoszą ładunek.'],
  ['Kwas siarkowy w akumulatorze samochodowym', 'liquid', 'Roztwór kwasu to elektrolit – ładunek przenoszą jony.'],
  ['Świecąca neonówka (reklama)', 'gas', 'Gaz w rurce jest zjonizowany przez wysokie napięcie – płyną jony i elektrony, a gaz świeci.'],
  ['Aluminiowa folia', 'solid', 'Aluminium to metal – ładunek przenoszą elektrony swobodne.'],
  ['Grafit w ołówku', 'solid', 'Grafit to ciało stałe z elektronami swobodnymi – przewodzi jak metal, choć jest z węgla.'],
  ['Sok z cytryny z wbitymi elektrodami', 'liquid', 'Sok to roztwór kwasu cytrynowego – są w nim jony, więc przewodzi jak elektrolit.'],
  ['Iskra przeskakująca między przewodami', 'gas', 'Iskra to zjonizowane powietrze – przez krótką chwilę płyną w nim jony i elektrony.'],
  ['Złoty styk w telefonie', 'solid', 'Złoto to metal – płyną w nim elektrony swobodne.'],
  ['Świetlówka (lampa jarzeniowa)', 'gas', 'W rurze świetlówki są pary rtęci i gaz – po zjonizowaniu płyną w nich jony i elektrony.'],
  ['Woda morska', 'liquid', 'Woda morska zawiera rozpuszczone sole, więc ładunek przenoszą jony.'],
]

const LABEL = {
  solid: 'Elektrony',
  liquid: 'Jony (dodatnie i ujemne)',
  gas: 'Jony i elektrony',
}

export default function Media({ record, sub = 'nosniki' }) {
  const [order, setOrder] = useState(() => shuffle(ITEMS))
  const [idx, setIdx] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const [name, correct, why] = order[idx]
  const choose = (k) => {
    if (answer) return
    const ok = k === correct
    setAnswer(k)
    setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
    record('osrodki', ok)
  }
  const next = () => {
    setAnswer(null)
    if (idx + 1 < order.length) setIdx(idx + 1)
    else {
      setOrder(shuffle(ITEMS))
      setIdx(0)
    }
  }

  return (
    <Section>

      {sub === 'nosniki' && (
        <>
          <Callout tone="info">
            <p>
              <b>Prąd elektryczny</b> to uporządkowany ruch <b>ładunków elektrycznych</b>. W metalach są to elektrony
              (ładunki ujemne), ale w cieczach i gazach płyną też <b>jony dodatnie</b> – dlatego mówimy ogólnie o
              ładunkach, a nie tylko o ujemnych.
            </p>
          </Callout>

          <div className="grid gap-3.5 md:grid-cols-3">
            {MEDIA.map((m) => (
              <Panel key={m.kind} title={m.title} contentClassName="gap-2.5">
                <Chamber kind={m.kind} />
                <p>
                  <b>Nośniki ładunku:</b> {m.carriers}
                </p>
                <p className="text-sm">{m.text}</p>
                <p className="text-sm text-muted-foreground">Przykłady: {m.examples}</p>
              </Panel>
            ))}
          </div>
        </>
      )}
      {sub === 'cwiczenie' && (
        <Panel score={<Score ok={score.ok} all={score.all} />}>
          <Question className="text-2xl font-bold text-sec">{name}</Question>
          <Answers cols="three">
            {Object.entries(LABEL).map(([k, t]) => (
              <AnswerBtn key={k} id={k} answer={answer} correct={correct} choose={choose}>
                {t}
              </AnswerBtn>
            ))}
          </Answers>
          {answer && (
            <Feedback tone={answer === correct ? 'ok' : 'bad'}>
              <div>
                <Verdict ok={answer === correct}>{answer === correct ? 'Dobrze!' : 'Nie tym razem.'}</Verdict>{' '}
                {MEDIA.find((m) => m.kind === correct).title}: {MEDIA.find((m) => m.kind === correct).carriers}. {why}
              </div>
              <Button onClick={next}>
                Następne
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Feedback>
          )}
        </Panel>
      )}
    </Section>
  )
}
