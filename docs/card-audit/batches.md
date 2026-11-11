# Ręczny audyt — paczki

Licznik „bez ustaleń” oznacza wyłącznie karty, które nie mają żadnego wpisu w `manual-findings.json`. Wpis o błędzie nie oznacza, że pozostałe klauzule karty zostały sprawdzone. Również „bez wykrytej niezgodności” nie stanowi dowodu poprawności wszystkich interakcji.

## Paczka 1 — ID 100001–100005

| Wynik | Karty | Szczegóły |
|---|---:|---|
| Bez wykrytej niezgodności | 1 | Aaron's Feeding Razor — koszt, unikalność i +1 hunt; istniejące testy efektu i niektórych interakcji. |
| Wymagały naprawy | 4 | .44 Magnum, 419 Operation, Abactor, Abandoning the Flesh. |
| Naprawione wykryte błędy | 1 z 4 | .44 Magnum: dodatkowy strike przeciwnika, zakaz działania i zakaz posiadania equipment oraz modyfikatory i źródła kosztu. Dalsze interakcje mogą wymagać sprawdzenia. |
| Nadal wymagają naprawy | 3 z 4 | 419 Operation, Abactor, Abandoning the Flesh. |

Bez żadnego ręcznego ustalenia po tej paczce: **4143 z 4158**. Wcześniej udokumentowane rozbieżności i częściowe poprawki też wymagają dalszej pracy; lista nie jest liczbą kart w pełni zweryfikowanych.

## Paczka 2 — ID 100006–100010

| Wynik | Karty | Szczegóły |
|---|---:|---|
| Bez wykrytej niezgodności | 1 | Abbot — sprawdzone klauzule, w tym wymóg Sabbat, limit, unlock i intercept. |
| Wymagały naprawy | 4 | Abjure, Ablative Skin, Abombwe, Abomination. |
| Naprawione wykryte błędy | 1 z 4 | Abombwe — trifle, dołączenie do właściwego celu, podniesienie dyscypliny i capacity; testy `abombwe-audit.test.ts`. |
| Nadal wymagają naprawy | 3 z 4 | Abjure, Ablative Skin, Abomination. |

Bez żadnego ręcznego ustalenia po tej paczce: **4138 z 4158**. Liczba ta nie obejmuje niezamkniętych problemów i nie oznacza, że pozostałe 20 kart z wpisami są w pełni zweryfikowane.

## Paczka 3 — 100 nowych kart z ID 100011–100112

Szczegóły per karta i zakres w [batch-03-100.md](batch-03-100.md). 100 kart wstępnie porównano, ale nie wszystkie miały scenariuszowe testy.

| Wynik | Liczba |
|---|---:|
| Bez wykrytej niezgodności w sprawdzonym zakresie | 1 |
| Potwierdzone błędy wciąż wymagające naprawy | 40 |
| Wykryty błąd naprawiony celowo, niepełny audyt | 2 |
| Wstępny przegląd, wynik nierozstrzygnięty | 57 |

Powyższe 40 nie obejmuje dwóch celowanych napraw; ograniczenia AK-47 pozostają otwarte. Wspólna poprawka dotycząca Animalism dotyczy także innych zwykłych kart dyscyplin, które nie zostały przez to w całości przeaudytowane. Pozostało **4095 z 4158** bez wpisu w manual-findings; liczba obejmuje pozycje wstępnie przejrzane, ale nierozstrzygnięte, i nie oznacza liczby kart w pełni poprawnych.

## Paczka 4 — 1000 nowych kart w pętli

[Szczegóły i wyniki per karta](batch-04-1000.md). Automatyczny triage 1000 kart; ręcznie rozstrzygnięto tylko 35, pozostałe wymagają sprawdzenia.

| Wynik | Liczba |
|---|---:|
| Bez wykrytej niezgodności w ograniczonym zakresie | 4 |
| Wykryty błąd naprawiony celowo | 1 |
| Potwierdzone błędy nadal wymagające naprawy | 30 |
| Bez ręcznego rozstrzygnięcia | 965 |

