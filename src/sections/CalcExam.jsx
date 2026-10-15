// Sprawdzian z obliczeń: zadania z wpisywaniem wyniku, ocena wg progów z zeszytu, na końcu rozwiązania.
import { useState } from 'react'
import { ArrowRight, Check, ClipboardCheck, GraduationCap, RotateCcw, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Expr, Feedback, GradeResult, Lead, NumberInput, Panel, Question, Section, Verdict } from '@/components/app/kit.jsx'
import { cn } from '@/lib/utils'
import { Steps } from '../components/NumberTask.jsx'
import { fmt, gradeFor, isClose, parseNum, pick, shuffle } from '../lib/physics.js'
import { PROBLEMS } from '../lib/problems.js'
import { UNIT_TASKS } from '../lib/unitTasks.js'

// rodzaje zadań na sprawdzianie – po kolei z każdego, żeby test był zróżnicowany
const KINDS = ['Jednostki', 'Napięcie', 'Natężenie', 'Moc', 'Praca', 'Z zeszytu', 'Dwa kroki']

function makeTask(kind) {
  if (kind === 'Jednostki') return { kind, ...pick(UNIT_TASKS)[1]() }
  return { kind, ...pick(PROBLEMS.filter((p) => p.topic === kind)).make() }
}

function build(n) {
  const kinds = []
  while (kinds.length < n) kinds.push(...shuffle(KINDS))
  // zadania dwuetapowe na koniec – jak na prawdziwym sprawdzianie, od łatwiejszych do trudniejszych
  return kinds
    .slice(0, n)
    .sort((a, b) => (a === 'Dwa kroki') - (b === 'Dwa kroki'))
    .map(makeTask)
}

const MODES = {
  exam: { label: 'Jak na sprawdzianie', icon: GraduationCap, desc: 'Wpisujesz wyniki jeden po drugim. Poprawne odpowiedzi i rozwiązania zobaczysz dopiero na końcu.' },
  practice: { label: 'Z poprawą', icon: ClipboardCheck, desc: 'Po każdym zadaniu od razu widzisz, czy dobrze, i całe rozwiązanie.' },
}

const correct = (task, value) => isClose(parseNum(value), task.answer, 0.005)

export default function CalcExam({ record }) {
  const [mode, setMode] = useState('exam')
  const [tasks, setTasks] = useState(null)
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState([])
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(false) // tryb z poprawą: zadanie sprawdzone, czekamy na „Dalej”

  const start = (n) => {
    setTasks(build(n))
    setI(0)
    setAnswers([])
    setValue('')
    setChecked(false)
  }

  if (!tasks) {
    return (
      <Section>
        <Lead>
          Same zadania obliczeniowe: zamiana jednostek, napięcie, natężenie, moc, praca prądu i zadania „na dwa kroki”.
          Wynik wpisujesz liczbą – ocena według progów z zeszytu (95% – 6, 85% – 5, 70% – 4, 50% – 3, 30% – 2).
        </Lead>
        <Panel title="Wybierz tryb">
          <ToggleGroup type="single" variant="outline" value={mode} onValueChange={(v) => v && setMode(v)} aria-label="Tryb">
            {Object.entries(MODES).map(([k, m]) => (
              <ToggleGroupItem key={k} value={k} className="px-4">
                <m.icon data-icon="inline-start" />
                {m.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="max-w-2xl text-sm text-muted-foreground">{MODES[mode].desc}</p>
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
        </Panel>
      </Section>
    )
  }

  if (i >= tasks.length) return <Result tasks={tasks} answers={answers} onAgain={() => setTasks(null)} />

  const task = tasks[i]
  const ok = correct(task, value)
  const nan = value.trim() !== '' && Number.isNaN(parseNum(value))

  const advance = (v) => {
    if (mode === 'exam') record('egzamin', correct(task, v))
    setAnswers((a) => [...a, v])
    setValue('')
    setChecked(false)
    setI(i + 1)
  }
  const submit = (e) => {
    e?.preventDefault()
    if (nan) return
    if (mode === 'practice' && !checked) {
      setChecked(true)
      record('egzamin', ok)
      return
    }
    advance(value)
  }

  return (
    <Section>
      <Panel title={`Zadanie ${i + 1} z ${tasks.length}`} score={<Badge variant="secondary">{task.kind}</Badge>}>
        <Progress value={(i / tasks.length) * 100} className="h-2" />
        <Question>{task.q}</Question>
        <form className="flex flex-wrap items-center gap-2" onSubmit={submit}>
          <NumberInput
            unit={task.unit}
            value={value}
            autoFocus
            disabled={checked}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Wynik"
            aria-label="Wynik"
          />
          {!checked && (
            <Button size="lg" type="submit" disabled={nan}>
              {mode === 'practice' ? 'Sprawdź' : i + 1 < tasks.length ? 'Dalej' : 'Zakończ'}
              {mode === 'exam' && <ArrowRight data-icon="inline-end" />}
            </Button>
          )}
          {!checked && mode === 'exam' && (
            <Button size="lg" type="button" variant="ghost" onClick={() => advance('')}>
              Pomiń
            </Button>
          )}
        </form>
        {nan && <p className="text-sm text-destructive">Wpisz liczbę, np. 0,05 albo 3 600 000.</p>}
        {checked && (
          <Feedback tone={ok ? 'ok' : 'bad'}>
            <div>
              <Verdict ok={ok}>{ok ? 'Dobrze!' : 'Źle.'}</Verdict> Wynik:{' '}
              <b>
                {fmt(task.answer)} {task.unit}
              </b>
            </div>
            {task.steps ? <Steps steps={task.steps} /> : <div>{task.explain}</div>}
            <Button onClick={submit}>
              {i + 1 < tasks.length ? 'Następne zadanie' : 'Zobacz wynik'}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Feedback>
        )}
      </Panel>
    </Section>
  )
}

function Result({ tasks, answers, onAgain }) {
  const results = tasks.map((t, k) => correct(t, answers[k] ?? ''))
  const ok = results.filter(Boolean).length
  const pct = Math.round((ok / tasks.length) * 100)
  const g = gradeFor(pct)
  return (
    <Section>
      <Panel title="Wynik sprawdzianu z obliczeń">
        <GradeResult grade={g} pct={pct}>
          {ok} z {tasks.length} zadań dobrze – ocena <b>{g.name}</b>
        </GradeResult>
      </Panel>
      <Panel title="Rozwiązania">
        <ol className="flex flex-col gap-4">
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
                  <b>{k + 1}.</b> {t.q}
                </span>
              </div>
              <div className="text-sm">
                Twoja odpowiedź: <b>{answers[k]?.trim() ? `${answers[k]} ${t.unit}` : '—'}</b> · poprawnie:{' '}
                <Expr className="text-base font-bold">
                  {fmt(t.answer)} {t.unit}
                </Expr>
              </div>
              {!results[k] && (t.steps ? <Steps steps={t.steps} /> : <div className="text-sm">{t.explain}</div>)}
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
