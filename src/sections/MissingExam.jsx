// Sprawdzian „brakująca wielkość”: bez treści zadań – tylko dane z jednostkami i jedna szukana.
// Uczeń wybiera piramidy, z których są zadania, czy piramida jest widoczna i czy czas bywa w minutach/godzinach.
// Tryb „bez końca”: wynik i rozwiązanie po każdym zadaniu, zadania losują się, dopóki uczeń nie skończy.
import { useState } from 'react'
import { ArrowRight, Check, Clock, Eye, EyeOff, FileText, Infinity as InfinityIcon, ListOrdered, RotateCcw, Timer, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Expr, Feedback, GradeResult, NumberInput, Panel, Question, Score, ScoreDots, Section, Verdict } from '@/components/app/kit.jsx'
import { cn } from '@/lib/utils'
import Pyramid from '../components/Pyramid.jsx'
import { NAMES, TRIANGLES, UNIT, letters } from '../lib/formulas.js'
import { clean, fmt, gradeFor, isClose, parseNum, pick, shuffle } from '../lib/physics.js'
import { SCENARIOS, TIME_UNITS, substitute } from '../lib/scenarios.js'

const f = (x) => fmt(clean(x))
const colon = (formula) => formula.replace(/\//g, ':')
const hasTime = (tri) => letters(tri).includes('t')

// w trybie mieszanym czas częściej w minutach i godzinach niż w sekundach – to trzeba przećwiczyć
const MIXED_TIME = ['s', 's', 'min', 'h', 'h']

function makeTask(tri, prev, mixedTime) {
  let target
  do target = pick(letters(tri))
  while (prev && prev.tri === tri && prev.target === target)
  const tUnit = mixedTime && hasTime(tri) ? pick(MIXED_TIME) : 's'
  return { tri, target, values: SCENARIOS[tri.id].values(tUnit) }
}

function build(ids, n, mixedTime) {
  const pool = TRIANGLES.filter((t) => ids.includes(t.id))
  const order = []
  while (order.length < n) order.push(...shuffle(pool))
  const tasks = []
  for (const tri of order.slice(0, n)) tasks.push(makeTask(tri, tasks[tasks.length - 1], mixedTime))
  return tasks
}

const tUnit = (task) => task.values.tUnit ?? 's'
/** Jednostka, w której wielkość jest podana w zadaniu (czas: s, min albo h). */
const unitOf = (task, l) => (l === 't' ? tUnit(task) : UNIT[l][0])
/** Wartość wielkości w jednostce zadania (wartości w task.values są w sekundach). */
const shown = (task, l) => (l === 't' ? task.values.t / TIME_UNITS[tUnit(task)] : task.values[l])

const correct = (task, value) => isClose(parseNum(value), shown(task, task.target), 0.005)

/** Dane: wartości z jednostkami (bez treści zadania). */
function Given({ task, className }) {
  const known = letters(task.tri).filter((l) => l !== task.target)
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {known.map((l) => (
        <span key={l} className="rounded-lg bg-secondary px-3 py-1.5">
          <Expr className="text-xl">
            <i>{l}</i> = {f(shown(task, l))} {unitOf(task, l)}
          </Expr>
        </span>
      ))}
    </div>
  )
}

/** Rozwiązanie: zamiana czasu na sekundy (gdy trzeba), wzór i obliczenie. */
function Solution({ task }) {
  const formula = task.tri.formulas[task.target]
  const u = tUnit(task)
  const k = TIME_UNITS[u]
  const t = task.values.t
  const toUnit = task.target === 't' && u !== 's'
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-card px-3 py-2">
      {u !== 's' && task.target !== 't' && (
        <Expr>
          t = {f(t / k)} {u} = {f(t / k)} · {k} s = {f(t)} s
        </Expr>
      )}
      <Expr className="italic">{colon(formula)}</Expr>
      <Expr>
        {task.target} = {substitute(formula, task.values)} ={' '}
        {toUnit ? (
          <>
            {f(t)} s = ({f(t)} : {k}) {u} ={' '}
            <b>
              {f(t / k)} {u}
            </b>
          </>
        ) : (
          <b>
            {f(task.values[task.target])} {UNIT[task.target][0]}
          </b>
        )}
      </Expr>
    </div>
  )
}

