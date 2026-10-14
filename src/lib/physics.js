// Pomocnicze funkcje fizyczne i liczbowe.

export const PREFIXES = [
  { symbol: 'G', name: 'giga', factor: 1e9 },
  { symbol: 'M', name: 'mega', factor: 1e6 },
  { symbol: 'k', name: 'kilo', factor: 1e3 },
  { symbol: '', name: '(brak)', factor: 1 },
  { symbol: 'm', name: 'mili', factor: 1e-3 },
  { symbol: 'µ', name: 'mikro', factor: 1e-6 },
]

/** Zaokrągla, żeby pozbyć się błędów zmiennoprzecinkowych (0.1+0.2). */
export function clean(x, digits = 10) {
  if (!Number.isFinite(x)) return x
  return Number.parseFloat(x.toPrecision(digits))
}

/** Liczba w polskim zapisie: przecinek dziesiętny, spacje w tysiącach. */
export function fmt(x, maxDigits = 6) {
  if (!Number.isFinite(x)) return String(x)
  const v = clean(x)
  return v.toLocaleString('pl-PL', {
    maximumFractionDigits: maxDigits,
    useGrouping: Math.abs(v) >= 10000,
  }).replace(/ /g, ' ')
}

/** Odczytuje liczbę wpisaną przez ucznia: "0,05", "3 600 000", "1.5", "3,6e6". */
export function parseNum(text) {
  if (text == null) return NaN
  const t = String(text).trim().replace(/[\s ]/g, '').replace(',', '.')
  if (t === '' || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) return NaN
  return Number(t)
}

/** Czy odpowiedź jest poprawna (tolerancja względna, domyślnie 1%). */
export function isClose(answer, expected, rel = 0.01) {
  if (!Number.isFinite(answer)) return false
  if (expected === 0) return Math.abs(answer) < 1e-9
  return Math.abs(answer - expected) <= Math.abs(expected) * rel
}

/** Ocena wg progów procentowych z zeszytu. */
export function gradeFor(percent) {
  if (percent >= 95) return { grade: 6, name: 'celujący' }
  if (percent >= 85) return { grade: 5, name: 'bardzo dobry' }
  if (percent >= 70) return { grade: 4, name: 'dobry' }
  if (percent >= 50) return { grade: 3, name: 'dostateczny' }
  if (percent >= 30) return { grade: 2, name: 'dopuszczający' }
  return { grade: 1, name: 'niedostateczny' }
}

export const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1))
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Wzory z lekcji
export const energy = (U, q) => U * q // E = U·q  (z U = E/q)
export const voltage = (E, q) => E / q // U = E/q
export const charge = (I, t) => I * t // q = I·t  (z I = q/t)
export const current = (q, t) => q / t // I = q/t
export const work = (U, I, t) => U * I * t // W = U·I·t
export const power = (U, I) => U * I // P = U·I

export const J_PER_KWH = 1000 * 3600 // 1 kWh = 3 600 000 J
export const C_PER_AH = 3600 // 1 Ah = 3600 C
