import { useState } from 'react'
import { evaluate, rhs, sameFormula } from '../lib/formulas.js'

/**
 * Układanie wzoru z klocków: litery, „·”, „/” i nawiasy.
 * Wzór jest sprawdzany przez podstawienie liczb, więc np. W / (U · I) i W / U / I są oba dobre.
 * onDone(ok) – wywoływane raz: ok = true, gdy uczeń trafił za pierwszym razem.
 */
export default function FormulaBuilder({ target, vars, formula, onDone }) {
  const [tokens, setTokens] = useState([])
  const [state, setState] = useState(null) // null | 'ok' | 'bad' | 'syntax' | 'shown'
  const [tries, setTries] = useState(0)
  const finished = state === 'ok' || state === 'shown'
  const tiles = vars.filter((v) => v !== target)

  const add = (t) => {
    if (finished) return
    setTokens((s) => [...s, t])
    setState(null)
  }

  const check = () => {
    const nums = Object.fromEntries(tiles.map((v) => [v, 2]))
    if (!Number.isFinite(evaluate(tokens, nums))) {
      setState('syntax')
      return
    }
    const ok = sameFormula(tokens, rhs(formula), tiles)
    setTries((n) => n + 1)
    setState(ok ? 'ok' : 'bad')
    if (ok) onDone?.(tries === 0)
  }

  const reveal = () => {
    setTokens(rhs(formula))
    setState('shown')
    onDone?.(false)
  }

  return (
    <div className="builder">
      <div className={`builder-display ${state === 'ok' ? 'ok' : ''} ${state === 'bad' || state === 'syntax' ? 'bad' : ''}`}>
        <span className="formula-inline">
          <b>{target}</b> = {tokens.length ? tokens.join(' ') : <span className="muted">…</span>}
        </span>
      </div>
      {!finished && (
        <>
          <div className="builder-tiles">
            {tiles.map((v) => (
              <button key={v} className="tile-btn letter" onClick={() => add(v)}>
                {v}
              </button>
            ))}
            {['·', '/', '(', ')'].map((op) => (
              <button key={op} className="tile-btn op" onClick={() => add(op)} aria-label={op === '·' ? 'razy' : op === '/' ? 'dzielone przez' : op}>
                {op}
              </button>
            ))}
            <button className="tile-btn" onClick={() => { setTokens((s) => s.slice(0, -1)); setState(null) }} aria-label="Cofnij">
              ⌫
            </button>
          </div>
          <div className="btn-row">
            <button className="btn primary" onClick={check} disabled={!tokens.length}>
              Sprawdź wzór
            </button>
            <button className="btn" onClick={() => { setTokens([]); setState(null) }}>
              Wyczyść
            </button>
            {tries > 0 && (
              <button className="btn" onClick={reveal}>
                Pokaż wzór
              </button>
            )}
          </div>
        </>
      )}
      {state === 'syntax' && (
        <div className="feedback bad">Ten zapis jest niekompletny – między literami musi stać „·” albo „/”, a nawiasy muszą się zamykać.</div>
      )}
      {state === 'bad' && <div className="feedback bad">To nie jest dobry wzór. Pomyśl o trójkącie: zakryj {target} i zobacz, co zostaje.</div>}
      {state === 'ok' && <div className="feedback ok">Dobrze! {formula}</div>}
      {state === 'shown' && <div className="feedback info">Poprawny wzór: {formula}</div>}
    </div>
  )
}
