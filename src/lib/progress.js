import { useCallback, useEffect, useState } from 'react'

const KEY = 'prad-postepy-v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {}
  } catch {
    return {}
  }
}

/**
 * Postępy ucznia: dla każdego działu liczba poprawnych i wszystkich odpowiedzi.
 * Zapisywane w przeglądarce (localStorage), działa też bez niego.
 */
export function useProgress() {
  const [data, setData] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* brak dostępu do pamięci przeglądarki – trudno */
    }
  }, [data])

  const record = useCallback((section, ok) => {
    setData((d) => {
      const s = d[section] ?? { ok: 0, all: 0 }
      return { ...d, [section]: { ok: s.ok + (ok ? 1 : 0), all: s.all + 1 } }
    })
  }, [])

  const reset = useCallback(() => setData({}), [])

  return { data, record, reset }
}
