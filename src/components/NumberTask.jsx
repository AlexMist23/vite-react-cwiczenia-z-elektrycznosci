import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Expr, Feedback, GivenSought, NumberInput, Panel, Question, Score } from './app/kit.jsx'
import { fmt, isClose, parseNum } from '../lib/physics.js'

/**
 * Zadanie z odpowiedzią liczbową.
 * generate() zwraca { q, answer, unit, explain, steps? }, gdzie steps to
 * { dane: [], szukane, wzor, obliczenia } – rozwiązanie w stylu zeszytu.
 */
export default function NumberTask({ generate, onResult }) {
  const [task, setTask] = useState(generate)
  const [value, setValue] = useState('')
  const [state, setState] = useState(null) // null | 'ok' | 'bad' | 'shown'
  const [tries, setTries] = useState(0)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const check = (e) => {
    e.preventDefault()
    if (state === 'ok' || state === 'shown') return
    const n = parseNum(value)
    if (Number.isNaN(n)) {
      setState('nan')
      return
    }
    const ok = isClose(n, task.answer, 0.005)
    // liczymy tylko pierwszą próbę
    if (tries === 0) {
      setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
      onResult?.(ok)
    }
    setTries((t) => t + 1)
    setState(ok ? 'ok' : 'bad')
  }

  const reveal = () => {
    if (tries === 0) {
      setScore((s) => ({ ok: s.ok, all: s.all + 1 }))
      onResult?.(false)
    }
    setState('shown')
  }

  const next = () => {
    setTask(generate())
    setValue('')
    setState(null)
    setTries(0)
  }

  const finished = state === 'ok' || state === 'shown'

  return (
    <Panel score={<Score ok={score.ok} all={score.all} />}>
      <Question>{task.q}</Question>
      <form className="flex flex-wrap items-center gap-2" onSubmit={check}>
        <NumberInput
          unit={task.unit}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (state === 'bad' || state === 'nan') setState(null)
          }}
          placeholder="Twoja odpowiedź"
          disabled={finished}
          aria-label="Odpowiedź"
        />
        {!finished && (
          <Button size="lg" type="submit">
            Sprawdź
          </Button>
        )}
        {!finished && (
          <Button size="lg" variant="outline" type="button" onClick={reveal}>
            Pokaż rozwiązanie
          </Button>
        )}
      </form>
      {state === 'nan' && <Feedback tone="bad">Wpisz liczbę, np. 0,05 albo 3600.</Feedback>}
      {state === 'bad' && (
        <Feedback tone="bad">Jeszcze nie. Sprawdź jednostki i przecinek – spróbuj ponownie albo zobacz rozwiązanie.</Feedback>
      )}
      {finished && (
        <Feedback tone={state === 'ok' ? 'ok' : 'info'}>
          <div>
            {state === 'ok' ? 'Brawo! ' : ''}Odpowiedź: <b>{fmt(task.answer)} {task.unit}</b>
          </div>
          {task.steps ? <Steps steps={task.steps} /> : <div>{task.explain}</div>}
          <Button onClick={next}>
            Następne
            <ArrowRight data-icon="inline-end" />
          </Button>
        </Feedback>
      )}
    </Panel>
  )
}

function Steps({ steps }) {
  return (
    <div className="grid w-full gap-1.5 rounded-lg bg-card p-3">
      <GivenSought
        className="bg-transparent p-0"
        given={steps.dane.map((d) => (
          <div key={d}>{d}</div>
        ))}
        sought={<div>{steps.szukane}</div>}
      />
      <div className="font-bold text-primary">Rozwiązanie:</div>
      {steps.obliczenia.map((l) => (
        <Expr key={l} className="block">
          {l}
        </Expr>
      ))}
      {steps.odp && (
        <div>
          <b>Odp.:</b> {steps.odp}
        </div>
      )}
    </div>
  )
}
