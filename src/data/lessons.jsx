import {
  ArrowRightLeft,
  Atom,
  BookOpen,
  Brain,
  Calculator,
  CircuitBoard,
  ClipboardCheck,
  FlaskConical,
  Gauge,
  Lightbulb,
  ListChecks,
  NotebookText,
  PencilLine,
  PlugZap,
  Ruler,
  Sparkles,
  Trophy,
} from 'lucide-react'
import CalcExam from '../sections/CalcExam.jsx'
import Calculations from '../sections/Calculations.jsx'
import CircuitPuzzles from '../sections/CircuitPuzzles.jsx'
import CircuitSim from '../sections/CircuitSim.jsx'
import DirectionGame from '../sections/DirectionGame.jsx'
import Effects from '../sections/Effects.jsx'
import Electrostatics from '../sections/Electrostatics.jsx'
import FormulaDrills from '../sections/FormulaDrills.jsx'
import FormulaToCalc from '../sections/FormulaToCalc.jsx'
import FormulaTrainer from '../sections/FormulaTrainer.jsx'
import Media from '../sections/Media.jsx'
import Notes from '../sections/Notes.jsx'
import Problems from '../sections/Problems.jsx'
import Pyramids from '../sections/Pyramids.jsx'
import Quantities from '../sections/Quantities.jsx'
import Quiz from '../sections/Quiz.jsx'
import Summary from '../sections/Summary.jsx'
import SymbolGame from '../sections/SymbolGame.jsx'
import Triangles from '../sections/Triangles.jsx'
import Units from '../sections/Units.jsx'

export const GROUPS = [
  { id: 'ladunki', title: 'Ładunki elektryczne', color: '#ae3ec9' },
  { id: 'obwody', title: 'Obwody elektryczne', color: '#7048e8' },
  { id: 'prad', title: 'Przepływ prądu', color: '#e8590c' },
  { id: 'wzory', title: 'Wielkości i obliczenia', color: '#1c7ed6' },
  { id: 'powtorka', title: 'Powtórka', color: '#2b8a3e' },
]

/**
 * Rodzaje kroków lekcji. Krok „page” to zwykła strona bez paska kroków (Sprawdzian, Ściąga).
 * auto – krok liczy się jako ukończony już po otwarciu (ćwiczenie – po kilku odpowiedziach).
 */
export const KINDS = {
  t: { icon: BookOpen, label: 'wyjaśnienie', auto: true },
  c: { icon: PencilLine, label: 'ćwiczenie', auto: false },
  lab: { icon: FlaskConical, label: 'doświadczenie', auto: true },
  sum: { icon: ListChecks, label: 'podsumowanie', auto: true },
  page: { icon: BookOpen, label: '', auto: true },
}

/** Tyle odpowiedzi w ćwiczeniu wystarczy, żeby krok był ukończony. */
export const ANSWERS_TO_FINISH = 3

const t = (id, title, view, props) => ({ id, kind: 't', title, view, props })
const c = (id, title, view, props) => ({ id, kind: 'c', title, view, props })
const sum = (notes) => ({ id: 'podsumowanie', kind: 'sum', title: 'Podsumowanie', view: Summary, props: { notes } })

