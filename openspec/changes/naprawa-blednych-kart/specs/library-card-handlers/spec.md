# Spec Delta

## Purpose

Definiuje wymagania behawioralne dla brakujących handlerów kart biblioteki VTES (Master, Action, Combat, Reaction, Political Action, Equipment, Ally, Retainer, Event), które są oznaczone jako supported w config/supported.json, ale nie mają implementacji w src/cards/effects/cards.ts, przez co silnik nie wystawia opcji ich zagrania.

## ADDED Requirements

### Requirement: Każda supported karta biblioteki bez handlera ma zaimplementowany efekt

Każda karta biblioteki z listy sekcji 1 docs/pelna_analiza_bledow.md, która jest oznaczona supported w config/supported.json, SHALL mieć handler w src/cards/effects/cards.ts, który wystawia wszystkie opcje zagrania wynikające z jej wydrukowanego tekstu.

#### Scenario: Karta biblioteki bez handlera jest oferowana do zagrania

- **WHEN** gracz ma w ręce supported kartę biblioteki bez handlera i spełnia warunki jej zagrania
- **THEN** silnik wystawia opcję `play:<Nazwa>:...` dla tej karty, a wybór jej stosuje wydrukowany efekt

### Requirement: Handler karty biblioteki nie wprowadza częściowej obsługi

Każdy nowy handler karty biblioteki SHALL implementować wszystkie klauzule wydrukowane na karcie, a nie tylko niektóre; żadna klauzula nie może zostać pominięta bez wpisu w docs/partial-support.md.

#### Scenario: Karta z wieloma klauzulami jest w pełni obsługiwana

- **WHEN** karta biblioteki drukuje dwie lub więcej klauzul (np. basic i superior)
- **THEN** handler implementuje każdą klauzulę jako osobny tryb lub efekt, a żadna nie jest pominięta

### Requirement: Każda nowa karta biblioteki ma test scenariuszowy

Każda nowo zaimplementowana karta biblioteki SHALL mieć test w tests/cards/, który weryfikuje poprawne działanie oraz kontrole negatywne (opcja NIE jest oferowana, gdy warunki nie są spełnione).

#### Scenario: Test scenariuszowy dla nowej karty biblioteki

- **WHEN** uruchomiono test scenariuszowy dla nowej karty biblioteki
- **THEN** test przechodzi, potwierdzając poprawne działanie i brak oferowania opcji gdy warunki nie są spełnione
