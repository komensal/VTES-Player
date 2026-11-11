# Automatyczny przegląd kart — inwentarz

Zakres: aktualny `src/cards/registry.json` (4158 kart: 2373 library i 1785 crypt; 4158 oznaczonych jako supported). Każdy wpis jest w inventory.csv. Dane registry: fetchedAt 2026-11-01T20:12:30.427Z.

To **triage, nie ręczny audyt ani potwierdzenie poprawności**. UNREVIEWED oznacza brak udokumentowanej w tym zestawieniu weryfikacji; brak sygnału niczego nie dowodzi. Sygnały są wskazówkami wymagającymi zbadania: overlay, wariant kosztu lub użycie słowa w innym znaczeniu mogą powodować fałszywe alarmy. Istnienie handlera i status supported też nie dowodzą poprawności.

| Sygnał | Kart |
|---|---:|
| crypt_empty_spec_with_text_review | 817 |
| no_reported_library_type | 3 |
| no_runtime_handler | 11 |
| printed_unique_not_reported_review | 220 |
| simple_gain_pool_text_mismatch_review | 185 |

## Ręcznie potwierdzone ustalenia

To udokumentowane ustalenia, a nie pełne sprawdzenie wszystkich interakcji tych kart. REVIEWED_NO_ISSUE_FOUND oznacza brak wykrytych problemów w sprawdzonym zakresie; PARTIAL_FIX oznacza, że znane błędy pozostają. Źródło: manual-findings.json; podsumowania paczek: batches.md. Pozostałe 4095 kart w tym zestawieniu mają status UNREVIEWED, czyli nie mają tu żadnego ręcznego ustalenia. Wcześniejsze wpisy CONFIRMED_BUG i FIXED_TARGETED również wymagają dalszego audytu.

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
| 100017 | Achilles' Heel | CONFIRMED_BUG | Zamiast dołączenia do cudzego wampira, wyboru circle, warunkowego bonusu i możliwości spalenia karta ma tylko modifyBleed. Tekst: src/cards/registry.json, ID 100017; implementacja: src/cards/effects/cards.ts. |
| 100019 | Acquired Ventrue Assets | CONFIRMED_BUG | Zamiast magazynu krwi dla Giovanni i akcji spalenia master daje tylko gainPool. Tekst: src/cards/registry.json, ID 100019; implementacja: src/cards/effects/cards.ts. |
| 100022 | Adhocracy | CONFIRMED_BUG | Trzy tryby ani/chi/pot mają ten sam bleed + strength; brakuje głosów chi i właściwego ridera pot po bloku. Tekst: src/cards/registry.json, ID 100022; implementacja: src/cards/effects/cards.ts. |
| 100023 | The Admonitions | CONFIRMED_BUG | Zamiast unikalnego mastera i zdolności dobrania/odrzucenia oraz przekazania w discard karta daje gainPool. Tekst: src/cards/registry.json, ID 100023; implementacja: src/cards/effects/cards.ts. |
| 100025 | Agent of Power | CONFIRMED_BUG | Zamiast trifle, wyboru dyscypliny i dołączenia do wampira, spalania w discard, master daje gainPool. Tekst: src/cards/registry.json, ID 100025; implementacja: src/cards/effects/cards.ts. |
| 100026 | Aggressive Tactics | CONFIRMED_BUG | Zamiast karty w grze z wyborem Methuselah, redukcją hand size i akcją spalenia master daje gainPool. Tekst: src/cards/registry.json, ID 100026; implementacja: src/cards/effects/cards.ts. |
| 100027 | Ahriman's Demesne | CONFIRMED_BUG | Spec daje wyłącznie maneuver, bez wymogu long range i późniejszej rundy, bez aggravated strike i superior burn. src/cards/effects/cards.ts: Ahriman's Demesne; src/cards/registry.json: 100027. |
| 100030 | The Ailing Spirit | CONFIRMED_BUG | Action ma tylko modifyBleed i actionStealth w trybach podstawowych; brak nadrukowanych trybów bleed i superior przejęcia kontroli. Tekst: src/cards/registry.json, ID 100030; implementacja: src/cards/effects/cards.ts. |
| 100032 | AK-47 | CONFIRMED_BUG | Znany błąd limitowanego dodatkowego strike: AK-47 otrzymuje opcjonalny strike automatycznie i może przez to zablokować inne limitowane źródło; także okno kolejnego źródła po oczekującym strike jest niekompletne. Szczegóły docs/additional-strike-followups.md. Tekst: src/cards/registry.json, ID 100032; implementacja: src/cards/effects/cards.ts. |
| 100034 | Akunanse Kholo | CONFIRMED_BUG | Zamiast tytułu, 2 głosów, ograniczeń starszeństwa i przenoszenia tytułu karta daje modifyIntercept. Tekst: src/cards/registry.json, ID 100034; implementacja: src/cards/effects/cards.ts. |
| 100035 | Al's Army Apparatus | CONFIRMED_BUG | Zamiast unikalnej lokacji, lock i wyszukania broni karta daje gainPool. Tekst: src/cards/registry.json, ID 100035; implementacja: src/cards/effects/cards.ts. |
| 100036 | Alacrity | CONFIRMED_BUG | Jest tylko basic cel z dwoma modifyStealth; brak osobnego superior i opcjonalnego maneuver w pierwszej rundzie po bloku. Tekst: src/cards/registry.json, ID 100036; implementacja: src/cards/effects/cards.ts. |
| 100038 | Alastor | CONFIRMED_BUG | Political action ma tylko modifyStealth; nie wybiera celu ani nie realizuje nagrody referendum, ekwipunku i dołączanego Alastor. Tekst: src/cards/registry.json, ID 100038; implementacja: src/cards/effects/cards.ts. |
| 100040 | Alpha Glint | CONFIRMED_BUG | Dostępne są osobne basic ani i for zamiast kombinacji dyscyplin, brak ograniczenia przeciwnika i superior before-range. Tekst: src/cards/registry.json, ID 100040; implementacja: src/cards/effects/cards.ts. |
| 100041 | Alvusia | CONFIRMED_BUG | Master ma modifyBleed i addStrength zamiast unikalnej karty z licznikami, ich wydawaniem i odnawianiem. Tekst: src/cards/registry.json, ID 100041; implementacja: src/cards/effects/cards.ts. |
| 100043 | Amaranth | CONFIRMED_BUG | Karta ma jedynie maneuver zamiast diablerie przeciwnika w oknie wysłania do torpor. Tekst: src/cards/registry.json, ID 100043; implementacja: src/cards/effects/cards.ts. |
| 100047 | Amria | CONFIRMED_BUG | Basic chi łączy strikeDodge, maneuver i press, zamiast podstawowego maneuver tylko na long oraz superior dodge z press tylko do zakończenia. Tekst: src/cards/registry.json, ID 100047; implementacja: src/cards/effects/cards.ts. |
| 100050 | Anachronism | CONFIRMED_BUG | Master daje gainPool zamiast dołączenia do wampira o capacity powyżej 6 oraz zakazu i niszczenia ranged weapons. Tekst: src/cards/registry.json, ID 100050; implementacja: src/cards/effects/cards.ts. |
| 100057 | Anarch Secession | CONFIRMED_BUG | Action ma tylko +1 stealth, nie zmienia wampira na Anarch, nie obsługuje baron ani ograniczenia bloku. Tekst: src/cards/registry.json, ID 100057; implementacja: src/cards/effects/cards.ts. |
| 100061 | Ancestor Spirit | CONFIRMED_BUG | Master ma jedynie modifyBleed, nie dołącza unikalnej karty na uprawnionym Laibon i nie dodaje głosu. Tekst: src/cards/registry.json, ID 100061; implementacja: src/cards/effects/cards.ts. |
| 100062 | Ancestor's Insight | CONFIRMED_BUG | Jest jedynie basic aus modifyBleed; brak redukcji bleed jako reakcji i rozdzielenia od superior modifier. Tekst: src/cards/registry.json, ID 100062; implementacja: src/cards/effects/cards.ts. |
| 100066 | Anesthetic Touch | CONFIRMED_BUG | Tryby basic aus/obe łączą dodge i combat ends, brak close-only, hand strike oraz superior first strike. Tekst: src/cards/registry.json, ID 100066; implementacja: src/cards/effects/cards.ts. |
| 100067 | Angel of Berlin | CONFIRMED_BUG | Master daje gainPool, zamiast out-of-turn unlock imbued lub equip z ręki. Tekst: src/cards/registry.json, ID 100067; implementacja: src/cards/effects/cards.ts. |
| 100068 | Anima Gathering | CONFIRMED_BUG | Action ma modifyBleed i stealth zamiast dołączenia, wybranego miniona, utrzymania lock oraz +2 intercept i superior +1 bleed. Tekst: src/cards/registry.json, ID 100068; implementacja: src/cards/effects/cards.ts. |
| 100069 | Animal Magnetism | CONFIRMED_BUG | Występuje stealth na osobnych ani i obf zamiast głosów przy obu wymaganych dyscyplinach oraz wersji superior. Tekst: src/cards/registry.json, ID 100069; implementacja: src/cards/effects/cards.ts. |
| 100070 | Animalism | FIXED_TARGETED | Naprawiono celowanie: dowolny wampir, także przeciwnika i w torpor; superior jest wykluczony. Wspólna poprawka zwykłych Discipline masters; tests/cards/audit-batch-100.test.ts. Pozostałe interakcje nie są w pełni zweryfikowane. Tekst: src/cards/registry.json, ID 100070; implementacja: src/cards/effects/cards.ts. |
| 100072 | Anonymous Freight | CONFIRMED_BUG | Jest tylko +1 stealth; brak +3 stealth i właściwego equip z ręki. Tekst: src/cards/registry.json, ID 100072; implementacja: src/cards/effects/cards.ts. |
| 100073 | Antediluvian Awakening | CONFIRMED_BUG | Master daje gainPool zamiast unikalnej karty ze stratą pool i opcją poświęcenia wampira w unlock. Tekst: src/cards/registry.json, ID 100073; implementacja: src/cards/effects/cards.ts. |
| 100075 | Antithesis | CONFIRMED_BUG | Action ma tylko +1 stealth; nie dołącza do uprawnionego wampira ani nie blokuje hunt i nie wywołuje torpor. Tekst: src/cards/registry.json, ID 100075; implementacja: src/cards/effects/cards.ts. |
| 100078 | Approximation of Loyalty | CONFIRMED_BUG | Jest tylko basic pre stealth zamiast wyboru blokującego i superior anulowania reakcji; brak ograniczenia capacity. Tekst: src/cards/registry.json, ID 100078; implementacja: src/cards/effects/cards.ts. |
| 100086 | Argent Baton | CONFIRMED_BUG | Equipment nie ma weapon profile ani strike strength+1 i opcjonalnego ranged efektu przeciw werewolf. Tekst: src/cards/registry.json, ID 100086; implementacja: src/cards/effects/cards.ts. |
| 100087 | Armor of Caine's Fury | CONFIRMED_BUG | Basic val jest prevent 1 zamiast powtarzalnej prewencji przed strike i ochrony przed Frenzy; brak superior. Tekst: src/cards/registry.json, ID 100087; implementacja: src/cards/effects/cards.ts. |
| 100088 | Armor of Terra | CONFIRMED_BUG | Action ma prevent i stealth zamiast dołączenia do Gargoyle, traktowania aggravated jako normal i superior prewencji. Tekst: src/cards/registry.json, ID 100088; implementacja: src/cards/effects/cards.ts. |
| 100089 | Armor of Vitality | CONFIRMED_BUG | Jest tylko basic prevent 3; brak superior niszczącego melee weapon po odpowiedniej prewencji. Tekst: src/cards/registry.json, ID 100089; implementacja: src/cards/effects/cards.ts. |
| 100092 | Army of Apparitions | CONFIRMED_BUG | Reaction daje modifyIntercept zamiast głosów chi lub anulowania akcji w superior. Tekst: src/cards/registry.json, ID 100092; implementacja: src/cards/effects/cards.ts. |
| 100097 | The Art of Memory | CONFIRMED_BUG | Modifier daje stealth zamiast usunięcia z gry i warunkowego odzyskania karty po udanej akcji. Tekst: src/cards/registry.json, ID 100097; implementacja: src/cards/effects/cards.ts. |
| 100098 | The Art of Pain | FIXED_TARGETED | Zastąpiono gainPool przez unique master z +2 strength na ready Toreador antitribu, z zachowaniem clan requirement i kosztu 2 pool; testy celowania, unikalności i rzeczywistych obrażeń tests/cards/audit-batch-100.test.ts. Tekst: src/cards/registry.json, ID 100098; implementacja: src/cards/effects/cards.ts. |
| 100100 | Art's Traumatic Essence | CONFIRMED_BUG | Oba tryby action zawierają tylko stealth; brak lock celu, blood/life i superior dołączenia. Tekst: src/cards/registry.json, ID 100100; implementacja: src/cards/effects/cards.ts. |
| 100102 | As the Crow | CONFIRMED_BUG | Modifier daje stealth zamiast unlock po udanej akcji i ograniczenia jednej kopii. Tekst: src/cards/registry.json, ID 100102; implementacja: src/cards/effects/cards.ts. |
| 100104 | Ascendance | REVIEWED_NO_ISSUE_FOUND | Master gain 1 pool zgodny z tekstem i testem wypłaty kontrolerowi tests/cards/legacy-masters.test.ts. Ocena obejmuje wyłącznie ten zakres. Tekst: src/cards/registry.json, ID 100104; implementacja: src/cards/effects/cards.ts. |
| 100105 | Ashes to Ashes | CONFIRMED_BUG | Dwa tryby prevent 2 zamiast zamiany burn na torpor, prevent all z unlock/torpor oraz superior gain 2 blood. Tekst: src/cards/registry.json, ID 100105; implementacja: src/cards/effects/cards.ts. |
| 100106 | Ashur Tablets | CONFIRMED_BUG | Master daje natychmiast gainPool 3 zamiast odkładania trzech kopii, limitu per turn, usuwania kopii i wybierania kart z ash heap. Tekst: src/cards/registry.json, ID 100106; implementacja: src/cards/effects/cards.ts. |
| 100110 | Augur | CONFIRMED_BUG | Action ma tylko stealth; brak obejrzenia rąk i kart biblioteki oraz unlock imbued. Tekst: src/cards/registry.json, ID 100110; implementacja: src/cards/effects/cards.ts. |
| 100111 | Aura Absorption | CONFIRMED_BUG | Basic myt i aus łączą stealth z intercept; brak osobnego superior modifier i wymogu spalenia blood w aus. Tekst: src/cards/registry.json, ID 100111; implementacja: src/cards/effects/cards.ts. |
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
