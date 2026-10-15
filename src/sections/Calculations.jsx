// Jak rozwiązywać zadania obliczeniowe + zadania z zeszytu rozwiązane krok po kroku.
import { Badge } from '@/components/ui/badge'
import { Callout, Expr, GivenSought, Panel, Section } from '@/components/app/kit.jsx'

const METHOD = [
  ['Dane i szukane', 'Wypisz wszystkie liczby z treści razem z jednostkami. Zapisz, czego szukasz (np. I = ?).'],
  ['Zamień jednostki', 'Na podstawowe: mA → A (· 0,001), kV → V (· 1000), kW → W (· 1000), min → s (· 60), h → s (· 3600).'],
  ['Dobierz wzór', 'Znajdź piramidę, w której są wszystkie wielkości z zadania. Zakryj szukaną – obok siebie mnożysz, jedna nad drugą dzielisz.'],
  ['Podstaw liczby', 'Wpisz liczby razem z jednostkami, np. I = 21 W : 12 V.'],
  ['Policz i sprawdź jednostkę', 'Jednostka wyniku musi pasować do szukanej (V · A = W, C : s = A, J : C = V).'],
  ['Odpowiedź', 'Napisz zdanie z wynikiem i jednostką.'],
]

function Method() {
  return (
    <>
      <Panel title="Sześć kroków do każdego zadania" contentClassName="gap-3">
        <ol className="flex flex-col gap-3">
          {METHOD.map(([title, text], i) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sec font-bold text-white">{i + 1}</span>
              <span>
                <b>{title}.</b> {text}
              </span>
            </li>
          ))}
        </ol>
      </Panel>
      <Callout tone="warn" title="Najczęstsze pułapki">
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            <b>50 mA = 0,05 A</b>, a nie 0,005 A – przy „mili” przecinek przesuwamy o 3 miejsca w lewo.
          </li>
          <li>
            <b>1 h = 3600 s</b>, a nie 60 s. Godziny zamieniaj na sekundy, chyba że liczysz w kWh.
          </li>
          <li>
            <b>kWh to energia (praca)</b>, a nie moc: 1 kWh = 3 600 000 J.
          </li>
          <li>
            Wypisuj tylko potrzebne dane – czasem w treści jest liczba, której nie używasz (np. napięcie, gdy liczysz ładunek z
            I · t).
          </li>
        </ul>
      </Callout>
      <Callout tone="info" title="Zadania „na dwa kroki”">
        <p>
          Gdy żaden wzór nie łączy od razu danych z szukaną, policz najpierw wielkość pośrednią. Np. znasz q, t i U, a
          szukasz mocy: <b>1)</b> I = q / t, <b>2)</b> P = U · I.
        </p>
      </Callout>
    </>
  )
}

/** Zadanie z zeszytu rozpisane jak w zeszycie. */
function Worked({ no, title, given, sought, lines, answer }) {
  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <Badge variant="secondary">zad. {no}</Badge>
          {title}
        </span>
      }
      contentClassName="gap-2.5"
    >
      <GivenSought
        given={given.map((g) => (
          <Expr key={g} className="block">
            {g}
          </Expr>
        ))}
        sought={<Expr className="block">{sought}</Expr>}
      />
      <div className="flex flex-col gap-1">
        {lines.map((l) => (
          <Expr key={l} className="block">
            {l}
          </Expr>
        ))}
      </div>
      <p>
        <b>Odp.:</b> {answer}
      </p>
    </Panel>
  )
}

function Notebook() {
  return (
    <>
      <Worked
        no="1"
        title="Energia z napięcia i ładunku"
        given={['U = 12 V', 'q = 20 C']}
        sought="E = ?"
        lines={['U = E / q  ⇒  E = U · q', 'E = 12 V · 20 C = 240 J']}
        answer="Energia wynosi 240 J."
      />
      <Worked
        no="2"
        title="Ładunek z natężenia i czasu"
        given={['t = 3 s', 'I = 50 mA = 0,05 A']}
        sought="q = ?"
        lines={['I = q / t  ⇒  q = I · t', 'q = 0,05 A · 3 s = 0,15 C']}
        answer="Przepłynął ładunek 0,15 C."
      />
      <Worked
        no="2a"
        title="Natężenie z mocy i napięcia"
        given={['P = 21 W', 'U = 12 V']}
        sought="I = ?"
        lines={['P = U · I  ⇒  I = P / U', 'I = 21 W : 12 V = 1,75 A']}
        answer="Płynie prąd 1,75 A."
      />
      <Worked
        no="2b"
        title="Żarówka 75 W w gniazdku 230 V"
        given={['P = 75 W', 'U = 230 V']}
        sought="I = ?"
        lines={['I = P / U', 'I = 75 W : 230 V ≈ 0,33 A']}
        answer="Płynie prąd około 0,33 A."
      />
      <Worked
        no="4a"
        title="Ładunek w ciągu godziny"
        given={['I = 5 A', 'U = 230 V', 't = 1 h = 3600 s']}
        sought="q = ?"
        lines={['q = I · t', 'q = 5 A · 3600 s = 18 000 C']}
        answer="Przepłynął ładunek 18 000 C. (Napięcie nie było tu potrzebne.)"
      />
      <Worked
        no="4b"
        title="Praca prądu w tym samym urządzeniu (do treningu)"
        given={['U = 230 V', 'I = 5 A', 't = 3600 s']}
        sought="W = ?"
        lines={['W = U · I · t', 'W = 230 V · 5 A · 3600 s = 4 140 000 J', '4 140 000 J : 3 600 000 J = 1,15 kWh']}
        answer="Prąd wykonał pracę 4 140 000 J, czyli 1,15 kWh."
      />
    </>
  )
}

export default function Calculations({ sub = 'metoda' }) {
  return (
    <Section>
      {sub === 'metoda' && <Method />}
      {sub === 'zeszyt' && <Notebook />}
    </Section>
  )
}
