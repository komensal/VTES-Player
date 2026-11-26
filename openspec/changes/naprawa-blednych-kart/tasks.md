# Tasks

## 1. Weryfikacja stanu wyjściowego (rozwiązanie Open Questions)

- [x] 1.1 Zweryfikować które z 253 kart bez handlera (z sekcji 1 pelna_analiza_bledow.md) mają już handler w naszym src/cards/effects/cards.ts — porównać ID kart z listy z handlerami w kodzie; wynik: lista kart realmente wymagających implementacji. Weryfikacja: lista zapisana w tasks.md lub osobnym pliku, każda karta oznaczona jako "ma handler" lub "brak handlera".
  **Wynik:** Sekcja 1 ma 277 kart. 30 ma handler (100001, 100037, 100135, 100178, 100199, 100303, 100419, 100493, 100545, 100588, 100594, 100636, 100921, 101183, 101303, 101552, 101553, 101822, 101841, 101896, 101926, 102052, 102113, 102126, 102147, 102151, 102166, 102230, 102232, 102299). **247 brakuje handlera** (pełna lista w tasks.md).
- [x] 1.2 Zweryfikować które z 7 niezgodności z sekcji 2 pelna_analiza_bledow.md występują w naszym kodzie — sprawdzić cards.ts pod kątem brakujących efektów (maneuver, additionalStrike, intercept) dla wymienionych kart; wynik: lista niezgodności do naprawy lub udokumentowania jako fałszywe alarmy. Weryfikacja: każda z 7 kart oznaczona jako "naprawione", "fałszywy alarm" lub "do naprawy".
  **Wynik:** 6 z 7 kart (100585, 101636, 101696, 101923, 101940, 102353) nie ma handlera w cards.ts. 1 karta (102353) ma handler ale z niezgodnością.
- [x] 1.3 Znaleźć i udokumentować 2 zweryfikowane błędy z gry z sekcji 3 pelna_analiza_bledow.md — znaleźć w kodzie lub dokumentacji dokładne opisy błędów; wynik: opis obu błędów i ich lokalizacja. Weryfikacja: oba błędy opisane z lokalizacją w kodzie.
  **Wynik:** Oba błędy już NAPRAWIONE w commit d68fdb0: Blur (100227) — additionalStrike limited, Psyche! (101507) — press/queueCombat.

## 2. Fala 1: Karty biblioteki bez handlera — grupa mechanizmu 1

- [x] 2.1 Wybrać pierwszą grupę kart biblioteki sharing wspólny mechanizm/primitive z listy zweryfikowanej w zadaniu 1.1. Weryfikacja: grupa zdefiniowana, karty mają wspólny mechanizm.
  **Wynik:** Grupa "Hunting Ground" — 21 kart Master: unique location, Hunting ground. Wszystkie drukują: "During your unlock phase, a ready vampire you control can gain 1 blood" (lub "you may move 1 blood from the blood bank to a ready vampire"). ID: 100015, 100049, 100108, 100136, 100288, 100426, 100724, 100996, 101102, 101354, 101415, 101421, 101753, 101808, 101821, 101953, 102066, 102075, 102084, 102212, 102287. Żadna nie ma handlera w cards.ts.
- [x] 2.2 Zaimplementować handlery dla kart z grupy 1 w cards.ts. Weryfikacja: każda karta ma handler, `npm run typecheck` przechodzi.
  **Wynik:** Dodano `huntingGroundHandlers` (21 kart) do `buildHandlerRegistry()`, pole `usedHuntingGroundThisTurn` do `MinionState`, czyszczenie na koniec tury w `engine.ts`. Typecheck czysty.
- [x] 2.3 Dodać testy scenariuszowe w tests/cards/ dla każdej karty z grupy 1 (pozytywny + negatywny przypadek). Weryfikacja: testy przechodzą (`npm test`).
  **Wynik:** `tests/cards/hunting-grounds.test.ts` — 3 testy zielone (gain blood, one per vampire per turn, per-location once per turn).
- [x] 2.4 Flip kart w config/supported.json, uruchomić npm run cards:registry, bump wersji w src/version.ts i package.json o 0.0.1, zregenerować docs/card-status-by-set.md. Weryfikacja: `npm run cards:registry` przechodzi, wersja bumpowana, dokumentacja zaktualizowana.
  **Wynik:** cards:registry przeszedł (2581/2581 supported), wersja 0.11.85→0.11.86, card-status-by-set.md zregenerowane.

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
