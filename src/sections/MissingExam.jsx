// Sprawdzian „brakująca wielkość”: bez treści zadań – tylko dane z jednostkami i jedna szukana.
// Uczeń wybiera piramidy, z których są zadania, i czy piramida jest widoczna.
import { useState } from 'react'
import { ArrowRight, Check, Eye, EyeOff, FileText, ListOrdered, RotateCcw, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Expr, GradeResult, NumberInput, Panel, Question, Section } from '@/components/app/kit.jsx'
import { cn } from '@/lib/utils'
import Pyramid from '../components/Pyramid.jsx'
import { NAMES, TRIANGLES, UNIT, letters } from '../lib/formulas.js'
import { clean, fmt, gradeFor, isClose, parseNum, pick, shuffle } from '../lib/physics.js'
import { SCENARIOS, substitute } from '../lib/scenarios.js'

const f = (x) => fmt(clean(x))
const colon = (formula) => formula.replace(/\//g, ':')

function makeTask(tri, prev) {
  let target
  do target = pick(letters(tri))
  while (prev && prev.tri === tri && prev.target === target)
  return { tri, target, values: SCENARIOS[tri.id].values() }
}

function build(ids, n) {
  const pool = TRIANGLES.filter((t) => ids.includes(t.id))
  const order = []
  while (order.length < n) order.push(...shuffle(pool))
  const tasks = []
  for (const tri of order.slice(0, n)) tasks.push(makeTask(tri, tasks[tasks.length - 1]))
  return tasks
}

const correct = (task, value) => isClose(parseNum(value), task.values[task.target], 0.005)

/** Dane: wartości z jednostkami (bez treści zadania). */
function Given({ task, className }) {
  const known = letters(task.tri).filter((l) => l !== task.target)
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {known.map((l) => (
        <span key={l} className="rounded-lg bg-secondary px-3 py-1.5">
          <Expr className="text-xl">
            <i>{l}</i> = {f(task.values[l])} {UNIT[l][0]}
          </Expr>
        </span>
      ))}
    </div>
  )
}

export default function MissingExam({ record }) {
  const [ids, setIds] = useState(TRIANGLES.map((t) => t.id))
  const [show, setShow] = useState('visible')
  const [text, setText] = useState('none') // 'none' – same dane, 'text' – treść zadania (dane trzeba wypisać samemu)
  const [tasks, setTasks] = useState(null)
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState([])
  const [value, setValue] = useState('')

  const start = (n) => {
    setTasks(build(ids, n))
    setI(0)
    setAnswers([])
    setValue('')
  }

  if (!tasks) {
    return (
      <Section>
        <Panel title="Z których piramid mają być zadania?" contentClassName="gap-3">
          <ToggleGroup
            type="multiple"
            variant="outline"
            value={ids}
            onValueChange={(v) => v.length && setIds(v)}
            aria-label="Piramidy w zadaniach"
            className="flex-wrap"
          >
            {TRIANGLES.map((t) => (
              <ToggleGroupItem key={t.id} value={t.id} className="px-3.5">
                {ids.includes(t.id) && <Check data-icon="inline-start" />}
                {t.title}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-sm text-muted-foreground">Możesz zaznaczyć jedną albo kilka piramid.</p>
        </Panel>
        <Panel title="Piramida w czasie sprawdzianu" contentClassName="gap-3">
          <ToggleGroup type="single" variant="outline" value={show} onValueChange={(v) => v && setShow(v)} aria-label="Widoczność piramidy">
            <ToggleGroupItem value="visible" className="px-4">
              <Eye data-icon="inline-start" />
              Widoczna
            </ToggleGroupItem>
            <ToggleGroupItem value="hidden" className="px-4">
              <EyeOff data-icon="inline-start" />
              Ukryta – wzór z pamięci
            </ToggleGroupItem>
          </ToggleGroup>
        </Panel>
        <Panel title="Treść zadania" contentClassName="gap-3">
          <ToggleGroup type="single" variant="outline" value={text} onValueChange={(v) => v && setText(v)} aria-label="Treść zadania">
            <ToggleGroupItem value="none" className="px-4">
              <ListOrdered data-icon="inline-start" />
              Bez treści – same dane
            </ToggleGroupItem>
            <ToggleGroupItem value="text" className="px-4">
              <FileText data-icon="inline-start" />
              Z treścią zadania
            </ToggleGroupItem>
          </ToggleGroup>
          <p className="text-sm text-muted-foreground">
            {text === 'text'
              ? 'Dostajesz zadanie słowami – dane i szukaną wypisujesz sam, jak na sprawdzianie.'
              : 'Dostajesz tylko wypisane dane z jednostkami i to, czego szukasz.'}
          </p>
        </Panel>
        <div className="flex flex-wrap gap-2">
          <Button size="lg" onClick={() => start(6)}>
            Krótki (6 zadań)
          </Button>
          <Button size="lg" variant="outline" onClick={() => start(10)}>
            Pełny (10 zadań)
          </Button>
          <Button size="lg" variant="outline" onClick={() => start(15)}>
            Długi (15 zadań)
          </Button>
        </div>
      </Section>
    )
  }

  if (i >= tasks.length) return <Result tasks={tasks} answers={answers} withText={text === 'text'} onAgain={() => setTasks(null)} />

  const task = tasks[i]
  const nan = value.trim() !== '' && Number.isNaN(parseNum(value))
  const advance = (v) => {
    record('brakujaca', correct(task, v))
    setAnswers((a) => [...a, v])
    setValue('')
    setI(i + 1)
  }

  return (
    <Section>
      <Panel
        title={`Zadanie ${i + 1} z ${tasks.length}`}
        score={show === 'visible' ? <Badge variant="secondary">{task.tri.title}</Badge> : undefined}
      >
        <Progress value={(i / tasks.length) * 100} className="h-2" />
        <div className="flex flex-wrap items-center gap-6">
          {show === 'visible' && (
            <div className="w-32 shrink-0 [&_.tri-cell]:cursor-default">
              <Pyramid cells={letters(task.tri).map((l) => ({ label: l }))} />
            </div>
          )}
          {text === 'text' ? (
            <Question className="max-w-2xl flex-1">{SCENARIOS[task.tri.id].text[task.target](task.values)}</Question>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Dane</div>
                <Given task={task} />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Szukane</div>
                <Expr className="text-xl">
                  <i>{task.target}</i> = ?
                </Expr>
              </div>
            </div>
          )}
        </div>
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!nan) advance(value)
          }}
        >
          <span className="font-formula text-xl italic">{task.target} =</span>
          <NumberInput unit={UNIT[task.target][0]} value={value} autoFocus onChange={(e) => setValue(e.target.value)} placeholder="Wynik" aria-label="Wynik" />
          <Button size="lg" type="submit" disabled={nan}>
            {i + 1 < tasks.length ? 'Dalej' : 'Zakończ'}
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button size="lg" type="button" variant="ghost" onClick={() => advance('')}>
            Pomiń
          </Button>
        </form>
        {nan && <p className="text-sm text-destructive">Wpisz liczbę, np. 0,5 albo 120.</p>}
      </Panel>
    </Section>
  )
}

