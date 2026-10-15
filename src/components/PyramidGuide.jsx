// Piramida wzorów wytłumaczona dokładnie: wielkości i jednostki, wszystkie wzory literami, słowami
// i w jednostkach, a do tego przykład z podstawionymi liczbami.
import { useState } from 'react'
import { Dices } from 'lucide-react'
import { Chip, Expr, Formula, GivenSought, Panel } from './app/kit.jsx'
import Pyramid from './Pyramid.jsx'
import { cn } from '@/lib/utils'
import { NAMES, TRIANGLES, UNIT, WORDS, inUnitNames, inUnits, inWords, letters } from '../lib/formulas.js'
import { SCENARIOS, substitute } from '../lib/scenarios.js'
import { clean, fmt } from '../lib/physics.js'

const f = (x) => fmt(clean(x))
const colon = (formula) => formula.replace(/\//g, ':')
const triangle = (id) => TRIANGLES.find((t) => t.id === id)
// „obliczamy energię / pracę” – pozostałe nazwy w bierniku się nie zmieniają
const ACCUSATIVE = { E: 'energię', W: 'pracę' }
/** „w woltach”, „w sekundach” – nazwa jednostki w miejscowniku liczby mnogiej. */
const inUnit = (l) => (UNIT[l][1] === 'sekunda' ? 'sekundach' : `${UNIT[l][1]}ach`)

/** Zdanie, które mówi, co zostaje po zakryciu litery i co z tym zrobić. */
function coverReason(tri, target) {
  const rest = letters(tri).filter((l) => l !== target)
  if (target === tri.top) {
    return (
      <>
        Zakrywasz <b>{target}</b> na górze. Na dole zostają <b>{rest.join(', ')}</b> – stoją <b>obok siebie</b>, więc je{' '}
        <b>mnożysz</b>.
      </>
    )
  }
  const below = rest.filter((l) => l !== tri.top)
  return (
    <>
      Zakrywasz <b>{target}</b> na dole. Zostaje <b>{tri.top}</b> na górze <b>nad</b> {below.length > 1 ? 'literami' : 'literą'}{' '}
      <b>{below.join(' · ')}</b>, więc <b>dzielisz</b> {tri.top} przez {below.length > 1 ? `iloczyn ${below.join(' · ')}` : below[0]}.
    </>
  )
}

/** Tabela: symbol, wielkość, jednostka (symbol i nazwa). */
function Quantities({ tri }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
        <span>Litera</span>
        <span>Wielkość</span>
        <span>Jednostka</span>
      </div>
      {letters(tri).map((l) => (
        <div key={l} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 border-t px-3 py-2">
          <span className="w-6 font-formula text-xl font-bold italic">{l}</span>
          <span>{NAMES[l][0]}</span>
          <span className="text-right">
            <b className="font-formula text-lg">{UNIT[l][0]}</b> <span className="text-muted-foreground">({UNIT[l][1]})</span>
          </span>
        </div>
      ))}
    </div>
  )
}

/** Jeden wzór na trzy sposoby: literami, słowami i w jednostkach. */
function FormulaRow({ formula, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'grid w-full gap-1 rounded-xl border-2 bg-card px-3.5 py-2.5 text-left transition-colors hover:border-sec/60 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1.2fr)] md:items-center md:gap-4',
        active && 'border-sec bg-sec/8',
      )}
    >
      <Expr className="text-2xl font-bold italic">{colon(formula)}</Expr>
      <span>
        <span className="text-xs text-muted-foreground md:hidden">słowami: </span>
        {inWords(formula)}
      </span>
      <span className="text-sm">
        <span className="text-xs text-muted-foreground md:hidden">jednostki: </span>
        <b className="font-formula text-base">{inUnits(formula)}</b>
        <span className="block text-muted-foreground">{inUnitNames(formula)}</span>
      </span>
    </button>
  )
}

