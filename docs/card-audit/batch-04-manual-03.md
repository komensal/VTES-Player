# Ręczna kontynuacja paczki 4 — trzecia setka

Zakres: pozycje 201–300 manifestu `batch-04-ids.json`, ID 100315–100414. Dla każdej karty porównano tekst z odpowiednią specyfikacją; w opisanych przypadkach sprawdzono kompilację, osobne handlery i wskazane scenariusze testowe. Oceny dotyczą tylko podanego zakresu, nie dowodzą pełnej poprawności. Nierozstrzygnięte nie są dopisywane jako potwierdzone ustalenia. Chanjelin Ward ma wcześniejszy wpis. Historyczny triage nie jest dowodem ręcznej weryfikacji.

| ID | Karta | Wynik | Ustalenie / zakres |
|---:|---|---|---|
| 100315 | Centralized Background Check | Bez niezgodności w zakresie | W sprawdzonym zakresie +1 pool dla broni wszystkich graczy, nie całego equipment: tests/cards/legacy-cost-masters.test.ts. |
| 100316 | Chain of Command | Błąd — otwarty | Akcja ma tylko stealth; brak X młodszych uncontrolled w grze, wymuszenia bleed i odłożenia do crypt. |
| 100317 | Chainsaw | Bez niezgodności w zakresie | W sprawdzonym zakresie 3 damage i once per combat także w drugiej rundzie: tests/cards/legacy-weapons.test.ts. |
| 100318 | Chair of Hades | Błąd — otwarty | Akcja ma tylko stealth; brak usuwania odpowiednich ally/retainer i superior małego wampira. |
| 100319 | Chalice of Kinship | Błąd — otwarty | Equipment nie ma unique ani wymogu tytułu i przyznanej akcji blood dla pozostałych Sabbat. |
| 100320 | Chameleon | Błąd — otwarty | Spec wymaga barona, lecz akcja ma tylko stealth i nie przejmuje młodszego wampira ani nie zmienia jego sekty. |
| 100321 | Chameleon's Colors | Błąd — otwarty | Basic spi w spec nie istnieje: press jest przypisany superior, brak maneuver+opcjonalny press; superior kończy combat i unlockuje aktora zamiast kontynuować kwalifikującą się akcję. |
| 100322 | Champion | Błąd — otwarty | Reaction ma combat maneuver zamiast wydania 2 conviction, przerwania skierowanej akcji i combat z monster. |
| 100323 | Change of Target | Bez niezgodności w zakresie | W sprawdzonym zakresie koniec akcji, unlock aktora, brak lock blokującego i zakaz ponowienia: tests/cards/end-action.test.ts. |
| 100324 | Changeling | Naprawa celowana | Rozdzielono basic ograniczony do bleed (+1 limited) i superior (+1 stealth); tests/cards/audit-manual-06.test.ts. |
| 100325 | Changeling Skin Mask | Bez niezgodności w zakresie | W sprawdzonym zakresie superior Obfuscate oraz spalenie za intercept: tests/cards/discipline-granting-equipment.test.ts. |
| 100326 | Chanjelin Ward | Błąd — otwarty | Master daje gainPool zamiast dołączenia, podatku za akcję oraz spalenia karty dla niepowodzenia akcji (wcześniejszy wpis). |
| 100327 | Channel 10 | Bez niezgodności w zakresie | W sprawdzonym zakresie +2 intercept i zakaz pierwszej akcji: tests/cards/lock-grant-locations.test.ts. |
| 100328 | Channeling the Beast | Bez niezgodności w zakresie | W sprawdzonym zakresie hand lub melee weapon z +1: tests/cards/strike-sources.test.ts. |
| 100329 | Chantry | Bez niezgodności w zakresie | W sprawdzonym zakresie koszt pool/blood i ratowanie cudzego Tremere do jego kontrolera: tests/cards/crypt-and-uncontrolled.test.ts. |
| 100330 | Charge of the Buffalo | Błąd — otwarty | Oba podstawowe tryby mają tylko stealth; brak właściwych rush, wymuszonego zakresu i strike, brak superior. |
| 100331 | Charigger, The Axe | Błąd — otwarty | Retainer ma ogólne bleed/stealth zamiast warunkowego hunt, usuwania minionów i liczenia soul counters. |
| 100332 | Charisma | Naprawa celowana | Cel Charisma to dowolny ready vampire, nie tylko własny; testuje również torpor, ally i koszt nosiciela: tests/cards/audit-manual-06.test.ts. |
| 100333 | Charismatic Aura | Błąd — otwarty | Limit combatLimit: round jest globalny dla obu trybów; tekst ogranicza tylko basic, więc po basic błędnie blokuje superior. Kod: cards.ts i compile.ts. |
| 100334 | Charming Lobby | Błąd — otwarty | Akcja ma tylko stealth; brak osobnego referendum, automatycznego przejścia następnego i superior votes. |
| 100335 | Charnas the Imp | Błąd — otwarty | Retainer ma tylko stealth i life; brak wyboru cudzego pracodawcy, damage w unlock, odporności i przeniesienia. |
| 100336 | Cheat the Fates | Błąd — otwarty | Oba tryby podstawowe dają +2 bleed; brak ograniczenia block przy tem i superior unlock. |
| 100337 | Cheval de Bataille | Bez niezgodności w zakresie | W sprawdzonym zakresie koszt blood głosujących przeciw przy tally: tests/cards/referendum-blood.test.ts. |
| 100338 | Childling Muse | Bez niezgodności w zakresie | W sprawdzonym zakresie wymóg Malkavian i +1 bleed: tests/cards/legacy-minions.test.ts. |
| 100339 | Children of Osiris | Bez niezgodności w zakresie | W sprawdzonym zakresie Ministry nie unlockuje normalnie, płaci blood za unlock i ma karę do akcji burn: tests/cards/pay-to-unlock.test.ts. |
| 100340 | Children of Stone | Błąd — otwarty | Akcja ma tylko +1 stealth zamiast +2, equip lub wyszukania gargoyle i różnic superior. |
| 100341 | Chill of Oblivion | Błąd — otwarty | Akcja ma tylko stealth; nie dołącza karty ani nie daje konwersji aggravated i superior unlock. |
| 100342 | Chimerstry | Bez niezgodności w zakresie | W sprawdzonym zakresie zwykły Discipline master, +1 chi i capacity na dowolnym vampire w tym torpor; wspólny test tests/cards/audit-batch-100.test.ts. |
| 100343 | Chiram's Hold | Błąd — otwarty | Combat ma tylko maneuver; brak przekazania karty, wyboru combat z ash heap i podatku kosztowego. |
| 100344 | Chiropteran Marauder | Błąd — otwarty | Spec ma basic maneuver, ale brak superior płatnego aggravated hand strike. |
| 100345 | Choir | Błąd — otwarty | Akcja ma tylko stealth, brak karty z influence burn i superior obrażeń pool za kopie. |
| 100346 | Chronicle of the Lost Tribe | Błąd — otwarty | Akcja ma tylko stealth; brak wymogu Black Hand, unique, hand size i możliwości kradzieży. |
| 100347 | Church of the Order of St. Blaise | Błąd — otwarty | Master daje gainPool zamiast unique lokacji i jej zdolności dodania counter. |
| 100348 | The Church of Vindicated Faith | Błąd — otwarty | Master daje gainPool zamiast unique lokacji wymagającej imbued i przekazania blood do uncontrolled. |
| 100349 | Circle | Błąd — otwarty | Spec daje jednocześnie natychmiastowy maneuver i press, zamiast press i opcjonalnego maneuver dopiero w następnej rundzie. |
| 100350 | Circumspect Revelation | Błąd — otwarty | Modifier daje stealth zamiast wymogu Black Hand i anulowania próby bloku Sabbat. |
| 100351 | City Gangrel Connections | Błąd — otwarty | Master daje gainPool zamiast unique lokacji dającej kontrolerowi głos w political actions. |
| 100352 | Claiming the Body | Błąd — otwarty | Modifier daje stealth zamiast blokady blokującego, zakończenia akcji i superior unlock Blood Brother. |
| 100353 | Clan Impersonation | Błąd — otwarty | Akcja ma tylko stealth; brak wyboru klanu, dołączenia i możliwości spalenia. |
| 100354 | Clan Loyalty | Bez niezgodności w zakresie | W sprawdzonym zakresie cancel block/combat dla tego samego klanu: tests/cards/no-combat.test.ts. |
| 100355 | Clandestine Contract | Błąd — otwarty | Akcja nie tworzy contract, nie celuje miniona ani nie rozpoczyna combat i nie daje powtórnego rush. |
| 100356 | Claws of the Dead | Bez niezgodności w zakresie | W sprawdzonym zakresie basic aggravated hand strike: tests/cards/aggravated-hand-strikes.test.ts. |
| 100357 | Cleansing Ritual | Błąd — otwarty | Oba basic to tylko stealth; brak dodania blood, spalania karty i superior unlock. |
| 100358 | Cleave | Błąd — otwarty | Combat ma tylko maneuver zamiast wybrania/stworzenia melee weapon i jej modyfikatorów. |
| 100359 | Clio's Kiss | Błąd — otwarty | Oba basic to tylko stealth; brak contest burn/yield, odzyskania karty z ash heap i superior. |
| 100360 | Cloak of Blood | Bez niezgodności w zakresie | W sprawdzonym zakresie cel torpor, próg capacity i wybór dyscypliny/bonus głosu: tests/cards/torpor-prey.test.ts. |
| 100361 | Cloak of the Abalone | Bez niezgodności w zakresie | W sprawdzonym zakresie blokada Toreador i Toreador antitribu: tests/cards/legacy-equipment.test.ts. |
| 100362 | Cloak the Gathering | Bez niezgodności w zakresie | W sprawdzonym zakresie superior od innego ready wampira i +1 stealth: tests/cards/other-vampire-modifiers.test.ts. |
| 100363 | Clockwerx | Błąd — otwarty | Combat ma tylko maneuver zamiast przeniesienia equipment pomiędzy Blood Brothers i superior okna. |
| 100364 | Closed Session | Bez niezgodności w zakresie | W sprawdzonym zakresie tylko Camarilla głosuje przy referendum: tests/cards/ballots.test.ts. |
| 100365 | Clotho's Gift | Błąd — otwarty | Akcja ma tylko stealth, brak crypt draw, blood w uncontrolled i superior dołączanego unlock. |
| 100366 | Club Illusion | Dalsza weryfikacja | Spec ogranicza zdolność do własnych anarchów, podczas gdy tekst mówi „An Anarch”; ustalić prawo użycia dla innych kontrolerów oraz timing, tests/cards/action-time-locations.test.ts. |
| 100367 | Club Zombie | Bez niezgodności w zakresie | Bespoke handler zyskuje blood przy odblokowanej lokacji na początku tury; także +1 intercept, tests/cards/master-intercept.test.ts. |
| 100368 | Coagulate Blood | Błąd — otwarty | Combat ma tylko maneuver zamiast 1R/2R damage i premii przeciw ally. |
| 100369 | Coagulated Entity | Błąd — otwarty | Akcja ma tylko prevent 2, bez wyboru Blood Brothers, rush, przekazania blood i superior. |
| 100370 | Cobra Fangs | Błąd — otwarty | Combat ma tylko maneuver zamiast hand strike i opóźnionego burn/torpor ofiary. |
| 100371 | Code of Milan Suspended | Błąd — otwarty | Political action ma pusty tryb; brak wymogu Sabbat oraz wybrania posiadacza Edge i burn pool. |
| 100372 | Code of Samiel | Błąd — otwarty | Master daje gainPool zamiast unique karty z blood i warunkowym unlock Salubri antitribu. |
| 100373 | Codex of the Damned | Błąd — otwarty | Equipment ma pusty tryb; brak unique, warunkowego superior tha i efektu po diablerie. |
| 100374 | Codex of the Edenic Groundskeepers | Dalsza weryfikacja | Spec bleedGrant i conditional stealth; tests/cards/granted-bleed-target-costs.test.ts, zbadać „no ready unlocked minions” i interakcje przekierowania. |
| 100375 | Cold Amber's Hold | Błąd — otwarty | Akcja ma tylko stealth; brak przekazania karty, podatku action i liczników/spalenia. |
| 100376 | Cold Aura | Błąd — otwarty | Combat ma tylko ogólny press; brak ustawienia long range i odpowiedniego superior. |
| 100377 | Collapse the Arches | Błąd — otwarty | Oba basic to dodge/press zamiast odpowiednich strike i ograniczeń; brak superior first strike. |
| 100378 | Coma | Błąd — otwarty | Combat ma tylko maneuver zamiast strike wysyłającego wampira do torpor i superior zakazu unlock. |
| 100379 | Combat Shotgun | Bez niezgodności w zakresie | W sprawdzonym zakresie 3R i raz na rundę z odnowieniem w następnej: tests/cards/legacy-weapons.test.ts. |
| 100380 | Command | Błąd — otwarty | Modifier daje stealth zamiast anulowania bloku ally, lock i superior karty opóźniającej unlock. |
| 100381 | Command of the Beast | Naprawa celowana | Dodano superior +1 bleed nielimitowany oraz ograniczenie obu trybów do bleed; test po innym limited i na hunt: tests/cards/audit-manual-06.test.ts. |
| 100382 | Command of the Harpies | Bez niezgodności w zakresie | W sprawdzonym zakresie wymóg Camarilla i odebranie tytułu ready prince: tests/cards/legacy-political-removal.test.ts. |
| 100383 | Command Performance | Błąd — otwarty | Master ma modifyStealth zamiast unique karty z unlock Daughter i political action burn. |
| 100384 | Command the Legion | Błąd — otwarty | Akcja ma tylko stealth; brak lock X−1 minionów i wyjątku starszeństwa superior. |
| 100385 | Communal Haven: Cathedral | Błąd — otwarty | Efekt „and/or” wymaga możliwości wykonania obu części po jednym lock; kod wykonuje wyłącznie jedną opcję i blokuje dalsze użycie. Dodatkowo zawsze przenosi 1 blood i filtr sect nie wymaga kind vampire; tests/cards/blood-and-gear.test.ts utrwala rozłączną interpretację. |
| 100386 | Communal Haven: Temple | Błąd — otwarty | Master daje ogólny modifyIntercept zamiast karty z warunkowym bonusem dla własnych Sabbat i limitem kopii. |
| 100387 | Community Justice | Błąd — otwarty | Akcja ma tylko stealth, bez wymogu sect i spalenia niedawnego diablerysty odpowiedniego klanu. |
| 100388 | Compel the Spirit | Błąd — otwarty | Akcja ma tylko stealth, brak odzyskania spalonego ally/retainer z ash heap oraz superior wejścia w grę. |
| 100389 | Compress | Naprawa celowana | Nadano różne warianty obu basic; inaczej przy thn silnik wykonywał pierwszy tryb pot. Testy obrażeń i oznaczenia dyscypliny w logu dla obu: tests/cards/audit-manual-06.test.ts. |
| 100390 | Computer Hacking | Bez niezgodności w zakresie | W sprawdzonym zakresie bleed o wartości 2: tests/cards/legacy-actions.test.ts. |
| 100391 | Conceal | Bez niezgodności w zakresie | W sprawdzonym zakresie superior niszczy cudzą location, block przez kontrolera: tests/cards/permanent-target-actions.test.ts. |
| 100392 | Concealed Weapon | Bez niezgodności w zakresie | W sprawdzonym zakresie wybór broni z ręki i ograniczenia kosztu/obrażeń/unique: tests/cards/armed-mid-combat.test.ts. |
| 100393 | Concert Tour | Błąd — otwarty | Akcja ma tylko stealth, bez dołączenia do Daughter i późniejszego pełnego uzupełnienia blood. |
| 100394 | Concoction of Vitality | Błąd — otwarty | Equipment ma pusty tryb; brak unique i spalania przeciw blokom oraz zakazu kart dyscyplin. |
| 100395 | Concordance | Błąd — otwarty | Oba basic łączą strength i stealth, zamiast oddzielnych bleed i dołączanego infernal; brak superior. |
| 100396 | Condemn the Sins of the Father | Błąd — otwarty | Akcja ma tylko stealth, nie wybiera klanu ani nie lockuje młodszych wampirów lub nie spala blood superior. |
| 100397 | Condemnation: Betrayed | Błąd — otwarty | Akcja ma tylko stealth w obu trybach; brak lock i dołączenia condemnation, podatku bleed i superior. |
| 100398 | Condemnation: Doomed | Błąd — otwarty | Akcja ma tylko stealth; brak lock oraz przyłączonej condemnation z -1 stealth i superior burn pool. |
| 100399 | Condemnation: Languid | Błąd — otwarty | Akcja daje press i stealth zamiast lock oraz dołączonej condemnation z -1 strength i zakazem press. |
| 100400 | Condemnation: Mute | Błąd — otwarty | Akcja ma tylko stealth; brak lock oraz dołączonej condemnation z -3 votes i superior burn blood. |
| 100401 | Conditioning | Bez niezgodności w zakresie | W sprawdzonym zakresie +2/+3 limited jedynie na bleed, przy cost 1; tests/cards/audit-manual-06.test.ts i spec. |
| 100402 | Conductor | Błąd — otwarty | Master daje gainPool zamiast unique karty na Daughter i warunkowych głosów. |
| 100403 | Conflagration | Naprawa celowana | Poprawiono poziom basic/superior dai i oddzielono wariant basic pot/dai; testy podstawowego i superior aggravated oraz dyscypliny w logu: tests/cards/audit-manual-06.test.ts. |
| 100404 | Conflict of Interests | Dalsza weryfikacja | Spec forceAbstain sameClan; sprawdzić interpretację anulowania już oddanych votes/ballots oraz auto-pass, tests/cards/legacy-reactions.test.ts. |
| 100405 | Confusion | Naprawa celowana | Dodano ograniczenie obu trybów do bleed; test blokady podczas hunt oraz basic bleed: tests/cards/audit-manual-06.test.ts. |
| 100406 | Confusion of the Eye | Błąd — otwarty | Reaction daje intercept zamiast redukcji bleed oraz superior wpływu na referendum. |
| 100407 | Conniver | Błąd — otwarty | Master daje gainPool zamiast archetype i lock za zysk blood po stracie pool przez prey. |
| 100408 | Conquer the Beast | Dalsza weryfikacja | Spec zawiera conquerTheBeast i ograniczenie combat, ale tests/cards/next-batch-a.test.ts sprawdza głównie dostępność; sprawdzić liczniki, obowiązkowy press i timing. |
| 100409 | Conquest of Humanity | Bez niezgodności w zakresie | W sprawdzonym zakresie wymóg dwóch innych Gehenna oraz wybór lokacji prey i ransom: tests/cards/gehenna-events.test.ts. |
| 100410 | Consanguineous Boon | Dalsza weryfikacja | Spec refClanBoon i test referendum; sprawdzić wampiry w torpor, contest i interakcję z Blood Trade. |
| 100411 | Consanguineous Condemnation | Bez niezgodności w zakresie | W sprawdzonym zakresie blokowanie wszystkich wampirów wybranego klanu po udanym referendum: tests/cards/legacy-political.test.ts. |
| 100412 | Conscripted Statue | Błąd — otwarty | Modifier daje press zamiast damage co rundę lub utworzenia ally walczącego z blokującym. |
| 100413 | Consecration Rites | Błąd — otwarty | Akcja ma tylko stealth, bez tytułu, dołączenia do lokacji i spalania w obronie przed akcją. |
| 100414 | Conservative Agitation | Bez niezgodności w zakresie | W sprawdzonym zakresie liczba punktów równa liczbie Methuselah i rozdział na co najmniej dwóch: tests/cards/politics.test.ts. |

## Podsumowanie

- Bez wykrytej niezgodności w sprawdzonym zakresie: **27**.
- Potwierdzone błędy nadal otwarte: **62** (w tym wcześniejszy Chanjelin Ward).
- Naprawy celowane: **6**.
- Nierozstrzygnięte: **5**.
- Bez ręcznego rozstrzygnięcia w całym rejestrze: **3823 z 4158**; to nie liczba kart w pełni poprawnych.

## Kontrola zmian

- `npm run typecheck` oraz `npm run build` zakończyły się powodzeniem; build zgłasza ostrzeżenie o dużych chunkach.
- Celowane testy poprawek, kosztów, walki oraz additional strikes / Diversion: **100/100 passed**.
- Pełny `npm test -- --run --reporter=dot`: **3885 passed, 18 failed** w 14 plikach. Lista niepowodzeń jest identyczna z poprzednią turą, porównana po nazwach testów; lista w [poprzednim raporcie](batch-04-manual-02.md). Poprzednio odtworzono je na stanie bazowym.
