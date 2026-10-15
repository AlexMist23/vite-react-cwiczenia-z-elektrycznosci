import {
  Atom,
  BookOpen,
  Brain,
  Calculator,
  CircuitBoard,
  FlaskConical,
  Lightbulb,
  NotebookText,
  PencilLine,
  Puzzle,
  Ruler,
  Shapes,
  Sparkles,
  ArrowRightLeft,
  Triangle,
  Trophy,
} from 'lucide-react'

export const GROUPS = [
  { id: 'ladunki', title: 'Elektryzowanie ciał', color: '#ae3ec9' },
  { id: 'obwody', title: 'Obwody elektryczne', color: '#7048e8' },
  { id: 'prad', title: 'Przepływ prądu', color: '#e8590c' },
  { id: 'wzory', title: 'Wzory i obliczenia', color: '#1c7ed6' },
  { id: 'powtorka', title: 'Powtórka', color: '#2b8a3e' },
]

/** Rodzaje podstron: wyjaśnienie (teoria) albo ćwiczenie. */
export const KINDS = {
  t: { icon: BookOpen, label: 'wyjaśnienie' },
  c: { icon: PencilLine, label: 'ćwiczenie' },
}

// kolejność jak w zeszycie: elektryzowanie → obwód (z kierunkiem prądu) → skutki → ośrodki → napięcie, natężenie, praca i moc → przedrostki → zadania
export const SECTIONS = [
  { id: 'elektrostatyka', group: 'ladunki', icon: Sparkles, title: 'Elektryzowanie i ładunki', desc: 'Balon i sweter, przewodniki i izolatory, indukcja.', subs: [{ id: 'teoria', title: 'Ładunki i elektryzowanie', kind: 't' }, { id: 'przyciaganie', title: 'Przyciągają czy odpychają?', kind: 'c' }, { id: 'przewodniki', title: 'Przewodnik czy izolator?', kind: 'c' }, { id: 'indukcja', title: 'Indukcja', kind: 'c' }] },
  { id: 'obwod', group: 'obwody', icon: CircuitBoard, title: 'Symulator obwodu', desc: 'Zbuduj obwód, zamknij wyłącznik, zobacz prąd i elektrony.' },
  { id: 'symbole', group: 'obwody', icon: Shapes, title: 'Symbole', desc: 'Rozpoznaj symbole elementów obwodu.', subs: [{ id: 'sciaga', title: 'Ściąga symboli', kind: 't' }, { id: 'rozpoznaj', title: 'Rozpoznaj symbol', kind: 'c' }] },
  { id: 'zagadki', group: 'obwody', icon: Puzzle, title: 'Zagadki obwodowe', desc: 'Czy żarówka świeci? Prąd jak woda.', subs: [{ id: 'zarowka', title: 'Czy żarówka świeci?', kind: 'c' }, { id: 'woda', title: 'Prąd jak woda', kind: 'c' }] },
  { id: 'kierunki', group: 'obwody', icon: ArrowRightLeft, title: 'Kierunek prądu', desc: 'Prąd od „+” do „−”, elektrony od „−” do „+”.', subs: [{ id: 'zasada', title: 'Zasada i pokaz', kind: 't' }, { id: 'cwiczenie', title: 'W którą stronę?', kind: 'c' }] },
  { id: 'skutki', group: 'prad', icon: Lightbulb, title: 'Skutki prądu', desc: 'Cieplny, świetlny, mechaniczny, chemiczny…', subs: [{ id: 'rodzaje', title: 'Rodzaje skutków', kind: 't' }, { id: 'cwiczenie', title: 'Jaki skutek?', kind: 'c' }] },
  { id: 'osrodki', group: 'prad', icon: Atom, title: 'Ciała stałe, ciecze, gazy', desc: 'Co przenosi ładunek w różnych ośrodkach?', subs: [{ id: 'nosniki', title: 'Nośniki ładunku', kind: 't' }, { id: 'cwiczenie', title: 'Co przenosi ładunek?', kind: 'c' }] },
  { id: 'wzory', group: 'wzory', icon: Triangle, title: 'Trójkąty wzorów', desc: 'U = E/q, I = q/t, P = U·I, W = U·I·t', subs: [{ id: 'piramidy', title: 'Piramidy i przykłady', kind: 't' }, { id: 'cwiczenie', title: 'Który wzór?', kind: 'c' }] },
  { id: 'trening', group: 'wzory', icon: Brain, title: 'Trening wzorów i piramid', desc: 'Ułóż piramidę, złóż wzór z klocków, symbole i jednostki.', subs: [{ id: 'piramida', title: 'Ułóż piramidę', kind: 'c' }, { id: 'wzor', title: 'Ułóż wzór', kind: 'c' }, { id: 'symbole', title: 'Symbol i jednostka', kind: 'c' }] },
  { id: 'jednostki', group: 'wzory', icon: Ruler, title: 'Jednostki i przedrostki', desc: 'mA, kV, kWh, Ah – zamieniaj bez pomyłek.', subs: [{ id: 'przedrostki', title: 'Przedrostki i jednostki', kind: 't' }, { id: 'cwiczenie', title: 'Zamień jednostki', kind: 'c' }] },
  { id: 'wzor-obliczenie', group: 'wzory', icon: FlaskConical, title: 'Wzór → obliczenie', desc: 'Najpierw ułóż wzór, potem policz – wynik jest sprawdzany.' },
  { id: 'zadania', group: 'wzory', icon: Calculator, title: 'Zadania obliczeniowe', desc: 'Dane, szukane, wzór, wynik – krok po kroku.' },
  { id: 'quiz', group: 'powtorka', icon: Trophy, title: 'Sprawdzian', desc: 'Quiz z całego działu z oceną jak w szkole.' },
  { id: 'notatki', group: 'powtorka', icon: NotebookText, title: 'Ściąga', desc: 'Notatki z lekcji – uporządkowane i poprawione.' },
]

export const groupOf = (s) => GROUPS.find((g) => g.id === s.group)

// wszystkie strony po kolei (dział albo dział/podstrona) – do przycisków „poprzedni / następny”
export const PAGES = SECTIONS.flatMap((s) =>
  s.subs ? s.subs.map((u) => ({ s, u, hash: `${s.id}/${u.id}` })) : [{ s, u: null, hash: s.id }],
)

/** Zamienia hash (np. „symbole/rozpoznaj”) na dział i podstronę; nieznana podstrona → pierwsza. */
export function resolveRoute(route) {
  const [secId, subId] = route.split('/')
  const section = SECTIONS.find((s) => s.id === secId) ?? null
  const sub = section?.subs ? (section.subs.find((u) => u.id === subId) ?? section.subs[0]) : null
  return { section, sub }
}
