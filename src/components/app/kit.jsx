import { BookOpen, Check, CircleCheck, CircleX, Info, OctagonAlert, TriangleAlert, X } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/* Wspólne klocki ćwiczeń – żeby każdy dział wyglądał i działał tak samo. */

/** Pionowy stos bloków treści działu. */
export function Section({ className, ...props }) {
  return <div className={cn('flex flex-col gap-4', className)} {...props} />
}

/** Wstęp pod nagłówkiem. */
export function Lead({ className, ...props }) {
  return <p className={cn('max-w-3xl text-muted-foreground', className)} {...props} />
}

/** Karta z treścią; opcjonalnie tytuł i wynik w nagłówku. */
export function Panel({ title, score, className, contentClassName, children, ...props }) {
  return (
    <Card className={className} {...props}>
      {(title || score) && (
        <CardHeader>
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {score && <CardAction>{score}</CardAction>}
        </CardHeader>
      )}
      <CardContent className={cn('flex flex-col gap-4', contentClassName)}>{children}</CardContent>
    </Card>
  )
}

/** Licznik „Wynik: 3 / 5”. */
export function Score({ ok, all, children }) {
  return (
    <span className="text-sm whitespace-nowrap text-muted-foreground">
      {children ?? (
        <>
          Wynik: <b className="text-foreground tabular-nums">{ok}</b> / {all}
        </>
      )}
    </span>
  )
}

/** Treść pytania. */
export function Question({ className, ...props }) {
  return <p className={cn('text-lg font-semibold text-balance', className)} {...props} />
}

const COLS = {
  one: '',
  two: 'sm:grid-cols-2',
  three: 'sm:grid-cols-3',
  four: 'grid-cols-2 sm:grid-cols-4',
}

/** Siatka odpowiedzi. */
export function Answers({ cols = 'one', className, ...props }) {
  return <div className={cn('grid gap-2.5', COLS[cols], className)} {...props} />
}

/** Przycisk odpowiedzi; state: 'right' | 'wrong' | undefined. */
export function Answer({ state, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'flex min-h-12 items-center gap-2.5 rounded-xl border-2 bg-card px-3.5 py-2.5 text-left font-medium transition-colors',
        'outline-none focus-visible:ring-3 focus-visible:ring-ring/50 enabled:hover:border-primary enabled:hover:bg-primary-soft disabled:cursor-default',
        state === 'right' && 'border-success bg-success-soft',
        state === 'wrong' && 'border-destructive bg-destructive-soft',
        className,
      )}
      {...props}
    >
      {children}
      {state === 'right' && <Check className="ml-auto size-5 shrink-0 text-success" aria-label="dobrze" />}
      {state === 'wrong' && <X className="ml-auto size-5 shrink-0 text-destructive" aria-label="źle" />}
    </button>
  )
}

/** Mały przycisk wyboru w kształcie pigułki; state jak w Answer, active – zaznaczony. */
export function Chip({ state, active, className, ...props }) {
  return (
    <button
      type="button"
      data-active={active || undefined}
      className={cn(
        'inline-flex min-h-9 items-center gap-1.5 rounded-full border bg-card px-3.5 py-1 text-sm font-medium transition-colors [&_svg]:size-4 [&_svg]:shrink-0',
        'outline-none focus-visible:ring-3 focus-visible:ring-ring/50 enabled:hover:border-primary enabled:hover:bg-primary-soft disabled:cursor-default',
        'data-active:border-primary data-active:bg-primary data-active:text-primary-foreground',
        state === 'right' && 'border-success bg-success text-white',
        state === 'wrong' && 'border-destructive bg-destructive text-white',
        !state && !active && 'disabled:opacity-45',
        className,
      )}
      {...props}
    />
  )
}

const FEEDBACK = {
  ok: { variant: 'success', icon: CircleCheck },
  bad: { variant: 'error', icon: CircleX },
  info: { variant: 'info', icon: Info },
}

/** Informacja zwrotna po odpowiedzi: tone 'ok' | 'bad' | 'info'. */
export function Feedback({ tone = 'info', className, children }) {
  const { variant, icon: Icon } = FEEDBACK[tone]
  return (
    <Alert variant={variant} className={cn('px-3.5 py-3 text-[0.95rem]', className)}>
      <Icon />
      <div className="flex min-w-0 flex-col items-start gap-2">{children}</div>
    </Alert>
  )
}

const CALLOUT = {
  info: { variant: 'info', icon: Info },
  warn: { variant: 'warn', icon: TriangleAlert },
  danger: { variant: 'error', icon: OctagonAlert },
}

/** Ramka z ważną informacją: tone 'info' | 'warn' | 'danger'. */
export function Callout({ tone = 'info', title, className, children }) {
  const { variant, icon: Icon } = CALLOUT[tone]
  return (
    <Alert variant={variant} className={cn('px-4 py-3 text-[0.95rem]', className)}>
      <Icon />
      {title && <AlertTitle className="font-semibold">{title}</AlertTitle>}
      <div className={cn('flex min-w-0 flex-col gap-2', title && 'col-start-2')}>{children}</div>
    </Alert>
  )
}

