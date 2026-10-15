// Wzory z lekcji jako dane: trójkąty (piramidy) i sprawdzanie wzorów ułożonych przez ucznia.

export const NAMES = {
  E: ['energia elektryczna', 'J (dżul)'],
  W: ['praca prądu', 'J (dżul)'],
  U: ['napięcie elektryczne', 'V (wolt)'],
  q: ['ładunek elektryczny', 'C (kulomb)'],
  I: ['natężenie prądu', 'A (amper)'],
  t: ['czas', 's (sekunda)'],
  P: ['moc', 'W (wat)'],
}

export const TRIANGLES = [
  {
    id: 'E',
    title: 'Napięcie',
    top: 'E',
    bottom: ['q', 'U'],
    formulas: { E: 'E = U · q', U: 'U = E / q', q: 'q = E / U' },
    unit: '1 V = 1 J / 1 C',
  },
  {
    id: 'q',
    title: 'Natężenie prądu',
    top: 'q',
    bottom: ['I', 't'],
    formulas: { q: 'q = I · t', I: 'I = q / t', t: 't = q / I' },
    unit: '1 A = 1 C / 1 s',
  },
  {
    id: 'P',
    title: 'Moc prądu',
    top: 'P',
    bottom: ['U', 'I'],
    formulas: { P: 'P = U · I', U: 'U = P / I', I: 'I = P / U' },
    unit: '1 W = 1 V · 1 A',
  },
  {
    id: 'W',
    title: 'Praca prądu',
    top: 'W',
    bottom: ['U', 'I', 't'],
    formulas: { W: 'W = U · I · t', U: 'U = W / (I · t)', I: 'I = W / (U · t)', t: 't = W / (U · I)' },
    unit: '1 J = 1 V · 1 A · 1 s',
  },
]

export const letters = (tri) => [tri.top, ...tri.bottom]

/** Prawa strona wzoru jako lista symboli: 'W / (I · t)' → ['W', '/', '(', 'I', '·', 't', ')']. */
export function tokenize(text) {
  return text.replace('*', '·').match(/[A-Za-z]+|[·/()]/g) ?? []
}

export const rhs = (formula) => tokenize(formula.split('=')[1])

/**
 * Oblicza wartość wzoru zapisanego symbolami (mnożenie „·”, dzielenie „/”, nawiasy).
 * Zwraca NaN, gdy zapis jest niepoprawny, np. „U · · I” albo „U I”.
 */
export function evaluate(tokens, values) {
  let i = 0
  const factor = () => {
    const tok = tokens[i++]
    if (tok === '(') {
      const v = expr()
      if (tokens[i++] !== ')') return NaN
      return v
    }
    if (tok in values) return values[tok]
    return NaN
  }
  const expr = () => {
    let v = factor()
    while (tokens[i] === '·' || tokens[i] === '/') {
      const op = tokens[i++]
      const r = factor()
      v = op === '·' ? v * r : v / r
    }
    return v
  }
  if (tokens.length === 0) return NaN
  const v = expr()
  return i === tokens.length ? v : NaN
}

/** Czy wzór ucznia jest równoważny poprawnemu (np. W / (U · I) i W / U / I to to samo). */
export function sameFormula(tokens, correct, vars) {
  for (let k = 0; k < 4; k++) {
    const values = Object.fromEntries(vars.map((v) => [v, 1.3 + Math.random() * 8.4]))
    const a = evaluate(tokens, values)
    const b = evaluate(correct, values)
    if (!Number.isFinite(a) || Math.abs(a - b) > Math.abs(b) * 1e-9) return false
  }
  return true
}

/** Czy piramida jest ułożona dobrze: zgadza się góra, a dół w dowolnej kolejności. */
export function samePyramid(cells, tri) {
  if (cells[0] !== tri.top) return false
  const a = [...cells.slice(1)].sort().join()
  const b = [...tri.bottom].sort().join()
  return a === b
}

/** Wielkości słowami (do zapisu wzoru wyrazami) i ich jednostki: [symbol, nazwa]. */
export const WORDS = { E: 'energia', W: 'praca', U: 'napięcie', q: 'ładunek', I: 'natężenie', t: 'czas', P: 'moc' }
export const UNIT = {
  E: ['J', 'dżul'],
  W: ['J', 'dżul'],
  U: ['V', 'wolt'],
  q: ['C', 'kulomb'],
  I: ['A', 'amper'],
  t: ['s', 'sekunda'],
  P: ['W', 'wat'],
}

/** Zamienia litery we wzorze według mapy, „/” na „:” (tak liczymy na kartce). */
function rewrite(formula, map) {
  const [left, right] = formula.split('=').map((s) => s.trim())
  const tokens = [left, '=', ...tokenize(right)]
  return tokens
    .map((t) => (t === '/' ? ':' : (map[t] ?? t)))
    .join(' ')
    .replace(/\( /g, '(')
    .replace(/ \)/g, ')')
}

/** 'U = E / q' → 'napięcie = energia : ładunek'. */
export const inWords = (formula) => rewrite(formula, WORDS)
/** 'U = E / q' → 'V = J : C'. */
export const inUnits = (formula) => rewrite(formula, Object.fromEntries(Object.entries(UNIT).map(([k, [s]]) => [k, s])))
/** 'U = E / q' → 'wolt = dżul : kulomb'. */
export const inUnitNames = (formula) => rewrite(formula, Object.fromEntries(Object.entries(UNIT).map(([k, [, n]]) => [k, n])))
