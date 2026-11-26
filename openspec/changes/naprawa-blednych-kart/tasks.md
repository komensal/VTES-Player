# Tasks

## 1. Weryfikacja stanu wyjściowego (rozwiązanie Open Questions)

- [ ] 1.1 Zweryfikować które z 253 kart bez handlera (z sekcji 1 pelna_analiza_bledow.md) mają już handler w naszym src/cards/effects/cards.ts — porównać ID kart z listy z handlerami w kodzie; wynik: lista kart realmente wymagających implementacji. Weryfikacja: lista zapisana w tasks.md lub osobnym pliku, każda karta oznaczona jako "ma handler" lub "brak handlera".
- [ ] 1.2 Zweryfikować które z 7 niezgodności z sekcji 2 pelna_analiza_bledow.md występują w naszym kodzie — sprawdzić cards.ts pod kątem brakujących efektów (maneuver, additionalStrike, intercept) dla wymienionych kart; wynik: lista niezgodności do naprawy lub udokumentowania jako fałszywe alarmy. Weryfikacja: każda z 7 kart oznaczona jako "naprawione", "fałszywy alarm" lub "do naprawy".
- [ ] 1.3 Znaleźć i udokumentować 2 zweryfikowane błędy z gry z sekcji 3 pelna_analiza_bledow.md — znaleźć w kodzie lub dokumentacji dokładne opisy błędów; wynik: opis obu błędów i ich lokalizacja. Weryfikacja: oba błędy opisane z lokalizacją w kodzie.

## 2. Fala 1: Karty biblioteki bez handlera — grupa mechanizmu 1

- [ ] 2.1 Wybrać pierwszą grupę kart biblioteki sharing wspólny mechanizm/primitive z listy zweryfikowanej w zadaniu 1.1. Weryfikacja: grupa zdefiniowana, karty mają wspólny mechanizm.
- [ ] 2.2 Zaimplementować handlery dla kart z grupy 1 w cards.ts. Weryfikacja: każda karta ma handler, `npm run typecheck` przechodzi.
- [ ] 2.3 Dodać testy scenariuszowe w tests/cards/ dla każdej karty z grupy 1 (pozytywny + negatywny przypadek). Weryfikacja: testy przechodzą (`npm test`).
- [ ] 2.4 Flip kart w config/supported.json, uruchomić npm run cards:registry, bump wersji w src/version.ts i package.json o 0.0.1, zregenerować docs/card-status-by-set.md. Weryfikacja: `npm run cards:registry` przechodzi, wersja bumpowana, dokumentacja zaktualizowana.

## 3. Fale 2-N: Kolejne grupy kart biblioteki

- [ ] 3.1 Dla każdej kolejnej grupy kart biblioteki sharing wspólny mechanizm: powtórzyć kroki 2.1-2.4 (wybór grupy, implementacja, testy, registry, bump wersji, dokumentacja). Weryfikacja: każda grupa zakończona zielonymi testami i zaktualizowaną dokumentacją.

## 4. Karty krypty bez handlera

- [ ] 4.1 Zweryfikować które karty krypty z listy z zadania 1.1 nie mają handlera w cards.ts i drukują zdolność. Weryfikacja: lista kart krypty wymagających handlera.
- [ ] 4.2 Dla każdej grupy kart krypty sharing wspólny mechanizm: zaimplementować handlery, dodać testy scenariuszowe, flip w supported.json, cards:registry, bump wersji, regeneracja dokumentacji. Weryfikacja: każda karta krypty ma handler lub jest uznana za nie wymagającą (brak wydrukowanej zdolności), testy zielone.

## 5. Niezgodności handlerów (sekcja 2 pelna_analiza_bledow.md)

- [ ] 5.1 Dla każdej z 7 kart z niezgodnością: albo dodać brakujący efekt do bloku effects w cards.ts, albo udokumentować jako fałszywy alarm z uzasadnieniem. Weryfikacja: każda z 7 kart rozpatrzona.
- [ ] 5.2 Dodać testy regresyjne dla każdej naprawionej niezgodności. Weryfikacja: testy przechodzą (`npm test`).

## 6. Błędy z gry (sekcja 3 pelna_analiza_bledow.md)

- [ ] 6.1 Naprawić każdy z 2 zweryfikowanych błędów z gry w kodzie silnika lub handlerze karty. Weryfikacja: błąd nie występuje po naprawie.
- [ ] 6.2 Dodać testy regresyjne dla każdego naprawionego błędu z gry. Weryfikacja: testy przechodzą (`npm test` lub `npm run simulate`).

## 7. manual-findings.json — PARTIAL_FIX, CODE_DISCREPANCY, UNRESOLVED

- [ ] 7.1 Dla każdej karty ze statusem PARTIAL_FIX (697 kart): uzupełnić opisane braki, aby karta była whole; zaktualizować status w manual-findings.json. Weryfikacja: status zmieniony na FIXED_TARGETED lub REVIEWED_NO_ISSUE_FOUND.
- [ ] 7.2 Dla każdej karty ze statusem CODE_DISCREPANCY (1328 kart): zweryfikować czy rozbieżność jest rzeczywista; jeśli tak — naprawić; jeśli nie — zmienić status na REVIEWED_NO_ISSUE_FOUND. Weryfikacja: każda karta rozpatrzona, status zaktualizowany.
- [ ] 7.3 Dla jedynej karty ze statusem UNRESOLVED: naprawić lub odrzucić z uzasadnieniem; zaktualizować status. Weryfikacja: status nie jest już UNRESOLVED.

## 8. Weryfikacja końcowa

- [ ] 8.1 Uruchomić `npm run typecheck`, `npm test`, `npx vite build`, `npm run simulate` — wszystkie muszą być zielone. Weryfikacja: wszystkie komendy kończą się sukcesem.
- [ ] 8.2 Zweryfikować `tests/cards/no-partial-cards.test.ts` — brak częściowych kart w rejestrze. Weryfikacja: test przechodzi.
- [ ] 8.3 Zweryfikować `tests/cards/partial-support.test.ts` — ledger jest zgodny z kodem. Weryfikacja: test przechodzi.

## Workflow follow-up

- Po zakończeniu wszystkich zadań, rozważyć archiwizację zmiany OpenSpec `naprawa-blednych-kart` zgodnie z wymaganiami recenzji projektu.
- Zgłosić właścicielowi liczbę naprawionych kart (biblioteka / krypta / łącznie) re-derywaną z data/registry-report.txt.
