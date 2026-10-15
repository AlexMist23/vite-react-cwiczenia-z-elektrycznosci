// Zadania obliczeniowe: { q, answer, unit, steps: { dane, szukane, obliczenia, odp } }.
import { clean, fmt, pick } from './physics.js'

const f = (x) => fmt(clean(x))
/** Wynik „do 0,01” – taki, jaki uczeń wpisze po zaokrągleniu. */
const round2 = (x) => Math.round(x * 100) / 100

// Każde zadanie ma rozwiązanie w układzie „Dane / Szukane / Rozwiązanie”, jak w zeszycie.
export const PROBLEMS = [
  {
    topic: 'Napięcie',
    make() {
      const U = pick([1.5, 4.5, 6, 9, 12, 24, 230])
      const q = pick([2, 5, 10, 20, 40, 100])
      const E = U * q
      return {
        q: `Ładunek ${f(q)} C przepłynął między biegunami źródła o napięciu ${f(U)} V. Jaką energię przeniósł?`,
        answer: E,
        unit: 'J',
        steps: {
          dane: [`U = ${f(U)} V`, `q = ${f(q)} C`],
          szukane: 'E = ?',
          obliczenia: ['U = E / q  ⇒  E = U · q', `E = ${f(U)} V · ${f(q)} C = ${f(E)} J`],
          odp: `Ładunek przeniósł energię ${f(E)} J.`,
        },
      }
    },
  },
  {
    topic: 'Napięcie',
    make() {
      const q = pick([2, 4, 5, 10, 20])
      const U = pick([1.5, 3, 4.5, 6, 9, 12])
      const E = U * q
      return {
        q: `Przy przeniesieniu ładunku ${f(q)} C z jednego bieguna źródła na drugi potrzebna była energia ${f(E)} J. Jakie jest napięcie tego źródła?`,
        answer: U,
        unit: 'V',
        steps: {
          dane: [`E = ${f(E)} J`, `q = ${f(q)} C`],
          szukane: 'U = ?',
          obliczenia: ['U = E / q', `U = ${f(E)} J : ${f(q)} C = ${f(U)} V`],
          odp: `Napięcie wynosi ${f(U)} V.`,
        },
      }
    },
  },
  {
    topic: 'Natężenie',
    make() {
      const mA = pick([20, 50, 120, 250, 400, 800])
      const t = pick([3, 5, 10, 20, 60])
      const I = mA / 1000
      const q = I * t
      return {
        q: `Przez żarówkę płynie prąd o natężeniu ${mA} mA. Jaki ładunek przepłynie w czasie ${t} s?`,
        answer: q,
        unit: 'C',
        steps: {
          dane: [`I = ${mA} mA = ${f(I)} A`, `t = ${t} s`],
          szukane: 'q = ?',
          obliczenia: ['I = q / t  ⇒  q = I · t', `q = ${f(I)} A · ${t} s = ${f(q)} C`],
          odp: `Przepłynie ładunek ${f(q)} C.`,
        },
      }
    },
  },
  {
    topic: 'Natężenie',
    make() {
      const t = pick([2, 4, 5, 10, 20, 50])
      const I = pick([0.2, 0.5, 1.5, 2, 3, 5])
      const q = I * t
      return {
        q: `W czasie ${t} s przez przewodnik przepłynął ładunek ${f(q)} C. Oblicz natężenie prądu.`,
        answer: I,
        unit: 'A',
        steps: {
          dane: [`q = ${f(q)} C`, `t = ${t} s`],
          szukane: 'I = ?',
          obliczenia: ['I = q / t', `I = ${f(q)} C : ${t} s = ${f(I)} A`],
          odp: `Natężenie prądu wynosi ${f(I)} A.`,
        },
      }
    },
  },
  {
    topic: 'Natężenie',
    make() {
      const I = pick([5, 8, 10])
      const h = pick([1, 2, 0.5])
      const t = h * 3600
      const q = I * t
      return {
        q: `Grzejnik elektryczny pobiera prąd o natężeniu ${f(I)} A przez ${f(h)} h. Jaki ładunek przez niego przepłynął?`,
        answer: q,
        unit: 'C',
        steps: {
          dane: [`I = ${f(I)} A`, `t = ${f(h)} h = ${f(t)} s`],
          szukane: 'q = ?',
          obliczenia: ['q = I · t', `q = ${f(I)} A · ${f(t)} s = ${f(q)} C`],
          odp: `Przepłynął ładunek ${f(q)} C.`,
        },
      }
    },
  },
  {
    topic: 'Natężenie',
    make() {
      const mah = pick([2000, 3000, 4000, 5000])
      const I = pick([0.25, 0.5, 1, 2])
      const h = mah / 1000 / I
      return {
        q: `Powerbank ma pojemność ${mah} mAh. Przez ile godzin może zasilać urządzenie pobierające prąd ${f(I)} A?`,
        answer: h,
        unit: 'h',
        steps: {
          dane: [`q = ${mah} mAh = ${f(mah / 1000)} Ah`, `I = ${f(I)} A`],
          szukane: 't = ?',
          obliczenia: ['I = q / t  ⇒  t = q / I', `t = ${f(mah / 1000)} Ah : ${f(I)} A = ${f(h)} h`],
          odp: `Powerbank wystarczy na ${f(h)} h.`,
        },
      }
    },
  },
  {
    topic: 'Moc',
    make() {
      const [name, P, U] = pick([
        ['Żarówka samochodowa', 21, 12],
        ['Żarówka', 60, 230],
        ['Lampka', 6, 12],
        ['Czajnik', 2300, 230],
        ['Żarówka latarki', 3, 6],
        ['Silniczek zabawki', 9, 4.5],
        ['Żelazko', 1150, 230],
      ])
      const I = P / U
      return {
        q: `Do napięcia ${f(U)} V podłączono urządzenie: ${name.toLowerCase()} o mocy ${f(P)} W. Jakie natężenie prądu płynie? (wynik do 0,01)`,
        answer: round2(I),
        unit: 'A',
        steps: {
          dane: [`P = ${f(P)} W`, `U = ${f(U)} V`],
          szukane: 'I = ?',
          obliczenia: ['P = U · I  ⇒  I = P / U', `I = ${f(P)} W : ${f(U)} V ≈ ${fmt(I, 2)} A`],
          odp: `Płynie prąd o natężeniu około ${fmt(I, 2)} A.`,
        },
      }
    },
  },
  {
    topic: 'Moc',
    make() {
      const U = pick([4.5, 12, 230])
      const I = pick([0.2, 0.5, 2, 5, 10])
      const P = U * I
      return {
        q: `Urządzenie podłączone do napięcia ${f(U)} V pobiera prąd ${f(I)} A. Jaka jest jego moc?`,
        answer: P,
        unit: 'W',
        steps: {
          dane: [`U = ${f(U)} V`, `I = ${f(I)} A`],
          szukane: 'P = ?',
          obliczenia: ['P = U · I', `P = ${f(U)} V · ${f(I)} A = ${f(P)} W`],
          odp: `Moc urządzenia wynosi ${f(P)} W.`,
        },
      }
    },
  },
  {
    topic: 'Praca',
    make() {
      const U = pick([4.5, 6, 12, 230])
      const I = pick([0.5, 1, 2, 4])
      const min = pick([1, 2, 5, 10])
      const t = min * 60
      const W = U * I * t
      return {
        q: `Silnik zasilany napięciem ${f(U)} V pobiera prąd ${f(I)} A i pracuje przez ${min} min. Jaką pracę wykonał prąd?`,
        answer: W,
        unit: 'J',
        steps: {
          dane: [`U = ${f(U)} V`, `I = ${f(I)} A`, `t = ${min} min = ${t} s`],
          szukane: 'W = ?',
          obliczenia: ['W = U · I · t', `W = ${f(U)} V · ${f(I)} A · ${t} s = ${f(W)} J`],
          odp: `Prąd wykonał pracę ${f(W)} J.`,
        },
      }
    },
  },
  {
    topic: 'Praca',
    make() {
      const [name, P, hours] = pick([
        ['Czajnik', 2000, [0.25, 0.5]],
        ['Telewizor', 100, [2, 3, 4]],
        ['Komputer', 300, [2, 4, 5]],
        ['Suszarka', 1500, [0.25, 0.5]],
        ['Żarówka LED', 10, [4, 6, 8]],
      ])
      const hDay = pick(hours)
      const days = 30
      const price = 1.1
      const kWh = (P / 1000) * hDay * days
      const cost = kWh * price
      return {
        q: `${name} o mocy ${P} W pracuje ${f(hDay)} h dziennie przez ${days} dni. Ile zapłacimy za prąd, jeśli 1 kWh kosztuje 1,10 zł? (wynik w zł, do 0,01)`,
        answer: Math.round(cost * 100) / 100,
        unit: 'zł',
        steps: {
          dane: [`P = ${P} W = ${f(P / 1000)} kW`, `t = ${f(hDay)} h · ${days} = ${f(hDay * days)} h`, 'cena = 1,10 zł/kWh'],
          szukane: 'koszt = ?',
          obliczenia: [
            `W = P · t = ${f(P / 1000)} kW · ${f(hDay * days)} h = ${f(kWh)} kWh`,
            `koszt = ${f(kWh)} kWh · 1,10 zł/kWh ≈ ${fmt(cost, 2)} zł`,
          ],
          odp: `Zapłacimy około ${fmt(cost, 2)} zł.`,
        },
      }
    },
  },
  // ---------- brakujące odwrócone wzory ----------
  {
    topic: 'Napięcie',
    make() {
      const U = pick([1.5, 4.5, 6, 12, 230])
      const q = pick([2, 4, 10, 20, 50])
      const E = U * q
      return {
        q: `Źródło o napięciu ${f(U)} V przeniosło ładunek, oddając mu energię ${f(E)} J. Jaki ładunek przepłynął?`,
        answer: q,
        unit: 'C',
        steps: {
          dane: [`U = ${f(U)} V`, `E = ${f(E)} J`],
          szukane: 'q = ?',
          obliczenia: ['U = E / q  ⇒  q = E / U', `q = ${f(E)} J : ${f(U)} V = ${f(q)} C`],
          odp: `Przepłynął ładunek ${f(q)} C.`,
        },
      }
    },
  },
  {
    topic: 'Natężenie',
    make() {
      const I = pick([0.5, 2, 4, 5])
      const t = pick([10, 30, 60, 120])
      const q = I * t
      return {
        q: `Przez przewodnik płynie prąd o natężeniu ${f(I)} A. W jakim czasie przepłynie przez niego ładunek ${f(q)} C?`,
        answer: t,
        unit: 's',
        steps: {
          dane: [`I = ${f(I)} A`, `q = ${f(q)} C`],
          szukane: 't = ?',
          obliczenia: ['I = q / t  ⇒  t = q / I', `t = ${f(q)} C : ${f(I)} A = ${f(t)} s`],
          odp: `Ładunek przepłynie w czasie ${f(t)} s.`,
        },
      }
    },
  },
  {
    topic: 'Moc',
    make() {
      const [name, P, I] = pick([
        ['Czajnik', 2300, 10],
        ['Lampka', 6, 0.5],
        ['Silniczek', 9, 2],
        ['Grzejnik', 1150, 5],
        ['Żarówka samochodowa', 21, 1.75],
      ])
      const U = P / I
      return {
        q: `${name} o mocy ${f(P)} W pobiera prąd o natężeniu ${f(I)} A. Pod jakim napięciem pracuje?`,
        answer: U,
        unit: 'V',
        steps: {
          dane: [`P = ${f(P)} W`, `I = ${f(I)} A`],
          szukane: 'U = ?',
          obliczenia: ['P = U · I  ⇒  U = P / I', `U = ${f(P)} W : ${f(I)} A = ${f(U)} V`],
          odp: `Napięcie wynosi ${f(U)} V.`,
        },
      }
    },
  },
  {
    topic: 'Praca',
    make() {
      const [name, P] = pick([
        ['Czajnik', 2000],
        ['Żelazko', 1500],
        ['Odkurzacz', 800],
        ['Grzejnik', 2500],
      ])
      const h = pick([0.5, 1, 2])
      const kWh = (P / 1000) * h
      return {
        q: `${name} o mocy ${f(P)} W pracował przez ${f(h)} h. Jaką pracę wykonał prąd? Podaj wynik w kWh.`,
        answer: kWh,
        unit: 'kWh',
        steps: {
          dane: [`P = ${f(P)} W = ${f(P / 1000)} kW`, `t = ${f(h)} h`],
          szukane: 'W = ?',
          obliczenia: ['P = W / t  ⇒  W = P · t', `W = ${f(P / 1000)} kW · ${f(h)} h = ${f(kWh)} kWh`],
          odp: `Prąd wykonał pracę ${f(kWh)} kWh (= ${f(kWh * 3.6e6)} J).`,
        },
      }
    },
  },

  // ---------- jak w zeszycie (te same typy zadań, inne liczby) ----------
  {
    topic: 'Z zeszytu',
    make() {
      const U = pick([12, 9, 4.5, 24, 230])
      const q = pick([20, 5, 10, 40])
      const E = U * q
      return {
        q: `Dane: U = ${f(U)} V, q = ${f(q)} C. Szukane: E. Oblicz energię elektryczną.`,
        answer: E,
        unit: 'J',
        steps: {
          dane: [`U = ${f(U)} V`, `q = ${f(q)} C`],
          szukane: 'E = ?',
          obliczenia: ['U = E / q  ⇒  E = U · q', `E = ${f(U)} V · ${f(q)} C = ${f(E)} J`],
          odp: `Energia wynosi ${f(E)} J.`,
        },
      }
    },
  },
  {
    topic: 'Z zeszytu',
    make() {
      const mA = pick([50, 20, 200, 250, 400, 5])
      const t = pick([3, 5, 10, 30])
      const I = mA / 1000
      const q = I * t
      return {
        q: `Dane: t = ${t} s, I = ${mA} mA. Szukane: q. Oblicz ładunek. (Uwaga na zamianę mA na A!)`,
        answer: q,
        unit: 'C',
        steps: {
          dane: [`t = ${t} s`, `I = ${mA} mA = ${f(I)} A`],
          szukane: 'q = ?',
          obliczenia: ['I = q / t  ⇒  q = I · t', `q = ${f(I)} A · ${t} s = ${f(q)} C`],
          odp: `Przepłynął ładunek ${f(q)} C. (${mA} mA = ${mA} · 0,001 A = ${f(I)} A)`,
        },
      }
    },
  },
  {
    topic: 'Z zeszytu',
    make() {
      const [P, U] = pick([
        [21, 12],
        [75, 230],
        [60, 230],
        [100, 230],
        [5, 12],
        [40, 230],
      ])
      const I = round2(P / U)
      return {
        q: `Żarówka o mocy ${f(P)} W jest zasilana napięciem ${f(U)} V. Oblicz natężenie prądu. (wynik do 0,01)`,
        answer: I,
        unit: 'A',
        steps: {
          dane: [`P = ${f(P)} W`, `U = ${f(U)} V`],
          szukane: 'I = ?',
          obliczenia: ['P = U · I  ⇒  I = P / U', `I = ${f(P)} W : ${f(U)} V ≈ ${fmt(I, 2)} A`],
          odp: `Natężenie prądu wynosi około ${fmt(I, 2)} A.`,
        },
      }
    },
  },
  {
    topic: 'Z zeszytu',
    make() {
      const I = pick([5, 2, 10, 4])
      const h = pick([1, 2, 0.5])
      const t = h * 3600
      const q = I * t
      return {
        q: `Dane: I = ${f(I)} A, U = 230 V, t = ${f(h)} h. Szukane: q. Jaki ładunek przepłynął?`,
        answer: q,
        unit: 'C',
        steps: {
          dane: [`I = ${f(I)} A`, 'U = 230 V (niepotrzebne do tego pytania)', `t = ${f(h)} h = ${f(t)} s`],
          szukane: 'q = ?',
          obliczenia: ['q = I · t', `q = ${f(I)} A · ${f(t)} s = ${f(q)} C`],
          odp: `Przepłynął ładunek ${f(q)} C.`,
        },
      }
    },
  },
  {
    topic: 'Z zeszytu',
    make() {
      const I = pick([5, 2, 10])
      const h = pick([1, 2, 0.5])
      const U = 230
      const t = h * 3600
      const W = U * I * t
      const kWh = W / 3.6e6
      const inKwh = Math.random() < 0.5
      return {
        q: `Urządzenie zasilane napięciem ${U} V pobiera prąd ${f(I)} A przez ${f(h)} h. Jaką pracę wykonał prąd? Podaj wynik w ${inKwh ? 'kWh' : 'dżulach'}.`,
        answer: inKwh ? kWh : W,
        unit: inKwh ? 'kWh' : 'J',
        steps: {
          dane: [`U = ${U} V`, `I = ${f(I)} A`, `t = ${f(h)} h = ${f(t)} s`],
          szukane: 'W = ?',
          obliczenia: [
            'W = U · I · t',
            `W = ${U} V · ${f(I)} A · ${f(t)} s = ${f(W)} J`,
            ...(inKwh ? [`${f(W)} J : 3 600 000 J = ${f(kWh)} kWh`] : []),
          ],
          odp: `Prąd wykonał pracę ${f(W)} J = ${f(kWh)} kWh.`,
        },
      }
    },
  },

  // ---------- dwa kroki: najpierw jedna wielkość, potem z niej druga ----------
  {
    topic: 'Dwa kroki',
    make() {
      const q = pick([60, 120, 240, 600])
      const min = pick([1, 2, 4])
      const U = pick([6, 12, 230])
      const t = min * 60
      const I = q / t
      const P = U * I
      return {
        q: `Przez żarówkę zasilaną napięciem ${U} V w czasie ${min} min przepłynął ładunek ${q} C. Oblicz moc żarówki.`,
        answer: P,
        unit: 'W',
        steps: {
          dane: [`U = ${U} V`, `t = ${min} min = ${t} s`, `q = ${q} C`],
          szukane: 'P = ?',
          obliczenia: ['1) I = q / t', `I = ${q} C : ${t} s = ${f(I)} A`, '2) P = U · I', `P = ${U} V · ${f(I)} A = ${f(P)} W`],
          odp: `Moc żarówki wynosi ${f(P)} W.`,
        },
      }
    },
  },
  {
    topic: 'Dwa kroki',
    make() {
      const U = pick([1.5, 4.5, 9, 12])
      const I = pick([0.1, 0.2, 0.5])
      const min = pick([5, 10, 20])
      const t = min * 60
      const q = I * t
      const E = U * q
      return {
        q: `Bateria o napięciu ${f(U)} V zasila latarkę prądem ${f(I)} A przez ${min} min. Jaką energię oddała bateria?`,
        answer: E,
        unit: 'J',
        steps: {
          dane: [`U = ${f(U)} V`, `I = ${f(I)} A`, `t = ${min} min = ${t} s`],
          szukane: 'E = ?',
          obliczenia: ['1) q = I · t', `q = ${f(I)} A · ${t} s = ${f(q)} C`, '2) E = U · q', `E = ${f(U)} V · ${f(q)} C = ${f(E)} J`],
          odp: `Bateria oddała energię ${f(E)} J. (To samo da wzór W = U · I · t.)`,
        },
      }
    },
  },
  {
    topic: 'Dwa kroki',
    make() {
      const [P, U] = pick([
        [46, 230],
        [2300, 230],
        [460, 230],
        [6, 12],
        [24, 12],
      ])
      const h = pick([1, 2, 0.5])
      const I = P / U
      const t = h * 3600
      const q = I * t
      return {
        q: `Urządzenie o mocy ${f(P)} W pracuje pod napięciem ${f(U)} V przez ${f(h)} h. Jaki ładunek przez nie przepłynął?`,
        answer: q,
        unit: 'C',
        steps: {
          dane: [`P = ${f(P)} W`, `U = ${f(U)} V`, `t = ${f(h)} h = ${f(t)} s`],
          szukane: 'q = ?',
          obliczenia: ['1) I = P / U', `I = ${f(P)} W : ${f(U)} V = ${f(I)} A`, '2) q = I · t', `q = ${f(I)} A · ${f(t)} s = ${f(q)} C`],
          odp: `Przepłynął ładunek ${f(q)} C.`,
        },
      }
    },
  },
  {
    topic: 'Dwa kroki',
    make() {
      const U = 12
      const ah = pick([40, 50, 60, 75])
      const q = ah * 3600
      const E = U * q
      const kWh = E / 3.6e6
      return {
        q: `Akumulator samochodowy ma napięcie ${U} V i pojemność ${ah} Ah. Ile energii może oddać? Podaj wynik w kWh.`,
        answer: kWh,
        unit: 'kWh',
        steps: {
          dane: [`U = ${U} V`, `q = ${ah} Ah = ${ah} · 3600 C = ${f(q)} C`],
          szukane: 'E = ?',
          obliczenia: ['1) E = U · q', `E = ${U} V · ${f(q)} C = ${f(E)} J`, '2) zamiana na kWh', `${f(E)} J : 3 600 000 J = ${f(kWh)} kWh`],
          odp: `Akumulator może oddać ${f(kWh)} kWh energii.`,
        },
      }
    },
  },
  {
    topic: 'Dwa kroki',
    make() {
      const I = pick([5, 8, 10])
      const min = pick([2, 3, 5])
      const U = 230
      const t = min * 60
      const q = I * t
      const P = U * I
      return {
        q: `Przez czajnik podłączony do napięcia ${U} V w czasie ${min} min przepłynął ładunek ${f(q)} C. Jaka jest moc czajnika?`,
        answer: P,
        unit: 'W',
        steps: {
          dane: [`U = ${U} V`, `t = ${min} min = ${t} s`, `q = ${f(q)} C`],
          szukane: 'P = ?',
          obliczenia: ['1) I = q / t', `I = ${f(q)} C : ${t} s = ${f(I)} A`, '2) P = U · I', `P = ${U} V · ${f(I)} A = ${f(P)} W`],
          odp: `Moc czajnika wynosi ${f(P)} W.`,
        },
      }
    },
  },
]
