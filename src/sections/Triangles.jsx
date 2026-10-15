// „Który wzór?” – dobór wzoru z piramidy do szukanej wielkości (wyjaśnienia piramid są w Pyramids.jsx).
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Answers, Expr, Feedback, Panel, Question, Score, Section, Verdict } from '@/components/app/kit.jsx'
import AnswerBtn from '../components/AnswerBtn.jsx'
import { pick, shuffle } from '../lib/physics.js'
import { NAMES, TRIANGLES, inUnits, inWords } from '../lib/formulas.js'

function newDrill(pool = TRIANGLES) {
  const tri = pick(pool)
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

/** only – identyfikatory piramid do ćwiczenia (np. ['E', 'q'] w lekcji o napięciu i natężeniu). */
export default function Triangles({ record, only }) {
  const pool = only ? TRIANGLES.filter((t) => only.includes(t.id)) : TRIANGLES
  const [drill, setDrill] = useState(() => newDrill(pool))
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
                ? `${drill.target} jest na górze piramidy – zakryj je, a zostaje dół: litery obok siebie, więc mnożymy.`
                : `${drill.target} jest na dole – zakryj je, a zostaje ${drill.tri.top} nad pozostałymi literami, więc dzielimy ${drill.tri.top} przez nie.`}
            </div>
            <div className="text-sm">
              Słowami: <b>{inWords(drill.right)}</b> · jednostki: <b className="font-formula">{inUnits(drill.right)}</b>
            </div>
            <Button
              onClick={() => {
                setDrill(newDrill(pool))
                setAnswer(null)
              }}
            >
              Następne
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Feedback>
        )}
      </Panel>
    </Section>
  )
}
