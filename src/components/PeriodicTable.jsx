import { useEffect, useState } from 'react'
import { Ban, Lightbulb, Waves, Zap } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// kolory rodzajów pierwiastków (jak w szkolnym układzie okresowym)
const TONE = {
  m: 'bg-orange-100 text-orange-900',
  s: 'bg-green-100 text-green-900',
  n: 'bg-indigo-100 text-indigo-900',
  x: 'bg-orange-100 text-orange-900',
}

// Uproszczony układ okresowy: [symbol, nazwa, okres, grupa, rodzaj]
// rodzaj: m – metal, s – półmetal, n – niemetal, x – rodzina (lantanowce, aktynowce)
const ELEMENTS = [
  ['H', 'wodór', 1, 1, 'n'], ['He', 'hel', 1, 18, 'n'],
  ['Li', 'lit', 2, 1, 'm'], ['Be', 'beryl', 2, 2, 'm'], ['B', 'bor', 2, 13, 's'], ['C', 'węgiel', 2, 14, 'n'],
  ['N', 'azot', 2, 15, 'n'], ['O', 'tlen', 2, 16, 'n'], ['F', 'fluor', 2, 17, 'n'], ['Ne', 'neon', 2, 18, 'n'],
  ['Na', 'sód', 3, 1, 'm'], ['Mg', 'magnez', 3, 2, 'm'], ['Al', 'glin (aluminium)', 3, 13, 'm'], ['Si', 'krzem', 3, 14, 's'],
  ['P', 'fosfor', 3, 15, 'n'], ['S', 'siarka', 3, 16, 'n'], ['Cl', 'chlor', 3, 17, 'n'], ['Ar', 'argon', 3, 18, 'n'],
  ['K', 'potas', 4, 1, 'm'], ['Ca', 'wapń', 4, 2, 'm'], ['Sc', 'skand', 4, 3, 'm'], ['Ti', 'tytan', 4, 4, 'm'],
  ['V', 'wanad', 4, 5, 'm'], ['Cr', 'chrom', 4, 6, 'm'], ['Mn', 'mangan', 4, 7, 'm'], ['Fe', 'żelazo', 4, 8, 'm'],
  ['Co', 'kobalt', 4, 9, 'm'], ['Ni', 'nikiel', 4, 10, 'm'], ['Cu', 'miedź', 4, 11, 'm'], ['Zn', 'cynk', 4, 12, 'm'],
  ['Ga', 'gal', 4, 13, 'm'], ['Ge', 'german', 4, 14, 's'], ['As', 'arsen', 4, 15, 's'], ['Se', 'selen', 4, 16, 'n'],
  ['Br', 'brom', 4, 17, 'n'], ['Kr', 'krypton', 4, 18, 'n'],
  ['Rb', 'rubid', 5, 1, 'm'], ['Sr', 'stront', 5, 2, 'm'], ['Y', 'itr', 5, 3, 'm'], ['Zr', 'cyrkon', 5, 4, 'm'],
  ['Nb', 'niob', 5, 5, 'm'], ['Mo', 'molibden', 5, 6, 'm'], ['Tc', 'technet', 5, 7, 'm'], ['Ru', 'ruten', 5, 8, 'm'],
  ['Rh', 'rod', 5, 9, 'm'], ['Pd', 'pallad', 5, 10, 'm'], ['Ag', 'srebro', 5, 11, 'm'], ['Cd', 'kadm', 5, 12, 'm'],
  ['In', 'ind', 5, 13, 'm'], ['Sn', 'cyna', 5, 14, 'm'], ['Sb', 'antymon', 5, 15, 's'], ['Te', 'tellur', 5, 16, 's'],
  ['I', 'jod', 5, 17, 'n'], ['Xe', 'ksenon', 5, 18, 'n'],
  ['Cs', 'cez', 6, 1, 'm'], ['Ba', 'bar', 6, 2, 'm'], ['La–Lu', 'lantanowce', 6, 3, 'x'], ['Hf', 'hafn', 6, 4, 'm'],
  ['Ta', 'tantal', 6, 5, 'm'], ['W', 'wolfram', 6, 6, 'm'], ['Re', 'ren', 6, 7, 'm'], ['Os', 'osm', 6, 8, 'm'],
  ['Ir', 'iryd', 6, 9, 'm'], ['Pt', 'platyna', 6, 10, 'm'], ['Au', 'złoto', 6, 11, 'm'], ['Hg', 'rtęć', 6, 12, 'm'],
  ['Tl', 'tal', 6, 13, 'm'], ['Pb', 'ołów', 6, 14, 'm'], ['Bi', 'bizmut', 6, 15, 'm'], ['Po', 'polon', 6, 16, 'm'],
  ['At', 'astat', 6, 17, 's'], ['Rn', 'radon', 6, 18, 'n'],
  ['Fr', 'frans', 7, 1, 'm'], ['Ra', 'rad', 7, 2, 'm'], ['Ac–Lr', 'aktynowce', 7, 3, 'x'],
]

