// Sprawdzian ze wszystkiego: teoria (pytania z wyborem), obliczenia z treścią i „brakująca wielkość”.
// Jak na prawdziwym sprawdzianie – odpowiedzi i rozwiązania dopiero na końcu, ocena wg progów z zeszytu.
import { useState } from 'react'
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Answers, Expr, GradeResult, Lead, NumberInput, Panel, Question, Section } from '@/components/app/kit.jsx'
import { cn } from '@/lib/utils'
import { Steps } from '../components/NumberTask.jsx'
import { QUIZ } from '../data/quiz.js'
import { TRIANGLES, UNIT, letters } from '../lib/formulas.js'
import { clean, fmt, gradeFor, isClose, parseNum, pick, shuffle } from '../lib/physics.js'
import { PROBLEMS } from '../lib/problems.js'
import { SCENARIOS, substitute } from '../lib/scenarios.js'
import { UNIT_TASKS } from '../lib/unitTasks.js'

const f = (x) => fmt(clean(x))
const colon = (formula) => formula.replace(/\//g, ':')

const PARTS = {
  quiz: 'Teoria',
  missing: 'Brakująca wielkość',
  calc: 'Zadania obliczeniowe',
}
const CALC_KINDS = ['Jednostki', 'Napięcie', 'Natężenie', 'Moc', 'Praca', 'Z zeszytu', 'Dwa kroki']

function calcTask(kind) {
  const t = kind === 'Jednostki' ? pick(UNIT_TASKS)[1]() : pick(PROBLEMS.filter((p) => p.topic === kind)).make()
  return { type: 'calc', kind, ...t }
}

function missingTask() {
  const tri = pick(TRIANGLES)
  const target = pick(letters(tri))
  const values = SCENARIOS[tri.id].values()
  return { type: 'missing', tri, target, values, answer: values[target], unit: UNIT[target][0] }
}

/** Kolejność jak na sprawdzianie: teoria, potem brakująca wielkość, na końcu zadania z treścią (dwa kroki na samym końcu). */
function build(n) {
  const nQuiz = Math.round(n * 0.4)
  const nMissing = Math.round(n * 0.2)
  const nCalc = n - nQuiz - nMissing
  const quiz = shuffle(QUIZ)
    .slice(0, nQuiz)
    .map((x) => ({ type: 'quiz', q: x.q, options: shuffle(x.a), right: x.a[0], why: x.why, topic: x.topic }))
  const missing = Array.from({ length: nMissing }, missingTask)
  const kinds = []
  while (kinds.length < nCalc) kinds.push(...shuffle(CALC_KINDS))
  const calc = kinds
    .slice(0, nCalc)
    .sort((a, b) => (a === 'Dwa kroki') - (b === 'Dwa kroki'))
    .map(calcTask)
  return [...quiz, ...missing, ...calc]
}

const isRight = (task, a) =>
  task.type === 'quiz' ? a === task.right : isClose(parseNum(a ?? ''), task.answer, 0.005)

export default function FinalExam({ record }) {
  const [tasks, setTasks] = useState(null)
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState([])
  const [value, setValue] = useState('')

  const start = (n) => {
    setTasks(build(n))
    setI(0)
    setAnswers([])
    setValue('')
  }

  if (!tasks) {
    return (
      <Section>
        <Panel contentClassName="gap-3">
          <Lead>
            Cały dział w jednym sprawdzianie: <b>40%</b> pytań z teorii, <b>20%</b> zadań „brakująca wielkość” i{' '}
            <b>40%</b> zadań obliczeniowych z treścią. Odpowiedzi i rozwiązania zobaczysz na końcu.
          </Lead>
          <div className="flex flex-wrap gap-2 border-t pt-3">
            <Button onClick={() => start(10)}>10 zadań</Button>
            <Button variant="outline" onClick={() => start(20)}>
              20 zadań
            </Button>
            <Button variant="outline" onClick={() => start(30)}>
              30 zadań
            </Button>
          </div>
        </Panel>
      </Section>
    )
  }

  if (i >= tasks.length) return <Result tasks={tasks} answers={answers} onAgain={() => setTasks(null)} />

  const task = tasks[i]
  const isQuiz = task.type === 'quiz'
  const nan = !isQuiz && value.trim() !== '' && Number.isNaN(parseNum(value))
  const advance = (v) => {
    record('wszystko', isRight(task, v))
    setAnswers((a) => [...a, v])
    setValue('')
    setI(i + 1)
  }
  const nextLabel = i + 1 < tasks.length ? 'Dalej' : 'Zakończ'

  return (
    <Section>
      <Panel title={`Zadanie ${i + 1} z ${tasks.length}`} score={<Badge variant="secondary">{PARTS[task.type]}</Badge>}>
        <Progress value={(i / tasks.length) * 100} className="h-2" />

        {isQuiz && (
          <>
            <Question>{task.q}</Question>
            <Answers>
              {task.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setValue(o)}
                  className={cn(
                    'flex min-h-12 items-center rounded-xl border-2 bg-card px-3.5 py-2.5 text-left font-medium transition-colors hover:border-primary',
                    value === o && 'border-primary bg-primary-soft',
                  )}
                >
                  {o}
                </button>
              ))}
            </Answers>
            <div className="flex flex-wrap gap-2">
              <Button size="lg" disabled={!value} onClick={() => advance(value)}>
                {nextLabel}
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button size="lg" variant="ghost" onClick={() => advance('')}>
                Pomiń
              </Button>
            </div>
          </>
        )}

        {!isQuiz && (
          <>
            {task.type === 'calc' ? <Question>{task.q}</Question> : <MissingQuestion task={task} />}
            <form
              key={i}
              className="flex flex-wrap items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!nan) advance(value)
              }}
            >
              <NumberInput unit={task.unit} value={value} autoFocus onChange={(e) => setValue(e.target.value)} placeholder="Wynik" aria-label="Wynik" />
              <Button size="lg" type="submit" disabled={nan}>
                {nextLabel}
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button size="lg" type="button" variant="ghost" onClick={() => advance('')}>
                Pomiń
              </Button>
            </form>
            {nan && <p className="text-sm text-destructive">Wpisz liczbę, np. 0,05 albo 3 600 000.</p>}
          </>
        )}
      </Panel>
    </Section>
  )
}

