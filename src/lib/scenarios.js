// Treści zadań do wzorów z piramid – używane w „Wzór → obliczenie” i jako przykłady przy piramidach.
import { clean, fmt, pick } from './physics.js'

const f = (x) => fmt(clean(x))
export const UNITS = { E: 'J', W: 'J', U: 'V', q: 'C', I: 'A', t: 's', P: 'W' }

/** Jednostki czasu: ile sekund ma jedna. */
export const TIME_UNITS = { s: 1, min: 60, h: 3600 }
const TIME_IN = { s: 'sekundach', min: 'minutach', h: 'godzinach' }

/** Czas w jednostce zadania (v.tUnit, domyślnie sekundy): 7200 s → „2 h”. */
const time = (v) => `${f(v.t / TIME_UNITS[v.tUnit ?? 's'])} ${v.tUnit ?? 's'}`
/** Gdy szukany czas ma wyjść w minutach lub godzinach – dopisek do treści. */
const askTime = (v) => (v.tUnit && v.tUnit !== 's' ? ` Wynik podaj w ${TIME_IN[v.tUnit]}.` : '')
/** Losuje „ładny” czas w danej jednostce i zwraca go w sekundach. */
const pickTime = (lists, unit) => pick(lists[unit]) * TIME_UNITS[unit]

// Dla każdego trójkąta: losowanie „ładnych” liczb i treść zadania dla każdej szukanej wielkości.
export const SCENARIOS = {
  E: {
    values: () => {
      const U = pick([1.5, 4.5, 6, 9, 12, 24, 230])
      const q = pick([2, 5, 10, 20, 40])
      return { U, q, E: U * q }
    },
    text: {
      E: (v) => `Między biegunami źródła o napięciu ${f(v.U)} V przepłynął ładunek ${f(v.q)} C. Jaką energię przeniósł ten ładunek?`,
      U: (v) => `Przeniesienie ładunku ${f(v.q)} C między biegunami źródła wymagało energii ${f(v.E)} J. Jakie jest napięcie źródła?`,
      q: (v) => `Źródło o napięciu ${f(v.U)} V przekazało energię ${f(v.E)} J. Jaki ładunek przepłynął?`,
    },
  },
  q: {
    // tUnit – w jakiej jednostce podajemy (albo każemy podać) czas: 's' | 'min' | 'h'
    values: (tUnit = 's') => {
      const I = pick([0.2, 0.5, 1.5, 2, 3, 5])
      const t = pickTime({ s: [2, 4, 5, 10, 20, 60], min: [1, 2, 5, 10, 30], h: [0.5, 1, 2, 3] }, tUnit)
      return { I, t, q: I * t, tUnit }
    },
    text: {
      q: (v) => `Przez żarówkę płynie prąd o natężeniu ${f(v.I)} A. Jaki ładunek przepłynie przez nią w czasie ${time(v)}?`,
      I: (v) => `W czasie ${time(v)} przez przewodnik przepłynął ładunek ${f(v.q)} C. Jakie jest natężenie prądu?`,
      t: (v) => `Przez przewodnik płynie prąd o natężeniu ${f(v.I)} A. W jakim czasie przepłynie ładunek ${f(v.q)} C?${askTime(v)}`,
    },
  },
  P: {
    values: () => {
      const U = pick([4.5, 6, 12, 230])
      const I = pick([0.5, 2, 4, 5, 10])
      return { U, I, P: U * I }
    },
    text: {
      P: (v) => `Urządzenie podłączone do napięcia ${f(v.U)} V pobiera prąd ${f(v.I)} A. Jaka jest jego moc?`,
      U: (v) => `Urządzenie o mocy ${f(v.P)} W pobiera prąd o natężeniu ${f(v.I)} A. Pod jakim napięciem pracuje?`,
      I: (v) => `Urządzenie o mocy ${f(v.P)} W podłączono do napięcia ${f(v.U)} V. Jakie natężenie prądu płynie?`,
    },
  },
  W: {
    values: (tUnit = 's') => {
      const U = pick([4.5, 6, 12, 230])
      const I = pick([0.5, 1, 2, 4])
      const t = pickTime({ s: [10, 30, 60, 120], min: [1, 2, 5, 10, 30], h: [0.5, 1, 2, 3] }, tUnit)
      return { U, I, t, W: U * I * t, tUnit }
    },
    text: {
      W: (v) => `Silnik zasilany napięciem ${f(v.U)} V pobiera prąd ${f(v.I)} A i pracuje przez ${time(v)}. Jaką pracę wykonał prąd?`,
      U: (v) => `Prąd o natężeniu ${f(v.I)} A płynął przez ${time(v)} i wykonał pracę ${f(v.W)} J. Jakie było napięcie?`,
      I: (v) => `Przy napięciu ${f(v.U)} V w czasie ${time(v)} prąd wykonał pracę ${f(v.W)} J. Jakie było natężenie prądu?`,
      t: (v) =>
        `Urządzenie pracuje przy napięciu ${f(v.U)} V i pobiera prąd ${f(v.I)} A. Jak długo musi działać, żeby prąd wykonał pracę ${f(v.W)} J?${askTime(v)}`,
    },
  },
}

/** Prawa strona wzoru z podstawionymi liczbami: 'U = E / q' → '24 J : 4 C'. */
export function substitute(formula, values) {
  return formula
    .split('=')[1]
    .replace(/[A-Za-z]+/g, (l) => `${f(values[l])} ${UNITS[l]}`)
    .replace(/\//g, ':')
    .trim()
}
