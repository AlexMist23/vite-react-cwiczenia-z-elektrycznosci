import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Callout, Panel, Section } from '@/components/app/kit.jsx'
import NumberTask from '../components/NumberTask.jsx'
import { PREFIXES, fmt, pick } from '../lib/physics.js'

const PREF = {
  G: 1e9, M: 1e6, k: 1e3, '': 1, m: 1e-3, µ: 1e-6,
}
const FACTOR_TXT = {
  G: '1 000 000 000', M: '1 000 000', k: '1000', m: '0,001', µ: '0,000001',
}

// Zamiana z przedrostkiem na jednostkę podstawową lub odwrotnie.
function prefixTask() {
  const unit = pick(['A', 'V', 'W', 'J', 'C'])
  const choices = {
    A: ['m', 'µ', 'k'], V: ['k', 'm', 'M'], W: ['k', 'M', 'G', 'm'], J: ['k', 'M'], C: ['m', 'µ', 'k'],
  }[unit]
  const p = pick(choices)
  const toBase = Math.random() < 0.6
  const nice = {
    m: [5, 20, 50, 150, 250, 400, 750, 1200],
    µ: [3, 40, 250, 500, 1500],
    k: [0.5, 2, 3.5, 15, 230, 400],
    M: [1.2, 3, 3.6, 15, 600],
    G: [1, 2.5, 4],
  }[p]
  const v = pick(nice)
  if (toBase) {
    const ans = v * PREF[p]
    return {
      q: `Zamień ${fmt(v)} ${p}${unit} na ${unit}.`,
      answer: ans,
      unit,
      explain: `1 ${p}${unit} = ${FACTOR_TXT[p]} ${unit}, więc ${fmt(v)} ${p}${unit} = ${fmt(v)} · ${FACTOR_TXT[p]} ${unit} = ${fmt(ans)} ${unit}.`,
    }
  }
  const base = v * PREF[p]
  return {
    q: `Zamień ${fmt(base)} ${unit} na ${p}${unit}.`,
    answer: v,
    unit: p + unit,
    explain: `1 ${p}${unit} = ${FACTOR_TXT[p]} ${unit}, więc dzielimy: ${fmt(base)} : ${FACTOR_TXT[p]} = ${fmt(v)} ${p}${unit}.`,
  }
}

function timeTask() {
  if (Math.random() < 0.5) {
    const h = pick([0.5, 1, 2, 3, 5, 8, 24])
    return {
      q: `Ile sekund to ${fmt(h)} h?`,
      answer: h * 3600,
      unit: 's',
      explain: `1 h = 60 min = 60 · 60 s = 3600 s, więc ${fmt(h)} h = ${fmt(h)} · 3600 s = ${fmt(h * 3600)} s.`,
    }
  }
  const m = pick([2, 5, 10, 15, 30, 45])
  return {
    q: `Ile sekund to ${m} min?`,
    answer: m * 60,
    unit: 's',
    explain: `1 min = 60 s, więc ${m} min = ${m} · 60 s = ${m * 60} s.`,
  }
}

function kwhTask() {
  const r = Math.random()
  if (r < 0.4) {
    const k = pick([1, 2, 0.5, 3, 10])
    return {
      q: `Ile dżuli to ${fmt(k)} kWh?`,
      answer: k * 3.6e6,
      unit: 'J',
      explain: `1 kWh = 1000 W · 3600 s = 3 600 000 J, więc ${fmt(k)} kWh = ${fmt(k * 3.6e6)} J.`,
    }
  }
  if (r < 0.7) {
    const k = pick([1, 2, 5, 0.5])
    return {
      q: `Zamień ${fmt(k * 3.6)} MJ na kWh.`,
      answer: k,
      unit: 'kWh',
      explain: `1 kWh = 3,6 MJ, więc ${fmt(k * 3.6)} MJ : 3,6 = ${fmt(k)} kWh.`,
    }
  }
  const P = pick([100, 500, 1000, 2000, 2500])
  const h = pick([1, 2, 3, 4])
  return {
    q: `Urządzenie o mocy ${P} W pracuje przez ${h} h. Ile kWh energii zużyje?`,
    answer: (P / 1000) * h,
    unit: 'kWh',
    explain: `${P} W = ${fmt(P / 1000)} kW; W = P · t = ${fmt(P / 1000)} kW · ${h} h = ${fmt((P / 1000) * h)} kWh.`,
  }
}

