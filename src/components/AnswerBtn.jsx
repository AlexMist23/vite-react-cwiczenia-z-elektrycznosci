import { Answer } from './app/kit.jsx'

/** Odpowiedź w pytaniu jednokrotnego wyboru: po wyborze pokazuje dobrą i (ewentualnie) błędną. */
export default function AnswerBtn({ id, answer, correct, choose, className, children }) {
  let state
  if (answer) {
    if (id === correct) state = 'right'
    else if (id === answer) state = 'wrong'
  }
  return (
    <Answer state={state} className={className} onClick={() => choose(id)} disabled={!!answer}>
      {children}
    </Answer>
  )
}
