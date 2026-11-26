# Spec Delta

## Purpose

Definiuje wymagania behawioralne dla brakujących handlerów kart krypty VTES (wampiry), które są oznaczone jako supported w config/supported.json, ale nie mają implementacji w src/cards/effects/cards.ts, przez co ich wydrukowane zdolności nie działają w grze.

## ADDED Requirements

### Requirement: Każda supported karta krypty bez handlera ma zaimplementowaną zdolność

Każda karta krypty z listy sekcji 1 docs/pelna_analiza_bledow.md, która jest oznaczona supported w config/supported.json, SHALL mieć handler w src/cards/effects/cards.ts, który implementuje jej wydrukowaną zdolność (jeśli taką drukuje).

#### Scenario: Wampir z wydrukowaną zdolnością może jej użyć

- **WHEN** wampir z wydrukowaną zdolnością jest w grze i spełnia warunki użycia zdolności
- **THEN** silnik wystawia opcję `ability:<Nazwa>:<cardInstanceId>:<params>` dla tej zdolności, a wybór jej stosuje wydrukowany efekt

### Requirement: Wampir bez wydrukowanej zdolności nie wymaga handlera

Karta krypty, która nie drukuje żadnej zdolności, SHALL być uznawana za kompletną bez handlera — jej brak nie jest błędem.

#### Scenario: Wampir bez zdolności nie wymaga handlera

- **WHEN** karta krypty nie drukuje żadnej zdolności
- **THEN** karta jest uznawana za whole bez konieczności implementacji handlera

### Requirement: Każda nowa karta krypty ma test scenariuszowy

Każda nowo zaimplementowana karta krypty z wydrukowaną zdolnością SHALL mieć test w tests/cards/, który weryfikuje poprawne działanie zdolności oraz kontrole negatywne.

#### Scenario: Test scenariuszowy dla nowej karty krypty

- **WHEN** uruchomiono test scenariuszowy dla nowej karty krypty z wydrukowaną zdolnością
- **THEN** test przechodzi, potwierdzając poprawne działanie zdolności i brak oferowania opcji gdy warunki nie są spełnione
