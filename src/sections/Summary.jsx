import { Lead, Section } from '@/components/app/kit.jsx'
import { NOTES } from './Notes.jsx'

/** Podsumowanie lekcji: odpowiednie karty ze ściągi. */
export default function Summary({ notes }) {
  return (
    <Section>
      <Lead>Najważniejsze z tej lekcji w pigułce. Te same notatki znajdziesz w Ściądze.</Lead>
      <div className="grid gap-3.5 md:grid-cols-2 [&>*:only-child]:md:col-span-2">
        {notes.map((k) => {
          const Note = NOTES[k]
          return <Note key={k} />
        })}
      </div>
    </Section>
  )
}