Sygnał automatyczny otrzymało 406 kart; brak sygnału nie oznacza poprawności. Bez żadnego ręcznego ustalenia w całym rejestrze: **4060 z 4158**. Liczba ta nie oznacza liczby kart w pełni zweryfikowanych.

## Paczka 4 — ręczna kontynuacja, pierwsze 100 kart

Karta po karcie: [batch-04-manual-01.md](batch-04-manual-01.md). Wyniki obejmują także ustalenia z poprzedniej tury dla tego samego zakresu.

| Wynik | Liczba |
|---|---:|
| Bez wykrytej niezgodności w zbadanym zakresie | 20 |
| Znane błędy naprawione celowo | 4 |
| Potwierdzone błędy nadal wymagające naprawy | 63 |
| Konieczne dalsze sprawdzenie przed rozstrzygnięciem | 13 |

W tej turze poprawiono Biothaumaturgic Experiment i Blood Buff; w zakresie jest też wcześniej poprawiony Bestial Visage i poprawiony wspólny mechanizm Auspex. Poza tą setką w tysiącu pozostaje 900 kart, spośród których 9 ma wcześniej potwierdzony błąd. Bez ręcznego wpisu w całym rejestrze: **3999 z 4158**. To nie liczba kart w pełni sprawdzonych.

## Paczka 4 — ręczna kontynuacja, druga setka

[Karta po karcie](batch-04-manual-02.md): ID 100214–100314, pozycje 101–200 manifestu. Wpis Bounty był wcześniejszy.

| Wynik | Liczba |
|---|---:|
| Bez wykrytej niezgodności w sprawdzonym zakresie | 20 |
| Naprawa celowana | 6 |
| Potwierdzone błędy nadal wymagające naprawy | 57 |
| Nierozstrzygnięte | 17 |

Naprawy: Blood Trade, Blooding by the Code, Bollix, Cardinal Benediction, Carver's Meat Packing and Storage, Cave of Apples. Wspólna poprawka Bollix dotyczy także Blood Fury z poprzedniej setki; nie oznacza zamknięcia wszystkich interakcji. Bez ręcznego rozstrzygnięcia w całym rejestrze: **3917 z 4158** (w tym 17 nierozstrzygniętych z tej setki). To nie liczba kart poprawnych.

## Paczka 4 — ręczna kontynuacja, trzecia setka

[Karta po karcie](batch-04-manual-03.md): ID 100315–100414, pozycje 201–300 manifestu. Chanjelin Ward miał wcześniejszy wpis.

| Wynik | Liczba |
|---|---:|
| Bez wykrytej niezgodności w sprawdzonym zakresie | 27 |
| Naprawa celowana | 6 |
| Potwierdzone błędy nadal wymagające naprawy | 62 |
| Nierozstrzygnięte | 5 |

Naprawy: Changeling, Charisma, Command of the Beast, Compress, Conflagration i Confusion. Pozycje bez wykrytej niezgodności nie są dowodem pełnej poprawności; pozostaje **3823 z 4158** bez ręcznego rozstrzygnięcia, w tym 5 nierozstrzygniętych z tej setki.

## Paczka 4 — ręczna kontynuacja, czwarta setka

[Karta po karcie](batch-04-manual-04.md): pozycje 301–400 manifestu, ID 100415–100514. Częściowy etap obejmował 58 rozstrzygniętych kart; następnie przeanalizowano pozostałe 42.

| Wynik | Liczba |
|---|---:|
| Bez wykrytej niezgodności w sprawdzonym zakresie | 37 |
| Naprawa celowana | 9 |
| Potwierdzone błędy nadal wymagające naprawy | 54 |
| Nierozstrzygnięte | 0 |

