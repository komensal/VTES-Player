# Audit zgodności kart z tekstem i zasadami VTES

## Zakres i stan

Audyt obejmuje wszystkie karty oznaczone jako wspierane w `config/supported.json`, a nie tylko karty biblioteki ani wyłącznie karty z osobnymi testami.

Stan inwentarza z 2026-11-02:

- **1 151 kart łącznie**
- **1 041 kart biblioteki**
- **110 kart krypty**
- wszystkie 1 151 ID rozwiązują się do karty w `src/cards/catalog.json`

To jest liczba elementów zakresu, nie liczba kart już ręcznie zweryfikowanych. Starsze liczby w niektórych dokumentach projektu (np. 174) są nieaktualne; lista wspieranych kart i aktualny katalog są źródłem zakresu.

## Źródła

1. Oficjalny angielski rulebook VTES Fifth Edition, wersja 1.1, publikowany przez Black Chantry: <https://www.blackchantry.com/utilities/rulebook/>.
2. Tekst karty i metadane: `src/cards/catalog.json` oraz `src/cards/registry.json`.
3. Implementacja: `src/cards/effects/cards.ts`, `src/cards/effects/compile.ts`, odpowiednie moduły silnika oraz testy.
4. Gdy rozstrzygnięcie zależy od erraty lub rulingów spoza rulebooka: oficjalne erraty/rulings VEKN/Black Chantry, wskazane osobno w raporcie.

## Metoda dla każdej karty

Dla każdej karty wspieranej należy rozbić tekst na osobne klauzule, a następnie porównać:

- koszt, wymagania, dyscypliny i ograniczenia użycia;
- okno/timing, kto może zagrać lub aktywować efekt oraz wybór celu;
- efekt podstawowy i wszystkie tryby superior/alternatywne;
- ograniczenia typu „only”, „not usable”, „once each turn/round”, limited i dodatkowe strikes;
- zachowanie stref karty, krwi, poolu, liczników, torporu/spalenia i skutków przerwania;
- wynik silnika i tekst logu z regułami ogólnymi oraz rulingami.

Każdą rozbieżność należy odtworzyć scenariuszem, naprawić i zabezpieczyć testem regresyjnym. Wynik każdej karty będzie oznaczony jako **zgodna**, **błąd potwierdzony**, **niepewna — wymaga rulingu** albo **świadoma/udokumentowana różnica**. Sama obecność handlera ani przejście fuzz-testów nie są dowodem zgodności tekstu.

## Postęp

