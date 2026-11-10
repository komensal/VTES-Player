# Automatyczny przegląd kart — inwentarz

Zakres: aktualny `src/cards/registry.json` (4158 kart: 2373 library i 1785 crypt; 4158 oznaczonych jako supported). Każdy wpis jest w inventory.csv. Dane registry: fetchedAt 2026-11-01T20:12:30.427Z.

To **triage, nie ręczny audyt ani potwierdzenie poprawności**. UNREVIEWED oznacza brak udokumentowanej w tym zestawieniu weryfikacji; brak sygnału niczego nie dowodzi. Sygnały są wskazówkami wymagającymi zbadania: overlay, wariant kosztu lub użycie słowa w innym znaczeniu mogą powodować fałszywe alarmy. Istnienie handlera i status supported też nie dowodzą poprawności.

| Sygnał | Kart |
|---|---:|
| crypt_empty_spec_with_text_review | 817 |
| no_reported_library_type | 3 |
| no_runtime_handler | 11 |
| printed_unique_not_reported_review | 221 |
| simple_gain_pool_text_mismatch_review | 186 |

## Ręcznie potwierdzone ustalenia

To udokumentowane ustalenia, a nie pełne sprawdzenie wszystkich interakcji tych kart. REVIEWED_NO_ISSUE_FOUND oznacza brak wykrytych problemów w sprawdzonym zakresie; PARTIAL_FIX oznacza, że znane błędy pozostają. Źródło: manual-findings.json; podsumowania paczek: batches.md. Pozostałe 4138 kart w tym zestawieniu mają status UNREVIEWED, czyli nie mają tu żadnego ręcznego ustalenia. Wcześniejsze wpisy CONFIRMED_BUG i FIXED_TARGETED również wymagają dalszego audytu.