Naprawy: osiem Crusade (Amsterdam, Barcelona, Brussels, Dublin, Geneva, London, Rome, Washington, D.C.) i Dark Steel. Wpis Convergence był wcześniejszy. Bez jakiegokolwiek ręcznego wpisu w całym rejestrze: **3724 z 4158**; to nie liczba kart w pełni sprawdzonych.

## Paczka 4 — częściowy przegląd kandydatów z piątej i szóstej setki

[Wybiórcze ustalenia](batch-04-manual-05-partial.md): pozycje 401–600 manifestu, ID 100515–100714. Nie jest to pełny audyt tych 200 kart. Zapisano 54 nowe ustalenia: 53 otwarte błędy i naprawę Disease, przetestowaną celowo. W tym zakresie dwa błędy (Demonstration i Esgrima) były już zapisane wcześniej.

| Pozycje manifestu | Otwarte błędy | Naprawa celowana | Bez ręcznego wpisu |
|---|---:|---:|---:|
| 401–500 | 33 | 1 | 66 |
| 501–600 | 22 | 0 | 78 |

Razem 144 z tych 200 kart nadal nie ma ręcznego wpisu. W całym inwentarzu takich kart jest **3670 z 4158**; wpis o błędzie lub naprawie nie oznacza pełnej weryfikacji karty. Kontynuować od pominiętych pozycji, nie traktując szóstego zakresu jako ukończonego.

## Paczka 4 — piąta setka, zakończenie wpisów

[Kontynuacja karta po karcie](batch-04-manual-05-continuation.md) obejmuje 66 wcześniej pominiętych kart z pozycji 401–500 manifestu. Zapisano 24 otwarte błędy, cztery celowane naprawy i 38 ocen bez wykrytej niezgodności w podanym zakresie. Naprawiono Donnybrook, Disarm (cel wyłącznie vampire), Dust to Dust i wybór trybów Earth Swords; poprawiono też możliwość wyboru strike z opcjonalnym maneuver po pominięciu maneuver.

Łącznie dla pozycji 401–500 (w tym wcześniejsze ustalenia): **57 błędów otwartych, 5 celowanych napraw i 38 ocen bez wykrytej niezgodności w opisanym zakresie**. Każda ma ręczny wpis, co nie oznacza pełnej zgodności ani pokrycia wszystkich interakcji. Pozycje 501–600 mają nadal 78 kart bez ręcznego wpisu. W całym rejestrze bez żadnego wpisu pozostaje **3604 z 4158**.

## Paczka 4 — kolejny przegląd częściowy

[Ustalenia dla części pozycji 751–910](batch-04-manual-08-partial.md): 114 otwartych błędów i jedna celowana naprawa Horrid Form; błędy bez nowych testów scenariuszowych. W pozycjach 501–1000 wciąż 190 kart nie ma ręcznego wpisu. Łącznie w inwentarzu 838 z 4158 kart ma wpis (607 otwartych błędów, 188 przeglądów w ograniczonym zakresie, 43 naprawy celowane), a 3320 nie ma wpisu. To nie jest pełny audyt 500 kart ani pomiar całkowitej poprawności.

## Paczka 4 — uzupełnienie pominiętych pozycji i kolejny zakres

[Pozycje 601–750](batch-04-manual-09-partial.md) oraz [911–930](batch-04-manual-10-partial.md): 77 nowych wpisów — 58 przeglądów bez wykrytej niezgodności **tylko w opisanym zakresie**, 17 rozbieżności stwierdzonych w kodzie bez nowego testu scenariuszowego (`CODE_DISCREPANCY`) i dwa przypadki nierozstrzygnięte (`UNRESOLVED`). Istniejące testy uruchomiono dla wybranych zakresów; raporty podają wyniki i ograniczenia.

W pozycjach 501–1000 jest 387 kart z wpisem, 113 bez wpisu; dwa wpisy są nierozstrzygnięte. W całym inwentarzu jest 915 kart z wpisem i 3243 bez wpisu. Historyczne `CONFIRMED_BUG` nie gwarantuje testu scenariuszowego: należy czytać dowody indywidualnych wpisów, a nie utożsamiać ten status z jednolitym poziomem pewności.

