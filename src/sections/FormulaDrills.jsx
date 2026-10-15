// Ćwiczenia na pamięć wzorów: uzupełnij lukę we wzorze lub w zależności jednostek; jaka jednostka wyjdzie z działania.
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Answers, Expr, Feedback, Lead, Panel, Score, Section, Verdict } from '@/components/app/kit.jsx'
import AnswerBtn from '../components/AnswerBtn.jsx'
import { TRIANGLES, tokenize } from '../lib/formulas.js'
import { pick, shuffle } from '../lib/physics.js'

const LETTERS = ['U', 'I', 'q', 't', 'E', 'W', 'P']
const OPS = ['·', '/', '+', '−']
const UNITS = ['V', 'A', 'J', 'C', 's', 'W']
const NUMBERS = {
  3600: ['60', '1000', '360'],
  '3 600 000': ['3600', '360 000', '1 000 000'],
  '0,001': ['0,01', '0,1', '1000'],
  1000: ['100', '10', '0,001'],
}

// wzory z piramid – luka może być w każdej literze i w każdym działaniu
const FORMULA_ITEMS = TRIANGLES.flatMap((tri) =>
  Object.values(tri.formulas).map((text) => ({
    tokens: [text.split('=')[0].trim(), '=', ...tokenize(text.split('=')[1])],
    text,
    why: `${tri.title}: ${Object.values(tri.formulas).join(',  ')}`,
  })),
)

// zależności jednostek z lekcji; gaps – które pozycje można zakryć
const UNIT_ITEMS = [
  { tokens: ['1', 'V', '=', '1', 'J', '/', '1', 'C'], gaps: [1, 4, 5, 7], why: 'Z U = E / q: wolt to dżul na kulomb.' },
  { tokens: ['1', 'A', '=', '1', 'C', '/', '1', 's'], gaps: [1, 4, 5, 7], why: 'Z I = q / t: amper to kulomb na sekundę.' },
  { tokens: ['1', 'W', '=', '1', 'V', '·', '1', 'A'], gaps: [1, 4, 5, 7], why: 'Z P = U · I: wat to wolt razy amper.' },
  { tokens: ['1', 'J', '=', '1', 'V', '·', '1', 'A', '·', '1', 's'], gaps: [1, 4, 7, 10], why: 'Z W = U · I · t: dżul to wolt razy amper razy sekunda.' },
  { tokens: ['1', 'Ah', '=', '3600', 'C'], gaps: [3, 4], why: '1 Ah = 1 A · 3600 s = 3600 C.' },
  { tokens: ['1', 'kWh', '=', '3 600 000', 'J'], gaps: [3], why: '1 kWh = 1000 W · 3600 s = 3 600 000 J.' },
  { tokens: ['1', 'h', '=', '3600', 's'], gaps: [3], why: '1 h = 60 min = 60 · 60 s = 3600 s.' },
  { tokens: ['1', 'mA', '=', '0,001', 'A'], gaps: [3], why: 'mili = 0,001, więc 50 mA = 0,05 A.' },
  { tokens: ['1', 'kW', '=', '1000', 'W'], gaps: [3], why: 'kilo = 1000.' },
]

function options(answer, tokens) {
  let pool
  // E i W to ta sama energia (E = U · q, W = U · I · t) – nie dajemy jednej jako „złej” odpowiedzi za drugą
  const twin = { E: 'W', W: 'E' }[answer]
  if (LETTERS.includes(answer)) pool = LETTERS.filter((l) => !tokens.includes(l) && l !== twin)
  else if (OPS.includes(answer)) pool = OPS
  else if (UNITS.includes(answer)) pool = UNITS
  else pool = NUMBERS[answer] ?? []
  return shuffle([answer, ...shuffle(pool.filter((x) => x !== answer)).slice(0, 3)])
}

function newGap(prev) {
  let item, gap
  do {
    item = Math.random() < 0.6 ? pick(FORMULA_ITEMS) : pick(UNIT_ITEMS)
    const gaps = item.gaps ?? item.tokens.map((x, i) => i).filter((i) => i > 1 && item.tokens[i] !== '(' && item.tokens[i] !== ')')
    // we wzorach zakrywamy też lewą stronę (szukaną wielkość)
    gap = item.gaps ? pick(gaps) : pick([0, ...gaps])
  } while (prev && prev.item === item && prev.gap === gap)
  const answer = item.tokens[gap]
  return { item, gap, answer, options: options(answer, item.tokens) }
}

