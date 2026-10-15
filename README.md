# Ćwiczenia z elektryczności – fizyka, klasa 8

Interaktywna aplikacja (Vite + React) do nauki o prądzie elektrycznym. Cała treść po polsku.

## Lekcje
Każda lekcja to kroki po kolei: krótkie **wyjaśnienie** → **ćwiczenie** → kolejne wyjaśnienie → … → **podsumowanie**.
Ćwiczenia zaczynają się od pytania – wyjaśnienie pojawia się dopiero po odpowiedzi. Krok teorii jest „ukończony” po otwarciu,
ćwiczenie – po 3 odpowiedziach; po krokach można skakać dowolnie.

1. **Elektryzowanie ciał** – ładunki i atom, balon i sweter, przyciąganie/odpychanie, przewodniki i izolatory (z układem okresowym), indukcja.
2. **Obwód elektryczny** – prąd i elementy obwodu, symbole, zwarcie, „Czy żarówka świeci?”, prąd jak woda, symulator obwodu.
3. **Kierunek prądu** – prąd od „+” do „−”, elektrony od „−” do „+”.
4. **Ciała stałe, ciecze, gazy** – nośniki ładunku w różnych ośrodkach.
5. **Skutki prądu** – cieplny, świetlny, mechaniczny, chemiczny, dźwiękowy, magnetyczny.
6. **Napięcie i natężenie** – U = E/q, I = q/t, piramidy, zadania.
7. **Praca i moc prądu** – W = U·I·t, P = U·I, kWh, zadania.
8. **Jednostki i przedrostki** – µ, m, k, M, G, kWh, Ah, h → s.
9. **Wzory w praktyce** – piramidy z pamięci, wzory z klocków, wzór → obliczenie, zadania mieszane.

Powtórka: **Sprawdzian** (quiz z oceną) i **Ściąga** (notatki z zeszytu, uporządkowane i poprawione).

## Wygląd i kod
- **Tailwind CSS v4** + **shadcn/ui** (komponenty w `src/components/ui/`, dodawane przez `npx shadcn@latest add …`).
- Ikony: **lucide-react** – bez emoji w interfejsie.
- Wspólne klocki ćwiczeń (odpowiedzi, informacja zwrotna, wzory, liczniki): `src/components/app/kit.jsx`.
- Lekcje i ich kroki: `src/data/lessons.jsx`; widok lekcji (pasek kroków, „Dalej”): `src/layout/LessonView.jsx`.
- Układ strony (pasek boczny, nagłówek, strona startowa): `src/layout/`.
- Kolory motywu: `src/index.css`; style rysunków SVG (obwody, ładunki, piramidy): `src/styles/drawings.css`.

## Uruchomienie
```bash
npm install
npm run dev          # serwer deweloperski
npm test             # testy wzorów i formatowania liczb
npm run build        # wersja produkcyjna w dist/
npm run build:single # jeden plik HTML w dist-single/
```

## Strona w internecie
Każdy push do `main` buduje aplikację i publikuje ją na GitHub Pages (`.github/workflows/deploy.yml`).
W ustawieniach repozytorium: **Settings → Pages → Source: GitHub Actions**.

## Podręcznik
Ćwiczenia są powiązane ze stronami podręcznika „To jest fizyka 8” (Nowa Era), s. 16–35.
Treść podręcznika nie jest kopiowana do aplikacji – zadania są napisane własnymi słowami.
