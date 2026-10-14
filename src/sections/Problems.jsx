import { useState } from 'react'
import NumberTask from '../components/NumberTask.jsx'
import { clean, fmt, pick } from '../lib/physics.js'

const f = (x) => fmt(clean(x))

// Każde zadanie ma rozwiązanie w układzie „Dane / Szukane / Rozwiązanie”, jak w zeszycie.
const PROBLEMS = [
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
      const I = pick([5, 2, 10, 0.5])
      const h = pick([1, 2, 0.5])
      const t = h * 3600
      const q = I * t
      return {
        q: `Czajnik pobiera prąd o natężeniu ${f(I)} A przez ${f(h)} h. Jaki ładunek przez niego przepłynął?`,
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
        answer: clean(I),
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
]

const TOPICS = ['Wszystkie', ...new Set(PROBLEMS.map((p) => p.topic))]

export default function Problems({ record }) {
  const [topic, setTopic] = useState('Wszystkie')
  const gen = () => pick(PROBLEMS.filter((p) => topic === 'Wszystkie' || p.topic === topic)).make()

  return (
    <div className="section">
      <h2>Zadania obliczeniowe</h2>
      <p className="lead">
        Rozwiązuj jak w zeszycie: wypisz <b>dane</b> i <b>szukane</b>, zamień jednostki, dobierz wzór i
        policz. Liczby dziesiętne możesz wpisywać z przecinkiem (np. 0,15).
      </p>
      <div className="seg wrap">
        {TOPICS.map((t) => (
          <button key={t} className={topic === t ? 'active' : ''} onClick={() => setTopic(t)}>
            {t}
          </button>
        ))}
      </div>
      <NumberTask key={topic} generate={gen} onResult={(ok) => record('zadania', ok)} />
    </div>
  )
}
