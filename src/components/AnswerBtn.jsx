export default function AnswerBtn({ id, answer, correct, choose, children }) {
  let cls = 'answer'
  if (answer) {
    if (id === correct) cls += ' right'
    else if (id === answer) cls += ' wrong'
  }
  return (
    <button className={cls} onClick={() => choose(id)} disabled={!!answer}>
      {children}
    </button>
  )
}