## Paczka 4 — uzupełnienie wpisów w pozycjach 501–1000

[Pozycje 931–1000](batch-04-manual-11-partial.md) i [pominięte pozycje 751–910](batch-04-manual-12-partial.md): 113 nowych wpisów, w tym 40 rozbieżności w kodzie bez nowego testu scenariuszowego oraz 73 ograniczone przeglądy bez wykrytej niezgodności w opisanym zakresie. Wybrane istniejące testy: 353/353 i 498/498 w dwóch częściowo pokrywających się zestawach; typecheck i diff-check poprawne. Pełnego zestawu nie uruchomiono.

W pozycjach 501–1000 każda z **500 kart** ma teraz wpis: 259 historycznych `CONFIRMED_BUG`, 57 `CODE_DISCREPANCY`, 175 ograniczonych przeglądów bez wykrytej niezgodności, 7 celowanych napraw i 2 `UNRESOLVED`. Historyczny `CONFIRMED_BUG` nie gwarantuje odtworzenia testem, a ograniczony przegląd nie oznacza pełnej zgodności. Nierozstrzygnięte: Focus the Blood i Fragment of the Book of Nod. W całym inwentarzu 1028 z 4158 kart ma wpis, 3130 nadal nie ma wpisu.

## Paczka 5 — rozpoczęty przegląd 500 kart

[Manifest 500 kart](batch-05-ids.json) obejmuje ID 101115–101614. [Ręczny przegląd pozycji 1–100](batch-05-manual-01-partial.md) zawiera 67 rozbieżności w kodzie bez nowych testów scenariuszowych, 31 przeglądów bez wykrytej niezgodności wyłącznie w podanym zakresie oraz 2 przypadki nierozstrzygnięte. Pozostałych **400 kart** tej paczki nadal nie ma ręcznego wpisu. Triage automatyczny nie jest przeglądem i wyników próbki nie należy ekstrapolować.

Wybrane testy: 403/404 w 35 plikach; jeden test `justicars.test.ts` zawodzi na liczbie 9 zamiast oczekiwanych 8, zanim sprawdzi unikalność; ten sam test zawodził w poprzednim pełnym przebiegu. Typecheck i diff-check poprawne; pełnego zestawu nie uruchomiono. W całym inwentarzu **1128 z 4158** kart ma wpis, **3030** go nie ma. Historyczne `CONFIRMED_BUG` obejmuje również ustalenia statyczne, nie tylko niezależnie odtworzone błędy; wpisy nie stanowią pełnego potwierdzenia zgodności kart.

## Paczka 5 — dalsze 150 pozycji

[Pozycje 101–250](batch-05-manual-02-partial.md), ID 101215–101364: 95 rozbieżności w kodzie bez nowych testów odtwarzających, 53 przeglądy bez wykrytej niezgodności tylko w podanym zakresie oraz 2 przypadki nierozstrzygnięte. W paczce 5 jest teraz **250 kart z wpisem i 250 bez wpisu**; wpis nie oznacza pełnego audytu reguł. Nie ekstrapolować tych wyników na pozostałe karty.

Wybrane zestawy testów, częściowo pokrywające się: 382/384 (dwa niepowodzenia związane z listą dyscyplin występowały w poprzednim pełnym przebiegu) oraz 170/170; osobny test generatora po regeneracji 1/1. Typecheck i diff-check przeszły. Pełnego zestawu nie uruchomiono. Łącznie **1278 z 4158** kart ma wpis w inwentarzu, **2880** nie ma; historyczny `CONFIRMED_BUG` nie gwarantuje scenariuszowego odtworzenia.

## Paczka 5 — pozycje 251–450

