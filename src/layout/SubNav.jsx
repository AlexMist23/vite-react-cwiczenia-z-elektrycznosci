import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KINDS } from '@/data/sections.js'

/** Zakładki podstron działu: najpierw wyjaśnienia, potem ćwiczenia. Adres strony zostaje w hashu. */
export default function SubNav({ section, sub }) {
  return (
    <Tabs value={sub.id} onValueChange={(id) => (window.location.hash = `${section.id}/${id}`)}>
      <TabsList
        variant="line"
        aria-label={`Części działu ${section.title}`}
        className="h-auto! w-full justify-start overflow-x-auto border-b pb-1"
      >
        {section.subs.map((u) => {
          const Kind = KINDS[u.kind].icon
          return (
            <TabsTrigger key={u.id} value={u.id} asChild className="flex-none px-2.5 py-1.5 data-active:text-sec after:bg-sec!">
              <a href={`#${section.id}/${u.id}`} title={KINDS[u.kind].label}>
                <Kind data-icon="inline-start" />
                {u.title}
              </a>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