/** Ocena odpowiedzi w tekście (ikonę daje już Feedback). */
export function Verdict({ ok, children }) {
  return <b className={ok ? 'text-success' : 'text-destructive'}>{children}</b>
}

/** Wzór w ramce (np. U = E/q); big – duży, w kolorze akcentu. */
export function Formula({ big, className, ...props }) {
  return (
    <span
      className={cn(
        'inline-block w-fit rounded-md bg-secondary px-3 py-1 font-formula text-xl italic',
        big && 'text-2xl font-bold text-primary md:text-[1.7rem]',
        className,
      )}
      {...props}
    />
  )
}

/** Wzór lub obliczenie w tekście. */
export function Expr({ className, ...props }) {
  return <span className={cn('font-formula text-[1.1rem]', className)} {...props} />
}

/** Odnośnik do stron podręcznika „To jest fizyka 8” (Nowa Era). */
export function BookRef({ pages, topics }) {
  return (
    <div className="flex w-fit items-start gap-2 rounded-xl border border-dashed bg-card px-3.5 py-1.5 text-sm">
      <BookOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span>
        Podręcznik „To jest fizyka 8”, <b>s. {pages}</b>
        {topics && <span className="text-muted-foreground"> · {topics}</span>}
      </span>
    </div>
  )
}

/** Kropki postępu w serii pytań: 'ok' | 'bad' | undefined, cur – bieżące. */
export function ScoreDots({ items, cur }) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-hidden>
      {items.map((s, i) => (
        <span
          key={i}
          className={cn(
            'size-3.5 rounded-full border-2 bg-secondary transition-transform',
            s === 'ok' && 'border-success bg-success',
            s === 'bad' && 'border-destructive bg-destructive',
            i === cur && 'scale-125 border-primary',
          )}
        />
      ))}
    </div>
  )
}

/** Odczyt wielkości: mała etykieta, duża liczba, opcjonalny podpis. */
export function Readout({ label, value, note, className }) {
  return (
    <div className={cn('flex flex-col rounded-lg bg-secondary px-2.5 py-2', className)}>
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <b className="text-lg tabular-nums md:text-xl">{value}</b>
      {note && <small className="text-xs text-muted-foreground">{note}</small>}
    </div>
  )
}

const BOX = { md: 'size-11 [&_svg]:size-5.5', lg: 'size-12 [&_svg]:size-6.5', sm: 'size-9 [&_svg]:size-4.5' }

/** Ikona w zaokrąglonym kwadracie w kolorze działu (--sec). */
export function IconBox({ icon: Icon, size = 'md', className }) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-xl bg-sec/12 text-sec', BOX[size], className)}>
      <Icon />
    </span>
  )
}

/** Legenda animacji obwodu: strzałka prądu i kropka elektronu. */
export function FlowLegend() {
  return (
    <div className="flex flex-wrap gap-x-4.5 gap-y-1 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <i className="size-3.5 bg-current-flow [clip-path:polygon(0_0,100%_50%,0_100%)]" /> kierunek prądu (umowny): od „+” do „−”
      </span>
      <span className="flex items-center gap-1.5">
        <i className="size-3.5 rounded-full bg-electron" /> elektrony: od „−” do „+”
      </span>
    </div>
  )
}

/** Duży klocek do układania wzoru lub piramidy; letter – litera wielkości fizycznej. */
export function TileBtn({ letter, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'grid min-h-13 min-w-13 place-items-center rounded-xl border-2 bg-card px-3 py-1 text-2xl transition-colors enabled:hover:border-sec enabled:hover:bg-primary-soft disabled:opacity-35',
        letter && 'font-formula font-extrabold text-primary italic',
        className,
      )}
      {...props}
    />
  )
}

/** Nagłówek kroku w zadaniu wieloetapowym. */
export function StepTitle({ className, ...props }) {
  return <h3 className={cn('mt-2 text-base font-semibold text-sec', className)} {...props} />
}

/** Pole na odpowiedź liczbową z jednostką obok. */
export function NumberInput({ unit, className, ...props }) {
  return (
    <span className="flex min-w-0 flex-[1_1_160px] items-center gap-2 sm:flex-none">
      <Input inputMode="decimal" className={cn('h-11 w-full text-lg sm:w-50 md:text-lg', className)} {...props} />
      {unit && <span className="min-w-7.5 text-lg font-bold">{unit}</span>}
    </span>
  )
}

/** Dane i szukane obok siebie (jak w zeszycie). */
export function GivenSought({ given, sought, className }) {
  return (
    <div className={cn('grid gap-2.5 rounded-lg bg-secondary px-3.5 py-2.5 sm:grid-cols-2', className)}>
      <div>
        <div className="font-bold text-primary">Dane:</div>
        {given}
      </div>
      <div>
        <div className="font-bold text-primary">Szukane:</div>
        {sought}
      </div>
    </div>
  )
}