[Przegląd 200 pozycji](batch-05-manual-03-partial.md), ID 101365–101564: 106 rozbieżności w kodzie bez nowych testów odtwarzających, 88 ograniczonych przeglądów bez wykrytej niezgodności oraz 6 nierozstrzygniętych. W paczce 5 **450 kart ma wpis, a 50 (pozycje 451–500) nadal go nie ma**. Wpisy nie dowodzą pełnej zgodności, a wyniki nie są próbą statystyczną.

Wybrane, częściowo pokrywające się zestawy testów: 381/383, 192/193 oraz 238/238. Niepowodzenia dotyczą listy dyscyplin oraz oczekiwania pominięcia Praxis Seizure: Venice; oba rodzaje występowały w poprzednim pełnym przebiegu. Generator inwentarza, test generatora, typecheck i diff-check przeszły; pełnego zestawu nie uruchomiono. W całym inwentarzu **1478 z 4158** kart ma wpis, **2680** nie ma. Historyczny `CONFIRMED_BUG` obejmuje również ustalenia statyczne, nie gwarantuje odtworzenia scenariuszem.

## Paczka 5 — zakończenie 500 wpisów

[Ostatnie 50 pozycji](batch-05-manual-04.md), ID 101565–101614: 36 rozbieżności w kodzie bez nowych testów odtwarzających i 14 ograniczonych przeglądów. Wszystkie **500 kart** paczki ma wpis: 304 `CODE_DISCREPANCY`, 186 ograniczonych `REVIEWED_NO_ISSUE_FOUND` i 10 `UNRESOLVED`. Wpis nie dowodzi pełnej zgodności, a wyniki nie stanowią statystycznej próby pozostałych kart.

Wybrane testy tej części: 204/204 w 18 plikach. Typecheck, generator inwentarza, test generatora i diff-check przeszły; pełnego zestawu nie uruchomiono. W całym inwentarzu **1528 z 4158** kart ma wpis, **2630** go nie ma. Historyczne `CONFIRMED_BUG` obejmuje ustalenia statyczne bez niezależnego odtworzenia.

## Paczka 6 — początek kolejnych 500 kart

[Manifest](batch-06-ids.json) obejmuje ID 101615–102114; [pierwsze 100 pozycji](batch-06-manual-01-partial.md) otrzymało 73 wpisy `CODE_DISCREPANCY` na podstawie kodu bez nowych testów odtwarzających i 27 przeglądów bez wykrytej niezgodności w opisanym wąskim zakresie. Dalszych 400 nie przejrzano w tej turze; karta 101862 ma wcześniejszy historyczny wpis `CONFIRMED_BUG`, a pozostałych **399** nie ma wpisu. Bez ekstrapolowania wyników.

Wybrane, częściowo pokrywające się zestawy testów: 161/161 i 269/269. Generator inwentarza, test generatora, typecheck i diff-check przeszły. Pełnego zestawu nie uruchomiono; testy nie dowodzą pełnej zgodności kart. W całym inwentarzu **1628 z 4158** kart ma wpis, **2530** go nie ma. Historyczne `CONFIRMED_BUG` obejmuje także analizy statyczne bez niezależnego odtworzenia.

## Paczka 6 — pozycje 101–300

[Przegląd 200 pozycji](batch-06-manual-02-partial.md), ID 101715–101914: 199 nowych wpisów — 147 `CODE_DISCREPANCY` z analizy kodu bez nowego testu odtwarzającego i 52 ograniczone przeglądy. Historyczny wpis `CONFIRMED_BUG` dla 101862 zachowano bez zmiany. Pierwszych **300 kart** paczki ma wpis, ostatnich **200 nie ma**; ograniczony przegląd nie jest pełnym potwierdzeniem zgodności. Nie ekstrapolować wyników.

Wybrane, częściowo pokrywające się zestawy testów: 140/141, 203/203, 279/279 i 222/222. Jedna porażka `discipline-cards.test.ts:207` występowała w poprzednim pełnym przebiegu. Generator inwentarza, test generatora, typecheck i diff-check przeszły; pełnego zestawu nie uruchomiono. W całym inwentarzu **1827 z 4158** kart ma wpis, **2331** nie ma. Historyczne `CONFIRMED_BUG` obejmują także statyczne analizy bez niezależnego odtworzenia.

