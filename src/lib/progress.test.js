import { describe, expect, it } from 'vitest'
import { migrate } from './progress.js'

describe('przeniesienie postępów z działów do lekcji', () => {
  it('sumuje działy połączone w jedną lekcję', () => {
    expect(migrate({ obwod: { ok: 1, all: 2 }, symbole: { ok: 3, all: 4 }, zagadki: { ok: 1, all: 1 } })).toEqual({
      obwod: { ok: 5, all: 7 },
    })
  })
  it('przenosi trójkąty wzorów, wzór → obliczenie i zadania', () => {
    expect(migrate({ wzory: { ok: 2, all: 3 }, 'wzor-obliczenie': { ok: 1, all: 1 }, zadania: { ok: 0, all: 2 } })).toEqual({
      napiecie: { ok: 2, all: 3 },
      rachunki: { ok: 1, all: 3 },
    })
  })
  it('nowe dane zostawia bez zmian', () => {
    const d = { skutki: { ok: 3, all: 4 }, quiz: { ok: 1, all: 1 } }
    expect(migrate(d)).toBe(d)
  })
})
