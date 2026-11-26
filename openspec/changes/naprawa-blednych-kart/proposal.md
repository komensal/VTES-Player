# Proposal

## Why

Pełna analiza błędów (`docs/pelna_analiza_bledow.md`) oraz audyt kart (`docs/card-audit/manual-findings.json`) sklasyfikowały setki kart VTES jako błędne lub częściowo naprawione. Wiele z nich jest w talii (`supported.json`) ale nie ma handlera w `src/cards/effects/cards.ts` — silnik nie wystawia opcji zagrania, więc karta nie działa w grze. Inne mają handler, ale z rozbieżnościami względem wydrukowanego tekstu. Zasada "no partial cards" wymaga, by każda supported karta robiła wszystko, co drukuje. Naprawa wszystkich sklasyfikowanych błędnych kart jest konieczna, zanim platforma będzie mogła uznać pulę kart za kompletną.

## What Changes

- Zaimplementować brakujące handlery dla kart biblioteki i krypty bez handlera (sekcja 1 `pelna_analiza_bledow.md`).
- Naprawić niezgodności w istniejących handlerach (sekcja 2 `pelna_analiza_bledow.md`).
- Naprawić zweryfikowane błędy z gry (sekcja 3 `pelna_analiza_bledow.md`).
- Dokończyć częściowe naprawy z `manual-findings.json` (statusy PARTIAL_FIX, CODE_DISCREPANCY, UNRESOLVED).
- Dla każdej naprawionej karty dodać test scenariuszowy w `tests/cards/` i zweryfikować przez `supported.test.ts` oraz fuzz.
- Zaktualizować `docs/card-status-by-set.md` i `docs/partial-support.md` po każdej fali.

## Capabilities

### New Capabilities

- `library-card-handlers`: Implementacja brakujących handlerów dla kart biblioteki (Master, Action, Combat, Reaction, itp.) bez handlera w `cards.ts`.
- `crypt-card-handlers`: Implementacja brakujących handlerów dla kart krypty (wampiry) bez handlera w `cards.ts`.
- `card-handler-consistency`: Naprawa rozbieżności między wydrukowanym tekstem karty a blokiem `effects` w istniejących handlerach.
- `card-game-bugs`: Naprawa zweryfikowanych błędów z gry zgłoszonych w sekcji 3 analizy błędów.
- `audit-remediation`: Dokończenie częściowych napraw z `manual-findings.json` (PARTIAL_FIX, CODE_DISCREPANCY, UNRESOLVED).

### Modified Capabilities

Brak — projekt nie posiada istniejących speców OpenSpec.

## Impact

- `src/cards/effects/cards.ts` — nowe handlery i poprawki istniejących.
- `config/supported.json` — możliwe zmiany statusów kart (flip na supported po implementacji).
- `tests/cards/` — nowe testy scenariuszowe per karta.
- `docs/card-status-by-set.md` — regeneracja po każdej fali.
- `docs/partial-support.md` — aktualizacja ledgera po każdej fali.
- `docs/card-audit/manual-findings.json` — aktualizacja statusów po weryfikacji.
