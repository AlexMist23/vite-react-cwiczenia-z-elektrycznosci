import { useState } from 'react'
import { ArrowRight, Dumbbell, Lightbulb, RotateCcw, Smile } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Answers, Chip, Feedback, GradeResult, Lead, Panel, Question, Section, Verdict } from '@/components/app/kit.jsx'
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
    label: 'Łatwa',
    icon: Smile,
    desc: 'Po 3 odpowiedzi do wyboru. W każdym pytaniu możesz zajrzeć do wskazówki, a po złej odpowiedzi masz drugą szansę. Pełny punkt za odpowiedź bez pomocy, pół punktu – ze wskazówką albo za drugim razem.',
  },
  hard: {
    label: 'Trudna',
    icon: Dumbbell,
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
      <Section>
        <Lead>
          Pytania z całego działu: elektryzowanie, obwody, kierunek prądu, ośrodki, skutki, wzory, jednostki i rachunki.
          Na końcu dostaniesz wynik i ocenę.
        </Lead>
        <Panel title="Wybierz wersję">
          <ToggleGroup
            type="single"
            variant="outline"
            value={level}
            onValueChange={(v) => v && setLevel(v)}
            aria-label="Wersja sprawdzianu"
          >
            {Object.entries(LEVELS).map(([k, l]) => (
              <ToggleGroupItem key={k} value={k} className="px-4">
                <l.icon data-icon="inline-start" />
                {l.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="max-w-2xl text-sm text-muted-foreground">{LEVELS[level].desc}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="lg" onClick={() => start(10)}>Krótki (10 pytań)</Button>
            <Button size="lg" variant="outline" onClick={() => start(20)}>Długi (20 pytań)</Button>
          </div>
        </Panel>
      </Section>
    )
  }

  if (i >= qs.length) {
    const ok = points.reduce((a, b) => a + b, 0)
    const pct = Math.round((ok / qs.length) * 100)
    const g = gradeFor(pct)
    return (
      <Section>
        <Panel title="Wynik">
          <GradeResult grade={g} pct={pct}>
            {fmtPts(ok)} pkt z {qs.length} – ocena <b>{g.name}</b> ({easy ? 'wersja łatwa' : 'wersja trudna'})
          </GradeResult>
        </Panel>
        {points.some((pt) => pt < 1) && (
          <Panel title="Do powtórki">
            <ol className="grid list-decimal gap-3 pl-5">
              {qs.map((q, k) =>
                points[k] === 1 ? null : (
                  <li key={k}>
                    <div className="font-medium">{q.q}</div>
                    {answers[k] === q.right ? (
                      <div className="text-sm text-muted-foreground">Dobrze, ale z pomocą (½ pkt).</div>
                    ) : (
                      <div className="text-destructive">Twoja odpowiedź: {answers[k]}</div>
                    )}
                    <div className="text-success">Poprawna: {q.right}</div>
                    {q.why && <div className="text-sm text-muted-foreground">{q.why}</div>}
                  </li>
                ),
              )}
            </ol>
          </Panel>
        )}
        <Button size="lg" className="w-fit" onClick={() => setQs(null)}>
          <RotateCcw data-icon="inline-start" />
          Spróbuj jeszcze raz
        </Button>
      </Section>
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
    <Section>
      <Panel
        title={`Sprawdzian ${easy ? '(wersja łatwa)' : '(wersja trudna)'}`}
        score={<Badge variant="secondary">{q.topic}</Badge>}
      >
        <div className="flex items-center gap-3">
          <Progress value={(i / qs.length) * 100} className="h-2" />
          <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
            Pytanie {i + 1} / {qs.length}
          </span>
        </div>
        <Question>{q.q}</Question>
        {easy &&
          !answer &&
          (hint ? (
            <Feedback tone="info">{q.hint}</Feedback>
          ) : (
            <Chip className="w-fit" onClick={() => setHint(true)}>
              <Lightbulb />
              Pokaż wskazówkę (za dobrą odpowiedź dostaniesz wtedy ½ pkt)
            </Chip>
          ))}
        <Answers>
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
        </Answers>
        {wrongFirst && !answer && (
          <Feedback tone="bad">
            Nie tym razem – spróbuj jeszcze raz.{!hint && ' Możesz też zajrzeć do wskazówki.'}
          </Feedback>
        )}
        {answer && (
          <Feedback tone={answer === q.right ? 'ok' : 'bad'}>
            <div>
              <Verdict ok={answer === q.right}>
                {answer === q.right ? (points[i] === 1 ? 'Dobrze!' : 'Dobrze (½ pkt).') : 'Źle.'}
              </Verdict>{' '}
              {q.why}
            </div>
            <Button onClick={nextQ}>
              {i + 1 < qs.length ? 'Dalej' : 'Zobacz wynik'}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Feedback>
        )}
      </Panel>
    </Section>
  )
}