const KINDS = {
  m: {
    one: 'metal',
    label: 'metale',
    verdict: 'przewodnik', icon: Zap,
    why: 'Atom metalu ma na zewnętrznej powłoce mało elektronów (zwykle 1–3) i jądro trzyma je słabo. W kawałku metalu te elektrony odrywają się od atomów i tworzą „chmurę” elektronów swobodnych, które mogą płynąć – dlatego metale przewodzą prąd.',
  },
  s: {
    one: 'półmetal',
    label: 'półmetale',
    verdict: 'półprzewodnik', icon: Waves,
    why: 'Półmetale leżą na granicy metali i niemetali. Elektronów swobodnych mają bardzo mało, więc przewodzą słabo – większość z nich (bor, krzem, german, tellur) to półprzewodniki. Przewodzą lepiej, gdy się je podgrzeje albo doda do nich odrobinę innego pierwiastka (domieszka). Dzięki temu można sterować przepływem prądu – z krzemu robi się procesory, diody i ogniwa słoneczne.',
  },
  n: {
    one: 'niemetal',
    label: 'niemetale',
    verdict: 'izolator', icon: Ban,
    why: 'Atom niemetalu ma zewnętrzną powłokę prawie pełną i mocno trzyma swoje elektrony. Nie ma elektronów swobodnych, więc niemetale (np. siarka, fosfor, tlen, azot) nie przewodzą prądu – są izolatorami.',
  },
  x: {
    one: 'metale',
    label: 'metale',
    verdict: 'przewodnik', icon: Zap,
    why: 'To cała rodzina pierwiastków (w pełnym układzie okresowym zapisana osobno pod tabelą). Wszystkie są metalami, więc przewodzą prąd.',
  },
}

// ciekawostki o wybranych pierwiastkach
const FACTS = {
  Se: 'Wyjątek wśród niemetali: selen jest półprzewodnikiem – dawniej robiono z niego fotokomórki, bo przewodzi lepiej, gdy pada na niego światło.',
  As: 'Arsen zaliczamy do półmetali, ale przewodzi prawie jak metal. Za to w związku z galem (GaAs) tworzy półprzewodnik używany w diodach LED.',
  Sb: 'Antymon to półmetal, który przewodzi prawie jak metal – nie każdy półmetal jest dobrym półprzewodnikiem.',
  C: 'Wyjątek! Węgiel to niemetal, ale jego odmiana – grafit (rysik ołówka) – ma elektrony swobodne i przewodzi prąd. Inna odmiana węgla, diament, jest izolatorem.',
  Si: 'Najważniejszy półprzewodnik – serce każdego komputera i telefonu. Z krzemu robi się też panele słoneczne.',
  Ge: 'Półprzewodnik – z germanu robiono pierwsze tranzystory.',
  Cu: 'Jeden z najlepszych przewodników i niezbyt drogi – dlatego przewody w domu są miedziane.',
  Ag: 'Najlepszy przewodnik ze wszystkich pierwiastków, ale za drogi na zwykłe przewody.',
  Au: 'Bardzo dobry przewodnik, który nie rdzewieje i nie koroduje – pokrywa się nim styki w elektronice.',
  Al: 'Lekki i dobry przewodnik – z aluminium robi się przewody linii wysokiego napięcia.',
  Fe: 'Przewodzi, ale gorzej niż miedź. Stal (głównie żelazo) też przewodzi.',
  Hg: 'Jedyny metal, który w temperaturze pokojowej jest cieczą – i też przewodzi prąd.',
  W: 'Ma bardzo wysoką temperaturę topnienia – z wolframu robi się żarniki tradycyjnych żarówek.',
  Li: 'Z litu robi się akumulatory w telefonach (akumulatory litowo-jonowe).',
  Na: 'Metal tak miękki, że kroi się go nożem – też przewodzi prąd.',
  H: 'Gaz złożony z cząsteczek H₂ – izolator. Gazy przewodzą dopiero przy bardzo wysokim napięciu.',
  He: 'Gaz szlachetny – izolator.',
  Ne: 'Gaz szlachetny – izolator. Przy wysokim napięciu w rurce z neonem płynie prąd i gaz świeci (neony).',
  O: 'Tlen to gaz – izolator, tak jak całe suche powietrze.',
  N: 'Azot stanowi większość powietrza – to izolator.',
  S: 'Siarka to klasyczny izolator.',
  B: 'Półmetal – bardzo słabo przewodzi w temperaturze pokojowej.',
  Sn: 'Cyna to metal – lut do łączenia przewodów jest ze stopu cyny.',
  Pb: 'Ołów przewodzi – używa się go w akumulatorach samochodowych.',
}