function GapDrill({ record }) {
  const [task, setTask] = useState(() => newGap())
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState({ ok: 0, all: 0 })
  const choose = (x) => {
    if (answer) return
    const ok = x === task.answer
    setAnswer(x)
    setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
    record('wzory', ok)
  }
  const full = task.item.text ?? task.item.tokens.join(' ')
  return (
    <Panel title="Co jest w luce?" score={<Score ok={score.ok} all={score.all} />}>
      <div className="flex min-h-16 flex-wrap items-center justify-center gap-x-1.5 rounded-xl bg-secondary px-4 py-3 font-formula text-2xl md:text-3xl">
        {task.item.tokens.map((tok, i) =>
          i === task.gap ? (
            <span
              key={i}
              className="inline-grid min-w-12 place-items-center rounded-lg border-2 border-dashed border-sec px-2 text-sec"
            >
              {answer ? task.answer : '?'}
            </span>
          ) : (
            <span key={i} className={/^[A-Za-z]$/.test(tok) ? 'italic' : undefined}>
              {tok}
            </span>
          ),
        )}
      </div>
      <Answers cols="four">
        {task.options.map((o) => (
          <AnswerBtn key={o} id={o} answer={answer} correct={task.answer} choose={choose} className="justify-center font-formula text-xl">
            {o}
          </AnswerBtn>
        ))}
      </Answers>
      {answer && (
        <Feedback tone={answer === task.answer ? 'ok' : 'bad'}>
          <div>
            <Verdict ok={answer === task.answer}>{answer === task.answer ? 'Dobrze!' : 'Nie.'}</Verdict> <Expr>{full}</Expr>
          </div>
          <div className="text-sm">{task.item.why}</div>
          <Button
            onClick={() => {
              setTask(newGap(task))
              setAnswer(null)
            }}
          >
            Następne
            <ArrowRight data-icon="inline-end" />
          </Button>
        </Feedback>
      )}
    </Panel>
  )
}

// działanie na jednostkach → jednostka wyniku i wzór, z którego to wynika
const UNIT_MATH = [
  ['V · A', 'W', 'P = U · I – napięcie razy natężenie daje moc.'],
  ['J : C', 'V', 'U = E / q – energia przez ładunek daje napięcie.'],
  ['C : s', 'A', 'I = q / t – ładunek przez czas daje natężenie.'],
  ['A · s', 'C', 'q = I · t – natężenie razy czas daje ładunek.'],
  ['V · C', 'J', 'E = U · q – napięcie razy ładunek daje energię.'],
  ['V · A · s', 'J', 'W = U · I · t – praca prądu w dżulach.'],
  ['W · s', 'J', 'W = P · t – moc razy czas daje pracę (energię).'],
  ['kW · h', 'kWh', 'W = P · t – praca w kilowatogodzinach.'],
  ['A · h', 'Ah', 'q = I · t – ładunek w amperogodzinach.'],
  ['W : V', 'A', 'I = P / U – moc przez napięcie daje natężenie.'],
  ['W : A', 'V', 'U = P / I – moc przez natężenie daje napięcie.'],
  ['J : V', 'C', 'q = E / U – energia przez napięcie daje ładunek.'],
  ['C : A', 's', 't = q / I – ładunek przez natężenie daje czas.'],
  ['J : s', 'W', 'P = W / t – praca przez czas daje moc.'],
]
const RESULT_UNITS = ['W', 'V', 'A', 'C', 'J', 's', 'kWh', 'Ah']

function newUnitMath(prev) {
  let item
  do item = pick(UNIT_MATH)
  while (item === prev?.item)
  return { item, options: shuffle([item[1], ...shuffle(RESULT_UNITS.filter((u) => u !== item[1])).slice(0, 3)]) }
}

function UnitMathDrill({ record }) {
  const [task, setTask] = useState(() => newUnitMath())
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState({ ok: 0, all: 0 })
  const [expr, right, why] = task.item
  const choose = (x) => {
    if (answer) return
    setAnswer(x)
    setScore((s) => ({ ok: s.ok + (x === right), all: s.all + 1 }))
    record('wzory', x === right)
  }
  return (
    <Panel score={<Score ok={score.ok} all={score.all} />}>
      <div className="flex min-h-16 items-center justify-center rounded-xl bg-secondary px-4 py-3 font-formula text-3xl">
        {expr} = <span className="ml-2 text-sec">{answer ? right : '?'}</span>
      </div>
      <Answers cols="four">
        {task.options.map((o) => (
          <AnswerBtn key={o} id={o} answer={answer} correct={right} choose={choose} className="justify-center font-formula text-xl">
            {o}
          </AnswerBtn>
        ))}
      </Answers>
      {answer && (
        <Feedback tone={answer === right ? 'ok' : 'bad'}>
          <div>
            <Verdict ok={answer === right}>{answer === right ? 'Dobrze!' : `Wychodzi ${right}.`}</Verdict> {why}
          </div>
          <Button
            onClick={() => {
              setTask(newUnitMath(task))
              setAnswer(null)
            }}
          >
            Następne
            <ArrowRight data-icon="inline-end" />
          </Button>
        </Feedback>
      )}
    </Panel>
  )
}

export default function FormulaDrills({ record, sub = 'luki' }) {
  return (
    <Section>
      {sub === 'luki' && (
        <>
          <Lead>Wzory i jednostki z lekcji z jedną luką. Uzupełnij z pamięci – bez zaglądania do piramid.</Lead>
          <GapDrill record={record} />
        </>
      )}
      {sub === 'jednostki' && (
        <>
          <Lead>
            Sprawdzanie jednostki to najlepszy test, czy wzór jest dobry. Jaka jednostka wyjdzie z takiego działania?
          </Lead>
          <UnitMathDrill record={record} />
        </>
      )}
    </Section>
  )
}
