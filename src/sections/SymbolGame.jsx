import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Answers, BookRef, Feedback, Lead, Panel, Question, Score, Section, Verdict } from '@/components/app/kit.jsx'
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

export default function SymbolGame({ record, sub = 'sciaga' }) {
  const [task, setTask] = useState(() => newTask())
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState({ ok: 0, all: 0 })

  const choose = (id) => {
    if (answer) return
    const ok = id === task.type
    setAnswer(id)
    setScore((s) => ({ ok: s.ok + ok, all: s.all + 1 }))
    record('symbole', ok)
  }

  return (
    <Section>
      <BookRef pages="32" topics="Symbole elementów w obwodach elektrycznych" />
      <Lead>Schemat obwodu rysujemy za pomocą umownych symboli. Rozpoznaj je wszystkie!</Lead>

      {sub === 'rozpoznaj' && (
        <Panel
          title={
            task.reverse ? (
              <>
                Który symbol oznacza: <span className="text-sec">{SYMBOLS[task.type].name.toLowerCase()}</span>?
              </>
            ) : (
              'Co oznacza ten symbol?'
            )
          }
          score={<Score ok={score.ok} all={score.all} />}
        >
          {task.reverse ? (
            <Answers cols="four">
              {task.options.map((t) => (
                <AnswerBtn key={t} id={t} answer={answer} correct={task.type} choose={choose} className="justify-center">
                  <SymbolIcon type={t} size={110} />
                </AnswerBtn>
              ))}
            </Answers>
          ) : (
            <>
              <div className="flex justify-center p-2">
                <SymbolIcon type={task.type} size={220} />
              </div>
              <Answers cols="two">
                {task.options.map((t) => (
                  <AnswerBtn key={t} id={t} answer={answer} correct={task.type} choose={choose}>
                    {SYMBOLS[t].name}
                  </AnswerBtn>
                ))}
              </Answers>
            </>
          )}
          {answer && (
            <Feedback tone={answer === task.type ? 'ok' : 'bad'}>
              <div>
                <Verdict ok={answer === task.type}>
                  {answer === task.type ? 'Dobrze!' : `To jest: ${SYMBOLS[task.type].name}.`}
                </Verdict>{' '}
                {SYMBOLS[task.type].hint}
              </div>
              <Button
                onClick={() => {
                  setTask(newTask(task.type))
                  setAnswer(null)
                }}
              >
                Następne
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Feedback>
          )}
        </Panel>
      )}
      {sub === 'sciaga' && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
          {TYPES.map((t) => (
            <Card key={t}>
              <CardContent className="flex flex-col items-center gap-1 text-center">
                <SymbolIcon type={t} size={120} />
                <CardTitle className="font-semibold">{SYMBOLS[t].name}</CardTitle>
                <CardDescription>{SYMBOLS[t].hint}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Section>
  )
}
