# Audyt kart w przygotowanych taliach

Zakres: 42 talii dostępnych w wyborze (`shell.ts`: `playable || halfDeck`): 28 pełnych i 14 half-decków. Źródło talii: `src/cards/registry.json`, snapshot 2026-11-01T20:12:30.427Z.

To zestawienie aktualnych wpisów audytu, nie ponowna weryfikacja wszystkich klauzul 727 kart. Do identyfikacji statusów użyto `docs/card-audit/manual-findings.json`; statusy i uzasadnienia mogą wymagać aktualizacji. Sama flaga `supported`, handler ani brak wykrytych błędów nie dowodzą pełnej poprawności.

## Podsumowanie

- Unikalne karty: **727**; z wpisem w audycie: **727**; bez wpisu: **0**. Brakujące ID w registry: **0**; karty bez flagi supported: **0**.
- Otwarte ustalenia dotyczą **12 różnych kart**: CODE_DISCREPANCY 0, PARTIAL_FIX 12, CONFIRMED_BUG 0, UNRESOLVED 0. UNRESOLVED oznacza kwestię nierozstrzygniętą, nie potwierdzony błąd.
- **13/42 talii** zawiera co najmniej jeden otwarty lub niezweryfikowany wpis. Pozostałe talie nie mają takich wpisów, ale to nadal nie dowód kompletnej poprawności.
- REVIEWED_NO_ISSUE_FOUND: **590** kart; FIXED_TARGETED: **125**. Obie klasy oznaczają ograniczony zakres sprawdzenia/naprawy, a nie certyfikat wszystkich interakcji.

## Dodatkowe scenariusze odtworzone w silniku

- **Blood Doll (100199)**: Nie zaoferowano zagrania na ally w tym scenariuszu; nie dowodzi to pełnej poprawności karty. Liczba talii: 17.
- **Villein (102121)**: Po zagraniu pierwszej Villein na wampira z 5 blood i przeniesieniu 2, druga opcja na tego wampira ma koszt **1 pool** — zgodny z wymaganym +1 pool w tym scenariuszu. To kontrola konkretnego scenariusza, nie wszystkich klauzul. Liczba talii: 17.

Regeneracja: `npx tsx scripts/card-audit-precons.mts`. Scenariusze używają syntetycznych fixture'ów z `tests/engine/fixtures.ts`; dane produkcyjne i silnik są takie jak w aplikacji.

## Zestawienie talii

Liczby to **różne ID kart**, a nie liczba kopii. Listy obejmują tylko otwarte ustalenia i brakujące wpisy; szczegółową ewidencję wszystkich kart i ich dowodów zawiera `preconstructed-cards.csv`.