// kolejność jak w podręczniku i w zeszycie: elektryzowanie → obwód → kierunek → ośrodki → skutki → napięcie, natężenie, praca i moc → przedrostki → rachunki
export const LESSONS = [
  {
    id: 'elektrostatyka',
    group: 'ladunki',
    icon: Sparkles,
    title: 'Elektryzowanie ciał',
    desc: 'Ładunki, balon i sweter, przewodniki i izolatory, indukcja.',
    pages: '16–28',
    steps: [
      t('ladunki', 'Ładunki i atom', Electrostatics, { sub: 'ladunki' }),
      t('pocieranie', 'Elektryzowanie przez potarcie', Electrostatics, { sub: 'pocieranie' }),
      c('przyciaganie', 'Przyciągają czy odpychają?', Electrostatics, { sub: 'przyciaganie' }),
      t('dotyk', 'Elektryzowanie przez dotyk i elektroskop', Electrostatics, { sub: 'dotyk-t' }),
      t('przewodniki-t', 'Przewodniki i izolatory', Electrostatics, { sub: 'przewodniki-t' }),
      c('przewodniki', 'Przewodnik czy izolator?', Electrostatics, { sub: 'przewodniki' }),
      t('indukcja-t', 'Indukcja elektrostatyczna', Electrostatics, { sub: 'indukcja-t' }),
      c('indukcja', 'Indukcja – sprawdź się', Electrostatics, { sub: 'indukcja' }),
      sum(['charges']),
    ],
  },
  {
    id: 'obwod',
    group: 'obwody',
    icon: CircuitBoard,
    title: 'Obwód elektryczny',
    desc: 'Prąd, elementy obwodu, symbole, zwarcie, prąd jak woda.',
    pages: '29–34',
    steps: [
      t('prad', 'Prąd i obwód', CircuitPuzzles, { sub: 'obwod-t' }),
      t('symbole', 'Symbole elementów', SymbolGame, { sub: 'sciaga' }),
      c('symbole-c', 'Rozpoznaj symbol', SymbolGame, { sub: 'rozpoznaj' }),
      t('zwarcie', 'Zwarcie', CircuitPuzzles, { sub: 'zwarcie-t' }),
      c('zarowka', 'Czy żarówka świeci?', CircuitPuzzles, { sub: 'zarowka' }),
      t('woda', 'Prąd jak woda', CircuitPuzzles, { sub: 'woda-t' }),
      c('woda-c', 'Dopasuj: woda i prąd', CircuitPuzzles, { sub: 'woda' }),
      { id: 'symulator', kind: 'lab', title: 'Symulator obwodu', view: CircuitSim, props: {} },
      sum(['circuit']),
    ],
  },
  {
    id: 'kierunki',
    group: 'obwody',
    icon: ArrowRightLeft,
    title: 'Kierunek prądu',
    desc: 'Prąd od „+” do „−”, elektrony od „−” do „+”.',
    pages: '31–32',
    steps: [
      t('zasada', 'Zasada i pokaz', DirectionGame, { sub: 'zasada' }),
      c('cwiczenie', 'W którą stronę?', DirectionGame, { sub: 'cwiczenie' }),
      sum(['direction']),
    ],
  },
  {
    id: 'osrodki',
    group: 'prad',
    icon: Atom,
    title: 'Ciała stałe, ciecze, gazy',
    desc: 'Co przenosi ładunek w różnych ośrodkach?',
    pages: '23, 29, 35',
    steps: [
      t('nosniki', 'Nośniki ładunku', Media, { sub: 'nosniki' }),
      c('cwiczenie', 'Co przenosi ładunek?', Media, { sub: 'cwiczenie' }),
      sum(['media']),
    ],
  },
  {
    id: 'skutki',
    group: 'prad',
    icon: Lightbulb,
    title: 'Skutki prądu',
    desc: 'Cieplny, świetlny, mechaniczny, chemiczny…',
    steps: [
      t('rodzaje', 'Rodzaje skutków', Effects, { sub: 'rodzaje' }),
      c('cwiczenie', 'Jaki skutek?', Effects, { sub: 'cwiczenie' }),
      sum(['effects']),
    ],
  },
  {
    id: 'napiecie',
    group: 'wzory',
    icon: Gauge,
    title: 'Napięcie i natężenie',
    desc: 'U = E / q i I = q / t – co oznaczają i jak liczyć.',
    steps: [
      t('napiecie', 'Napięcie elektryczne', Quantities, { sub: 'napiecie' }),
      t('natezenie', 'Natężenie prądu', Quantities, { sub: 'natezenie' }),
      t('piramida-u', 'Piramida napięcia', Pyramids, { sub: 'u' }),
      t('piramida-i', 'Piramida natężenia', Pyramids, { sub: 'i' }),
      c('wzory-c', 'Który wzór?', Triangles, { sub: 'cwiczenie', only: ['E', 'q'] }),
      c('zadania', 'Obliczenia', Problems, { topics: ['Napięcie', 'Natężenie'] }),
      sum(['voltage', 'current']),
    ],
  },
  {
    id: 'praca',
    group: 'wzory',
    icon: PlugZap,
    title: 'Praca i moc prądu',
    desc: 'W = U · I · t, P = U · I i rachunek za prąd w kWh.',
    steps: [
      t('praca', 'Praca i moc', Quantities, { sub: 'praca' }),
      t('piramida-p', 'Piramida mocy', Pyramids, { sub: 'p' }),
      t('piramida-w', 'Piramida pracy', Pyramids, { sub: 'w' }),
      c('wzory-c', 'Który wzór?', Triangles, { sub: 'cwiczenie', only: ['P', 'W'] }),
      c('zadania', 'Obliczenia', Problems, { topics: ['Moc', 'Praca'] }),
      sum(['work']),
    ],
  },
  {
    id: 'jednostki',
    group: 'wzory',
    icon: Ruler,
    title: 'Jednostki i przedrostki',
    desc: 'mA, kV, kWh, Ah – zamieniaj bez pomyłek.',
    steps: [
      t('przedrostki', 'Przedrostki i jednostki', Units, { sub: 'przedrostki' }),
      c('cwiczenie', 'Zamień jednostki', Units, { sub: 'cwiczenie' }),
      sum(['prefixes']),
    ],
  },
  {
    id: 'trening',
    group: 'wzory',
    icon: Brain,
    title: 'Wzory na pamięć',
    desc: 'Piramidy z pamięci, luki we wzorach, wzory z klocków, jednostki.',
    steps: [
      t('budowa', 'Jak zbudowana jest piramida?', FormulaTrainer, { sub: 'budowa' }),
      t('karta', 'Wszystkie wzory', Pyramids, { sub: 'karta' }),
      c('piramida', 'Ułóż piramidę', FormulaTrainer, { sub: 'piramida' }),
      c('luki', 'Uzupełnij wzór', FormulaDrills, { sub: 'luki' }),
      c('wzor', 'Ułóż wzór z klocków', FormulaTrainer, { sub: 'wzor' }),
      c('symbole', 'Symbol i jednostka', FormulaTrainer, { sub: 'symbole' }),
      c('jednostki', 'Jaka jednostka wyjdzie?', FormulaDrills, { sub: 'jednostki' }),
    ],
  },
  {
    id: 'rachunki',
    group: 'wzory',
    icon: Calculator,
    title: 'Rachunki krok po kroku',
    desc: 'Dane, szukane, wzór, wynik – zadania jak w zeszycie i na sprawdzianie.',
    steps: [
      t('metoda', 'Jak rozwiązywać zadania?', Calculations, { sub: 'metoda' }),
      t('zeszyt-t', 'Zadania z zeszytu – rozwiązane', Calculations, { sub: 'zeszyt' }),
      c('zeszyt', 'Zadania jak w zeszycie', Problems, { topics: ['Z zeszytu'] }),
      c('wzor-obliczenie', 'Wzór → obliczenie', FormulaToCalc, {}),
      c('dwa-kroki', 'Zadania na dwa kroki', Problems, { topics: ['Dwa kroki'] }),
      c('zadania', 'Zadania mieszane', Problems, {}),
    ],
  },
  {
    id: 'egzamin',
    group: 'powtorka',
    icon: ClipboardCheck,
    title: 'Sprawdzian z obliczeń',
    desc: 'Same zadania rachunkowe z wpisywaniem wyniku i oceną.',
    steps: [{ id: 'main', kind: 'page', title: 'Sprawdzian z obliczeń', view: CalcExam, props: {} }],
  },
  {
    id: 'quiz',
    group: 'powtorka',
    icon: Trophy,
    title: 'Sprawdzian z teorii',
    desc: 'Quiz z całego działu z oceną jak w szkole.',
    steps: [{ id: 'main', kind: 'page', title: 'Sprawdzian z teorii', view: Quiz, props: {} }],
  },
  {
    id: 'notatki',
    group: 'powtorka',
    icon: NotebookText,
    title: 'Ściąga',
    desc: 'Notatki z lekcji – uporządkowane.',
    steps: [{ id: 'main', kind: 'page', title: 'Ściąga', view: Notes, props: {} }],
  },
]