/** Przykład: treść, dane i szukane z jednostkami, wzór słowami → literami → liczbami → wynik, sprawdzenie jednostki. */
function Example({ tri, target }) {
  const [values, setValues] = useState(() => SCENARIOS[tri.id].values())
  const formula = tri.formulas[target]
  const known = letters(tri).filter((l) => l !== target)
  return (
    <Panel
      title={`Przykład: obliczamy ${ACCUSATIVE[target] ?? WORDS[target]} (${target})`}
      score={
        <Chip onClick={() => setValues(SCENARIOS[tri.id].values())} title="Losuj nowe liczby">
          <Dices />
          inne liczby
        </Chip>
      }
      contentClassName="gap-3"
    >
      <p>{SCENARIOS[tri.id].text[target](values)}</p>
      <GivenSought
        given={known.map((l) => (
          <div key={l}>
            <Expr>
              {l} = {f(values[l])} {UNIT[l][0]}
            </Expr>{' '}
            <span className="text-sm text-muted-foreground">
              – {NAMES[l][0]} w {inUnit(l)}
            </span>
          </div>
        ))}
        sought={
          <div>
            <Expr>{target} = ?</Expr>{' '}
            <span className="text-sm text-muted-foreground">
              – {NAMES[target][0]}, wynik w {inUnit(target)} ({UNIT[target][0]})
            </span>
          </div>
        }
      />
      <div className="grid gap-1.5 rounded-lg border px-3.5 py-2.5">
        <Line label="słowami">{inWords(formula)}</Line>
        <Line label="literami">
          <Expr className="text-lg italic">{colon(formula)}</Expr>
        </Line>
        <Line label="podstawiamy">
          <Expr className="text-lg">
            {target} = {substitute(formula, values)}
          </Expr>
        </Line>
        <Line label="wynik">
          <Expr className="text-lg font-bold text-sec">
            {target} = {f(values[target])} {UNIT[target][0]}
          </Expr>
        </Line>
      </div>
      <p className="text-sm">
        <b>Sprawdzenie jednostki:</b> <Expr>{inUnits(formula).split('=')[1].trim()}</Expr> ={' '}
        <Expr>{UNIT[target][0]}</Expr> ({inUnitNames(formula).split('=')[1].trim()} = {UNIT[target][1]}) – zgadza się z
        tym, czego szukamy.
      </p>
    </Panel>
  )
}

function Line({ label, children }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase">{label}</span>
      <span>{children}</span>
    </div>
  )
}

/** Cała strona o jednej piramidzie. */
export default function PyramidGuide({ id }) {
  const tri = triangle(id)
  const [target, setTarget] = useState(tri.top)
  return (
    <>
      <Panel title={`Piramida: ${tri.title.toLowerCase()}`} contentClassName="gap-4">
        <div className="grid items-center gap-5 md:grid-cols-[220px_1fr]">
          <div className="mx-auto w-full max-w-55">
            <Pyramid
              cells={letters(tri).map((l) => ({ label: l, cls: l === target ? 'covered' : '' }))}
              onCell={(i) => setTarget(letters(tri)[i])}
            />
            <p className="mt-1 text-center text-xs text-muted-foreground">Kliknij literę, żeby ją zakryć</p>
          </div>
          <div className="flex flex-col gap-3">
            <Formula big>{colon(tri.formulas[target])}</Formula>
            <p>{coverReason(tri, target)}</p>
            <p className="text-sm text-muted-foreground">
              Słowami: <b className="text-foreground">{inWords(tri.formulas[target])}</b>
            </p>
          </div>
        </div>
        <Quantities tri={tri} />
      </Panel>

      <Panel title="Wszystkie wzory z tej piramidy" contentClassName="gap-2">
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1.2fr)] gap-4 px-4 text-xs font-semibold text-muted-foreground uppercase md:grid">
          <span>Literami</span>
          <span>Słowami</span>
          <span>Jednostki</span>
        </div>
        {letters(tri).map((l) => (
          <FormulaRow key={l} formula={tri.formulas[l]} active={l === target} onClick={() => setTarget(l)} />
        ))}
        <p className="text-sm text-muted-foreground">Kliknij wzór, żeby zobaczyć przykład z liczbami.</p>
      </Panel>

      <Example key={`${tri.id}-${target}`} tri={tri} target={target} />
    </>
  )
}

/** Zwarta karta ze wszystkimi wzorami ze wszystkich piramid – do ściągi i powtórki. */
export function FormulaSheet() {
  return (
    <div className="grid gap-4">
      {TRIANGLES.map((tri) => (
        <div key={tri.id} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-20 shrink-0 [&_.tri-cell]:cursor-default">
              <Pyramid cells={letters(tri).map((l) => ({ label: l }))} />
            </div>
            <div>
              <b>{tri.title}</b>
              <ul className="text-sm text-muted-foreground">
                {letters(tri).map((l) => (
                  <li key={l}>
                    <b className="font-formula text-foreground italic">{l}</b> – {NAMES[l][0]}{' '}
                    <span className="whitespace-nowrap">
                      [{UNIT[l][0]} – {UNIT[l][1]}]
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid gap-1.5">
            {letters(tri).map((l) => {
              const fm = tri.formulas[l]
              return (
                <div
                  key={l}
                  className="grid gap-x-4 gap-y-0.5 rounded-lg bg-secondary px-3 py-1.5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,1fr)] sm:items-center"
                >
                  <Expr className="text-lg font-bold italic">{colon(fm)}</Expr>
                  <span className="text-sm">{inWords(fm)}</span>
                  <span className="text-sm">
                    <b className="font-formula">{inUnits(fm)}</b>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