function ahTask() {
  if (Math.random() < 0.5) {
    const ah = pick([1, 2, 5, 45, 60, 0.5])
    return {
      q: `Akumulator ma pojemność ${fmt(ah)} Ah. Ile to kulombów?`,
      answer: ah * 3600,
      unit: 'C',
      explain: `1 Ah = 1 A · 3600 s = 3600 C, więc ${fmt(ah)} Ah = ${fmt(ah * 3600)} C.`,
    }
  }
  const mah = pick([1000, 2000, 3000, 4500, 5000])
  return {
    q: `Akumulator telefonu ma ${mah} mAh. Ile to kulombów?`,
    answer: mah * 3.6,
    unit: 'C',
    explain: `${mah} mAh = ${fmt(mah / 1000)} Ah, a 1 Ah = 3600 C, więc ${fmt(mah / 1000)} · 3600 = ${fmt(mah * 3.6)} C.`,
  }
}

const GENERATORS = [
  ['Przedrostki', prefixTask],
  ['Czas', timeTask],
  ['kWh', kwhTask],
  ['Ah', ahTask],
]

export default function Units({ record, sub = 'przedrostki' }) {
  const [mode, setMode] = useState('mix')
  const gen = () => (mode === 'mix' ? pick(GENERATORS)[1] : GENERATORS.find((g) => g[0] === mode)[1])()

  return (
    <Section>
      {sub === 'przedrostki' && (
        <>
          <Panel title="Przedrostki">
            <Table className="text-base">
              <TableHeader>
                <TableRow>
                  <TableHead>Przedrostek</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Mnożnik</TableHead>
                  <TableHead>Przykład</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PREFIXES.filter((p) => p.symbol).map((p) => {
                  const u = p.symbol === 'k' || p.symbol === 'M' || p.symbol === 'G' ? 'W' : 'A'
                  return (
                    <TableRow key={p.symbol}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell className="font-bold">{p.symbol}</TableCell>
                      <TableCell className="tabular-nums">{FACTOR_TXT[p.symbol]}</TableCell>
                      <TableCell>
                        1 {p.symbol}
                        {u} = {FACTOR_TXT[p.symbol]} {u}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <div className="grid gap-1">
              <div><b>1 Ah</b> (amperogodzina) = 1 A · 3600 s = <b>3600 C</b></div>
              <div><b>1 kWh</b> (kilowatogodzina) = 1000 W · 3600 s = <b>3 600 000 J</b> = 3,6 MJ</div>
              <div><b>1 h</b> = 60 min = <b>3600 s</b></div>
            </div>
          </Panel>

          <Callout tone="warn" title="Uwaga na pułapkę!">
            <p>
              50 mA = 50 · 0,001 A = <b>0,05 A</b> (a nie 0,005 A). Zamieniając mili na jednostkę podstawową,
              przesuwamy przecinek o <b>3 miejsca</b> w lewo: 50 → 5,0 → 0,50 → 0,050.
            </p>
          </Callout>
        </>
      )}
      {sub === 'cwiczenie' && (
        <>
          <ToggleGroup
            type="single"
            variant="outline"
            value={mode}
            onValueChange={(v) => v && setMode(v)}
            aria-label="Rodzaj zadań"
            className="flex-wrap"
          >
            {['mix', ...GENERATORS.map((g) => g[0])].map((m) => (
              <ToggleGroupItem key={m} value={m} className="px-3.5">
                {m === 'mix' ? 'Wszystko' : m}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <NumberTask key={mode} generate={gen} onResult={(ok) => record('jednostki', ok)} />
        </>
      )}
    </Section>
  )
}
