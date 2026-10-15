import { useEffect, useState } from 'react'
import { ArrowRight, RefreshCw, RotateCcw, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Answers, Feedback, FlowLegend, Panel, Score, Section, Verdict } from '@/components/app/kit.jsx'
import { CutWires, Symbol } from '../components/Symbols.jsx'
import { pick, rand } from '../lib/physics.js'
import AnswerBtn from '../components/AnswerBtn.jsx'

// Prostokątny obwód; boki w kolejności obiegu zgodnego z ruchem wskazówek zegara.
const SIDES = [
  { c: [200, 40], rot: 0 }, // góra
  { c: [340, 140], rot: 90 }, // prawo
  { c: [200, 240], rot: 180 }, // dół
  { c: [60, 140], rot: 270 }, // lewo
]
// Punkty, w których rysujemy strzałki (po dwie na bok), z kątem obiegu "zgodnie".
const ARROW_SPOTS = [
  [110, 40, 0], [290, 40, 0],
  [340, 85, 90], [340, 195, 90],
  [290, 240, 180], [110, 240, 180],
  [60, 195, 270], [60, 85, 270],
]

function newTask() {
  const batterySide = rand(0, 3)
  const others = [0, 1, 2, 3].filter((s) => s !== batterySide)
  const bulbSide = pick(others)
  const switchSide = pick(others.filter((s) => s !== bulbSide))
  const flip = Math.random() < 0.5
  // Plus na początku boku (licząc zgodnie z ruchem wskazówek) => prąd płynie przeciwnie.
  const currentCW = flip
  const kind = pick(['current', 'electrons', 'which'])
  const shownCW = Math.random() < 0.5 // tylko dla pytania "which"
  return { batterySide, bulbSide, switchSide, flip, currentCW, kind, shownCW }
}

// Obwód jako prostokąt obiegany zgodnie z ruchem wskazówek zegara: punkt na obwodzie dla drogi s.
const PERIM = 2 * (280 + 200)
function along(s) {
  s = ((s % PERIM) + PERIM) % PERIM
  if (s < 280) return { x: 60 + s, y: 40, nx: 0, ny: -1, a: 0 }
  if (s < 480) return { x: 340, y: 40 + (s - 280), nx: 1, ny: 0, a: 90 }
  if (s < 760) return { x: 340 - (s - 480), y: 240, nx: 0, ny: 1, a: 180 }
  return { x: 60, y: 240 - (s - 760), nx: -1, ny: 0, a: 270 }
}

