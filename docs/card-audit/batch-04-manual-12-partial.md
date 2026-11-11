# Paczka 4 — pominięte pozycje 751–910

Ręczny wybiórczy przegląd tekstu oraz metadanych registry, bieżącej specyfikacji, osobnych handlerów i istniejących testów; każdy wpis niżej dotyczy wyłącznie zakresu wskazanego w dowodzie. Nie oznacza pełnego audytu reguł ani braku innych usterek. Część kart ma tylko przegląd specyfikacji bez dedykowanego testu; zapisano to indywidualnie.

Nowe wpisy: 43 wąskich przeglądów bez wykrytej niezgodności w opisanym zakresie; bez wpisu w pozycjach 501–1000: 0; zapisane nierozstrzygnięte przypadki: 2. Istnienie wpisu nie oznacza pełnej poprawności.

Walidacja: 38 plików istniejących testów, 498/498; typecheck i diff-check przeszły. Testy te dotyczą tylko wybranych zachowań i nie dowodzą pełnej zgodności kart. Pełnego zestawu testów nie uruchomiono w tej turze.

| ID | Karta | Status | Zakres i dowody |
|---:|---|---|---|
| 100866 | Guardian Angel | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: osobny overlay daje conditional intercept, prevent 1 oraz burn przy torpor; conditional-statics.test.ts sprawdza intercept i burn. Prewencja nie została tu osobno przetestowana. |
| 100871 | Gurchon Hall | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: hunting ground karmi dwóch najstarszych, uwzględnia remis i wspólny limit; hunting-ground-variants.test.ts. |
| 100872 | Guru | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: osobny handler daje blood po udanym referendum; archetypes.test.ts bada sukces i porażkę. Inne interakcje nie są w pełni zbadane. |
| 100875 | Gypsies | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: unique mortal ally 1 life, 1 strength, 1 bleed z +1 stealth i wymogiem Gangrel w spec. Inne interakcje nie są w pełni zbadane. |
| 100889 | Harvest Rites | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: Sabbat, dołączenie i dodatkowy blood po hunt; hunt-payouts.test.ts bada też limit jednej kopii. |
| 100897 | Haven Uncovered | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: dołączenie do vampire, rush i spalenie przez nosiciela; granted-rush.test.ts. |
| 100898 | Hawg | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: vehicle ze statyką press per combat w spec i limit jednego vehicle; legacy-equipment.test.ts. Rzeczywiste wydanie press wymaga dalszej weryfikacji. |
| 100900 | Haymaker | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: wymuszenie hand strike, first strike dla przeciwnika i zakaz na long; first-strike-cards.test.ts. Porównanie damage i press nie jest tu w pełni zbadane. |
| 100903 | Heart of Nizchetus | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: opcjonalne draw do 3 i umieszczenie takiej samej liczby na spodzie biblioteki; cheap-tail.test.ts. |
| 100904 | Heart of the City | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: przyłączenie i trwały bleed oraz limit jednej kopii; on-vampire-statics.test.ts. Pozostałe interakcje nie są w pełni zbadane. |
| 100906 | Heartblood of the Clan | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: akcja dodania blood przez Banu Haqim i przenoszenie z karty do uncontrolled; uncontrolled-graduation.test.ts. |
| 100909 | Helicopter | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: vehicle wchodzi locked i może dać unlock po sukcesie; vehicles-and-havens.test.ts. |
| 100913 | Heroic Might | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: basic/superior strength i przyznane strike burn equipment / 2R; action-attachments.test.ts i ledger-closeout.test.ts. Inne interakcje wymagają sprawdzenia. |
| 100918 | Hidden Strength | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: prevent X+1 za X blood w basic; combat-cards.test.ts. Superior press i inne interakcje nie zostały tu w pełni zbadane. |
| 100921 | Hide the Mind | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: osobny handler anuluje wymagający Auspex combat basic i reaction superior; discipline-filtered.test.ts. |
| 100925 | High Ground | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: maneuver tylko do long i set-range przy przewadze flight; one-each-round.test.ts. Pełny limit gry nie został tu sprawdzony. |
| 100932 | Homunculus | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: osobny handler unlockuje nosiciela za blood w unlock innego gracza; allies-retainers.test.ts. Obie wartości life w spec, reszta nie jest w pełni zbadana. |
| 100936 | Horrific Countenance | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: uwolnienie akcji, unlock blockera i brak kolejnego bloku; avoiding-the-block.test.ts. |
| 100937 | Horseshoes | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: wybór ready miniona oraz 1/2 damage; choosing-a-minion.test.ts. Nazwa testu mówi unpreventable, ale asercje same w sobie nie sprawdzają próby prewencji. |
| 100938 | Hospital Food | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: lock przy hunt anarch, dodatkowy blood po sukcesie i koszt przy bloku; hunt-payouts.test.ts. |
| 100939 | Hostile Takeover | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: osobny handler licytacji oraz przejęcie i płatność; auctions.test.ts. Nie zbadano wszystkich wariantów licytacji. |
| 100944 | Hunger Moon | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: tax 1 blood po hunt i próg pięciu w spec; events.test.ts bada pobranie blood. Próg spalenia nie jest tu osobno zweryfikowany. |
| 100945 | The Hungry Coyote | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: +1 hunt własnym Sabbat i brak bonusu pozostałym; blood-locations.test.ts. |
| 100946 | The Hunt Club | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: brak głosów w blood hunt nosiciela i +1 stealth przy diablerie; blood-hunt-answers.test.ts. |
| 100959 | Immortal Grapple | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: close-range grapple ogranicza strike obu stron do hand i superior pomija range w kolejnej rundzie; round-end.test.ts. Nie oznacza pełnej weryfikacji interakcji. |
| 100968 | Inbase Discotek, Frankfurt | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: lock po udanym hunt i blood dla vampire dowolnego gracza; hunt-payouts.test.ts. |
| 100970 | Inconnu Tutelage | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: event pozwala aktywnemu graczowi wydać cztery transfers i usunąć uncontrolled vampire w zamian za kartę; transfer-currency.test.ts. |
| 100971 | Increased Strength | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: bonus damage dla strike wymagających Potence, basic +1/superior +2 w spec; growing-fury.test.ts sprawdza interakcję strike Potence. |
| 100973 | Indomitability | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: basic prevent 1 i dwa warianty superior w spec; sweep.test.ts obejmuje wybrane użycie. Pozostałe okna i interakcje wymagają sprawdzenia. |
| 100984 | Information Highway | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: unique location z +2 transfers; permanents.test.ts. |
| 100987 | Innocent Bystander | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: usunięcie wierzchniej karty crypt celu po udanym bleed; reading-the-outcome.test.ts. |
| 100993 | Instability | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: wymóg Edge u prey lub uncontrolled oraz wybór prey; the-edge.test.ts. Dalsze interakcje nie są w pełni zbadane. |
| 100995 | Instinctive Reaction | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: tylko podczas działania predator, basic intercept i superior maneuver po bloku; blocker-riders.test.ts. |
| 100996 | Institution Hunting Ground | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: unique hunting ground z 1 blood dla ready vampire; legacy-locations.test.ts obejmuje rodzinę hunting ground. |
| 100999 | Intimidation | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: spec ma basic bleed +1 i superior +2; action-cards.test.ts sprawdza ofertę obu trybów. Pełnego działania superior tu nie testowano. |
| 101003 | Investiture | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: osobny handler i referendum dają priscus Sabbat, bonus cardinal i ograniczenie głosów Camarilla; in-this-referendum.test.ts. |
| 101007 | IR Goggles | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: electronic equipment z optional maneuver per combat w spec; legacy-equipment.test.ts sprawdza rzeczywisty kredyt maneuver. Dalsze interakcje wymagają weryfikacji. |
| 101008 | Iron Glare | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: wymóg obu dyscyplin i basic +2 votes / superior +2 limited bleed w spec. Nie znaleziono dedykowanego testu scenariuszowego karty; pełny timing i interakcje wymagają sprawdzenia. |
| 101010 | Irregular Protocol | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: wymuszenie abstain acting vampire i lock reagującego; legacy-reactions.test.ts. |
| 101014 | Ivory Bow | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: unique weapon 1R aggravated w spec; strike i inne interakcje nie są w pełni zweryfikowane. |
| 101015 | J. S. Simmons, Esq. | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: unique mortal retainer 1 life i +1 bleed w spec; działanie i inne interakcje wymagają dalszej weryfikacji. |
| 101018 | Jackie Therman | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: unique mortal retainer 1 life z maneuver per combat; legacy-minions.test.ts bada kredyt maneuver. |
| 101022 | Jericho Founding | REVIEWED_NO_ISSUE_FOUND | Wąski zakres: wymóg non-Camarilla, spalenie locations i opcja wykupu; legacy-political-sweeps.test.ts. |

## Nierozstrzygnięte w pozycjach 501–1000

100753 Focus the Blood; 100785 Fragment of the Book of Nod
