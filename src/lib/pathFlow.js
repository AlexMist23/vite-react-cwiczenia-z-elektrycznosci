// Geometria drogi prądu na schemacie: ścieżka z poleceń M / H / V / Z (jak w atrybucie d).

/** 'M40,110 V30 H300 Z' → punkty łamanej [[40,110],[40,30],[300,30],[40,110]]. */
export function parsePath(d) {
  const tokens = d.match(/[MHVZ]|-?\d+(?:\.\d+)?/g) ?? []
  const pts = []
  let start = null
  let cur = null
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t === 'M') {
      cur = [Number(tokens[++i]), Number(tokens[++i])]
      start = cur
      pts.push(cur)
    } else if (t === 'H') {
      cur = [Number(tokens[++i]), cur[1]]
      pts.push(cur)
    } else if (t === 'V') {
      cur = [cur[0], Number(tokens[++i])]
      pts.push(cur)
    } else if (t === 'Z') {
      cur = start
      pts.push(cur)
    }
  }
  return pts
}

/**
 * Łamana jako funkcja drogi: along(s) zwraca punkt w odległości s od początku
 * (s dowolne – zawija się dla pętli), kierunek ruchu (dx, dy) i kąt w stopniach.
 */
export function makeAlong(d) {
  const pts = parsePath(d)
  const segs = []
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1]
    const [x2, y2] = pts[i]
    const len = Math.hypot(x2 - x1, y2 - y1)
    if (len === 0) continue
    segs.push({ x1, y1, dx: (x2 - x1) / len, dy: (y2 - y1) / len, from: total, len })
    total += len
  }
  const along = (s) => {
    const u = ((s % total) + total) % total
    const seg = segs.find((g) => u < g.from + g.len) ?? segs[segs.length - 1]
    const k = u - seg.from
    return {
      x: seg.x1 + seg.dx * k,
      y: seg.y1 + seg.dy * k,
      dx: seg.dx,
      dy: seg.dy,
      angle: (Math.atan2(seg.dy, seg.dx) * 180) / Math.PI,
    }
  }
  return { along, length: total }
}