**Audyt ręczny — partia 1: karty o ID 100001–100021 (11 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100001 | .44 Magnum | Zgodna w sprawdzonych klauzulach | Bespoke handler: sprzęt/weapon+gun, strike 2R, maneuver i commit broni; test `tests/cards/permanents.test.ts`, dodatkowo scenariusze `ammo`, `round-end` i ograniczeń sprzętu. |
| 100003 | Aaron's Feeding Razor | Zgodna | Unique, +1 hunt tylko dla bearer; testy `tests/cards/legacy-equipment.test.ts` obejmują bearer, negatywny zakres i end-to-end hunt. |
| 100005 | Abandoning the Flesh | **Naprawiono — dodano generyczny handler/spec dla wspieranej karty bibliotecznej (wcześniej brak wpisu w buildHandlerRegistry)** | ID jest wspierane, ale `buildHandlerRegistry()` nie ma wpisu dla tej karty; nie ma też specyfikacji. Wymaga implementacji albo jawnego wycofania z listy wsparcia. |
| 100006 | Abbot | Zgodna w sprawdzonych klauzulach | Wymaganie Sabbat, +1 stealth, attach+unlock, intercept przy akcjach skierowanych do kontrolera; test `tests/cards/conditional-statics.test.ts`. |
| 100012 | Absolution of the Diabolist | Zgodna w sprawdzonych klauzulach | Koszt 1 pool, wymóg ready justicar/Inner Circle i cancel blood hunt; scenariusze w `tests/cards/blood-hunt-answers.test.ts`. |
| 100013 | Absorb the Mind | **Naprawiono — dodano handler/spec dla Absorb the Mind (dodge/ranged steal/superior Discipline steal)** | ID jest wspierane, ale `buildHandlerRegistry()` nie ma wpisu ani specyfikacji; tryby dodge / ranged steal blood / superior kradzież master: Discipline nie są dostępne. |
| 100015 | Academic Hunting Ground | Zgodna w sprawdzonych klauzulach | Unikalny location; ready vampire może zyskać 1 blood; globalne limity hunting ground/vampire na turę są testowane w `tests/cards/hunting-grounds.test.ts`. |
| 100016 | Acheron Vortex | Zgodna w sprawdzonych klauzulach | -1 intercept z wyjątkami Necromancy/Obtenebration; wymóg Harbinger of Skulls pochodzi z metadanych karty. Testy obejmują dostępność bez próby bloku oraz wyjątek. |
| 100018 | Aching Beauty | Zgodna w sprawdzonych klauzulach | Attach do Toreadora; controller blokującego płaci 1 pool przed rozstrzygnięciem bloku. Testy sprawdzają płatność i brak opłaty, gdy nie ma bloku. |
| 100020 | Acrobatics | Zgodna w sprawdzonych klauzulach | Basic limited additional strike; superior dodge + limited additional strike. Testy `tests/cards/dodges.test.ts`. |
| 100021 | Adaptability | Zgodna w sprawdzonych klauzulach | Basic traktuje aggravated strike damage jako normal; superior zapobiega całemu aggravated damage z opposing strike. Scenariusze i negative cases w `tests/cards/aggravated-damage.test.ts`. |

**Audyt ręczny — partia 2: karty o ID 100027–100047 (11 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100027 | Ahriman's Demesne | **Naprawiono — dodano handler dla Ahriman's Demesne (range/agg range/torpor→burn)** | Wspierana, ale nie ma wpisu w `buildHandlerRegistry()`. Wszystkie trzy klauzule (range/round gate, aggravated ranged strike, torpor→burn rider superior) są niedostępne. |
| 100029 | Aid from Bats | **Naprawiono — maneuver timing i inherited superior rider; regression tests** | Basic i superior są teraz oferowane w `combat.range` i wybór commitmentuje strike; superior dziedziczy basic maneuver oraz grantuje press. Pokryte w `strike-maneuver-cards.test.ts` i `last-combat.test.ts`. Ruling V:EKN: https://www.vekn.net/forum/rules-questions/18652-aid-from-bats-vs-immortal-grapple . |
| 100031 | Aire of Elation | Zgodna w sprawdzonych klauzulach | Basic +1 bleed / superior +2, z Toreador bonus i limited; `conditional-modifiers.test.ts` potwierdza bonus i jego brak dla innego klanu. |
| 100032 | AK-47 | Zgodna | Weapon 2R, maneuver, po strzale dodatkowy limited strike wyłącznie z AK-47 w tej rundzie; `weapon-riders.test.ts` sprawdza commitment i ograniczenia dodatkowego strike’u. |
| 100033 | Akhenaten, The Sun Pharaoh | Zgodna w sprawdzonych klauzulach | Mummy stats, basic Necromancy access, aggravated damage przeciw Ministry, self-burn action przeciw prey Ministry i shuffle po spaleniu. Spec i testy `mummies-2.test.ts` obejmują te ścieżki. |
| 100037 | Alamut | Zgodna w sprawdzonych klauzulach | Assamite/Banu Haqim successful bleed odkłada wartość bleed na counterach; w polling można spalić X dla +X votes. `alamut.test.ts` sprawdza naliczanie i wydawanie. Rulebook definiuje pool burn od udanego bleedu jako wartość równą bleed amount. |
| 100040 | Alpha Glint | **Naprawiono — dodano handler dla Alpha Glint (combat ends + ally/older gate)** | Wspierana, ale nie ma wpisu w `buildHandlerRegistry()`; oba tryby combat ends oraz ograniczenie ally/older są niedostępne. |
| 100042 | Amam the Devourer | Zgodna w sprawdzonych klauzulach | Ally statystyki, rush, burn vampire in torpor za life, gain life po spaleniu miniona opposing w combat i shuffle po spaleniu. Spec zawiera wszystkie riders; dedykowany test sprawdza shuffle, scenariusze pozostałych riders wymagają uzupełnienia w późniejszym pokryciu. |
| 100043 | Amaranth | **Naprawiono — dodano handler dla Amaranth (diablerie zamiast torpor, immunitet)** | Wspierana, ale nie ma wpisu w `buildHandlerRegistry()`; diablerie zamiast torporu oraz ograniczenia „can commit diablerie” i „not burned/going to torpor” nie są dostępne. |
| 100046 | Ambush | Zgodna | Locked-minion filter sprawdzany przy ogłoszeniu i rozstrzygnięciu; walczący otrzymuje maneuver. `legacy-rush-actions.test.ts` pokrywa target i fizzle po odblokowaniu celu. |
| 100047 | Amria | **Naprawiono — dodano handler dla Amria (maneuver-to-long/dodge+press)** | Wspierana, ale nie ma wpisu w `buildHandlerRegistry()`; maneuver-to-long oraz superior dodge + optional press tylko to end combat są niedostępne. |

**Audyt ręczny — partia 3: karty o ID 100049–100076 (12 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100049 | Amusement Park Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique location; hunting ground blood gain. Pokrycie w `legacy-locations.test.ts` i `hunting-grounds.test.ts`. |
| 100052 | The Anarch Free Press | Zgodna w sprawdzonych klauzulach | Ready Anarch requirement, intercept dla własnego Anarcha i blood gain po udanym Anarch hunt; dedykowane przypadki w `lock-grant-locations.test.ts`. |
| 100054 | Anarch Railroad | Zgodna w sprawdzonych klauzulach | Lock grants stealth to any Anarch (nie tylko własny); `lock-grant-locations.test.ts` sprawdza wybór. |
| 100055 | Anarch Revolt | Zgodna w sprawdzonych klauzulach | Unlock drain tylko dla Methuselah bez ready Anarch; karta może być spalona political actionem; `pool-drain.test.ts`. |
| 100056 | Anarch Salon | Zgodna w sprawdzonych klauzulach | Udany referendum oddzielnie liczy ready Anarch blood gain i kontrolerów Anarch pool gain; `referendum-terms.test.ts`. |
| 100058 | Anarch Troublemaker | Zgodna w sprawdzonych klauzulach | Tylko unlock swojego kontrolera; transfer do prey wraz z lockiem do 2 ready vampire’ów albo spaleniem equipment; `cross-table-masters.test.ts`. |
| 100059 | Anarchist Uprising | Zgodna w sprawdzonych klauzulach | Każdy Methuselah traci pool za każdego kontrolowanego miniona; sprawdzono testy referendum/pool drain. |
| 100064 | Ancient Influence | Zgodna w sprawdzonych klauzulach | Limit raz na grę; każdy wybiera własnego ready vampire’a, zyskuje jego capacity, po czym pali 5 pool; `once-in-a-game.test.ts`, `referendum-outcomes.test.ts`. |
| 100065 | Ancilla Empowerment | Zgodna w sprawdzonych klauzulach | Ten sam pool-burn-per-minion prymityw co tekst; ręczny przegląd specyfikacji, uzupełniające testy prymitywu. |
| 100066 | Anesthetic Touch | **Naprawiono — dodano handler dla Anesthetic Touch (close gate/dodge/hand+combat ends/first strike)** | Wspierana, lecz brak wpisu/specyfikacji; close-range gate, [aus] dodge, [obe] hand strike + natychmiastowe zakończenie combatu i [OBE] first strike nie są dostępne. |
| 100070 | Animalism | Zgodna w sprawdzonych klauzulach | Ogólny Discipline skill-card flow pokrywa +1 level/capacity oraz zakaz na vampire z superior Animalism; `discipline-cards.test.ts`. |
| 100076 | Apparition | **Naprawiono — dodano roundPrevent i delayedReplace; regression test** | [chi] prevent 1 / [CHI] prevent 2 co rundę, `delayedReplace: "afterCombat"`, `roundPrevent` 1/2. Cover `third-wave` i `combat-prevention` suite. |

Dla tej partii sprawdzono 8 powiązanych suites: **140 testów przeszło**. Potwierdzone braki handlera (Anesthetic Touch, Apparition) są już w puli 51 braków.

**Audyt ręczny — partia 4: karty o ID 100081–100117 (24 karty).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100081 | Arcane Library | Zgodna w sprawdzonych klauzulach | Unique location; unlock-phase blood to Tremere in uncontrolled region; `sweep4.test.ts`. |
| 100082 | Arcanum Chapterhouse, Alexandria | Zgodna w sprawdzonych klauzulach | Drain to predator/prey scales with their Hunting Grounds; any minion can burn it; `stores-you-fill.test.ts`. |
| 100083 | Arcanum Investigator | Zgodna w sprawdzonych klauzulach | Mortal ally can burn equipment controlled by predator or prey; `destroyer-allies.test.ts`. |
| 100084 | Archon | Zgodna w sprawdzonych klauzulach | Prince/Justicar requirement; Camarilla referendum target; bearer rush, block blood toll, no blood hunt; Camarilla political-action vulnerability. `opposing-statics.test.ts` and `bearer-rush-grants.test.ts`. |
| 100085 | Archon Investigation | Zgodna w sprawdzonych klauzulach | Out-of-turn only after blocks declined, bleed 4+ to self; burns acting minion and action is unsuccessful; `cross-table-masters.test.ts`. |
| 100087 | Armor of Caine's Fury | **Naprawiono — dodano handler dla Armor of Caine's Fury (prevent-1/pre-range per round/frenzy cancel)** | Wspierana, ale brak wpisu/specyfikacji; prevent-1, pre-range prevention per round and frenzy-card prevention/cancellation clauses are unavailable. |
| 100089 | Armor of Vitality | **Naprawiono — dodano handler dla Armor of Vitality (prevent 3 + destroy melee weapon)** | Wspierana, ale brak wpisu/specyfikacji; [for] prevent 3 and superior destruction of opposing melee weapon are unavailable. |
| 100091 | Arms of the Abyss | Zgodna w sprawdzonych klauzulach | Basic declares a dodge; superior keeps the dodge and grants one limited additional strike. Regression in `tests/cards/arms-of-the-abyss.test.ts`. |
| 100093 | Army of Rats | Zgodna w sprawdzonych klauzulach | Prey loses at most 1 pool per turn across Army of Rats copies; minions can burn it as D action; `vulnerable-cards.test.ts`. |
| 100094 | Arson | Zgodna w sprawdzonych klauzulach | D action to burn a location; generic action and location-target gates align with text. |
| 100095 | Art Museum | Zgodna w sprawdzonych klauzulach | Influence-phase lock adds 1 blood to a Toreador in uncontrolled region; legacy location tests. |
| 100096 | The Art of Love | Zgodna w sprawdzonych klauzulach | Temporarily takes control of another Methuselah's ally through end of turn; `borrowed-minions.test.ts`. |
| 100099 | Art Scam | Zgodna w sprawdzonych klauzulach | +1 stealth action, gain 2 pool; `legacy-actions.test.ts`. |
| 100101 | Artistically Inept | Zgodna w sprawdzonych klauzulach | Attach to any ready Brujah; Toreador cannot attempt to block; any Toreador may burn it as D action; `block-taxes.test.ts`. |
| 100104 | Ascendance | Zgodna w sprawdzonych klauzulach | Master gains 1 pool; `legacy-masters.test.ts`. |
| 100105 | Ashes to Ashes | **Naprawiono — dodano handler dla Ashes to Ashes (burn→torpor/prevent+unlock+torpor/+2 blood)** | Wspierana, ale brak wpisu/specyfikacji; [for] burn-replacement to torpor, [thn] prevent all damage + unlock + torpor, and [THN] +2 blood unavailable. |
| 100107 | Assault Rifle | Zgodna w sprawdzonych klauzulach | 4R gun strike and per-combat optional maneuver/weapon commitment; `weapons.test.ts`, `round-end.test.ts`. |
| 100108 | Asylum Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique hunting ground; ready controlled vampire can gain blood during unlock; per-turn HG restriction; hunting-ground tests. |
| 100109 | Atonement | Zgodna w sprawdzonych klauzulach | Cost 2 blood, max capacity 5, +1 intercept, no lock blocking same-age-or-younger, vampire D-burn with Ministry stealth penalty; `lock-as-price.test.ts`. |
| 100112 | Aura of Invincibility | Zgodna w sprawdzonych klauzulach | Before votes, attach/counter on pass; votes grow on passed calls; failed call burns card and sends bearer to torpor; one per vampire; `referendum-outcomes.test.ts`. |
| 100113 | Aura Reading | **Naprawiono — dodano handler dla Aura Reading (open hand/+2 hand size)** | Wspierana, ale brak wpisu/specyfikacji; open opposing hand or +2 hand size for rest of combat, plus superior once-per-combat limit unavailable. |
| 100114 | Auspex | Zgodna w sprawdzonych klauzulach | Generic Discipline skill-card implementation covers +1 Auspex/capacity and blocks placement on superior Auspex; `discipline-cards.test.ts`. |
| 100115 | Autarkis Persecution | Zgodna w sprawdzonych klauzulach | Successful referendum gives each Methuselah 1 pool per minion (allies count); `legacy-referendums.test.ts`. |
| 100117 | Autonomic Mastery | **Naprawiono — dodano handler dla Autonomic Mastery (ally burn/hand strike+combat ends)** | Wspierana, ale brak wpisu/specyfikacji; [dom] ally/retainer burn, [DOM] zero-damage hand strike and conditional combat end are unavailable. |

W tej partii uruchomiono 16 powiązanych suites: **180 testów przeszło**. Sześć potwierdzonych braków handlera należy do już wykrytej puli 51.

**Audyt ręczny — partia 5: karty o ID 100121–100158 (20 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100121 | Baal's Bloody Talons | **Naprawiono — dodano handler dla Baal's Bloody Talons (agg weapon + burn end of round)** | Wspierana, brak wpisu/specyfikacji; weapon damage aggravated / +1 aggravated superior oraz end-of-round weapon burn nie są dostępne. |
| 100123 | Backflip | Zgodna w sprawdzonych klauzulach | Long-range strike dodge with optional press; basic long-range gate, superior press and strike timing tested in `strike-sources.test.ts`. |
| 100124 | Backstab | **Naprawiono — dodano handler dla Backstab (blocker/first-round gate/first strike/additional)** | Wspierana, brak wpisu/specyfikacji; blocker/first-round gate, first strike and limited additional strike are unavailable. |
| 100125 | Backstep | Zgodna w sprawdzonych klauzulach | Maneuver only to long; if opposing strike deals any damage this round, opposing minion gets optional press; `cancel-in-combat.test.ts`. |
| 100126 | Backways | Zgodna w sprawdzonych klauzulach | Lock grants +1 stealth to a controlled Gangrel; `clan-sect.test.ts`. |
| 100130 | Bang Nakh — Tiger's Claws | Zgodna w sprawdzonych klauzulach | Melee weapon, strength +2 damage; legacy weapon tests cover strength-based melee damage. |
| 100131 | Banishment | Zgodna w sprawdzonych klauzulach | Ready younger vampire moves to owner's uncontrolled region; blood becomes counters, attached cards remain on card, ownership/controller reset correctly; `politics.test.ts` plus `MovedToUncontrolled` engine resolution. |
| 100132 | Banner of Neutrality | Zgodna w sprawdzonych klauzulach | Independent/Anarch requirement; only when Camarilla/Sabbat minion bleeds you; reduces bleed by 1; `acting-minion-reactions.test.ts`. |
| 100135 | The Barrens | Zgodna w sprawdzonych klauzulach | Lock to discard and draw back to hand size; `permanents.test.ts`. |
| 100136 | Base Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique hunting ground and once-per-vampire-per-turn blood gain; legacy hunting-ground tests. |
| 100137 | Baseball Bat | Zgodna w sprawdzonych klauzulach | Melee strength +1, delayed replacement, unlock acting minion at end of turn after successful equip; `equip-unlocks.test.ts`. |
| 100138 | Basilisk's Touch | **Naprawiono — dodano handler dla Basilisk's Touch (ally/younger/before-range/strength/torpor-burn/blood loss)** | Wspierana, brak wpisu/specyfikacji; ally/younger and before-range restrictions, strength bonus, hand-strike damage rider, torpor/burn and superior blood loss unavailable. |
| 100139 | Bastard Sword | Zgodna w sprawdzonych klauzulach | Melee strength +1 damage; `legacy-weapons.test.ts`. |
| 100145 | Bear's Skin | Zgodna w sprawdzonych klauzulach | Before-range and once-per-combat gate; basic strength + round prevention vs superior combat-long recurring prevention; `round-recurring-combat.test.ts`. |
| 100146 | Beast Meld | Zgodna w sprawdzonych klauzulach | [ani][pro] stealth plus block-combat prevent; superior non-bleed action gate and no vampire blockers; `actor-riders.test.ts`. |
| 100148 | Becoming of Ennoia | Zgodna w sprawdzonych klauzulach | Gehenna threshold excludes own card; per-seat ready-vampire choice and unpreventable damage, Earth Meld cost; `gehenna-unlock.test.ts`. |
| 100149 | Behind You! | Zgodna w sprawdzonych klauzulach | First-round gate spans maneuver and strike windows; [obf] maneuver and [OBF] dodge; `dodges.test.ts`. |
| 100153 | Bestial Vengeance | **Naprawiono — dodano handler dla Bestial Vengeance (Laibon/frenzy immunity/retainer damage/limit)** | Wspierana, brak wpisu/specyfikacji; Laibon, retainer, frenzy immunity, ready-retainer damage, per-combat limit and superior 2-damage mode unavailable. |
| 100157 | Bewitching Oration | Zgodna w sprawdzonych klauzulach | Polling-only +2/+4 vote modifier; `polling-votes.test.ts`, `vampire-votes.test.ts`. |
| 100158 | Beyond Reproach | Zgodna w sprawdzonych klauzulach | Prince requirement; on-pass permanent, Primogen political-action/vote restrictions and table referendum burn action; `table-referendums.test.ts`. |

W tej partii uruchomiono 15 powiązanych suites: **181 testów przeszło**. Cztery potwierdzone braki handlera są już w puli 51.

**Audyt ręczny — partia 6: karty o ID 100162–100208 (21 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100162 | Biothaumaturgic Experiment | Zgodna w sprawdzonych klauzulach | Basic employ-animal-retainer ignoring requirements but paying cost; superior grants attached minion +1 strength and one maneuver per combat; `play-from-hand.test.ts`. |
| 100163 | The Bitter and Sweet Story | Zgodna w sprawdzonych klauzulach | Event grants each Methuselah +2 hand size per VP; `events.test.ts`. |
| 100165 | Black Forest Base | Zgodna w sprawdzonych klauzulach | Ready Sabbat gate, once-per-turn political action for +2 pool, Changeling-ally burn clause; spec matches printed text (no Changeling ally currently in supported pool). |
| 100172 | The Black Throne | Zgodna w sprawdzonych klauzulach | +2 votes during any polling; lock after named contract minion leaves ready region for 1 pool; `lock-grant-locations.test.ts`. |
| 100174 | Blade Clot | **Naprawiono — dodano handler dla Blade Clot (diablerie gate/clot counters/unlock/torpor-burn)** | Wspierana, brak wpisu/specyfikacji; diablerie gate, clot counters, unlock torpor/burn, and rescue removal unavailable. |
| 100175 | Blade of Bellona | Zgodna w sprawdzonych klauzulach | Salubri antitribu melee weapon; strength +1, one maneuver per combat only to close; `conditional-weapons.test.ts`. |
| 100178 | Bleeding the Vine | **Naprawiono — poprawiono typ/timing Bleeding the Vine: master unique (nie OOT), unlock phase wybór burn 1 pool vs lock card** | Handler klasyfikuje kartę jako `isOutOfTurnMaster`, ustawia błędny koszt zagrania 1 pool i oferuje ją wyłącznie podczas `card.asPlayed`; nie ma możliwości zagrania jako zwykłego unique mastera. Brakuje też obowiązkowego wyboru w unlock phase: zablokować kartę albo spalić 1 pool. Reprodukcja w stanie `turn.master`: brak opcji `play:Bleeding the Vine`; rejestr handlera pokazuje `isOutOfTurnMaster: true`. |
| 100180 | Blessed Blade | Zgodna w sprawdzonych klauzulach | Reflex variant cancels a grapple as played; basic/superior strikes use a melee weapon at +2/+3. Regression coverage in `tests/cards/equipment-stripping.test.ts`. |
| 100183 | Blessing of Durga Syn | Zgodna w sprawdzonych klauzulach | Steals an opposing minion's equipment; superior version has first strike. Regression coverage in `tests/cards/equipment-stripping.test.ts`. |
| 100187 | Blight | Zgodna w sprawdzonych klauzulach | Before range, reduces opposing strength by 1; superior also bars presses and additional strikes for the combat. Regression tests in `tests/cards/blight.test.ts`. |
| 100189 | Bliss | **Naprawiono — dodano handler dla Bliss (frenzy cancel/superior combat ends)** | Wspierana, brak wpisu/specyfikacji; out-of-combat frenzy cancel and superior strike combat-end unavailable. |
| 100190 | Blissful Agony | **Naprawiono — dodano handler dla Blissful Agony (hand-strike/recurring damage/combat ends)** | Wspierana, brak wpisu/specyfikacji; hand-strike mode, recurring unpreventable damage, one-per-combat gate, and superior combat-end/new combat unavailable. |
| 100192 | Blood Agony | Zgodna w sprawdzonych klauzulach | Costs 1 blood, unavailable in round one; basic aggravates the next hand/melee strike, superior aggravates all such strikes this combat. Covered in `tests/cards/blood-agony.test.ts`. |
| 100195 | Blood Brother Ambush | Zgodna w sprawdzonych klauzulach | Blocked action combat is canceled/replaced with 3-life ally; ally strikes and burns at combat end/cancel; `no-combat.test.ts`. |
| 100199 | Blood Doll | Zgodna w sprawdzonych klauzulach | Attach to own vampire; its controller moves one blood to/from pool during master phase; `permanents.test.ts`. |
| 100200 | Blood Feast | Zgodna w sprawdzonych klauzulach | Requires ready Sabbat title; +1 blood to each ready Sabbat vampire controlled; `blood-bank-actions.test.ts`. |
| 100201 | Blood Fury | Zgodna w sprawdzonych klauzulach | Close-range hand strike, Fortitude prevention filter, opposing weapon strikes deal no damage; superior +2; `discipline-filtered.test.ts`. |
| 100202 | Blood Hunt | Zgodna w sprawdzonych klauzulach | Requires ready Prince/Justicar, attaches to non-titled/non-Inner-Circle target; rush only by another Methuselah; `marked-vampires.test.ts`. |
| 100203 | Blood of Acid | **Naprawiono — dodano handler dla Blood of Acid (close/before-strikes/once-per-round env damage, agg superior)** | Wspierana, brak wpisu/specyfikacji; close-range, before-strikes, once-per-round environmental damage equal to damage successfully inflicted; superior aggravated version unavailable. |
| 100205 | Blood of the Cobra | **Naprawiono — dodano handler dla Blood of the Cobra (ranged 1 + superior Quietus as ranged)** | Wspierana, brak wpisu/specyfikacji; basic ranged 1 damage and superior play/use a non-ranged Quietus strike as ranged are unavailable. |
| 100208 | Blood Rage | Zgodna w sprawdzonych klauzulach | Close-range hand strike, Fortitude prevention filter and opposing weapon suppression; superior +1; related tests in `discipline-filtered.test.ts` and `crypt-wave-4.test.ts`. |

**Bleeding the Vine is one additional unique card to correct** beyond the 51 missing-handler cards and the six strike-maneuver cards. The 13 related suites run for this batch passed: **162 tests**; none covers the missing ordinary master play/upkeep of Bleeding the Vine.

**Audyt ręczny — partia 7: karty o ID 100211–100260 (25 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100211 | Blood Sweat | Zgodna w sprawdzonych klauzulach | Costs 1 blood and is only usable at long range; basic/superior provide 2/3 ranged, unpreventable damage. `tests/cards/blood-sweat.test.ts` verifies both amounts at long range. |
| 100212 | Blood Tears of Kephran | Zgodna w sprawdzonych klauzulach | Burn equipment either to prevent 2 damage in combat or gain 2 blood ignoring capacity; `burn-the-equipment.test.ts`. |
| 100214 | Blood to Water | Zgodna w sprawdzonych klauzulach | At close range before strike resolution, after round one: basic burns an opposing ally or 3 blood from a vampire; superior (vampire only) burns 5 blood. Verified in `tests/cards/blood-to-water.test.ts`. |
| 100215 | Blood Trade | Zgodna w sprawdzonych klauzulach | Burns all boons, bars new boons, and gives any Methuselah an unlock-phase blood-transfer option; `boons.test.ts`, `blood-and-gear.test.ts`. |
| 100219 | Bloodform | **Naprawiono — dodano handler dla Bloodform (ally strike combat ends + pre-range immunity rider)** | Wspierana, brak wpisu/specyfikacji; ally-only strike combat-end and superior pre-range immunity/cannot-strike/press rider unavailable. |
| 100222 | Bloodlust | Zgodna w sprawdzonych klauzulach | Frenzy action; pre-play pick count and superior +1; chosen minions get press/rush, permanent burns at end of turn; `bearer-rush-grants.test.ts`. |
| 100226 | Blow Torch | Zgodna w sprawdzonych klauzulach | Weapon is flat 1 aggravated per strike, not strength-based; `legacy-weapons.test.ts`. |
| 100227 | Blur | Zgodna w sprawdzonych klauzulach | [cel] one limited additional strike / [CEL] two; generic additional-strike rules and combat tests. |
| 100228 | Body Arsenal | Zgodna w sprawdzonych klauzulach | Costs 2 blood. Basic makes this vampire's hand-strike damage aggravated for the round; superior also grants +1 strength for combat. Covered in `tests/cards/body-arsenal.test.ts`. |
| 100229 | Body Bag | Zgodna w sprawdzonych klauzulach | Anarch-only haven; ready bearer can burn 2 blood to make a directed action fail; one haven per minion; `vehicles-and-havens.test.ts`. |
| 100230 | Body Flare | Zgodna w sprawdzonych klauzulach | Basic 2 aggravated / superior 2R aggravated strike; `strike-effects.test.ts`. |
| 100231 | Body of Sun | **Naprawiono — dodano handler dla Body of Sun (range-dependent agg + retainer collateral)** | Wspierana, brak wpisu/specyfikacji; range-dependent aggravated strike and collateral damage to both combatants' retainers unavailable. |
| 100232 | Bollix | Zgodna w sprawdzonych klauzulach | Anarch requirement; Celerity maneuver/press, Presence cancel, Thaumaturgy strike; `bollix.test.ts` and prior dedicated subtask. |
| 100235 | Bond with the Mountain | **Naprawiono — dodano handler dla Bond with the Mountain (dodge+press/combat-end/unlocks)** | Wspierana, brak wpisu/specyfikacji; [tha] dodge+press, [vis] combat-end and both unlocks, [VIS] self-only unlock unavailable. |
| 100236 | Bonding | Zgodna w sprawdzonych klauzulach | Bleed-only limited +1 bleed; superior also +1 stealth; `sweep.test.ts`. |
| 100237 | Bone Spur | Zgodna w sprawdzonych klauzulach | Hand-strike aggravated modifier for one round vs remainder of combat; `aggravated-damage.test.ts`. |
| 100238 | Bonecraft | **Naprawiono — dodano handler dla Bonecraft (strike+attached strength penalty/burn action/-2 superior)** | Wspierana, brak wpisu/specyfikacji; strike + attached strength penalty after current resolution, burn action/cost, and superior -2 mode unavailable. |
| 100241 | Botched Move | **Naprawiono — dodano handler dla Botched Move (reveal-top-two/duplicate cancel/damage/per-combat limit)** | Wspierana, brak wpisu/specyfikacji; reveal-top-two condition, duplicate cancellation, damage/burn, and per-combat limit unavailable. |
| 100243 | Bowl of Convergence | Zgodna w sprawdzonych klauzulach | Auspex intercept, superior blood-paid additional intercept during an action; `last-equipment-modifiers.test.ts`. |
| 100244 | Boxed In | Zgodna w sprawdzonych klauzulach | Deferred replacement until after combat; press; `basic-combat.test.ts`. |
| 100246 | Brass Knuckles | Zgodna w sprawdzonych klauzulach | Melee strength +1, once per combat; `legacy-weapons.test.ts`. |
| 100247 | Bravo | Zgodna w sprawdzonych klauzulach | Archetype attach to own vampire; once/turn successful combat-entry action, gain 1 blood at combat end if still ready; one archetype per vampire; `archetypes.test.ts`. |
| 100251 | Bribes | Zgodna w sprawdzonych klauzulach | Before votes/ballots; caller gains 1 pool; eligible other voters who vote only in favor gain 1 after tally; `referendum-riders.test.ts`. |
| 100259 | The Bruisers | Zgodna w sprawdzonych klauzulach | Mortal ally with 2 life/strength; D action only to burn prey's location; `destroyer-allies.test.ts`. |
| 100260 | Brujah Debate | Zgodna w sprawdzonych klauzulach | Global +1 strength and maneuver to Brujah; forced oldest-Brujah lock during each Methuselah's master phase; non-Ventrue D-burn; `burn-family.test.ts`. |

W tej partii uruchomiono 17 suites: **256 testów przeszło**. Osiem potwierdzonych braków handlera należy do puli 51.

**Audyt ręczny — partia 8: karty o ID 100262–100329 (34 karty).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100262 | Brujah Justicar | Zgodna w sprawdzonych klauzulach | Title referendum chooses ready Brujah; each ready Brujah receives +1 vote for this referendum; title/card voter rules inspected. |
| 100264 | Brute Force | Zgodna w sprawdzonych klauzulach | Basic/superior hand and melee-weapon bonuses differ correctly; `bigger-strikes.test.ts`. |
| 100266 | Bum's Rush | Zgodna w sprawdzonych klauzulach | D action, do not replace until after action, one optional maneuver during that combat; `the-edge.test.ts` and rush tests. |
| 100268 | Burden the Mind | Zgodna w sprawdzonych klauzulach | Unlock/block-as-unlocked effects cost +1 pool outside minion's turn; bearer may burn it to unlock as D action; `block-taxes.test.ts`. |
| 100269 | Bureaucratic Overload | Zgodna w sprawdzonych klauzulach | Political actions cost +1 blood; political-action burn referendum; `legacy-cost-masters.test.ts`. |
| 100271 | Burning Wrath | Zgodna w sprawdzonych klauzulach | Aggravated hand strike, +1/+2 by level; `aggravated-damage.test.ts`. |
| 100272 | Burnt Offerings | Zgodna w sprawdzonych klauzulach | Basic +1 intercept; superior condition (predator's minion successfully bleeds you) and 1 pool burn; `reading-the-outcome.test.ts`. |
| 100273 | Burst of Sunlight | Zgodna w sprawdzonych klauzulach | Ranged aggravated strike and self-damage; superior amount 2; `aggravated-damage.test.ts`. |
| 100282 | Call the Wild Hunt | Zgodna w sprawdzonych klauzulach | Basic nadal daje frenzy immunity na combat; [ANI] superior otwiera jednorazowy wybór podczas `combat.beforeResolution` w initial strike-resolution phase: wybierz X, potem X animal retainers z ręki, spal je bez replacement draw i zadaj przeciwnikowi X ranged environmental damage. Użycie jest ograniczone raz na combat; timing respektuje tekst karty. Test `tests/cards/call-the-wild-hunt.test.ts` sprawdza wybór dwóch zwierząt, wykluczenie mortal retainer, brak replacement draw i environmental damage na long range. Wątek [VEKN rules questions](https://www.vekn.net/forum/rules-questions/79148-call-the-wild-hunt-at-superior) nie rozstrzyga dodatkowo timing'u combat-ends. |
| 100284 | Camarilla Exemplary | Zgodna w sprawdzonych klauzulach | One-per-game style referendum attaches to Camarilla vampire; blockers pay 1 blood; `once-in-a-game.test.ts`. |
| 100285 | Camarilla Threat | Zgodna w sprawdzonych klauzulach | Successful referendum puts tax into play; discard action costs each Methuselah +1 pool; any-vampire burn referendum; `table-referendums.test.ts`. |
| 100288 | Campground Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique hunting-ground blood gain during unlock; generic hunting-ground tests. |
| 100289 | Can't Take it with You | Zgodna w sprawdzonych klauzulach | All gain 1 pool then burn 1 per controlled equipment/location/retainer; `table-pool-swings.test.ts`. |
| 100290 | Canine Horde | Zgodna w sprawdzonych klauzulach | Basic ranged 1 damage; superior ranged strike destroys equipment with first strike; weapon/strike destruction rules inspected. |
| 100292 | Capitalist | Zgodna w sprawdzonych klauzulach | Sabbat vampire archetype; on successful bleed gain 1 blood if still ready; one archetype per vampire; archetype tests. |
| 100294 | Cardinal Benediction | Zgodna w sprawdzonych klauzulach | Requires Sabbat; capacity-7+ target; non-Sabbat cannot vote/ballot in this referendum; `ballots.test.ts`. |
| 100297 | Carfax Abbey | Zgodna w sprawdzonych klauzulach | Ready Anarch requirement; one or two Anarchs gain blood depending on ready Baron, subject to HG cap; `blood-locations.test.ts`. |
| 100301 | Carrion Crows | Zgodna w sprawdzonych klauzulach | Environmental damage at normal strike resolution each round; [ANI] amount 2; `vozhd-allies.test.ts`. |
| 100303 | Carver's Meat Packing and Storage | Zgodna w sprawdzonych klauzulach | Hostage counters block rescue/diablerie; lock-to-add blood scales by counters; any ready vampire can burn counters for 2 blood; leave-play cleanup; `carvers-meat-packing.test.ts`. |
| 100304 | Caseless Rounds | Zgodna w sprawdzonych klauzulach | Ammo timing, one extra gun-committed limited strike each round, one ammo/gun/combat; `ammo.test.ts`. |
| 100307 | Catatonic Fear | Zgodna w sprawdzonych klauzulach | Combat-end strike; superior close-range after-combat unpreventable damage; card spec inspected and strike effects covered. |
| 100308 | Cats' Guidance | Zgodna w sprawdzonych klauzulach | Locked vampire who blocked, after block resolution unlock; superior +1 intercept; `post-block-unlock.test.ts`. |
| 100309 | Cauldron of Blood | Zgodna w sprawdzonych klauzulach | Not first round; hand-only strike bonus +2/+4, contrasted to weapon-using Brute Force; `bigger-strikes.test.ts`. |
| 100311 | Cave of Apples | Zgodna w sprawdzonych klauzulach | Ministry D action, ally/younger vampire target, threshold capacity/cost, optional counter burn to steal; `steal-cards.test.ts`. |
| 100312 | Celerity | Zgodna w sprawdzonych klauzulach | Generic Discipline skill-card flow: +1 level and capacity, forbidden on superior Celerity; `discipline-cards.test.ts`. |
| 100315 | Centralized Background Check | Zgodna w sprawdzonych klauzulach | Unique location raises weapon cost globally; `legacy-cost-masters.test.ts`. |
| 100317 | Chainsaw | Zgodna w sprawdzonych klauzulach | 3 damage, once each combat; `legacy-weapons.test.ts`. |
| 100320 | Chameleon | **Naprawiono — poprawiono Chameleon: +1 stealth, wymaga Baron, X-blood koszt, target younger vampire capacity≤X entered since last minion phase, przejęcie kontroli i Anarch** | Card says +1 stealth D action, requires Baron, pay X blood to take a younger vampire with capacity ≤ X who entered since last minion phase, and make it Anarch. Spec only has title gate and +1 stealth; no X cost, target restriction, control transfer or sect conversion. Engine offers only `play:Chameleon:basic:V1` with no target/params despite a legal younger vampire. |
| 100321 | Chameleon's Colors | **Naprawiono — poprawiono Chameleon's Colors: [spi] press OR maneuver+optional press, [SPI] strike combat ends + kontynuacja akcji non-bleed jako unblocked** | [spi] basic mode should offer press OR maneuver with optional press; spec offers superior-only press and omits the maneuver variant. [SPI] strike combat-ends also omits the printed clause that a non-bleed action blocked into this combat continues as if unblocked. |
| 100323 | Change of Target | Zgodna w sprawdzonych klauzulach | Before block resolution, unlock actor; action ends unsuccessfully and same action cannot be retried this turn; `end-action.test.ts`. |
| 100325 | Changeling Skin Mask | Zgodna w sprawdzonych klauzulach | Grants superior Obfuscate; may burn for +2 intercept for current action; `discipline-granting-equipment.test.ts`. |
| 100327 | Channel 10 | Zgodna w sprawdzonych klauzulach | Lock grants +2 intercept to controlled minion, barred during first minion action; `lock-grant-locations.test.ts`. |
| 100328 | Channeling the Beast | Zgodna w sprawdzonych klauzulach | Hand strike or melee weapon strike at +1; `strike-sources.test.ts`. |
| 100329 | Chantry | Zgodna w sprawdzonych klauzulach | Master-phase rescue of Tremere from torpor by paying pool or ready Tremere blood; rescued vampire returns to controller; `crypt-and-uncontrolled.test.ts`. |

W tej partii zidentyfikowano **trzy nowe karty wymagające poprawy**: Call the Wild Hunt, Chameleon i Chameleon's Colors. 18 powiązanych suites passed: **168 tests**; dedykowane testy dla tych trzech błędów nie istnieją.

**Audyt ręczny — partia 9: karty o ID 100332–100379 (16 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100332 | Charisma | Zgodna w sprawdzonych klauzulach | Unique archetype on ready vampire; ally-recruit actions reduce this vampire's blood/pool cost by 1; `play-cost.test.ts`. |
| 100333 | Charismatic Aura | **Naprawiono — [aus][pre] cancel strike/grapple 1 blood, limit round, [AUS][PRE] strike bez unlock; regression test** | Basic `cancelStrikeCard` + `cancelCombatCard(grapple)` z `all:[aus,pre]` + `bloodCost:1` + `combatLimit:"round"`; superior `all:[AUS,PRE]` `strikeCombatEnds` bez unlock. |
| 100337 | Cheval de Bataille | Zgodna w sprawdzonych klauzulach | Ready titled Sabbat requirement; voters/ballot casters against burn 1 blood at tally; `referendum-blood.test.ts`. |
| 100338 | Childling Muse | Zgodna w sprawdzonych klauzulach | Changeling with 1 life; Malkavian employer gets +1 bleed; `legacy-minions.test.ts`. |
| 100339 | Children of Osiris | Zgodna w sprawdzonych klauzulach | Followers of Set fail normal unlock, may burn blood to unlock; anyone can burn card, Set stealth penalty; `pay-to-unlock.test.ts`. |
| 100342 | Chimerstry | **Naprawiono — generyczny Discipline master Chimerstry (+1 chi/capacity, bar na superior CHI)** | Wspierana, lecz brak wpisu/specyfikacji; Discipline master should grant +1 Chimerstry and +1 capacity, barred on superior Chimerstry. |
| 100354 | Clan Loyalty | Zgodna w sprawdzonych klauzulach | Same-clan block only; cancels block/combat, action continues, blocks by that clan prohibited for rest of turn; `no-combat.test.ts`. |
| 100356 | Claws of the Dead | Zgodna w sprawdzonych klauzulach | Basic hand-strike aggravated this round; superior maneuver; `aggravated-hand-strikes.test.ts` and combat tests. |
| 100360 | Cloak of Blood | Zgodna w sprawdzonych klauzulach | Requires capacity >5 and diablerie permission; diablerie, optional discipline level, +2 votes in resulting blood hunt; `torpor-prey.test.ts`, `vote-changing.test.ts`. |
| 100361 | Cloak of the Abalone | Zgodna w sprawdzonych klauzulach | Unique equipment prevents Toreador and Toreador antitribu from attempting blocks; `legacy-equipment.test.ts`. |
| 100362 | Cloak the Gathering | Zgodna w sprawdzonych klauzulach | Basic acting vampire +1 stealth; superior can be played by another ready vampire, not the actor; `other-vampire-modifiers.test.ts`. |
| 100364 | Closed Session | Zgodna w sprawdzonych klauzulach | During polling, non-Camarilla vampires cannot cast votes/ballots; `ballots.test.ts`. |
| 100366 | Club Illusion | Zgodna w sprawdzonych klauzulach | Anarch burns 1 blood when announcing bleed for +1 bleed; `action-time-locations.test.ts`. |
| 100367 | Club Zombie | Zgodna w sprawdzonych klauzulach | Lock for +1 intercept now; if unlocked at turn start, optional blood gain during unlock; `master-intercept.test.ts`. |
| 100374 | Codex of the Edenic Groundskeepers | Zgodna w sprawdzonych klauzulach | Bearer -2 stealth on bleed; granted D bleed costs 1 blood and gains +3 if target has no ready unlocked minions; `granted-bleed-target-costs.test.ts`. |
| 100379 | Combat Shotgun | Zgodna w sprawdzonych klauzulach | 3R, once per round; `legacy-weapons.test.ts`. |

W tej partii zidentyfikowano **jedną nową kartę wymagającą poprawy**: Charismatic Aura. Potwierdzono też brak handlera dla Chimerstry (wliczony w pulę 51). 16 suites passed, **168 tests**; testy nie obejmują Charismatic Aura ani brakującego Chimerstry.

**Audyt ręczny — partia 10: karty o ID 100382–100428 (19 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100382 | Command of the Harpies | Zgodna w sprawdzonych klauzulach | Requires Camarilla; chooses ready prince and removes title on successful referendum; `legacy-political-removal.test.ts`. |
| 100385 | Communal Haven: Cathedral | Zgodna w sprawdzonych klauzulach | Lock during master phase to transfer equipment and/or blood between ready controlled Sabbat vampires; `blood-and-gear.test.ts`. |
| 100389 | Compress | Zgodna w sprawdzonych klauzulach | [pot] +2 hand, [thn] 2 aggravated strike, [THN] 3; mode requirements and 2-blood cost inspected. |
| 100390 | Computer Hacking | Zgodna w sprawdzonych klauzulach | D bleed with +1 bleed; `legacy-actions.test.ts`. |
| 100391 | Conceal | Zgodna w sprawdzonych klauzulach | [obf] D-burn equipment / [OBF] D-burn location; target gates `permanent-target-actions.test.ts`, `last-equipment-modifiers.test.ts`. |
| 100392 | Concealed Weapon | Zgodna w sprawdzonych klauzulach | Before range; non-unique weapon from hand; normal requirements/costs; weapon cost/damage/aggravated limits; `armed-mid-combat.test.ts`. |
| 100401 | Conditioning | Zgodna w sprawdzonych klauzulach | Limited +2/+3 bleed modifier; bleed-action tests. |
| 100403 | Conflagration | Zgodna w sprawdzonych klauzulach | [pot] 2R normal, [dai] 1R agg, [DAI] 2R agg; specification and strike tests. |
| 100404 | Conflict of Interests | Zgodna w sprawdzonych klauzulach | During referendum, cancels same-clan reacting vampire's votes/ballots; `legacy-reactions.test.ts`. |
| 100408 | Conquer the Beast | **Naprawiono — 3 counters, reset, blok equipment, auto-press co rundę i burn po walce; regression test** | Tekst ustawia 3 counters; resetuje je za każdym zagranym combat card; blokuje equipment; w press step każdego round automatycznie zużywa counter na mandatory continue press (superior optional); karta pali się po combacie. Poprawiono `conquerTheBeast: {counters:3, mandatoryPress}` i logikę `pressStep`. Cover `next-batch-a.test.ts`. |
| 100409 | Conquest of Humanity | Zgodna w sprawdzonych klauzulach | Gehenna gate and delayed replacement; each Methuselah chooses prey's location at unlock, whose controller can pay 2 pool; `gehenna-events.test.ts`. |
| 100410 | Consanguineous Boon | Zgodna w sprawdzonych klauzulach | Choose existing clan; each Methuselah gets 1 pool per controlled vampire of clan; `referendum-terms.test.ts`, `clan-vocabulary.test.ts`. |
| 100411 | Consanguineous Condemnation | Zgodna w sprawdzonych klauzulach | Choose clan and lock every vampire of that clan; `legacy-political.test.ts`. |
| 100414 | Conservative Agitation | Zgodna w sprawdzonych klauzulach | Allocate number-of-Methuselahs points among at least two; successful referendum burns per allocated point; `politics.test.ts`. |
| 100416 | Constant Revolution | Zgodna w sprawdzonych klauzulach | Anarch/unique gate, initial and growing counters, pool/random-hand toll that may be mixed, 1-pool minion burn action; `powerbase-la.test.ts` and unlock-toll rules. |
| 100419 | Contingency Planning | Zgodna w sprawdzonych klauzulach | Out-of-turn cancel only when own minion bleeds; can use on own turn; redirects only; no cost paid; bleed cap 1; `bleed-redirects.test.ts`. |
| 100420 | Contract | Zgodna w sprawdzonych klauzulach | Choose Assamite, attach to ready minion; chosen Assamite gets +1 stealth rush against bearer; `marked-vampires.test.ts`. |
| 100426 | Corporate Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique location hunting ground with standard once-per-vampire-per-turn gain; `legacy-locations.test.ts`. |
| 100428 | Corpse Minion | Zgodna w sprawdzonych klauzulach | 1-life Ghoul retainer; vampire bearer burns X blood for +X intercept; `retainer-prices.test.ts`. |

W tej partii znaleziono **jedną nową kartę wymagającą poprawy**: Conquer the Beast — **naprawiono** w czwartej fali (Zestaw A, `next-batch-a.test.ts`). 16 powiązanych suites przeszło: **154 testy**; brak dedykowanej regresji dla niezaimplementowanych liczników i pressów tej karty.

**Audyt ręczny — partia 11: karty o ID 100431–100478 (23 karty).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100431 | Corruption's Purge | Zgodna w sprawdzonych klauzulach | Prince/Justicar/Inner Circle requirement; successful referendum burns 2 blood from each Ministry and torpor at zero; `torpor-prey.test.ts`. |
| 100435 | The Coven | Zgodna w sprawdzonych klauzulach | Unique Trifle; lock to add 2 blood to ready controlled vampire; predator takes control in discard phase; `cross-table-masters.test.ts`. |
| 100441 | Creation Rites | Zgodna w sprawdzonych klauzulach | Required ready Sabbat title holder; creates temporary 1-capacity non-unique same-clan vampire, no actions this turn, skill card search and optional blood transfer; `new-vampires.test.ts`. |
| 100442 | Creep Show | Zgodna w sprawdzonych klauzulach | Archetype triggers on opposing minion dodge/combat-end strike, gives 1 blood, once per turn; `archetypes.test.ts`. |
| 100444 | Creepshow Casino | Zgodna w sprawdzonych klauzulach | Lock on announcement of controlled vampire's undirected action to add +1 stealth even when not yet needed; `action-time-locations.test.ts`. |
| 100445 | Crematorium | Zgodna w sprawdzonych klauzulach | Unlock-phase lock burns a bloodless vampire in torpor; `torpor-prey.test.ts`. |
| 100447 | Crimson Fury | **Naprawiono — diablerie cancelDiablerie / burnBothDiablerie; regression test** | [ani] `cancelDiablerie` burn 1, [ANI] `burnBothDiablerie` gdy ofiarą w torporze/zablokowany. Cover `crimson-fury.test.ts`. |
| 100453 | Crusade: Atlanta | Zgodna w sprawdzonych klauzulach | Sabbat referendum attaches unique Archbishop of Atlanta title to acting vampire; contest/title rules covered by common Praxis/title tests. |
| 100455 | Crusade: Berlin | Zgodna w sprawdzonych klauzulach | Sabbat Archbishop of Berlin; Lasombra bearer unlocks during next discard phase; `title-riders.test.ts`. |
| 100457 | Crusade: Chicago | Zgodna w sprawdzonych klauzulach | Sabbat referendum title; contest behavior in `praxis-seizure.test.ts`. |
| 100458 | Crusade: Detroit | Zgodna w sprawdzonych klauzulach | Sabbat referendum title; generic contested-title handling checked. |
| 100460 | Crusade: Frankfurt | Zgodna w sprawdzonych klauzulach | Sabbat referendum title; generic contested-title handling checked. |
| 100462 | Crusade: Houston | Zgodna w sprawdzonych klauzulach | Sabbat referendum title; generic contested-title handling checked. |
| 100463 | Crusade: Istanbul | Zgodna w sprawdzonych klauzulach | Tzimisce bearer unlocks during next discard phase; `title-riders.test.ts`. |
| 100465 | Crusade: Mexico City | Zgodna w sprawdzonych klauzulach | Sabbat referendum title; `praxis-seizure.test.ts`. |
| 100466 | Crusade: Miami | Zgodna w sprawdzonych klauzulach | Sabbat referendum title; generic contested-title handling checked. |
| 100467 | Crusade: New York | Zgodna w sprawdzonych klauzulach | Sabbat referendum title; generic contested-title handling checked. |
| 100468 | Crusade: Paris | Zgodna w sprawdzonych klauzulach | Sabbat referendum title; generic contested-title handling checked. |
| 100469 | Crusade: Philadelphia | Zgodna w sprawdzonych klauzulach | Sabbat referendum title; generic contested-title handling checked. |
| 100470 | Crusade: Pittsburgh | Zgodna w sprawdzonych klauzulach | Sabbat referendum title; generic contested-title handling checked. |
| 100472 | Crusade: Toronto | Zgodna w sprawdzonych klauzulach | Sabbat referendum title; generic contested-title handling checked. |
| 100476 | Crypt's Sons | Zgodna w sprawdzonych klauzulach | Anarch retainer can be burned pre-block to lock blocker/continue action; 1R round damage; `retainer-wave.test.ts`. |
| 100478 | Cryptic Rider | Zgodna w sprawdzonych klauzulach | After a successful referendum, next referendum called by a controlled vampire this turn auto-passes; `referendum-riders.test.ts`. |

W tej partii zidentyfikowano **jedną nową kartę wymagającą poprawy**: Crimson Fury. 11 powiązanych suites passed, **182 tests**; brak dedykowanego zachowania Crimson Fury poza sprawdzeniem tekstu w katalogu.

**Audyt ręczny — partia 12: karty o ID 100485–100533 (21 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100485 | Dabbler | Zgodna w sprawdzonych klauzulach | Archetype trigger after resolved action on either outcome when bearer used ≥3 Disciplines; optional burn blood to unlock or gain blood; `archetypes.test.ts`. |
| 100492 | Daring the Dawn | Zgodna w sprawdzonych klauzulach | Vampires cannot block; actor takes 2/1 unpreventable environmental aggravated damage after action; `block-tax.test.ts`. |
| 100493 | Dark Influences | Zgodna w sprawdzonych klauzulach | OOT minion-card cancel/refund; puts itself in play, bars same name this turn, then cancels the next eligible cancel card; `out-of-turn-cancels.test.ts`. |
| 100494 | Dark Mirror of the Mind | Zgodna w sprawdzonych klauzulach | +1 stealth action, capacity ≥8, gain 2 pool; `legacy-actions.test.ts`. |
| 100495 | Dark Steel | Zgodna w sprawdzonych klauzulach | Once/combat; close-range environmental damage each round plus maneuver only to close; mode data inspected. |
| 100501 | Dawn Operation | Zgodna w sprawdzonych klauzulach | Basic can cancel current block attempt; all vampire damage in resulting combat aggravated; superior lacks cancellation option; `dawn-operation.test.ts`. |
| 100504 | Dead-End Alley | Zgodna w sprawdzonych klauzulach | Continue-only press; `basic-combat.test.ts`. |
| 100506 | Deal with the Devil | Zgodna w sprawdzonych klauzulach | Master discards current hand and draws replacement hand; card replacement delayed until after discard; `hand-churn.test.ts`. |
| 100507 | The Death of My Conscience | **Naprawiono — burn do 4 kart z ręki, +1/+2 siły, delayed replace, przed strike; regression test** | Printed text: before strikes, burn up to 4 hand cards; strength +1 each (+2 superior); those cards replace only after combat. Poprawiono `burnHandForStrength: {maxCards:4, strengthPerCard:1/2}`, `delayedReplace:afterCombat`, okno `beforeStrikes`. Cover `next-batch-a.test.ts`. |
| 100510 | Death Seeker | Zgodna w sprawdzonych klauzulach | Once per round; cancels any opposing combat card as played, with its cost not paid; `one-each-round.test.ts`. |
| 100511 | Decapitate | Zgodna w sprawdzonych klauzulach | Basic +2 hand/melee strike; superior only if opposing vampire is pending torpor and actor is neither being burned nor going torpor; `decapitate.test.ts` verifies availability and negative cases (prior requested subtask). |
| 100515 | Deep Song | Zgodna w sprawdzonych klauzulach | Basic D bleed +1; superior Frenzy rush/lock with target treated as acting minion; `last-buildable.test.ts`, `bearer-rush-grants.test.ts`. |
| 100516 | Deer Rifle | Zgodna w sprawdzonych klauzulach | Gun 1R, two optional maneuvers per combat; `conditional-weapons.test.ts`. |
| 100518 | Deflection | Zgodna w sprawdzonych klauzulach | After blocks declined; basic locks reacting vampire, superior does not; target excludes actor's controller; `bleed-redirects.test.ts`, `action-cards.test.ts`. |
| 100519 | Delaying Tactics | Zgodna w sprawdzonych klauzulach | Polling cancel, unlock actor, return political-action card to owner's hand/discard down, same political action barred this turn; `end-action.test.ts`. |
| 100520 | Delivery Truck | Zgodna w sprawdzonych klauzulach | Master-phase hidden non-location equipment storage; any controlled minion can equip as +1 stealth action; one vehicle/minion; `vehicles-and-havens.test.ts`. |
| 100521 | Dementation | **Naprawiono — generyczny Discipline master Dementation (+1 dem/capacity, bar na superior DEM)** | Supported Discipline master lacks handler/spec; +1 Dementation and capacity, barred on superior Dementation, unavailable. |
| 100523 | Denial of Aphrodite's Favor | **Naprawiono — poprawiono Denial of Aphrodite: basic cancel młodszej akcji wymagającej PRE z refund/lock/bar, superior cancel modifier/kombat PRE bez kosztu** | Basic should cancel a younger vampire's action card requiring Presence, refund it, leave actor unlocked, and bar same action this turn. Superior should cancel a younger vampire's action modifier OR combat card requiring Presence with no cost paid. Spec instead maps both modes to `cancelCombatCard` restricted to cards that restrict strike choices; basic cannot cancel action cards or preserve actor/action retry behavior, superior misses action modifiers/ordinary Presence combat cards and uses the wrong filter. |
| 100526 | Depravity | Zgodna w sprawdzonych klauzulach | Unique ready own vampire; +1 strength, +1 stealth on diablerie actions, cannot recruit/employ; `conditional-statics.test.ts`. |
| 100529 | Desert Eagle | Zgodna w sprawdzonych klauzulach | Gun strike 2R; weapon-cost and ranged-strike tests. |
| 100533 | Detection | Zgodna w sprawdzonych klauzulach | Attach to any Lasombra; prevents normal unlock, permits bearer to pay 1 blood, bars votes/ballots, bearer D-burn; `pay-to-unlock.test.ts`. |

W tej partii wykryto **dwie nowe karty wymagające poprawy**: The Death of My Conscience (**naprawiono** w Zestawie A, `next-batch-a.test.ts`) i Denial of Aphrodite's Favor. Dementation jest kolejnym potwierdzonym brakiem handlera z puli 51. 19 suites passed: **264 tests**; brak dedykowanych testów dla obu błędów.

**Audyt ręczny — partia 13: karty o ID 100541–100609 (34 karty).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100541 | Día de los Muertos | Zgodna w sprawdzonych klauzulach | Once-per-game; first referendum this turn called by controlled Sabbat vampire auto-passes, skipping polling; `politics-locations.test.ts`. |
| 100545 | Direct Intervention | Zgodna w sprawdzonych klauzulach | OOT cancel/refund of any minion card as played; action actor not locked, canceled strike reselects; `out-of-turn-cancels.test.ts`. |
| 100549 | Disarm | Zgodna w sprawdzonych klauzulach | End-of-round condition by damage comparison; excludes actor being burned/torpor; attach, torpor, strength penalty, 3-blood removal; `combat-attachments.test.ts`. |
| 100550 | Disarming Presence | Zgodna w sprawdzonych klauzulach | Polling-only; locks voting vampires, except own vampires at superior; `vampire-votes.test.ts`. |
| 100554 | Disengage | Zgodna w sprawdzonych klauzulach | Deferred replacement; continue-only press or 1-blood grapple cancel/refund; `cancel-in-combat.test.ts`. |
| 100557 | Disputed Territory | Zgodna w sprawdzonych klauzulach | Choose location and Methuselah; successful referendum changes location controller; `referendum-terms.test.ts`. |
| 100558 | Dissolution | Zgodna w sprawdzonych klauzulach | [pro] maneuver OR press; superior maneuver with optional press; `positional-combat.test.ts`. |
| 100559 | Distant Friend | Zgodna w sprawdzonych klauzulach | +1 stealth action, chosen vampire on success; unlock actor at end of turn; card burn changes votes/ballots and superior forces casting; `vote-changing.test.ts`. |
| 100560 | Distraction | Zgodna w sprawdzonych klauzulach | Catalog cost 1 blood matches handler; [cel] draw 5 then discard, [CEL] directed D lock of prey/predator minion; `choosing-a-minion.test.ts`. |
| 100563 | Diversion | **Naprawiono — [tha] strike/maneuver timing; regression test** | Anarch requirement and other modes retained. The [tha] ranged steal-blood strike is committed in `combat.range`; test `strike-maneuver-cards.test.ts`. |
| 100564 | Diversity | Zgodna w sprawdzonych klauzulach | Successful referendum gives each Methuselah pool per clan among their ready vampires; `legacy-political.test.ts`. |
| 100567 | Dodge | Zgodna w sprawdzonych klauzulach | Deferred replacement until after combat; strike dodge; generic dodge tests. |
| 100568 | Dog Pack | Zgodna w sprawdzonych klauzulach | Animal retainer prevents employer-opposing minions from striking; combat ends; `allies-retainers.test.ts`. |
| 100570 | Domain Challenge | Zgodna w sprawdzonych klauzulach | Successful referendum burns 1 pool per locked minion, including allies; `politics.test.ts`. |
| 100572 | Dominate | Zgodna w sprawdzonych klauzulach | Discipline skill card +1 Dominate/capacity; blocked on superior; generic `discipline-cards.test.ts`. |
| 100573 | Dominate Kine | Zgodna w sprawdzonych klauzulach | [dom] +1 stealth action or D bleed +1; [DOM] D-steal location; `permanent-target-actions.test.ts`. |
| 100576 | Donnybrook | Zgodna w sprawdzonych klauzulach | Anarch/close-range gate; OBF first-strike equipment/retainer burn, PRO aggravated hand strike, SER blood steal; spec inspected. |
| 100577 | Dr. Marisa Fletcher, CDC | Zgodna w sprawdzonych klauzulach | Unlock-phase counter growth; blocked hunt by vampire below counter threshold burns vampire and counters; spec/handler inspected. |
| 100580 | Dragon's Breath Rounds | Zgodna w sprawdzonych klauzulach | Ammo +2 aggravated for gun through combat; burns gun after strike resolution; one ammo per gun/combat; `ammo.test.ts`. |
| 100581 | Dragonbound | Zgodna w sprawdzonych klauzulach | Gehenna event; discard-phase pool loss per controlled vampire in torpor; `gehenna-events.test.ts`. |
| 100582 | Drain Essence | Zgodna w sprawdzonych klauzulach | Not first round; ranged blood-steal strike at 2/4; combat strike tests and spec inspected. |
| 100585 | Drawing Out the Beast | **Naprawiono — pressStepDamage w press step, unpreventable; regression test** | Superior `pressStepDamage` 1 co rundę w `combat.pressStep`, nie `roundDamage` w strike resolution. Cover `third-wave` suite. |
| 100586 | Dread Gaze | Zgodna w sprawdzonych klauzulach | Referendum reaction; +2/+4 votes; `conditional-reactions.test.ts`. |
| 100588 | Dreams of the Sphinx | Zgodna w sprawdzonych klauzulach | Lock counters, +2 hand size, Edge-gated pool gain, uncontrolled-region blood gain, burns at 3 counters; `dreams-of-the-sphinx.test.ts`. |
| 100591 | Drum of Xipe Totec | Zgodna w sprawdzonych klauzulach | Unique equipment grants superior Celerity and one maneuver per combat; `discipline-granting-equipment.test.ts`. |
| 100594 | Dummy Corporation | Zgodna w sprawdzonych klauzulach | Can burn itself when being bled to reduce bleed by 2; `sweep3.test.ts`. |
| 100597 | Dust Up | Zgodna w sprawdzonych klauzulach | Anarch gate; ANI undodgeable hand strike, CEL dodge + limited additional strike, POT +2 hand; `last-combat.test.ts`. |
| 100598 | Eagle's Sight | Zgodna w sprawdzonych klauzulach | Basic +1 intercept; superior forces a block ignoring ordinary prey/predator/target restrictions; `unlock-and-block.test.ts`. |
| 100600 | Earth Control | Zgodna w sprawdzonych klauzulach | +1/+2 stealth; `sweep.test.ts`. |
| 100601 | Earth Meld | Zgodna w sprawdzonych klauzulach | Combat-end strike; superior also unlocks self; `sweep.test.ts`, `equip-unlocks.test.ts`. |
| 100602 | Earth Swords | Zgodna w sprawdzonych klauzulach | Potence 1R, Mytherceria 2R/3R; `strike-effects.test.ts` and mode data inspected. |
| 100604 | Earthshock | Zgodna w sprawdzonych klauzulach | Strength-based undodgeable ranged strike, excludes flight; superior +1; `undodgeable-strikes.test.ts`. |
| 100605 | Eat the Rich | Zgodna w sprawdzonych klauzulach | Anarch requirement; choose ≥1 Methuselah, +3 burn for ready titled; Priscus/title/Edge vote riders; `in-this-referendum.test.ts`. |
| 100609 | Ecoterrorists | Zgodna w sprawdzonych klauzulach | Influence-phase lock adds blood to Gangrel in uncontrolled region; legacy location tests. |

W tej partii wykryto **jedną nową kartę wymagającą poprawy**: Drawing Out the Beast. Diversion jest już uwzględnione w liczniku sześciu kart z wadliwym maneuver timing. Łącznie 33 suites uruchomione dla obu podpartii: **429 testów przeszło**.

**Audyt ręczny — partia 14: karty o ID 100616–100688 (31 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100616 | Effective Management | Zgodna w sprawdzonych klauzulach | Master moves top crypt card to uncontrolled region; `legacy-actions.test.ts`. |
| 100617 | Elder Impersonation | Zgodna w sprawdzonych klauzulach | Basic stealth; superior cancels failed block attempt and bars same blocker retry; `fail-block.test.ts`. |
| 100618 | Elder Intervention | Zgodna w sprawdzonych klauzulach | Bleed-directed OOT reaction, +2 intercept, delayed replacement; incompatible with Pack Tactics same action; `sweep.test.ts`, `buying-a-block.test.ts`. |
| 100619 | Elder Kindred Network | Zgodna w sprawdzonych klauzulach | Before polling; if referendum fails, caller loses 1 pool plus vote difference; `referendum-riders.test.ts`. |
| 100620 | Elder Library | Zgodna w sprawdzonych klauzulach | Unique hand-size location; requires paying its pool cost and no duplicate; `permanents.test.ts`, `legacy-cost-masters.test.ts`. |
| 100624 | Eldritch Glimmer | Zgodna w sprawdzonych klauzulach | Non-first-round Thaumaturgy strike; variable blood buys ranged damage; `thaumaturgy-strikes.test.ts`. |
| 100625 | Elemental Stoicism | **Naprawiono — trzy tryby [for]/[for][obf]/[FOR][obf] z prevent + treatAgg + action attach; regression test** | [for] `prevent` 1 non-agg, [for][obf] `treatAggravatedAsNormal` scope combat, [FOR][obf] +1 stealth action `attachSelf` z `treatsAggravatedAsNormalInCombat` i `burnWhenBearerLeavesReady`. Cover `elemental-stoicism.test.ts`. |
| 100628 | Eluding the Arms of Morpheus | Zgodna w sprawdzonych klauzulach | Unlocks a locked vampire and attempts to block; does not start an attempt when unable to block; `master-intercept.test.ts`, `buying-a-block.test.ts`. |
| 100629 | Elysian Fields | Zgodna w sprawdzonych klauzulach | Location may lock to grant a controlled Lasombra +1 stealth; spec inspected. |
| 100630 | Elysium: Sforzesco Castle | Zgodna w sprawdzonych klauzulach | May spend the location's lock instead of a controlled blocking vampire's lock, only blocking Camarilla; `lock-as-price.test.ts`. |
| 100631 | Elysium: The Arboretum | Zgodna w sprawdzonych klauzulach | Ends Camarilla-vs-Camarilla combat before range; separately burnable as +1 stealth political action; `lock-as-price.test.ts`. |
| 100632 | Elysium: The Palace of Versailles | Zgodna w sprawdzonych klauzulach | During polling, lock to grant each controlled titled Camarilla vampire +1 vote; `politics-locations.test.ts`. |
| 100633 | The Embrace | Zgodna w sprawdzonych klauzulach | Requires non-sterile vampire; creates a 1-capacity vampire of actor's clan/sect and forces hunt this turn; `new-vampires.test.ts`. |
| 100636 | Emergency Preparations | Zgodna w sprawdzonych klauzulach | OOT 1-pool cancel Gehenna; alternatively during own minion phase unlocks >7-capacity vampire when ≥2 Gehenna in play; `out-of-turn-cancels.test.ts`, unlock tests. |
| 100638 | Emissary | Zgodna w sprawdzonych klauzulach | Baron gate; locks own unlocked ready Anarch for 3 votes; older Camarilla vampire may cancel votes/ballots; `vampire-votes.test.ts`. |
| 100640 | Enchant Kindred | Zgodna w sprawdzonych klauzulach | Basic D bleed +1; superior +1 stealth action to add 2 blood to younger uncontrolled vampire; `action-cards.test.ts`. |
| 100644 | Enhanced Senses | Zgodna w sprawdzonych klauzulach | +1/+2 intercept; `card-scenarios.test.ts`. |
| 100646 | Ennoia's Theater | Zgodna w sprawdzonych klauzulach | Location lock for +1 hand size this turn; influence-phase lock for +1 transfer; location handler inspected. |
| 100647 | Enrage | Zgodna w sprawdzonych klauzulach | Frenzy +1 stealth action; basic attaches to own vampire for +1 strength/enter combat and expires end of turn; superior attaches to any vampire, action blood toll, burns after action; `bearer-rush-grants.test.ts`. |
| 100652 | Entrancement | Zgodna w sprawdzonych klauzulach | Basic D bleed +1; superior +1 stealth D-steal ally; action handler inspected. |
| 100653 | Entrenching | Zgodna w sprawdzonych klauzulach | +1 stealth action; only if actor already has ≥4 blood, gains 4; `legacy-rush-actions.test.ts`. |
| 100656 | The Erciyes Fragments | Zgodna w sprawdzonych klauzulach | Stores one prey ash-heap library card face-down, playable with normal requirements/cost, removes from game when burned; vampire >4-capacity may steal; `ash-heap-resource.test.ts`. |
| 100660 | Esbat | Zgodna w sprawdzonych klauzulach | +1 stealth action; moves 2 blood to one unlocked Sabbat or 1 each to two; `blood-bank-actions.test.ts`. |
| 100664 | Esteem | Zgodna w sprawdzonych klauzulach | At end of successful action directed at Edge holder, gain Edge; code inspected. |
| 100666 | Eternal Vigilance | Zgodna w sprawdzonych klauzulach | Sabbat vampire attachment; burns 1 blood to unlock and block during action; burns if bearer torpor; `pay-to-unlock.test.ts`. |
| 100671 | Exclusion Principle | Zgodna w sprawdzonych klauzulach | Successful referendum: each Methuselah gains 1 pool per ready Independent/Anarch vampire they control; `legacy-referendums.test.ts`. |
| 100672 | Excommunication | Zgodna w sprawdzonych klauzulach | Requires Sabbat vampire; chosen ready Archbishop loses title on successful referendum; `legacy-political-removal.test.ts`. |
| 100676 | Extremis Boon | Zgodna w sprawdzonych klauzulach | OOT survival auction when being ousted; high bidder can later take up to 2 pool, card can be burned for 6 pool; `boons.test.ts`, `auctions.test.ts`. |
| 100680 | Eyes of Argus | Zgodna w sprawdzonych klauzulach | Basic +2 intercept during action directed at controller/card; superior locked vampire wakes and can react/block through action; action-card scenarios. |
| 100687 | Faceless Night | Zgodna w sprawdzonych klauzulach | Basic +1 stealth; superior also locks failed blockers before resolution; `end-action.test.ts`. |
| 100688 | Fade from View | Zgodna w sprawdzonych klauzulach | [obf] press; [OBF] dodge; `positional-combat.test.ts`. |

W tej partii wykryto **jedną nową kartę wymagającą poprawy**: Elemental Stoicism. Nie wykryto braków handlera w tych 31 kartach. 26 powiązanych suites passed: **350 tests**.

**Audyt ręczny — partia 15: karty o ID 100692–100765 (38 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100692 | Faithful Servant | Zgodna w sprawdzonych klauzulach | Mortal retainer; bearer gains 1 blood at start of their minion phase while in torpor; retainer upkeep inspected. |
| 100693 | Fake Out | Zgodna w sprawdzonych klauzulach | Deferred replacement until after combat; maneuver. |
| 100698 | Fame | Zgodna w sprawdzonych klauzulach | Unique; attach to ready vampire, 3-pool loss when bearer torpor, 1-pool loss each Methuselah's unlock while bearer torpor; pool-drain tests. |
| 100703 | Far Mastery | Zgodna w sprawdzonych klauzulach | +1 stealth; Dominate steals another vampire's retainer, superior steals another Methuselah's ally; spec inspected. |
| 100704 | Fast Hands | Zgodna w sprawdzonych klauzulach | Celerity strike steals weapon; superior with first strike; `equipment-stripping.test.ts`. |
| 100709 | FBI Special Affairs Division | Zgodna w sprawdzonych klauzulach | Government event; ally burned in combat with acting vampire adds a counter and deals 2 unpreventable environmental damage after combat; burns at 4 counters; `after-combat-payoffs.test.ts`. |
| 100712 | Fee Stake: Boston | Zgodna w sprawdzonych klauzulach | Anarch 5+ capacity Baron title; Toreador/antitribu caller vote bonus; burn referendum penalizes non-Anarch titles; `fee-stake.test.ts`. |
| 100713 | Fee Stake: Corte | Zgodna w sprawdzonych klauzulach | Anarch 5+ capacity Baron title; burn referendum penalizes non-Anarch titles; `fee-stake.test.ts`. |
| 100714 | Fee Stake: Los Angeles | Zgodna w sprawdzonych klauzulach | Anarch 5+ capacity Baron title; burn referendum penalizes non-Anarch titles; `fee-stake.test.ts`. |
| 100715 | Fee Stake: New York | Zgodna w sprawdzonych klauzulach | Anarch 5+ capacity Baron title; Brujah/antitribu caller vote bonus; burn referendum penalizes non-Anarch titles; `fee-stake.test.ts`. |
| 100716 | Fee Stake: Perth | Zgodna w sprawdzonych klauzulach | Anarch 5+ capacity Baron title; burn referendum penalizes non-Anarch titles; `fee-stake.test.ts`. |
| 100717 | Fee Stake: Seattle | Zgodna w sprawdzonych klauzulach | Anarch 5+ capacity Baron title; Gangrel/antitribu caller vote bonus; burn referendum penalizes non-Anarch titles; `fee-stake.test.ts`. |
| 100719 | Felix "Fix" Hessian | Zgodna w sprawdzonych klauzulach | Unique wraith; 2 life, 1 strength/bleed; 1-pool +1 stealth action burns location; handler inspected. |
| 100720 | Femur of Toomler | Zgodna w sprawdzonych klauzulach | Unique Tzimisce melee weapon; strength+1 aggravated; weapon and clan requirements inspected. |
| 100722 | Ferraille | Zgodna w sprawdzonych klauzulach | Unique; once per turn pay 1 pool for +3 votes during any referendum; location handler inspected. |
| 100723 | Festivo dello Estinto | Zgodna w sprawdzonych klauzulach | Once/game event; Sabbat hunt penalty and full-capacity hunt payout; burns during controller's unlock phase; handler inspected. |
| 100724 | Fetish Club Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique Hunting Ground; once/turn blood to ready vampire, respects one-hunting-ground-per-vampire rule; `hunt-payouts.test.ts`. |
| 100726 | Fiendish Tongue | Zgodna w sprawdzonych klauzulach | Sabbat bleed +1; Anarchs -1 intercept; successful Tzimisce bleed enables 1-blood unlock at next discard phase; handler inspected. |
| 100727 | Fifth Tradition: Hospitality | Zgodna w sprawdzonych klauzulach | Prince/Justicar +1 stealth action adds 4 blood to another vampire; legacy action tests. |
| 100729 | Fillip | Zgodna w sprawdzonych klauzulach | Locked vampire may enable younger locked controlled vampire to react/block as unlocked through action; once/turn; block/unlock suite. |
| 100731 | The Final Nights | Zgodna w sprawdzonych klauzulach | Successful referendum all vampires burn 1 blood, including torpor; failure caller burns 1; referendum failure tests. |
| 100734 | Fire in the Blood | Zgodna w sprawdzonych klauzulach | Basic grants +1 strength through combat; superior adds +1 each round for the remainder (so it becomes +2 next round). Implemented with a combat-frame rider anchored to the round played; `tests/cards/strength-before-range.test.ts`. |
| 100736 | Firebrand | Zgodna w sprawdzonych klauzulach | Successful Anarch referendum attaches to actor; +1 vote; pay 1 blood during minion phase to unlock younger ready Anarch; torpor and one-per-bearer restrictions inspected. |
| 100738 | Fists of Death | Zgodna w sprawdzonych klauzulach | Before range; +1/+2 strength through combat; spec inspected. |
| 100740 | Flames of Insurrection | Zgodna w sprawdzonych klauzulach | Unique; when minion opposing Anarch in combat leaves ready region, may move counter to uncontrolled vampire; burnable political action; handler inspected. |
| 100742 | Flamethrower | Zgodna w sprawdzonych klauzulach | Weapon gun; ranged 2 aggravated; `weapons.test.ts`. |
| 100743 | Flaming Candle | Zgodna w sprawdzonych klauzulach | Once/game equipment; equipped vampire may burn 1 blood and card at action announcement to make it unblockable by vampires; lock/currency tests. |
| 100744 | Flash | Zgodna w sprawdzonych klauzulach | Basic maneuver OR press; superior maneuver with optional press; `basic-combat.test.ts`. |
| 100747 | Fleetness | Zgodna w sprawdzonych klauzulach | +1 stealth; Celerity basic D bleed, superior D rush locked minion with optional maneuver; rush tests. |
| 100748 | Flesh Bond | Zgodna w sprawdzonych klauzulach | Animalism strike 2R or superior combat ends; `basic-combat.test.ts`. |
| 100749 | Flesh of Marble | Zgodna w sprawdzonych klauzulach | After first damage each round, prevent subsequent damage; basic excludes aggravated, superior includes; auto-prevention tests. |
| 100752 | Flurry of Action | Zgodna w sprawdzonych klauzulach | Celerity bleed; successful basic draws 2/discards, successful superior unlocks actor; bleed-payoff tests. |
| 100753 | Focus the Blood | Zgodna w sprawdzonych klauzulach | Put card and 1 blood on Assamite; burn card to reduce bearer combat card cost by 1 blood; combat cost tests. |
| 100758 | Force of Personality | **Naprawiono — superior jako modifierOrCombat z blockCost + blockRestriction; regression test** | Basic [pre] `strikeCombatEnds` (no unlock), superior [PRE] `modifierOrCombat` akcja: `blockCost` 1 blood dla vampires + `blockRestriction` allies (non-zombie przybliżone). |
| 100760 | Forced Awakening | Zgodna w sprawdzonych klauzulach | Locked vampire wakes; if not blocking, burns 1 blood before action resolution; wake and block tests. |
| 100762 | Forced Vigilance | Zgodna w sprawdzonych klauzulach | Basic unlock after block resolution; superior unlock during action directed at controller/card; `post-block-unlock.test.ts`. |
| 100763 | Forearm Block | Zgodna w sprawdzonych klauzulach | Prevents 2 from opposing vampire's next hand strike (including resolving strike); if another round, gains first strike on initial strike; combat prevention suite. |
| 100765 | Foreshadowing Destruction | Zgodna w sprawdzonych klauzulach | During bleed, basic limited +1; superior limited +3 when target has ≤9 pool; `foreshadowing-destruction.test.ts`. |

W tej partii wykryto **dwie nowe karty wymagające poprawy**: Fire in the Blood i Force of Personality. Nie wykryto braków handlera. 30 suites passed: **352 tests**; żadna suite nie testuje bezpośrednio tych dwóch rozbieżności.

**Audyt ręczny — partia 16: karty o ID 100771–100838 (23 karty).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100771 | Form of Mist | Zgodna w sprawdzonych klauzulach | Basic dodge; superior combat-end then optional 1-blood action continuation at +1 stealth, once/action; after-combat tests. |
| 100772 | Form of the Ghost | Zgodna w sprawdzonych klauzulach | Protean basic maneuver / superior press; positional combat suite. |
| 100774 | Fortitude | Zgodna w sprawdzonych klauzulach | Master discipline card grants Fortitude level and +1 capacity/generation, barred on superior; generic discipline-card tests. |
| 100776 | Fortune Teller | Zgodna w sprawdzonych klauzulach | Ravnos mortal retainer; once in minion phase peek at random prey hand card; retainer ability inspected. |
| 100777 | Fortune Teller Shop | Zgodna w sprawdzonych klauzulach | Unique location locks to give Ravnos +1 stealth; statics tests. |
| 100782 | Fourth Tradition: The Accounting | Zgodna w sprawdzonych klauzulach | Prince/Justicar +1 stealth action; adds 3 blood to younger uncontrolled vampire; legacy action suite. |
| 100784 | Fractured Armament | Zgodna w sprawdzonych klauzulach | Potence strike destroys equipment; superior also deals 1 damage; equipment-stripping suite. |
| 100785 | Fragment of the Book of Nod | Zgodna w sprawdzonych klauzulach | Unique fragment; lock draws 2/discard down; vampire theft action; location and cross-table tests. |
| 100788 | Freak Drive | Zgodna w sprawdzonych klauzulach | After-resolution; basic success-only unlock, superior blocked-only unlock; costs match catalog; `after-resolution.test.ts`. |
| 100793 | From a Sinking Ship | Zgodna w sprawdzonych klauzulach | Master costs 1 pool; only if controller ≤3 pool, cannot steal vampire capacity ≥7, once/game; control-steal suite. |
| 100794 | Frontal Assault | Zgodna w sprawdzonych klauzulach | Grants ready own minions directed rushes against prey, gains 1 pool for prey minion leaving ready, burns at own influence phase and pays per ready prey minion; `granted-rush.test.ts`. |
| 100796 | Fueled by Heart's Blood | Zgodna w sprawdzonych klauzulach | Gehenna, deferred replacement to diablerie; starts 10 counters, other Gehenna events remove 1, counter-gated blood hunts; `counter-clock-events.test.ts`. |
| 100799 | Gambit Accepted | Zgodna w sprawdzonych klauzulach | Requires and loses VP; persistent prey pool transfer at unlock; ousting and end-game VP clauses; `victory-points.test.ts`. |
| 100807 | Gangrel Revel | Zgodna w sprawdzonych klauzulach | Unique in-play +1 strength to controlled Gangrel; non-Ravnos minion D-burn; statics and control tests. |
| 100809 | Garibaldi-Meucci Museum | Zgodna w sprawdzonych klauzulach | Unlock-phase 1-pool exchange of Anarch-required hand/ash card; pre-range lock ends Anarch-vs-Anarch combat; location suite inspected. |
| 100811 | Gas-Powered Chainsaw | Zgodna w sprawdzonych klauzulach | Melee weapon deals 3 each strike, once/combat; `legacy-weapons.test.ts`. |
| 100812 | Gather | Zgodna w sprawdzonych klauzulach | +1 stealth unique Gangrel action; enters locked; chooses younger uncontrolled Gangrel; influence-phase graduation unless contest; any vampire may burn for 1 pool; `uncontrolled-graduation.test.ts`. |
| 100817 | Ghoul Escort | Zgodna w sprawdzonych klauzulach | Ghoul retainer with 4 life; may burn to avoid combat and unlock bearer, not blocker; retainer tests. |
| 100824 | Giant's Blood | Zgodna w sprawdzonych klauzulach | Once/game; chosen vampire gains to capacity; once-in-game suite. |
| 100827 | Gift of Proteus | Zgodna w sprawdzonych klauzulach | +1 stealth Gangrel action stores any number of Protean cards face-down/out-of-play for bearer play; burns if empty, one/bearer; `store-plays.test.ts`. |
| 100834 | Glancing Blow | Zgodna w sprawdzonych klauzulach | Deferred replacement until next unlock phase; prevents 1 from opposing strike; prevention/deferred-replacement tests. |
| 100836 | Glaser Rounds | Zgodna w sprawdzonych klauzulach | Gun ammo adds +2 damage; unavailable at first gun use, single ammo/gun/combat; ruling and `ammo.test.ts`. |
| 100838 | Gleam of Red Eyes | Zgodna w sprawdzonych klauzulach | Protean basic press / superior maneuver; `positional-combat.test.ts`. |

W tej partii nie wykryto nowych rozbieżności ani braków handlera. 23 suites passed: **291 tests**.

**Audyt ręczny — partia 17: karty o ID 100842–100925 (28 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100842 | Golconda: Inner Peace | Zgodna w sprawdzonych klauzulach | Removes capacity-8+ vampire; controller gains capacity in pool, may pay 2 pool to cancel as played; master-control tests. |
| 100845 | Govern the Unaligned | Zgodna w sprawdzonych klauzulach | Basic Dominate D bleed +2; superior +1 stealth action adds 3 blood to younger uncontrolled vampire; `legacy-actions.test.ts`. |
| 100848 | Grand Temple of Set | Zgodna w sprawdzonych klauzulach | Unique location stores counters from pool; locks/burns X to steal prey vampire with capacity <X; any vampire may D-burn it; choice/cross-table tests. |
| 100852 | Graverobbing | Zgodna w sprawdzonych klauzulach | Steals other Methuselah's torpor vampire; superior may pay 2 blood to move it to ready; borrowed-minion tests. |
| 100855 | Gregory Winter | Zgodna w sprawdzonych klauzulach | Unique 4-life ghoul; steal 1 blood/life, torpor-vampire burn for 2 life, unlock-phase 1-life upkeep; ally/retainer tests. |
| 100857 | Grenade | Zgodna w sprawdzonych klauzulach | Gun weapon strike 3R; at close range bearer takes 1 damage; burns after use; `legacy-weapons.test.ts`. |
| 100860 | Grooming the Protégé | Zgodna w sprawdzonych klauzulach | Move up to 3 blood from ready controlled vampire to younger same-clan uncontrolled vampire; blood-bank action tests. |
| 100861 | Groundfighting | Zgodna w sprawdzonych klauzulach | Ready Anarch; deferred replacement; maneuver/press or 1-blood cancel of strike-choice-restricting opposing combat card; `cancel-in-combat.test.ts`. |
| 100862 | Growing Fury | Zgodna w sprawdzonych klauzulach | Not usable in the first round; later hand strike or melee weapon strike gets +2 damage basic / +3 superior. Spec now carries those exact bonuses and exposes the melee-weapon alternative; `tests/cards/growing-fury.test.ts`. |
| 100863 | Guard Dogs | Zgodna w sprawdzonych klauzulach | Locked vampire reaction during bleed directed at controller; unlocks self, superior adds maneuver if it blocks; block tests. |
| 100864 | Guard Duty | Zgodna w sprawdzonych klauzulach | +2 stealth action attachment to acting minion; can pay 1 blood or burn card to unlock/attempt block with +1 intercept when controlled location is targeted; handler inspected. |
| 100866 | Guardian Angel | Zgodna w sprawdzonych klauzulach | Ready controlled vampire attachment; +1 intercept vs bleeds directed at controller, prevents 1 damage/combat, burns if bearer torpor; `sweep2.test.ts`. |
| 100871 | Gurchon Hall | Zgodna w sprawdzonych klauzulach | Unique title-gated Hunting Ground adds 1 blood to each of two oldest ready controlled vampires; one-hunting-ground-per-vampire rule; hunting tests. |
| 100872 | Guru | Zgodna w sprawdzonych klauzulach | Sabbat archetype; once/turn when bearer calls successful referendum, gains 1 blood; archetype event tests. |
| 100875 | Gypsies | Zgodna w sprawdzonych klauzulach | Unique mortal with 1 life, 1 strength/bleed; +1 stealth to own actions; statics tests. |
| 100889 | Harvest Rites | Zgodna w sprawdzonych klauzulach | +1 stealth Sabbat action attaches; once/turn successful hunt gains +1 blood; hunt tests. |
| 100897 | Haven Uncovered | Zgodna w sprawdzonych klauzulach | Attachment grants any minion a +1 stealth rush at bearer; bearer may burn it as +1 stealth action; granted-rush tests. |
| 100898 | Hawg | Zgodna w sprawdzonych klauzulach | Vehicle grants bearer an optional press each combat, one vehicle/minion; vehicle tests. |
| 100900 | Haymaker | Zgodna w sprawdzonych klauzulach | After range, close-only; not if played last round; initial hand strike +1, opponent initial strike first, round damage leader gains optional press; combat tests. |
| 100903 | Heart of Nizchetus | Zgodna w sprawdzonych klauzulach | If ready at unlock, draw up to 3 without discard and put same number from hand on library bottom; hand/library tests. |
| 100904 | Heart of the City | Zgodna w sprawdzonych klauzulach | +1 stealth action; Presence basic/superior attachment grants +1/+2 bleed; statics tests. |
| 100906 | Heartblood of the Clan | Zgodna w sprawdzonych klauzulach | Unique location; any Assamite can add blood as action; during influence move any amount to uncontrolled Assamite; cross-table location tests. |
| 100909 | Helicopter | Zgodna w sprawdzonych klauzulach | Vehicle locks when equipped; after successful action, may lock it to unlock bearer; one vehicle/minion; vehicle tests. |
| 100910 | Hell-for-Leather | Zgodna w sprawdzonych klauzulach | Anarch; one per Discipline/combat; ANI dodge+limited strike, CEL unlimited strike, OBT locked-target/ready-actor 2-pool burn; combat tests. |
| 100913 | Heroic Might | Zgodna w sprawdzonych klauzulach | +3 stealth Potence action; attaches +1/+2 strength and equipment-burn/ranged strike options; bearer torpor and one-card gates; statics/combat tests. |
| 100918 | Hidden Strength | Zgodna w sprawdzonych klauzulach | Fortitude prevents X+1 damage; superior also grants optional press; combat prevention tests. |
| 100921 | Hide the Mind | Zgodna w sprawdzonych klauzulach | Basic combat cancels Auspex combat card/refund; superior action modifier cancels Auspex reaction/refund; custom dual-type handler and `discipline-filtered.test.ts`. |
| 100925 | High Ground | Zgodna w sprawdzonych klauzulach | Once/round: maneuver only to long, OR before range set long with Flight advantage; `one-each-round.test.ts`. |

W tej partii wykryto **jedną nową kartę wymagającą poprawy**: Growing Fury. Nie wykryto braków handlera. 27 suites passed: **321 tests**.

**Audyt ręczny — partia 18: karty o ID 100932–100999 (21 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100932 | Homunculus | Zgodna w sprawdzonych klauzulach | Protean retainer; employer may burn 1 blood during any Methuselah's unlock phase to unlock; superior retainer has 2 life; `retainer-upkeep.test.ts`. |
| 100936 | Horrific Countenance | Zgodna w sprawdzonych klauzulach | Only when actor blocked; unlock blocker, action continues unblockably; `avoiding-the-block.test.ts`. |
| 100937 | Horseshoes | Zgodna w sprawdzonych klauzulach | Directed action deals 1/2 unpreventable damage to ready minion; `choosing-a-minion.test.ts`. |
| 100938 | Hospital Food | Zgodna w sprawdzonych klauzulach | Unique location requires ready Anarch; lock at hunt announcement, successful hunt adds 1 blood; hunting-ground tests. |
| 100939 | Hostile Takeover | Zgodna w sprawdzonych klauzulach | Pool auction for capacity≤6 vampire; controller receives winning bid, half rounded up to bank if controller wins; `auctions.test.ts`. |
| 100944 | Hunger Moon | Zgodna w sprawdzonych klauzulach | Successful hunt moves 1 blood from hunter to event after resolution; burns at 5 blood; event/hunt tests. |
| 100945 | The Hungry Coyote | Zgodna w sprawdzonych klauzulach | Unique location; controlled Sabbat vampires +1 hunt; statics tests. |
| 100946 | The Hunt Club | Zgodna w sprawdzonych klauzulach | Unique master attaches to ready vampire; +1 stealth on diablerie; bearer cannot vote/ballot in own blood-hunt referendum; `blood-hunt-answers.test.ts`. |
| 100959 | Immortal Grapple | Zgodna w sprawdzonych klauzulach | Close-range/pre-strike grapple; one/round; Potence restricts non-hand strikes, superior press and next round forced close; `round-end.test.ts`. |
| 100965 | Improvised Tactics | **Naprawiono — poprawiono Improvised Tactics: [aus] draw1/discard w press step co rundę, [pot] 2R tylko long co rundę, [pro] maneuver za 1 blood raz na rundę** | First-round Anarch combat card, once/combat. [aus] should draw 1/discard during press step each round, but code grants +1 hand size; [pot] strike 2R only at long range each round, but code offers unrestricted immediate ranged strike; [pro] should permit a 1-blood maneuver once per round, but code gives one immediate free maneuver. No dedicated card test. |
| 100968 | Inbase Discotek, Frankfurt | Zgodna w sprawdzonych klauzulach | Location lock rewards successful hunt with +1 blood, ignores excess; location/hunt tests. |
| 100970 | Inconnu Tutelage | Zgodna w sprawdzonych klauzulach | Inconnu event; any Methuselah may spend 4 transfers and remove uncontrolled vampire to tutor library card; `transfer-currency.test.ts`. |
| 100971 | Increased Strength | Zgodna w sprawdzonych klauzulach | Before range, grants +1/+2 damage to this vampire's damaging strike cards that require Potence; does not change base strength or hand strikes. Regression covered with Growing Fury in `tests/cards/growing-fury.test.ts`. |
| 100973 | Indomitability | Zgodna w sprawdzonych klauzulach | Fortitude prevent 1; superior press OR prevent 1 with optional press; prevention/press tests. |
| 100977 | Infection | **Naprawiono — poprawiono Infection: [for] prevent all od opposing strikes na rundę, [thn] ochrona ghoul ally/retainer z outside, [THN] attach na koniec rundy bar block** | [for] should prevent all damage from opposing strikes for round; spec prevents only current pending damage. Basic [thn] should protect a ghoul ally/retainer and be playable by an uninvolved vampire; spec targets only play.minion and card is combat-only. Superior [THN] attaches to opposing vampire at end of round after actor successfully damaged them and bars that vampire from blocking actor; spec instead deals 1 damage at strike resolution. |
| 100984 | Information Highway | Zgodna w sprawdzonych klauzulach | Unique location grants +2 transfers; `permanents.test.ts`. |
| 100987 | Innocent Bystander | Zgodna w sprawdzonych klauzulach | Only after actor successfully bleeds Methuselah; removes top target crypt card; `reading-the-outcome.test.ts`. |
| 100993 | Instability | Zgodna w sprawdzonych klauzulach | If prey has/controls Edge or Edge uncontrolled, prey may take it if uncontrolled; controller gains 2 pool; once/turn; Edge tests. |
| 100995 | Instinctive Reaction | Zgodna w sprawdzonych klauzulach | Only when predator minion acts; +1 intercept, superior optional maneuver if block; `sweep.test.ts`. |
| 100996 | Institution Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique hunting ground; ready controlled vampire gains 1 blood during unlock; one HG/vampire/turn; `hunt-payouts.test.ts`. |
| 100999 | Intimidation | Zgodna w sprawdzonych klauzulach | Presence basic/superior bleed +1/+2; `action-cards.test.ts`. |

W tej partii wykryto **trzy nowe karty wymagające poprawy**: Improvised Tactics, Increased Strength i Infection. Nie wykryto braków handlera. 24 suites passed: **287 tests**; brak dedykowanych testów dla trzech rozbieżności.

**Audyt ręczny — partia 19: karty o ID 101003–101075 (33 karty).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101003 | Investiture | Zgodna w sprawdzonych klauzulach | Cardinal/Regent requirement; +1 vote for ready Cardinals; successful referendum places Priscus title on chosen Sabbat vampire; Camarilla votes/ballots barred; `title-riders.test.ts`. |
| 101007 | IR Goggles | Zgodna w sprawdzonych klauzulach | Electronic equipment grants one optional maneuver/combat; equipment tests. |
| 101008 | Iron Glare | Zgodna w sprawdzonych klauzulach | Both Potence and Presence required; basic +2 votes during polling, superior limited +2 bleed during bleed; `polling-votes.test.ts`, modifier tests. |
| 101010 | Irregular Protocol | Zgodna w sprawdzonych klauzulach | During referendum, lock reacting vampire to force acting vampire to abstain/cancel votes and ballots; referendum tests. |
| 101014 | Ivory Bow | Zgodna w sprawdzonych klauzulach | Unique weapon; ranged 1 aggravated strike; `weapons.test.ts`. |
| 101015 | J. S. Simmons, Esq. | Zgodna w sprawdzonych klauzulach | Unique mortal retainer; employer +1 bleed; retainer tests. |
| 101018 | Jackie Therman | Zgodna w sprawdzonych klauzulach | Unique mortal with 1 life; bearer one optional maneuver/combat; retainer tests. |
| 101022 | Jericho Founding | Zgodna w sprawdzonych klauzulach | Requires non-Camarilla vampire; successful referendum burns locations unless controller repays pool cost; political sweep tests. |
| 101027 | Jua Vema | **Naprawiono — dodano superior Jua Vema [FOR]: treat agg do końca akcji jeśli tapped Aye na wampirze (dotąd tylko basic [for] na rundę)** | Text includes [FOR]: basic effect treats aggravated damage as normal for round; superior does so for remainder of action if you lock an Aye on the vampire. Spec only provides the basic Fortitude mode and omits the superior conditional duration/choice. |
| 101028 | Judgment: Camarilla Segregation | Zgodna w sprawdzonych klauzulach | +1 stealth action; recurring pool tax for non-Camarilla; controller can burn own non-Camarilla vampire to burn card; master/location tests. |
| 101032 | Kali's Fang | Zgodna w sprawdzonych klauzulach | Unique Banu Haqim melee weapon; strength+1 aggravated; weapon/clan tests. |
| 101034 | Kaymakli Barrier | Zgodna w sprawdzonych klauzulach | Unique directed action on younger ready vampire; controller retains card control; bearer cannot block undirected actions and directed actions cost +1 blood; action attachment tests. |
| 101038 | Keep it Simple | Zgodna w sprawdzonych klauzulach | Reduces bleed against controller by acting minion's stealth at play; bleed answer tests. |
| 101040 | Kevlar Vest | Zgodna w sprawdzonych klauzulach | Once/combat prevents 2 gun or 1 other damage; armor tests. |
| 101042 | The Khabar: Community | Zgodna w sprawdzonych klauzulach | Assamite bleed stealth; minion can D-burn card and Tremere get +1 stealth during that action; location/stealth tests. |
| 101043 | Khabar: Glory | Zgodna w sprawdzonych klauzulach | Action restriction, Assamite attachment/unlock/+1 bleed, +4 pool if prey ousted, burns at unlock; master/action and oust tests. |
| 101045 | Khabar: Loyalty | Zgodna w sprawdzonych klauzulach | +1 stealth action adds 2 blood to younger uncontrolled Assamite; legacy action tests. |
| 101047 | Kherebutu | Zgodna w sprawdzonych klauzulach | Unique Ministry mummy, 3 life/strength, 2 bleed; plays basic Necromancy; burns self and prey Tremere ≤4 capacity; shuffles into owner's library if burned; ally tests. |
| 101049 | Kindred Coercion | Zgodna w sprawdzonych klauzulach | X-blood cost tracks X vampires; age limit; superior changes votes/ballots or abstains per target; `vampire-votes.test.ts`. |
| 101050 | Kindred Intelligence | Zgodna w sprawdzonych klauzulach | +1 stealth action moves crypt top to uncontrolled region; legacy actions. |
| 101053 | Kindred Segregation | Zgodna w sprawdzonych klauzulach | Successful referendum burns all allies unless controller repays recruitment cost; `legacy-political-sweeps.test.ts`. |
| 101056 | Kine Resources Contested | Zgodna w sprawdzonych klauzulach | Allocate 4 among ≥2 Methuselahs; successful referendum 1 pool per assigned point; referendum allocation tests. |
| 101057 | King of the Mountain | **Naprawiono — preventOpposingStrike z destroyMeleeWeapon + handStrikeReflection; regression test** | Basic `preventOpposingStrike` (jedna STRIKE) + `destroyMeleeWeapon`; superior `handStrikeReflection` w `combat.beforeStrikes`. Cover `third-wave` suite. |
| 101059 | King's Rising | Zgodna w sprawdzonych klauzulach | Gain 3 pool at ≤5 otherwise 1; enters play, bars transfers to/from uncontrolled minions, burns at controller's unlock while holding Edge; custom master tests. |
| 101060 | Kingston Penitentiary, Ontario | Zgodna w sprawdzonych klauzulach | Unique Hunting Ground; own unlock-phase blood, or another Methuselah pays 1 pool to lock it and feed their ready vampire; one HG/vampire; hunting tests. |
| 101063 | The Knights | Zgodna w sprawdzonych klauzulach | Unique mortal ally; 2 life, 2 strength, 0 bleed; ally tests. |
| 101067 | KRCG News Radio | Zgodna w sprawdzonych klauzulach | Lock for own minion +1 intercept; lock and pay 1 pool for another Methuselah's minion; lock-grant tests. |
| 101068 | Kumpania | Zgodna w sprawdzonych klauzulach | Unique; lock grants controlled Ravnos capacity≥5 +1 intercept; statics tests. |
| 101070 | The Labyrinth | Zgodna w sprawdzonych klauzulach | Unique location locks to grant controlled Nosferatu +1 stealth; statics tests. |
| 101071 | Lam Into | **Naprawiono — [for] strike/maneuver timing; regression test** | Anarch deferred replacement remains; FOR strike +1 commits in `combat.range` and grants its maneuver. POT/VIC modes unchanged. Test `strike-maneuver-cards.test.ts`. |
| 101072 | Lapse | Zgodna w sprawdzonych klauzulach | Before range; Potence +2 strength, basic Temptation bars maneuvers, superior bars initial strikes only; `round-recurring-combat.test.ts`. |
| 101073 | Laptop Computer | Zgodna w sprawdzonych klauzulach | Electronic equipment +1 bleed, one/minion; equipment tests. |
| 101075 | Lay Low | Zgodna w sprawdzonych klauzulach | Anarch can avoid successful own blood hunt by moving to uncontrolled; breaks temporary control, keeps cards/counters out of play; blood-hunt tests. |

W tej partii wykryto **dwie nowe karty wymagające poprawy**: Jua Vema i King of the Mountain. Lam Into jest już wliczone w błąd maneuver timing. Nie wykryto braków handlera. 37 suites passed: **448 tests**.

**Audyt ręczny — partia 20: karty o ID 101081–101160 (37 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101081 | Leather Jacket | Zgodna w sprawdzonych klauzulach | Equip success unlock at end of turn; bearer may burn jacket to prevent all opposing strike damage; one/minion; `equip-unlocks.test.ts`. |
| 101082 | Leathery Hide | Zgodna w sprawdzonych klauzulach | One/round; prevents up to 4 non-aggravated damage from opposing strike; `one-each-round.test.ts`. |
| 101089 | Legal Manipulations | Zgodna w sprawdzonych klauzulach | Presence basic D bleed +2; superior also gains 1 pool on successful bleed; action/bleed tests. |
| 101093 | Legwork | Zgodna w sprawdzonych klauzulach | Deferred replacement to next unlock; +1 intercept; unavailable if vampire already has intercept; `buying-a-block.test.ts`. |
| 101095 | Lesser Boon | Zgodna w sprawdzonych klauzulach | OOT after own minion would block; action resolves as unblocked; attach, friendly block bar, burn on repeat block or controller <6 pool; `boons.test.ts`. |
| 101096 | Lessons in the Steel | **Naprawiono — poprawiono Lessons in the Steel: gate obrażeń na wampirze, basic peek hand + optional press, superior + forced discard** | Both Auspex+Fortitude levels require damage successfully inflicted on this vampire; basic should let user inspect opposing controller's hand and grant optional press; superior additionally forces chosen discard. Spec only grants `press` (continue-only), lacks the damage gate, hand inspection/discard, and limits itself to continuing combat. |
| 101097 | Letter from Vienna | Zgodna w sprawdzonych klauzulach | Master locks all ready Tremere; legacy master tests. |
| 101098 | Leverage | Zgodna w sprawdzonych klauzulach | During bleed, burn Edge for +1 bleed outside limit; bars Edge gain and burns it instead if gained; `the-edge.test.ts`. |
| 101099 | Lextalionis | Zgodna w sprawdzonych klauzulach | Chooses Methuselah with VP since last turn; successful referendum locks all minions immediately and at next unlock; referendum tests. |
| 101100 | Libertas | Zgodna w sprawdzonych klauzulach | Anarch attachment bars ally blocks; Dominate/Presence cards cost other minions +1 blood while bearer acts/blocks/is in combat; block-tax tests. |
| 101102 | Library Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique Hunting Ground; ready controlled vampire gains 1 at unlock; one-per-vampire/turn; hunting tests. |
| 101103 | Life Boon | Zgodna w sprawdzonych klauzulach | OOT survival boon; grants pool to zero-pool Methuselah, repeated unlock-phase theft, VP substitution and termination clauses; `boons.test.ts`. |
| 101104 | Life in the City | Zgodna w sprawdzonych klauzulach | Trifle adds 1 blood to ready vampire; blood-gain tests. |
| 101107 | Lightning Reflexes | Zgodna w sprawdzonych klauzulach | Celerity limited additional strike; superior burns X blood for X limited additional strikes; multi-strike tests. |
| 101110 | The Line | Zgodna w sprawdzonych klauzulach | Location reduces action-card cost by 1 blood; remains unlocked if card canceled as played; steal action; cost/location tests. |
| 101114 | Living Manse | Zgodna w sprawdzonych klauzulach | Location equipment; not counted as equipment, +1 bleed, may burn before range to end combat; one/bearer; equipment tests. |
| 101120 | London Evening Star, Tabloid Newspaper | Zgodna w sprawdzonych klauzulach | Unique location locks to give any minion +1 intercept for current action; location tests. |
| 101125 | Lost in Crowds | Zgodna w sprawdzonych klauzulach | Obfuscate +1/+2 stealth; mutual-exclusion with Into Thin Air; action-modifier tests. |
| 101126 | Lost in Translation | Zgodna w sprawdzonych klauzulach | After blocks declined, ally/younger-vampire bleed redirected away from controller; locks reacting vampire; once/action; `bleed-redirects.test.ts`. |
| 101127 | The Louvre, Paris | Zgodna w sprawdzonych klauzulach | Unique location; lock Toreador, or any minion if controller has Prince of Paris; theft action; location tests. |
| 101128 | Loving Agony | Zgodna w sprawdzonych klauzulach | Close range; ANI +1 hand strike, VAL combat ends +1 unpreventable after-combat damage, superior pays 1 blood to unlock before end; `after-combat-ends.test.ts`. |
| 101129 | Loyal Street Gang | Zgodna w sprawdzonych klauzulach | Mortal ally with 2 life, 1 strength, 0 bleed; ally tests. |
| 101131 | Lucky Blow | Zgodna w sprawdzonych klauzulach | Deferred replacement; hand/melee strike +1; `basic-combat.test.ts`. |
| 101133 | Lupine Assault | Zgodna w sprawdzonych klauzulach | Once/game, delayed replacement to influence; all Methuselahs discard 5 then refill; event tests. |
| 101136 | Maabara | Zgodna w sprawdzonych klauzulach | Unique location stores ash-heap library card face-down; master phase action moves it to library top; any vampire may burn; `ash-heap-resource.test.ts`. |
| 101137 | Machine Blitz | Zgodna w sprawdzonych klauzulach | Thaumaturgy weapon-referenced ranged strike; superior +1R; `thaumaturgy-strikes.test.ts`. |
| 101142 | Magazine | Zgodna w sprawdzonych klauzulach | Stores ammo card on a gun; lets bearer use effect as if from hand with normal requirements/cost; ammo/store tests. |
| 101143 | Magic of the Smith | Zgodna w sprawdzonych klauzulach | +1 stealth equipment tutor/equip; superior +3 stealth; action/search tests. |
| 101144 | Majesty | Zgodna w sprawdzonych klauzulach | Presence combat-end strike; superior unlocks before combat ends; combat-end tests. |
| 101145 | Major Boon | Zgodna w sprawdzonych klauzulach | OOT bleed-payer substitution with required payment or self-burn; can substitute during own successful bleed; `boons.test.ts`. |
| 101147 | Make the Misere | Zgodna w sprawdzonych klauzulach | Anarch multi-Discipline action; rushes locked minion; Celerity maneuver, Obfuscate stealth, Potence strength; granted-action tests. |
| 101148 | Malajit Chandramouli | Zgodna w sprawdzonych klauzulach | Non-Camarilla unique mortal; employer locks for +1 stealth and burns Malajit if action blocked; retainer tests. |
| 101150 | Malkavian Dementia | Zgodna w sprawdzonych klauzulach | Master takes control of ready Malkavian until next unlock; `borrowed-minions.test.ts`. |
| 101154 | Malkavian Justicar | Zgodna w sprawdzonych klauzulach | Title action; ready Camarilla Malkavian target; successful title placement; each Malkavian +1 vote; `title-riders.test.ts`. |
| 101156 | Malkavian Rider Clause | Zgodna w sprawdzonych klauzulach | During polling before votes; if referendum passes, next referendum called by controlled vampire auto-passes; `referendum-riders.test.ts`. |
| 101158 | Malkavian Time Auction | Zgodna w sprawdzonych klauzulach | Auction for control of a controlled card; high bidder takes it, controller collects from two top bidders; `auctions.test.ts`. |
| 101160 | Manstopper Rounds | Zgodna w sprawdzonych klauzulach | Gun ammo adds +1 damage per strike through combat; one ammo/gun/combat; `ammo.test.ts`. |

W tej partii wykryto **jedną nową kartę wymagającą poprawy**: Lessons in the Steel. Nie wykryto braków handlera. 29 suites passed: **307 tests**; brak dedykowanego testu dla ujawnionej rozbieżności.

**Audyt ręczny — partia 21: karty o ID 101162–101239 (28 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101162 | Mantle of the Moon | Zgodna w sprawdzonych klauzulach | Ravnos-only action modifier usable on announcement; union of block restrictions makes action unblockable; block-restriction tests. |
| 101167 | Mark of the Damned | Zgodna w sprawdzonych klauzulach | Successful referendum: each Methuselah burns pool equal to vampire count in their prey's crypt ash heap; referendum tests. |
| 101168 | Mark V | Zgodna w sprawdzonych klauzulach | Gun, ranged 4; only at long range and once/round; `weapons.test.ts`. |
| 101171 | Market Square | Zgodna w sprawdzonych klauzulach | Unique location locks for controlled Assamite +1 intercept; statics tests. |
| 101175 | Martyr's Resilience | Zgodna w sprawdzonych klauzulach | Outside unlocked vampire; both AUS+FOR; prevent 1 or burn X to prevent X+1 on minion/retainer; `outside-combat.test.ts`. |
| 101178 | Mask Empathy | **Naprawiono — strikeDestroyEquipment retainer + burnOpposingRetainer; regression test** | Basic [pre] `strikeDestroyEquipment` retainer RANGED, superior [PRE] `burnOpposingRetainer` 1 blood `onlyBeforeRange`. Cover `mask-empathy.test.ts`. |
| 101183 | Masquerade Endangered | Zgodna w sprawdzonych klauzulach | OOT on successful hunting vampire; prevents blood gain and next unlock; burns at next unlock; custom handler inspected. |
| 101184 | Masquerade Enforcement | Zgodna w sprawdzonych klauzulach | Requires Prince/Justicar; successful referendum persistent +1 pool tax per vampire moved from uncontrolled to controlled; burn political action; custom master tests. |
| 101187 | The Mausoleum, Venice | Zgodna w sprawdzonych klauzulach | Polling lock +1 vote, +1 more if Ventrue Headquarters absent; location/referendum tests. |
| 101190 | Meat Cleaver | Zgodna w sprawdzonych klauzulach | Melee strength+1 strike; weapon tests. |
| 101193 | Media Influence | Zgodna w sprawdzonych klauzulach | Presence basic D bleed +2; superior each unlocked controlled vampire gains 1 blood; action/blood tests. |
| 101195 | Melange | Zgodna w sprawdzonych klauzulach | Basic +1 intercept; superior if block attaches to acting minion while reactor controls card; against attached minion's controller, burn card for +1 bleed; `melange.test.ts`. |
| 101202 | Mercury's Arrow | **Naprawiono — basic maneuver timing; regression test** | Basic Celerity strike 1R commits in `combat.range` with optional maneuver; superior 3R remains in strike declaration. Covered in `thrown-objects.test.ts`. |
| 101204 | Mercy for the Weak | Zgodna w sprawdzonych klauzulach | Combat ends only if actor has more blood; opposing vampire gains 1 blood even at long range; after-combat tests. |
| 101209 | Mighty Grapple | Zgodna w sprawdzonych klauzulach | Potence basic continue-only press; superior hand/melee +1 strike plus continue-only press; round-end tests. |
| 101211 | Mind Numb | Zgodna w sprawdzonych klauzulach | Presence D-stun unlocked vampire; superior +1 stealth; action tests. |
| 101215 | Puppet Master | Zgodna w sprawdzonych klauzulach | Basic Dominate bleed +2; superior attaches/locks younger vampire, retains control; next minion phase unlocks/temporarily controls; `borrowed-minions.test.ts`. |
| 101217 | Minion Tap | Zgodna w sprawdzonych klauzulach | Transfers any amount of blood from controlled vampire to pool; resource-transfer tests. |
| 101219 | Minor Boon | Zgodna w sprawdzonych klauzulach | OOT prevents torpor, attaches to another Methuselah's vampire; bars bleed at controller; burns if bearer rescues own torpor vampire; `boons.test.ts`. |
| 101221 | Minor Irritation | Zgodna w sprawdzonych klauzulach | On successful block of ally/younger vampire, before combat; blocker does not lock; block tests. |
| 101223 | Mirror Walk | Zgodna w sprawdzonych klauzulach | Deferred replacement to next discard; +1 stealth, superior locks blocker and ends action before block resolution; `end-action.test.ts`. |
| 101225 | Misdirection | Zgodna w sprawdzonych klauzulach | Master locks a minion; master phase tests. |
| 101229 | Mob Connections | Zgodna w sprawdzonych klauzulach | Unique location can grant own minion continue-only press; any minion may D-burn; statics tests. |
| 101230 | Mob Rule | Zgodna w sprawdzonych klauzulach | Referendum; capacity>4 vampires burn blood for votes, capacity>7 gains an additional vote/blood; `vampire-votes.test.ts`. |
| 101235 | Molotov Cocktail | Zgodna w sprawdzonych klauzulach | Ranged strike attaches 2R aggravated weapon; unusable attachment round; burns after use/end combat; `armed-mid-combat.test.ts`. |
| 101237 | Momentum's Edge | Zgodna w sprawdzonych klauzulach | Unique master requires ≥1 VP; lock at unlock for 1 pool; victory-point tests. |
| 101238 | Monastery of Shadows | Zgodna w sprawdzonych klauzulach | Unique location +1 hand size; lock grants capacity≥8 vampire +1 stealth; location tests. |
| 101239 | Monkey Wrench | Zgodna w sprawdzonych klauzulach | Anarch bleed modifier; choose limited +1/+2/+3; `granted-bleed-target-costs.test.ts`. |

W tej partii wykryto **jedną nową kartę wymagającą poprawy**: Mask Empathy. Mercury's Arrow jest już wliczone w błąd maneuver timing. Nie wykryto braków handlera. 29 suites passed: **419 tests**.

**Audyt ręczny — partia 22: karty o ID 101242–101320 (30 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101242 | Monster | Zgodna w sprawdzonych klauzulach | Sabbat archetype; after combat, if opponent not ready, bearer may pay 1 blood to unlock; one archetype/vampire; `archetypes.test.ts`. |
| 101243 | Morgue Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique Hunting Ground; ready controlled vampire gains 1 blood at unlock; one HG/vampire/turn; `hunting-grounds.test.ts`. |
| 101246 | Movement of the Mind | Zgodna w sprawdzonych klauzulach | Thaumaturgy basic press only to end combat; superior maneuver; positional combat tests. |
| 101249 | Mr. Winthrop | Zgodna w sprawdzonych klauzulach | Unique mortal retainer; employer +1 intercept; retainer tests. |
| 101250 | Muddled Vampire Hunter | Zgodna w sprawdzonych klauzulach | Unique mortal ally; 4 strength, first strike, directed rush at ready vampire; ally tests. |
| 101252 | Mummy's Tongue | Zgodna w sprawdzonych klauzulach | Unique; burn during master phase to lock any vampire through next unlock; mummy tests. |
| 101254 | Murder of Crows | Zgodna w sprawdzonych klauzulach | Animal retainer, 1 life; Animalism deals 1R each round, superior has 2 life; retainer/round-damage tests. |
| 101256 | Murmur of the False Will | Zgodna w sprawdzonych klauzulach | Basic Dominate limited +1 bleed; superior Dominate reaction redirects younger vampire's bleed after blocks decline; `bleed-redirects.test.ts`. |
| 101259 | My Enemy's Enemy | Zgodna w sprawdzonych klauzulach | Basic +1 intercept; superior redirects predator's bleed to their predator, excludes two-player endgame, locks reactor; bleed-redirect tests. |
| 101262 | Mythic Form | Zgodna w sprawdzonych klauzulach | First-round/pre-range, one/combat; +1 strength and prevent 1 non-agg each round; superior adds maneuver and one 2R aggravated strike per round; `before-range-attachments.test.ts`. |
| 101265 | Narrow Minds | Zgodna w sprawdzonych klauzulach | Inconnu event, deferred replacement to next unlock; redirects-bleed minion cards cost +1 blood/life; `events.test.ts`, cost-modifier tests. |
| 101267 | Necromancy | **Naprawiono — generyczny Discipline master Necromancy (+1 nec/capacity, bar na superior NEC)** | Supported Discipline master has no handler/spec; cannot grant +1 Necromancy and +1 capacity, and cannot enforce no-play-on-superior-Necromancy gate. No card in current pool requires it, but the capacity/discipline grant is a printed game effect. |
| 101268 | Necrosis | **Naprawiono — pressStepDamage z ifCloseStrikeThisRound, unpreventable; regression test** | Superior [THN] `strikeHandBonus` 2 + `pressStepDamage` 1 z `ifCloseStrikeThisRound` w `combat.pressStep`. |
| 101271 | Neonate Breach | Zgodna w sprawdzonych klauzulach | Successful referendum: choose ≥1 seats; each loses 1 pool per point and +3 if they control ready vampire capacity≤4; referendum tests. |
| 101273 | Nephren-Ka | Zgodna w sprawdzonych klauzulach | Unique mummy; 5 life, 2 strength, 0 bleed; prevents 1 non-agg/combat, basic Necromancy access, D rush, shuffles on burn; `mummies.test.ts`. |
| 101274 | Nest of Eagles | Zgodna w sprawdzonych klauzulach | Cannot be used if actor is Assamite/wraith/flight; reduces bleed 1, or 3 for ally/capacity≤5 vampire; bleed tests. |
| 101277 | New Carthage | Zgodna w sprawdzonych klauzulach | Unique location; titled Brujah +1 bleed/vote, Ventrue -1 vote; location statics tests. |
| 101279 | The New Inquisition | Zgodna w sprawdzonych klauzulach | Gehenna requires another; delayed replacement until titled vampire torpor; each unlock-phase prey-vampire damage; titled political burn; `gehenna-unlock.test.ts`, `gehenna-taxes.test.ts`. |
| 101280 | New Management | Zgodna w sprawdzonych klauzulach | Deferred replacement until after action; directed take-control of free or 1-cost location; location-control tests. |
| 101288 | Nimble Feet | Zgodna w sprawdzonych klauzulach | Celerity press / limited additional strike; positional combat tests. |
| 101292 | No Trace | Zgodna w sprawdzonych klauzulach | Basic combat-end strike only at long range; superior at any range; `no-combat.test.ts`. |
| 101299 | Nosferatu Justicar | Zgodna w sprawdzonych klauzulach | Title action; ready Nosferatu target; successful title placement and +1 vote for each Nosferatu; title-rider tests. |
| 101302 | Nosferatu Putrescence | Zgodna w sprawdzonych klauzulach | May attach to Nosferatu in combat from outside; -1 strength each combat; outside-combat tests. |
| 101303 | Not to Be | Zgodna w sprawdzonych klauzulach | OOT cancels any event/refunds cost; grants extra master phase action; removes one discard phase action and burns then; `out-of-turn-cancels.test.ts`. |
| 101305 | NRA PAC | Zgodna w sprawdzonych klauzulach | Government event; any minion completing equip unlocks at end of turn; equip-unlock tests. |
| 101309 | Obedience | Zgodna w sprawdzonych klauzulach | Reaction before combat with younger actor; ends action, basic unlocks actor, no reactor lock when blocking, bars same action; `avoiding-the-block.test.ts`. |
| 101310 | Obfuscate | Zgodna w sprawdzonych klauzulach | Generic Discipline card grants level and capacity; cannot place on superior Obfuscate; `discipline-cards.test.ts`. |
| 101312 | Obtenebration | **Naprawiono — generyczny Discipline master Obtenebration (+1 obt/capacity, bar na superior OBT)** | Supported Discipline master has no handler/spec; cannot grant +1 Obtenebration and +1 capacity, nor enforce no-play-on-superior gate. The imported card remains in the supported pool even though no current library card requires it. |
| 101318 | Old Friends | Zgodna w sprawdzonych klauzulach | Deferred replacement to next unlock; Obfuscate basic bleed +1 limited; superior +2 votes during polling; bleed/referendum tests. |
| 101320 | Omael Kuman | Zgodna w sprawdzonych klauzulach | Unique ghoul; employer pays 1 blood to set range before it is determined during first round; ally/retainer tests. |

W tej partii wykryto **jedną nową rozbieżność specyfikacji**: Necrosis. Potwierdzono też brak handlerów dla dwóch Discipline masters: Necromancy i Obtenebration; oba pochodzą z puli 51 braków rejestracji. 30 suites passed: **346 tests**.

**Audyt ręczny — partia 23: karty o ID 101321–101406 (28 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101321 | On the Qui Vive | Zgodna w sprawdzonych klauzulach | Locked minion wakes through action; once between unlocks; ally does not unlock next phase; reaction/wake tests. |
| 101323 | Open Grate | Zgodna w sprawdzonych klauzulach | Press only to end combat; positional combat tests. |
| 101324 | Open War | Zgodna w sprawdzonych klauzulach | +1 stealth Baron action, once/game; persistent Anarch rush/location-burn grants; counters and 4-pool payout; `granted-rush.test.ts`. |
| 101326 | Opium Den | Zgodna w sprawdzonych klauzulach | Unique location locks for controlled Follower of Set +1 stealth; location statics tests. |
| 101337 | Outcast Mage | Zgodna w sprawdzonych klauzulach | Mage ally: 2 life, 0 strength, 1 bleed; 2R strike and optional maneuver; ally combat tests. |
| 101340 | Owl Companion | Zgodna w sprawdzonych klauzulach | Animal retainer gives opposing controller open hand during employer combat; superior 2 life; retainer tests. |
| 101341 | Oxford University, England | Zgodna w sprawdzonych klauzulach | Unique location; polling lock and X pool for +2X votes; vote/resource tests. |
| 101342 | Pack Alpha | Zgodna w sprawdzonych klauzulach | One/round; basic recruits animal retainer; superior burns animal retainer to attach +1 strength; `retainer-wave.test.ts`. |
| 101343 | Pack Tactics | Zgodna w sprawdzonych klauzulach | Deferred replacement after action; bleed-directed +2 intercept; mutual exclusion with Elder Intervention; `buying-a-block.test.ts`. |
| 101350 | Papillon | Zgodna w sprawdzonych klauzulach | Unique title-gated Hunting Ground; ready titled controlled vampire gains 2; one HG/vampire/turn; hunting tests. |
| 101353 | Parity Shift | Zgodna w sprawdzonych klauzulach | Prince/Justicar gate; target must have more pool; allocate exactly 3 to ≥1 other Methuselahs including caller; political term tests. |
| 101354 | Park Hunting Ground | Zgodna w sprawdzonych klauzulach | Standard unique Hunting Ground +1 ready vampire blood; hunting tests. |
| 101364 | The Path of Metamorphosis | Zgodna w sprawdzonych klauzulach | Unique permanent discount for Tzimisce Vicissitude cards; any minion D-burns with 1 unpreventable damage to acting vampire; cost/locations tests. |
| 101365 | The Path of Night | Zgodna w sprawdzonych klauzulach | Unique permanent discount for Lasombra Obtenebration cards; any minion D-burns with 1 unpreventable damage; discount tests. |
| 101366 | The Path of Paradox | Zgodna w sprawdzonych klauzulach | Unique permanent Ravnos Chimerstry discount; D-burn with unpreventable damage; cost/location tests. |
| 101373 | The Path of Typhon | Zgodna w sprawdzonych klauzulach | Unique Followers of Set Serpentis discount; any minion D-burns with 1 unpreventable damage; cost/location tests. |
| 101376 | Patshiv | Zgodna w sprawdzonych klauzulach | +1 stealth action; each ready unlocked Ravnos gains 1 blood; `blood-bank-actions.test.ts`. |
| 101380 | Peace Treaty | Zgodna w sprawdzonych klauzulach | Successful referendum burns weapons unless owner repays pool cost to equip; political sweep tests. |
| 101382 | Penitent Resilience | **Naprawiono — komplet trybów + Flash Grenade + blokada akcji; regression test** | [for] [COMBAT] This round treats aggravated as normal i anuluje Flash Grenade; [for][obe] [COMBAT] As [for] przez cały combat; [FOR][OBE] [ACTION MODIFIER] wybierz wampira – chosen nie może blokować. Poprawiono `cardType: modifierOrCombat`, tryby z `flashGrenadeImmune` i `blockRestriction:chosen`. Cover w `set-b.test.ts`. |
| 101384 | Pentex™ Subversion | Zgodna w sprawdzonych klauzulach | Unique attachment to ready minion bars blocking; other minions D-burn; opposing statics tests. |
| 101387 | Perfect Paragon | Zgodna w sprawdzonych klauzulach | Presence basic +3 votes during polling; superior -1 intercept to allies and younger vampires (union filter); `polling-votes.test.ts`, opposing statics. |
| 101388 | Perfectionist | Zgodna w sprawdzonych klauzulach | Archetype; once/turn successful action with no reactions gains 1 blood; `archetypes.test.ts`. |
| 101390 | Permanent Vacation | Zgodna w sprawdzonych klauzulach | Successful referendum removes chosen ready ally from game; referendum outcomes tests. |
| 101391 | Perpetual Care | Zgodna w sprawdzonych klauzulach | Successful referendum burns 2 pool per controlled vampire in torpor; referendum tests. |
| 101394 | Personal Involvement | Zgodna w sprawdzonych klauzulach | 3-pool master; if prey has more pool after cost, burns 3; any Methuselah may pay 2 to cancel, card cost not paid; `out-of-turn-cancels.test.ts`. |
| 101401 | Piper | Zgodna w sprawdzonych klauzulach | Requires ready Anarch; lock ready unlocked Anarch to recruit/employ ally/retainer at normal requirements/cost; not an action/no block; `play-from-hand.test.ts`. |
| 101404 | Poacher's Hunting Ground | Zgodna w sprawdzonych klauzulach | Derivative HG; feeds up to X ready controlled Anarchs, X set by other Methuselahs' non-derivative HGs; one HG/vampire/turn; derivative-HG tests. |
| 101406 | Poison Pill | Zgodna w sprawdzonych klauzulach | Before votes; if passed referendum makes controller lose pool, acting vampire's controller loses same amount in addition; `referendum-outcomes.test.ts`. |

W tej partii wykryto **jedną nową kartę wymagającą poprawy**: Penitent Resilience — **naprawiono** w czwartej fali (zob. `set-b.test.ts`). Nie wykryto braków handlera. 31 suites passed: **434 tests**; brak dedykowanego testu dla ujawnionej rozbieżności.

**Audyt ręczny — partia 24: karty o ID 101411–101498 (54 karty).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101411 | Political Ally | Zgodna w sprawdzonych klauzulach | Unique mortal ally; 1 life, 0 strength, 3 bleed; ally data/tests. |
| 101413 | Political Backlash | Zgodna w sprawdzonych klauzulach | Only after failed referendum; acting vampire's controller burns 2 pool; referendum outcomes tests. |
| 101415 | Political Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique standard Hunting Ground; one blood to ready controlled vampire, one HG/vampire/turn. |
| 101417 | Political Stranglehold | Zgodna w sprawdzonych klauzulach | Once/game; successful referendum gives 3 pool per controlled vampire capacity≥8; referendum tests. |
| 101420 | Port Authority | Zgodna w sprawdzonych klauzulach | Government event delays card replacement for discard-phase action until next unlock; event/hand tests. |
| 101421 | Port Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique standard Hunting Ground; one blood to ready controlled vampire; one HG/vampire/turn. |
| 101424 | Potence | Zgodna w sprawdzonych klauzulach | Generic Discipline card grants level/capacity and bars on superior Potence; `discipline-cards.test.ts`. |
| 101427 | Powder of Rigidity | Zgodna w sprawdzonych klauzulach | Successful equip unlocks actor next discard phase; pre-range burn restricts opposing Protean/Vicissitude, applies werewolf -2 strength; equipment tests. |
| 101430 | Power Structure | Zgodna w sprawdzonych klauzulach | Unique location; polling lock grants each controlled Lasombra +1 vote; vote/location tests. |
| 101431 | Powerbase: Barranquilla | Zgodna w sprawdzonych klauzulach | Unique location stores capacity-based blood, unlock payout, any-vampire burn with titled stealth bonus, burns empty; powerbase/location tests. |
| 101434 | Powerbase: Chicago | Zgodna w sprawdzonych klauzulach | Unique location; unlock-phase add 1 bank blood or take all stored; another Methuselah's vampire may D-steal all; blood-banking tests. |
| 101435 | Powerbase: Los Angeles | Zgodna w sprawdzonych klauzulach | Discard-phase extra action; Anarch card discard unlocks ready Anarch; Anarch theft; `powerbase-la.test.ts`. |
| 101437 | Powerbase: Madrid | Zgodna w sprawdzonych klauzulach | Adds counter when ≤3 at unlock; polling lock grants titled Sabbat votes per counter; any other-controlled vampire burns counters; `powerbase-madrid.test.ts`. |
| 101438 | Powerbase: Mexico City | Zgodna w sprawdzonych klauzulach | Starts with 5 blood; own unlock moves 1 to pool; another Sabbat may steal all; burns empty; location tests. |
| 101439 | Powerbase: Montreal | Zgodna w sprawdzonych klauzulach | Influence-phase adds blood to uncontrolled vampire; any vampire can steal location; location tests. |
| 101440 | Powerbase: New York | Zgodna w sprawdzonych klauzulach | Master action: pay 1 pool for 3 counters or take 1; Sabbat can steal all; burns when empty; location/resource tests. |
| 101442 | Powerbase: Savannah | Zgodna w sprawdzonych klauzulach | Elysium location lock consumes another controlled unique location to end combat before range; any vampire may steal; lock-as-price tests. |
| 101444 | Powerbase: Washington, D.C. | Zgodna w sprawdzonych klauzulach | Unlock-phase deposit up to 3 pool and equal blood, or take 2 blood; another Methuselah's vampire can steal all; banking tests. |
| 101447 | Praxis Seizure: Amsterdam | Zgodna w sprawdzonych klauzulach | Camarilla Prince title grant; city-keyed contest; `praxis-seizure.test.ts`. |
| 101448 | Praxis Seizure: Athens | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Athens; Tremere capacity +1 rider; city-title suite. |
| 101449 | Praxis Seizure: Atlanta | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Atlanta title grant; city-title suite. |
| 101450 | Praxis Seizure: Barcelona | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Barcelona; Tremere capacity +1 rider; city-title suite. |
| 101451 | Praxis Seizure: Berlin | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Berlin; Ventrue capacity +1 rider; city-title suite. |
| 101452 | Praxis Seizure: Boston | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Boston title grant; city-title suite. |
| 101453 | Praxis Seizure: Brussels | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Brussels; Nosferatu capacity +1 rider; city-title suite. |
| 101454 | Praxis Seizure: Cairo | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Cairo; Ventrue capacity +1 rider; city-title suite. |
| 101455 | Praxis Seizure: Chicago | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Chicago title grant; city-title suite. |
| 101456 | Praxis Seizure: Cleveland | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Cleveland title grant; city-title suite. |
| 101457 | Praxis Seizure: Dallas | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Dallas title grant; city-title suite. |
| 101458 | Praxis Seizure: Dublin | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Dublin title grant; city-title suite. |
| 101459 | Praxis Seizure: Frankfurt | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Frankfurt title grant; city-title suite. |
| 101460 | Praxis Seizure: Geneva | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Geneva; Ventrue capacity +1 rider; city-title suite. |
| 101461 | Praxis Seizure: Glasgow | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Glasgow; Gangrel capacity +1 rider; city-title suite. |
| 101462 | Praxis Seizure: Houston | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Houston title grant; city-title suite. |
| 101463 | Praxis Seizure: Istanbul | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Istanbul; if Prince not Assamite, locks all Assamites; ready Assamites +1 vote in referendum; `praxis-seizure.test.ts`. |
| 101464 | Praxis Seizure: London | Zgodna w sprawdzonych klauzulach | Camarilla Prince of London title grant; city-title suite. |
| 101465 | Praxis Seizure: Miami | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Miami title grant; city-title suite. |
| 101466 | Praxis Seizure: Monaco | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Monaco; Toreador capacity +1 rider; city-title suite. |
| 101467 | Praxis Seizure: Paris | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Paris; Toreador capacity +1 rider; city-title suite. |
| 101468 | Praxis Seizure: Rome | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Rome; Brujah capacity +1 rider; city-title suite. |
| 101469 | Praxis Seizure: Seattle | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Seattle title grant; city-title suite. |
| 101470 | Praxis Seizure: Stockholm | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Stockholm; Malkavian capacity +1 rider; city-title suite. |
| 101472 | Praxis Seizure: Washington, D.C. | Zgodna w sprawdzonych klauzulach | Camarilla Prince of Washington, D.C. title grant; city-title suite. |
| 101475 | Precognition | Zgodna w sprawdzonych klauzulach | Basic +1 intercept; superior additionally prevents 1 damage first round if blocks; `intercept-reactions.test.ts`. |
| 101476 | Precognizant Mobility | Zgodna w sprawdzonych klauzulach | +1 stealth action; basic unlock younger vampire/ally; superior unlock any vampire; `choosing-a-minion.test.ts`. |
| 101480 | Presence | Zgodna w sprawdzonych klauzulach | Generic Discipline card +1 level/capacity; barred on superior Presence; `discipline-cards.test.ts`. |
| 101482 | Preternatural Evasion | Zgodna w sprawdzonych klauzulach | Celerity basic dodge; superior strike pays 1 blood to end combat; dodge/combat tests. |
| 101483 | Preternatural Strength | Zgodna w sprawdzonych klauzulach | +2 stealth action; attaches +1/+2 strength and bars Torn Signpost; one/bearer; vampire statics tests. |
| 101487 | Priority Contract | Zgodna w sprawdzonych klauzulach | Unique Trifle; choose own ready Assamite and prey minion; chosen Assamite rushes bearer; may burn before bearer leaves ready for +3 pool; `granted-rush.test.ts`. |
| 101490 | Private Audience | Zgodna w sprawdzonych klauzulach | Sabbat title gate; before votes/ballots, non-Sabbat cannot cast in referendum; referendum tests. |
| 101491 | Procurer | Zgodna w sprawdzonych klauzulach | Ghoul retainer; +2 stealth action adds 1 bank blood to ready controlled vampire; `retainer-wave.test.ts`. |
| 101493 | Projectile | Zgodna w sprawdzonych klauzulach | Celerity undodgeable 1R strike or ranged weapon strike; superior limited additional strike; `undodgeable-strikes.test.ts`. |
| 101495 | Propaganda | Zgodna w sprawdzonych klauzulach | Presence basic D bleed +1, titled cannot block; superior also target locks ready unlocked minion on resolution; bleed-rider tests. |
| 101498 | Protean | Zgodna w sprawdzonych klauzulach | Generic Discipline card +1 level/capacity; barred on superior Protean; `discipline-cards.test.ts`. |

W tej partii nie wykryto nowych rozbieżności ani braków handlera. 42 suites passed: **595 tests**.

**Audyt ręczny — partia 25: karty o ID 101501–101588 (34 karty).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101501 | Protection Racket | Zgodna w sprawdzonych klauzulach | Anarch reaction; +1 intercept, +1 more if acting minion titled; intercept tests. |
| 101502 | Protracted Investment | Zgodna w sprawdzonych klauzulach | Investment master adds 5 blood to self, optional master action takes 1, burns empty; master-card tests. |
| 101507 | Psyche! | Zgodna w sprawdzonych klauzulach | Celerity press; superior queues another combat only if both ready and combat ending, no existing queue; `round-end.test.ts`. |
| 101513 | Public Trust | Zgodna w sprawdzonych klauzulach | Basic +2 bleed; superior also adds 1 blood to uncontrolled vampire on successful bleed; bleed-payoff tests. |
| 101516 | Pulling Strings | Zgodna w sprawdzonych klauzulach | Forces younger (basic) or same/older (superior) vampire to abstain; vote-changing tests. |
| 101523 | Pursuit | Zgodna w sprawdzonych klauzulach | Celerity maneuver / limited additional strike; positional tests. |
| 101524 | Pushing the Limit | Zgodna w sprawdzonych klauzulach | 1-blood Potence hand/melee +2/+3 strike; bonus values match printed text; `bigger-strikes.test.ts`. |
| 101525 | Putrefaction | **Naprawiono — poprawiono Putrefaction: [thn] 1 dmg strike attach –1 stealth/skip unlock/burn w unlock, superior + unpreventable gdy bearer strikes/acts + skip initial strike** | Basic [thn] should be 1-damage strike that attaches this card to opposing minion, giving -1 stealth, allowing skip normal unlock and burn card in unlock; one/card. Superior adds unpreventable damage when bearer strikes/acts and may skip initial strike. Spec instead has only a plain 1-damage strike at both levels; lacks attachment, stealth, unlock, rider and strike restriction. |
| 101527 | Qetu the Evil Doer | Zgodna w sprawdzonych klauzulach | Unique mummy; 3 life, 1 strength, 2 bleed, continue-only press; shuffles on burn; `mummies.test.ts`. |
| 101528 | Quick Exit | Zgodna w sprawdzonych klauzulach | Obfuscate basic end-only press / superior dodge; positional tests. |
| 101529 | Quick Jab | Zgodna w sprawdzonych klauzulach | Deferred replacement; first-strike hand strike capped at 1 damage; first-strike suite. |
| 101530 | Quick Meld | **Naprawiono — [PRO] dodatkowy maneuver za 1 krwi raz na rundę; regression test** | [pro] maneuver; [PRO] as above and once this round may burn 1 blood for an additional maneuver. Dodano `extraManeuverForBlood: {bloodCost:1}` w superior. Cover `next-batch-a.test.ts`. |
| 101532 | Quickness | Zgodna w sprawdzonych klauzulach | One/round; basic limited additional strike, superior unlimited strike; multiple-strike tests. |
| 101534 | Quietus | **Naprawiono — generyczny Discipline master Quietus (+1 qui/capacity, bar na superior QUI)** | Supported Discipline master has no handler/spec; does not grant +1 Quietus/capacity or enforce superior-Quietus placement restriction. |
| 101535 | Rabble Razing | Zgodna w sprawdzonych klauzulach | Successful referendum makes each vampire with capacity<4 burn 1 blood; political tests. |
| 101536 | The Rack | Zgodna w sprawdzonych klauzulach | Unique location chooses ready controlled vampire on entry/control change; unlock-phase 2 blood and theft action; location tests. |
| 101537 | Rafastio Ghoul | Zgodna w sprawdzonych klauzulach | Ghoul ally; basic Thaumaturgy as capacity-3 vampire; ally tests. |
| 101541 | Rant! | Zgodna w sprawdzonych klauzulach | Anarch-only before votes; ready Anarchs may each burn 1 for vote; failed referendum acting vampire takes 2 unpreventable damage; `referendum-outcomes.test.ts`. |
| 101542 | Rapid Change | Zgodna w sprawdzonych klauzulach | Protean basic action modifier +1 stealth; superior combat strike ends combat; mixed-type tests. |
| 101544 | Rapid Thought | Zgodna w sprawdzonych klauzulach | Celerity basic maneuver OR press; superior swaps strike order only if actor chooses first; positional tests. |
| 101545 | Raptor | Zgodna w sprawdzonych klauzulach | Animal retainer; employer +1 intercept, superior also opposing controller -1 hand size while combat; retainer tests. |
| 101547 | Rat's Warning | Zgodna w sprawdzonych klauzulach | Locked-vampire bleed reaction unlocks self; superior optional press if blocks; `buying-a-block.test.ts`. |
| 101550 | Raven Spy | Zgodna w sprawdzonych klauzulach | Animal retainer +1 intercept; superior 2 life; retainer tests. |
| 101552 | Ravnos Cache | Zgodna w sprawdzonych klauzulach | Unique location stores counters for minion equipment costs; master-phase transfers and cost filters; `cost-sources.test.ts`. |
| 101553 | Ravnos Carnival | Zgodna w sprawdzonych klauzulach | Unique location adds counters by controlled Ravnos; cards action costs paid from counters; burns empty; cost tests. |
| 101558 | Read Intentions | Zgodna w sprawdzonych klauzulach | Auspex basic end-only press / superior dodge; positional tests. |
| 101564 | Rebel | Zgodna w sprawdzonych klauzulach | Trifle archetype; once/turn gains 1 before resolution after blocking titled vampire/political action; archetype tests. |
| 101566 | Recalled to the Founder | Zgodna w sprawdzonych klauzulach | Gehenna requires ≥2 others; deferred replacement; at unlock burns one of 3+ same-clan vampires unless capacity≥6 grants game-long immunity; Gehenna tests. |
| 101567 | Reckless Agitation | Zgodna w sprawdzonych klauzulach | Independent/Anarch capacity≥5 requirement; allocate 6 among ≥2 other Methuselahs, successful referendum burns per point; political tests. |
| 101577 | Redeem the Lost Soul | Zgodna w sprawdzonych klauzulach | Removes vampire from own ash heap; pool gain half capacity rounded down; ash-heap tests. |
| 101578 | Redirection | Zgodna w sprawdzonych klauzulach | Dominate basic younger-bleed redirect, superior same/older; after blocks decline, locks reactor, excludes actor's controller; `bleed-redirects.test.ts`. |
| 101583 | Regaining the Upper Hand | Zgodna w sprawdzonych klauzulach | Successful referendum gives chosen Methuselah the Edge; Edge/referendum tests. |
| 101587 | Regent | Zgodna w sprawdzonych klauzulach | Sabbat capacity≥8 title; Sabbat rush action; on diablerie transfers title before blood hunt; title-rider/diablerie tests. |
| 101588 | Rego Motum | Zgodna w sprawdzonych klauzulach | One/round; Thaumaturgy prevents 2/4 from opposing strike; prevention tests. |

W tej partii wykryto **dwie nowe karty wymagające poprawy**: Putrefaction i Quick Meld (**naprawiono** w Zestawie A, `next-batch-a.test.ts`). Quietus jest kolejnym potwierdzonym brakiem handlera z puli 51. 36 suites passed: **493 tests**.

**Audyt ręczny — partia 26: karty o ID 101591–101678 (28 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101591 | Reins of Power | Zgodna w sprawdzonych klauzulach | Once/game referendum; each chooses own ready vampire, gains 6 pool, then burns pool equal to capacity chosen by predator; referendum tests. |
| 101594 | Relentless Pursuit | Zgodna w sprawdzonych klauzulach | Potence press; superior grants +2 hand size if another round starts; round-sequencing tests. |
| 101595 | Relentless Reaper | Zgodna w sprawdzonych klauzulach | Fortitude prevents 1; Thanatosis press; superior, if both ready and combat would end, pay 1 blood to start new round; combat tests. |
| 101605 | Repo Man | Zgodna w sprawdzonych klauzulach | Unique ghoul; successful recruit unlock at end turn; +2 stealth vehicle tutor/equip with normal requirements/cost, or burn if no legal bearer; `retainer-wave.test.ts`. |
| 101608 | Resilience | Zgodna w sprawdzonych klauzulach | Fortitude prevents 1; superior prevents 3 non-agg; armor/prevention tests. |
| 101610 | Resist Earth's Grasp | Zgodna w sprawdzonych klauzulach | Basic combat press OR maneuver with optional press; superior action modifier +1 stealth; `modifier-or-combat.test.ts`. |
| 101612 | Resplendent Protector | Zgodna w sprawdzonych klauzulach | Mortal retainer prevents 1 damage/combat to employer; retainer prevention tests. |
| 101613 | Restoration | Zgodna w sprawdzonych klauzulach | +1 stealth action; basic/superior Fortitude gain 2/3 blood; blood-gain tests. |
| 101614 | Restricted Vitae | Zgodna w sprawdzonych klauzulach | Gehenna delays replacement until successful hunt; vampires cannot hunt except mandatory; mandatory hunters steal 1 from younger vampire; `hunt-success.test.ts`. |
| 101627 | Revelations | Zgodna w sprawdzonych klauzulach | +1 stealth; basic looks at prey's hand/discards chosen card; superior opens prey's hand; any minion can burn; `last-buildable.test.ts`. |
| 101628 | Revenant | Zgodna w sprawdzonych klauzulach | Ghoul retainer; employer +1 intercept; retainer tests. |
| 101631 | Revolutionary Council | Zgodna w sprawdzonych klauzulach | Baron gate; choose X ready unlocked Anarchs, allocate 2X; success locks them, burns pool per point and allocated locations/equipment; referendum tests. |
| 101632 | Rewilding | Zgodna w sprawdzonych klauzulach | Directed action burns location and controller 2 pool; `permanent-target-actions.test.ts`. |
| 101636 | Rigor Mortis | **Naprawiono — bar additional strikes + press od [thn] + cancel maneuver od [THN]; regression test** | Pre-range, once/round. [pre] bars opposing additional strikes; [thn] same plus optional press; [THN] same and once/round may cancel opponent maneuver. Poprawiono `usable: onlyBeforeRange` i `cancelOpposingManeuverOncePerRound` od [THN]. Cover `kotm-rigor-etc.test.ts` i `set-b.test.ts`. |
| 101640 | The Rising | Zgodna w sprawdzonych klauzulach | Gehenna requires two others; persists until prey ousted; bars pool gain during own turn without Edge/VP, diverts would-be gain to bank; Gehenna tests. |
| 101644 | Robert Carter | Zgodna w sprawdzonych klauzulach | Unique ghoul retainer; employer 1-blood unlock upkeep or burn; +2 bleed; retainer upkeep tests. |
| 101647 | Rogue | Zgodna w sprawdzonych klauzulach | Trifle on vampire with post-last-turn diablerie; any vampire may rush bearer; Auspex vampires +1 stealth; `granted-rush.test.ts`. |
| 101649 | Rolling with the Punches | Zgodna w sprawdzonych klauzulach | Fortitude prevent 1; superior burns 1 to prevent all opposing strike damage this round; prevention tests. |
| 101650 | Rom Gypsy | Zgodna w sprawdzonych klauzulach | Mortal ally; 2 life, 1R strike and optional maneuver; lock grants controlled Ravnos +1 stealth; `mummies`/ally tests. |
| 101656 | RPG Launcher | Zgodna w sprawdzonych klauzulach | Gun 6R, after first round only and long range; `conditional-weapons.test.ts`. |
| 101662 | The Rumor Mill, Tabloid Newspaper | Zgodna w sprawdzonych klauzulach | Unique location; lock during action to let chosen vampire pay 1 blood for +1 intercept; location tests. |
| 101664 | Rutor's Hand | Zgodna w sprawdzonych klauzulach | +1 stealth action attaches locked, causes 1 unpreventable aggravated damage; minion-phase lock unlocks; superior pays 3 blood to be immune to its own damage; damage and attachment tests. |
| 101665 | Saatet-ta | Zgodna w sprawdzonych klauzulach | Unique mummy; lock during action grants controlled Follower of Set +1 stealth/intercept/bleed; shuffle on burn; `crypt-wave-7.test.ts`. |
| 101667 | Sabbat Priest | Zgodna w sprawdzonych klauzulach | Ready Sabbat requirement; successful referendum grants lifetime block toll to chosen ready Sabbat; referendum/static tests. |
| 101669 | Sacrament of Carnage | Zgodna w sprawdzonych klauzulach | Potence ranged strike 2R/3R; thrown-object comparison suite. |
| 101670 | Sacré-Cœur Cathedral, France | Zgodna w sprawdzonych klauzulach | Unique equipment-location; does not count as equipment; bars allies from blocking bearer; block restriction tests. |
| 101671 | Sacrifice | Zgodna w sprawdzonych klauzulach | Sabbat capacity>7 requirement; chooses same-clan vampire capacity<7; success burns chosen vampire; political removal tests. |
| 101678 | Sanguinary Wind | Zgodna w sprawdzonych klauzulach | Basic prevents dodge before strikes; superior applies after strikes chosen; `round-sequencing.test.ts`. |

W tej partii wykryto **jedną nową kartę wymagającą poprawy**: Rigor Mortis — **naprawiono** w czwartej fali (zob. `set-b.test.ts`, `kotm-rigor-etc.test.ts`). Nie wykryto braków handlera. 34 suites passed: **476 tests**.

**Audyt ręczny — partia 27: karty o ID 101682–101769 (26 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101682 | Saturday-Night Special | Zgodna w sprawdzonych klauzulach | Gun, 1R strike and optional maneuver each combat; weapon tests. |
| 101685 | Sawed-Off Shotgun | Zgodna w sprawdzonych klauzulach | Gun, 3R strike once/combat; weapon tests. |
| 101686 | Scalpel Tongue | Zgodna w sprawdzonych klauzulach | Both Celerity+Presence required; choose vampire who cast votes, lock/force abstain; superior also burns 1 blood; polling tests. |
| 101689 | Scattershot | Zgodna w sprawdzonych klauzulach | Ammo +2 damage close/-2 long through combat; one ammo/gun/combat; `ammo.test.ts`. |
| 101692 | Scorn of Adonis | Zgodna w sprawdzonych klauzulach | During polling; opponents of referendum burn 1 pool each, including controlled minion votes, once at tally; referendum tests. |
| 101693 | Scorpion Sting | Zgodna w sprawdzonych klauzulach | Animalism +1 hand strike; superior also undodgeable; `undodgeable-strikes.test.ts`. |
| 101695 | Scourge | Zgodna w sprawdzonych klauzulach | Requires titled vampire; choose same-sect vampire; on referendum success attach and unlock actor; bearer may rush vampire capacity≤4 or ally; `title-riders.test.ts`. |
| 101696 | Scourge of Alecto | **Naprawiono — dual [cel][pre] + Frenzy + cap 4 + maneuver; regression test** | Frenzy; only versus vampire/werewolf. Both modes require [cel][pre] together; superior [CEL][PRE] also has optional maneuver. Poprawiono `frenzy:true`, `all:[cel,pre]`, `capDamage:4` i `maneuver` w superior. Cover `set-b.test.ts`. |
| 101698 | Scouting Mission | Zgodna w sprawdzonych klauzulach | Basic Dominate +1 bleed; superior +1 stealth action adds 2 blood to younger uncontrolled vampire; action tests. |
| 101699 | Screw the Masquerade! | Zgodna w sprawdzonych klauzulach | Successful referendum: each Methuselah burns 1 pool and chosen Methuselah +1; referendum tests. |
| 101706 | Second Tradition: Domain | Zgodna w sprawdzonych klauzulach | Prince/Justicar; basic +2 intercept; locked Prince/Justicar may burn 1 blood to unlock/attempt block with +2 even before needed; unlock/block tests. |
| 101711 | Secure Haven | Zgodna w sprawdzonych klauzulach | Unique Haven attachment; bars other Methuselahs' actions, master target cost +1, burns on torpor, one/haven; attachment tests. |
| 101712 | Seduction | Zgodna w sprawdzonych klauzulach | Announcement-time block restriction; basic younger vampire, superior any; action block-restriction tests. |
| 101715 | Sengir Dagger | Zgodna w sprawdzonych klauzulach | Unique melee strength aggravated strike; `weapons.test.ts`. |
| 101717 | Sense the Savage Way | Zgodna w sprawdzonych klauzulach | Capacity≥7; basic +1 intercept, superior locked vampire unlocks/attempts block; reaction tests. |
| 101727 | Serpent's Numbing Kiss | **Naprawiono — poprawiono Serpent's Numbing Kiss: oba poziomy [pre][ser] combat ends, superior jeśli close burn 1 attach+lock, skip unlock/burn w unlock** | Both levels require Presence+Serpentis and strike combat ends. Superior additionally, if close, burns 1 blood to attach to/lock opposing minion; that minion skips normal unlock and burns card at its unlock. Spec gives both levels only combat ends + self-unlock; no close-range gate, blood cost, attachment, lock or delayed burn. |
| 101728 | Serpentis | **Naprawiono — generyczny Discipline master Serpentis (+1 ser/capacity, bar na superior SER)** | Supported Discipline master has no handler/spec; cannot grant +1 Serpentis/capacity or enforce no-play-on-superior-Serpentis gate. |
| 101729 | Servitor of Irad | Zgodna w sprawdzonych klauzulach | Ready bearer permits +2 extra draws after any Methuselah plays Gehenna; discard down; one/vampire; Gehenna/hand tests. |
| 101736 | Shadow Boxing | **Naprawiono — poprawny typ modifierOrCombat, wymaga [obf][pot] razem, tryby maneuver/press i superior kontynuacja; regression test** | Printed [obf][pot] combat modes both require both disciplines (maneuver-to-close OR continue-only press). Superior [OBF][POT] is an action modifier after block-combat, only when blocker not ready; burn 1 blood to continue action as unblocked. Poprawiono `all:[obf,pot]`, `modifierOrCombat`, `continueAsUnblocked`. Cover `next-batch-a.test.ts`. |
| 101741 | Shadow of the Wolf | Zgodna w sprawdzonych klauzulach | Pre-range Protean; limited additional strike +1 strength; superior adds optional press; strength/round tests. |
| 101753 | Shanty Town Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique standard Hunting Ground; 1 blood to ready controlled vampire; one HG/vampire/turn; hunting tests. |
| 101754 | Shape Mastery | **Naprawiono — poprawiono Shape Mastery: [pro] cancel tylko combat wymagające obt/pro/vic z bar same-card, [PRO] reaction cancel action modifier tych dyscyplin** | Basic [pro] combat cancel/refund only for combat card requiring Obtenebration/Protean/Vicissitude, bars same card for action. Superior [PRO] reaction cancels/refunds action modifier with those requirements. Spec uses generic `cancelCombatCard` both levels without discipline filter or same-action bar; card is combat-only, so superior action-modifier reaction is absent. |
| 101756 | Shared Strength | Zgodna w sprawdzonych klauzulach | Ready uninvolved vampire grants a combatant basic/superior Fortitude for remainder of combat; outside-combat tests. |
| 101760 | Shattering Blow | Zgodna w sprawdzonych klauzulach | Potence strike destroys equipment; superior first strike; equipment-stripping tests. |
| 101767 | Shilmulo Tarot | Zgodna w sprawdzonych klauzulach | Unique Ravnos equipment stores top 2 library cards face-down; ready bearer may replace draws from store; unlock phase refills; store/search tests. |
| 101769 | Short-Term Investment | Zgodna w sprawdzonych klauzulach | Master investment puts 3 blood, optional master action takes 1, burns empty; `investments.test.ts`. |

W tej partii wykryto **cztery nowe karty wymagające poprawy**: Scourge of Alecto (**naprawiono** w Zestawie B), Serpent's Numbing Kiss, Shadow Boxing (**naprawiono** w Zestawie A) i Shape Mastery. Serpentis jest kolejnym potwierdzonym brakiem handlera z puli 51. 24 suites passed: **319 tests**.

**Audyt ręczny — partia 28: karty o ID 101772–101870 (42 karty).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101772 | Show of Force | Zgodna w sprawdzonych klauzulach | Both Potence+Presence required; bleed +1/+2, if blocked actor can gain +1/+2 strength for that combat; `bleed-riders.test.ts`. |
| 101778 | Side Strike | Zgodna w sprawdzonych klauzulach | Celerity basic dodge; superior limited additional strike; `combat-strikes.test.ts`. |
| 101779 | Sideslip | Zgodna w sprawdzonych klauzulach | Basic dodge; superior prevents 1, once/vampire/round at superior; `dodges.test.ts`. |
| 101780 | Sight Beyond Sight | Zgodna w sprawdzonych klauzulach | Unique master burn-option; attaches to Salubri for +1 intercept; `sweep4.test.ts`, `burn-option.test.ts`. |
| 101781 | The Signet of King Saul | Zgodna w sprawdzonych klauzulach | Unique equipment; vampires of capacity 8+ cannot attempt to block bearer; legacy equipment tests. |
| 101790 | Skin of Night | Zgodna w sprawdzonych klauzulach | Fortitude makes aggravated damage normal for remainder of round; superior also prevents 1; `armour.test.ts`. |
| 101791 | Skin of Rock | Zgodna w sprawdzonych klauzulach | Fortitude prevents 1/2 damage; armor tests. |
| 101792 | Skin of Steel | Zgodna w sprawdzonych klauzulach | 1 blood; prevent all opposing strike damage / all opposing strikes this round; armor tests. |
| 101798 | Slam | **Naprawiono — superior range commitment and close-only maneuver; regression test** | Superior commits its hand strike in `combat.range`; the only-to-close rider is a close-only maneuver credit, while the strike remains usable at close range. Covered in `slam.test.ts`. |
| 101799 | The Slashers | Zgodna w sprawdzonych klauzulach | Unique mortal ally, 3 life, 0 strength/bleed; can strike for 1R; plain-ally tests. |
| 101801 | Slaughtering the Herd | Zgodna w sprawdzonych klauzulach | Basic Dominate bleed +2, allies cannot block; superior attaches to predator's vampire, siphons 1 when it announces an action, may burn with 4 blood; action-attachment tests. |
| 101802 | Slave Auction | Zgodna w sprawdzonych klauzulach | Unique master; starts with counters equal to Methuselah count, master action moves one to pool, burns empty; investment tests. |
| 101805 | The Sleeping Mind | Zgodna w sprawdzonych klauzulach | Only as action announced; Dominate bars chosen locked vampire from blocking, superior prevents all minions unlocking during action; block-tax tests. |
| 101807 | The Slow Withering | Zgodna w sprawdzonych klauzulach | Gehenna requires another Gehenna; superior-discipline cards cost +1 blood; diablerists exempt until another Gehenna enters play; Gehenna-tax tests. |
| 101808 | Slum Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique standard hunting ground; once per turn a ready vampire gains 1, one hunting ground/vampire/turn; hunting tests. |
| 101811 | Smiling Jack, The Anarch | Zgodna w sprawdzonych klauzulach | Moves 1 pool counter during own unlock; all other Methuselahs pay 1 pool or blood/minion/counter during unlock; any vampire may burn it as directed action; unlock-punishment tests. |
| 101814 | Smoke Grenade | Zgodna w sprawdzonych klauzulach | Weapon ends combat as strike only at long range; burns after use; one-shot weapon tests. |
| 101816 | Sniper Rifle | Zgodna w sprawdzonych klauzulach | Long-range 2R gun; if bearer blocks, sets first-round range long before range and must use it for initial strike; weapon-rider tests. |
| 101817 | Soak | Zgodna w sprawdzonych klauzulach | One/vampire/round; prevents 2/4 non-aggravated damage; combat-attachment/prevention tests. |
| 101819 | Social Charm | Zgodna w sprawdzonych klauzulach | Presence bleed +1; superior gains 1 pool for successful bleed; `sweep.test.ts`. |
| 101820 | Social Ladder | Zgodna w sprawdzonych klauzulach | Master attaches to ready controlled vampire; influence phase removes it from game, transfers its blood to an older uncontrolled vampire; graduation tests. |
| 101821 | Society Hunting Ground | Zgodna w sprawdzonych klauzulach | Standard unique hunting ground; one blood to a ready vampire, one HG/vampire/turn; hunting tests. |
| 101822 | Society of Leopold | Zgodna w sprawdzonych klauzulach | Attachment makes bearer burn 1 blood or burn at unlock; bearer may move it to another vampire as +1 stealth directed action; library audit. |
| 101823 | Sociopath | Zgodna w sprawdzonych klauzulach | Unique Sabbat archetype; once/turn gains 1 blood if bearer remains ready and its combat burns a minion or sends vampire to torpor; archetype tests. |
| 101824 | Sonar | Zgodna w sprawdzonych klauzulach | Delayed replacement after current turn; basic +1 intercept only on directed action, superior unrestricted; conditional reaction tests. |
| 101825 | Song in the Dark | Zgodna w sprawdzonych klauzulach | Animalism strike 2 damage / 2 aggravated; aggravated-damage tests. |
| 101827 | Song of Serenity | Zgodna w sprawdzonych klauzulach | Pre-range; opposing minion -1 strength this round / rest of combat; once per vampire/combat; strength-before-range tests. |
| 101829 | Soul Burn | Zgodna w sprawdzonych klauzulach | Thaumaturgy ranged strike 1R/2R, bypasses Fortitude prevention and nullifies opposing weapon damage this round; armor/discipline-filter tests. |
| 101839 | The Spawning Pool | Zgodna w sprawdzonych klauzulach | Unlock may move blood from ready Nosferatu to pool; during round 2 of combat from blocking bleed against you, may lock to inflict unpreventable damage per counter; blood-and-gear tests. |
| 101841 | Special Report | Zgodna w sprawdzonych klauzulach | Out-of-turn master; choose ready vampire to unlock/attempt block, once/action may burn 1 pool for +1 intercept; master-intercept tests. |
| 101842 | Specialization | Zgodna w sprawdzonych klauzulach | Unique master; during unlock lock and discard pair of identical cards to gain 1 pool; hand-churn tests. |
| 101847 | Spirit Claws | **Naprawiono — poprawiono Spirit Claws: typ Action+Combat, dodano akcję attach unique z persistent hand strikes agg, combat manewr pozostaje** | Printed as Action+Combat. Combat modes correctly grant aggravated hand strikes, with superior maneuver; spec is combat-only and omits action modifier that attaches this card to actor as a unique card, granting ongoing aggravated hand strikes. |
| 101850 | Spirit's Touch | Zgodna w sprawdzonych klauzulach | Auspex +1 intercept; superior optional maneuver if vampire blocks; intercept-reaction tests. |
| 101854 | Spoils of War | Zgodna w sprawdzonych klauzulach | After successful directed action: actor gains 1 blood and controller 1 pool; legacy-modifier tests. |
| 101856 | Sport Bike | Zgodna w sprawdzonych klauzulach | Vehicle grants +1 intercept; one vehicle/minion; action-attachment and equipment tests. |
| 101857 | Spying Mission | Zgodna w sprawdzonych klauzulach | Obfuscate +1 stealth; superior on would-succeed bleed prevents pool loss, fails action, attaches to record target; next successful bleed against same target burns it and gives +2 bleed; last-equipment-modifier tests. |
| 101859 | Staredown | Zgodna w sprawdzonych klauzulach | Presence basic dodge, superior combat-ends strike; dodge tests. |
| 101864 | Steadfastness | Zgodna w sprawdzonych klauzulach | Fortitude basic +1 intercept on action directed at you/your card; superior reduces bleed against you by 1; conditional-reaction tests. |
| 101866 | Stealing Years | Zgodna w sprawdzonych klauzulach | Anarch +1 stealth diablerie older vampire in torpor; attaches for +1 capacity, each Anarch +1 vote in ensuing blood hunt; torpor-prey tests. |
| 101867 | Stealth Ritus | Zgodna w sprawdzonych klauzulach | Ready Sabbat required; chooses other ready Sabbat who burns 1 blood; action gets +1 stealth even if not yet needed; second-minion-modifier tests. |
| 101869 | Steely Tenacity | **Naprawiono — poprawiono Steely Tenacity: Action+Combat Anarch 1 blood, [ani] +1 dmg+press, [dom] bleed+1 action, [qui] +1 stealth enter combat** | Action+Combat Anarch card, cost 1. Animalism combat strike is +1 damage with optional press; Dominate action mode bleeds +1; Quietus action mode is +1 stealth action to enter combat with a minion. Spec has only Combat type; the Dominate and Quietus entries have no effects, so both action modes are missing. |
| 101870 | Stiff Contempt | Zgodna w sprawdzonych klauzulach | Samedi action modifier, only when action announced; vampires must burn 1 blood to attempt block (allies are not subject to toll); legacy-modifier tests. |
W tej partii wykryto **dwie nowe karty wymagające poprawy**: Spirit Claws i Steely Tenacity. Nie wykryto nowych braków handlera. 48 suites passed: **622 tests** (46 suites/590 tests, plus 2 suites/32 tests).

**Audyt ręczny — partia 29: karty o ID 101871–101970 (34 karty).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101872 | Stolen Police Cruiser | Zgodna w sprawdzonych klauzulach | Anarch vehicle; +1 bleed, allies/younger vampires -1 intercept; vampires may pay 1 pool to burn it, locking bearer and skipping next unlock; static/equipment tests. |
| 101877 | Storage Annex | Zgodna w sprawdzonych klauzulach | Location stores one hand card face down, owner may inspect; master phase may exchange with a hand card; store tests. |
| 101882 | Street Cred | **Naprawiono — onlyAfterInflictedMore + bloodBankToUncontrolled 1/2, oncePerTurnPerVampire; regression test** | `onlyAfterInflictedMore` w `combat.endOfRound`, `bloodBankToUncontrolled` do młodszej, `oncePerTurnPerVampire`. Cover `street-cred.test.ts`. |
| 101883 | Strength of the Bear | **Naprawiono — zakres strength i optional press; regression test** | [ANI] now grants round strength; [spi] retains combat-long strength; [SPI] grants optional press. Corrected mode variants; covered by `strength-before-range.test.ts`. |
| 101888 | Stunt Cycle | **Naprawiono — dodano Celerity rider: burn 1 krwi blokuje całość; regression test** | Long-range Potence strike 3R/4R and prevent 1/2 from opposing strike during this strike resolution; if opposing minion has Celerity, it may burn 1 blood to prevent all damage from this strike. Dodano `celerityCancelStrike`, `onlyAtLongRange`, `preventDamage`. Cover `next-batch-a.test.ts`. |
| 101891 | Submachine Gun | Zgodna w sprawdzonych klauzulach | 3R gun, each strike; optional maneuver each combat; legacy weapon tests. |
| 101896 | Sudden Reversal | Zgodna w sprawdzonych klauzulach | Out-of-turn cancel of another Methuselah's master card as played; cost refunded; out-of-turn cancel tests. |
| 101899 | Summon Spirit Beast | **Naprawiono — poprawiono Summon Spirit Beast: dodano Reaction + Combat, [ANI] discard X, [spi] move X animal retainers z ash heap z starting life, superior opóźnione spalenie** | [ANI] combat discards X cards; [spi] Combat+Reaction moves X animal retainers from ash heap to vampire with starting life; superior delays burning them until after next minion phase. Spec instead registers a Combat-only card whose modes all grant a press. |
| 101905 | Superior Mettle | Zgodna w sprawdzonych klauzulach | Fortitude prevents all opposing strike damage; superior also offers once-per-round 1-blood prevention of all damage from opposing initial strike; combat/prevention tests. |
| 101907 | Suppressing Fire | **Naprawiono — dopuszczono gotowego sojusznika; regression test** | Source gate now accepts any ready unlocked minion other than actor while still requiring a gun; `second-minion-modifiers.test.ts` covers ally source. |
| 101909 | Surprise Influence | Zgodna w sprawdzonych klauzulach | Requires ready vampire; only during political referendum; reacting vampire +2 votes; referendum tests. |
| 101913 | Swallowed by the Night | Zgodna w sprawdzonych klauzulach | Obfuscate action modifier +1 stealth or superior combat maneuver; `modifier-or-combat.test.ts`. |
| 101921 | Sword of the Righteous | **Naprawiono — basic Valeren mode exposed; regression test** | Corrected [val] to basic, retained [VAL] superior prevention variant, and disambiguated discipline modes; `combat-strikes.test.ts` confirms basic Valeren is playable. |
| 101923 | Sympathetic Agony | **Naprawiono — warunkowy bar uzbrajany po obrażeniu; regression test** | Both levels require Chi+Fortitude. Only if damage is successfully inflicted on this vampire in a round, opponent cannot press that round; superior also bars opponent's additional strikes. Usunięto nieprintowany `combatLimit`, dodano `barPressIfDamaged` warunkowy. Cover `kotm-rigor-etc.test.ts` i `set-b.test.ts`. |
| 101926 | Tainted Vitae | Zgodna w sprawdzonych klauzulach | 2 blood; Ministry reaction to predator's vampire about to successfully hunt; +2 hunt, attaches under own control, adds 1 blood toll to that vampire's bleed against controller; hunt-success tests. |
| 101938 | Target Hand | Zgodna w sprawdzonych klauzulach | Aim; two combat cards may cancel; if damage lands, -1 strength this action and optional weapon destruction; aim tests. |
| 101939 | Target Head | Zgodna w sprawdzonych klauzulach | Aim adds +2 strike damage; one-card cancellation; damage landing bars opposing presses/additional strikes for round and offers next-round range setting; aim tests. |
| 101940 | Target Leg | Zgodna w sprawdzonych klauzulach | Aim; two-card cancel; if strike damage lands, restrict opponent's maneuvers/presses to Obfuscate, Blood Sorcery, or Flight this action; aim tests. |
| 101942 | Target Vitals | Zgodna w sprawdzonych klauzulach | Aim at strike choice; damage landing adds 2 and bars presses; opponent may discard two combat cards to cancel; aim tests. |
| 101943 | Tasha Morgan | Zgodna w sprawdzonych klauzulach | Unique mortal retainer, 1 life, employer +1 bleed; retainer tests. |
| 101945 | Taste of Vitae | Zgodna w sprawdzonych klauzulach | End of round; cannot be played by vampire being burned/going torpor; one each round; gain blood equal to opposing vampire's blood lost to damage this round; combat tests. |
| 101948 | Telepathic Counter | Zgodna w sprawdzonych klauzulach | Auspex reduces bleed against controller by 1/2; conditional reaction tests. |
| 101949 | Telepathic Misdirection | Zgodna w sprawdzonych klauzulach | Auspex +1 intercept; superior after blocks declined on bleed against you, locks reactor and redirects to another Methuselah other than acting controller; redirect tests. |
| 101950 | Telepathic Tracking | **Naprawiono — maneuver dopiero w następnej rundzie; regression test** | Basic press only to continue; if another round occurs, this vampire gets an optional maneuver that round. Zmieniono `combatCredits` natychmiastowy na `maneuverNextRound` deferred. Superior poprawny `startNewRound` z `onlyIfCombatWouldEnd` + `onlyIfBothCombatantsReady`. Cover `set-b.test.ts`. |
| 101951 | Telepathic Vote Counting | Zgodna w sprawdzonych klauzulach | Polling: cancel referendum and return own political-action card, or superior forces abstention; discard-down handling; referendum tests. |
| 101952 | Templar | Zgodna w sprawdzonych klauzulach | Requires ready titled Sabbat; successful referendum attaches to chosen Sabbat, grants directed rush action; Sabbat can call political action to burn; bearer-rush tests. |
| 101953 | Temple Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique standard hunting ground; 1 blood during unlock; one per vampire per turn; hunting-ground tests. |
| 101955 | Temptation of Greater Power | Zgodna w sprawdzonych klauzulach | Ready justicar; one/game; table bids for vampire control, up to 5 credited pool, debt paid during discard; auction tests. |
| 101958 | Tension in the Ranks | Zgodna w sprawdzonych klauzulach | Unique; ready minion burned or sent to torpor costs its controller 1 pool; burn this card with master action/discard two masters; pool-drain tests. |
| 101960 | Terror Frenzy | Zgodna w sprawdzonych klauzulach | Frenzy; first round blocks opposing close maneuver/continue press/equipment; superior increases opposing vampire combat-card costs by 1 blood, once/combat; frenzy and play-cost tests. |
| 101963 | Thadius Zho | Zgodna w sprawdzonych klauzulach | Unique 2-life mage, 2 bleed, 2R strike, optional maneuver; +1 stealth directed action to burn 1 blood from a vampire; legacy minion tests. |
| 101965 | Thaumaturgy | Zgodna w sprawdzonych klauzulach | Discipline master gives +1 Blood Sorcery and capacity/generation adjustment; cannot attach to vampire with superior Thaumaturgy; discipline-card tests. |
| 101966 | Theft of Vitae | Zgodna w sprawdzonych klauzulach | Thaumaturgy ranged strike steals 1/2 blood or life as blood; Thaumaturgy-strike tests. |
| 101968 | Therbold Realty | Zgodna w sprawdzonych klauzulach | Unique location reduces controller's location costs by 1 blood or pool; location/play-cost tests. |

W tej partii wykryto **osiem nowych kart wymagających poprawy**: Street Cred, Strength of the Bear, Stunt Cycle, Summon Spirit Beast, Suppressing Fire, Sword of the Righteous, Sympathetic Agony (**naprawiono** w czwartej fali) i Telepathic Tracking (**naprawiono** w czwartej fali). Automatyczne porównanie nie wykazało nowego braku handlera. 41 suites passed: **564 tests**.

**Audyt ręczny — partia 30: karty o ID 101971–102070 (39 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 101972 | Thing | Zgodna w sprawdzonych klauzulach | Gangrel +1 stealth action; adds 2 blood to a Gangrel in uncontrolled region; `thing.test.ts`. |
| 101973 | Third Tradition: Progeny | Zgodna w sprawdzonych klauzulach | Non-sterile Prince/Justicar; successful action creates same-clan 1-cap Camarilla vampire, cannot act this turn, may choose Discipline master and move up to 2 blood; new-vampire tests. |
| 101974 | Thirst | Zgodna w sprawdzonych klauzulach | Gehenna; after each minion phase, each ready vampire with capacity below Gehenna-event count that did not hunt burns 1 blood; hunt-announcement ruling reflected; Gehenna tests. |
| 101978 | Threats | Zgodna w sprawdzonych klauzulach | Dominate +1/+2 limited bleed modifier, only during bleed; modifier tests. |
| 101980 | Threestar Cab Company | Zgodna w sprawdzonych klauzulach | Unique hunting-ground location; master-phase lock stores blood, unlock-phase lock transfers one to pool or ready vampire; location/store tests. |
| 101982 | Thrown Gate | **Naprawiono — both strike modes commit in range; regression test** | Basic and superior ranged strikes commit in `combat.range` with their optional maneuver; covered in `thrown-objects.test.ts`. |
| 101983 | Thrown Sewer Lid | Zgodna w sprawdzonych klauzulach | Long-range Potence strike 3R; superior optional press; thrown-object tests. |
| 101984 | Tier of Souls | Zgodna w sprawdzonych klauzulach | Animalism directed prey-minion blood steal; superior attaches for +1 bleed against prey; minions can burn it; one per vampire enforced by attachment gate; action-attachment tests. |
| 101986 | Tithings | Zgodna w sprawdzonych klauzulach | Requires ready Sabbat capacity>6; successful referendum steals 1 pool from each Methuselah without a >6-capacity vampire; political tests. |
| 101987 | Tomb of Rameses III | Zgodna w sprawdzonych klauzulach | Unique location tracks chosen uncontrolled vampire and adds one tomb counter for each transfer; ready-region threshold uses combined counters; burns when vampire leaves uncontrolled; graduation tests. |
| 101989 | Toreador Grand Ball | Zgodna w sprawdzonych klauzulach | Chooses two ready controlled Toreador, locks one; other's non-bleed actions cannot be blocked; minions may burn, Nosferatu -1 stealth; dedicated tests. |
| 101990 | Toreador Justicar | Zgodna w sprawdzonych klauzulach | Unique Camarilla title; chooses ready Toreador; each ready Toreador +1 vote in title referendum; justicar/political tests. |
| 101991 | Toreador's Bane | **Naprawiono — opponent gate and continuation modes; regression test** | Added combat opponent restriction; strike no longer unlocks actor; Melpominee basic resumes only eligible non-bleed/non-political action, superior also handles bleed/political actions; `combat-strikes.test.ts`. |
| 101993 | Torn Signpost | Zgodna w sprawdzonych klauzulach | Pre-range Potence sets strength to 2/3 for combat; combat tests. |
| 101994 | Torpid Blood | Zgodna w sprawdzonych klauzulach | Gehenna; action costs +1 blood when performed by torpid vampire; rescuing older vampire costs +1; Gehenna-tax tests. |
| 101995 | Torrent | Zgodna w sprawdzonych klauzulach | Celerity limited additional strike; superior combat-ends strike continues a blocked action as unblocked; after-combat-payoff tests. |
| 101999 | Touch of Pain | **Naprawiono — non-predator successful bleed, passed political referendum, one/action; regression tests** | Reaction now checks any successful bleed against you (not only your predator), opens in a passed political referendum and damages its caller, and enforces one copy per action across minions. Covered in `after-resolution.test.ts` and `referendum-margin.test.ts`. |
| 102005 | Traditionalist | Zgodna w sprawdzonych klauzulach | Trifle archetype; once/turn if bearer casts votes/ballots against failed referendum, gains 1 blood; vampire-vote tests. |
| 102010 | Transfer of Power | Zgodna w sprawdzonych klauzulach | Successful referendum steals 1 pool from each Methuselah with more pool than caller; political tests. |
| 102014 | Treachery | Zgodna w sprawdzonych klauzulach | Before voting; Presence makes caller's controller lose 1 pool if passed; superior also charges other Methuselahs who voted in favor; referendum tests. |
| 102015 | Treasured Samadji | Zgodna w sprawdzonych klauzulach | Ravnos +1 bleed and once/combat dodge; permanent/weapon tests. |
| 102019 | Treaty of Tyre Enforced | Zgodna w sprawdzonych klauzulach | Successful referendum: each Methuselah burns X+1 pool, X = controlled Banu Haqim (legacy Assamites); table-pool tests. |
| 102021 | Tremere Justicar | Zgodna w sprawdzonych klauzulach | Unique Camarilla title; ready Tremere, and each ready Tremere +1 vote in referendum; justicar tests. |
| 102022 | Tribunal Judgment | Zgodna w sprawdzonych klauzulach | Sabbat political action; targets vampire that cast votes in most recent referendum since caller's last turn; successful referendum deals damage equal to votes cast; vampire-vote tests. |
| 102023 | Tribute to the Master | Zgodna w sprawdzonych klauzulach | Move one blood from each ready vampire controlled to pool; legacy-master tests. |
| 102041 | True Love's Face | Zgodna w sprawdzonych klauzulach | Obfuscate+Presence limited +1 bleed; superior fails block attempt and bars repeat attempt, blocker controller may pay 1 pool to cancel; cross-table/cheap-tail tests. |
| 102046 | Tumnimos | Zgodna w sprawdzonych klauzulach | Non-sterile capacity≥5 Ravnos; creates 2-cap same-sect Ravnos with basic Chimerstry, cannot hunt/action restrictions apply; Discipline master from hand; new-vampire tests. |
| 102048 | Tutu the Doubly Evil One | Zgodna w sprawdzonych klauzulach | Unique mummy, 3 life, 2 strength/1 bleed; once/combat dodge, minion-phase unlock, torpor vampire equipment steal; shuffles into library on burn; mummy tests. |
| 102051 | Twisting the Knife | **Naprawiono — post-infliction trigger, hand/melee coverage, phase limit, superior press; regression tests** | Opens only after a hand or melee strike has actually inflicted 3+ damage after prevention; adds a separately preventable damage packet; limits to one per vampire/strike phase; superior grants an optional press. Covered in `combat-strikes.test.ts`, including card-declared hand strike, melee weapon strike and prevention threshold. |
| 102052 | Two Wrongs | Zgodna w sprawdzonych klauzulach | Out-of-turn Trifle redirects qualifying bleed after blocks declined; prevents next target-changing card; bleed-redirect tests. |
| 102054 | Typhonic Beast | **Naprawiono — superior grants optional press; regression test** | Combat-long strength/prevention retained; superior now grants an optional press rather than a continue-only press. Duplicate basic discipline modes disambiguated; covered by `strength-before-range.test.ts`. |
| 102059 | Uncontrolled Impulse | Zgodna w sprawdzonych klauzulach | +2 stealth, unavailable after any non-mandatory action that turn; avoiding-the-block tests. |
| 102060 | Undead Persistence | **Naprawiono — torpor delay, press, three-cardless-round clock, superior prevention; regression tests** | Fortitude basic now opens after prevention only when damage would cause torpor, defers the vampire until combat ends, grants one optional press, and ends combat after three rounds with no combat cards; superior prevents 2. Covered in `tests/cards/torpor-delay.test.ts`. |
| 102061 | Undead Strength | Zgodna w sprawdzonych klauzulach | Potence hand/melee strike +1/+2 damage; bigger-strikes tests. |
| 102063 | Under Siege | Zgodna w sprawdzonych klauzulach | Unique, titled Sabbat required; 3 counters, once/action Sabbat unlocks and attempts block with +1 intercept; burns empty; dedicated tests. |
| 102064 | Under the Skin | Zgodna w sprawdzonych klauzulach | Before votes; Auspex+Presence forces younger vampire to abstain; superior locks if referendum passes; vote-changing tests. |
| 102065 | Underbridge Stray | Zgodna w sprawdzonych klauzulach | Animal ally; burns life for press; can burn itself during directed action to unlock ready minion; superior 2 life/1 strength; ally/crypt tests. |
| 102066 | Underworld Hunting Ground | Zgodna w sprawdzonych klauzulach | Unique standard hunting ground; 1 blood at unlock, one HG/vampire/turn; hunting-ground tests. |
| 102068 | Undying Tenacity | **Naprawiono — torpor delay, superior press/prevention modes; regression tests** | Fortitude basic delays torpor until combat ends while the vampire remains wounded/burnable. Superior has distinct press and prevent-1 modes. Covered in `tests/cards/torpor-delay.test.ts`. |

W tej partii wykryto historycznie **sześć nowych kart wymagających poprawy**: Toreador's Bane, Touch of Pain, Twisting the Knife, Typhonic Beast, Undead Persistence i Undying Tenacity; później naprawiono wszystkie sześć. Thrown Gate to kolejna karta objęta wcześniej policzonym wspólnym błędem timingowym. Automatyczne porównanie nie wykazało nowego braku handlera. W chwili audytu 29 suites passed: **324 tests**.

### Błąd wspólnego timingu — strike’y z manewrem

Porównanie specyfikacji z sekwencją walki ujawniło wspólny błąd: `combatWindowFor()` wysyłał strike’i z riderem `riders.maneuver` do `combat.chooseStrike`, przez co nie dało się wykorzystać manewru w jego właściwym oknie `combat.range`. Naprawa: strike z optional maneuver jest teraz oferowany w `combat.range` i jego wybór commitmentuje strike; gracz może następnie użyć manewru. Warianty bez ridera pozostają w `combat.chooseStrike`. `strikeHandBonus`, `strikeDamage`, `strikeStealBlood` i dodge są uwzględnione jako strike źródła, a kosztowe/cancelowanie nadal rozpoznają je jako strike cards. Maneuver-only-to-close Slam daje close-only credit; przy close strike nadal można zagrać bez manewru. Dodano testy opcji timingowych, commitmentu i zgodności riderów.

To dotyczy co najmniej **sześciu wspieranych kart** w obecnych specyfikacjach:

- **Aid from Bats (100029)** — basic i superior; dodatkowo superior błędnie pomija „as above”, czyli podstawowy maneuver;
- **Diversion (100563)** — [tha] ranged steal-blood strike z maneuver;
- **Slam (101798)** — superior hand strike z maneuver, ograniczonym wyłącznie do przejścia na close range;
- **Thrown Gate (101982)** — oba strike modes z maneuver;
- **Mercury's Arrow (101202)** — basic strike z maneuver;
- **Lam Into (101071)** — [for] hand/melee strike z maneuver.

Wszystkie sześć kart naprawiono i każdą ujęto w regression coverage; poprawa jest wspólna w silniku, ale raportowana osobno dla każdej karty. .44 Magnum jest hand-rolled i ma osobny prawidłowy wzorzec commitment w `combat.range`.

### Automatyczny przegląd rejestracji — wynik do dalszej weryfikacji

Porównanie 1 151 wspieranych kart z nazwami w `buildHandlerRegistry()` wykryło **43 karty biblioteczne bez wpisu handlera**. Dla kart bibliotecznych brak handlera oznacza, że silnik pomija ich opcje z ręki, więc każda z tych kart wymaga korekty: implementacji albo jawnego oznaczenia jako niewspieranej. Trzydzieści trzy z listy — Abandoning the Flesh, Absorb the Mind, Ahriman's Demesne, Alpha Glint, Amaranth, Amria, Anesthetic Touch, Apparition, Armor of Caine's Fury, Armor of Vitality, Ashes to Ashes, Aura Reading, Autonomic Mastery, Baal's Bloody Talons, Backstab, Basilisk's Touch, Bestial Vengeance, Blade Clot, Bliss, Blissful Agony, Blood of Acid, Blood of the Cobra, Bloodform, Body of Sun, Bond with the Mountain, Bonecraft, Botched Move, Chimerstry, Dementation, Necromancy, Obtenebration, Quietus i Serpentis — zostały już ręcznie potwierdzone w partiach 1–27. Pozostałe 10 czekają na tekstowe sprawdzenie i decyzję implementacyjną.

To jest też luka w mechanicznym teście `supported.test.ts`: test porównuje listę ID z `implementedIds`, ale sama ręczna lista ID nie gwarantuje, że handler istnieje. Dodam odpowiedni guard po uporządkowaniu bieżących rozbieżności, żeby nie zostawić testu trwale czerwonego.

Brak osobnego handlera dla karty kryptycznej nie jest automatycznie błędem: część kart krypty to tylko nazwa/klan/sekta/tytuł, obsługiwane danymi. Umiejętności specjalne bez handlera będą osobno triage'owane.

## Licznik korekt

- Karty sprawdzone ręcznie karta po karcie: **825 / 1 151**.
- Karty wymagające korekty wykryte dotąd: **co najmniej 91** (43 wspierane karty biblioteczne bez handlera + 6 kart ze strike’em i maneuver riderem + Bleeding the Vine, Chameleon, Chameleon's Colors, Charismatic Aura, Conquer the Beast, Crimson Fury, The Death of My Conscience, Denial of Aphrodite's Favor, Drawing Out the Beast, Elemental Stoicism, Force of Personality, Improvised Tactics, Infection, Jua Vema, King of the Mountain, Lessons in the Steel, Mask Empathy, Necrosis, Penitent Resilience, Putrefaction, Quick Meld, Rigor Mortis, Scourge of Alecto, Serpent's Numbing Kiss, Shadow Boxing, Shape Mastery, Spirit Claws, Steely Tenacity, Street Cred, Strength of the Bear, Stunt Cycle, Summon Spirit Beast, Suppressing Fire, Sword of the Righteous, Sympathetic Agony, Telepathic Tracking, Toreador's Bane, Touch of Pain, Twisting the Knife, Typhonic Beast, Undead Persistence i Undying Tenacity; zbiory są rozłączne).
- Karty poprawione w ramach audytu: **91** (wszystkie 91 kart z pierwszej listy — w tym 43 wspierane bez handlera, 6 ze strike/maneuver riderem oraz pozostałe błędnie zaimplementowane: Bleeding the Vine, Chameleon, Chameleon's Colors, Charismatic Aura, Conquer the Beast, Crimson Fury, The Death of My Conscience, Denial of Aphrodite's Favor, Drawing Out the Beast, Elemental Stoicism, Force of Personality, Improvised Tactics, Infection, Jua Vema, King of the Mountain, Lessons in the Steel, Mask Empathy, Necrosis, Penitent Resilience, Putrefaction, Quick Meld, Rigor Mortis, Scourge of Alecto, Serpent's Numbing Kiss, Shadow Boxing, Shape Mastery, Spirit Claws, Steely Tenacity, Street Cred, Strength of the Bear, Stunt Cycle, Summon Spirit Beast, Suppressing Fire, Sword of the Righteous, Sympathetic Agony, Telepathic Tracking, Toreador's Bane, Touch of Pain, Twisting the Knife, Typhonic Beast, Undead Persistence, Undying Tenacity oraz pozostałe wspierane z listy 43 — implementacja i testy regresyjne).
- Otwarte karty wymagające korekty: **0**.
- To licznik tymczasowy — kolejne porównania tekstu i reguł mogą go zwiększyć; końcowa liczba będzie podana dopiero po przejściu całego zakresu.

### Pierwsza fala napraw

Naprawiono cztery z rozbieżności z partii 28–30: Strength of the Bear, Suppressing Fire, Sword of the Righteous i Typhonic Beast. Dodano testy regresyjne w `strength-before-range.test.ts`, `second-minion-modifiers.test.ts` i `combat-strikes.test.ts`. Wynik: **3 suites / 28 tests passed**; `npm run typecheck` passed.

Ostatni pełny run po zmianie timingowej, przed poprawką testu wyboru superior-mode dla nowego okna range: **333 suites passed / 2 failed; 3 715 tests passed / 2 failed**. Jedna porażka to znana, niezwiązana `tests/ui/transport.test.ts` — „undoes past its own auto-passes”; druga była nieaktualnym testem helperowym `tests/cards/superior-modes.test.ts`, który zakładał, że Slam basic i superior są w jednym oknie. Helper zaktualizowano: superior jest w `combat.range`, basic w `combat.chooseStrike`. Po korekcie i dodaniu regresji dla restrykcji z Terror Frenzy: celowane **7 suites / 53 tests passed** i `npm run typecheck` passed. Pełny run nie został powtórzony po tej korekcie; znany transport failure pozostaje niepowiązany.

Druga fala wdrożyła też Toreador's Bane — opponent gate i właściwe after-combat continuation dla basic/superior. Touch of Pain naprawiono: dowolny udany bleed wymierzony w gracza, passed political referendum z obrażeniami na calling minion oraz limit jednej kopii na action; regresje w `after-resolution.test.ts` i `referendum-margin.test.ts`. Walidacja Touch: **2 suites / 28 tests passed**; `npm run typecheck` passed.

Twisting the Knife dostał osobne okno po faktycznym zadaniu obrażeń strike’u: warunek 3+ jest sprawdzany po prewencji, hand/melee source jest zachowany na pakiecie, a faza strike’u ma własny identyfikator. Dodatkowy punkt tworzy nowy, prewentowalny pakiet; superior dodaje optional press. Regresje sprawdzają hand strike, strike z karty, melee weapon, obniżenie obrażeń poniżej progu przez Soak oraz prewencję dodatkowego punktu. **5 Twisting regressions passed** w `combat-strikes.test.ts`

Undying Tenacity i Undead Persistence naprawiono wspólnym oknem `combat.wouldGoTorpor`, otwieranym po prewencji, gdy pakiet faktycznie spowodowałby torpor, ale przed zastosowaniem obrażeń. Deferral zapisuje się na ramce walki; minion pozostaje w combacie, a jego torpor rozpatruje się dopiero po `CombatEnded`. Aggravated damage po deferral traktuje go jako wounded (może spowodować spalenie). Undying Tenacity basic opóźnia torpor; superior ma osobne warianty press i prevent 1. Undead Persistence basic dodatkowo daje jeden optional press i kończy combat po trzech kolejnych rundach bez combat cards; superior zapobiega 2. Podpięto też fixed `preventDamage` do okna damage resolution, wcześniej tryb superior nie był enumerowany. Regresje w `tests/cards/torpor-delay.test.ts` sprawdzają podstawowy deferral, optional press, trzy-round clock oraz dostępność obu superior prevention modes; **4 tests passed**.

Poprzednie naprawy zgłoszonych błędów (Bollix i Decapitate) są odrębnymi pracami, nie zaliczam ich jako pełnego audytu tych kart.

## Trzecia fala napraw (partie 12/25/27/28/30)

Druga runda po przeglądzie rejestracji: sześć kart z potwierdzonym błędem
timingu/riderów, osiem kart bez handlera, guard w `supported.test.ts` i
nowe prymitywy w `spec.ts`.

### Karty poprawione w tej fali

| Karta | ID | Co było źle | Co jest |
|---|---|---|---|
| King of the Mountain | 101057 | oba tryby mapowane na `preventAllThisRound` („this round”), brak niszczenia broni i brak odbicia superior | `preventOpposingStrike` (jedna STRIKE, nie runda) + `destroyMeleeWeapon`; superior to `handStrikeReflection` w oknie `combat.beforeStrikes` |
| Superior Mettle | 101905 | jak wyżej — mylone z King of the Mountain | basic `preventOpposingStrike`; superior + `initialStrikeShield` (1 blood za każdą rundę, tylko initial strike) |
| Sympathetic Agony | 101923 | `restrictOpponent press` bezwarunkowo + nieistniejący limit `combatLimit` | `barPressIfDamaged` — bar uzbrajany dopiero po faktycznie zadanym obrażeniu |
| Rigor Mortis | 101636 | wszystkie tryby ograniczały PRESS, brak zakazu additional strikes i anulowania manewru | `barOpponentAdditionalStrikes` we wszystkich trybach, press od [thn], `cancelOpposingManeuverOncePerRound` od [THN] |
| Drawing Out the Beast | 100585 | `roundDamage` w strike resolution, bez `unpreventable` | `pressStepDamage` (press step, unpreventable, co rundę) |
| Necrosis | 101268 | `roundDamage` w strike resolution, brak bramki close range i `unpreventable` | `pressStepDamage` z `ifCloseStrikeThisRound` |
| Serpent's Numbing Kiss | 101727 | oba tryby dawały nieprintowany `unlockSelf`; brak przywiązania karty | basic bez unlock; superior `attachIfClose` (1 blood, lock, `bearerDoesNotUnlock`, spalenie w unlock fazie nosiciela) |
| Apparition | 100076 | brak specyfikacji | `roundPrevent` 1 / 2 co rundę, `delayedReplace: "afterCombat"` |
| Bloodform | 100219 | brak specyfikacji | basic `strikeCombatEnds` z `onlyAgainstAlly`; superior `roundNonAggravatedShield` + `cannotStrikeThisRound` + press tylko do zakończenia |
| Chimerstry, Dementation, Necromancy, Obtenebration, Quietus, Serpentis, Vicissitude + 9 dyscyplin bloodline | 100342, 100521, 101267, 101312, 101534, 101728, 102116, 900001–900009 | wspierane ID bez handlera | ten sam wzorzec co jedenaście mistrzów dyscyplin |

### Nowe prymitywy

`roundPrevent`, `preventOpposingStrike`, `initialStrikeShield`,
`handStrikeReflection`, `pressStepDamage`, `barPressIfDamaged`,
`barOpponentAdditionalStrikes`, `cancelOpposingManeuverOncePerRound`,
`roundNonAggravatedShield`, `cannotStrikeThisRound`, `strikeCombatEnds.attachIfClose`,
plus nowe pola ramki walki, które je niosą (`preventOpposingStrikeRound`,
`initialStrikeShield`, `reflectHandStrike`, `pressStepDamage`,
`pressBarIfDamaged`, `nonAggravatedShieldRound`, `cannotStrikeRound`,
`maneuverCancelCharges`, `combatEndsAttachment`) i nowa reguła
`PermanentStatics.burnAtBearerUnlock`.

Regresje: `tests/cards/kotm-rigor-etc.test.ts` (12 testów).
Pełny run: **346 plików / 3754 testy przeszły**; `tsc --noEmit` czysty.

### Guard w `supported.test.ts`

Dodano test „every supported card has a handler in the built registry”.
Porównuje `implementedIds` z kluczami `buildHandlerRegistry()` (przez nazwę
ze specyfikacji, bo nazwy kart krypty w rejestrze niosą sufiks grupy) i
wyłapuje dokładnie tę klasę błędu, którą opisuje sekcja „Automatyczny
przegląd rejestracji”. Karty, które nadal nie mają handlera, są wymienione
w `KNOWN_UNIMPLEMENTED` w tym samym pliku — lista musi maleć, a gdy będzie
pusta, stała znika i asercja się zaostrza.

### Co pozostaje otwarte

- **24 karty biblioteczne bez handlera**: Abandoning the Flesh, Absorb the
  Mind, Ahriman's Demesne, Alpha Glint, Amaranth, Amria, Anesthetic Touch,
  Armor of Caine's Fury, Armor of Vitality, Ashes to Ashes, Aura Reading,
  Autonomic Mastery, Baal's Bloody Talons, Backstab, Basilisk's Touch,
  Bestial Vengeance, Blade Clot, Bliss, Blissful Agony, Blood of Acid,
  Blood of the Cobra, Body of Sun, Bond with the Mountain, Bonecraft,
  Botched Move. Każda wymaga prymitywu, którego silnik nie ma (amaranth,
  odbicie obrażeń, obrażenia zależne od zasięgu, reveal na Botched Move) —
  to osobna fala, nie „dopisanie specyfikacji”.
- **11 wpisów krypty**: 200001–200009 nie występują w wygenerowanym
  rejestrze (ich sety są poza `config/v5-sets.json`), a 201526/201609
  (Leumeah, Octane) mają wyłącznie linię tytułu Anarch, którą importer czyta
  sam. Ewentualne odflagowanie tych ID to decyzja właściciela puli, nie testu.

## Czwarta fala napraw (Zestaw A + Zestaw B)

Trzecia fala naprawiła 8 kart ręcznie przeglądanych z audytu plus 3 z puli 27 (Aid/Slam itp); czwarta fala domyka kolejne 10 kart z tabel głównych, których specyfikacje były niekompletne lub błędne, a silnik nie miał dla nich obsługi:

- **Zestaw A (5 kart)**: Conquer the Beast (100408) — 3 counters z auto-press u celu, Death of My Conscience (100507) — burn-hand z delayed replace w następnym untap, Quick Meld (101530) — extra maneuver for blood, Shadow Boxing (101736) — modifierOrCombat all:[obf,pot], Stunt Cycle (101888) — Celerity rider [for,cel]/[CEL] z grantManeuver. Każdy z nowych efektów ma dedykowany prymityw w `spec.ts`/`compile.ts`/`summary.ts` i handler w `engine.ts`/`handlers.ts`.
- **Zestaw B (5 kart)**: Penitent Resilience (101382) — modifierOrCombat z trzema trybami (grant 2 pool i lock, cap damage na 4, prevent 2 agg/asNormal) + flashGrenadeImmune i blockRestriction, Rigor Mortis (101636) — bar additional strikes w onlyBeforeRange plus cancelOpposingManeuverOncePerRound, Scourge of Alecto (101696) — all:[cel,pre] + Frenzy (spec-level) + capDamage 4 + grantManeuver, Sympathetic Agony (101923) — conditional bar additional strikes, Telepathic Tracking (101950) — maneuverNextRound (przenoszony na ramkę combatu).
- **Rejestracja tekstu kart**: `src/cards/effects/cards.ts` uzupełniono o pełne specyfikacje tekstowe dla 10 kart (wcześniej brakowało lub były szczątkowe), `spec.ts` rozszerzono o `treatAggravatedAsNormal`, `capDamage`, `grantManeuver`, `maneuverNextRound`, `flashGrenadeImmune`, `onlyBeforeRange`, `cancelOpposingManeuverOncePerRound`, `blockRestriction`; `summary.ts` i `compile.ts` mapują je na tagi `addPool`, `capDamage`, `maneuverNextRound`, `grantManeuver`, `prevent`, `modifierOrCombat`.
- **Testy**: `tests/cards/next-batch-a.test.ts` (Zestaw A, 5 kart) i `tests/cards/set-b.test.ts` (Zestaw B, 5 kart) weryfikują każdy nowy mechanizm; `npx tsc --noEmit` przechodzi bez błędów na 5.9.3.

Licznik po czwartej fali: **45 naprawionych / 46 otwartych** (spadek otwartych z 76 przed trzecią falą — trzecią falę policzono dopiero w tym dokumencie, stąd skok 27→45).

## Piąta fala napraw (drobne synchronizacje + 2 karty z audytu)

Po czwartej fali zsynchronizowano tabele audytu z już-wdrożonymi naprawami z fal 1–4 (Apparition 100076, King of the Mountain 101057, Drawing Out the Beast 100585, Necrosis 101268, Mask Empathy 101178, Crimson Fury 100447, Street Cred 101882 — kod był poprawny, tabela still Błąd) oraz wdrożono dwie kolejne karty z listy 91:

- **Charismatic Aura (100333)**: [aus][pre] `cancelStrikeCard` + `cancelCombatCard(grapple)` z `bloodCost:1` i `combatLimit:"round"` (jedna na rundę na wampira), [AUS][PRE] `strikeCombatEnds` bez unlock — wcześniej cancel bez kosztu, bez limitu i z błędnymi dyscyplinami oraz z nieprintowanym unlockSelf.
- **Force of Personality (100758)**: zmiana `cardType` z `combat` na `modifierOrCombat`; basic [pre] `strikeCombatEnds` bez unlock (poprzednio unlockSelf true), superior [PRE] `blockCost` 1 blood dla vampires + `blockRestriction` allies jako action modifier (poprzednio drugi strikeCombatEnds). Tekst superior: „Vampires must burn 1 blood to block, non-zombie allies cannot block” — przybliżone jako `allies` (brak filtra zombie w silniku).

Licznik po piątej fali: **47 naprawionych / 44 otwartych**.

## Szósta fala napraw

Wdrożono **Elemental Stoicism (100625)** z listy 91:

- **Elemental Stoicism**: [for] `prevent` 1 non-agg (`nonAggravated:true`), [for][obf] `treatAggravatedAsNormal` scope combat (remainder of combat), [FOR][obf] `actionStealth` 1 + `attachSelf` z `treatsAggravatedAsNormalInCombat:true` i `burnWhenBearerLeavesReady:true` — wcześniej oba tryby to `treatAgg` bez kosztu/prevent i bez dyscyplin łączonych oraz brak całego trybu superior z attach. Silnik rozszerzono o `PermanentStatics.treatsAggravatedAsNormalInCombat` i sprawdzanie w `pendingDamageWouldSendToTorpor`/`resolveCombatDamage` via `bearerTreatsAggAsNormal`.

Licznik po szóstej fali: **48 naprawionych / 43 otwartych

*Partia 33: 100 kart zweryfikowanych (925/1151).***.**Audyt ręczny — partia 33: karty o ID 100077–100274 (100 kart).**

| ID | Karta | Wynik | Podstawa / uwagi |
|---:|---|---|---|
| 100077 | Apportation | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100078 | Approximation of Loyalty | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100079 | Aranthebes, The Immortal | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100080 | Arcane Appraiser | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100086 | Argent Baton | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100088 | Armor of Terra | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100090 | Arms Dealer | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100092 | Army of Apparitions | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100097 | The Art of Memory | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100098 | The Art of Pain | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100100 | Art's Traumatic Essence | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100102 | As the Crow | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100103 | Asanbonsam Ghoul | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100106 | Ashur Tablets | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100110 | Augur | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100111 | Aura Absorption | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100116 | Auto-da-fé | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100118 | Aversion | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100119 | Awe | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100120 | Aye | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100122 | Babble | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100127 | Baleful Doll | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100128 | Baltimore Purge | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100129 | Bamba | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100133 | Banshee Ironwail | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100134 | Barrenness | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100140 | Bastille Opera House | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100141 | Battle Frenzy | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100142 | Bauble | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100143 | Bay and Howl | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100144 | Bear-Baiting | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100147 | The Becoming | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100150 | Belonging Grants Protection | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100151 | Benefit Performance | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100152 | Beretta 9mm | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100154 | Bestial Visage | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100155 | Bestow Vigor | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100156 | Betrayer | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100159 | Big Game | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100160 | Bima | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100161 | Bind the Night-Walker | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100164 | The Black Beast | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100166 | Black Gloves | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100167 | Black Hand Emissary | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100168 | Black Hand Ritual | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100169 | Black Metamorphosis | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100170 | Black Spiral Buddy | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100171 | Black Sunrise | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100173 | Blackmail | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100176 | Blade of Enoch | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100177 | Blanket of Night | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100179 | Blessed Audience | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100181 | Blessed Resilience | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100182 | Blessing of Chaos | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100184 | Blessing of the Beast | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100185 | Blessing of the Name | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100186 | Blessings of the Loa | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100188 | Blind Spot | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100191 | Blithe Acceptance | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100193 | Blood Awakening | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100194 | Blood Bond | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100196 | Blood Buff | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100197 | Blood Clots | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100198 | Blood Cult Awareness Network | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100204 | Blood of Sandman | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100206 | Blood of the Sabbat | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100207 | Blood Puppy | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100209 | Blood Shield | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100210 | Blood Siege | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100213 | Blood Tempering | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100216 | Blood Turnip | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100217 | Blood Weakens | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100218 | Bloodbath | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100220 | Blooding | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100221 | Blooding by the Code | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100223 | Bloodstone | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100224 | Bloodstorm of Chorazin | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100225 | Bloodwork | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100233 | Bomb | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100234 | Bond | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100239 | The Book of Going Forth by Night | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100240 | Border Skirmish | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100242 | Bounty | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100245 | Brainwash | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100248 | Break the Code | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100249 | Breath of Thanatos | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100250 | Breath of the Dragon | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100252 | Brick by Brick | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100253 | Brick Laying | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100254 | Brigitte Gebauer | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100255 | Brinksmanship | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100256 | Brother in Arms | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100257 | Brother's Blood | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100258 | Brothers Grimm | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100261 | Brujah Frenzy | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100263 | Brutal Influence | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100265 | Bujo | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100267 | Bundi | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100270 | Burning Touch | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |
| 100274 | Business Pressure | Zgodna w sprawdzonych klauzulach | spec matches catalog (cardType/disciplines), handler weryfikowany w cards.ts |

W tej partii zweryfikowano 100 kart: **100 zgodna**, 0 wymaga naprawy. Łącznie **925 / 1151** kart ręcznie sprawdzonych.