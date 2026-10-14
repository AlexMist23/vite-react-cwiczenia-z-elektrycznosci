import { useState } from 'react'
import { Symbol } from '../components/Symbols.jsx'
import { pick, rand } from '../lib/physics.js'
import AnswerBtn from '../components/AnswerBtn.jsx'
import BookRef from '../components/BookRef.jsx'

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

export default function DirectionGame({ record }) {
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

  const side = (i) => SIDES[i]
  const b = side(task.batterySide)

  return (
    <div className="section">
      <h2>Kierunek prądu i ruch elektronów</h2>
      <BookRef pages="31–32" topics="Kierunek przepływu prądu a kierunek ruchu elektronów" />
      <div className="rule-box">
        <div className="c-current">
          <b>Kierunek prądu (umowny)</b>: w obwodzie zewnętrznym od bieguna <b>dodatniego (+)</b> do{' '}
          <b>ujemnego (−)</b>.
        </div>
        <div className="c-electron">
          <b>Elektrony</b> mają ładunek ujemny, więc poruszają się odwrotnie: od <b>„−”</b> do{' '}
          <b>„+”</b>.
        </div>
        <div className="muted small">
          Pamiętaj: na symbolu ogniwa dłuższa, cienka kreska to „+”, krótsza i gruba to „−”.
        </div>
      </div>

      <div className="card game-card">
        <div className="score">
          Wynik: <b>{score.ok}</b> / {score.all}
        </div>
        <p className="question">{Q[task.kind]}</p>

        <svg viewBox="0 0 400 280" className="circuit small-circuit">
          <rect x="60" y="40" width="280" height="200" className="wire" fill="none" />
          {task.kind === 'which' && (
            <Arrows cw={task.shownCW} className="arrow-neutral" skipSides={[task.batterySide]} />
          )}
          {answer && task.kind !== 'which' && (
            <Arrows
              cw={task.kind === 'current' ? task.currentCW : electronsCW}
              className={task.kind === 'current' ? 'arrow-current' : 'arrow-electron'}
              skipSides={[task.batterySide]}
            />
          )}
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
        </svg>

        <div className="answers two">
          {task.kind === 'which' ? (
            <>
              <AnswerBtn id="current" {...{ answer, correct, choose }}>Kierunek prądu</AnswerBtn>
              <AnswerBtn id="electrons" {...{ answer, correct, choose }}>Ruch elektronów</AnswerBtn>
            </>
          ) : (
            <>
              <AnswerBtn id="cw" {...{ answer, correct, choose }}>
                <span className="big-icon">↻</span> zgodnie z ruchem wskazówek zegara
              </AnswerBtn>
              <AnswerBtn id="ccw" {...{ answer, correct, choose }}>
                <span className="big-icon">↺</span> przeciwnie do ruchu wskazówek zegara
              </AnswerBtn>
            </>
          )}
        </div>

        {answer && (
          <div className={answer === correct ? 'feedback ok' : 'feedback bad'}>
            {answer === correct ? 'Dobrze! ' : 'Niestety nie. '}
            {task.kind === 'which'
              ? `Strzałki wychodzą z bieguna ${task.shownCW === task.currentCW ? '„+”' : '„−”'}, więc pokazują ${
                  correct === 'current' ? 'kierunek prądu' : 'ruch elektronów'
                }.`
              : task.kind === 'current'
                ? 'Prąd wypływa z bieguna dodatniego (dłuższa kreska) i wraca do ujemnego.'
                : 'Elektrony wypływają z bieguna ujemnego (krótsza, gruba kreska) i płyną do dodatniego.'}
            <button className="btn primary" onClick={next}>
              Następne →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
