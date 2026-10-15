import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Answers, Feedback, Formula, Lead, Panel, Question, Score, Section, StepTitle, TileBtn, Verdict } from '@/components/app/kit.jsx'
import AnswerBtn from '../components/AnswerBtn.jsx'
import FormulaBuilder from '../components/FormulaBuilder.jsx'
import Pyramid from '../components/Pyramid.jsx'
import PyramidChoice from '../components/PyramidChoice.jsx'
import PyramidPicker, { HintButton, poolFor } from '../components/PyramidPicker.jsx'
import { pick, shuffle } from '../lib/physics.js'
import { NAMES, letters, samePyramid } from '../lib/formulas.js'

const ALL_LETTERS = Object.keys(NAMES)

// skojarzenia, które pomagają zapamiętać symbol
const WHY_SYMBOL = {
  E: 'E od „energia”.',
  W: 'W od angielskiego „work” – praca. Nie myl z jednostką mocy W (wat)!',
  U: 'Napięcie oznaczamy literą U, a jego jednostką jest wolt (V).',
  q: 'Małe q – ładunek (od angielskiego „quantity” – ilość ładunku). Duże Q też się spotyka.',
  I: 'I od francuskiego „intensité” – natężenie.',
  t: 't od „time” – czas.',
  P: 'P od angielskiego „power” – moc.',
}

const TITLES = { piramida: 'Ułóż piramidę', wzor: 'Ułóż wzór', symbole: 'Symbol i jednostka' }

export default function FormulaTrainer({ record, sub = 'piramida' }) {
  const mode = sub
  const [pyr, setPyr] = useState('all')
  const pool = poolFor(pyr)
  const [score, setScore] = useState({ ok: 0, all: 0 })
  const result = (ok) => {
    setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
    record('trening', ok)
  }

  return (
    <Section>
      <Lead>
        Najpierw naucz się piramid na pamięć, potem przekształcaj wzory bez podglądania. Na górze piramidy jest to, co
        powstaje z mnożenia (E, q, P, W), na dole – to, co mnożymy.
      </Lead>
      <PyramidPicker value={pyr} onChange={setPyr} />
      <Panel score={<Score ok={score.ok} all={score.all} />} title={TITLES[mode]}>
        {mode === 'piramida' && <PyramidDrill key={pyr} pool={pool} onResult={result} />}
        {mode === 'wzor' && <BuildDrill key={pyr} pool={pool} onResult={result} />}
        {mode === 'symbole' && <SymbolDrill key={pyr} pool={pool} onResult={result} />}
      </Panel>
    </Section>
  )
}

/* ---------- 1. Ułóż piramidę z liter ---------- */

function newPyramidTask(pool, prev) {
  const tri = pick(pool)
  const given = pick(Object.values(tri.formulas).filter((f) => f !== prev?.given))
  const extra = shuffle(ALL_LETTERS.filter((l) => !letters(tri).includes(l))).slice(0, 2)
  return { tri, given, pool: shuffle([...letters(tri), ...extra]) }
}

function PyramidDrill({ pool, onResult }) {
  const [task, setTask] = useState(() => newPyramidTask(pool))
  const [cells, setCells] = useState(() => letters(task.tri).map(() => ''))
  const [state, setState] = useState(null) // null | 'ok' | 'bad' | 'shown'
  const [tries, setTries] = useState(0)
  const finished = state === 'ok' || state === 'shown'
  const used = cells.filter(Boolean)

  const put = (l) => {
    if (finished) return
    const i = cells.indexOf('')
    if (i < 0) return
    setCells((c) => c.map((x, k) => (k === i ? l : x)))
    setState(null)
  }
  const clear = (i) => {
    if (finished) return
    setCells((c) => c.map((x, k) => (k === i ? '' : x)))
    setState(null)
  }
  const check = () => {
    const ok = samePyramid(cells, task.tri)
    if (tries === 0) onResult(ok)
    setTries((n) => n + 1)
    setState(ok ? 'ok' : 'bad')
  }
  const reveal = () => {
    if (tries === 0) onResult(false)
    setCells(letters(task.tri))
    setState('shown')
  }
  const next = () => {
    const t = newPyramidTask(pool, task)
    setTask(t)
    setCells(letters(t.tri).map(() => ''))
    setState(null)
    setTries(0)
  }

  const cls = state === 'ok' ? 'right' : state === 'bad' ? 'wrong' : ''

  return (
    <>
      <Question>
        Ułóż piramidę dla wzoru <Formula>{task.given}</Formula>
      </Question>
      <p className="text-muted-foreground">
        Klikaj litery – wypełniają piramidę od góry. Kliknij literę w piramidzie, żeby ją zdjąć.
      </p>
      <div className="flex flex-wrap items-center gap-4.5 [&_.triangle]:max-w-60">
        <Pyramid cells={cells.map((l) => ({ label: l, cls: l ? `filled ${cls}` : '' }))} onCell={clear} />
        <div className="flex flex-wrap gap-2">
          {task.pool.map((l) => (
            <TileBtn key={l} letter onClick={() => put(l)} disabled={finished || used.includes(l)}>
              {l}
            </TileBtn>
          ))}
        </div>
      </div>
      {!finished && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={check} disabled={cells.includes('')}>
            Sprawdź
          </Button>
          <Button variant="outline" onClick={reveal}>
            Pokaż piramidę
          </Button>
        </div>
      )}
      {state === 'bad' && (
        <Feedback tone="bad">
          Coś nie pasuje. Na górze stoi wielkość, która jest iloczynem pozostałych (np. P = U · I → P na górze).
        </Feedback>
      )}
      {finished && (
        <Feedback tone={state === 'ok' ? 'ok' : 'info'}>
          <div>
            {state === 'ok' ? 'Brawo! ' : ''}
            {task.tri.title}: {Object.values(task.tri.formulas).join(',  ')}
          </div>
          <Button onClick={next}>
            Następne
            <ArrowRight data-icon="inline-end" />
          </Button>
        </Feedback>
      )}
    </>
  )
}

