// Ściąga: notatki z zeszytu, uporządkowane.
import { BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Expr, Formula, Lead, Section } from '@/components/app/kit.jsx'
import { cn } from '@/lib/utils'

function Note({ title, wide, children }) {
  return (
    <Card className={cn(wide && 'md:col-span-2')}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-2 text-[0.95rem] [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:pl-5">
        {children}
      </CardContent>
    </Card>
  )
}

function Pages({ children }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      <BookOpen className="size-3.5" />
      {children}
    </span>
  )
}

/** Karty ściągi – używane też w podsumowaniach lekcji. */
export const NOTES = {
  charges: () => (
    <Note title="Elektryzowanie ciał">
      <Pages>Podręcznik s. 16–28</Pages>
      <ul>
        <li>Ładunki: <b>dodatnie (+)</b> i <b>ujemne (−)</b>. Jednoimienne się odpychają, różnoimienne przyciągają.</li>
        <li>Atom: jądro (protony +, neutrony 0) i elektrony −.</li>
        <li>Elektryzowanie przez <b>potarcie</b> i przez <b>dotyk</b> – przemieszczają się tylko elektrony. Kto zyskał elektrony – ujemny, kto stracił – dodatni.</li>
        <li><b>1 C</b> ≈ ładunek 6 · 10¹⁸ elektronów; ładunek elementarny e = 1,6 · 10⁻¹⁹ C.</li>
        <li><b>Zasada zachowania ładunku</b>: ładunek nie powstaje ani nie znika.</li>
        <li><b>Siła elektryczna</b> jest tym większa, im mocniej ciała są naelektryzowane i im bliżej siebie są.</li>
        <li><b>Przez dotyk</b>: dotknięte ciało dostaje ładunek tego samego znaku. Elektroskop pokazuje, czy ciało jest naelektryzowane (listki się rozchylają).</li>
        <li><b>Przewodniki</b> (metale – elektrony swobodne) i <b>izolatory</b> (szkło, porcelana, guma, tworzywa). <b>Półprzewodniki</b> (krzem, german) – w jednych warunkach przewodzą, w innych nie.</li>
        <li><b>Indukcja</b>: zbliżone naelektryzowane ciało przesuwa ładunki w ciele obojętnym (w przewodniku elektrony swobodne, w izolatorze ładunki w cząsteczkach), dlatego przyciąga też ciała obojętne, np. skrawki papieru.</li>
      </ul>
    </Note>
  ),
  circuit: () => (
    <Note title="Obwód elektryczny">
      <p>
        <b>Prąd elektryczny</b> to uporządkowany ruch ładunków elektrycznych (w metalu – elektronów swobodnych).
      </p>
      <p>
        W metalach płyną elektrony (ujemne), a w cieczach i gazach także jony dodatnie – dlatego mówimy ogólnie o{' '}
        <b>ładunkach</b>.
      </p>
      <p>
        Najprostszy obwód: <b>źródło napięcia</b>, <b>przewody</b>, <b>wyłącznik</b> i{' '}
        <b>odbiornik</b> (np. żarówka). Prąd płynie tylko w obwodzie <b>zamkniętym</b>.
      </p>
      <p>
        <b>Zwarcie</b> – połączenie biegunów źródła przewodem z pominięciem odbiornika. Natężenie
        prądu bardzo rośnie, przewody się nagrzewają – to niebezpieczne.
      </p>
      <p>
        <b>Prąd jak woda</b>: bateria ↔ pompa, napięcie ↔ różnica poziomów wody, przewody ↔ rury,
        żarówka ↔ koło wodne. <Pages>s. 29–34</Pages>
      </p>
    </Note>
  ),
  effects: () => (
    <Note title="Skutki przepływu prądu">
      <ul>
        <li><b>cieplny</b> – grzejnik, czajnik, żelazko</li>
        <li><b>świetlny</b> – żarówka, latarka</li>
        <li><b>mechaniczny</b> – silnik, wentylator</li>
        <li><b>chemiczny</b> – ładowanie akumulatora, elektroliza</li>
        <li><b>dźwiękowy</b> – głośnik, dzwonek</li>
        <li><b>magnetyczny</b> – elektromagnes</li>
      </ul>
    </Note>
  ),
  direction: () => (
    <Note title="Kierunek prądu i ruch elektronów">
      <p className="text-current-flow">
        <b>Kierunek prądu (umowny):</b> od bieguna <b>„+”</b> do <b>„−”</b> (w obwodzie zewnętrznym).
      </p>
      <p className="text-electron">
        <b>Elektrony</b> poruszają się odwrotnie: od <b>„−”</b> do <b>„+”</b>.
      </p>
      <p className="text-sm text-muted-foreground">
        Symbol ogniwa: dłuższa cienka kreska = „+”, krótsza gruba = „−”.
      </p>
    </Note>
  ),
  media: () => (
    <Note title="Prąd w ciałach stałych, cieczach i gazach">
      <ul>
        <li><b>Ciała stałe (metale)</b> – uporządkowany ruch <b>elektronów</b>.</li>
        <li><b>Ciecze (elektrolity)</b> – uporządkowany ruch <b>jonów</b> (dodatnich i ujemnych).</li>
        <li><b>Gazy</b> – ruch <b>jonów oraz elektronów</b>.</li>
      </ul>

    </Note>
  ),
  voltage: () => (
    <Note title="Napięcie elektryczne">
      <p>
        Iloraz energii potrzebnej do przeniesienia ładunku z jednego miejsca obwodu do drugiego i
        wartości tego ładunku.
      </p>
      <Formula big>U = E / q</Formula>
      <p className="text-sm">
        U – napięcie [V, wolt], E – energia [J, dżul], q – ładunek [C, kulomb]
      </p>
      <Formula>1 V = 1 J / 1 C</Formula>
    </Note>
  ),
  current: () => (
    <Note title="Natężenie prądu">
      <p>
        Iloraz ładunku przepływającego przez przewodnik i czasu jego przepływu („szybkość przepływu
        ładunku”).
      </p>
      <Formula big>I = q / t</Formula>
      <p className="text-sm">I – natężenie [A, amper], q – ładunek [C], t – czas [s]</p>
      <Formula>1 A = 1 C / 1 s</Formula>
      <Formula>1 Ah = 1 A · 3600 s = 3600 C</Formula>
    </Note>
  ),
  work: () => (
    <Note title="Praca i moc prądu">
      <Formula big>W = U · I · t</Formula>
      <p className="text-sm">W – praca [J], U – napięcie [V], I – natężenie [A], t – czas [s]</p>
      <Formula>1 J = 1 V · 1 A · 1 s</Formula>
      <p className="text-sm">
        Skąd ten wzór? Z napięcia: E = U · q (energia to praca prądu, więc E = W), a ładunek q = I · t.
        Razem: <b>W = U · q = U · I · t</b>.
      </p>
      <Formula big>P = U · I</Formula>
      <p className="text-sm">P – moc [W, wat]</p>
      <Formula>1 W = 1 V · 1 A</Formula>
      <Formula>1 kWh = 1000 W · 3600 s = 3 600 000 J = 3,6 MJ</Formula>
      <p className="text-sm">
        Z wzoru na pracę: <b>I = W / (U · t)</b>.
      </p>
    </Note>
  ),
  prefixes: () => (
    <Note title="Przedrostki">
      <ul>
        <li><b>µ</b> mikro = 0,000001</li>
        <li><b>m</b> mili = 0,001</li>
        <li><b>k</b> kilo = 1000</li>
        <li><b>M</b> mega = 1 000 000</li>
        <li><b>G</b> giga = 1 000 000 000</li>
      </ul>
    </Note>
  ),
  worked: () => (
    <Note title="Zadania z zeszytu – rozwiązane" wide>
      <div className="grid w-full gap-3.5 sm:grid-cols-2">
        <div>
          <b>1.</b> Dane: U = 12 V, q = 20 C. Szukane: E.
          <Expr className="block">E = U · q = 12 V · 20 C = 240 J</Expr>
        </div>
        <div className="flex flex-col gap-1">
          <div>
            <b>2.</b> Dane: t = 3 s, I = 50 mA. Szukane: q.
          </div>
          <Expr className="block">I = 50 mA = 0,05 A</Expr>
          <Expr className="block">q = I · t = 0,05 A · 3 s = 0,15 C</Expr>

        </div>
        <div>
          <b>3.</b> Żarówka 21 W, napięcie 12 V. Szukane: I.
          <Expr className="block">I = P / U = 21 W : 12 V = 1,75 A</Expr>
        </div>
        <div>
          <b>4a.</b> I = 5 A, t = 1 h = 3600 s. Szukane: q.
          <Expr className="block">q = I · t = 5 A · 3600 s = 18 000 C</Expr>
        </div>
      </div>
    </Note>
  ),
}

export default function Notes() {
  return (
    <Section>
      <Lead>
        Najważniejsze informacje z notatek z lekcji.
      </Lead>

      <div className="grid gap-3.5 md:grid-cols-2">
        {Object.entries(NOTES).map(([k, N]) => (
          <N key={k} />
        ))}
      </div>
    </Section>
  )
}
