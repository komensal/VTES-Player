# Ręczna kontynuacja paczki 4 — druga setka

Zakres: pozycje 101–200 manifestu `batch-04-ids.json`, ID 100214–100314. Porównano drukowany tekst i spec; przy opisanych mechanikach sprawdzono kod oraz wskazane testy. Wyniki oznaczają konkretny zakres, nie pełną poprawność. Nierozstrzygnięte nie są zapisywane jako potwierdzone ustalenia. Bounty pochodzi z wcześniejszego wpisu. Historyczny snapshot triage nie jest dowodem ręcznego audytu.

| ID | Karta | Wynik | Ustalenie / zakres |
|---:|---|---|---|
| 100214 | Blood to Water | Bez niezgodności w zakresie | W sprawdzonym zakresie 3/5 blood na vampire i basic burn ally, superior nie na ally; tests/cards/blood-to-water.test.ts. |
| 100215 | Blood Trade | Naprawa celowana | Naprawiono przenoszenie blood: wyłącznie wampiry, także w torpor, również jako odbiorcy. tests/cards/blood-and-gear.test.ts; inne klauzule wymagają dalszej kontroli. |
| 100217 | Blood Weakens | Błąd — otwarty | Event ma pusty tryb; nie opóźnia replacement ani nie obsługuje wyjątków po diablerie. |
| 100218 | Bloodbath | Błąd — otwarty | Akcja ma wyłącznie stealth; brak wymogu tytułu, celu, blood i dołączenia z głosem. |
| 100219 | Bloodform | Dalsza weryfikacja | Spec rozróżnia basic ally i superior shield/press; sprawdzić timing before range oraz interakcję z niemożnością strike. |
| 100220 | Blooding | Błąd — otwarty | Akcja ma wyłącznie stealth; brak wymagania Sabbat, dołączenia, blood i Black Hand. |
| 100221 | Blooding by the Code | Naprawa celowana | Zastąpiono efekt master dołączeniem do własnego Salubri antitribu, +1 Valeren/capacity/strength, jedna kopia per bearer; tests/cards/audit-manual-05.test.ts. |
| 100222 | Bloodlust | Dalsza weryfikacja | Spec i test wybierają tylko własne miniony, tekst mówi „X minions”; sprawdzić regułę wyboru cudzych i directed action przed rozstrzygnięciem. |
| 100223 | Bloodstone | Błąd — otwarty | Equipment nie wybiera dowolnego miniona i nie tworzy relacji dającej +2 intercept przeciw nosicielowi. |
| 100224 | Bloodstorm of Chorazin | Błąd — otwarty | Reaction daje prevent 2 zamiast przerwać akcję i zadać nieprewencyjne obrażenia aktorowi i retainerom. |
| 100225 | Bloodwork | Błąd — otwarty | Action ma ogólne bleed/stealth bez wymogu Black Hand, limitu 2 bled i warunku Sabbat u celu. |
| 100226 | Blow Torch | Bez niezgodności w zakresie | W sprawdzonym zakresie płaski 1 aggravated bez strength; tests/cards/legacy-weapons.test.ts. |
| 100227 | Blur | Dalsza weryfikacja | Spec zawiera ograniczone 1/2 additional strikes; sprawdzić wspólne otwarte ograniczenia kolejności w docs/additional-strike-followups.md. |
| 100228 | Body Arsenal | Bez niezgodności w zakresie | W sprawdzonym zakresie aggravated hand i superior +1 strength; tests/cards/body-arsenal.test.ts. |
| 100229 | Body Bag | Dalsza weryfikacja | Spec haven i zdolność za blood; tests/cards/vehicles-and-havens.test.ts, sprawdzić gotowość i timing użycia. |
| 100230 | Body Flare | Bez niezgodności w zakresie | W sprawdzonym zakresie strike aggravated; tests/cards/strike-effects.test.ts; spec odróżnia close i ranged. |
| 100231 | Body of Sun | Błąd — otwarty | Combat ma tylko maneuver, bez drukowanych strike i obrażeń dla retainers oraz aktora. |
| 100232 | Bollix | Naprawa celowana | Wspólny efekt nie zeruje już weapon damage przeciwnika będącego ally; test Bollix i Blood Fury w tests/cards/discipline-filtered.test.ts. |
| 100233 | Bomb | Błąd — otwarty | Equipment nie ma weapon profile 5R, samouszkodzenia ani akcji niszczenia lokacji i spalania. |
| 100234 | Bond | Błąd — otwarty | Action ma jedynie stealth, bez ratowania incapacitated imbued i przywrócenia life. |
| 100235 | Bond with the Mountain | Błąd — otwarty | Tryby basic vis i tha łączą dodge, press i combat ends; brak osobnego superior i wymaganych unlock. |
| 100236 | Bonding | Dalsza weryfikacja | Spec ma bleed +1 oraz superior stealth; sprawdzić okno jedynie podczas bleed i kolejność modyfikatorów. |
| 100237 | Bone Spur | Bez niezgodności w zakresie | W sprawdzonym zakresie podstawowy efekt na rundę i superior na cały combat; tests/cards/aggravated-damage.test.ts. |
| 100238 | Bonecraft | Błąd — otwarty | Nie ma strike 1 damage, dołączania ani ujemnego strength i akcji spalenia; spec ma actionStealth. |
| 100239 | The Book of Going Forth by Night | Błąd — otwarty | Jest unique i superior Serpentis, ale brak zastąpienia spalenia ally przejęciem i lock. |
| 100240 | Border Skirmish | Błąd — otwarty | Akcja ma jedynie stealth; brak wymogu anarch, losowego discard pozostałych i unlock na koniec tury. |
| 100241 | Botched Move | Błąd — otwarty | Combat daje prevent 2 zamiast reveal, warunkowego cancel i damage, bez limitu combat. |
| 100242 | Bounty | Błąd — otwarty | Master daje gainPool zamiast dołączenia z licznikami i wypłat po torpor, burn albo diablerie; wcześniejszy wpis. |
| 100243 | Bowl of Convergence | Dalsza weryfikacja | Spec ma warunkowy intercept i ability za blood, tests/cards/last-equipment-modifiers.test.ts; sprawdzić wszystkie okna oraz limit. |
| 100244 | Boxed In | Bez niezgodności w zakresie | W sprawdzonym zakresie press i delayed replacement po combat; spec oraz tests/cards/basic-combat.test.ts. |
| 100245 | Brainwash | Błąd — otwarty | Master ma tylko modifyStealth; nie dołącza do uncontrolled ani nie blokuje transferów. |
| 100246 | Brass Knuckles | Dalsza weryfikacja | Weapon profile strength+1 i limit combat; zweryfikować reset, przełożenie broni i rzeczywisty koszt. |
| 100247 | Bravo | Dalsza weryfikacja | Bespoke archetype onLeaveReady/po combat, tests/cards/archetypes.test.ts; sprawdzić wszystkie sposoby rush i wyjścia z ready. |
| 100248 | Break the Code | Błąd — otwarty | Event ma pusty tryb; brak -1 intercept dla imbued i przyznanego rush na imbued. |
| 100249 | Breath of Thanatos | Błąd — otwarty | Brak rozdzielenia +2 stealth dla wraith i superior combat strike aggravated; jest tylko +1 stealth basic. |
| 100250 | Breath of the Dragon | Błąd — otwarty | Combat ma maneuver zamiast obu ranged aggravated strikes i zwrotnych obrażeń. |
| 100251 | Bribes | Dalsza weryfikacja | Spec wypłaca pool i payVotedForOnly; test referendum-riders, sprawdzić mieszane głosy i timing. |
| 100252 | Brick by Brick | Błąd — otwarty | Basic vis ma tylko maneuver; brak 2R strike, maneuver przy strike i superior ustawiania range. |
| 100253 | Brick Laying | Błąd — otwarty | Akcja ma tylko stealth; brak directed wyboru haven/lock oraz superior damage. |
| 100254 | Brigitte Gebauer | Błąd — otwarty | Ally ma statystyki, ale brak zdolności lock przy ogłoszeniu bleed i kosztu life po bloku. |
| 100255 | Brinksmanship | Błąd — otwarty | Political action jest pusta: brak karty w grze, obowiązkowego withdraw i konsekwencji oust. |
| 100256 | Brother in Arms | Błąd — otwarty | Akcja ma tylko stealth; nie tworzy 2-capacity Salubri ani nie obsługuje transferu i limitu. |
| 100257 | Brother's Blood | Błąd — otwarty | Jest zwykły prevent 2 zamiast płacenia blood innego członka circle i stałego superior. |
| 100258 | Brothers Grimm | Błąd — otwarty | Master daje gainPool zamiast unique karty z licznikami i przejmowaniem kontroli. |
| 100259 | The Bruisers | Bez niezgodności w zakresie | W sprawdzonym zakresie akcja spalania lokacji prey i skierowanie; tests/cards/destroyer-allies.test.ts. |
| 100260 | Brujah Debate | Błąd — otwarty | oldestBrujah filtruje już zablokowanych przed znalezieniem najstarszego i porównuje bazowe capacity; może zablokować młodszego zamiast najstarszego (cards.ts, bespoke handler). |
| 100261 | Brujah Frenzy | Błąd — otwarty | Master daje gainPool zamiast out-of-turn anulowania niezablokowanej akcji i wymuszenia combat. |
| 100262 | Brujah Justicar | Dalsza weryfikacja | Handler titleGrant generowany dla klanu Brujah (JUSTICAR_HANDLERS), nie brak wynikający z pustego snapshotu; sprawdzić contest i wybory. |
| 100263 | Brutal Influence | Błąd — otwarty | Jest jeden basic pot z bleed i stealth; brak wyboru i X Orun i superior transferu krwi. |
| 100264 | Brute Force | Bez niezgodności w zakresie | W sprawdzonym zakresie wartości obu hand/melee trybów i delayed replacement; tests/cards/bigger-strikes.test.ts. |
| 100265 | Bujo | Błąd — otwarty | Akcja ma tylko stealth zamiast wyboru political action z cudzego ash heap, referendum i +3 votes. |
| 100266 | Bum's Rush | Bez niezgodności w zakresie | W sprawdzonym zakresie rush na miniona i delayed replacement; tests/cards/legacy-rush-actions.test.ts i spec. |
| 100267 | Bundi | Błąd — otwarty | Equipment nie ma weapon profile ani ograniczonej prewencji melee strike; ma ogólny prevent 1. |
| 100268 | Burden the Mind | Dalsza weryfikacja | Spec unlockEffectPoolTax i burn/unlock nosiciela; tests/cards/block-taxes.test.ts; sprawdzić wszystkie sposoby wake. |
| 100269 | Bureaucratic Overload | Dalsza weryfikacja | Spec playCostMod i akcja political burn; tests/cards/legacy-cost-masters.test.ts; sprawdzić wszystkie rodzaje kosztów i timing. |
| 100270 | Burning Touch | Błąd — otwarty | Brak combat tha i ridera val; dwa podstawowe tryby dają modifyBleed zamiast drukowanych efektów. |
| 100271 | Burning Wrath | Bez niezgodności w zakresie | W sprawdzonym zakresie hand strike +1/+2 aggravated; tests/cards/aggravated-damage.test.ts. |
| 100272 | Burnt Offerings | Bez niezgodności w zakresie | W sprawdzonym zakresie superior po udanym bleed predator spala mu 1 pool; tests/cards/reading-the-outcome.test.ts. |
| 100273 | Burst of Sunlight | Bez niezgodności w zakresie | W sprawdzonym zakresie superior zadaje 2R aggravated i 2 aggravated aktorowi; tests/cards/aggravated-damage.test.ts. |
| 100274 | Business Pressure | Błąd — otwarty | Modifier daje stealth zamiast burn pool za głosy dla Methuselahów i superior bonusu. |
| 100275 | Cadet | Błąd — otwarty | Master daje gainPool zamiast trifle na uncontrolled Sabbat i Black Hand. |
| 100276 | Caiaphas Smith | Błąd — otwarty | Ally ma bazowe statystyki, lecz bez ranged strike, maneuver, spalenia blokującego i zmiany kontroli. |
| 100277 | Cairo Int'l Airport | Błąd — otwarty | Master daje gainPool zamiast unikalnej lokacji i akcji palącej blood w uncontrolled prey. |
| 100278 | The Call | Błąd — otwarty | Oba podstawowe tryby mają jedynie stealth; brak kombinacji aus/dem, wyboru i blood w uncontrolled. |
| 100279 | Call of the Hungry Dead | Błąd — otwarty | Modifier daje stealth zamiast -1 intercept oraz superior nieudanej próby bloku. |
| 100280 | Call the Great Beast | Błąd — otwarty | Spec nie tworzy Great Beast; jedynie prevent i stealth zamiast ritual counters i transformacji. |
| 100281 | Call the Lamprey | Błąd — otwarty | Combat ma maneuver zamiast steal blood na ally/minion oraz superior. |
| 100282 | Call the Wild Hunt | Dalsza weryfikacja | Spec frenzyShield i burnAnimalsForDamage; tests/cards/call-the-wild-hunt.test.ts; sprawdzić okno i koszty obu dyscyplin. |
| 100283 | Camaraderie | Błąd — otwarty | Reaction daje intercept zamiast redukcji bleed 1/3 i warunku drugiego Blood Brother. |
| 100284 | Camarilla Exemplary | Dalsza weryfikacja | Spec referendum dołącza do Camarilla oraz blockToll; sprawdzić legalne cele i trwałość efektu. |
| 100285 | Camarilla Threat | Dalsza weryfikacja | Spec refPutInPlay, discardActionPoolTax i political burn; tests/cards/table-referendums.test.ts; sprawdzić liczenie discard actions. |
| 100286 | Camarilla Vitae Slave | Błąd — otwarty | Retainer ma tylko life; brak +1 capacity i wyboru okresowego podniesienia dyscypliny. |
| 100287 | Camera Phone | Błąd — otwarty | Equipment ma modifyBleed, nie przyznaną akcję bleed ani zakaz zwiększania innym equipment. |
| 100288 | Campground Hunting Ground | Bez niezgodności w zakresie | W sprawdzonym zakresie unique hunting ground i blood dla gotowego wampira; tests/cards/legacy-locations.test.ts. |
| 100289 | Can't Take it with You | Dalsza weryfikacja | Spec refPerSeatCards dla equipment/location/retainer; sprawdzić liczenie kontroli retainers i kolejność wypłat. |
| 100290 | Canine Horde | Bez niezgodności w zakresie | W sprawdzonym zakresie superior niszczy equipment z first strike; tests/cards/equipment-stripping.test.ts. |
| 100291 | Canopic Jar | Błąd — otwarty | Equipment ma modifyIntercept bez wyboru celu i brak opcji spalenia/unlock oraz superior damage. |
| 100292 | Capitalist | Dalsza weryfikacja | Bespoke archetype po udanym bleed, tests/cards/archetypes.test.ts; sprawdzić ograniczenie prey i once per turn. |
| 100293 | Car Bomb | Błąd — otwarty | Reaction daje intercept zamiast lock, efektu pojazdu i -1 stealth przy jego braku. |
| 100294 | Cardinal Benediction | Naprawa celowana | Bespoke Cardinal Benediction kwalifikuje cel według bieżącej capacityOf zamiast wartości bazowej; tests/cards/ballots.test.ts. |
| 100295 | Cardinal Sin: Failure of Mission | Błąd — otwarty | Reaction daje intercept zamiast wymagania tytułu, przyłączenia do Sabbat i przyznanych akcji. |
| 100296 | Cardinal Sin: Insubordination | Błąd — otwarty | Reaction daje intercept zamiast warunkowego wysłania przeciwnika do torpor po combat. |
| 100297 | Carfax Abbey | Bez niezgodności w zakresie | W sprawdzonym zakresie anarch, bonus przy ready baron i ograniczenie jednej wypłaty na wampira; tests/cards/blood-locations.test.ts. |
| 100298 | Carlton Van Wyk | Błąd — otwarty | Ally ma bazowe statystyki i ogólny intercept/dodge, brak ranged strike i discard-phase diablerist burn. |
| 100299 | Carnivale | Błąd — otwarty | Master ma tylko modifyStealth; brak unique i dołączenia do ready Toreador ze spalaniem. |
| 100300 | Carrion Coffin | Błąd — otwarty | Akcja ma tylko basic stealth zamiast dołączenia, unlock za blood i akcji burn; brak superior. |
| 100301 | Carrion Crows | Bez niezgodności w zakresie | W sprawdzonym zakresie 1R/2R environmental damage w kolejnych rundach; tests/cards/round-recurring-combat.test.ts. |
| 100302 | Carthage Remembered | Błąd — otwarty | Master ma ogólny stealth zamiast stałej karty z warunkowymi bonusami i akcją burn. |
| 100303 | Carver's Meat Packing and Storage | Naprawa celowana | Bespoke Carver ma isUnique oraz używa bieżącej capacity przy torpor; tests/cards/carvers-meat-packing.test.ts. Inne interakcje nadal wymagają kontroli. |
| 100304 | Caseless Rounds | Błąd — otwarty | Opcjonalny limited additional strike jest przyznawany automatycznie, co może zablokować inne źródło; docs/additional-strike-followups.md. |
| 100305 | Cat Burglary | Błąd — otwarty | Akcja ma tylko stealth; brak obu trybów bleed, limitu 1 i wyboru dowolnego Methuselah na superior. |
| 100306 | Catacombs | Błąd — otwarty | Equipment ma jedynie modifyStealth, brak unique location i warunkowego zmniejszenia kosztu rescue. |
| 100307 | Catatonic Fear | Bez niezgodności w zakresie | W sprawdzonym zakresie zakończenie combat i superior obrażenia po combat na close; tests/cards/after-combat-ends.test.ts. |
| 100308 | Cats' Guidance | Bez niezgodności w zakresie | W sprawdzonym zakresie basic unlock po block resolution; tests/cards/post-block-unlock.test.ts. |
| 100309 | Cauldron of Blood | Bez niezgodności w zakresie | W sprawdzonym zakresie zakaz pierwszej rundy i hand +2/+4; tests/cards/bigger-strikes.test.ts. |
| 100310 | Cavalier | Błąd — otwarty | Master daje gainPool zamiast archetype, dołączenia i opcjonalnego unlock za blood. |
| 100311 | Cave of Apples | Naprawa celowana | Bespoke Cave używa bieżącej capacity przy porównaniu wieku i progu przejęcia; tests/cards/steal-cards.test.ts. Dalsze interakcje pozostają do kontroli. |
| 100312 | Celerity | Bez niezgodności w zakresie | W sprawdzonym zakresie zwykły Discipline master i celowanie; tests/cards/audit-batch-100.test.ts. |
| 100313 | Celestial Harmony | Błąd — otwarty | Akcja ma tylko stealth; brak ujawniania ręki, wyboru Methuselah i superior. |
| 100314 | Census Taker | Błąd — otwarty | Master ma bleed/intercept zamiast unique karty na Black Hand z aktywacją lock i głosami. |

