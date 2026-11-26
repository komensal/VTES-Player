# Spec Delta

## Purpose

Definiuje wymagania behawioralne dla naprawy rozbieżności między wydrukowanym tekstem karty a blokiem effects w istniejących handlerach w src/cards/effects/cards.ts, zidentyfikowanych w sekcji 2 docs/pelna_analiza_bledow.md.

## ADDED Requirements

### Requirement: Każde słowo kluczowe w tekście karty ma odpowiadający efekt w handlerze

Dla każdej karty z sekcji 2 analizy błędów, każde słowo kluczowe występujące w wydrukowanym tekście karty (np. maneuver, additionalStrike, intercept) SHALL mieć odpowiadający mu efekt w bloku effects w cards.ts.

#### Scenario: Słowo kluczowe w tekście ma odpowiadający efekt

- **WHEN** tekst karty zawiera słowo kluczowe (np. "maneuver")
- **THEN** blok effects w cards.ts zawiera odpowiadający efekt dla tego słowa kluczowego

### Requirement: Niezgodności handlerów są naprawione lub udokumentowane jako fałszywe alarmy

Każda z 7 niezgodności z sekcji 2 analizy błędów SHALL być albo naprawiona (dodanie brakującego efektu), albo udokumentowana jako fałszywy alarm z uzasadnieniem.

#### Scenario: Niezgodność handlera jest naprawiona

- **WHEN** karta ma zidentyfikowaną niezgodność (brakujący efekt)
- **THEN** efekt jest dodany do bloku effects, lub niezgodność jest udokumentowana jako fałszywy alarm z uzasadnieniem

### Requirement: Każda naprawiona niezgodność ma test regresyjny

Każda naprawiona niezgodność SHALL mieć test w tests/cards/, który weryfikuje poprawne zachowanie po naprawie.

#### Scenario: Test regresyjny dla naprawionej niezgodności

- **WHEN** uruchomiono test regresyjny dla naprawionej niezgodności
- **THEN** test przechodzi, potwierdzając że rozbieżność została usunięta
