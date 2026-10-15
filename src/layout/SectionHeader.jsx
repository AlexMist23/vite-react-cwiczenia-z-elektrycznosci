import { useState } from 'react'
import { Ellipsis, RotateCcw } from 'lucide-react'
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
import { groupOf } from '@/data/sections.js'

/** Tytuł działu, pasek postępu i menu z zerowaniem postępów tego działu. */
export default function SectionHeader({ section, progress, onReset }) {
  const [confirm, setConfirm] = useState(false)
  const pct = progress ? Math.round((progress.ok / progress.all) * 100) : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--sec)/12 text-(--sec)">
          <section.icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold tracking-wide text-(--sec) uppercase">{groupOf(section).title}</div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{section.title}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Opcje działu">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" disabled={!progress} onSelect={() => setConfirm(true)}>
                <RotateCcw />
                Wyzeruj ten dział
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Progress value={pct} className="h-2 max-w-xs" indicatorClassName="bg-(--sec)" />
        <span className="shrink-0">
          {progress ? (
            <>
              <b className="text-foreground">{progress.ok}</b> poprawnych z {progress.all}
            </>
          ) : (
            'jeszcze brak odpowiedzi'
          )}
        </span>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wyzerować dział „{section.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Licznik poprawnych odpowiedzi w tym dziale wróci do zera, a ćwiczenia zaczną się od nowa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onReset}>
              Tak, wyzeruj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