export default function MissingExam({ record }) {
  const [ids, setIds] = useState(TRIANGLES.map((t) => t.id))
  const [show, setShow] = useState('visible')
  const [text, setText] = useState('none') // 'none' – same dane, 'text' – treść zadania (dane trzeba wypisać samemu)
  const [time, setTime] = useState('mixed') // 'mixed' – czas także w min i h, 'seconds' – tylko w sekundach
  const [tasks, setTasks] = useState(null)
  const [endless, setEndless] = useState(false)
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState([])
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(false) // tryb bez końca: zadanie sprawdzone, czekamy na „Następne”

  const mixedTime = time === 'mixed'
  const timeMatters = TRIANGLES.some((t) => ids.includes(t.id) && hasTime(t))

  const start = (n) => {
    const inf = n === Infinity
    setEndless(inf)
    setTasks(build(ids, inf ? 1 : n, mixedTime))
    setI(0)
    setAnswers([])
    setValue('')
    setChecked(false)
  }

  if (!tasks) {
    const hint = [
      text === 'text' ? 'Zadanie słowami – dane i szukaną wypisujesz sam.' : 'Tylko wypisane dane z jednostkami i szukana.',
      timeMatters && mixedTime ? 'Czas bywa w min lub h – zamień na sekundy (1 min = 60 s, 1 h = 3600 s).' : '',
    ]
      .filter(Boolean)
      .join(' ')
    return (
      <Section>
        <Panel contentClassName="gap-3">
          <SettingRow label="Piramidy">
            <ToggleGroup
              type="multiple"
              variant="outline"
              size="sm"
              value={ids}
              onValueChange={(v) => v.length && setIds(v)}
              aria-label="Piramidy w zadaniach"
              className="grid w-full grid-cols-2 sm:flex sm:w-fit sm:flex-wrap"
            >
              {TRIANGLES.map((t) => (
                <ToggleGroupItem key={t.id} value={t.id} className="relative h-auto flex-col gap-0.5 px-2 py-1.5 sm:flex-row sm:gap-1.5 sm:py-1">
                  {ids.includes(t.id) && <Check data-icon="inline-start" className="absolute top-1.5 left-1.5 sm:static" />}
                  {/* miniatura piramidy; przy ukrytej piramidzie same „?” – w czasie sprawdzianu jej nie będzie */}
                  <span className="w-14 shrink-0 [&_.tri-cell]:cursor-default">
                    <Pyramid className="size-full" cells={letters(t).map((l) => ({ label: show === 'visible' ? l : '' }))} />
                  </span>
                  {t.title}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </SettingRow>
          <SettingRow label="Piramida">
            <ToggleGroup type="single" variant="outline" size="sm" value={show} onValueChange={(v) => v && setShow(v)} aria-label="Widoczność piramidy">
              <ToggleGroupItem value="visible" className="px-2.5">
                <Eye data-icon="inline-start" />
                Widoczna
              </ToggleGroupItem>
              <ToggleGroupItem value="hidden" className="px-2.5">
                <EyeOff data-icon="inline-start" />
                Ukryta
              </ToggleGroupItem>
            </ToggleGroup>
          </SettingRow>
          <SettingRow label="Treść">
            <ToggleGroup type="single" variant="outline" size="sm" value={text} onValueChange={(v) => v && setText(v)} aria-label="Treść zadania">
              <ToggleGroupItem value="none" className="px-2.5">
                <ListOrdered data-icon="inline-start" />
                Same dane
              </ToggleGroupItem>
              <ToggleGroupItem value="text" className="px-2.5">
                <FileText data-icon="inline-start" />
                Z treścią
              </ToggleGroupItem>
            </ToggleGroup>
          </SettingRow>
          {timeMatters && (
            <SettingRow label="Czas">
              <ToggleGroup type="single" variant="outline" size="sm" value={time} onValueChange={(v) => v && setTime(v)} aria-label="Jednostki czasu">
                <ToggleGroupItem value="mixed" className="px-2.5">
                  <Clock data-icon="inline-start" />s, min, h
                </ToggleGroupItem>
                <ToggleGroupItem value="seconds" className="px-2.5">
                  <Timer data-icon="inline-start" />
                  Tylko s
                </ToggleGroupItem>
              </ToggleGroup>
            </SettingRow>
          )}
          <p className="text-sm text-muted-foreground">{hint}</p>
          <div className="flex flex-wrap gap-2 border-t pt-3">
            <Button onClick={() => start(6)}>6 zadań</Button>
            <Button variant="outline" onClick={() => start(10)}>
              10 zadań
            </Button>
            <Button variant="outline" onClick={() => start(15)}>
              15 zadań
            </Button>
            <Button variant="secondary" onClick={() => start(Infinity)} title="Wynik i rozwiązanie po każdym zadaniu">
              <InfinityIcon data-icon="inline-start" />
              Bez końca (trening)
            </Button>
          </div>
        </Panel>
      </Section>
    )
  }

  if (i >= tasks.length) {
    return <Result tasks={tasks} answers={answers} withText={text === 'text'} endless={endless} onAgain={() => setTasks(null)} />
  }

  const task = tasks[i]
  const unit = unitOf(task, task.target)
  const nan = value.trim() !== '' && Number.isNaN(parseNum(value))
  const results = answers.map((a, k) => correct(tasks[k], a))
  const okCount = results.filter(Boolean).length
  const ok = checked && results[i]

  const advance = (v) => {
    record('brakujaca', correct(task, v))
    setAnswers((a) => [...a, v])
    setValue('')
    setI(i + 1)
  }
  const check = (v) => {
    record('brakujaca', correct(task, v))
    setAnswers((a) => [...a, v])
    setChecked(true)
  }
  const next = () => {
    const pool = TRIANGLES.filter((t) => ids.includes(t.id))
    setTasks((ts) => [...ts, makeTask(pick(pool), ts[ts.length - 1], mixedTime)])
    setValue('')
    setChecked(false)
    setI(i + 1)
  }
  const finish = () => {
    if (!answers.length) return setTasks(null)
    setTasks(tasks.slice(0, answers.length))
    setI(answers.length)
  }
  const submit = (v) => (endless ? check(v) : advance(v))

  const score = (
    <div className="flex items-center gap-3">
      {endless && (
        <Score>
          Wynik: <b className="text-foreground tabular-nums">{okCount}</b> / {answers.length}
          {answers.length > 0 && <> ({Math.round((okCount / answers.length) * 100)}%)</>}
        </Score>
      )}
      {show === 'visible' && <Badge variant="secondary">{task.tri.title}</Badge>}
    </div>
  )

  return (
    <Section>
      <Panel title={endless ? `Zadanie ${i + 1}` : `Zadanie ${i + 1} z ${tasks.length}`} score={score}>
        {endless ? (
          <ScoreDots items={[...results.slice(-29).map((r) => (r ? 'ok' : 'bad')), ...(checked ? [] : [undefined])]} cur={checked ? -1 : Math.min(results.length, 29)} />
        ) : (
          <Progress value={(i / tasks.length) * 100} className="h-2" />
        )}
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
                  <i>{task.target}</i> = ? {task.target === 't' && unit !== 's' && unit}
                </Expr>
              </div>
            </div>
          )}
        </div>
        <form
          key={i}
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!nan && !checked) submit(value)
          }}
        >
          <span className="font-formula text-xl italic">{task.target} =</span>
          <NumberInput
            unit={unit}
            value={value}
            autoFocus
            disabled={checked}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Wynik"
            aria-label="Wynik"
          />
          {!checked && (
            <>
              <Button size="lg" type="submit" disabled={nan}>
                {endless ? 'Sprawdź' : i + 1 < tasks.length ? 'Dalej' : 'Zakończ'}
                {!endless && <ArrowRight data-icon="inline-end" />}
              </Button>
              <Button size="lg" type="button" variant="ghost" onClick={() => submit('')}>
                {endless ? 'Nie wiem' : 'Pomiń'}
              </Button>
            </>
          )}
        </form>
        {nan && <p className="text-sm text-destructive">Wpisz liczbę, np. 0,5 albo 120.</p>}
        {checked && (
          <Feedback tone={ok ? 'ok' : 'bad'}>
            <div>
              <Verdict ok={ok}>{ok ? 'Dobrze!' : 'Źle.'}</Verdict> Wynik:{' '}
              <b>
                {f(shown(task, task.target))} {unit}
              </b>
              {!ok && answers[i]?.trim() && (
                <span className="text-muted-foreground">
                  {' '}
                  (Twoja odpowiedź: {answers[i]} {unit})
                </span>
              )}
            </div>
            <Solution task={task} />
            <Button autoFocus onClick={next}>
              Następne zadanie
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Feedback>
        )}
        {endless && (
          <Button variant="outline" className="w-fit" onClick={finish}>
            Zakończ trening
          </Button>
        )}
      </Panel>
    </Section>
  )
}