/** Animacja po odpowiedzi: strzałki prądu (na zewnątrz przewodu) i elektrony (na przewodzie). */
function Flow({ currentCW, elements }) {
  const [t, setT] = useState(0)
  useEffect(() => {
    let raf
    let last = performance.now()
    const tick = (now) => {
      setT((v) => v + Math.min(0.1, (now - last) / 1000))
      last = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  const speed = 45 // jednostek rysunku na sekundę
  const dirI = currentCW ? 1 : -1
  // elektron „chowa się” w elemencie, zamiast po nim przejeżdżać
  const hidden = (p) => elements.some(([x, y, h]) => Math.abs(p.x - x) < h && Math.abs(p.y - y) < h)
  const electrons = Array.from({ length: 24 }, (_, i) => along(i * (PERIM / 24) - dirI * t * speed)).filter((p) => !hidden(p))
  // przy baterii strzałki by zasłaniały znaki „+” i „−”
  const [bx, by] = elements[0]
  const arrows = Array.from({ length: 10 }, (_, i) => along(i * (PERIM / 10) + dirI * t * speed)).filter(
    (p) => !(Math.abs(p.x - bx) < 34 && Math.abs(p.y - by) < 34),
  )
  return (
    <>
      {electrons.map((p, i) => (
        <g key={`e${i}`} transform={`translate(${p.x} ${p.y})`} className="electron">
          <circle r="6" />
          <text y="3.6" textAnchor="middle">−</text>
        </g>
      ))}
      {arrows.map((p, i) => (
        <path
          key={`a${i}`}
          d="M -8 -6 L 8 0 L -8 6 Z"
          className="arrow-current"
          transform={`translate(${p.x + p.nx * 16} ${p.y + p.ny * 16}) rotate(${p.a + (currentCW ? 0 : 180)})`}
        />
      ))}
    </>
  )
}

const dirWord = (cw) => (cw ? 'zgodnie z ruchem wskazówek zegara' : 'przeciwnie do ruchu wskazówek zegara')

function Arrows({ cw, className, skipSides }) {
  return ARROW_SPOTS.filter((_, i) => !skipSides.includes(Math.floor(i / 2))).map(([x, y, a], i) => (
    <path
      key={i}
      d="M -10 -8 L 10 0 L -10 8 Z"
      className={className}
      transform={`translate(${x} ${y}) rotate(${a + (cw ? 0 : 180)})`}
    />
  ))
}

const Q = {
  current: 'W którą stronę płynie prąd elektryczny (kierunek umowny)?',
  electrons: 'W którą stronę poruszają się elektrony w przewodach?',
  which: 'Co pokazują strzałki na schemacie?',
}

/** Rysunek obwodu: bateria, żarówka i wyłącznik na bokach prostokąta; po odpowiedzi – animacja. */
function CircuitView({ task, answer }) {
  const side = (i) => SIDES[i]
  const b = side(task.batterySide)
  return (
    <svg viewBox="0 0 400 280" className="drawing mx-auto max-w-115">
      <CutWires
        id="direction-wires"
        holes={[
          [b.c[0] - 30, b.c[1] - 30, 60, 60],
          [side(task.bulbSide).c[0] - 16, side(task.bulbSide).c[1] - 16, 32, 32],
          [side(task.switchSide).c[0] - 22, side(task.switchSide).c[1] - 22, 44, 44],
        ]}
      >
        <rect x="60" y="40" width="280" height="200" className="wire" fill="none" />
        {task.kind === 'which' && !answer && (
          <Arrows cw={task.shownCW} className="arrow-neutral" skipSides={[task.batterySide]} />
        )}
      </CutWires>
      <g className="el">
        <rect x={b.c[0] - 30} y={b.c[1] - 30} width="60" height="60" className="el-bg" />
        <Symbol type="cell" x={b.c[0] - 40} y={b.c[1] - 20} rotate={b.rot + (task.flip ? 180 : 0)} />
      </g>
      <g className="el">
        <rect x={side(task.bulbSide).c[0] - 16} y={side(task.bulbSide).c[1] - 16} width="32" height="32" className="el-bg" />
        <Symbol type="bulb" x={side(task.bulbSide).c[0] - 40} y={side(task.bulbSide).c[1] - 20} rotate={side(task.bulbSide).rot} />
      </g>
      <g className="el">
        <rect x={side(task.switchSide).c[0] - 22} y={side(task.switchSide).c[1] - 22} width="44" height="44" className="el-bg" />
        <Symbol type="switchClosed" x={side(task.switchSide).c[0] - 40} y={side(task.switchSide).c[1] - 20} rotate={side(task.switchSide).rot} />
      </g>
      {answer && (
        <Flow
          currentCW={task.currentCW}
          elements={[
            [...b.c, 14],
            [...side(task.bulbSide).c, 20],
          ]}
        />
      )}
    </svg>
  )
}

/** Pokaz do części „zasada”: ten sam obwód, bateria do odwracania, prąd i elektrony w ruchu. */
function DirectionDemo() {
  const [flip, setFlip] = useState(false)
  const task = { batterySide: 3, bulbSide: 0, switchSide: 1, flip, currentCW: flip, kind: 'current' }
  return (
    <Panel title="Zobacz, jak to płynie">
      <CircuitView task={task} answer="pokaz" />
      <FlowLegend />
      <p className="text-sm">
        Bateria jest po lewej, jej „+” jest teraz {flip ? 'u góry' : 'na dole'}. Prąd wypływa z „+”, więc płynie{' '}
        <b className="text-current-flow">{dirWord(task.currentCW)}</b>. Elektrony płyną odwrotnie –{' '}
        <b className="text-electron">{dirWord(!task.currentCW)}</b>.
      </p>
      <Button className="w-fit" onClick={() => setFlip((x) => !x)}>
        <RefreshCw data-icon="inline-start" />
        Odwróć baterię
      </Button>
    </Panel>
  )
}

export default function DirectionGame({ record, sub = 'zasada' }) {
  const [task, setTask] = useState(newTask)
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const electronsCW = !task.currentCW
  const correct =
    task.kind === 'current'
      ? task.currentCW ? 'cw' : 'ccw'
      : task.kind === 'electrons'
        ? electronsCW ? 'cw' : 'ccw'
        : task.shownCW === task.currentCW ? 'current' : 'electrons'

  const choose = (a) => {
    if (answer) return
    const ok = a === correct
    setAnswer(a)
    setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
    record('kierunki', ok)
  }

  const next = () => {
    setTask(newTask())
    setAnswer(null)
  }

  return (
    <Section>

      {sub === 'zasada' && (
        <>
          <Panel contentClassName="gap-2">
            <p className="text-current-flow">
              <b>Kierunek prądu (umowny)</b>: w obwodzie zewnętrznym od bieguna <b>dodatniego (+)</b> do{' '}
              <b>ujemnego (−)</b>.
            </p>
            <p className="text-electron">
              <b>Elektrony</b> mają ładunek ujemny, więc poruszają się odwrotnie: od <b>„−”</b> do <b>„+”</b>.
            </p>
            <p className="text-sm text-muted-foreground">
              Pamiętaj: na symbolu ogniwa dłuższa, cienka kreska to „+”, krótsza i gruba to „−”.
            </p>
          </Panel>
          <DirectionDemo />
        </>
      )}
      {sub === 'cwiczenie' && (
        <Panel title={Q[task.kind]} score={<Score ok={score.ok} all={score.all} />}>
          <CircuitView task={task} answer={answer} />
          {answer && <FlowLegend />}

          <Answers cols="two">
            {task.kind === 'which' ? (
              <>
                <AnswerBtn id="current" {...{ answer, correct, choose }}>Kierunek prądu</AnswerBtn>
                <AnswerBtn id="electrons" {...{ answer, correct, choose }}>Ruch elektronów</AnswerBtn>
              </>
            ) : (
              <>
                <AnswerBtn id="cw" {...{ answer, correct, choose }}>
                  <RotateCw className="size-6 shrink-0 text-sec" /> zgodnie z ruchem wskazówek zegara
                </AnswerBtn>
                <AnswerBtn id="ccw" {...{ answer, correct, choose }}>
                  <RotateCcw className="size-6 shrink-0 text-sec" /> przeciwnie do ruchu wskazówek zegara
                </AnswerBtn>
              </>
            )}
          </Answers>

          {answer && (
            <Feedback tone={answer === correct ? 'ok' : 'bad'}>
              <div>
                <Verdict ok={answer === correct}>{answer === correct ? 'Dobrze!' : 'Niestety nie.'}</Verdict>{' '}
                {task.kind === 'which'
                  ? `Strzałki wychodzą z bieguna ${task.shownCW === task.currentCW ? '„+”' : '„−”'}, więc pokazują ${
                      correct === 'current' ? 'kierunek prądu' : 'ruch elektronów'
                    }.`
                  : task.kind === 'current'
                    ? 'Prąd wypływa z bieguna dodatniego (dłuższa kreska) i wraca do ujemnego.'
                    : 'Elektrony wypływają z bieguna ujemnego (krótsza, gruba kreska) i płyną do dodatniego.'}
              </div>
              <ul className="flex list-disc flex-col gap-1 pl-5">
                <li className="text-current-flow">
                  <b>Prąd</b> płynie od bieguna „+” (dłuższa, cienka kreska) przez żarówkę i wyłącznik do bieguna „−” –
                  tutaj {dirWord(task.currentCW)}. To kierunek <b>umowny</b>, ustalony, zanim odkryto elektrony.
                </li>
                <li className="text-electron">
                  <b>Elektrony</b> mają ładunek ujemny, więc odpycha je „−” i przyciąga „+”: płyną od bieguna „−” (krótsza,
                  gruba kreska) do „+” – tutaj {dirWord(electronsCW)}, czyli odwrotnie niż prąd.
                </li>
              </ul>
              <Button onClick={next}>
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
