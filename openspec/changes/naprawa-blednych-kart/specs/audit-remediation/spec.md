# Spec Delta

## Purpose

Definiuje wymagania behawioralne dla dokończenia częściowych napraw z docs/card-audit/manual-findings.json — kart ze statusami PARTIAL_FIX, CODE_DISCREPANCY i UNRESOLVED.

## ADDED Requirements

### Requirement: Karty PARTIAL_FIX są dokończone

Każda karta ze statusem PARTIAL_FIX w manual-findings.json SHALL mieć wszystkie opisane w evidence braki uzupełnione, aby karta była whole zgodnie z zasadą no partial cards.

#### Scenario: Karta PARTIAL_FIX jest dokończona

- **WHEN** karta ma status PARTIAL_FIX w manual-findings.json
- **THEN** wszystkie opisane braki są zaimplementowane, a status jest zaktualizowany na FIXED_TARGETED lub REVIEWED_NO_ISSUE_FOUND

### Requirement: Karty CODE_DISCREPANCY są weryfikowane i naprawiane

Każda karta ze statusem CODE_DISCREPANCY w manual-findings.json SHALL zostać zweryfikowana — jeśli rozbieżność jest rzeczywista, zostaje naprawiona; jeśli nie, status jest zmieniony na REVIEWED_NO_ISSUE_FOUND.

#### Scenario: Karta CODE_DISCREPANCY jest weryfikowana

- **WHEN** karta ma status CODE_DISCREPANCY w manual-findings.json
- **THEN** rozbieżność jest albo naprawiona, albo udokumentowana jako nieistniejąca, a status jest zaktualizowany

### Requirement: Karta UNRESOLVED jest rozpatrzona

Jedyna karta ze statusem UNRESOLVED w manual-findings.json SHALL zostać rozpatrzona — albo naprawiona, albo odrzucona z uzasadnieniem.

#### Scenario: Karta UNRESOLVED jest rozpatrzona

- **WHEN** karta ma status UNRESOLVED w manual-findings.json
- **THEN** karta jest naprawiona lub odrzucona z uzasadnieniem, a status jest zaktualizowany

### Requirement: Każda zremediowana karta ma zaktualizowany status w manual-findings.json

Po zakończeniu pracy nad każdą kartą z manual-findings.json, jej status SHALL zostać zaktualizowany w pliku, aby odzwierciedlał bieżący stan.

#### Scenario: Status karty jest zaktualizowany po remediacji

- **WHEN** praca nad kartą z manual-findings.json jest zakończona
- **THEN** status karty w pliku jest zaktualizowany (FIXED_TARGETED, PARTIAL_FIX, REVIEWED_NO_ISSUE_FOUND, lub UNRESOLVED)