/* ---------- 2. Ułóż wzór z klocków ---------- */

function newBuildTask(pool, prev) {
  // nie powtarzamy tego samego pytania dwa razy z rzędu
  const options = pool.flatMap((tri) => letters(tri).map((target) => ({ tri, target })))
  const fresh = options.filter((o) => !(prev && o.tri === prev.tri && o.target === prev.target))
  return { ...pick(fresh), key: Math.random() }
}

function BuildDrill({ pool, onResult }) {
  const [task, setTask] = useState(() => newBuildTask(pool))
  const [done, setDone] = useState(false)
  const [hint, setHint] = useState(false)
  // przy wszystkich piramidach najpierw trzeba dobrać właściwą; przy jednej – można ją odsłonić bez punktu
  const choosePyr = pool.length > 1
  const [pyrOk, setPyrOk] = useState(null)
  const { tri, target } = task
  const known = letters(tri).filter((l) => l !== target)

  const next = () => {
    setTask(newBuildTask(pool, task))
    setDone(false)
    setHint(false)
    setPyrOk(null)
  }

  return (
    <>
      <Question>
        Ułóż wzór na <b className="text-sec">{target}</b> ({NAMES[target][0]}), gdy znasz:{' '}
        {known.map((k) => `${k} (${NAMES[k][0]})`).join(', ')}.
      </Question>
      {choosePyr ? (
        <>
          <StepTitle>Krok 1: która piramida pasuje?</StepTitle>
          <PyramidChoice key={task.key} correct={tri} needed={[target, ...known]} onDone={setPyrOk} />
        </>
      ) : hint ? (
        <div className="hint-pyramid [&_.triangle]:max-w-37.5">
          <Pyramid cells={letters(tri).map((l) => ({ label: l, cls: l === target ? 'covered' : '' }))} />
        </div>
      ) : (
        !done && <HintButton onReveal={() => setHint(true)} />
      )}
      {(!choosePyr || pyrOk !== null) && (
        <>
          {choosePyr && <StepTitle>Krok 2: ułóż wzór</StepTitle>}
          <FormulaBuilder
            key={task.key}
            target={target}
            vars={letters(tri)}
            formula={tri.formulas[target]}
            onDone={(ok) => {
              onResult(ok && !hint && (!choosePyr || pyrOk))
              setDone(true)
            }}
          />
        </>
      )}
      {done && (
        <Button className="w-fit" onClick={next}>
          Następne
          <ArrowRight data-icon="inline-end" />
        </Button>
      )}
    </>
  )
}

/* ---------- 3. Symbol, nazwa i jednostka ---------- */

function newSymbolTask(pool) {
  const sym = pick([...new Set(pool.flatMap(letters))])
  const [name, unit] = NAMES[sym]
  const kind = pick(['name', 'unit', 'symbol'])
  const why = `${sym} – ${name}, jednostka: ${unit}. ${WHY_SYMBOL[sym]}`
  if (kind === 'name') {
    const opts = shuffle([...new Set(ALL_LETTERS.map((l) => NAMES[l][0]))].filter((n) => n !== name)).slice(0, 3)
    return { q: <>Co oznacza symbol <Formula>{sym}</Formula>?</>, right: name, options: shuffle([name, ...opts]), why }
  }
  if (kind === 'unit') {
    const opts = shuffle([...new Set(ALL_LETTERS.map((l) => NAMES[l][1]))].filter((u) => u !== unit)).slice(0, 3)
    return { q: <>Jaka jest jednostka wielkości „{name}” ({sym})?</>, right: unit, options: shuffle([unit, ...opts]), why }
  }
  // E i W mają ten sam opis jednostki, więc przy symbolu pytamy o nazwę, a nie o jednostkę
  const opts = shuffle(ALL_LETTERS.filter((l) => l !== sym)).slice(0, 3)
  return { q: <>Jakim symbolem oznaczamy wielkość „{name}”?</>, right: sym, options: shuffle([sym, ...opts]), why }
}

function SymbolDrill({ pool, onResult }) {
  const [task, setTask] = useState(() => newSymbolTask(pool))
  const [answer, setAnswer] = useState(null)
  const choose = (a) => {
    if (answer) return
    setAnswer(a)
    onResult(a === task.right)
  }
  return (
    <>
      <Question>{task.q}</Question>
      <Answers cols="two">
        {task.options.map((o) => (
          <AnswerBtn key={o} id={o} answer={answer} correct={task.right} choose={choose}>
            {o}
          </AnswerBtn>
        ))}
      </Answers>
      {answer && (
        <Feedback tone={answer === task.right ? 'ok' : 'bad'}>
          <div>
            <Verdict ok={answer === task.right}>{answer === task.right ? 'Dobrze!' : `Poprawnie: ${task.right}.`}</Verdict>{' '}
            {task.why}
          </div>
          <Button
            onClick={() => {
              setTask(newSymbolTask(pool))
              setAnswer(null)
            }}
          >
            Następne
            <ArrowRight data-icon="inline-end" />
          </Button>
        </Feedback>
      )}
    </>
  )
}
