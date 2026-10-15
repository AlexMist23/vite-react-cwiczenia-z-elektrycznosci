// Wyjaśnienia wielkości: napięcie, natężenie, praca i moc prądu (własnymi słowami, na podstawie notatek z lekcji).
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Callout, Expr, Formula, Panel, Section } from '@/components/app/kit.jsx'

function Examples({ head, rows }) {
  return (
    <Table className="text-base">
      <TableHeader>
        <TableRow>
          <TableHead>{head[0]}</TableHead>
          <TableHead className="text-right">{head[1]}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([a, b]) => (
          <TableRow key={a}>
            <TableCell className="whitespace-normal">{a}</TableCell>
            <TableCell className="text-right font-semibold whitespace-nowrap tabular-nums">{b}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/** Wzór z opisem liter. */
function Definition({ formula, legend, unit }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Formula big>{formula}</Formula>
      <p className="text-sm text-muted-foreground">{legend}</p>
      {unit && <Formula>{unit}</Formula>}
    </div>
  )
}

/** Przykład rozwiązany krok po kroku. */
function Worked({ task, lines }) {
  return (
    <Panel title="Przykład" contentClassName="gap-1.5">
      <p>{task}</p>
      {lines.map((l) => (
        <Expr key={l} className="block">
          {l}
        </Expr>
      ))}
    </Panel>
  )
}

function Voltage() {
  return (
    <>
      <Panel contentClassName="gap-3">
        <p>
          Źródło napięcia (np. bateria) daje ładunkom <b>energię</b>, a ładunki oddają ją w odbiorniku – żarówka świeci,
          silnik się kręci. <b>Napięcie</b> mówi, ile energii przypada na każdy kulomb ładunku przeniesionego między
          dwoma punktami obwodu.
        </p>
        <Definition
          formula="U = E / q"
          legend="U – napięcie [V, wolt], E – energia [J, dżul], q – ładunek [C, kulomb]"
          unit="1 V = 1 J / 1 C"
        />
        <p>
          Napięcie <b>1 V</b> oznacza, że każdy kulomb ładunku dostaje (albo oddaje) <b>1 J</b> energii.
        </p>
      </Panel>
      <Panel title="Ile to wolt?">
        <Examples
          head={['Źródło', 'Napięcie']}
          rows={[
            ['bateria „paluszek”', '1,5 V'],
            ['bateria płaska', '4,5 V'],
            ['akumulator samochodowy', '12 V'],
            ['gniazdko w domu', '230 V'],
            ['linia wysokiego napięcia', 'nawet 400 000 V'],
          ]}
        />
      </Panel>
      <Callout tone="info" title="Woltomierz">
        <p>
          Napięcie mierzymy <b>woltomierzem</b>. Podłączamy go <b>równolegle</b> – do dwóch końców odbiornika albo do
          biegunów źródła.
        </p>
      </Callout>
      <Worked
        task="Między biegunami źródła o napięciu 12 V przepłynął ładunek 20 C. Ile energii przeniósł?"
        lines={['E = U · q', 'E = 12 V · 20 C = 240 J']}
      />
    </>
  )
}

function Current() {
  return (
    <>
      <Panel contentClassName="gap-3">
        <p>
          <b>Natężenie prądu</b> mówi, jak duży ładunek przepływa przez przewód w ciągu jednej sekundy – to „szybkość
          przepływu ładunku”.
        </p>
        <Definition
          formula="I = q / t"
          legend="I – natężenie [A, amper], q – ładunek [C], t – czas [s]"
          unit="1 A = 1 C / 1 s"
        />
        <p>
          Natężenie <b>1 A</b> oznacza, że przez przewód w każdej sekundzie przepływa ładunek <b>1 C</b>.
        </p>
      </Panel>
      <Panel title="Ile to amper?">
        <Examples
          head={['Urządzenie', 'Natężenie']}
          rows={[
            ['dioda LED', 'ok. 20 mA = 0,02 A'],
            ['żarówka w latarce', 'ok. 0,3 A'],
            ['czajnik elektryczny', 'ok. 9 A'],
            ['rozrusznik samochodu', 'ponad 100 A'],
          ]}
        />
      </Panel>
      <Callout tone="info" title="Amperomierz">
        <p>
          Natężenie mierzymy <b>amperomierzem</b>. Włączamy go <b>szeregowo</b> – w obwód, tak żeby cały prąd przez
          niego przepływał.
        </p>
      </Callout>
      <Callout tone="warn" title="Ampery razy godziny">
        <p>
          Na akumulatorach pisze się pojemność w <b>Ah</b> (amperogodzinach) albo mAh: <b>1 Ah = 1 A · 3600 s = 3600 C</b>.
          To po prostu ładunek, jaki akumulator może oddać.
        </p>
      </Callout>
      <Worked
        task="Przez przewodnik w czasie 3 s płynął prąd 50 mA. Jaki ładunek przepłynął?"
        lines={['I = 50 mA = 0,05 A', 'q = I · t', 'q = 0,05 A · 3 s = 0,15 C']}
      />
    </>
  )
}

function WorkPower() {
  return (
    <>
      <Panel contentClassName="gap-3">
        <p>
          <b>Praca prądu</b> to energia, którą prąd oddaje w odbiorniku (na ciepło, światło, ruch). Zależy od napięcia,
          natężenia i od tego, jak długo płynie prąd.
        </p>
        <Definition
          formula="W = U · I · t"
          legend="W – praca [J], U – napięcie [V], I – natężenie [A], t – czas [s]"
          unit="1 J = 1 V · 1 A · 1 s"
        />
        <p className="text-sm text-muted-foreground">
          Skąd ten wzór? Z napięcia: E = U · q, a ładunek q = I · t. Razem: W = U · q = U · I · t.
        </p>
      </Panel>
      <Panel contentClassName="gap-3">
        <p>
          <b>Moc</b> mówi, jak szybko prąd wykonuje pracę – ile dżuli w każdej sekundzie. Urządzenie o większej mocy w
          tym samym czasie zużywa więcej energii.
        </p>
        <Definition formula="P = U · I" legend="P – moc [W, wat], U – napięcie [V], I – natężenie [A]" unit="1 W = 1 V · 1 A" />
      </Panel>
      <Callout tone="info" title="Rachunek za prąd: kilowatogodziny">
        <p>
          Licznik w domu liczy energię w <b>kWh</b>: <b>1 kWh = 1000 W · 3600 s = 3 600 000 J</b>. Czajnik o mocy 2 kW
          włączony na 6 minut (0,1 h) zużywa 2 kW · 0,1 h = 0,2 kWh.
        </p>
      </Callout>
      <Worked
        task="Żarówka samochodowa ma moc 21 W i jest zasilana napięciem 12 V. Jakie natężenie prądu przez nią płynie?"
        lines={['P = U · I, więc I = P / U', 'I = 21 W : 12 V = 1,75 A']}
      />
    </>
  )
}

export default function Quantities({ sub = 'napiecie' }) {
  return (
    <Section>
      {sub === 'napiecie' && <Voltage />}
      {sub === 'natezenie' && <Current />}
      {sub === 'praca' && <WorkPower />}
    </Section>
  )
}