## Paczka 6 — ostatnie 200 pozycji i zakończenie

[Pozycje 301–500](batch-06-manual-03.md), ID 101915–102114: 126 rozbieżności z analizy kodu bez nowych testów odtwarzających, 72 ograniczone przeglądy i 2 przypadki nierozstrzygnięte. Wszystkie **500 kart** paczki mają teraz wpis: 346 `CODE_DISCREPANCY`, 151 ograniczonych `REVIEWED_NO_ISSUE_FOUND`, 2 `UNRESOLVED` oraz 1 zachowany historyczny `CONFIRMED_BUG`. Wpis nie dowodzi pełnej zgodności, a wyników nie należy ekstrapolować. Historyczny status może obejmować analizę statyczną bez niezależnego odtworzenia.

Wybrane, częściowo pokrywające się zestawy testów: 337/338, 286/288, 251/252 i 283/285. Porażki to znane testy zbioru dyscyplin, listy frenzy i liczby Justicar; szczegóły w raporcie. Generator inwentarza, test generatora, typecheck i diff-check przeszły; pełnego zestawu nie uruchomiono. W całym inwentarzu **2027 z 4158** kart ma wpis, **2131** go nie ma.

## Paczka 7 — pierwsze 150 z 500 pozycji

[Pozycje 1–150](batch-07-manual-01-partial.md), ID 102115–102264: 76 rozbieżności z analizy kodu bez nowych testów odtwarzających oraz 74 ograniczone przeglądy. Pozostałych 350 pozycji manifestu nie przejrzano w tym etapie; wśród nich jest 5 zachowanych wpisów historycznych `CONFIRMED_BUG`. Historyczny status może obejmować analizę statyczną bez niezależnego odtworzenia. Wpis nie dowodzi pełnej zgodności, a wyników nie należy ekstrapolować.

Wybrane, częściowo pokrywające się zestawy: 296/297, 195/195 i 356/356. Porażka to znany test listy frenzy; szczegóły w raporcie. Generator inwentarza, test generatora, typecheck i diff-check uruchomiono oddzielnie. W całym inwentarzu **2177 z 4158** kart ma wpis, **1981** go nie ma.

## Paczka 7 — pozycje 151–270

[Szczegóły 120 pozycji](batch-07-manual-02-partial.md): 100 kart bibliotecznych i 20 pierwszych crypt, w tym 2 zachowane historyczne wpisy. Nowe wpisy: 24 rozbieżności z analizy kodu bez nowych testów odtwarzających, 93 ograniczone przeglądy i 1 nierozstrzygnięty wymóg. Łącznie przejrzano w paczce **270 z 500 pozycji**; pozostałych 230 nie przejrzano w ramach tych dwóch raportów. Trzy z nich mają wcześniejsze wpisy `CONFIRMED_BUG`, które mogą obejmować analizę statyczną bez niezależnego odtworzenia.

Wybrane, częściowo pokrywające się testy: 464/468, 610/611 i 62/63; listę niepowodzeń podaje raport. Pełnego zestawu nie uruchomiono. Generator inwentarza, test generatora, typecheck i diff-check uruchomiono osobno. Łącznie w inwentarzu **2295 z 4158** kart ma wpis, **1863** go nie ma. Wyników nie należy ekstrapolować.

## Paczka 7 — pozycje 271–370

[Szczegóły 100 wampirów](batch-07-manual-03-partial.md), ID 200021–200120: 77 rozbieżności z analizy kodu bez nowych testów odtwarzających i 23 ograniczone przeglądy. Łącznie przejrzano **370 z 500 pozycji**; pozostałych 130 nie przejrzano w ramach tych raportów, w tym trzy z zachowanymi wcześniejszymi wpisami `CONFIRMED_BUG`. Historyczny status może obejmować analizę statyczną bez niezależnego odtworzenia. Wyników nie ekstrapolować.