function Result({ tasks, answers, withText, endless, onAgain }) {
  const results = tasks.map((t, k) => correct(t, answers[k] ?? ''))
  const ok = results.filter(Boolean).length
  const pct = Math.round((ok / tasks.length) * 100)
  const g = gradeFor(pct)
  return (
    <Section>
      <Panel title={endless ? 'Wynik treningu' : 'Wynik'}>
        <GradeResult grade={g} pct={pct}>
          {ok} z {tasks.length} dobrze – ocena <b>{g.name}</b>
        </GradeResult>
      </Panel>
      <Panel title="Rozwiązania">
        <ol className="flex flex-col gap-3">
          {tasks.map((t, k) => {
            const unit = unitOf(t, t.target)
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
                    → <i>{t.target}</i> = ? {t.target === 't' && unit !== 's' && unit}
                  </Expr>
                  <span className="text-sm text-muted-foreground">({NAMES[t.target][0]})</span>
                </div>
                {withText && <p className="text-sm">{SCENARIOS[t.tri.id].text[t.target](t.values)}</p>}
                <div className="text-sm">
                  Twoja odpowiedź: <b>{answers[k]?.trim() ? `${answers[k]} ${unit}` : '—'}</b>
                </div>
                <Solution task={t} />
              </li>
            )
          })}
        </ol>
      </Panel>
      <Button size="lg" className="w-fit" onClick={onAgain}>
        <RotateCcw data-icon="inline-start" />
        {endless ? 'Nowy trening' : 'Nowy sprawdzian'}
      </Button>
    </Section>
  )
}

/** Wiersz ustawień: krótka etykieta i przełączniki obok. */
function SettingRow({ label, children }) {
  return (
    <div className="grid items-center gap-x-3 gap-y-1 sm:grid-cols-[5.5rem_1fr]">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