## Podsumowanie

- Bez wykrytej niezgodności w sprawdzonym zakresie: **20**.
- Potwierdzone błędy nadal otwarte: **57** (w tym wcześniej znane Bounty).
- Naprawy celowane: **6**.
- Nierozstrzygnięte, do dalszej weryfikacji: **17**.
- Bez ręcznego rozstrzygnięcia w całym rejestrze: **3917 z 4158**; to nie liczba kart w pełni poprawnych.

Poprawka wspólnej mechaniki broni dotyczy także Blood Fury z poprzedniej setki: poprzedni wynik dla ograniczenia weapon strike nie obejmował przeciwnika-ally i został skorygowany w `manual-findings.json`.

## Kontrola zmian

- `npm run typecheck` i `npm run build` zakończone powodzeniem; build ostrzega o dużych chunkach.
- Celowane testy kart i mechaniki additional strike / Diversion: **59/59**.
- Pełny `npm test -- --run --reporter=dot`: **3874 passed, 18 failed** w 14 plikach. Te same 18 znanych niepowodzeń odtworzono wcześniej na stanie bazowym; pełna lista nazw testów z tego uruchomienia poniżej, żeby nie utożsamiać przejścia testów celowanych z zielonym całym projektem.

```
 FAIL  tests/cards/burn-the-equipment.test.ts > Vial of Elder Vitae (102114) > DISCIPLINES names every Discipline the pool actually uses
 FAIL  tests/cards/central-queries.test.ts > every registered handler answers the central queries > names at least one printed type — every LIBRARY card
 FAIL  tests/cards/clan-vocabulary.test.ts > clan vocabulary > is exactly what CLANS offers — 'an EXISTING clan' means the pool's
 FAIL  tests/cards/clan-vocabulary.test.ts > clan vocabulary > the legacy library's clan icons stayed OUT of the vocabulary
 FAIL  tests/cards/crypt-wave-1.test.ts > the crypt pipeline > a vampire with a bare sect/title line gets NO entry
 FAIL  tests/cards/discipline-cards.test.ts > Discipline master cards > §0: exactly the Disciplines the pool actually requires
 FAIL  tests/cards/granted-action-requirements.test.ts > a granted action requires the clan its grant lists [LSJ 20080604] > Keegan has no positive to build: no supported grant lists Gangrel
 FAIL  tests/cards/justicars.test.ts > every Justicar is unique > carries `unique` on the spec, which is what the card contest reads
 FAIL  tests/cards/library-audit.test.ts > the coverage guard > every supported card is named by some test or fuzz deck
 FAIL  tests/cards/no-partial-cards.test.ts > no partial cards > counts up — the two whole kinds account for the entire pool
 FAIL  tests/cards/path-cards.test.ts > Paths come from the crypt, not from a card in play > NO card in the pool grants a Path — that is why it must be printed
 FAIL  tests/cards/pool-widening.test.ts > what the widening admits > admits only the configured groups
 FAIL  tests/cards/pool-widening.test.ts > what the widening admits > admits no sect the engine cannot represent
 FAIL  tests/cards/pool-widening.test.ts > what the widening admits > leaves the precons V5-only — a legacy set's decks are half-built here
 FAIL  tests/cards/pool-widening.test.ts > what the widened cards carry > matches the config — widened when groups are open, empty when not
 FAIL  tests/cards/praxis-seizure.test.ts > the admission path (§6) > the Praxis Seizures still OUT are exactly the ones whose rider is unbuilt
 FAIL  tests/cards/referendum-terms.test.ts > CLANS is derived, not guessed > matches exactly the clans the V5 crypt contains
 FAIL  tests/cards/round-recurring-combat.test.ts > frenzy classification (docs/round-recurring-combat-design.md §6) > every frenzy mode in the pool classifies, and matches its printed text
```
