import { describe, expect, it } from 'vitest'
import { makeAlong, parsePath } from './pathFlow.js'

describe('droga prądu po schemacie', () => {
  it('rozkłada ścieżkę na punkty', () => {
    expect(parsePath('M40,110 V30 H300 V190 H40 Z')).toEqual([[40, 110], [40, 30], [300, 30], [300, 190], [40, 190], [40, 110]])
  })
  it('liczy długość pętli i punkty na niej', () => {
    const { along, length } = makeAlong('M40,110 V30 H300 V190 H40 Z')
    expect(length).toBe(80 + 260 + 160 + 260 + 80)
    expect(along(0)).toMatchObject({ x: 40, y: 110, dx: 0, dy: -1 }) // od „+” w górę
    expect(along(80 + 100)).toMatchObject({ x: 140, y: 30, dx: 1, dy: 0 })
    expect(along(length + 10)).toMatchObject({ x: 40, y: 100 }) // pętla się zawija
    expect(along(-10)).toMatchObject({ x: 40, y: 120 }) // i w drugą stronę (elektrony)
  })
  it('obsługuje ścieżki otwarte (gałąź)', () => {
    const { along, length } = makeAlong('M300,60 H370 V160 H300')
    expect(length).toBe(70 + 100 + 70)
    expect(along(70 + 50)).toMatchObject({ x: 370, y: 110, dx: 0, dy: 1 })
  })
})