| ID | Karta | Status | Ustalenie |
|---:|---|---|---|
| 100001 | .44 Magnum | FIXED_TARGETED | Naprawiono wybór broni w dodatkowym strike przeciwnika, zakazy działania i ekwipunku oraz modyfikatory i źródła kosztu; tests/cards/round-end.test.ts i tests/cards/cost-sources.test.ts. Potrzebna dalsza weryfikacja interakcji. |
| 100002 | 419 Operation | CONFIRMED_BUG | Spec action ma jedynie actionStealth; brak umieszczenia karty w grze, przenoszenia pool, wypłaty i możliwości użycia Edge przez prey. src/cards/effects/cards.ts: 419 Operation; registry.json: 100002. |
| 100003 | Aaron's Feeding Razor | REVIEWED_NO_ISSUE_FOUND | Koszt 1 pool, unique oraz +1 hunt nosiciela zgodne ze specyfikacją; tests/cards/legacy-equipment.test.ts i ogólne testy unikalnego equipment. Ocena nie obejmuje wszystkich możliwych interakcji. |
| 100004 | Abactor | CONFIRMED_BUG | Spec action daje wyłącznie +1 stealth, brak hunt +4 i blood hunt referendum po sukcesie. src/cards/effects/cards.ts: Abactor; registry.json: 100004. |
| 100005 | Abandoning the Flesh | CONFIRMED_BUG | Spec modifier/reaction daje natychmiast +1 bleed zamiast zastąpienia spalenia wampira, usunięcia go z gry i lokowanej karty z warunkowym bonusem; brak limitu jednej kopii. src/cards/effects/cards.ts: Abandoning the Flesh; registry.json: 100005. |
| 100006 | Abbot | REVIEWED_NO_ISSUE_FOUND | W sprawdzonym zakresie: Sabbat, +1 stealth, dołączenie, unlock, limit jednej kopii oraz intercept wobec akcji skierowanych do kontrolera; tests/cards/conditional-statics.test.ts. Możliwe dalsze interakcje nie zostały w pełni zweryfikowane. |
| 100007 | Abjure | CONFIRMED_BUG | Tekst Power [COMBAT] wymaga zakończenia walki monster z mortal przez lock imbued i opcjonalnego przeniesienia conviction; spec opisuje wyłącznie combat maneuver wymagający red. src/cards/effects/cards.ts: Abjure; src/cards/registry.json: 100007. |
| 100008 | Ablative Skin | CONFIRMED_BUG | Spec zawiera jedynie +1 stealth i prevent 2 w action, bez dołączenia karty, 3 liczników, wydawania liczników i wersji superior zapobiegającej aggravated. src/cards/effects/cards.ts: Ablative Skin; src/cards/registry.json: 100008. |
| 100009 | Abombwe | FIXED_TARGETED | Zastąpiono gainPool przez trifle Discipline +1 abo/+1 capacity; cel Laibon lub wampir z pro, również przeciwnika/w torpor, z brakiem superior abo. tests/cards/abombwe-audit.test.ts. Pozostałe interakcje mogą wymagać dalszego sprawdzenia. |
| 100010 | Abomination | CONFIRMED_BUG | Spec nie wymaga non-sterile vampire ani spalenia ready unlocked werewolf, nie tworzy unikalnego wampira, nie przenosi krwi i nie daje wskazanych stałych zdolności/akcji. src/cards/effects/cards.ts: Abomination; src/cards/registry.json: 100010. |
| 100013 | Absorb the Mind | CONFIRMED_BUG | Spec ma dodge także dla myt i nie zawiera superior; tekst myt wymaga ranged steal blood, a MYT dodatkowo kradzieży Discipline. src/cards/effects/cards.ts: Absorb the Mind; src/cards/registry.json: 100013. |
| 100027 | Ahriman's Demesne | CONFIRMED_BUG | Spec daje wyłącznie maneuver, bez wymogu long range i późniejszej rundy, bez aggravated strike i superior burn. src/cards/effects/cards.ts: Ahriman's Demesne; src/cards/registry.json: 100027. |
| 100207 | Blood Puppy | FIXED_TARGETED | Zastąpiono niepoprawne gainPool przez unique, blood store i akcję burn; tests/cards/blood-puppy.test.ts. Nadal możliwe są nieodkryte interakcje z innymi kartami. |
| 100216 | Blood Turnip | CONFIRMED_BUG | Poza wymogiem Anarch spec daje tylko gainPool; tekst opisuje unikalny master na minionie, przenoszony z krwią/life po rozpoczęciu combatu. src/cards/effects/cards.ts: Blood Turnip; src/cards/registry.json: 100216. |
| 101862 | Static Virtue | CONFIRMED_BUG | Poza wymogiem Laibon spec daje tylko gainPool; tekst dotyczy wyszukiwania i umieszczania kart Aye/Orun. src/cards/effects/cards.ts: Static Virtue; src/cards/registry.json: 101862. |
| 200005 | Abdelsobek (G5) | CONFIRMED_BUG | Brak specyfikacji i handlera o tej nazwie; tekst daje akcję odblokowania wampira lub mumii. src/cards/registry.json: 200005; buildHandlerRegistry. |
| 200008 | Abiku (G4) | CONFIRMED_BUG | Brak specyfikacji i handlera o tej nazwie; tekst daje +1 stealth podczas hunt. src/cards/registry.json: 200008; buildHandlerRegistry. |
| 200229 | Byzar (G6) | CONFIRMED_BUG | flatCrypt zawiera tylko +1 stealth; tekst dodaje zastąpienie burn przeniesieniem do torporu i licznikami. src/cards/effects/cards.ts: Byzar (G6); src/cards/registry.json: 200229. |
| 200232 | Cailean (G2) | CONFIRMED_BUG | flatCrypt z pustymi statystykami nie zapewnia zdolności ustawiania zasięgu przed każdą rundą. src/cards/effects/cards.ts: Cailean (G2); src/cards/registry.json: 200232. |
| 200249 | Carolina Vález (G5) | CONFIRMED_BUG | flatCrypt z pustymi statystykami nie zawiera immunitetu na obrażenia od allies i retainers. src/cards/effects/cards.ts: Carolina Vález (G5); src/cards/registry.json: 200249. |

## Znaczenie sygnałów

- no_runtime_handler: brak handlera o nazwie karty; dla niektórych wampirów bez zdolności może to być zamierzone.
- no_reported_library_type: handler nie zwraca typu library; może dotyczyć nieobsługiwanych typów.
- pool_cost_mismatch_review / blood_cost_mismatch_review: podstawowy koszt handlera różni się od wartości liczbowej w rejestrze; trzeba sprawdzić warianty i overlay.
- printed_unique_not_reported_review: tekst zaczyna się od Unique, ale handler nie raportuje unikalności; może chodzić o inną interpretację.
- simple_gain_pool_text_mismatch_review: master ma spec z jednym gainPool, ale prosty wzorzec nie znajduje gain pool w tekście; overlay może zmieniać efekt.
- crypt_empty_spec_with_text_review: spec krypty nie ma żadnego efektu ani statystyk, a tekst zawiera dalszy fragment po pierwszym dwukropku lub kropce; część fragmentów może być tylko opisem tytułu.

Uruchomienie: `npm run cards:audit`. Ograniczenia: nie sprawdza poprawności wszystkich klauzul, kolejności zdarzeń, zasad, UI ani botów; status każdej karty wymaga osobnego przeglądu i testów scenariuszowych.
