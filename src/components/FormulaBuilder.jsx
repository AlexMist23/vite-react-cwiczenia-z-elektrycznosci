import { useState } from 'react'
import { Delete } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Expr, Feedback, TileBtn } from './app/kit.jsx'
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
    <div className="flex flex-col gap-2.5">
      <div
        className={cn(
          'flex min-h-14 items-center rounded-xl border-2 border-dashed bg-secondary px-4 py-2',
          state === 'ok' && 'border-solid border-success bg-success-soft',
          (state === 'bad' || state === 'syntax') && 'border-solid border-destructive bg-destructive-soft',
        )}
      >
        <Expr className="text-2xl italic">
          <b>{target}</b> = {tokens.length ? tokens.join(' ') : <span className="text-muted-foreground">…</span>}
        </Expr>
      </div>
      {!finished && (
        <>
          <div className="flex flex-wrap gap-2">
            {tiles.map((v) => (
              <TileBtn key={v} letter onClick={() => add(v)}>
                {v}
              </TileBtn>
            ))}
            {['·', '/', '(', ')'].map((op) => (
              <TileBtn key={op} className="font-bold" onClick={() => add(op)} aria-label={op === '·' ? 'razy' : op === '/' ? 'dzielone przez' : op}>
                {op}
              </TileBtn>
            ))}
            <TileBtn onClick={() => { setTokens((s) => s.slice(0, -1)); setState(null) }} aria-label="Cofnij">
              <Delete className="size-6" />
            </TileBtn>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={check} disabled={!tokens.length}>
              Sprawdź wzór
            </Button>
            <Button variant="outline" onClick={() => { setTokens([]); setState(null) }}>
              Wyczyść
            </Button>
            {tries > 0 && (
              <Button variant="outline" onClick={reveal}>
                Pokaż wzór
              </Button>
            )}
          </div>
        </>
      )}
      {state === 'syntax' && (
        <Feedback tone="bad">Ten zapis jest niekompletny – między literami musi stać „·” albo „/”, a nawiasy muszą się zamykać.</Feedback>
      )}
      {state === 'bad' && <Feedback tone="bad">To nie jest dobry wzór. Pomyśl o trójkącie: zakryj {target} i zobacz, co zostaje.</Feedback>}
      {state === 'ok' && <Feedback tone="ok">Dobrze! {formula}</Feedback>}
      {state === 'shown' && <Feedback tone="info">Poprawny wzór: {formula}</Feedback>}
    </div>
  )
}

