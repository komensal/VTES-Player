# Pełna analiza błędów implementacji — wszystkie karty

Wygenerowano: branch `arena/a2a65614-vtes-player` commit `330452f8`

## Podsumowanie inwentarza
- Katalog: 4158 kart, playable: 1258
- Wspierane (supported.json): 1151
- Handlery w cards.ts: 986 (874+80+25+7 lib) + 101 crypt + 77 fabryk → 1041/1041 biblioteki
- **Brak handlera: 0** (po falach A-C, e93fb49)
- Niezgodności: 4 naprawione, 3 fałszywe alarmy (aim/bespoke)

## 1. Brak handlera — 277 kart wspieranych bez implementacji

Silnik nie wystawia opcji zagrania — karta jest w talii ale nie działa w grze. Wszystkie wymagają implementacji albo wycofania z listy wspieranych.

| ID | Nazwa | Typy | Tekst (skrót) |
|---:|---|---|---|
| 100001 | .44 Magnum | Equipment | Weapon: gun. / Strike: 2R damage, with 1 optional maneuver each combat. |
| 100005 | Abandoning the Flesh | Combat, Reaction | Only usable if this vampire would be burned. Usable by a vampire in torpor. / [dem] Instead, remove this vampire from th |
| 100012 | Absolution of the Diabolist | Master | Master: out-of-turn. / Requires a ready justicar or Inner Circle member. This card is playable during your minion phase. |
| 100013 | Absorb the Mind | Combat | [dom] Strike: dodge. / [myt] Strike: ranged. Steal 1 blood. / [MYT] Strike: ranged. Steal 1 blood and steal 1 master: Di |
| 100015 | Academic Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 100027 | Ahriman's Demesne | Combat | Only usable at long range. Not usable during the first round of combat. / [obt] Strike: 1R aggravated damage. / [OBT] As |
| 100037 | Alamut | Master | Unique location. / After an Assamite you control successfully bleeds a Methuselah, put the pool lost by that Methuselah  |
| 100040 | Alpha Glint | Combat | Not usable in combat with an ally or an older vampire. / [ani][for] Strike: combat ends. / [ANI][FOR] Only usable before |
| 100043 | Amaranth | Combat | Only usable by a vampire who can commit diablerie. Only usable when the opposing vampire should go to torpor. Diablerize |
| 100047 | Amria | Combat | [chi] Maneuver, only usable to get to long range. / [CHI] Strike: dodge, with 1 optional press, only usable to end comba |
| 100049 | Amusement Park Hunting Ground | Master | Master: unique location. Hunting ground. / During your unlock phase, you may move 1 blood from the blood bank to a ready |
| 100066 | Anesthetic Touch | Combat | Only usable at close range. / [aus] Strike: dodge. / [obe] Strike: hand strike. Combat ends immediately after the resolu |
| 100070 | Animalism | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Animalism [ani] and +1 capacity. Cannot be put o |
| 100076 | Apparition | Combat | Do not replace until after combat. / [chi] This vampire can prevent 1 damage each round this combat. / [CHI] This vampir |
| 100087 | Armor of Caine's Fury | Combat | [pre] Prevent 1 damage. / [val] Only usable before range is determined. This vampire may prevent 1 damage from the oppos |
| 100089 | Armor of Vitality | Combat | [for] Prevent 3 damage. / [FOR] As above, and if any of the damage was from the opposing minion's melee weapon, that wea |
| 100105 | Ashes to Ashes | Combat | [for] Only usable by a vampire being burned; he or she is sent into torpor instead. / [thn] Prevent all damage. This vam |
| 100108 | Asylum Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 100113 | Aura Reading | Combat | Only usable before range is chosen. / [aus] The opposing minion's controller plays with an open hand for the remainder o |
| 100114 | Auspex | Master | Master: Discipline. / Put this card on a vampire. This vampire gains 1 level of Auspex [aus]. Capacity increases by 1: t |
| 100117 | Autonomic Mastery | Combat | Only usable at close range. / [dom] Strike: burn the opposing non-wraith ally or a non-wraith retainer on the opposing m |
| 100121 | Baal's Bloody Talons | Combat | Only usable before resolution of a melee weapon's strike. / [qui] Damage from this weapon's strikes is aggravated this r |
| 100124 | Backstab | Combat | Only usable by a blocking vampire. Only usable on the first round of combat. / [cel] This vampire gets first strike on h |
| 100135 | The Barrens | Master | Unique location. / You can lock this card to discard a card (draw up afterward). |
| 100136 | Base Hunting Ground | Master | Master: unique location. Hunting ground. / During your unlock phase, you may move 1 blood from the blood bank to a ready |
| 100138 | Basilisk's Touch | Combat | Only usable in combat with an ally or younger vampire. Only usable before range is determined. / [pot] This vampire gets |
| 100153 | Bestial Vengeance | Combat | Requires a Laibon. / [ani] Only usable before range is determined. Choose a retainer on this Laibon. This combat, this L |
| 100174 | Blade Clot | Action Modifier, Combat | Requires an anarch. / Only usable when this anarch diablerizes a vampire with capacity 7 or more. Put this card in play  |
| 100178 | Bleeding the Vine | Master | Unique master. / Put this card into play. During your unlock phase, lock this card or burn 1 pool. You may lock this car |
| 100189 | Bliss | Combat, Reaction | [dom][pre] [COMBAT][REACTION] Cancel a frenzy card as it is played. Usable by a vampire not involved in the current comb |
| 100190 | Blissful Agony | Combat | [ani] Strike: hand strike at +1 damage. / [val] Only usable at close range before strikes are chosen. Opposing minion ta |
| 100199 | Blood Doll | Master | Put this card on a vampire you control. During their master phase, this vampire's controller can move 1 blood from this  |
| 100203 | Blood of Acid | Combat | Only usable at close range before strikes are chosen. A vampire can play only one Blood of Acid each round. / [vic] Duri |
| 100205 | Blood of the Cobra | Combat | [qui] Strike: 1R damage. / [QUI] Strike: ranged. Play a non-ranged strike that requires Quietus [qui] from your hand and |
| 100219 | Bloodform | Combat | [vic] Only usable in combat with an ally. Strike: combat ends. / [VIC] Only usable before range is determined. This roun |
| 100231 | Body of Sun | Combat | [pro] Strike: 3 aggravated damage if at close range or 1R aggravated damage if at long range. The same amount of aggrava |
| 100235 | Bond with the Mountain | Combat | [tha] Strike: dodge, with an optional press. / [vis] Strike: combat ends. Unlock both combatants. / [VIS] Strike: combat |
| 100238 | Bonecraft | Combat | [vic] Strike: 1 damage and put this card on the opposing minion. The attached minion gets -1 strength (after the current |
| 100241 | Botched Move | Combat | Only usable as the opposing minion plays a card that requires a Discipline. / The opposing minion's controller reveals t |
| 100262 | Brujah Justicar | Political Action | Title. / Choose a ready Brujah. If this referendum passes, put this card on the chosen Brujah to represent the unique Ca |
| 100288 | Campground Hunting Ground | Master | Master: unique location. Hunting Ground. / During your unlock phase, you may move 1 blood from the blood bank to a ready |
| 100303 | Carver's Meat Packing and Storage | Master | Unique location. / After a vampire with capacity 3 or less goes to torpor, put 1 hostage counter on them. Vampires with  |
| 100312 | Celerity | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Celerity [cel] and +1 capacity. Cannot be put on |
| 100342 | Chimerstry | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Chimerstry [chi] and +1 capacity. Cannot be put  |
| 100419 | Contingency Planning | Master | Master: out-of-turn. / Only usable when a minion you control is bleeding. You may play this card during your turn. Cance |
| 100426 | Corporate Hunting Ground | Master | Master: unique location. Hunting ground. / During your unlock phase, you may move 1 blood from the bank to a ready vampi |
| 100453 | Crusade: Atlanta | Political Action | Requires a Sabbat vampire. Title. / If this referendum passes, put this card on the acting vampire to represent the uniq |
| 100455 | Crusade: Berlin | Political Action | Title. Requires a Sabbat vampire. / Successful referendum means this card is put on this vampire to represent the unique |
| 100457 | Crusade: Chicago | Political Action | Requires a Sabbat vampire. Title. / If this referendum passes, put this card on the acting vampire to represent the uniq |
| 100458 | Crusade: Detroit | Political Action | Requires a Sabbat vampire. Title. / If this referendum is successful, put this card on the acting vampire to represent t |
| 100460 | Crusade: Frankfurt | Political Action | Requires a Sabbat vampire. Title. / If this referendum passes, put this card on the acting vampire to represent the uniq |
| 100462 | Crusade: Houston | Political Action | Requires a Sabbat vampire. Title. / If this referendum passes, put this card on the acting vampire to represent the uniq |
| 100463 | Crusade: Istanbul | Political Action | Title. Requires a Sabbat vampire. / Successful referendum means this card is put on this vampire to represent the unique |
| 100465 | Crusade: Mexico City | Political Action | Requires a Sabbat vampire. Title. / If this referendum passes, put this card on the acting vampire to represent the uniq |
| 100466 | Crusade: Miami | Political Action | Requires a Sabbat vampire. Title. / If this referendum passes, put this card on the acting vampire to represent the uniq |
| 100467 | Crusade: New York | Political Action | Requires a Sabbat vampire. Title. / If this referendum is successful, put this card on the acting vampire to represent t |
| 100468 | Crusade: Paris | Political Action | Requires a Sabbat vampire. Title. / If this referendum passes, put this card on the acting vampire to represent the uniq |
| 100469 | Crusade: Philadelphia | Political Action | Requires a Sabbat vampire. Title. / If this referendum is successful, put this card on the acting vampire to represent t |
| 100470 | Crusade: Pittsburgh | Political Action | Requires a Sabbat vampire. Title. / If this referendum is successful, put this card on the acting vampire to represent t |
| 100472 | Crusade: Toronto | Political Action | Requires a Sabbat vampire. Title. / If this referendum is successful, put this card on the acting vampire to represent t |
| 100493 | Dark Influences | Master | Out-of-turn. / Cancel a minion card as it is played, its cost is not paid, and put this card in play. That card cannot b |
| 100521 | Dementation | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Dementation [dem] and +1 capacity. Cannot be put |
| 100545 | Direct Intervention | Master | Out-of-turn. / Cancel a minion card as it is played, and its cost is not paid. (If it was an action card, the acting min |
| 100572 | Dominate | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Dominate [dom] and +1 capacity. Cannot be put on |
| 100588 | Dreams of the Sphinx | Master | Unique. / Put this card in play. Add 1 counter to this card each time you lock it. You can lock this card to get +2 hand |
| 100594 | Dummy Corporation | Master | Unique location. / You can burn this card if a minion is bleeding you to reduce the bleed amount by 2. |
| 100636 | Emergency Preparations | Master | Master: out-of-turn. / Burn 1 pool to cancel a Gehenna card as it is played. Alternatively, if there are at least two Ge |
| 100712 | Fee Stake: Boston | Action | +1 stealth action. Requires an Anarch with capacity 5 or more. Title. / Put this card on this Anarch to represent the un |
| 100713 | Fee Stake: Corte | Action | +1 stealth action. Requires an Anarch with capacity 5 or more. Title. / Put this card on this Anarch to represent the un |
| 100714 | Fee Stake: Los Angeles | Action | +1 stealth action. Requires an Anarch with capacity 5 or more. Title. / Put this card on this Anarch to represent the un |
| 100715 | Fee Stake: New York | Action | +1 stealth action. Requires an Anarch with capacity 5 or more. Title. / Put this card on this Anarch to represent the un |
| 100716 | Fee Stake: Perth | Action | +1 stealth action. Requires an Anarch with capacity 5 or more. Title. / Put this card on this Anarch to represent the un |
| 100717 | Fee Stake: Seattle | Action | +1 stealth action. Requires an Anarch with capacity 5 or more. Title. / Put this card on this Anarch to represent the un |
| 100724 | Fetish Club Hunting Ground | Master | Master: unique location. Hunting Ground. / During your unlock phase, you may move 1 blood from the blood bank to a ready |
| 100774 | Fortitude | Master | Master: Discipline. / Put this card on a vampire. This vampire gains 1 level of Fortitude [for]. Capacity increases by 1 |
| 100921 | Hide the Mind | Action Modifier, Combat | [obf] [COMBAT] Cancel a combat card requiring Auspex [aus] as it is played, and its cost is not paid. / [OBF] [ACTION MO |
| 100996 | Institution Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 101075 | Lay Low | Action Modifier, Combat | Requires an anarch. / Only usable when a blood hunt referendum passes and would burn this anarch. Move this anarch to th |
| 101102 | Library Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 101154 | Malkavian Justicar | Political Action | Title. / Choose a ready Camarilla Malkavian. Successful referendum means this card is put on the chosen Malkavian to rep |
| 101183 | Masquerade Endangered | Master | Master: out-of-turn. / Put this card on a vampire who successfully hunts. This vampire does not gain any blood from the  |
| 101243 | Morgue Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 101267 | Necromancy | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Necromancy [nec] and +1 capacity. Cannot be put  |
| 101299 | Nosferatu Justicar | Political Action | Title. / Choose a ready Nosferatu. If this referendum is successful, put this card on the chosen Nosferatu to represent  |
| 101303 | Not to Be | Master | Master: out-of-turn. / Cancel an event card as it is played (no cost is paid). Put this card in play. During your master |
| 101310 | Obfuscate | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Obfuscate [obf] and +1 capacity. Cannot be put o |
| 101312 | Obtenebration | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Obtenebration [obt] and +1 capacity. Cannot be p |
| 101354 | Park Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 101364 | The Path of Metamorphosis | Master | Unique. / Put this card in play. Cards requiring Vicissitude [vic] cost Tzimisce -1 blood. Minions can burn this card as |
| 101365 | The Path of Night | Master | Unique. / Put this card in play. Cards requiring Obtenebration [obt] cost Lasombra 1 fewer blood. Any minion can burn th |
| 101366 | The Path of Paradox | Master | Unique. / Put this card in play. Cards requiring Chimerstry [chi] cost Ravnos 1 fewer blood. Any minion can burn this ca |
| 101373 | The Path of Typhon | Master | Unique. / Put this card in play. Cards requiring Serpentis [ser] cost Followers of Set 1 fewer blood. Any minion can bur |
| 101415 | Political Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 101421 | Port Hunting Ground | Master | Master: unique location. Hunting ground. / During your unlock phase, you may move 1 blood from the blood bank to a ready |
| 101424 | Potence | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Potence [pot] and +1 capacity. Cannot be put on  |
| 101447 | Praxis Seizure: Amsterdam | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101448 | Praxis Seizure: Athens | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101449 | Praxis Seizure: Atlanta | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101450 | Praxis Seizure: Barcelona | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101451 | Praxis Seizure: Berlin | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101452 | Praxis Seizure: Boston | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101453 | Praxis Seizure: Brussels | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101454 | Praxis Seizure: Cairo | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101455 | Praxis Seizure: Chicago | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101456 | Praxis Seizure: Cleveland | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101457 | Praxis Seizure: Dallas | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101458 | Praxis Seizure: Dublin | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101459 | Praxis Seizure: Frankfurt | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101460 | Praxis Seizure: Geneva | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101461 | Praxis Seizure: Glasgow | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101462 | Praxis Seizure: Houston | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101463 | Praxis Seizure: Istanbul | Political Action | Title. Requires a Camarilla vampire. / Successful referendum means this card is put on this vampire to represent the uni |
| 101464 | Praxis Seizure: London | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101465 | Praxis Seizure: Miami | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101466 | Praxis Seizure: Monaco | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101467 | Praxis Seizure: Paris | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101468 | Praxis Seizure: Rome | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101469 | Praxis Seizure: Seattle | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101470 | Praxis Seizure: Stockholm | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101472 | Praxis Seizure: Washington, D.C. | Political Action | Requires a Camarilla vampire. Title. / If this referendum is successful, put this card on the acting vampire to represen |
| 101480 | Presence | Master | Master: Discipline. / Put this card on a vampire. This vampire gains 1 level of Presence [pre]. Capacity increases by 1: |
| 101498 | Protean | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Protean [pro] and +1 capacity. Cannot be put on  |
| 101534 | Quietus | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Quietus [qui] and +1 capacity. Cannot be put on  |
| 101552 | Ravnos Cache | Master | Unique location. / During your master phase, you can move 1 counter from your pool to this location and add 1 counter (f |
| 101553 | Ravnos Carnival | Master | Unique location. / This location comes into play with 1 counter for each Ravnos you control. Ravnos you control can use  |
| 101728 | Serpentis | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Serpentis [ser] and +1 capacity. Cannot be put o |
| 101753 | Shanty Town Hunting Ground | Master | Master: unique location. Hunting ground. / During your unlock phase, you may move 1 blood from the blood bank to a ready |
| 101808 | Slum Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 101821 | Society Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 101822 | Society of Leopold | Master | Unique master. / Put this card on a vampire. During his or her controller's unlock phase, the vampire with this card eit |
| 101841 | Special Report | Master | Master: out-of-turn. / Choose a ready vampire you control. That vampire unlocks and attempts to block. Once this action  |
| 101896 | Sudden Reversal | Master | Out-of-turn. / Cancel a master card as it is played by another Methuselah, and its cost is not paid. |
| 101926 | Tainted Vitae | Reaction | Only usable if a vampire controlled by your predator is about to successfully hunt. / The hunting vampire gets +2 hunt t |
| 101953 | Temple Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 101965 | Thaumaturgy | Master | Master: Discipline. / Put this card on a vampire. This vampire gains 1 level of Blood Sorcery [tha]. Capacity increases  |
| 101990 | Toreador Justicar | Political Action | Title. / Choose a ready Toreador. Successful referendum means this card is put on the chosen Toreador to represent the u |
| 102021 | Tremere Justicar | Political Action | Title. / Choose a ready Tremere. If this referendum is successful, put this card on the chosen Tremere to represent the  |
| 102052 | Two Wrongs | Master | Master: out-of-turn. Trifle. / Play when a minion controlled by a Methuselah other than your predator is bleeding you af |
| 102066 | Underworld Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 102075 | University Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 102084 | Uptown Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 102111 | Ventrue Justicar | Political Action | Title. / Choose a ready Ventrue. If this referendum is successful, put this card on the chosen Ventrue to represent the  |
| 102113 | Vessel | Master | Trifle. / Put this card on a vampire and you can burn a card named /Blood Doll/ (if any). During their unlock phase, thi |
| 102116 | Vicissitude | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Vicissitude [vic] and +1 capacity. Cannot be put |
| 102126 | Visit from the Capuchin | Master | Unique. / Put this card in play with 4 counters. You get +1 hand size for each counter on this card. Each time you would |
| 102147 | Warning Sirens | Master | Master: out-of-turn. / Play on a minion targeted by a directed action to give that minion +1 intercept. Alternatively, p |
| 102150 | Warzone Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 102151 | Wash | Master | Out-of-turn. Trifle. Do not replace until your unlock phase. / Cancel a master card played by your predator or prey as i |
| 102166 | Week of Nightmares | Master | Only one Week of Nightmares can be played in a game. / Put this card in play with 10 nightmare counters. Ravnos get +1 b |
| 102212 | Zoo Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 102230 | Organized Resistance | Reaction | Requires a baron. Usable by a locked baron. / An Anarch you control gets +1 intercept. Also usable to unlock a locked An |
| 102232 | The Platinum Protocol | Action | Requires an Anarch. More than one Discipline can be used to play this card. Ⓓ Bleed. / [obf] This is a +1 stealth action |
| 102268 | Banu Haqim Justicar | Political Action | Title. / Choose a ready Camarilla Banu Haqim. Successful referendum means this card is put on the chosen Banu Haqim to r |
| 102272 | Lasombra Justicar | Political Action | Title. / Choose a ready Camarilla Lasombra. Successful referendum means this card is put on the chosen Lasombra to repre |
| 102277 | Oblivion | Master | Discipline. / Put this card on a vampire. This vampire gets +1 level of Oblivion [obl] and +1 capacity. Cannot be put on |
| 102287 | Biotech Company Hunting Ground | Master | Unique location. Hunting ground. / During your unlock phase, a ready vampire you control can gain 1 blood. A vampire can |
| 102299 | Dead Pool | Master | Unique. / Put this card in play. After a vampire in combat with a Lasombra you control leaves the ready region, you can  |
| 102307 | Praxis Seizure: York | Political Action | Title. Requires a Camarilla vampire. / Successful referendum means this card is put on this vampire to represent the uni |
| 200001 | Aabbt Kindred (G2) | Vampire | Independent: Aabbt Kindred cannot perform directed actions unless /Nefertiti/ is ready. Aabbt Kindred can prevent 1 dama |
| 200002 | Aaron Bathurst (G4) | Vampire | Sabbat. |
| 200003 | Aaron Duggan, Cameron's Toady (G2) | Vampire | Sabbat. |
| 200004 | Abd al-Rashid (G2) | Vampire | Independent: Blood cursed. |
| 200005 | Abdelsobek (G5) | Vampire | Independent: Abdelsobek can unlock a vampire or mummy you control as a +1 stealth action. |
| 200006 | Abebe (G4) | Vampire | Independent. |
| 200007 | Abid bin Haji, Scholar of Mirrors (G6) | Vampire | Camarilla: Blood cursed. |
| 200008 | Abiku (G4) | Vampire | Laibon: Abiku gets +1 stealth when hunting. |
| 200009 | Abu Nuwasi (G4) | Vampire | Laibon. |
| 200132 | Ariane (G5) | Vampire | Anarch: Ariane gets -1 stealth during undirected actions. |
| 201526 | Leumeah (G6) | Vampire | Anarch Baron of Canberra. |
| 201529 | Alexa Draper (G6) | Vampire | Camarilla Prince of Melbourne: During the polling step of any referendum, Alexa can discard a card requiring Dominate [d |
| 201530 | Alexander Silverson (G6) | Vampire | Camarilla Prince of Birmingham: Vampires must burn 1 blood to cast votes and ballots against referendums called by Alexa |
| 201538 | Bret Stryker (G6) | Vampire | Camarilla: Bret gets -1 intercept against titled vampires. |
| 201540 | Catalina Vega (G6) | Vampire | Camarilla Prince of Buenos Aires: +1 bleed. |
| 201545 | The Dowager (G6) | Vampire | Camarilla primogen: The Dowager gets +1 intercept during directed actions. |
| 201547 | Flávio Gonçalves (G6) | Vampire | Camarilla Prince of São Paulo: Once each combat, Flávio can strike: dodge. |
| 201553 | Larissa Moreira (G6) | Vampire | Camarilla primogen: During a bleed action, Larissa can discard a card requiring Animalism [ani] to get +1 bleed. |
| 201555 | Lenny Burkhead (G6) | Vampire | Camarilla primogen: +1 bleed. |
| 201570 | Sybren van Oosten (G6) | Vampire | Camarilla Prince of Rotterdam: You can unlock Sybren after a referendum called by him passes. |
| 201574 | Kuyén (G6) | Vampire | Anarch Baron of Santiago: Animals (allies and retainers) cost Kuyén -1 blood or pool. |
| 201576 | Aline Gädeke (G6) | Vampire | Anarch Baron of Mannheim: Once each turn, Aline can burn 1 blood to unlock after another Anarch you control performs a s |
| 201585 | Elen Kamjian (G6) | Vampire | Anarch: If you control a locked minion, Elen must bleed with +1 bleed as a Ⓓ action unless she must hunt. |
| 201588 | Faruq Abd al-Qadir (G6) | Vampire | Anarch: Minions with any of your corruption counters in combat with Faruq cannot strike: combat ends. +1 strength. |
| 201591 | Hesha Ruhadze (G6) | Vampire | Anarch: Hesha gets +1 bleed for each unique equipment attached to him. |
| 201596 | Kalinda (G6) | Vampire | Camarilla primogen: During your turn, you can burn the Edge to unlock Kalinda. |
| 201597 | Kamile Paukstys (G6) | Vampire | Anarch: +1 bleed. |
| 201598 | Kasim Bayar (G6) | Vampire | Camarilla Assamite Justicar: Once each combat, Kasim can discard a political action card [POLITICAL ACTION] before range |
| 201601 | Martina Srnankova (G6) | Vampire | Anarch: Martina gets +1 intercept during bleed actions. |
| 201602 | Massimiliano (G6) | Vampire | Anarch Baron of Belo Horizonte: +1 strength. |
| 201608 | Nonu Dis (G6) | Vampire | Anarch: If Nonu Dis is ready during your master phase, you can add 1 blood to a ready Follower of Set you control after  |
| 201609 | Octane (G6) | Vampire | Anarch. |
| 201613 | Theo Bell (G6) | Vampire | Anarch: Theo can enter combat with a minion as a Ⓓ action. +1 strength. |
| 201614 | Valeriya Zinovieva (G6) | Vampire | Anarch Baron of Moscow: +1 strength. |
| 201623 | Abraham DuSable (G6) | Vampire | Camarilla: During an action, Abraham can discard a card requiring Blood Sorcery [tha] to get +1 intercept or +1 stealth. |
| 201625 | Carmelita Neillson (G7) | Vampire | Camarilla: While Carmelita is ready, you get +1 hand size. |
| 201626 | Cedrick Calhoun (G6) | Vampire | Camarilla: If the referendum of a political action called by Cedrick is canceled or fails, he goes to torpor after resol |
| 201627 | Evan Klein (G6) | Vampire | Camarilla: As a minion announces an action directed at Evan, flip a coin; if it is tails, the action fails. |
| 201628 | Jason "Son" Newberry (G6) | Vampire | Camarilla primogen: Jason gets +2 votes when casting votes against blood hunt referendums. +1 bleed. |
| 201629 | Kevin Jackson (G7) | Vampire | Camarilla Prince of Chicago: Kevin gets +1 strength in combat with a Brujah. Brujah get +1 strength in combat with him. |
| 201632 | Nathaniel Bordruff (G6) | Vampire | Camarilla: Nathaniel can enter combat with a locked vampire as a Ⓓ action. |
| 201656 | Oluwafunmilayo (G6) | Vampire | Camarilla Prince of Lagos: Oluwafunmilayo gets +1 intercept during political actions. |
| 201658 | Saku Pihlajamäki (G6) | Vampire | Anarch Baron of Helsinki: Saku gets 1 optional maneuver each combat. |
| 201659 | Keegan (G6) | Vampire | Anarch: Once each turn, Keegan can unlock after performing a successful action requiring a Gangrel. |
| 201660 | Ragnar Nordstrom (G6) | Vampire | Anarch: Cards requiring Protean [pro] cost Ragnar -1 blood. Ragnar gets +1 strength in combat with an ally or younger va |
| 201662 | Sergio Bueno (G6) | Vampire | Anarch Baron of Santo Domingo: Minions with 1 or more of your corruption counters must burn 1 blood or life to attempt t |
| 201663 | Abaddon (G7) | Vampire | Independent: Abaddon gets 1 optional maneuver and 1 optional press each combat. |
| 201664 | Adrino Manauara (G6) | Vampire | Anarch Baron of Manaus: Adrino gets 1 press (mandatory) each combat, only usable to continue combat. |
| 201666 | Aniel (G7) | Vampire | Independent: Aniel can burn 1 corruption counter or a card requiring a Discipline from another ready minion as a +1 stea |
| 201667 | Branimira (G6) | Vampire | Anarch Baron of Sofia: While you have 9 or fewer pool, Branimira gets +1 intercept. |
| 201668 | Castellan (G7) | Vampire | Independent: Castellan gets +1 intercept during directed actions and -1 intercept during non-directed actions. |
| 201670 | Doc Martina (G7) | Vampire | Anarch: Rescuing a vampire from torpor costs Doc Martina -1 blood. |
| 201671 | Dominica (G7) | Vampire | Independent: Dominica can search your library for a master archetype card, reveal it and move it to your hand as a +1 st |
| 201672 | Gathii (G7) | Vampire | Anarch: During an action Gathii performs, you can reveal the top card of your library. If it is a master card, he burns  |
| 201673 | Ilonka (G7) | Vampire | Independent: Once each turn, if Ilonka is ready after a successful bleed against you, she can look at the acting minion' |
| 201675 | Luciano Carvalho (G7) | Vampire | Anarch: During your discard phase, you can move an animal retainer from a vampire you control to another vampire you con |
| 201677 | Marialena (G6) | Vampire | Anarch: If Marialena is blocked, she burns 1 blood before block resolution. |
| 201678 | Neserian (G6) | Vampire | Anarch: While you control no locations, Neserian gets -1 bleed. While you control 1 or more locations, Neserian gets +1  |
| 201680 | Opikun (G7) | Vampire | Independent: Once each combat involving a vampire you control, Opikun can burn 1 blood to prevent up to 2 non-aggravated |
| 201681 | Phaibun (G7) | Vampire | Anarch: Once each combat, Phaibun can discard a card at random to strike: dodge. |
| 201684 | Roy (G7) | Vampire | Anarch: If Roy is unlocked during your discard phase, lock him. He gets +1 strength in combat with titled vampires. |
| 201685 | Sakhar (G7) | Vampire | Independent: Sakhar can search your library for an equipment card, reveal it and move it to your hand as a +1 stealth ac |
| 201686 | Seraphina (G7) | Vampire | Independent: Seraphina can add 2 blood or life to a minion you control as a +1 stealth action, not to exceed starting li |
| 201687 | Sreelekha (G7) | Vampire | Anarch: If Sreelekha is ready at the start of your discard phase, you get +1 discard phase action. +1 bleed. |
| 201710 | Azucena (G6) | Vampire | Camarilla: Azucena gets +1 intercept against younger Lasombra and -1 intercept against older Lasombra. |
| 201712 | Gnaeus Aemilius Augustinus (G6) | Vampire | Camarilla Prince of Lima: If Aemilius is ready during your unlock phase, your prey chooses a ready minion they control;  |
| 201715 | Rinaldo Albizzi (G6) | Vampire | Camarilla primogen: +1 intercept. |
| 201716 | Yewon Ong (G6) | Vampire | Camarilla Prince of Singapore: During the polling step of any referendum, Yewon can discard a card requiring Oblivion [o |
| 201721 | Lenelle, Mambo of Birmingham (G6) | Vampire | Independent: Lenelle can exchange a card from your hand for a library card in your ash heap as a +1 stealth action that  |
| 201722 | Marchesa Liliana (G6) | Vampire | Independent: During a bleed action, Liliana can remove seven cards in your ash heap from the game to get an additional + |
| 201724 | Mora, the Death Seer (G6) | Vampire | Independent: If Mora is ready during your discard phase, you can move a library card from your ash heap to the bottom of |
| 201725 | "Mother" Anja Giovanni (G6) | Vampire | Independent: Once each turn, if she is ready, Anja can burn 1 blood after another Hecata you control performs a successf |
| 201726 | Parijat, the Dark Oracle (G6) | Vampire | Independent: While Parijat is ready, minions must burn the top card of their library to attempt to block wraith or zombi |
| 201728 | Tommaso Sforza (G6) | Vampire | Independent: Once each turn, if he is ready, Tommaso can burn 1 blood before range is determined in a combat involving a |
| 201729 | Dafina Hanganu (G6) | Vampire | Camarilla Prince of Constanza: Dafina can enter combat with a minion as a Ⓓ action. |
| 201730 | Egidia Arrú (G6) | Vampire | Camarilla: After a minion in combat with Egidia leaves the ready region, their controller burns 1 pool. +1 strength. |
| 201731 | Hel-Blá (G6) | Vampire | Independent: Hel-Blá can move an ally requiring Hecata or Oblivion [obl] from your ash heap to your ready region, locked |
| 201732 | Roger de Camden (G6) | Vampire | Camarilla Prince of Edinburgh: Cards requiring Hecata and/or Oblivion [obl] cost Roger -1 blood. Once each turn, if Roge |
| 201733 | Aaradhya, The Callous Tyrant (G6) | Vampire | Sabbat cardinal: Aaradhya can unlock after performing a successful political action (even if the referendum failed). +1  |
| 201734 | Abderrahim, Death's Hand (G6) | Vampire | Sabbat: During an action, Abderrahim can burn 1 blood to give an ally or younger vampire you control +1 stealth. +1 stre |
| 201735 | Aelswith, The Irresistible (G6) | Vampire | Sabbat cardinal: If Aelswith is blocked, the blocking minion's controller burns 1 pool before block resolution. |
| 201736 | Agnieszka, Tempter of Legions (G6) | Vampire | Sabbat Archbishop of Gdansk: Agnieszka can burn 1 blood to strike: combat ends. +1 bleed. |
| 201738 | Algirdas, The Solar Prophet (G6) | Vampire | Sabbat bishop: Strike cards cost opposing younger vampires +1 blood. |
| 201739 | Anousha, The Maniac (G6) | Vampire | Sabbat bishop: +1 strength. |
| 201740 | Anxo Vilela (G6) | Vampire | Sabbat: While you have the Edge, Anxo gets +1 strength. |
| 201741 | Ashur-uballit, Son of the Abyss (G6) | Vampire | Sabbat cardinal: While Ashur-uballit is ready, zombies (allies and retainers) you recruit or employ get +1 starting life |
| 201745 | Crossbreaker (G6) | Vampire | Sabbat bishop: Once each round of combat, Crossbreaker can burn 1 blood to make the damage from his hand strikes aggrava |
| 201747 | Damian (G6) | Vampire | Sabbat Archbishop of Pittsburgh: While you control a ready cardinal, Damian gets +1 bleed. |
| 201748 | Devorah (G6) | Vampire | Sabbat: While you have 5 or fewer pool, Devorah gets +1 stealth. |
| 201750 | Eulogio Sánchez de los Reyes (G6) | Vampire | Sabbat: Eulogio can look at and reorder the top 5 cards of your library, and unlock as a +1 stealth action that costs 1  |
| 201751 | Fotini Katsikaris (G6) | Vampire | Sabbat: After Fotini successfully bleeds (for 1 or more), you get +1 hand size until your next discard phase. |
| 201752 | Frau Schädel (G6) | Vampire | Sabbat: Frau Schädel gets +1 stealth during recruit and employ actions. |
| 201754 | Gostoso (G6) | Vampire | Sabbat: After Gostoso successfully bleeds your prey (for 1 or more), he can gain 1 blood. |
| 201757 | Huldu, The Desecrator (G6) | Vampire | Sabbat: Once each combat involving another minion you control, if Huldu is ready, she can burn 1 blood to prevent 1 dama |
| 201758 | Jürgen, The Libertine (G6) | Vampire | Sabbat Archbishop of Mannheim: Minions must burn 1 blood or life to attempt to block Jürgen. |
| 201759 | Kalyani, Agent of Doom (G6) | Vampire | Sabbat bishop: Kalyani gets -1 stealth when hunting. +1 strength. |
| 201760 | Khin Aye (G6) | Vampire | Sabbat priscus: While your predator controls more ready minions than you, you get +1 hand size. |
| 201767 | Osvaldo Kühnemann (G6) | Vampire | Sabbat: Osvaldo gets +1 bleed against a Methuselah controlling a Toreador or Ventrue. |
| 201770 | Rexton "Savage" Abernathy (G6) | Vampire | Sabbat Archbishop of Geneva: Allies and vampires with capacity 3 or less cannot block Rexton. |
| 201771 | Sakura, The Merciless (G6) | Vampire | Sabbat: During your turn, Sakura can burn 1 blood to unlock after performing a successful action requiring the Path of D |
| 201772 | Serhat Gunde, Combat Junkie (G6) | Vampire | Sabbat: Serhat gets 1 optional press each combat. |
| 201775 | Üresség (G6) | Vampire | Sabbat Archbishop of Budapest: While your prey has 10 or fewer pool, Üresség gets +1 vote and +1 bleed. |
| 201776 | Věnceslava, The Implacable (G6) | Vampire | Sabbat Archbishop of Ostrava: Once each turn, after resolution of an action performed by Věnceslava during which your pr |
| 201777 | Verrix, Naughty Boy (G6) | Vampire | Sabbat bishop: Verrix gets +1 stealth during bleed actions. |
| 201781 | Barachiel (G7) | Vampire | Independent: Barachiel can enter combat with a minion as a Ⓓ action. |
| 201782 | Djeneba (G7) | Vampire | Independent: In combat, strike cards cost the opposing minion +1 blood or life. +1 stealth. |
| 201783 | Hafthor Thorsteinsson (G7) | Vampire | Anarch: +1 intercept. |
| 201784 | Máddji, Mistress of Szlachtas (G6) | Vampire | Anarch: Allies and retainers requiring a Tzimisce cost Máddji -1 blood or pool. |
| 201785 | Noluthando (G7) | Vampire | Anarch: Noluthando inflicts +1 damage with ranged strikes (even at close range). |
| 201786 | Saankaláxt (G6) | Vampire | Anarch: Saankaláxt can steal an equipment as a Ⓓ action that costs 1 blood. |
| 900001 | Mythercerer | Master | Master: Discipline. Put this card on a vampire. This vampire gains one level of Mythercerer [myt]. Capacity increases by |
| 900002 | Obeah | Master | Master: Discipline. Put this card on a vampire. This vampire gains one level of Obeah [obe]. Capacity increases by 1: th |
| 900003 | Valeren | Master | Master: Discipline. Put this card on a vampire. This vampire gains one level of Valeren [val]. Capacity increases by 1:  |
| 900004 | Visceratika | Master | Master: Discipline. Put this card on a vampire. This vampire gains one level of Visceratika [vis]. Capacity increases by |
| 900005 | Daimaite | Master | Master: Discipline. Put this card on a vampire. This vampire gains one level of Daimaite [dai]. Capacity increases by 1: |
| 900006 | Melpominee | Master | Master: Discipline. Put this card on a vampire. This vampire gains one level of Melpominee [mel]. Capacity increases by  |
| 900007 | Spiritus | Master | Master: Discipline. Put this card on a vampire. This vampire gains one level of Spiritus [spi]. Capacity increases by 1: |
| 900008 | Temporis | Master | Master: Discipline. Put this card on a vampire. This vampire gains one level of Temporis [tem]. Capacity increases by 1: |
| 900009 | Thanatosis | Master | Master: Discipline. Put this card on a vampire. This vampire gains one level of Thanatosis [thn]. Capacity increases by  |

## 2. Niezgodności w istniejących handlerach — 7 kart

Heurystyka: słowo-klucz w tekście nie występuje w bloku `effects` w cards.ts.

| ID | Nazwa | Problem |
|---:|---|---|---|
| 100585 | Drawing Out the Beast | BRAK maneuver mimo tekstu 'maneuver' | **NAPRAWIONE** e93fb49: dodano `restrictOpponent maneuver:true` (był tylko press/equipment) |
| 101636 | Rigor Mortis | BRAK additionalStrike mimo tekstu 'Additional strike' | **NAPRAWIONE** e93fb49: `[pre] additionalStrikes:true`, `[thn] +press`, `[THN] +maneuver` |
| 101636 | Rigor Mortis | BRAK maneuver mimo tekstu 'maneuver' | **NAPRAWIONE** j.w. |
| 101696 | Scourge of Alecto | BRAK maneuver mimo tekstu 'maneuver' | **NAPRAWIONE** e93fb49: superior `strikeDamageCapacityDiff` + `maneuver` |
| 101923 | Sympathetic Agony | BRAK additionalStrike mimo tekstu 'Additional strike' | **NAPRAWIONE** e93fb49: superior `restrictOpponent additionalStrikes:true` |
| 101940 | Target Leg | BRAK maneuver mimo tekstu 'maneuver' | **FAŁSZYWY ALARM**: `aimRider moveDisciplines obf/tha/flight` — maneuver/press ograniczone via aim, nie via `maneuver` primitive |
| 102353 | Dogged Pursuit | BRAK intercept mimo tekstu | **FAŁSZYWY ALARM**: `unlockAndAttemptBlock penaltyIfNoBlock: attach` + bespoke `Dogged Pursuit: burn for +1 intercept` (26612) — intercept na karcie-przyczepionej, nie na akcji |

## 3. Zweryfikowane bugi z gry — 2 zgłoszone

| Karta | Zgłoszenie | Status |
|---|---|---|
| 100227 Blur | dodatkowy Strike (limited) można zagrać 2× w tej samej rundzie grant | **NAPRAWIONE** w d68fdb0: `compile.ts` `additionalStrike` teraz `ops.grantAdditionalStrike(..., e.limited)` natychmiast ustawia `usedLimitedAddl`, drugi Blur w tym samym grant window jest blokowany (test: pass only) |
| 101507 Psyche! | Press ok, superior nie świecił; po pominięciu fazy press walka kończy się | **NAPRAWIONE** w d68fdb0: basic `press` w `combat.press`, superior `queueCombat` w `combat.endOfRound` z `onlyIfBothCombatantsReady` + `onlyIfCombatWouldEnd` |

## 4. Plan naprawy

- Fala A (100 kart): 100001–100178 brakujące — priorytet master/location (Alamut, Hunting Grounds)
- Fala B (100 kart): 100189–100500
- Fala C (77 kart): 100500–102353 + 7 niezgodności
- Każda fala: faithful v2 via catalog heurytyka + bespoke dla Gehenna/complex, test regresji, `typecheck` + `vitest`
