// Ściąga: notatki z zeszytu, uporządkowane i poprawione.

function Fix({ children }) {
  return (
    <div className="fix">
      <span className="fix-tag">Poprawka</span> {children}
    </div>
  )
}

export default function Notes() {
  return (
    <div className="section notes">
      <h2>Ściąga z lekcji</h2>
      <p className="lead">
        Najważniejsze informacje z notatek. Miejsca oznaczone jako <span className="fix-tag">Poprawka</span>{' '}
        uzupełniają lub prostują zapis z zeszytu.
      </p>

      <div className="notes-grid">
        <section className="card note">
          <h3>Obwód elektryczny</h3>
          <p>
            <b>Prąd elektryczny</b> to uporządkowany ruch ładunków elektrycznych.
          </p>
          <Fix>
            W zeszycie: „ruch ujemnych ładunków”. W metalach rzeczywiście płyną elektrony (ujemne), ale w
            cieczach i gazach płyną także jony dodatnie – dlatego mówimy ogólnie o <b>ładunkach</b>.
          </Fix>
          <p>
            Najprostszy obwód: <b>źródło napięcia</b>, <b>przewody</b>, <b>wyłącznik</b> i{' '}
            <b>odbiornik</b> (np. żarówka). Prąd płynie tylko w obwodzie <b>zamkniętym</b>.
          </p>
          <p>
            <b>Zwarcie</b> – połączenie biegunów źródła przewodem z pominięciem odbiornika. Natężenie
            prądu bardzo rośnie, przewody się nagrzewają – to niebezpieczne.
          </p>
        </section>

        <section className="card note">
          <h3>Skutki przepływu prądu</h3>
          <ul>
            <li><b>cieplny</b> – grzejnik, czajnik, żelazko</li>
            <li><b>świetlny</b> – żarówka, latarka</li>
            <li><b>mechaniczny</b> – silnik, wentylator</li>
            <li><b>chemiczny</b> – ładowanie akumulatora, elektroliza</li>
            <li><b>dźwiękowy</b> – głośnik, dzwonek</li>
            <li><b>magnetyczny</b> – elektromagnes</li>
          </ul>
        </section>

        <section className="card note">
          <h3>Kierunek prądu i ruch elektronów</h3>
          <p className="c-current">
            <b>Kierunek prądu (umowny):</b> od bieguna <b>„+”</b> do <b>„−”</b> (w obwodzie zewnętrznym).
          </p>
          <p className="c-electron">
            <b>Elektrony</b> poruszają się odwrotnie: od <b>„−”</b> do <b>„+”</b>.
          </p>
          <p className="small muted">
            Symbol ogniwa: dłuższa cienka kreska = „+”, krótsza gruba = „−”.
          </p>
        </section>

        <section className="card note">
          <h3>Prąd w ciałach stałych, cieczach i gazach</h3>
          <ul>
            <li><b>Ciała stałe (metale)</b> – uporządkowany ruch <b>elektronów</b>.</li>
            <li><b>Ciecze (elektrolity)</b> – uporządkowany ruch <b>jonów</b> (dodatnich i ujemnych).</li>
            <li><b>Gazy</b> – ruch <b>jonów oraz elektronów</b>.</li>
          </ul>
          <Fix>W zeszycie przy cieczach i gazach jest „jamów/jomów” – chodzi o <b>jony</b>.</Fix>
        </section>

        <section className="card note">
          <h3>Napięcie elektryczne</h3>
          <p>
            Iloraz energii potrzebnej do przeniesienia ładunku z jednego miejsca obwodu do drugiego i
            wartości tego ładunku.
          </p>
          <div className="formula big">U = E / q</div>
          <p className="small">
            U – napięcie [V, wolt], E – energia [J, dżul], q – ładunek [C, kulomb]
          </p>
          <div className="formula">1 V = 1 J / 1 C</div>
        </section>

        <section className="card note">
          <h3>Natężenie prądu</h3>
          <p>
            Iloraz ładunku przepływającego przez przewodnik i czasu jego przepływu („szybkość przepływu
            ładunku”).
          </p>
          <div className="formula big">I = q / t</div>
          <p className="small">I – natężenie [A, amper], q – ładunek [C], t – czas [s]</p>
          <div className="formula">1 A = 1 C / 1 s</div>
          <div className="formula">1 Ah = 1 A · 3600 s = 3600 C</div>
        </section>

        <section className="card note">
          <h3>Praca i moc prądu</h3>
          <div className="formula big">W = U · I · t</div>
          <p className="small">W – praca [J], U – napięcie [V], I – natężenie [A], t – czas [s]</p>
          <div className="formula">1 J = 1 V · 1 A · 1 s</div>
          <div className="formula big">P = U · I</div>
          <p className="small">P – moc [W, wat]</p>
          <div className="formula">1 W = 1 V · 1 A</div>
          <div className="formula">1 kWh = 1000 W · 3600 s = 3 600 000 J = 3,6 MJ</div>
          <Fix>
            W zeszycie zapisano „I = W / U·T” – czas oznaczamy małą literą <b>t</b>: I = W / (U · t).
          </Fix>
        </section>

        <section className="card note">
          <h3>Przedrostki</h3>
          <ul>
            <li><b>µ</b> mikro = 0,000001</li>
            <li><b>m</b> mili = 0,001</li>
            <li><b>k</b> kilo = 1000</li>
            <li><b>M</b> mega = 1 000 000</li>
            <li><b>G</b> giga = 1 000 000 000</li>
          </ul>
        </section>

        <section className="card note wide">
          <h3>Zadania z zeszytu – rozwiązane poprawnie</h3>
          <div className="worked">
            <div>
              <b>1.</b> Dane: U = 12 V, q = 20 C. Szukane: E.
              <div className="formula-inline">E = U · q = 12 V · 20 C = 240 J</div>
            </div>
            <div>
              <b>2.</b> Dane: t = 3 s, I = 50 mA. Szukane: q.
              <div className="formula-inline">I = 50 mA = 0,05 A</div>
              <div className="formula-inline">q = I · t = 0,05 A · 3 s = 0,15 C</div>
              <Fix>
                W zeszycie: 50 mA = 0,005 A – to błąd. 50 mA = <b>0,05 A</b>. Wynik 0,15 C jest poprawny
                właśnie dla 0,05 A (0,005 A dałoby 0,015 C).
              </Fix>
            </div>
            <div>
              <b>3.</b> Żarówka 21 W, napięcie 12 V. Szukane: I.
              <div className="formula-inline">I = P / U = 21 W : 12 V = 1,75 A</div>
            </div>
            <div>
              <b>4a.</b> I = 5 A, t = 1 h = 3600 s. Szukane: q.
              <div className="formula-inline">q = I · t = 5 A · 3600 s = 18 000 C</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
