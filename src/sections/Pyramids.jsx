// Strony o piramidach wzorów: każda piramida osobno i karta ze wszystkimi wzorami.
import { Callout, Panel, Section } from '@/components/app/kit.jsx'
import PyramidGuide, { FormulaSheet } from '../components/PyramidGuide.jsx'

const IDS = { u: 'E', i: 'q', p: 'P', w: 'W' }

export default function Pyramids({ sub = 'u' }) {
  if (sub === 'karta') {
    return (
      <Section>
        <Panel>
          <FormulaSheet />
        </Panel>
        <Callout tone="info" title="Jak sprawdzić, czy wzór jest dobry?">
          <p>
            Podstaw jednostki zamiast liter. Jeśli po prawej stronie wyjdzie jednostka szukanej wielkości, wzór jest dobry –
            np. I = P : U daje W : V = A, czyli amper, tak jak powinno być dla natężenia.
          </p>
        </Callout>
      </Section>
    )
  }
  return (
    <Section>
      <PyramidGuide id={IDS[sub]} />
    </Section>
  )
}
