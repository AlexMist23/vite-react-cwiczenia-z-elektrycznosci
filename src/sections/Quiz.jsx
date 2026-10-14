import { useState } from 'react'
import AnswerBtn from '../components/AnswerBtn.jsx'
import { QUIZ } from '../data/quiz.js'
import { HINTS } from '../data/quizHints.js'
import { gradeFor, shuffle } from '../lib/physics.js'

// wersja łatwa: 3 odpowiedzi zamiast 4, wskazówka i druga szansa
function build(n, easy) {
  return shuffle(QUIZ)
    .slice(0, n)
    .map((x) => ({
      ...x,
      options: shuffle(easy ? [x.a[0], ...shuffle(x.a.slice(1)).slice(0, 2)] : x.a),
      right: x.a[0],
      hint: HINTS[x.q],
    }))
}

const LEVELS = {
  easy: {
    label: '🙂 Łatwa',
    desc: 'Po 3 odpowiedzi do wyboru. W każdym pytaniu możesz zajrzeć do wskazówki, a po złej odpowiedzi masz drugą szansę. Pełny punkt za odpowiedź bez pomocy, pół punktu – ze wskazówką albo za drugim razem.',
  },
  hard: {
    label: '💪 Trudna',
    desc: 'Po 4 odpowiedzi, bez wskazówek, jedna próba – jak na prawdziwym sprawdzianie.',
  },
}

const fmtPts = (x) => String(x).replace('.', ',')

export default function Quiz({ record }) {
  const [level, setLevel] = useState('easy')
  const [qs, setQs] = useState(null)
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState([]) // ostateczna odpowiedź na każde pytanie
  const [points, setPoints] = useState([]) // 1, ½ albo 0 za każde pytanie
  const [hint, setHint] = useState(false) // czy w tym pytaniu odsłonięto wskazówkę
  const [wrongFirst, setWrongFirst] = useState(null) // pierwsza zła odpowiedź (wersja łatwa)
  const easy = level === 'easy'

  const start = (n) => {
    setQs(build(n, easy))
    setI(0)
    setAnswers([])
    setPoints([])
    setHint(false)
    setWrongFirst(null)
  }

  if (!qs) {
    return (
      <div className="section">
        <h2>Sprawdzian – quiz końcowy</h2>
        <p className="lead">
          Pytania z całego działu: elektryzowanie, obwody, kierunek prądu, ośrodki, skutki, wzory, jednostki i rachunki.
          Na końcu dostaniesz wynik i ocenę.
        </p>
        <div className="card">
          <h3>Wybierz wersję</h3>
          <div className="seg">
            {Object.entries(LEVELS).map(([k, l]) => (
              <button key={k} className={level === k ? 'active' : ''} onClick={() => setLevel(k)}>
                {l.label}
              </button>
            ))}
          </div>
          <p className="small level-desc">{LEVELS[level].desc}</p>
          <div className="btn-row">
            <button className="btn primary" onClick={() => start(10)}>Krótki (10 pytań)</button>
            <button className="btn primary" onClick={() => start(20)}>Długi (20 pytań)</button>
          </div>
        </div>
      </div>
    )
  }

  if (i >= qs.length) {
    const ok = points.reduce((a, b) => a + b, 0)
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
              {fmtPts(ok)} pkt z {qs.length} – ocena <b>{g.name}</b> ({easy ? 'wersja łatwa' : 'wersja trudna'})
            </div>
          </div>
        </div>
        {points.some((pt) => pt < 1) && (
          <div className="card">
            <h3>Do powtórki</h3>
            <ul className="review">
              {qs.map((q, k) =>
                points[k] === 1 ? null : (
                  <li key={k}>
                    <div>{q.q}</div>
                    {answers[k] === q.right ? (
                      <div className="muted small">Dobrze, ale z pomocą (½ pkt).</div>
                    ) : (
                      <div className="bad-text">Twoja odpowiedź: {answers[k]}</div>
                    )}
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
  const setAt = (setter, v) =>
    setter((a) => {
      const c = [...a]
      c[i] = v
      return c
    })

  const choose = (opt) => {
    if (answer || opt === wrongFirst) return
    const ok = opt === q.right
    // wersja łatwa: po pierwszej złej odpowiedzi jeszcze jedna próba
    if (easy && !ok && !wrongFirst) {
      setWrongFirst(opt)
      return
    }
    setAt(setAnswers, opt)
    setAt(setPoints, ok ? (hint || wrongFirst ? 0.5 : 1) : 0)
    record('quiz', ok && !hint && !wrongFirst)
  }

  const nextQ = () => {
    setI(i + 1)
    setHint(false)
    setWrongFirst(null)
  }

  return (
    <div className="section">
      <h2>Sprawdzian {easy ? '(wersja łatwa)' : '(wersja trudna)'}</h2>
      <div className="progress-bar">
        <div style={{ width: `${(i / qs.length) * 100}%` }} />
      </div>
      <div className="card game-card">
        <div className="score">
          Pytanie {i + 1} / {qs.length} · {q.topic}
        </div>
        <p className="question">{q.q}</p>
        {easy &&
          !answer &&
          (hint ? (
            <div className="feedback info">💡 {q.hint}</div>
          ) : (
            <button className="chip hint-chip" onClick={() => setHint(true)}>
              💡 Pokaż wskazówkę (za dobrą odpowiedź dostaniesz wtedy ½ pkt)
            </button>
          ))}
        <div className="answers one">
          {q.options.map((o) => (
            <AnswerBtn
              key={o}
              id={o}
              answer={answer ?? (o === wrongFirst ? o : null)}
              correct={answer ? q.right : null}
              choose={choose}
            >
              {o}
            </AnswerBtn>
          ))}
        </div>
        {wrongFirst && !answer && (
          <div className="feedback bad">
            Nie tym razem – spróbuj jeszcze raz.{!hint && ' Możesz też zajrzeć do wskazówki.'}
          </div>
        )}
        {answer && (
          <div className={answer === q.right ? 'feedback ok' : 'feedback bad'}>
            {answer === q.right ? (points[i] === 1 ? 'Dobrze! ' : 'Dobrze (½ pkt). ') : 'Źle. '}
            {q.why}
            <button className="btn primary" onClick={nextQ}>
              {i + 1 < qs.length ? 'Dalej →' : 'Zobacz wynik'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
