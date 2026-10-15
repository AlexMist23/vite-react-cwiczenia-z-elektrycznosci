import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Lead, Section } from '@/components/app/kit.jsx'
import NumberTask from '../components/NumberTask.jsx'
import { pick } from '../lib/physics.js'
import { PROBLEMS } from '../lib/problems.js'

const ALL = 'Wszystkie'

/** topics – tematy zadań do wyboru (w lekcji tylko jej tematy); bez niego wszystkie. */
export default function Problems({ record, topics }) {
  const own = topics ?? [...new Set(PROBLEMS.map((p) => p.topic))]
  const TOPICS = [ALL, ...own]
  const [topic, setTopic] = useState(ALL)
  const gen = () => pick(PROBLEMS.filter((p) => (topic === ALL ? own.includes(p.topic) : p.topic === topic))).make()

  return (
    <Section>
      <Lead>Wypisz dane i szukane, zamień jednostki, dobierz wzór i policz. Ułamki wpisuj z przecinkiem (np. 0,15).</Lead>
      <ToggleGroup
        type="single"
        variant="outline"
        value={topic}
        onValueChange={(v) => v && setTopic(v)}
        aria-label="Temat zadań"
        className="flex-wrap"
      >
        {TOPICS.map((t) => (
          <ToggleGroupItem key={t} value={t} className="px-3.5">
            {t}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <NumberTask key={topic} generate={gen} onResult={(ok) => record('zadania', ok)} />
    </Section>
  )
}
