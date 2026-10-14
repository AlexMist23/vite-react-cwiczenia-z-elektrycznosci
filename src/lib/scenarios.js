// Treści zadań do wzorów z piramid – używane w „Wzór → obliczenie” i jako przykłady przy piramidach.
import { clean, fmt, pick } from './physics.js'

const f = (x) => fmt(clean(x))
export const UNITS = { E: 'J', W: 'J', U: 'V', q: 'C', I: 'A', t: 's', P: 'W' }

// Dla każdego trójkąta: losowanie „ładnych” liczb i treść zadania dla każdej szukanej wielkości.
export const SCENARIOS = {
  E: {
    values: () => {
      const U = pick([1.5, 4.5, 6, 9, 12, 24, 230])
      const q = pick([2, 5, 10, 20, 40])
      return { U, q, E: U * q }
    },
    text: {
      E: (v) => `Między biegunami baterii o napięciu ${f(v.U)} V przepłynął ładunek ${f(v.q)} C. Jaką energię przeniósł ten ładunek?`,
      U: (v) => `Przeniesienie ładunku ${f(v.q)} C między biegunami źródła wymagało energii ${f(v.E)} J. Jakie jest napięcie źródła?`,
      q: (v) => `Źródło o napięciu ${f(v.U)} V przekazało energię ${f(v.E)} J. Jaki ładunek przepłynął?`,
    },
  },
  q: {
    values: () => {
      const I = pick([0.2, 0.5, 1.5, 2, 3, 5])
      const t = pick([2, 4, 5, 10, 20, 60])
      return { I, t, q: I * t }
    },
    text: {
      q: (v) => `Przez żarówkę płynie prąd o natężeniu ${f(v.I)} A. Jaki ładunek przepłynie przez nią w czasie ${f(v.t)} s?`,
      I: (v) => `W czasie ${f(v.t)} s przez przewodnik przepłynął ładunek ${f(v.q)} C. Jakie jest natężenie prądu?`,
      t: (v) => `Przez przewodnik płynie prąd o natężeniu ${f(v.I)} A. W jakim czasie przepłynie ładunek ${f(v.q)} C?`,
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
    values: () => {
      const U = pick([4.5, 6, 12, 230])
      const I = pick([0.5, 1, 2, 4])
      const t = pick([10, 30, 60, 120])
      return { U, I, t, W: U * I * t }
    },
    text: {
      W: (v) => `Silnik zasilany napięciem ${f(v.U)} V pobiera prąd ${f(v.I)} A i pracuje przez ${f(v.t)} s. Jaką pracę wykonał prąd?`,
      U: (v) => `Prąd o natężeniu ${f(v.I)} A płynął przez ${f(v.t)} s i wykonał pracę ${f(v.W)} J. Jakie było napięcie?`,
      I: (v) => `Przy napięciu ${f(v.U)} V w czasie ${f(v.t)} s prąd wykonał pracę ${f(v.W)} J. Jakie było natężenie prądu?`,
      t: (v) => `Urządzenie pracuje przy napięciu ${f(v.U)} V i pobiera prąd ${f(v.I)} A. Jak długo musi działać, żeby prąd wykonał pracę ${f(v.W)} J?`,
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
