import { describe, expect, it } from 'vitest'
import { SCENARIOS, TIME_UNITS } from './scenarios.js'

describe('SCENARIOS – czas w s, min i h', () => {
  for (const unit of Object.keys(TIME_UNITS)) {
    it(`q = I · t i W = U · I · t przy czasie w ${unit}`, () => {
      for (let k = 0; k < 50; k++) {
        const q = SCENARIOS.q.values(unit)
        expect(q.tUnit).toBe(unit)
        expect(q.q).toBeCloseTo(q.I * q.t)
        const W = SCENARIOS.W.values(unit)
        expect(W.W).toBeCloseTo(W.U * W.I * W.t)
      }
    })
  }

  it('treść podaje czas w jednostce zadania', () => {
    const v = { I: 2, t: 7200, q: 14400, tUnit: 'h' }
    expect(SCENARIOS.q.text.q(v)).toContain('w czasie 2 h')
    expect(SCENARIOS.q.text.t(v)).toContain('Wynik podaj w godzinach.')
    expect(SCENARIOS.q.text.q({ ...v, tUnit: 'min' })).toContain('w czasie 120 min')
  })

  it('bez jednostki czas jest w sekundach, jak wcześniej', () => {
    const v = SCENARIOS.q.values()
    expect(v.tUnit).toBe('s')
    expect(SCENARIOS.q.text.t(v)).not.toContain('Wynik podaj')
  })
})
