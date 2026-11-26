# Design

## Context

Projekt VTES-Player ma headless engine w TypeScript (`src/engine/`), karty jako data + primitives w `src/cards/effects/cards.ts`, rejestr w `src/cards/registry.json`, listę supported w `config/supported.json`, oraz testy scenariuszowe w `tests/cards/`. Zasada "no partial cards" jest egzekwowana przez `tests/cards/no-partial-cards.test.ts` i `widenedCrypt` w `scripts/build-registry.mts`.

Pełna analiza błędów (`docs/pelna_analiza_bledow.md`, z innej gałęzi `arena/a2a65614-vtes-player`) sklasyfikowała:
- Sekcja 1: 277 kart bez handlera — 253 z nich nie ma handlera w naszym aktualnym `cards.ts` (na gałęzi `work/precons-audit`).
- Sekcja 2: 7 niezgodności w handlerach (4 naprawione, 3 fałszywe alarmy w źródle; trzeba zweryfikować w naszym kodzie).
- Sekcja 3: 2 zweryfikowane bugi z gry.

`docs/card-audit/manual-findings.json` ma 4158 wpisów: 652 FIXED_TARGETED, 697 PARTIAL_FIX, 1480 REVIEWED_NO_ISSUE_FOUND, 1328 CODE_DISCREPANCY, 1 UNRESOLVED.

`docs/partial-support.md` jest zamknięty od 2026-09-03 — brak otwartych częściowych obsług, brak markerów `// PARTIAL:` w `cards.ts`.

## Goals / Non-Goals

**Goals:**
- Każda supported karta z listy błędnych ma handler w `cards.ts` lub jest usunięta z `supported.json`.
- Każda naprawiona karta ma test scenariuszowy w `tests/cards/`.
- `npm run typecheck`, `npm test`, `npx vite build`, `npm run simulate` są zielone po każdej fali.
- Wersja w `src/version.ts` i `package.json` jest bumpowana o 0.0.1 po każdej fali (binding owner rule).
- `docs/card-status-by-set.md` jest regenerowane po każdej fali.

**Non-Goals:**
- Nie dodawanie nowych kart do puli (tylko naprawa już supported).
- Nie zmienianie reguł silnika poza tym, co konieczne do poprawnego działania kart.
- Nie implementowanie kart z listy wyciętych/blokowanych (pusta w partial-support).
- Nie rozszerzanie krypty poza V5 (crypt-groups.json jest `[]`).

## Decisions

### Podejście per fala (wave), nie alfabetycznie

Karty są grupowane po wspólnym mechanizmie/primitive, zgodnie z zasadą projektu: jeden nowy primitive płaci za kilka kart. Każda fala to osobny zestaw kart, implementacja, testy, bump wersji, regeneracja dokumentacji.

**Alternatywa rozważona:** naprawa kart po jednej, alfabetycznie. Odrzucona — nie wykorzystuje wspólnych primitive'ów i prowadzi do powtarzania kodu.

### Karty bez handlera vs. usunięcie z supported

Karta bez handlera, która jest w talii i nie działa, SHALL być albo zaimplementowana, albo usunięta z `config/supported.json`. Decyzja per karta zależy od tego, czy tekst karty można wyrazić w istniejącym słowniku primitive'ów, czy wymaga nowego primitive'u lub bespoke handlera.

**Alternatywa rozważona:** zostawienie karty supported bez handlera. Odrzucona — łamie zasadę no partial cards.

### PARTIAL_FIX i CODE_DISCREPANCY z manual-findings.json

Karty PARTIAL_FIX są dokończone (wszystkie opisane braki uzupełniane). Karty CODE_DISCREPANCY są weryfikowane — rzeczywiste rozbieżności naprawiane, nieistniejące zmieniane na REVIEWED_NO_ISSUE_FOUND. Karta UNRESOLVED jest rozpatrzona indywidualnie.

**Alternatywa rozważona:** pominięcie manual-findings.json. Odrzucona — zawiera sklasyfikowane błędy, które użytkownik chce naprawić.

### Testy

Każda naprawiona karta dostaje test scenariuszowy w `tests/cards/` z `runTrace`, assertując pozytywny i negatywny przypadek (opcja nie oferowana gdy warunki nie spełnione). Fuzz w `tests/engine/fuzz.test.ts` jest aktualizowany o nowe karty w taliach fuzz.

## Risks / Trade-offs

[Duża liczba kart] → Praca podzielona na fale po 3-6 kart sharing mechanizm; każda fala weryfikowana niezależnie przed przejściem do następnej.

[Analiza z innej gałęzi] → Niektóre karty z listy mogą już mieć handler w naszym kodzie (np. `.44 Magnum`, `Abandoning the Flesh`); każda karta jest weryfikowana indywidualnie przed uznaniem za wymagającą naprawy.

[Brak speców w projekcie] → Wszystkie 5能力ści są nowe; brak istniejącego specu do którego można się odwołać.

[manual-findings.json ma 4158 wpisów] → Nie wszystkie wymagają implementacji; wiele to REVIEWED_NO_ISSUE_FOUND lub FIXED_TARGETED. Praca skupia się na PARTIAL_FIX (697), CODE_DISCREPANCY (1328) i UNRESOLVED (1).

## Open Questions

- Które z 253 kart bez handlera w naszym kodzie mają już implementację pod inną nazwą lub ID? (wymaga weryfikacji per karta)
- Czy któraś z 7 niezgodności z sekcji 2 występuje w naszym kodzie, czy wszystkie zostały już naprawione na naszej gałęzi? (wymaga weryfikacji)
- Jakie są dokładne treści 2 zweryfikowanych błędów z sekcji 3? (wymaga znalezienia w kodzie lub dokumentacji)
