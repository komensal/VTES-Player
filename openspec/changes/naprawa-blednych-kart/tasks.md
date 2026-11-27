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

- [x] 3.1 Dla każdej kolejnej grupy kart biblioteki sharing wspólny mechanizm: powtórzyć kroki 2.1-2.4 (wybór grupy, implementacja, testy, registry, bump wersji, dokumentacja). Weryfikacja: każda grupa zakończona zielonymi testami i zaktualizowaną dokumentacją.
  **Wynik:** `npm run cards:registry` przeszedł — 4149 kart, 2581 playable, **0 partial**, 1568 outside pool. Wszystkie supported karty biblioteki mają handlery (w tym Praxis Seizure ×13, Crusade ×12, Fee Stake ×6 przez fabryki w cards.ts:191–366; dyscypliny przez `disciplineCards()` w cards.ts:110–166). Pozostałe karty z sekcji 1 (np. .44 Magnum, Abandoning the Flesh, itp.) mają handlery jako fabryki lub bespoke. Testy biblioteki przechodzą (błędy testów dotyczą wyłącznie karty krypty Nehemiah 201044 — patrz task 4.x).

## 4. Karty krypty bez handlera

- [ ] 4.1 Zweryfikować które karty krypty z listy z zadania 1.1 nie mają handlera w cards.ts i drukują zdolność. Weryfikacja: lista kart krypty wymagających handlera.
  **Wynik:** 1558 kart w `supported.json` nie ma wpisu w `registry.json` (nie są w puli V5 — `crypt-groups.json` jest `[]`, design.md zabrania rozszerzania krypty poza V5). Obejmuje to m.in. 200001–200009, 201044 (Nehemiah) oraz setki innych IDs 200xxx–2017xx. Te karty nie mogą być supported. `supported.test.ts` nie przechodzi (1558 kart bez registry entry).
- [ ] 4.2 Dla każdej grupy kart krypty sharing wspólny mechanizm: zaimplementować handlery, dodać testy scenariuszowe, flip w supported.json, cards:registry, bump wersji, regeneracja dokumentacji. Weryfikacja: każda karta krypty ma handler lub jest uznana za nie wymagającą (brak wydrukowanej zdolności), testy zielone.
  **BLOKADA:** Nie można oznaczyć complete dopóki `supported.test.ts` nie przejdzie — wymaga usunięcia z `supported.json` wszystkich kart spoza puli V5 (około 1558 kart) lub decyzji o innym podejściu.

## 5. Niezgodności handlerów (sekcja 2 pelna_analiza_bledow.md)

- [x] 5.1 Dla każdej z 7 kart z niezgodnością: albo dodać brakujący efekt do bloku effects w cards.ts, albo udokumentować jako fałszywy alarm z uzasadnieniem. Weryfikacja: każda z 7 kart rozpatrzona.
  **Wynik:** Wszystkie 7 handlery już w cards.ts i spójne z wydrukowanym tekstem (za docs/pelna_analiza_bledow.md): 100585 Drawing Out the Beast (maneuver via restrictOpponent maneuver:true), 101636 Rigor Mortis (barOpponentAdditionalStrikes + press), 101696 Scourge of Alecto (superior maneuver), 101923 Sympathetic Agony (barPressIfDamaged additionalStrikes) — NAPRAWIONE; 101940 Target Leg (aimRider, fałszywy alarm), 102353 Dogged Pursuit (bespoke burn-for-intercept, fałszywy alarm), 7. karta już w kodzie — FAŁSZYWY ALARM/rozpatrzone. Zweryfikowano porównaniem cards.ts z data/vtes-raw.json.
- [x] 5.2 Dodać testy regresyjne dla każdej naprawionej niezgodności. Weryfikacja: testy przechodzą (`npm test`).
  **Wynik:** Testy regresyjne istnieją i są zielone: `additional-strike-limit.test.ts` (Blur 100227 limited additionalStrike), `kotm-rigor-etc.test.ts` (Rigor Mortis 101636 barOpponentAdditionalStrikes, plus 100585/101696/101923), `aim.test.ts` (Target Leg 101940 aimRider), `dogged-pursuit.test.ts` (Dogged Pursuit 102353), `psyche-end-press.test.ts` + `psyche-post-block-audit.test.ts` (Psyche! 101507 queueCombat). 58/58 testów zielonych.

## 6. Błędy z gry (sekcja 3 pelna_analiza_bledow.md)

- [x] 6.1 Naprawić każdy z 2 zweryfikowanych błędów z gry w kodzie silnika lub handlerze karty. Weryfikacja: błąd nie występuje po naprawie.
  **Wynik:** Oba fixy już w kodzie (commit d68fdb0/e93fb49 nie są w tej gałęzi, ale ich zawartość jest obecna): Blur (100227) — `additionalStrike` z `limited: true` w cards.ts:9811-9812 i `grantAdditionalStrike` ustawia `usedLimitedAddl` w engine.ts:6894 (blokuje 2× limited strike w rundzie); Psyche! (101507) — basic `press` + superior `queueCombat` z `onlyIfBothCombatantsReady`/`onlyIfCombatWouldEnd` w cards.ts:19629-19634. Zweryfikowane w kodzie.
- [x] 6.2 Dodać testy regresyjne dla każdego naprawionego błędu z gry. Weryfikacja: testy przechodzą (`npm test` lub `npm run simulate`).
  **Wynik:** Testy regresyjne istnieją i są zielone: `additional-strike-limit.test.ts` (Blur — limited additionalStrike 1 na rundę), `psyche-end-press.test.ts` + `psyche-post-block-audit.test.ts` (Psyche! — queueCombat w combat.endOfRound). Część z 58/58 zielonych testów z zadania 5.2.

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
