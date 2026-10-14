import { useState } from 'react'
import { SYMBOLS, SymbolIcon } from '../components/Symbols.jsx'
import AnswerBtn from '../components/AnswerBtn.jsx'
import { pick, shuffle } from '../lib/physics.js'

const TYPES = Object.keys(SYMBOLS)

function newTask(prev) {
  let type
  do type = pick(TYPES)
  while (type === prev)
  const options = shuffle([type, ...shuffle(TYPES.filter((t) => t !== type)).slice(0, 3)])
  return { type, options, reverse: Math.random() < 0.4 }
}

export default function SymbolGame({ record }) {
  const [task, setTask] = useState(() => newTask())
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState({ ok: 0, all: 0 })
  const [showAll, setShowAll] = useState(false)

  const choose = (id) => {
    if (answer) return
    const ok = id === task.type
    setAnswer(id)
    setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
    record('symbole', ok)
  }

  return (
    <div className="section">
      <h2>Symbole elementów obwodu</h2>
      <p className="lead">
        Schemat obwodu rysujemy za pomocą umownych symboli. Rozpoznaj je wszystkie!
      </p>

      <div className="card game-card">
        <div className="score">
          Wynik: <b>{score.ok}</b> / {score.all}
        </div>
        {task.reverse ? (
          <>
            <p className="question">
              Który symbol oznacza: <b>{SYMBOLS[task.type].name.toLowerCase()}</b>?
            </p>
            <div className="answers four">
              {task.options.map((t) => (
                <AnswerBtn key={t} id={t} answer={answer} correct={task.type} choose={choose}>
                  <SymbolIcon type={t} size={110} />
                </AnswerBtn>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="question">Co oznacza ten symbol?</p>
            <div className="symbol-big">
              <SymbolIcon type={task.type} size={220} />
            </div>
            <div className="answers two">
              {task.options.map((t) => (
                <AnswerBtn key={t} id={t} answer={answer} correct={task.type} choose={choose}>
                  {SYMBOLS[t].name}
                </AnswerBtn>
              ))}
            </div>
          </>
        )}
        {answer && (
          <div className={answer === task.type ? 'feedback ok' : 'feedback bad'}>
            {answer === task.type ? 'Dobrze! ' : `To jest: ${SYMBOLS[task.type].name}. `}
            {SYMBOLS[task.type].hint}
            <button
              className="btn primary"
              onClick={() => {
                setTask(newTask(task.type))
                setAnswer(null)
              }}
            >
              Następne →
            </button>
          </div>
        )}
      </div>

      <button className="btn" onClick={() => setShowAll((s) => !s)}>
        {showAll ? 'Ukryj ściągę symboli' : 'Pokaż ściągę symboli'}
      </button>
      {showAll && (
        <div className="symbol-grid">
          {TYPES.map((t) => (
            <div key={t} className="card symbol-tile">
              <SymbolIcon type={t} size={120} />
              <b>{SYMBOLS[t].name}</b>
              <small>{SYMBOLS[t].hint}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
