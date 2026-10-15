import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Expr, Feedback, GivenSought, Lead, NumberInput, Panel, Question, Score, Section, StepTitle } from '@/components/app/kit.jsx'
import FormulaBuilder from '../components/FormulaBuilder.jsx'
import PyramidChoice from '../components/PyramidChoice.jsx'
import PyramidPicker, { poolFor } from '../components/PyramidPicker.jsx'
import { clean, fmt, isClose, parseNum, pick } from '../lib/physics.js'
import { NAMES } from '../lib/formulas.js'
import { SCENARIOS, UNITS, substitute } from '../lib/scenarios.js'

const f = (x) => fmt(clean(x))

function newTask(pool, prev) {
  const options = pool.flatMap((t) => Object.keys(SCENARIOS[t.id].text).map((target) => ({ tri: t, target })))
  const fresh = options.filter((o) => !(prev && o.tri === prev.tri && o.target === prev.target))
  const { tri, target } = pick(fresh)
  const sc = SCENARIOS[tri.id]
  const values = sc.values()
  const known = [tri.top, ...tri.bottom].filter((l) => l !== target)
  return { tri, target, values, known, text: sc.text[target](values), key: Math.random() }
}

export default function FormulaToCalc({ record }) {
  const [pyr, setPyr] = useState('all')
  const [task, setTask] = useState(() => newTask(poolFor('all')))
  // dobór piramidy: null – jeszcze nie, true/false – trafiony za 1. razem (przy jednej piramidzie pomijamy)
  const [pyrOk, setPyrOk] = useState(null)
  const [formulaOk, setFormulaOk] = useState(null) // null | true (za 1. razem) | false
  const [value, setValue] = useState('')
  const [state, setState] = useState(null) // null | 'ok' | 'bad' | 'nan' | 'shown'
  const [tries, setTries] = useState(0)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const { tri, target, values, known } = task
  const answer = values[target]
  const unit = UNITS[target]
  const choosePyr = pyr === 'all'
  const stepFormula = !choosePyr || pyrOk !== null
  const step2 = stepFormula && formulaOk !== null
  const n = choosePyr ? 1 : 0
  const finished = state === 'ok' || state === 'shown'

  // zadanie liczy się jako dobre, gdy piramida, wzór i wynik były dobre za pierwszym razem
  const finish = (ok) => {
    const all = ok && formulaOk && (!choosePyr || pyrOk)
    setScore((s) => ({ ok: s.ok + all, all: s.all + 1 }))
    record('wzor-obliczenie', all)
  }

  const check = (e) => {
    e.preventDefault()
    if (finished) return
    const n = parseNum(value)
    if (Number.isNaN(n)) {
      setState('nan')
      return
    }
    const ok = isClose(n, answer, 0.005)
    if (ok) finish(tries === 0)
    setTries((t) => t + 1)
    setState(ok ? 'ok' : 'bad')
  }

  const reveal = () => {
    finish(false)
    setState('shown')
  }

  const next = (choice = pyr) => {
    setTask(newTask(poolFor(choice), task))
    setPyrOk(null)
    setFormulaOk(null)
    setValue('')
    setState(null)
    setTries(0)
  }

  const formula = tri.formulas[target]
  const substituted = substitute(formula, values)

  return (
    <Section>
      <Lead>Dobierz piramidę, ułóż wzór, policz. Punkt za wszystko dobrze za pierwszym razem.</Lead>
      <PyramidPicker
        value={pyr}
        onChange={(id) => {
          setPyr(id)
          next(id)
        }}
      />
      <Panel score={<Score ok={score.ok} all={score.all} />}>
        <Question>{task.text}</Question>
        <GivenSought
          given={known.map((k) => (
            <Expr key={k} className="block">
              {k} = {f(values[k])} {UNITS[k]}
            </Expr>
          ))}
          sought={
            <Expr className="block">
              {target} = ? <span className="text-muted-foreground">({NAMES[target][0]})</span>
            </Expr>
          }
        />

        {choosePyr && (
          <>
            <StepTitle>Krok 1: która piramida pasuje do zadania?</StepTitle>
            <PyramidChoice key={task.key} correct={tri} needed={[target, ...known]} onDone={setPyrOk} />
          </>
        )}

        {stepFormula && (
          <>
            <StepTitle>Krok {n + 1}: wzór</StepTitle>
            <FormulaBuilder
              key={task.key}
              target={target}
              vars={[tri.top, ...tri.bottom]}
              formula={formula}
              onDone={(ok) => setFormulaOk(ok)}
            />
          </>
        )}

        {step2 && (
          <>
            <StepTitle>Krok {n + 2}: obliczenie</StepTitle>
            <Expr>
              {target} = {substituted} = ?
            </Expr>
            <form className="flex flex-wrap items-center gap-2" onSubmit={check}>
              <NumberInput
                unit={unit}
                value={value}
                autoFocus
                onChange={(e) => {
                  setValue(e.target.value)
                  if (state === 'bad' || state === 'nan') setState(null)
                }}
                placeholder="Wynik"
                disabled={finished}
                aria-label="Wynik"
              />
              {!finished && (
                <Button size="lg" type="submit">
                  Sprawdź wynik
                </Button>
              )}
              {!finished && tries > 0 && (
                <Button size="lg" variant="outline" type="button" onClick={reveal}>
                  Pokaż wynik
                </Button>
              )}
            </form>
            {state === 'nan' && <Feedback tone="bad">Wpisz liczbę, np. 0,5 albo 120.</Feedback>}
            {state === 'bad' && (
              <Feedback tone="bad">Wynik się nie zgadza. Sprawdź mnożenie i dzielenie – spróbuj jeszcze raz.</Feedback>
            )}
            {finished && (
              <Feedback tone={state === 'ok' ? 'ok' : 'info'}>
                <div>
                  {state === 'ok' ? 'Brawo! ' : ''}
                  <Expr>
                    {target} = {substituted} = <b>{f(answer)} {unit}</b>
                  </Expr>
                </div>
                <Button onClick={() => next()}>
                  Następne zadanie
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </Feedback>
            )}
          </>
        )}
      </Panel>
    </Section>
  )
}
