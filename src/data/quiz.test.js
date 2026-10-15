import { describe, expect, it } from 'vitest'
import { QUIZ } from './quiz.js'
import { HINTS } from './quizHints.js'

describe('pytania sprawdzianu', () => {
  it.each(QUIZ.map((x) => [x.q, x]))('%s – 4 różne odpowiedzi, wyjaśnienie i wskazówka', (_, x) => {
    expect(x.a).toHaveLength(4)
    expect(new Set(x.a).size).toBe(4)
    expect(x.why).toBeTruthy()
    expect(HINTS[x.q]).toBeTruthy()
  })
  it('pytania się nie powtarzają', () => {
    expect(new Set(QUIZ.map((x) => x.q)).size).toBe(QUIZ.length)
  })
})
