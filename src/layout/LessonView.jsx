import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Ellipsis, RotateCcw } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { BookRef, IconBox } from '@/components/app/kit.jsx'
import { cn } from '@/lib/utils'
import { ANSWERS_TO_FINISH, KINDS, PAGES, groupOf, isStepped, lessonNo, stepHash } from '@/data/lessons.jsx'

/**
 * Lekcja: nagłówek, pasek kroków, treść bieżącego kroku i przyciski „Wstecz / Dalej”.
 * Ćwiczenia wołają record(dowolnyKlucz, ok) – zapisujemy wynik pod lekcją i liczymy odpowiedzi w kroku.
 */
export default function LessonView({ lesson, step, progress, done, record, markDone, onReset, resetCount }) {
  const key = stepHash(lesson, step)
  const counts = useRef({})
  const stepped = isStepped(lesson)

  // wyjaśnienia, doświadczenia i podsumowania są „zrobione” po otwarciu
  useEffect(() => {
    if (KINDS[step.kind].auto) markDone(key)
  }, [key, step.kind, markDone])

  const rec = useCallback(
    (_, ok) => {
      record(lesson.id, ok)
      const n = (counts.current[key] ?? 0) + 1
      counts.current[key] = n
      if (n >= ANSWERS_TO_FINISH) markDone(key)
    },
    [record, markDone, lesson.id, key],
  )

  const View = step.view
  return (
    <div className="flex flex-col gap-6">
      <LessonHeader lesson={lesson} progress={progress} done={done} onReset={onReset} />
      {stepped && <StepBar lesson={lesson} step={step} done={done} />}
      <View key={`${key}-${resetCount}`} {...step.props} record={rec} />
      <StepFooter lesson={lesson} step={step} finished={!!done[key]} />
    </div>
  )
}

function LessonHeader({ lesson, progress, done, onReset }) {
  const [confirm, setConfirm] = useState(false)
  const stepped = isStepped(lesson)
  const finished = lesson.steps.filter((s) => done[stepHash(lesson, s)]).length
  const no = lessonNo(lesson)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <IconBox icon={lesson.icon} />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold tracking-wide text-sec uppercase">
            {no > 0 ? `Lekcja ${no} · ` : ''}
            {groupOf(lesson).title}
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{lesson.title}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Opcje lekcji">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" disabled={!progress && !finished} onSelect={() => setConfirm(true)}>
                <RotateCcw />
                Zacznij lekcję od nowa
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {(stepped || progress) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
          {stepped && (
            <>
              <Progress
                value={(finished / lesson.steps.length) * 100}
                className="h-2 max-w-xs min-w-40 flex-1"
                indicatorClassName="bg-sec"
              />
              <span>
                <b className="text-foreground">{finished}</b> z {lesson.steps.length} kroków
              </span>
            </>
          )}
          {progress && (
            <span>
              {stepped && '· '}
              <b className="text-foreground">{progress.ok}</b> poprawnych z {progress.all}
            </span>
          )}
        </div>
      )}
      {lesson.pages && <BookRef pages={lesson.pages} />}

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zacząć lekcję „{lesson.title}” od nowa?</AlertDialogTitle>
            <AlertDialogDescription>
              Znikną znaczniki ukończonych kroków i licznik poprawnych odpowiedzi w tej lekcji.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onReset}>
              Tak, od nowa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** Kroki lekcji jako rząd ikon (ukończone – z ptaszkiem) i nazwa bieżącego kroku. */
function StepBar({ lesson, step, done }) {
  const idx = lesson.steps.indexOf(step)
  const kind = KINDS[step.kind]
  return (
    <nav aria-label="Kroki lekcji" className="flex flex-col gap-3 border-y py-4">
      <ol className="flex flex-wrap items-center gap-1.5">
        {lesson.steps.map((s, i) => {
          const isDone = done[stepHash(lesson, s)]
          const Icon = isDone ? Check : KINDS[s.kind].icon
          const current = s === step
          return (
            <li key={s.id} className="flex items-center gap-1.5">
              {i > 0 && <span className={cn('hidden h-0.5 w-3 rounded-full sm:block', isDone ? 'bg-sec/50' : 'bg-border')} />}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`#${stepHash(lesson, s)}`}
                    aria-label={`Krok ${i + 1}: ${s.title}${isDone ? ' (ukończony)' : ''}`}
                    aria-current={current ? 'step' : undefined}
                    className={cn(
                      'grid size-8 place-items-center rounded-full border-2 transition-colors sm:size-9 [&_svg]:size-4',
                      isDone ? 'border-sec bg-sec text-white' : 'border-border bg-card text-muted-foreground hover:border-sec/60',
                      current && 'ring-3 ring-sec/30',
                      current && !isDone && 'border-sec text-sec',
                    )}
                  >
                    <Icon />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  {i + 1}. {s.title}
                </TooltipContent>
              </Tooltip>
            </li>
          )
        })}
      </ol>
      <div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <kind.icon className="size-4 text-sec" />
          Krok {idx + 1} z {lesson.steps.length} · {kind.label}
        </div>
        <h2 className="mt-1 text-xl md:text-2xl">{step.title}</h2>
      </div>
    </nav>
  )
}

/** „Wstecz” i „Dalej” – przez wszystkie kroki wszystkich lekcji po kolei. */
function StepFooter({ lesson, step, finished }) {
  const idx = PAGES.findIndex((p) => p.l === lesson && p.s === step)
  const prev = idx > 0 ? PAGES[idx - 1] : null
  const next = idx < PAGES.length - 1 ? PAGES[idx + 1] : null
  const nextLabel = next && (next.l === lesson ? next.s.title : `Następna lekcja: ${next.l.title}`)

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5" aria-label="Kolejne kroki">
      {prev ? (
        <Button asChild variant="ghost" size="lg">
          <a href={`#${prev.hash}`}>
            <ArrowLeft data-icon="inline-start" />
            Wstecz
          </a>
        </Button>
      ) : (
        <span />
      )}
      {next && (
        <Button asChild size="lg" variant={finished ? 'default' : 'outline'} className="max-w-full">
          <a href={`#${next.hash}`}>
            <span className="truncate">
              {next.l === lesson && <span className="hidden sm:inline">Dalej: </span>}
              {nextLabel}
            </span>
            <ArrowRight data-icon="inline-end" />
          </a>
        </Button>
      )}
    </nav>
  )
}
