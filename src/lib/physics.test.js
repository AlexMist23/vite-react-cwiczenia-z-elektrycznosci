import { describe, expect, it } from 'vitest'
import { charge, energy, fmt, gradeFor, isClose, parseNum, power, work, J_PER_KWH, C_PER_AH } from './physics.js'

describe('wzory z lekcji', () => {
  it('E = U·q (zad. 1 z zeszytu)', () => expect(energy(12, 20)).toBe(240))
  it('q = I·t dla 50 mA i 3 s daje 0,15 C', () => expect(charge(50 / 1000, 3)).toBeCloseTo(0.15))
  it('I = P/U dla żarówki 21 W / 12 V', () => expect(21 / 12).toBe(1.75))
  it('q = 5 A · 1 h = 18 000 C', () => expect(charge(5, 3600)).toBe(18000))
  it('W = U·I·t i P = U·I', () => {
    expect(work(230, 2, 60)).toBe(27600)
    expect(power(230, 2)).toBe(460)
  })
  it('kWh i Ah', () => {
    expect(J_PER_KWH).toBe(3_600_000)
    expect(C_PER_AH).toBe(3600)
  })
})

describe('liczby po polsku', () => {
  it('czyta przecinek i spacje', () => {
    expect(parseNum('0,05')).toBe(0.05)
    expect(parseNum('3 600 000')).toBe(3600000)
    expect(parseNum('abc')).toBeNaN()
    expect(parseNum('')).toBeNaN()
  })
  it('formatuje z przecinkiem', () => {
    expect(fmt(0.1 + 0.2)).toBe('0,3')
    expect(fmt(3600000)).toBe('3 600 000')
    expect(fmt(3600)).toBe('3600')
  })
  it('tolerancja odpowiedzi', () => {
    expect(isClose(0.26, 60 / 230, 0.005)).toBe(true)
    expect(isClose(0.005, 0.05)).toBe(false)
  })
})

describe('progi ocen z zeszytu', () => {
  it.each([[100, 6], [95, 6], [94, 5], [85, 5], [84, 4], [70, 4], [69, 3], [50, 3], [49, 2], [30, 2], [29, 1], [0, 1]])(
    '%i%% → %i', (p, g) => expect(gradeFor(p).grade).toBe(g),
  )
})

import { evaluate, rhs, sameFormula, samePyramid, tokenize, TRIANGLES } from './formulas.js'

describe('układanie wzorów', () => {
  const W = TRIANGLES.find((t) => t.id === 'W')
  it('rozbija wzór na symbole', () => expect(rhs('U = W / (I · t)')).toEqual(['W', '/', '(', 'I', '·', 't', ')']))
  it('liczy z nawiasami', () => expect(evaluate(tokenize('W / (I · t)'), { W: 120, I: 2, t: 10 })).toBe(6))
  it('odrzuca błędny zapis', () => {
    expect(evaluate(['U', 'I'], { U: 2, I: 3 })).toBeNaN()
    expect(evaluate(['U', '·'], { U: 2 })).toBeNaN()
    expect(evaluate(['(', 'U'], { U: 2 })).toBeNaN()
  })
  it('uznaje równoważne wzory', () => {
    const vars = ['W', 'I', 't']
    expect(sameFormula(tokenize('W / U / I'.replace('U', 't')), rhs(W.formulas.U), vars)).toBe(true)
    expect(sameFormula(tokenize('W / (t · I)'), rhs(W.formulas.U), vars)).toBe(true)
    expect(sameFormula(tokenize('W / I · t'), rhs(W.formulas.U), vars)).toBe(false)
    expect(sameFormula(tokenize('W · I · t'), rhs(W.formulas.U), vars)).toBe(false)
  })
  it('sprawdza piramidę', () => {
    expect(samePyramid(['W', 't', 'U', 'I'], W)).toBe(true)
    expect(samePyramid(['U', 'W', 'I', 't'], W)).toBe(false)
  })
})

describe('wzory słowami i w jednostkach', async () => {
  const { inUnitNames, inUnits, inWords } = await import('./formulas.js')
  it('napięcie', () => {
    expect(inWords('U = E / q')).toBe('napięcie = energia : ładunek')
    expect(inUnits('U = E / q')).toBe('V = J : C')
    expect(inUnitNames('U = E / q')).toBe('wolt = dżul : kulomb')
  })
  it('praca z nawiasem', () => {
    expect(inWords('I = W / (U · t)')).toBe('natężenie = praca : (napięcie · czas)')
    expect(inUnits('I = W / (U · t)')).toBe('A = J : (V · s)')
  })
  it('moc: litera W jako wat tylko w jednostkach', () => {
    expect(inUnits('P = U · I')).toBe('W = V · A')
    expect(inUnitNames('W = U · I · t')).toBe('dżul = wolt · amper · sekunda')
  })
})