export const groupOf = (l) => GROUPS.find((g) => g.id === l.group)
/** Lekcja z paskiem kroków (Sprawdzian i Ściąga to pojedyncze strony). */
export const isStepped = (l) => l.steps.length > 1
/** Numer lekcji (Sprawdzian i Ściąga nie mają numeru). */
export const lessonNo = (l) => LESSONS.filter(isStepped).indexOf(l) + 1
export const stepHash = (l, s) => (isStepped(l) ? `${l.id}/${s.id}` : l.id)

// wszystkie kroki po kolei – do przycisków „Wstecz / Dalej”
export const PAGES = LESSONS.flatMap((l) => l.steps.map((s) => ({ l, s, hash: stepHash(l, s) })))

// adresy z poprzedniej wersji aplikacji (działy zamiast lekcji) – żeby zakładki i „ostatnio otwarte” działały
const REDIRECTS = {
  'elektrostatyka/teoria': 'elektrostatyka/ladunki',
  symbole: 'obwod/symbole',
  'symbole/sciaga': 'obwod/symbole',
  'symbole/rozpoznaj': 'obwod/symbole-c',
  zagadki: 'obwod/zarowka',
  'zagadki/zarowka': 'obwod/zarowka',
  'zagadki/woda': 'obwod/woda-c',
  wzory: 'napiecie/piramida-u',
  'wzory/piramidy': 'napiecie/piramida-u',
  'napiecie/piramidy': 'napiecie/piramida-u',
  'praca/piramidy': 'praca/piramida-p',
  'wzory/cwiczenie': 'napiecie/wzory-c',
  'wzor-obliczenie': 'rachunki/wzor-obliczenie',
  zadania: 'rachunki/zadania',
  'trening/wzor-obliczenie': 'rachunki/wzor-obliczenie',
  'trening/zadania': 'rachunki/zadania',
}

/** Zamienia hash na lekcję i krok; nieznany krok → pierwszy krok lekcji. */
export function resolveRoute(route) {
  const [lessonId, stepId] = (REDIRECTS[route] ?? route).split('/')
  const lesson = LESSONS.find((l) => l.id === lessonId) ?? null
  const step = lesson ? (lesson.steps.find((s) => s.id === stepId) ?? lesson.steps[0]) : null
  return { lesson, step }
}