function Result({ tasks, answers, withText, onAgain }) {
  const results = tasks.map((t, k) => correct(t, answers[k] ?? ''))
  const ok = results.filter(Boolean).length
  const pct = Math.round((ok / tasks.length) * 100)
  const g = gradeFor(pct)
  return (
    <Section>
      <Panel title="Wynik">
        <GradeResult grade={g} pct={pct}>
          {ok} z {tasks.length} dobrze – ocena <b>{g.name}</b>
        </GradeResult>
      </Panel>
      <Panel title="Rozwiązania">
        <ol className="flex flex-col gap-3">
          {tasks.map((t, k) => {
            const formula = t.tri.formulas[t.target]
            return (
              <li
                key={k}
                className={cn(
                  'flex flex-col gap-2 rounded-xl border-2 p-3',
                  results[k] ? 'border-success/40' : 'border-destructive/40 bg-destructive-soft',
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {results[k] ? <Check className="size-5 text-success" /> : <X className="size-5 text-destructive" />}
                  <b>{k + 1}.</b>
                  <Given task={t} />
                  <Expr className="text-xl">
                    → <i>{t.target}</i> = ?
                  </Expr>
                  <span className="text-sm text-muted-foreground">({NAMES[t.target][0]})</span>
                </div>
                {withText && <p className="text-sm">{SCENARIOS[t.tri.id].text[t.target](t.values)}</p>}
                <div className="text-sm">
                  Twoja odpowiedź: <b>{answers[k]?.trim() ? `${answers[k]} ${UNIT[t.target][0]}` : '—'}</b>
                </div>
                <div className="flex flex-col gap-0.5 rounded-lg bg-card px-3 py-2">
                  <Expr className="italic">{colon(formula)}</Expr>
                  <Expr>
                    {t.target} = {substitute(formula, t.values)} = <b>{f(t.values[t.target])} {UNIT[t.target][0]}</b>
                  </Expr>
                </div>
              </li>
            )
          })}
        </ol>
      </Panel>
      <Button size="lg" className="w-fit" onClick={onAgain}>
        <RotateCcw data-icon="inline-start" />
        Nowy sprawdzian
      </Button>
    </Section>
  )
}
