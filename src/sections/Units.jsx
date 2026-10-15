import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Callout, Panel, Section } from '@/components/app/kit.jsx'
import NumberTask from '../components/NumberTask.jsx'
import { PREFIXES, pick } from '../lib/physics.js'
import { FACTOR_TXT, UNIT_TASKS as GENERATORS } from '../lib/unitTasks.js'

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