/** highlight – symbole pierwiastków do podświetlenia (np. z czego zbudowany jest materiał z pytania). */
export default function PeriodicTable({ highlight = [] }) {
  const [sel, setSel] = useState(null)
  const key = highlight.join(',')
  // po nowym podświetleniu pokazujemy opis pierwszego pierwiastka (przy kilku naraz – żadnego)
  useEffect(() => {
    setSel(highlight.length && highlight.length <= 4 ? highlight[0] : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const el = sel && ELEMENTS.find((e) => e[0] === sel)
  const lit = new Set(highlight)
  const Verdict = el && KINDS[el[4]].icon
  return (
    <div className="flex flex-col gap-3">
      <Separator className="my-1" />
      <h4 className="font-semibold">Dlaczego przewodzi, a dlaczego nie? Układ okresowy</h4>
      <p className="text-sm text-muted-foreground">
        Kliknij pierwiastek. Kolor mówi, czy jest metalem, półmetalem czy niemetalem – a to decyduje, czy
        przewodzi prąd.
      </p>
      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <span className={cn('rounded-full px-2.5 py-0.5', TONE.m)}>metale – przewodniki</span>
        <span className={cn('rounded-full px-2.5 py-0.5', TONE.s)}>półmetale – półprzewodniki</span>
        <span className={cn('rounded-full px-2.5 py-0.5', TONE.n)}>niemetale – izolatory</span>
      </div>
      <div className="overflow-x-auto p-1.5">
        <div className="grid min-w-140 grid-cols-[repeat(18,minmax(28px,1fr))] grid-rows-[repeat(7,34px)] gap-0.75">
          {ELEMENTS.map(([sym, , period, group, kind]) => (
            <button
              key={sym}
              type="button"
              className={cn(
                'rounded-md p-0 text-[0.82rem] font-bold transition-transform hover:scale-110',
                TONE[kind],
                kind === 'x' && 'text-[0.6rem]',
                sel === sym && 'outline-3 outline-offset-1 outline-foreground',
                lit.size > 0 && !lit.has(sym) && 'opacity-30',
                lit.has(sym) && 'z-1 scale-108 shadow-[0_0_0_3px_var(--volt),0_0_12px_var(--volt)]',
              )}
              style={{ gridRow: period, gridColumn: group }}
              onClick={() => setSel(sym)}
              aria-label={sym}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
      {el ? (
        <div className={cn('flex flex-col gap-2 rounded-xl px-3.5 py-3', TONE[el[4]])}>
          <div className="flex items-center gap-3.5">
            <b className="min-w-14 text-center font-formula text-3xl">{el[0]}</b>
            <span className="flex flex-col">
              <span>
                <b>{el[1]}</b> – {KINDS[el[4]].one}
              </span>
              <b className="flex items-center gap-1.5">
                <Verdict className="size-4" />
                {KINDS[el[4]].verdict}
              </b>
            </span>
          </div>
          {FACTS[el[0]] && (
            <p className="flex gap-2 font-semibold text-foreground">
              <Lightbulb className="mt-1 size-4 shrink-0" />
              {FACTS[el[0]]}
            </p>
          )}
          <p className="text-foreground">{KINDS[el[4]].why}</p>
        </div>
      ) : (
        <div className="rounded-xl bg-secondary px-3.5 py-3">
          <p>
            <b>Metale</b> (lewa i środkowa część tabeli) mają elektrony swobodne – przewodzą. <b>Niemetale</b>{' '}
            (prawy górny róg) mocno trzymają elektrony – nie przewodzą. <b>Półmetale</b> leżą na „schodkach”
            pomiędzy nimi i przewodzą słabo.
          </p>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Uwaga: szkło, plastik, guma, drewno czy papier to nie pierwiastki, tylko związki chemiczne. Ich elektrony
        są „zajęte” w wiązaniach między atomami, więc nie ma elektronów swobodnych – to izolatory. Woda z solą
        przewodzi z innego powodu: płyną w niej jony.
      </p>
    </div>
  )
}
