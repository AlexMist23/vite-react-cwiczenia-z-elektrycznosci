import { useCallback, useEffect, useState } from 'react'

const KEY = 'prad-postepy-v1'
const STEPS_KEY = 'prad-kroki-v1'
const LAST_KEY = 'prad-ostatnio-v1'

// dawne działy, które weszły do innych lekcji (pozostałe lekcje mają te same identyfikatory co działy)
const MIGRATION = {
  symbole: 'obwod',
  zagadki: 'obwod',
  wzory: 'napiecie',
  'wzor-obliczenie': 'rachunki',
  zadania: 'rachunki',
}

/** Przenosi wyniki z dawnych działów do lekcji (sumując). Czysta funkcja – testowana osobno. */
export function migrate(data) {
  if (!Object.keys(data).some((k) => k in MIGRATION)) return data
  const out = {}
  for (const [k, v] of Object.entries(data)) {
    const to = MIGRATION[k] ?? k
    const s = out[to] ?? { ok: 0, all: 0 }
    out[to] = { ok: s.ok + v.ok, all: s.all + v.all }
  }
  return out
}

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? {}
  } catch {
    return {}
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* brak dostępu do pamięci przeglądarki – trudno */
  }
}

/**
 * Postępy ucznia: dla każdej lekcji liczba poprawnych i wszystkich odpowiedzi.
 * Zapisywane w przeglądarce (localStorage), działa też bez niego.
 */
export function useProgress() {
  const [data, setData] = useState(() => migrate(read(KEY)))

  useEffect(() => write(KEY, data), [data])

  const record = useCallback((lesson, ok) => {
    setData((d) => {
      const s = d[lesson] ?? { ok: 0, all: 0 }
      return { ...d, [lesson]: { ok: s.ok + (ok ? 1 : 0), all: s.all + 1 } }
    })
  }, [])

  const reset = useCallback(() => setData({}), [])

  /** Zeruje postępy tylko jednej lekcji. */
  const resetSection = useCallback((lesson) => {
    setData((d) => {
      const { [lesson]: _, ...rest } = d
      return rest
    })
  }, [])

  return { data, record, reset, resetSection }
}

/** Ukończone kroki lekcji: { 'lekcja/krok': true }. */
export function useSteps() {
  const [done, setDone] = useState(() => read(STEPS_KEY))

  useEffect(() => write(STEPS_KEY, done), [done])

  const markDone = useCallback((key) => setDone((d) => (d[key] ? d : { ...d, [key]: true })), [])
  const resetLesson = useCallback(
    (lesson) => setDone((d) => Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith(`${lesson}/`)))),
    [],
  )
  const resetAll = useCallback(() => setDone({}), [])

  return { done, markDone, resetLesson, resetAll }
}

/** Ostatnio otwarta strona (hash bez „#”) – do karty „Kontynuuj naukę”. Zerowanie postępów jej nie kasuje. */
export function loadLastPage() {
  try {
    return localStorage.getItem(LAST_KEY)
  } catch {
    return null
  }
}

export function saveLastPage(hash) {
  try {
    localStorage.setItem(LAST_KEY, hash)
  } catch {
    /* brak dostępu do pamięci przeglądarki – trudno */
  }
}
