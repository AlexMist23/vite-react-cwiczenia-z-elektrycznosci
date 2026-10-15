import { useState } from 'react'
import { ArrowRight, BookOpen, PencilLine, RotateCcw, Zap } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GROUPS, SECTIONS, groupOf, resolveRoute } from '@/data/sections.js'

const pct = (p) => (p ? Math.round((p.ok / p.all) * 100) : 0)

export default function Home({ data, last, onResetAll }) {
  const any = Object.keys(data).length > 0
  const cont = last ? resolveRoute(last) : null

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#1d1660] via-primary to-[#7048e8] p-6 text-primary-foreground shadow-sm md:p-8">
        <Zap className="absolute -top-4 -right-4 size-40 rotate-12 text-volt opacity-20" aria-hidden />
        <h1 className="relative text-2xl font-bold tracking-tight md:text-4xl">Ćwiczenia z prądu elektrycznego</h1>
        <p className="relative mt-2 max-w-2xl text-primary-foreground/85">
          Ładunki, obwody, kierunek prądu i ruch elektronów, napięcie, natężenie, praca i moc. Wybierz ćwiczenie –
          każde możesz powtarzać dowolnie wiele razy.
        </p>
      </div>

      {cont?.section && (
        <Card style={{ '--g': groupOf(cont.section).color }} className="flex-row items-center gap-4 px-4 md:px-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-(--g)/12 text-(--g)">
            <cont.section.icon className="size-6" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Kontynuuj naukę</span>
            <span className="truncate font-semibold">
              {cont.section.title}
              {cont.sub && <span className="font-normal text-muted-foreground"> · {cont.sub.title}</span>}
            </span>
            {data[cont.section.id] && (
              <Progress value={pct(data[cont.section.id])} className="h-1.5 max-w-60" indicatorClassName="bg-(--g)" />
            )}
          </div>
          <Button asChild size="lg">
            <a href={`#${last}`}>
              <span className="hidden sm:inline">Wróć</span>
              <ArrowRight data-icon="inline-end" />
            </a>
          </Button>
        </Card>
      )}

      {GROUPS.map((g) => (
        <section key={g.id} style={{ '--g': g.color }} className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <span className="size-2.5 rounded-full bg-(--g)" />
            {g.title}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {SECTIONS.filter((s) => s.group === g.id).map((s) => (
              <SectionTile key={s.id} s={s} p={data[s.id]} />
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" disabled={!any}>
              <RotateCcw data-icon="inline-start" />
              Wyzeruj wszystkie postępy
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Wyzerować wszystkie postępy?</AlertDialogTitle>
              <AlertDialogDescription>Liczniki poprawnych odpowiedzi we wszystkich działach wrócą do zera.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onResetAll}>
                Tak, wyzeruj wszystko
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function SectionTile({ s, p }) {
  const theory = s.subs?.filter((u) => u.kind === 't').length ?? 0
  const practice = s.subs?.filter((u) => u.kind === 'c').length ?? 0
  return (
    <a href={`#${s.id}`} className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Card className="h-full gap-3 transition-[box-shadow,translate] group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-(--g)/50">
        <CardHeader className="grid-cols-[auto_1fr] gap-x-3">
          <span className="row-span-2 flex size-11 items-center justify-center rounded-xl bg-(--g)/12 text-(--g)">
            <s.icon className="size-5.5" />
          </span>
          <CardTitle className="font-semibold">{s.title}</CardTitle>
          <CardDescription>{s.desc}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-2.5">
          {s.subs && (
            <div className="flex gap-1.5">
              {theory > 0 && (
                <Badge variant="secondary">
                  <BookOpen data-icon="inline-start" />
                  {theory} {theory === 1 ? 'wyjaśnienie' : 'wyjaśnienia'}
                </Badge>
              )}
              <Badge variant="secondary">
                <PencilLine data-icon="inline-start" />
                {practice} {practice === 1 ? 'ćwiczenie' : 'ćwiczenia'}
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Progress value={pct(p)} className="h-1.5" indicatorClassName="bg-(--g)" />
            <span className="shrink-0 tabular-nums">{p ? `${p.ok}/${p.all}` : '—'}</span>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