/** Brakująca wielkość: same dane z jednostkami i szukana. */
function MissingQuestion({ task }) {
  const known = letters(task.tri).filter((l) => l !== task.target)
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Dane</div>
        <div className="flex flex-wrap gap-2">
          {known.map((l) => (
            <span key={l} className="rounded-lg bg-secondary px-3 py-1.5">
              <Expr className="text-xl">
                <i>{l}</i> = {f(task.values[l])} {UNIT[l][0]}
              </Expr>
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Szukane</div>
        <Expr className="text-xl">
          <i>{task.target}</i> = ?
        </Expr>
      </div>
    </div>
  )
}

/** Krótki opis zadania w rozwiązaniach. */
function Prompt({ task }) {
  if (task.type !== 'missing') return task.q
  const known = letters(task.tri).filter((l) => l !== task.target)
  return (
    <Expr>
      {known.map((l) => `${l} = ${f(task.values[l])} ${UNIT[l][0]}`).join(',  ')} → {task.target} = ?
    </Expr>
  )
}

/** Poprawna odpowiedź z wyjaśnieniem. */
function Explanation({ task }) {
  if (task.type === 'quiz') return <div className="text-sm text-muted-foreground">{task.why}</div>
  if (task.type === 'missing') {
    const formula = task.tri.formulas[task.target]
    return (
      <div className="flex flex-col gap-0.5 rounded-lg bg-card px-3 py-2">
        <Expr className="italic">{colon(formula)}</Expr>
        <Expr>
          {task.target} = {substitute(formula, task.values)} ={' '}
          <b>
            {f(task.answer)} {task.unit}
          </b>
        </Expr>
      </div>
    )
  }
  return task.steps ? <Steps steps={task.steps} /> : <div className="text-sm">{task.explain}</div>
}

function Result({ tasks, answers, onAgain }) {
  const results = tasks.map((t, k) => isRight(t, answers[k]))
  const ok = results.filter(Boolean).length
  const pct = Math.round((ok / tasks.length) * 100)
  const g = gradeFor(pct)
  const byPart = Object.keys(PARTS)
    .map((type) => {
      const idx = tasks.map((t, k) => (t.type === type ? k : -1)).filter((k) => k >= 0)
      return { type, all: idx.length, ok: idx.filter((k) => results[k]).length }
    })
    .filter((p) => p.all)

  return (
    <Section>
      <Panel title="Wynik sprawdzianu ze wszystkiego" contentClassName="gap-4">
        <GradeResult grade={g} pct={pct}>
          {ok} z {tasks.length} dobrze – ocena <b>{g.name}</b>
        </GradeResult>
        <div className="grid gap-2 sm:grid-cols-3">
          {byPart.map((p) => (
            <div key={p.type} className="rounded-lg bg-secondary px-3 py-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase">{PARTS[p.type]}</div>
              <div className="text-lg font-bold tabular-nums">
                {p.ok} / {p.all}
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Odpowiedzi i rozwiązania">
        <ol className="flex flex-col gap-3">
          {tasks.map((t, k) => (
            <li
              key={k}
              className={cn(
                'flex flex-col gap-2 rounded-xl border-2 p-3',
                results[k] ? 'border-success/40' : 'border-destructive/40 bg-destructive-soft',
              )}
            >
              <div className="flex items-start gap-2">
                {results[k] ? <Check className="mt-0.5 size-5 shrink-0 text-success" /> : <X className="mt-0.5 size-5 shrink-0 text-destructive" />}
                <span>
                  <b>{k + 1}.</b> <Prompt task={t} />
                </span>
              </div>
              <div className="text-sm">
                Twoja odpowiedź:{' '}
                <b>{answers[k]?.trim() ? (t.type === 'quiz' ? answers[k] : `${answers[k]} ${t.unit}`) : '—'}</b> · poprawnie:{' '}
                <b className="text-success">{t.type === 'quiz' ? t.right : `${f(t.answer)} ${t.unit}`}</b>
              </div>
              {!results[k] && <Explanation task={t} />}
            </li>
          ))}
        </ol>
      </Panel>
      <Button size="lg" className="w-fit" onClick={onAgain}>
        <RotateCcw data-icon="inline-start" />
        Nowy sprawdzian
      </Button>
    </Section>
  )
}
