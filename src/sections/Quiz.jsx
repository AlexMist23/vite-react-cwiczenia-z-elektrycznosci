import { useState } from 'react'
import AnswerBtn from '../components/AnswerBtn.jsx'
import { QUIZ } from '../data/quiz.js'
import { gradeFor, shuffle } from '../lib/physics.js'

function build(n) {
  return shuffle(QUIZ)
    .slice(0, n)
    .map((x) => ({ ...x, options: shuffle(x.a), right: x.a[0] }))
}

const GRADES = [
  ['celujący', 6, '100% – 95%'],
  ['bardzo dobry', 5, '94% – 85%'],
  ['dobry', 4, '84% – 70%'],
  ['dostateczny', 3, '69% – 50%'],
  ['dopuszczający', 2, '49% – 30%'],
  ['niedostateczny', 1, '29% – 0%'],
]

export default function Quiz({ record }) {
  const [qs, setQs] = useState(null)
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState([])

  const start = (n) => {
    setQs(build(n))
    setI(0)
    setAnswers([])
  }

  if (!qs) {
    return (
      <div className="section">
        <h2>Sprawdzian – quiz końcowy</h2>
        <p className="lead">
          Pytania z całego działu: elektryzowanie, obwody, kierunek prądu, ośrodki, skutki, wzory, jednostki i rachunki.
          Na końcu dostaniesz ocenę według progów procentowych z lekcji.
        </p>
        <div className="card">
          <table className="grades">
            <tbody>
              {GRADES.map(([n, g, r]) => (
                <tr key={g}>
                  <td>{n}</td>
                  <td><b>{g}</b></td>
                  <td>{r}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="btn-row">
            <button className="btn primary" onClick={() => start(10)}>Krótki (10 pytań)</button>
            <button className="btn primary" onClick={() => start(20)}>Długi (20 pytań)</button>
          </div>
        </div>
      </div>
    )
  }

  if (i >= qs.length) {
    const ok = answers.filter((a, k) => a === qs[k].right).length
    const pct = Math.round((ok / qs.length) * 100)
    const g = gradeFor(pct)
    return (
      <div className="section">
        <h2>Wynik</h2>
        <div className="card result">
          <div className={`grade-badge g${g.grade}`}>{g.grade}</div>
          <div>
            <div className="result-pct">{pct}%</div>
            <div>
              {ok} z {qs.length} poprawnych – ocena <b>{g.name}</b>
            </div>
          </div>
        </div>
        {ok < qs.length && (
          <div className="card">
            <h3>Do powtórki</h3>
            <ul className="review">
              {qs.map((q, k) =>
                answers[k] === q.right ? null : (
                  <li key={k}>
                    <div>{q.q}</div>
                    <div className="bad-text">Twoja odpowiedź: {answers[k]}</div>
                    <div className="ok-text">Poprawna: {q.right}</div>
                    {q.why && <div className="muted small">{q.why}</div>}
                  </li>
                ),
              )}
            </ul>
          </div>
        )}
        <button className="btn primary" onClick={() => setQs(null)}>
          Spróbuj jeszcze raz
        </button>
      </div>
    )
  }

  const q = qs[i]
  const answer = answers[i]
  const choose = (opt) => {
    if (answer) return
    setAnswers((a) => {
      const c = [...a]
      c[i] = opt
      return c
    })
    record('quiz', opt === q.right)
  }

  return (
    <div className="section">
      <h2>Sprawdzian</h2>
      <div className="progress-bar">
        <div style={{ width: `${(i / qs.length) * 100}%` }} />
      </div>
      <div className="card game-card">
        <div className="score">
          Pytanie {i + 1} / {qs.length} · {q.topic}
        </div>
        <p className="question">{q.q}</p>
        <div className="answers one">
          {q.options.map((o) => (
            <AnswerBtn key={o} id={o} answer={answer} correct={q.right} choose={choose}>
              {o}
            </AnswerBtn>
          ))}
        </div>
        {answer && (
          <div className={answer === q.right ? 'feedback ok' : 'feedback bad'}>
            {answer === q.right ? 'Dobrze! ' : 'Źle. '}
            {q.why}
            <button className="btn primary" onClick={() => setI(i + 1)}>
              {i + 1 < qs.length ? 'Dalej →' : 'Zobacz wynik'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
