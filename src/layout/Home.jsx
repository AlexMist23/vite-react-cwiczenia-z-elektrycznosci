import { ArrowRight, BookOpen, Check, PencilLine, RotateCcw, Zap } from 'lucide-react'
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
import { GROUPS, LESSONS, groupOf, isStepped, lessonNo, resolveRoute, stepHash } from '@/data/lessons.jsx'

const countDone = (l, done) => l.steps.filter((s) => done[stepHash(l, s)]).length

/** Liczebniki do „3 ćwiczenia”, „5 ćwiczeń”. */
const plural = (n, one, few, many) => (n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many)

export default function Home({ data, done, last, onResetAll }) {
  const any = Object.keys(data).length > 0 || Object.keys(done).length > 0
  const cont = last ? resolveRoute(last) : null

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#1d1660] via-primary to-[#7048e8] p-6 text-primary-foreground shadow-sm md:p-8">
        <Zap className="absolute -top-4 -right-4 size-40 rotate-12 text-volt opacity-20" aria-hidden />
        <h1 className="relative text-2xl font-bold tracking-tight md:text-4xl">Ćwiczenia z prądu elektrycznego</h1>
        <p className="relative mt-2 max-w-2xl text-primary-foreground/85">
          Lekcje krok po kroku: najpierw krótkie wyjaśnienie, potem ćwiczenie, na koniec podsumowanie. Ładunki, obwody,
          kierunek prądu, napięcie, natężenie, praca i moc.
        </p>
      </div>

      {cont?.lesson && (
        <Card style={{ '--g': groupOf(cont.lesson).color }} className="flex-row items-center gap-4 px-4 md:px-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-g/12 text-g">
            <cont.lesson.icon className="size-6" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Kontynuuj naukę</span>
            <span className="truncate font-semibold">
              {cont.lesson.title}
              {isStepped(cont.lesson) && <span className="font-normal text-muted-foreground"> · {cont.step.title}</span>}
            </span>
            {isStepped(cont.lesson) && (
              <Progress
                value={(countDone(cont.lesson, done) / cont.lesson.steps.length) * 100}
                className="h-1.5 max-w-60"
                indicatorClassName="bg-g"
              />
            )}
          </div>
          <Button asChild size="lg">
            <a href={`#${stepHash(cont.lesson, cont.step)}`}>
              <span className="hidden sm:inline">Wróć</span>
              <ArrowRight data-icon="inline-end" />
            </a>
          </Button>
        </Card>
      )}

      {GROUPS.map((g) => (
        <section key={g.id} style={{ '--g': g.color }} className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <span className="size-2.5 rounded-full bg-g" />
            {g.title}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {LESSONS.filter((l) => l.group === g.id).map((l) => (
              <LessonTile key={l.id} l={l} p={data[l.id]} finished={countDone(l, done)} />
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
              <AlertDialogDescription>
                Znikną ukończone kroki i liczniki poprawnych odpowiedzi we wszystkich lekcjach.
              </AlertDialogDescription>
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

function LessonTile({ l, p, finished }) {
  const stepped = isStepped(l)
  const theory = l.steps.filter((s) => s.kind === 't').length
  const practice = l.steps.filter((s) => s.kind === 'c' || s.kind === 'lab').length
  const no = lessonNo(l)
  const complete = stepped && finished === l.steps.length
  return (
    <a href={`#${l.id}`} className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Card className="h-full gap-3 transition-[box-shadow,translate] group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-g/50">
        <CardHeader className="grid-cols-[auto_1fr] gap-x-3">
          <span className="row-span-2 flex size-11 items-center justify-center rounded-xl bg-g/12 text-g">
            <l.icon className="size-5.5" />
          </span>
          <CardTitle className="font-semibold">
            {no > 0 && <span className="text-muted-foreground">{no}. </span>}
            {l.title}
          </CardTitle>
          <CardDescription>{l.desc}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-2.5">
          {stepped && (
            <div className="flex flex-wrap gap-1.5">
              {theory > 0 && (
                <Badge variant="secondary">
                  <BookOpen data-icon="inline-start" />
                  {theory} {plural(theory, 'wyjaśnienie', 'wyjaśnienia', 'wyjaśnień')}
                </Badge>
              )}
              <Badge variant="secondary">
                <PencilLine data-icon="inline-start" />
                {practice} {plural(practice, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')}
              </Badge>
            </div>
          )}
          {stepped ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Progress value={(finished / l.steps.length) * 100} className="h-1.5" indicatorClassName="bg-g" />
              <span className="flex shrink-0 items-center gap-1 tabular-nums">
                {complete && <Check className="size-3.5 text-success" />}
                {finished}/{l.steps.length} kroków
              </span>
            </div>
          ) : (
            p && (
              <span className="text-xs text-muted-foreground">
                {p.ok} poprawnych z {p.all}
              </span>
            )
          )}
        </CardContent>
      </Card>
    </a>
  )
}
