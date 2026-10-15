import { describe, expect, it } from 'vitest'
import { fmt, isClose, parseNum } from './physics.js'
import { PROBLEMS } from './problems.js'
import { UNIT_TASKS } from './unitTasks.js'

const RUNS = 200

describe('zadania obliczeniowe', () => {
  it.each(PROBLEMS.map((p, i) => [`${i}. ${p.topic}`, p]))('%s – spójne rozwiązanie', (_, p) => {
    for (let i = 0; i < RUNS; i++) {
      const t = p.make()
      expect(Number.isFinite(t.answer)).toBe(true)
      expect(t.answer).toBeGreaterThan(0)
      expect(t.unit).toBeTruthy()
      expect(t.steps.dane.length).toBeGreaterThan(0)
      // wynik z rozwiązania (tak jak go widzi uczeń) jest uznawany za poprawny
      const shown = fmt(t.answer)
      expect(isClose(parseNum(shown), t.answer, 0.005)).toBe(true)
      // a wynik pojawia się w obliczeniach albo w odpowiedzi
      const text = [...t.steps.obliczenia, t.steps.odp].join(' ')
      expect(text.includes(shown) || text.includes(fmt(t.answer, 2))).toBe(true)
    }
  })
})

describe('zadania z jednostek', () => {
  it.each(UNIT_TASKS)('%s – wynik w wyjaśnieniu', (_, make) => {
    for (let i = 0; i < RUNS; i++) {
      const t = make()
      expect(Number.isFinite(t.answer)).toBe(true)
      expect(t.explain).toContain(fmt(t.answer))
    }
  })
})
