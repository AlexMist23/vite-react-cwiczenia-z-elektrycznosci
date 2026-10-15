import { useState } from 'react'
import { ArrowRight, Dices } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Answers, Chip, Expr, Feedback, Formula, Lead, Panel, Question, Score, Section, Verdict } from '@/components/app/kit.jsx'
import AnswerBtn from '../components/AnswerBtn.jsx'
import Pyramid from '../components/Pyramid.jsx'
import { pick, shuffle } from '../lib/physics.js'
import { NAMES, TRIANGLES, letters } from '../lib/formulas.js'
import { SCENARIOS, UNITS, substitute } from '../lib/scenarios.js'
import { clean, fmt } from '../lib/physics.js'

function newDrill() {
  const tri = pick(TRIANGLES)
  const target = pick(Object.keys(tri.formulas))
  const right = tri.formulas[target]
  // błędne odpowiedzi: typowe pomyłki przy przekształcaniu wzoru
  const { top, bottom } = tri
  let wrong
  if (target === top) {
    const [a, b, c] = bottom
    wrong = c
      ? [`${a} · ${b} / ${c}`, `${a} / (${b} · ${c})`, `${a} + ${b} + ${c}`]
      : [`${a} / ${b}`, `${b} / ${a}`, `${a} + ${b}`]
  } else {
    const [r1, r2] = bottom.filter((v) => v !== target)
    wrong = r2
      ? [`${top} · ${r1} · ${r2}`, `(${r1} · ${r2}) / ${top}`, `${top} · ${r1} / ${r2}`]
      : [`${top} · ${r1}`, `${r1} / ${top}`, `${top} − ${r1}`]
  }
  const wrongPool = wrong.map((w) => `${target} = ${w}`)
  const options = shuffle([right, ...wrongPool])
  return { tri, target, right, options }
}

export default function Triangles({ record, sub = 'piramidy' }) {
  const [covered, setCovered] = useState({})
  // liczby do przykładów – osobno dla każdej piramidy; te same liczby pasują do każdej zakrytej litery
  const [examples, setExamples] = useState(() => Object.fromEntries(TRIANGLES.map((t) => [t.id, SCENARIOS[t.id].values()])))
  const reroll = (id) => setExamples((e) => ({ ...e, [id]: SCENARIOS[id].values() }))
  const [drill, setDrill] = useState(newDrill)
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const choose = (f) => {
    if (answer) return
    const ok = f === drill.right
    setAnswer(f)
    setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
    record('wzory', ok)
  }

  const known = [drill.tri.top, ...drill.tri.bottom].filter((v) => v !== drill.target)

  return (
    <Section>
      {sub === 'piramidy' && (
        <>
          <Lead>
            Kliknij literę, której szukasz – „zakryj” ją palcem. To, co zostaje, mówi jak ją obliczyć: obok siebie =
            mnożymy, jedno nad drugim = dzielimy.
          </Lead>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {TRIANGLES.map((tri) => {
              const c = covered[tri.id]
              return (
                <Card key={tri.id}>
                  <CardHeader className="text-center">
                    <CardTitle className="font-semibold">{tri.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-2 text-center">
                    <Pyramid
                      cells={letters(tri).map((l) => ({ label: l, cls: c === l ? 'covered' : '' }))}
                      onCell={(i) => setCovered((s) => ({ ...s, [tri.id]: letters(tri)[i] }))}
                    />
                    <Formula>{c ? tri.formulas[c] : 'Kliknij literę'}</Formula>
                    <small className="text-sm text-muted-foreground">{c ? `${c} – ${NAMES[c][0]} [${NAMES[c][1]}]` : tri.unit}</small>
                    <Example tri={tri} target={c ?? tri.top} values={examples[tri.id]} onReroll={() => reroll(tri.id)} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
      {sub === 'cwiczenie' && (
        <Panel score={<Score ok={score.ok} all={score.all} />}>
          <Question>
            Szukasz: <b className="text-sec">{drill.target}</b> ({NAMES[drill.target][0]}). Znasz:{' '}
            {known.map((k) => `${k} (${NAMES[k][0]})`).join(', ')}. Który wzór wybierzesz?
          </Question>
          <Answers cols="two">
            {drill.options.map((f) => (
              <AnswerBtn key={f} id={f} answer={answer} correct={drill.right} choose={choose}>
                <Expr>{f}</Expr>
              </AnswerBtn>
            ))}
          </Answers>
          {answer && (
            <Feedback tone={answer === drill.right ? 'ok' : 'bad'}>
              <div>
                <Verdict ok={answer === drill.right}>{answer === drill.right ? 'Dobrze!' : `Poprawny wzór: ${drill.right}.`}</Verdict>{' '}
                {drill.target === drill.tri.top
                  ? `${drill.target} jest na górze trójkąta – zakryj je, a zostaje dół: litery obok siebie, więc mnożymy.`
                  : `${drill.target} jest na dole – zakryj je, a zostaje ${drill.tri.top} nad pozostałymi literami, więc dzielimy ${drill.tri.top} przez nie.`}
              </div>
              <Button
                onClick={() => {
                  setDrill(newDrill())
                  setAnswer(null)
                }}
              >
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

const f = (x) => fmt(clean(x))

/** Przykład z życia do piramidy: treść, dane, wzór i obliczenie dla zakrytej litery. */
function Example({ tri, target, values, onReroll }) {
  const known = letters(tri).filter((l) => l !== target)
  const formula = tri.formulas[target]
  return (
    <div className="mt-1.5 grid w-full gap-1 rounded-lg bg-secondary px-3 py-2.5 text-left text-[0.92rem]">
      <div className="flex items-center justify-between gap-2">
        <b>Przykład: szukamy {target}</b>
        <Chip onClick={onReroll} title="Losuj nowe liczby">
          <Dices />
          losuj
        </Chip>
      </div>
      <p>{SCENARIOS[tri.id].text[target](values)}</p>
      <Expr className="text-base">Dane: {known.map((k) => `${k} = ${f(values[k])} ${UNITS[k]}`).join(', ')}</Expr>
      <Expr className="text-base">{formula}</Expr>
      <Expr className="text-base">
        {target} = {substitute(formula, values)} = <b>{f(values[target])} {UNITS[target]}</b>
      </Expr>
    </div>
  )
}