Wybrane testy: 225/227 w 9 plikach; dwie znane porażki list/oczekiwań opisano w raporcie, nie są scenariuszowym potwierdzeniem nowych rozbieżności. Pełnego zestawu nie uruchomiono. Generator inwentarza, test generatora, typecheck i diff-check sprawdzono osobno. W inwentarzu **2395 z 4158** kart ma wpis, **1763** go nie ma.

## Paczka 7 — pozycje 371–500 i zakończenie

[Szczegóły 130 pozycji](batch-07-manual-04.md), ID 200121–200250: 86 nowych `CODE_DISCREPANCY` z analizy kodu bez nowego testu odtwarzającego, 41 ograniczonych przeglądów i 3 zachowane wpisy historyczne. Wszystkie **500 pozycji** paczki mają teraz ograniczony ręczny przegląd i wpis: 263 rozbieżności z analizy kodu, 231 ograniczonych przeglądów bez wykrytej niezgodności, 5 historycznych `CONFIRMED_BUG` i 1 `UNRESOLVED`. Historyczny status może obejmować analizę statyczną bez niezależnego odtworzenia; wpis nie dowodzi pełnej zgodności. Wyników nie ekstrapolować.

Wybrane istniejące testy 241/242 w 10 plikach: znana porażka oczekiwania braku handlera Nosferatu Kingdom, szczegóły w raporcie. Pełnego zestawu nie uruchomiono. Generator inwentarza, jego test, typecheck i diff-check sprawdzono osobno. Łącznie **2522 z 4158** kart ma wpis, **1636** nie ma.

## Paczka 8 — pierwsze 250 z 500 pozycji

[Manifest](batch-08-ids.json) obejmuje ID 200251–200750. [Ograniczony przegląd 250 kart](batch-08-manual-01-partial.md), ID 200251–200500: 167 rozbieżności z analizy kodu bez nowych testów scenariuszowych i 83 ograniczone przeglądy bez wykrytej niezgodności. Pozostałych **250 pozycji** paczki nie przejrzano w tym etapie i nie mają wcześniejszych wpisów. Przegląd nie potwierdza pełnej zgodności; nie ekstrapolować wyników.

Wybrane testy: 241/242 w 10 plikach; znana porażka oczekiwania braku handlera Nosferatu Kingdom. Diagnostycznie porównano wartości importu i kluczy contest dla dwóch zapisów Waszyngtonu, bez scenariusza rozgrywki. Pełnego zestawu nie uruchomiono. Generator inwentarza, test generatora, typecheck i diff-check sprawdzono osobno. W całym inwentarzu **2772 z 4158** kart ma wpis, **1386** go nie ma. Historyczne `CONFIRMED_BUG` może obejmować analizę statyczną bez niezależnego odtworzenia.

## Paczka 8 — pozycje 251–500 i zakończenie

[Ograniczony przegląd 250 kart](batch-08-manual-02.md), ID 200501–200750: 182 rozbieżności z analizy kodu bez nowych testów scenariuszowych i 68 ograniczonych przeglądów bez wykrytej niezgodności. Wszystkie **500 pozycji** paczki mają wpis: 349 `CODE_DISCREPANCY` i 151 `REVIEWED_NO_ISSUE_FOUND`. Wpis nie dowodzi pełnej zgodności, a wyników nie należy ekstrapolować.

Wybrane istniejące testy: 241/242 w 10 plikach; znana porażka oczekiwania braku handlera Nosferatu Kingdom. Pełnego zestawu nie uruchomiono. Generator inwentarza, jego test, typecheck i diff-check sprawdzono osobno. W całym inwentarzu **3022 z 4158** kart ma wpis, **1136** nie ma. Historyczne `CONFIRMED_BUG` może obejmować analizę statyczną bez niezależnego odtworzenia.
