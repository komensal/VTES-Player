# Spec Delta

## Purpose

Definiuje wymagania behawioralne dla naprawy zweryfikowanych błędów z gry zidentyfikowanych w sekcji 3 docs/pelna_analiza_bledow.md (2 zgłoszone bugi).

## ADDED Requirements

### Requirement: Każdy zweryfikowany błąd z gry jest naprawiony

Każdy z 2 zweryfikowanych błędów z gry z sekcji 3 analizy błędów SHALL zostać naprawiony w kodzie silnika lub w handlerze karty.

#### Scenario: Błąd z gry jest naprawiony

- **WHEN** zweryfikowany błąd z gry występuje w trakcie rozgrywki
- **THEN** po naprawie błąd nie występuje już, a gra zachowuje się zgodnie z regułami

### Requirement: Każdy naprawiony błąd z gry ma test regresyjny

Każdy naprawiony błąd z gry SHALL mieć test w tests/cards/ lub tests/engine/, który weryfikuje że błąd nie powraca.

#### Scenario: Test regresyjny dla naprawionego błędu z gry

- **WHEN** uruchomiono test regresyjny dla naprawionego błędu z gry
- **THEN** test przechodzi, potwierdzając że błąd nie występuje