| Zestaw / talia | Typ | Różnych kart | Otwarte / bez wpisu | Karty z otwartym ustaleniem |
|---|---|---:|---:|---|
| Fifth Edition / Hecata | pełna | 39 | 0 | — |
| Fifth Edition / Lasombra | pełna | 36 | 0 | — |
| Fifth Edition / Malkavian | pełna | 30 | 0 | — |
| Fifth Edition / Nosferatu | pełna | 35 | 0 | — |
| Fifth Edition / Toreador | pełna | 29 | 0 | — |
| Fifth Edition / Tremere | pełna | 33 | 0 | — |
| Fifth Edition / Ventrue | pełna | 32 | 0 | — |
| Fifth Edition (Anarch) / Banu Haqim | pełna | 34 | 0 | — |
| Fifth Edition (Anarch) / Brujah | pełna | 37 | 0 | — |
| Fifth Edition (Anarch) / Gangrel | pełna | 38 | 0 | — |
| Fifth Edition (Anarch) / Ministry | pełna | 36 | 1 | [Heart of Nizchetus](#karta-100903) |
| Fifth Edition (Companion) / Ravnos | pełna | 39 | 0 | — |
| Fifth Edition (Companion) / Salubri | pełna | 43 | 1 | [Touch of Valeren](#karta-102262) |
| Fifth Edition (Companion) / Tzimisce | pełna | 40 | 1 | [Childe of the Revolution](#karta-102246) |
| New Blood / Malkavian | half-deck | 30 | 0 | — |
| New Blood / Nosferatu | half-deck | 32 | 0 | — |
| New Blood / Toreador | half-deck | 27 | 0 | — |
| New Blood / Tremere | half-deck | 30 | 0 | — |
| New Blood / Ventrue | half-deck | 28 | 0 | — |
| New Blood II / Banu Haqim | half-deck | 32 | 0 | — |
| New Blood II / Brujah | half-deck | 30 | 1 | [Childe of the Revolution](#karta-102246) |
| New Blood II / Gangrel | half-deck | 31 | 0 | — |
| New Blood II / Ministry | half-deck | 33 | 0 | — |
| New Blood III / Hecata | half-deck | 25 | 0 | — |
| New Blood III / Lasombra | half-deck | 24 | 0 | — |
| New Blood III / Ravnos | half-deck | 31 | 0 | — |
| New Blood III / Salubri | half-deck | 27 | 1 | [Touch of Valeren](#karta-102262) |
| New Blood III / Tzimisce | half-deck | 34 | 0 | — |
| Sabbat V5 / Path of Caine | pełna | 36 | 3 | [Yawp Court](#karta-102199), [Dance with the Devil](#karta-102315), [Rage of Apedemak](#karta-102336) |
| Sabbat V5 / Path of Cathari | pełna | 35 | 1 | [Gostoso (G6)](#karta-201754) |
| Sabbat V5 / Path of Death | pełna | 41 | 1 | [Obedience](#karta-101309) |
| Sabbat V5 / Path of Power and the Inner Voice | pełna | 42 | 0 | — |
| 🏆 Tournament Winners 2025 / 2025-10-19 — Shalmath Toolbox (EC Day 2, Aarhus — Nerijus Mikalajūnas, 50p) | pełna | 36 | 3 | [Heart of Nizchetus](#karta-100903), [Hourglass of the Mind](#karta-100941), [Alex Wilkins (G5)](#karta-200048) |
| 🏆 Tournament Winners 2025 / 2025-06-21 — Gangrel Death Star (NAC 2025, Columbus — Martin Weinmayer, 62p, Wall) | pełna | 41 | 2 | [Heart of Nizchetus](#karta-100903), [André the Manipulator (G5)](#karta-200081) |
| 🏆 Tournament Winners 2024 / 2024-06-22 — Govern Resistance (NAC 2024, Columbus — Bill Troxel, 54p, Tzimisce Toolbox) | pełna | 35 | 0 | — |
| 🏆 Tournament Winners 2024 / 2024-11-16 — Gangrel Swarm v3 (Slovak NC, Bratislava — Jakub Rypar, 22p, Wall/Swarm) | pełna | 38 | 0 | — |
| 🏆 Tournament Winners 2024 / 2024-02-10 — Malkavian 95 Bleed (Mexico NC — Melissa Avilés, 10p, Stealth & Bleed) | pełna | 28 | 0 | — |
| 🏆 Tournament Winners 2024 / 2024-07-21 — Usurper High Council (Helsinki, Martin Weinmayer, 22p, Vote) | pełna | 25 | 0 | — |
| 🏆 Tournament Winners 2026 / 2026-06-27 — Lasombra Potato Groove (Spanish NC, Leganés — Miquel Jorge, 158p, Vote/Bleed) | pełna | 35 | 1 | [Obedience](#karta-101309) |
| 🏆 Tournament Winners 2024 / 2024-06-21 — The Unnamed Six Demon Bag (Origins Friday 2, Columbus — Darby Keeney, 44p, Baali Bleed) | pełna | 31 | 1 | [Heart of Nizchetus](#karta-100903) |
| 🏆 Tournament Winners 2023 / 2023-10-15 — Tupdog Brick Wall (EC 2023 Finalist — Rush Wall) | pełna | 34 | 1 | [Cedric (G4)](#karta-200257) |
| 🏆 Tournament Winners 2024 / 2024-03-09 — Weenie Animalism (Oceania NC, Auckland — Rush/Bleed) | pełna | 27 | 0 | — |

## Otwarte ustalenia — karty

Poniższe opisy przytoczono z audytu. CODE_DISCREPANCY bywa oparte wyłącznie na analizie statycznej; CONFIRMED_BUG jest statusem historycznym i nie zawsze oznacza odtworzenie nowym testem. Nie wolno traktować UNRESOLVED jako potwierdzonego błędu.

<a id="karta-100903"></a>
### Heart of Nizchetus (100903) — PARTIAL_FIX

Występuje w **4** taliach. Celowana naprawa: liczony draw Heart jest wznawiany po każdym wyborze źródła (w tym Tarot/Cache) i po save/load; dopiero po draw następuje wybór do przesunięcia na spód, w liczbie rzeczywiście dobranych kart. Opcje liczby uwzględniają aktywne store; heart-draw-redirect.test.ts. Nadal brak reprezentacji właściciela karty w ręce i poprawnego skierowania do biblioteki właściciela (np. Agaitas), niezweryfikowana kompletna semantyka choice/up to i kolejność wszystkich efektów; inne ścieżki wielokrotnego draw nie zostały naprawione. Historycznie: Odtworzony błąd: przy Heart i Shilmulo Tarot w fazie unlock wybór draw 2 natychmiast pyta o przesunięcie karty na spód, przed rozwiązaniem któregokolwiek przekierowanego dobierania; świeżo dobranych kart nie można wtedy wybrać. W compile.ts drawCards tworzy oczekujące wybory, lecz bury jest umieszczane nad nimi. Ponadto liczba opcji draw jest ograniczona długością biblioteki bez uwzględnienia store; pozostałe interakcje wymagają sprawdzenia. Poprzednia wąska ocena: Wąski zakres: opcjonalne draw do 3 i umieszczenie takiej samej liczby na spodzie biblioteki; cheap-tail.test.ts. Stan kodu sprawdzony ponownie: CardInstance w ręce nie ma pola owner (tylko MinionState i PermanentInPlay je mają), więc bury nie może trafić do biblioteki właściciela karty (RTR 19970425, LSJ 20060921); bury zawsze wraca do biblioteki kontrolera. Wymaga reprezentacji właściciela kart w ręce, niezbędnej także dla Agaitas (dotąd tylko cryptPerm).

<a id="karta-100941"></a>
### Hourglass of the Mind (100941) — PARTIAL_FIX

Występuje w **1** taliach. Częściowo naprawiono: odrębne warianty [pot]/[tem]; [tem] dobiera cztery karty bez discard, następnie wybiera do czterech kart z ręki na wierzch w zadanej kolejności i unlockuje przed zakończeniem akcji. Uwzględniono przekierowanie draw, zapis/wznowienie oraz pustą bibliotekę (tests/cards/hourglass-audit.test.ts). Przy niepełnej ręce przyjęto wykonanie możliwej części efektu (testy 'moves available cards even if fewer than four can be drawn' i 'unlocks even with an empty hand'); najbliższy analog to G00160 (LSJ 20060620: 'draw as much as you can'), ale brak rulingu dla przeniesienia, więc interpretacja wymaga potwierdzenia. Usunięto nieuprawnione +1 hand size superior bez counterów. [TEM] superior teraz obsługuje opłacanie counterów: podczas unlock fazy wampir może spalić 2 krew aby dodać 1 counter (onControllerUnlock w cards.ts), a +1 hand size za każdy counter działa tylko gdy wampir jest ready (handSizePerCounter dla kart dołączonych w derived.ts). Testy w hourglass-audit.test.ts ('Hourglass [TEM] superior unlock-phase counters'), kontrola mutacyjna potwierdzona dla derived.ts. Logi wyboru są maskowane, ale identyfikatory zakrytych kart w projekcji stanu nadal mogą umożliwiać ich śledzenie (istniejący szerszy problem prywatności). Pozostaje PARTIAL_FIX ze względu na otwartą interpretację niepełnej ręki.

<a id="karta-101309"></a>
### Obedience (101309) — PARTIAL_FIX

Występuje w **2** taliach. Dodano sprawdzanie młodszego działającego vampire z uwzględnieniem capacity, właściwego blockera i powodzenia próby bloku; dodano reakcję celu niezablokowanego rush w state C. tests/cards/end-action.test.ts. Reakcja na rush korzysta z istniejącego okna C, a nie odrębnego impulsu bezpośrednio przed rozpoczęciem combat po zakończeniu innych efektów resolution; pełny timing i pozostałe interakcje nadal wymagają pracy. Paczka 1: pokryte przez end-action.test.ts (tylko blocker, młodszy vampire, rush, basic/superior). Nieobjęte: ANK 20171212 (zastąpiony przez slave nie może grać) — w modelu nieosiągalne: silnik nigdy nie przypisuje ponownie af.acting, więc zastąpienie wampira nie zmienia przeciwnika w akcji. LSJ 19991025 (starszy unlocked vampire przed nową walką) — otwarte. Sonda: Psyche! superior jest oferowana w combat.endOfRound (gdy Bob nie kontynuuje) i tworzy drugą walkę; Obedience nie ma okna przed startem tej walki. Bramka beforeCombatWithYoungerActor (compile.ts ~5435) obejmuje tylko walkę z akcji (stan C, blok, rush), nie walkę kolejkowaną. Domknięcie wymaga nowego okna 'przed startem kolejkowanej walki' w silniku — zmiana w przepływie walki, do akceptacji. Status bez zmian.

<a id="karta-102199"></a>
### Yawp Court (102199) — PARTIAL_FIX

Występuje w **1** taliach. Naprawiono kolejkę walk przed referendum i jego anulowanie po opuszczeniu ready przez działającego wampira. tests/cards/crypt-and-uncontrolled.test.ts: rzeczywisty torpor (także w drugiej walce Psyche!), torpor samego przeciwnika, symulowany powrót i save/load, damage między walkami. Zweryfikowano RTR 19970630 (crypt-and-uncontrolled.test.ts: obrażenia ambush są zadawane po CombatEnded jako środowiskowe, bez DamageInflicted). Faktyczne użycie Warsaw Station w środku akcji nie jest zaimplementowane. Rötschreck nie ma pelnej implementacji (master: out-of-turn z warunkiem aggravated damage, nie tylko strikeCombatEnds) — wymaga osobnej implementacji, nie testu. Pozostałe interakcje timingow/prevention niezweryfikowane. Rulings LSJ 20060902, LSJ 20090325-1, ANK 20180910-1.

<a id="karta-102246"></a>
### Childe of the Revolution (102246) — PARTIAL_FIX

Występuje w **2** taliach. Osobny obowiązek hunt trwa do ogłoszenia hunt lub końca tury nawet po uzyskaniu blood; tests/cards/token-vampire.test.ts. Pozostałe interakcje i granice tury wymagają dalszej weryfikacji. Aktualizacja: obowiązek nie przechodzi na kolejną turę, jeżeli Childe został przeniesiony do uncontrolled (test emitujący zdarzenie Banishment i save/load w token-vampire.test.ts). Wybór źródeł wyszukania i pozostałe interakcje nadal wymagają audytu. Paczka 1: pokryte przez token-vampire.test.ts (obowiązek hunt, uncontrolled, Anarch). Zweryfikowano LSJ 20041201-2 w zakresie osiągalnym w silniku (tests/cards/childe-token-burn.test.ts: spalony token trafia do ash heap, crypt bez zmian; silnik nie ma ścieżki wkładania tokena z biblioteki do crypt). Status bez zmian.

<a id="karta-102262"></a>
### Touch of Valeren (102262) — PARTIAL_FIX

Występuje w **2** taliach. Combat ograniczono do strike przeciwnika; prevention-provenance-audit.test.ts bada dostępność i źródła. Action dopuszcza pełnego aktora, jeśli koszt krwi zostawia miejsce, respektuje ochronę przed wyborem i limit starting life ally; minion-target-actions.test.ts. Stare pakiety bez strikePhase i pełne przejście superior oraz dalsze interakcje pozostają otwarte. Paczka 1: minion-target-actions.test.ts i prevention-provenance-audit.test.ts pokrywają akcję i combat. Zweryfikowano LSJ 20001114 dla basic combat (tests/cards/touch-valeren-ruling.test.ts: opcja jest oferowana tylko przy obrażeniach do zapobieżenia, nie bez nich). Nadal nie zweryfikowano starych pakietów bez strikePhase. Status bez zmian. Model danych obrazen jest poprawny: nowe pakiety ze strike maja strikePhase i fromStrike (ammunition jest scalany do glownego pakietu, potwierdzone testem tests/cards/ammo-strike-provenance.test.ts); stare zapisy ze strikePhase maja fromStrike odtwarzane migracja (engine.ts:319); stare zapisy BEZ strikePhase pozostaja celowo niejednoznaczne i nie sa zgadywane jako strike (np. Outside the Hourglass ma source=przeciwnik ale nie jest strike) — to swiadoma decyzja, nie bug.

<a id="karta-102315"></a>
### Dance with the Devil (102315) — PARTIAL_FIX

Występuje w **1** taliach. Superior nie pobiera blood automatycznie; w kroku range można opcjonalnie zapłacić za dodatkowy close maneuver, a bez blood nadal zagrać kartę. round-end.test.ts. Zakup jest obecnie dostępny tylko w range przy long, nie dowolnie w rundzie; wymagane są dalsze prace nad timingiem i ograniczeniami dyscyplin. Brak wpisu w migawce dla kluczowej kwestii; wymaga potwierdzenia na VEKN (sprawdzono forum, brak konkretnego rulingu).

<a id="karta-102336"></a>
### Rage of Apedemak (102336) — PARTIAL_FIX

Występuje w **1** taliach. Bonus dotyczy hand strike, nie strength ani melee weapon; testy hand, Roundhouse i Femur oraz hand size. tests/cards/frenzy-direction-audit.test.ts i temporary-hand-size.test.ts. Wygaszanie wszystkich wcześniejszych efektów frenzy przez Shield wymaga dalszej weryfikacji. Brak wpisu w migawce dla kluczowej kwestii; wymaga potwierdzenia na VEKN (sprawdzono forum, brak konkretnego rulingu).

<a id="karta-200048"></a>
### Alex Wilkins (G5) (200048) — PARTIAL_FIX

Występuje w **1** taliach. Dodano opcję końcowego celu successful bleed po rozstrzygnięciu: zapłata 1 pool i przejęcie Alexa albo odmowa. tests/cards/alex-wilkins-audit.test.ts obejmuje przekierowanie, zero bleed i save/load. Kolejnosc wzgledem oust i innych efektow rozstrzygniecia wymaga weryfikacji; brak wpisu w migawce dla Alex Wilkins, wymaga potwierdzenia na VEKN.

<a id="karta-200081"></a>
### André the Manipulator (G5) (200081) — PARTIAL_FIX

Występuje w **1** taliach. +2 hand size wyliczane dla ready, także locked; torpor usuwa bonus, test crypt-wave-1.test.ts. Automatyczny draw/discard przy zmianie stanu i wszystkie przejścia wejścia/wyjścia nadal wymagają poprawy.

<a id="karta-200257"></a>
### Cedric (G4) (200257) — PARTIAL_FIX

Występuje w **1** taliach. Dodano możliwość zapłacenia 1 blood za unlock po blokowaniu akcji directed, w oknie po rozstrzygnięciu i walce; tests/cards/cedric-audit.test.ts obejmuje brak celu przy akcji undirected, zapłatę, odmowę i save/load. Flight importowany i testowany. Nadal brak implementacji Tremere slave, a ścisły timing po natychmiastowym zakończeniu akcji i przy kontynuacji po bloku wymaga dalszego przeglądu. Źródła: https://www.vekn.net/179-rules/vtes-rulebook oraz https://www.vekn.net/forum/rules-questions/75320-rules-questions-for-someone-coming-back-in-to-v-tes.

<a id="karta-201754"></a>
### Gostoso (G6) (201754) — PARTIAL_FIX

Występuje w **1** taliach. Po successful bleed prey gracz wybiera gain blood lub odmowę, wybór można zapisać i wznowić; crypt-wave-4.test.ts. Wybór jest kolejkwany przez resolver akcji, timing względem wszystkich efektów rozstrzygnięcia wymaga weryfikacji. Brak wpisu w migawce dla kluczowej kwestii; wymaga potwierdzenia na VEKN (sprawdzono forum, brak konkretnego rulingu).

