# Ćwiczenia z elektryczności – fizyka, klasa 8

Interaktywna aplikacja (Vite + React) do nauki o prądzie elektrycznym. Cała treść po polsku.

## Działy
- **Elektryzowanie i ładunki** – balon i sweter, przyciąganie/odpychanie, przewodniki i izolatory, indukcja.
- **Zagadki obwodowe** – „Czy żarówka świeci?” i analogia prądu do wody.
- **Symulator obwodu** – źródło napięcia, wyłącznik, 1–3 żarówki, amperomierz, zwarcie; animacja kierunku prądu (od „+” do „−”) i ruchu elektronów (od „−” do „+”), liczniki U, I, P, t, q, W oraz wyzwania.
- **Kierunek prądu** – zgadnij kierunek prądu / elektronów na losowym schemacie.
- **Symbole** – rozpoznawanie symboli elementów obwodu.
- **Ciała stałe, ciecze, gazy** – animacje nośników ładunku i klasyfikacja przykładów.
- **Skutki prądu** – cieplny, świetlny, mechaniczny, chemiczny, dźwiękowy, magnetyczny.
- **Trójkąty wzorów** – U = E/q, I = q/t, P = U·I, W = U·I·t.
- **Jednostki i przedrostki** – µ, m, k, M, G, kWh, Ah, h → s.
- **Zadania obliczeniowe** – losowe zadania z rozwiązaniem „Dane / Szukane / Rozwiązanie”.
- **Sprawdzian** – quiz z oceną wg progów procentowych z lekcji.
- **Ściąga** – notatki z zeszytu, uporządkowane i poprawione (np. 50 mA = 0,05 A).

## Wygląd i kod
- **Tailwind CSS v4** + **shadcn/ui** (komponenty w `src/components/ui/`, dodawane przez `npx shadcn@latest add …`).
- Ikony: **lucide-react** – bez emoji w interfejsie.
- Wspólne klocki ćwiczeń (odpowiedzi, informacja zwrotna, wzory, liczniki): `src/components/app/kit.jsx`.
- Układ strony (pasek boczny, nagłówek, strona startowa): `src/layout/`; lista działów: `src/data/sections.js`.
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
