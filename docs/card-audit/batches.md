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

## Paczka 9 — pierwsze 250 z 500 pozycji

[Manifest](batch-09-ids.json) obejmuje ID 200751–201250. [Ograniczony przegląd 250 kart](batch-09-manual-01-partial.md), ID 200751–201000: 188 rozbieżności z analizy kodu bez nowych testów scenariuszowych i 62 ograniczone przeglądy bez wykrytej niezgodności. Pozostałych **250 pozycji** paczki nie przejrzano w tym etapie i nie mają wcześniejszych wpisów. Wpis nie dowodzi pełnej zgodności; nie ekstrapolować wyników.

Wybrane testy: 241/242 w 10 plikach; znana porażka oczekiwania braku handlera Nosferatu Kingdom. Pełnego zestawu nie uruchomiono. Generator inwentarza, test generatora, typecheck i diff-check sprawdzono osobno. W całym inwentarzu **3272 z 4158** kart ma wpis, **886** go nie ma. Historyczne `CONFIRMED_BUG` może obejmować analizę statyczną bez niezależnego odtworzenia.

## Paczka 9 — pozycje 251–400

[Szczegóły 150 kart](batch-09-manual-02-partial.md), ID 201001–201150: 111 rozbieżności z analizy kodu bez nowych testów scenariuszowych i 39 ograniczonych przeglądów bez wykrytej niezgodności. Łącznie przejrzano **400 z 500 pozycji**: 299 rozbieżności i 101 ograniczonych przeglądów. Pozostałych **100** nie przejrzano w tym etapie ani w pierwszym raporcie i nie mają wcześniejszych wpisów. Wpis nie dowodzi pełnej zgodności; nie ekstrapolować wyników.

Wybrane testy: 241/242 w 10 plikach; znana porażka oczekiwania braku handlera Nosferatu Kingdom. Pełnego zestawu nie uruchomiono. Generator inwentarza, test generatora, typecheck i diff-check sprawdzono osobno. W całym inwentarzu **3422 z 4158** kart ma wpis, **736** go nie ma. Historyczne `CONFIRMED_BUG` może obejmować analizę statyczną bez niezależnego odtworzenia.

## Paczka 9 — pozycje 401–500 i zakończenie

[Szczegóły 100 kart](batch-09-manual-03.md), ID 201151–201250: 64 rozbieżności z analizy kodu bez nowych testów scenariuszowych i 36 ograniczonych przeglądów bez wykrytej niezgodności. Wszystkie **500 pozycji** paczki mają ograniczony przegląd i wpis: 363 rozbieżności oraz 137 ograniczonych przeglądów bez wykrytej niezgodności. Wpis nie dowodzi pełnej zgodności; wyników nie ekstrapolować.

Wybrane testy: 241/242 w 10 plikach; znana porażka oczekiwania braku handlera Nosferatu Kingdom. Pełnego zestawu nie uruchomiono. Generator inwentarza, test generatora, typecheck i diff-check sprawdzono osobno. W całym inwentarzu **3522 z 4158** kart ma wpis, **636** go nie ma. Historyczne `CONFIRMED_BUG` może obejmować analizę statyczną bez niezależnego odtworzenia.

## Paczka 10 — pierwsze 150 z 500 pozycji

[Manifest](batch-10-ids.json) obejmuje 500 wcześniej niezapisanych kart crypt, ID 201251–201751 bez niewystępującego ID 201701. [Ograniczony przegląd 150 kart](batch-10-manual-01-partial.md), ID 201251–201400: 111 rozbieżności z analizy kodu bez nowych testów scenariuszowych i 39 ograniczonych przeglądów bez wykrytej niezgodności. Pozostałych **350 pozycji** manifestu nie przejrzano w tym etapie i nie mają wcześniejszych wpisów. Triage wskazał w nich dwie pozycje bez raw spec/runtime handlera; flaga nie jest klasyfikacją. Wpis nie dowodzi pełnej zgodności; wyników nie ekstrapolować.

Wybrane testy: 241/242 w 10 plikach; znana porażka oczekiwania braku handlera Nosferatu Kingdom. Pełnego zestawu nie uruchomiono. Generator inwentarza, test generatora, typecheck i diff-check sprawdzono osobno. W całym inwentarzu **3672 z 4158** kart ma wpis, **486** go nie ma. Historyczne `CONFIRMED_BUG` może obejmować analizę statyczną bez niezależnego odtworzenia.

## Paczka 10 — pozycje 151–300

[Szczegóły 150 kart](batch-10-manual-02-partial.md), ID 201401–201550: 93 rozbieżności z analizy kodu bez nowych testów scenariuszowych i 57 ograniczonych przeglądów bez wykrytej niezgodności. Łącznie przejrzano **300 z 500 pozycji**: 204 rozbieżności i 96 ograniczonych przeglądów. Pozostałych **200** nie przejrzano w ramach tych raportów i nie mają wcześniejszych wpisów. Flaga braku handlera dla Leumeah została zbadana: drukowana sect i tytuł są importowane niezależnie; Octane z taką samą flagą nadal czeka na indywidualny przegląd. Wpis nie dowodzi pełnej zgodności; nie ekstrapolować wyników.

Wybrane testy: 241/242 w 10 plikach; znana porażka oczekiwania braku handlera Nosferatu Kingdom. Pełnego zestawu nie uruchomiono. Generator inwentarza, test generatora, typecheck i diff-check sprawdzono osobno. W całym inwentarzu **3822 z 4158** kart ma wpis, **336** go nie ma. Historyczne `CONFIRMED_BUG` może obejmować analizę statyczną bez niezależnego odtworzenia.

## Paczka 10 — pozycje 301–400

[Szczegóły 100 kart](batch-10-manual-03-partial.md), ID 201551–201650: 26 rozbieżności z analizy kodu bez nowych testów scenariuszowych i 74 ograniczone przeglądy bez wykrytej niezgodności. Łącznie przejrzano **400 z 500 pozycji**: 230 rozbieżności i 170 ograniczonych przeglądów. Pozostałych **100** nie przejrzano w ramach tych raportów i nie mają wcześniejszych wpisów. Druga flaga braku handlera dotyczy Octane: jego samą sect importer odczytuje niezależnie. Wpis nie dowodzi pełnej zgodności; nie ekstrapolować wyników.

Wybrane testy: 241/242 w 10 plikach; znana porażka oczekiwania braku handlera Nosferatu Kingdom. Pełnego zestawu nie uruchomiono. Generator inwentarza, test generatora, typecheck i diff-check sprawdzono osobno. W całym inwentarzu **3922 z 4158** kart ma wpis, **236** go nie ma. Historyczne `CONFIRMED_BUG` może obejmować analizę statyczną bez niezależnego odtworzenia.

## Paczka 10 — pozycje 401–500 i zakończenie

[Szczegóły 100 kart](batch-10-manual-04.md), ID 201651–201751 bez 201701: 20 rozbieżności z analizy kodu bez nowych testów scenariuszowych, 79 ograniczonych przeglądów i 1 nierozstrzygnięty przypadek. Wszystkie **500 pozycji** paczki mają wpis: 250 rozbieżności, 249 ograniczonych przeglądów i 1 nierozstrzygnięty. Wpis nie dowodzi pełnej zgodności; wyników nie ekstrapolować.

Wybrane testy: 241/242 w 10 plikach, znana porażka oczekiwania braku handlera Nosferatu Kingdom; dodatkowo filtrowany test Oluwafunmilayo 1/1. Pełnego zestawu nie uruchomiono. Generator inwentarza, test generatora, typecheck i diff-check sprawdzono osobno. W całym inwentarzu **4022 z 4158** kart ma wpis, **136** go nie ma. Historyczne `CONFIRMED_BUG` może obejmować analizę statyczną bez niezależnego odtworzenia.

## Paczka 11 — 35 crypt i dziewięć dyscyplin, częściowo

[Manifest](batch-11-ids.json) obejmuje 136 pozycji bez wcześniejszych wpisów; [przegląd 44 kart](batch-11-manual-01-partial.md) dotyczy crypt 201752–201786 i kart dyscyplin 900001–900009. Wynik: 4 rozbieżności z analizy kodu bez nowych scenariuszy odtwarzających i 40 ograniczonych przeglądów bez wykrytej niezgodności. Pozostałe **92** pozycje manifestu w tej turze nie mają wpisu; wpis nie dowodzi pełnej zgodności.

Dodano 27 testów dziewięciu dyscyplin (27/27); wybrane testy crypt-wave/supported 190/191 w 8 plikach, znana porażka dotycząca Nosferatu Kingdom. Pełnego zestawu nie uruchomiono. Generator inwentarza, jego test, typecheck i diff-check sprawdzono osobno. W całym inwentarzu **4066 z 4158** kart ma wpis, **92** go nie mają.

## Paczka 11 — pierwsze 25 kart biblioteki

[Raport](batch-11-manual-02-partial.md) obejmuje 25 kart z ID 100011–100054 według manifestu: 13 statycznych rozbieżności bez nowego scenariusza odtwarzającego, 11 ograniczonych przeglądów bez wykrytej niezgodności oraz jeden przypadek nierozstrzygnięty. W paczce łącznie wpisy ma **69/136** kart, pozostało **67**; w całym inwentarzu **4091/4158** ma wpis. Ograniczony przegląd nie dowodzi pełnej zgodności.

Wybrane testy: 114/114 w 13 plikach; dodatkowy zestaw 86/89 w 6 plikach, trzy znane porażki listy dyscyplin, klanów i frenzy. Pełnego zestawu nie uruchomiono. Generator, test inwentarza, typecheck i diff-check sprawdzono osobno.

## Paczka 11 — kolejne 25 kart biblioteki

[Raport](batch-11-manual-03-partial.md) obejmuje 25 kart z ID 100055–100096 według manifestu: 7 statycznych rozbieżności bez nowego scenariusza, 15 ograniczonych przeglądów bez wykrytej niezgodności oraz 3 nierozstrzygnięte. W paczce łącznie wpisy ma **94/136** kart, pozostało **42**; w całym inwentarzu **4116/4158** ma wpis. Ograniczony przegląd nie dowodzi pełnej zgodności.

Wybrane testy: 141/142 w 12 plikach, znana porażka listy klanów `referendum-terms.test.ts:301`; dodatkowe 62/62 w 6 plikach. Pełnego zestawu nie uruchomiono. Generator, test inwentarza, typecheck i diff-check sprawdzono osobno.

## Paczka 11 — następne 20 kart biblioteki

[Raport](batch-11-manual-04-partial.md) obejmuje 20 kart z ID 100099–100212 według manifestu: 8 statycznych rozbieżności bez nowego scenariusza i 12 ograniczonych przeglądów bez wykrytej niezgodności. W paczce łącznie wpisy ma **114/136** kart, pozostały **22**; w całym inwentarzu **4136/4158** ma wpis. Ograniczony przegląd nie dowodzi pełnej zgodności.

Wybrane testy: 224/226 w 19 plikach; znane porażki listy dyscyplin `burn-the-equipment.test.ts:132` i klasyfikacji frenzy `round-recurring-combat.test.ts:624`. Pełnego zestawu nie uruchomiono. Generator, test inwentarza, typecheck i diff-check sprawdzono osobno.

## Paczka 11 — ostatnie 22 karty, komplet manifestu

[Raport](batch-11-manual-05.md) obejmuje ostatnie 22 karty z ID 100219–100410 według manifestu: 6 statycznych rozbieżności bez nowego scenariusza, 13 ograniczonych przeglądów bez wykrytej niezgodności i 3 nierozstrzygnięte. Cała paczka: **136/136** wpisów, w tym **38 `CODE_DISCREPANCY`, 91 ograniczonych `REVIEWED_NO_ISSUE_FOUND`, 7 `UNRESOLVED`**. W całym inwentarzu **4158/4158** kart ma wpis; nie oznacza to pełnej zgodności ani pełnego pokrycia testowego. Historyczne `CONFIRMED_BUG` mogą obejmować analizy statyczne.

Wybrane testy: 291/293 w 21 plikach; znane porażki `justicars.test.ts:27` i `referendum-terms.test.ts:301`. Pełnego zestawu nie uruchomiono. Generator, test inwentarza, typecheck i diff-check sprawdzono osobno.

## Paczka 11 — scenariuszowa weryfikacja trzech rozbieżności

Po ukończeniu pierwszego przeglądu dodano `tests/cards/batch-11-discrepancies.test.ts`: trzy testy charakteryzują **obecne wadliwe zachowanie** i przechodzą, dopóki pozostaje niezmienione. Przy naprawie należy zmienić asercje na oczekiwaną zgodność, nie zachowywać wadliwego zachowania. Nie zmieniano mechanik.

- **Consanguineous Boon (100410)**: faktyczna decyzja terms nie oferuje Toreador antitribu nawet z takim wampirem w grze; Brujah i nieobecny Nosferatu są kontrolami. Nie sprawdzono wypłaty wybranego klanu, bo nie można go wybrać.
- **Camarilla Exemplary (100284)**: przy statyce karty ręcznie dołączonej do aktora w oknie bleed ally może blokować bez karty, lecz nie z kartą; wampir z blood nadal może. Test nie rozgrywa referendum ani nie rozstrzyga osobnej kwestii wymogu ready.
- **Can't Take it with You (100289)**: po udanym referendum z lokacją u Alice log pokazuje gain Alice, burn Alice, gain Bob, gain Carol, nie dwie globalne fazy. Test nie bada skutków oustingu ani reakcji na kolejność.

Te trzy wpisy zaktualizowano do `CONFIRMED_BUG` w inwentarzu z zaznaczeniem powyższych ograniczeń; wcześniejszy raport części 05 opisuje stan przed tymi testami. W całej paczce 11 po aktualizacji: **35 `CODE_DISCREPANCY`, 3 `CONFIRMED_BUG`, 91 ograniczonych `REVIEWED_NO_ISSUE_FOUND`, 7 `UNRESOLVED`**. Pozostałe statyczne ustalenia bez zmian.

## Naprawy po audycie — pierwszy etap

Aktualną mapę tematów i metodologię klasyfikacji zawiera [open-issue-categories.md](open-issue-categories.md), a kolejność dalszych prac — [remediation-plan.md](remediation-plan.md). Kategorie są nakładającymi się kandydatami, nie potwierdzonymi wspólnymi przyczynami.

- Dodano filtr rodzaju miniona do trwałego `blockToll`; Archon, Camarilla Exemplary i Sabbat Priest obciążają tylko wampiry, nie ally. Sabbat Priest zachowuje inne otwarte ustalenie, a Camarilla Exemplary ma nierozstrzygnięty zakres wymogu ready.
- Dla Can't Take it with You rozdzielono wspólną realizację efektu na globalną fazę gain i następującą po niej fazę burn. Test obejmuje kolejność zdarzeń po udanym referendum, nie wszystkie interakcje z oustingiem.
- Import pięciu crypt z osobną klauzulą `Non-unique.` przenosi tę cechę do ready, uncontrolled i crypt. Testy potwierdzają brak contestu oraz contest kontrolnego unikalnego wampira. Pozostałe znane braki tych pięciu kart nadal są otwarte.

Poprzednie części raportów są historyczne. Aktualne szczegóły i statusy znajdują się w inwentarzu. Testy celowane: 133/133 w 10 plikach; generator inwentarza, typecheck oraz diff-check przeszły.

Pełny zestaw uruchomiono przed doprecyzowaniem asercji w testach regresyjnych: **3976 passed, 18 failed** w 14 plikach (372 pliki łącznie). Wśród porażek są m.in. nieaktualne listy klanów i dyscyplin, oczekiwana liczba Justicarów oraz test klasyfikacji frenzy; żadna nie pochodzi z plików objętych tymi zmianami. Po doprecyzowaniu testów ponowiono zestaw celowany. `npm run build` przeszedł z ostrzeżeniem Vite o dużych chunkach.

Porażki pełnego zestawu (nazwy przypadków):

- ` tests/cards/burn-the-equipment.test.ts > Vial of Elder Vitae (102114) > DISCIPLINES names every Discipline the pool actually uses`
- ` tests/cards/central-queries.test.ts > every registered handler answers the central queries > names at least one printed type — every LIBRARY card`
- ` tests/cards/clan-vocabulary.test.ts > clan vocabulary > is exactly what CLANS offers — 'an EXISTING clan' means the pool's`
- ` tests/cards/clan-vocabulary.test.ts > clan vocabulary > the legacy library's clan icons stayed OUT of the vocabulary`
- ` tests/cards/crypt-wave-1.test.ts > the crypt pipeline > a vampire with a bare sect/title line gets NO entry`
- ` tests/cards/discipline-cards.test.ts > Discipline master cards > §0: exactly the Disciplines the pool actually requires`
- ` tests/cards/granted-action-requirements.test.ts > a granted action requires the clan its grant lists [LSJ 20080604] > Keegan has no positive to build: no supported grant lists Gangrel`
- ` tests/cards/justicars.test.ts > every Justicar is unique > carries `unique` on the spec, which is what the card contest reads`
- ` tests/cards/library-audit.test.ts > the coverage guard > every supported card is named by some test or fuzz deck`
- ` tests/cards/no-partial-cards.test.ts > no partial cards > counts up — the two whole kinds account for the entire pool`
- ` tests/cards/path-cards.test.ts > Paths come from the crypt, not from a card in play > NO card in the pool grants a Path — that is why it must be printed`
- ` tests/cards/pool-widening.test.ts > what the widening admits > admits only the configured groups`
- ` tests/cards/pool-widening.test.ts > what the widening admits > admits no sect the engine cannot represent`
- ` tests/cards/pool-widening.test.ts > what the widening admits > leaves the precons V5-only — a legacy set's decks are half-built here`
- ` tests/cards/pool-widening.test.ts > what the widened cards carry > matches the config — widened when groups are open, empty when not`
- ` tests/cards/praxis-seizure.test.ts > the admission path (§6) > the Praxis Seizures still OUT are exactly the ones whose rider is unbuilt`
- ` tests/cards/referendum-terms.test.ts > CLANS is derived, not guessed > matches exactly the clans the V5 crypt contains`
- ` tests/cards/round-recurring-combat.test.ts > frenzy classification (docs/round-recurring-combat-design.md §6) > every frenzy mode in the pool classifies, and matches its printed text`

## Naprawy po audycie — drugi etap

- `CLANS` rozszerzono z 14 do 40 klanów wampirów z aktualnej krypty, z wyłączeniem siedmiu creed imbued. Testy obu referendów rozgrywają wybór Toreador antitribu i wynik oraz sprawdzają klan nieobecny, inne klany, ally i wyłączenie creed. Nie ustalono kompletności listy klanów spoza rejestru. Poprawione testy porównują listę z rejestrem bez utożsamiania creed z klanami; stara asercja o istnieniu library-only klanu była nieaktualna dla poszerzonego rejestru.
- Nana Buruku, Unmada i Abraham Mellon otrzymali +1 hand size ograniczony do ready; Henri Lavenant — tylko w swoim combat. Testy używają rzeczywistego importu, sprawdzają ready, locked, torpor i opuszczenie gry albo czas i uczestników combat. Inne opisane braki czterech kart wciąż pozostają otwarte.
- Status Boon i Condemnation zmieniono na `FIXED_TARGETED` wyłącznie dla zakresu wyboru klanu; nie oznacza to pełnej zgodności. Wcześniejsze raporty są historyczne.

Po tym etapie **2596 kart ma otwarte wpisy**: 1450 library (602 `CONFIRMED_BUG`, 826 `CODE_DISCREPANCY`, 22 `UNRESOLVED`) i 1146 crypt (5, 1140, 1). Historyczne `CONFIRMED_BUG` nie zawsze ma odtworzenie scenariuszowe; `UNRESOLVED` wymaga rozstrzygnięcia, a nie musi okazać się błędem. Wpis może zawierać wiele problemów; `FIXED_TARGETED` i ograniczone przeglądy też nie gwarantują pełnej zgodności.

Generator inwentarza i kategorii, typecheck, diff-check oraz testy celowane przeszły (106/106 w 12 plikach, przed dodaniem dodatkowej kontroli niepowiązanego combat; nowy plik osobno 5/5).

Pełny zestaw po drugim etapie: **3987 passed, 15 failed** w 12 plikach (373 pliki; 4002 testy). W porównaniu z poprzednim uruchomieniem nie pojawiły się nowe nazwy porażek; trzy dawne porażki dotyczące listy klanów zniknęły po poprawieniu implementacji i dostosowaniu testów do rozróżnienia klanów i creed oraz aktualnego rejestru. Pozostałe 15 to te same przypadki wymienione w poprzedniej sekcji poza tymi trzema. Build przeszedł z ostrzeżeniem Vite o dużych chunkach.

## Naprawy po audycie — drukowany Sterile

Importer rozpoznaje samodzielną klauzulę `Sterile.` na **42** kartach crypt i zapisuje cechę w ready, uncontrolled i crypt. Nie utożsamia wzmianki o sterylnym innym minionie ani wymogu non-sterile z cechą drukowaną. Test `crypt-sterile.test.ts` weryfikuje wszystkie 42 ID, kontrolę negatywną oraz opcje sześciu aktualnie zaimplementowanych akcji tworzenia wampira z `requiresNonSterile`, używając sterylnego i niesterylnego aktora; The Siamese zachowuje +1 bleed. Nie implementowano nadawania i usuwania sterile innymi kartami ani pozostałych niezaimplementowanych akcji tworzenia wampirów.

Cztery karty (Effie Lowery, Juanita Santiago, Sahana, The Siamese), dla których brak importu był jedyną opisaną rozbieżnością, otrzymały `FIXED_TARGETED`. Pozostałych **38** nadal ma inne otwarte ustalenia; stare sformułowania o braku importu sterile w ich dowodach zachowano jako wyraźnie oznaczoną historię.

Stan po etapie: **2592 karty z otwartymi wpisami**, w tym **1450 library** (602 `CONFIRMED_BUG`, 826 `CODE_DISCREPANCY`, 22 `UNRESOLVED`) oraz **1142 crypt** (5, 1136, 1). Statusy i ograniczenia opisano powyżej: wpis nie jest pojedynczym błędem, nierozstrzygnięte nie musi oznaczać błędu, a celowana poprawka nie dowodzi pełnej zgodności.

Testy celowane: **114/114** w 10 plikach; generator audytu i kategorii, typecheck i diff-check przeszły. Pełnego zestawu w tym etapie nie uruchomiono; poprzedni wynik to 3987 passed i 15 failed przed tą zmianą. Po odtworzeniu środowiska `npm ci` zgłosiło 9 podatności zależności (4 moderate, 3 high, 2 critical); nie zmieniano zależności.

### Wspólna mechanika Flight — import i konsumenty

- Import samodzielnego `Flight [FLIGHT]` dla 26 wampirów we wszystkich trzech strefach krypty. Wspólny `hasFlight` czyta self-entry, jawny `grantsFlight` przyłączonego permanentu oraz istniejącą reprezentację discipline-like (dla zgodności stanów), bez włączania Flight do ogólnego `disciplinesOf`. Tag Flight należący do retainera nie nadaje cechy jego pracodawcy.
- Scenariusze na rzeczywistych importowanych kartach: Patrol (także syntetyczny grant i kontrola negatywna), Earthshock, High Ground i Nest of Eagles (również grant); test importu wszystkich 26 kart i stref, parsera oraz zachowania po usunięciu grantu. Dotychczasowe syntetyczne testy grantów zostały przystosowane do jawnych statics. Target Leg nadal filtruje karty wymagające Flight według specyfikacji, bez zmian mechaniki.
- `FIXED_TARGETED`: Handsome Dan, Malachai i Obsidian — według dotychczasowego przeglądu jedyną rozbieżnością było drukowane Flight. Pozostałe 23 wpisy otwarte; wcześniejsze evidence opisano jako historyczne w zakresie Flight. Nie wdrożono kart, które nadają Flight (ani Ally/żetonów z Flight); sam syntetyczny grant nie dowodzi ich działania. Patrol pozostaje `UNRESOLVED`, bo nie sprawdzono wszystkich źródeł Flight ani pełnego tekstu wszystkich kart.
- Walidacja: 8 plików celowanych, **53/53 testów**, `npm run typecheck`, `npm run build` i `git diff --check` przeszły. Build ostrzega o dużych chunkach. Pełnego zestawu w tej turze nie uruchomiono; ostatni wynik pełny przed zmianą Sterile to 3987 passed / 15 failed w 12 plikach.
- Aktualnie otwarte: library **1450** (602 `CONFIRMED_BUG`, 826 `CODE_DISCREPANCY`, 22 `UNRESOLVED`), crypt **1139** (5 `CONFIRMED_BUG`, 1133 `CODE_DISCREPANCY`, 1 `UNRESOLVED`). To liczba kart z otwartymi wpisami, nie liczba potwierdzonych defektów; `FIXED_TARGETED` nie potwierdza pełnej zgodności karty.

## Naprawy po audycie — Blood Cursed i istniejące ścieżki diablerii

- Zgodnie z [regułami VEKN](https://www.vekn.net/179-rules/vtes-rulebook) wampir Blood Cursed nie może popełnić diablerii. Importer odczytuje samodzielny drukowany tekst dla **50** kart, bez przypisywania klątwy całemu klanowi; stan zachowuje cechę w krypcie, uncontrolled i ready.
- Wspólny warunek gotowego wampira bez klątwy sprawdzany dla zwykłej diablerii, dostępnych akcji Cloak of Blood i Stealing Years, oferty blokującego wyjście z torporu oraz przed wykonaniem. Testy używają kart z rejestru, sprawdzają kontrole pozytywne i negatywne, rescue, block bez combat, zmianę klątwy w czasie akcji i brak riderów Cloak po zmianie. Testuje się też tytuł Enam oraz statics strength Parnassusa.
- **17** kart z wpisem dotyczącym tylko klątwy lub już obsługiwanej premii/tytułu otrzymało `FIXED_TARGETED`; pozostałe **33** wpisy zostają otwarte z historyczną analizą innych braków. Ten status nie dowodzi pełnej zgodności. Tajdid nadal nie znosi klątwy, Humanitas/Alastor nie dodają swoich zakazów, Amaranth nie implementuje diablerii, a Web of Knives Recruit nie tworzy wskazanego wampira. Nie sprawdzono innych skutków zmiany cechy w trakcie Stealing Years.
- Walidacja: zestaw celowany **92/92** w 9 plikach (następnie ponownie 26/26 z dodatkową asercją blocked action), typecheck, build i diff-check przeszły. Build ostrzega o dużych chunkach. Pełny zestaw: **4030 passed, 15 failed**, w 12 plikach (376 plików, 4045 testów); te same nazwy 15 porażek co poprzednio, choć to nie dowodzi że wszystkie są jedynie nieaktualnymi testami.
- Otwarte wpisy: library **1450** (602 `CONFIRMED_BUG`, 826 `CODE_DISCREPANCY`, 22 `UNRESOLVED`); crypt **1122** (5 `CONFIRMED_BUG`, 1116 `CODE_DISCREPANCY`, 1 `UNRESOLVED`). Wpis może obejmować wiele problemów, a część historycznie potwierdzonych ustaleń bazuje na analizie statycznej; nierozstrzygnięte nie musi być błędem.

## Naprawy po audycie — drukowane tytuły osobiste

- Zgodnie z [regułami VEKN](https://www.vekn.net/rulebook/6-vampire-sects) osobiste głosy „titled” są tytułem, nie premią: importer odczytuje 41 niemerged kart. `personal1/2/3` używa tego samego pola tytułu co pozostałe, liczy głosy, spełnia ogólne warunki titled, nie podlega contestowi ani wymogowi konkretnej sekty i ustępuje miejsca nowemu tytułowi. UI pokazuje czytelny opis głosów. Przyrostowe głosy nie nadają tytułu, a wzmianka o innym wampirze i tytuł z sekcji `[MERGED]` nie są importowane jako tytuł własny.
- Testy obejmują wszystkie 41 kart i trzy strefy, rzeczywiste referendum, modyfikator `titledOnly`, zwykłe i szczególne wymagania tytułu, brak contestu, zastąpienie tytułu oraz bleed Ambrogino/Kephamos i klątwę Kashana. Nie wdrożono systemu merged ani tytułu merged Kemintiri; inne opisane zdolności 38 kart nadal są otwarte. Przegląd jest celowany.
- `FIXED_TARGETED`: Ambrogino Giovanni (200068), Kashan (200759), Kephamos (200773), dla których poprzedni wpis wymieniał tylko brak tytułu i pozostałe elementy sprawdzono. Stare opisy pozostałych 38 kart oznaczono jako historyczne względem tytułu.
- Walidacja: zestaw celowany **79/79** w 6 plikach, wcześniej **310/310** w 11 plikach i 4/4 wybrane testy wymagań tytułu; typecheck, build i diff-check przeszły. Build ostrzega o rozmiarze chunków. Poprawiono starszy test, który mylił brak nazwanego tytułu w prefiksie z brakiem jakiegokolwiek tytułu; niezależny test przypina pełną listę 41 kart.
- Ostateczny pełny zestaw na stabilnym kodzie: **4038 passed, 15 failed** w 12 plikach (377 plików, 4053 testy). Porażki mają te same nazwy co poprzednio; nie zakładamy, że wszystkie są tylko nieaktualnymi testami. Jeden wcześniejszy przebieg podczas edycji miał dodatkową porażkę wynikającą z mieszania wersji modułu i testu; powtórzono go po zakończeniu zmian.
- Otwarte wpisy: library **1450** (602 `CONFIRMED_BUG`, 826 `CODE_DISCREPANCY`, 22 `UNRESOLVED`); crypt **1119** (5 `CONFIRMED_BUG`, 1113 `CODE_DISCREPANCY`, 1 `UNRESOLVED`). To liczba kart z wpisami o otwartych statusach, nie liczba potwierdzonych defektów; `FIXED_TARGETED` nie gwarantuje pełnej zgodności.

## Naprawy po audycie — Tajdid i prywatność cech krypty

- Tajdid (101927): zamiast niepoprawnego gainPool wymaga kontrolowania gotowego Banu Haqim, a po rozwiązaniu znosi wyłącznie zakaz diablerii wynikający z Blood Curse dla tego klanu na całą grę. Cecha Blood Cursed pozostaje na wampirze, wpływ obejmuje wszystkich graczy i przyszłe wampiry oraz odczytuje aktualny klan. Stan wyjątków zapisany na poziomie gry, nie na karcie czy kontrolerze. Limit jednej karty na grę opiera się na istniejącym `CardPlayed`; anulowana karta nadal liczy się jako zagrana.
- Testy `tajdid.test.ts` obejmują rzeczywisty import, wymóg clan/ready, brak efektu przed rozwiązaniem, brak gainPool, globalność i trwałość po wyjściu gracza, serializację, inne klany i gotowość, zwykłą diablerię, Cloak of Blood, ofertę po bloku, Stealing Years, anulowanie przez Wash oraz obie sytuacje limitu. Nie wdrożono innych ograniczeń diablerii (np. Humanitas i Alastor), Amaranth ani Web of Knives Recruit; ich wpisy nadal otwarte. `FIXED_TARGETED` dotyczy Tajdid, bez deklaracji kompletności całego silnika.
- Znaleziono osobny wyciek informacji: `redactFor` zachowywał opcjonalne drukowane cechy zakrytej karty w crypt lub cudzej uncontrolled. Maskowanie teraz stosuje jawną listę pól zamiast kopiowania reszty stanu, pozostawiając liczniki uncontrolled i widoczne własne karty bez zmian. `crypt-trait-privacy.test.ts` używa prawdziwych kart z Blood Cursed, non-unique, Sterile, tytułem i Flight oraz kontroli przyszłego pola. Ta poprawka nie stanowi całościowego audytu bezpieczeństwa.
- Walidacja: 118/118 testów celowanych (12 plików), `typecheck`, build i `git diff --check` przeszły. Pełne `npm test`: 4048 passed / 15 failed (12 plików); lista nazw 15 porażek identyczna z poprzednim czystym przebiegiem, co nie dowodzi, że są nieszkodliwe. Build ostrzega o dużych chunkach. Stan audytu po regeneracji: 1449 library + 1119 crypt = 2568 otwartych wpisów, według statusów opisanych w README; rozbieżność statyczna nie jest równoznaczna z potwierdzonym błędem.

## Naprawy po audycie — drukowany Infernal

- Import samodzielnego nadruku Infernal w 24 kartach crypt (bez fragmentu `[MERGED]`), w ready, uncontrolled i crypt. Teksty, w których wampir wspomina o innym infernal minionie, nie są traktowane jako cecha własna. Test `tests/ui/crypt-infernal.test.ts` sprawdza jawny wykaz 24 identyfikatorów oraz prywatność zakrytych kart.
- Infernal minion, również ally lub wampir w torporze, nie odblokowuje się normalnie. Jego kontroler dostaje w swojej fazie unlock osobny wybór zapłaty 1 pool; po opłaceniu naliczany jest także istniejący dodatkowy koszt blood na odblokowanie. Inny zakaz normalnego odblokowania nie blokuje tej opcji. Decyzja jest opcjonalna, osobna dla każdego miniona, zachowuje się w serializacji i wygasa z fazą; obecne ograniczenie raz na fazę oparto na szablonie „during X, do Y”. Płatność ostatnim pool jest prawnie dostępna, ale bot jej unika. Źródło: https://www.vekn.net/179-rules/vtes-rulebook, https://github.com/lionel-panhaleux/vtes/blob/master/vtes_comprehensive_rules.md .
- To nie jest kompletna implementacja Infernal w całej grze: istniejące automatyczne efekty unlock są rozstrzygane przed dostępnymi opcjami, więc dowolna kolejność wszystkich efektów nie jest jeszcze zapewniona; wiele kart nadających/odbierających Infernal, filtrujących tę cechę i modyfikujących opłatę nie jest zaimplementowanych. Wszystkie 24 wpisy pozostają `CODE_DISCREPANCY`, bo mają inne niezbadane lub brakujące zdolności. W szczególności merged Valerius i efekty nadające Infernal nie zostały wdrożone. Liczba 24 to karty dotknięte wspólną poprawką, nie 24 kompletnie naprawione karty.
- Walidacja: 154/154 testów celowanych w 11 plikach, `typecheck`, `build` i `git diff --check` przeszły. Pełny zestaw: 4055 passed / 15 failed w 12 plikach; nazwy tych 15 przypadków odpowiadają wcześniejszej liście (bez trzech poprawionych wcześniej testów klanów). Nie dowodzi to, że porażki są nieszkodliwe. Build ostrzega o wielkości chunków. Otwarte wpisy: nadal 1449 library i 1119 crypt, łącznie 2568.

## Naprawy po audycie — drukowany Scarce

- Import nadruku `Scarce` z nie-merged tekstu 34 kart kryptowych obejmuje ready, uncontrolled i crypt; jawny wykaz oraz kontrole negatywne i prywatności zakrytych kart w `tests/ui/crypt-scarce.test.ts`.
- Podczas przeniesienia scarce vampire z uncontrolled do ready we własnej fazie influence jego kontroler traci 3 pool za każdego już kontrolowanego wampira tego samego klanu: liczy się także torpor i vampire bez Scarce, ale nie ally, przeciwnik ani contested/out-of-play. Reguła obowiązuje także dla istniejących ścieżek Gather i końcowej decyzji Tomb of Rameses III; poza własną influence nie jest naliczana. Wejścia kolejnych wampirów rozliczane są osobno. Kara jest konsekwencją wejścia, nie zakazem wejścia przy niskim pool; może wyeliminować kontrolera. Decyzje pokazują przewidywaną stratę, a heurystyka unika dobrowolnego samowyeliminowania, również dla Gather/Tomb.
- Test obejmuje współdziałanie z Masquerade Enforcement, kolejność naliczenia przed contestem, sumowanie za różne kontrolowane wampiry, brak kary poza fazą oraz istniejące ścieżki Gather i Tomb. Źródła zasad: https://www.vekn.net/179-rules/vtes-rulebook oraz https://www.vekn.net/general-rulings (kolejność dwóch scarce i contest). Modyfikatory Scarce i karty wymagające tej cechy (m.in. Path of Tears, Mistrust, The Stranger Among Us), wpływ zmieniających klan załączonych kart oraz wszystkie nowe źródła zmiany cechy pozostają do implementacji. Inne zdolności wszystkich 34 kart są nadal otwarte; wpisy zachowują `CODE_DISCREPANCY` i liczby otwartych kart się nie zmieniają.
- Walidacja: 136/136 testów celowanych w 11 plikach, typecheck, build i diff-check przeszły. Pełny zestaw: 4066 passed / 15 failed w 12 plikach; te same nazwy porażek co poprzednio, bez założenia, że są nieszkodliwe. Build ostrzega o wielkości chunków. Stan audytu: 1449 library (602 `CONFIRMED_BUG`, 825 `CODE_DISCREPANCY`, 22 `UNRESOLVED`) i 1119 crypt (5, 1113, 1), razem 2568 otwartych wpisów; statusy i ograniczenia zdefiniowane w README.

## Naprawy po audycie — ograniczony zakaz Celerity True Brujah

- Drukowane przed `[MERGED]` zdanie „cannot use cards requiring Celerity [cel]” importowane dla 10 kart: 200037, 200038, 200618, 200793, 200891, 200988, 201044, 201067, 201274, 201331. Przechodzi do ready, uncontrolled i crypt; testy sprawdzają prywatność, odróżnienie podmiotów i tekstu merged. Wampir wciąż może zdobyć Celerity — ograniczenie nie usuwa dyscypliny.
- W kompilatorze zwykłych trybów nie oferuje się trybu wymagającego zakazanej dyscypliny; dla alternatyw jeden dozwolony i posiadany wymóg wystarcza, dla `{all}` każdy musi być dozwolony. Także centralne `modesPlayableBy` przy `ignoreRequirements` nie ignoruje tego zakazu. W `multiDiscipline` niedozwolony rider nie trafia do istniejącego automatycznie składanego efektu. Nie zmieniono `cardRequiresDiscipline`, który odpowiada m.in. na inne pytanie (wymagania karty poza grą). Zasada wyboru efektu i przykład Illegalism: https://www.vekn.net/forum/rules-questions/78246-multi-discipline-cards-three-way-cards-requirements .
- `tests/ui/crypt-discipline-bars.test.ts`: wszystkie 10 rzeczywistych importów i zdobycie Celerity przez master, kontrola innego wampira; Flurry of Action, tryby Line Brawl i Dust Up, faktyczne zagranie Subversion przez Presence, połączony wymóg Scourge of Alecto (zapytanie o tryby), syntetyczne `{all}` i `ignoreRequirements`, oraz rider Make the Misere z kontrolą bez ograniczenia. Nie twierdzimy, że wszystkie aspekty tych kart są zgodne.
- **Pozostaje otwarte:** bespoke handlery i zdolności kart już w grze, zagrania z nietypowych stref, wymuszenie przez inne efekty, modyfikatory kosztu i rozpoznanie wybranej dyscypliny w alternatywach, dynamiczne zyskiwanie/utrata zakazu oraz zaawansowane/merged. Istniejące `multiDiscipline` automatycznie łączy ridery zamiast ogólnego wyboru podzbioru; sam test nie dowodzi kompletności tej mechaniki. Również uproszczona specyfikacja Forced March nie oddaje jej prawdziwego połączonego wymagania. Inne zdolności wszystkich 10 krypt nadal otwarte; nie zmieniono ich statusów `CODE_DISCREPANCY`.
- Walidacja: 19/19 nowego zestawu; celowany przebieg 133 passed / 1 failed (10 plików), porażka `discipline-cards.test.ts` dotyczy porównania listy wspieranych dyscyplin; `typecheck`, `build` przeszły (ostrzeżenie o wielkości chunków). Pełny zestaw: 4085 passed / 15 failed w 12 plikach przed dodaniem dodatkowej asercji w już istniejącym teście (nowy zestaw po niej 19/19). Poprzedni pełny przebieg miał 4066 passed / 15 failed, ale jego log nie był dostępny w bieżącym środowisku, więc lista błędów nie została ponownie porównana; bieżący log `/home/user/vtes-discipline-bars-tests.log`. Porażki pozostają do wyjaśnienia.

## Naprawy po audycie — Nu i Ibn Khaldun: fazowe odblokowanie

- Nu (201067) może opcjonalnie spalić 1 blood, aby się odblokować w minion phase kontrolera, Ibn Khaldun (200618) — w jego discard phase. „During X do Y” ogranicza użycie do jednego na fazę; koszt jest płacony przed unlock, efekt nie zużywa discard phase action. Samodzielna zdolność działa także w torporze, nie tylko w ready; decyduje aktualny kontroler wampira, również po zmianie kontroli. Kontrola unlocked, blood, inna faza/kontroler, torpor, serializacja i reset znacznika w następnym unlock sweep są w `tests/ui/crypt-true-brujah-unlock.test.ts`.
- Nu otrzymał opcję również w dostępnych oknach akcji oraz polling i referendum po rozstrzygnięciu. Scenariusze odgrywają unlock podczas własnego bleed (bez obejścia zakazu ponownego bleed), wykorzystanie w głosowaniu Domain Challenge oraz skutki karty The Sleeping Mind superior dla całej nierozstrzygniętej akcji. Źródła: https://www.vekn.net/rulebook (wzorzec „during X”), https://www.vekn.net/forum/rules-questions/28539-firebrand-revolutionary-council (Nu podczas akcji), https://vekn.net/?mobile-app=true&start=156&theme=false (zdolności wampira w torporze).
- To celowana, **nie pełna** implementacja: nie zweryfikowano wszystkich okien (w szczególności walki, wyboru terms i wyjątkowych ramek), interakcji tłumiących specjalne zdolności, ani kompletnej kolejności faz; obecny znacznik resetuje się w unlock sweep, a nie na każdym hipotetycznym dodatkowym wystąpieniu fazy. Gałąź obowiązkowych akcji w minion phase nie oferuje innych zdolności. Poprzednia częściowa implementacja zakazu Celerity i Scarce nadal ma udokumentowane braki; obie karty pozostają otwarte jako `PARTIAL_FIX`.
- Walidacja: 15/15 nowych testów; szerszy zestaw 115 passed / 1 failed w 9 plikach (`crypt-wave-1` oczekuje braku obsługi Nosferatu Kingdom). `typecheck`, build (ostrzeżenie o wielkości chunków) przeszły. Pełne `npm test`: **4100 passed / 15 failed w 12 plikach**. Poprzedni pełny wynik: 4085 / 15; log poprzedniego przebiegu niedostępny w tym środowisku, dlatego nie zakładamy identyczności usterek. Bieżący log `/home/user/vtes-true-brujah-unlock-tests.log`.

## Naprawy po audycie — Nehemiah: przesuwanie kart i dobieranie

- Nehemiah (201044): opcja raz na własną unlock phase, także w torporze i po zmianie kontrolera. Można wybrać kolejno jedną lub dwie karty z własnej ręki, umieszczane w wybranej kolejności na spodzie biblioteki, bez dobierania pomiędzy nimi; dopiero potem silnik dobiera do aktualnego hand size. Wybór zero kart oferowany, gdy ręka jest poniżej rozmiaru (interpretacja „up to” jako dopuszczającego zero; nie znaleziono osobnego rulingu dla tej karty). Gdy ręka jest pełna, pominięto równoważny brakowi działania wybór zero. Pustą bibliotekę można zasilić przesuniętymi kartami, które mogą zostać dobrane z powrotem. Bazowy tekst: https://rulings.krcg.org/index.html?uid=201044 .
- `tests/ui/nehemiah.test.ts` obejmuje 13 scenariuszy: kolejność, wybór 0/1/2, aktualny hand size, pustą bibliotekę i rękę, torpor, zmianę kontrolera, ograniczenia fazy, reset, serializację między wyborami i pierwsze okno przekierowania Shilmulo Tarot. Także kontrola prywatności eventu i dwóch rodzajów wyboru w projekcji `redactFor`, w tym Heart of Nizchetus; narracja `CardBuried` nie ujawnia nazw. Surowe logi stanu pozostają kompletne dla replay.
- **Nadal otwarte:** `drawUpToHandSize` zatrzymuje się na przekierowaniu do choice i nie wznawia pozostałego dobierania po odpowiedzi, zatem nie jest pełnym rozwiązaniem np. dla Shilmulo Tarot. Automatyczne efekty unlock nie mają dowolnego sekwencjonowania, brak kompletnej obsługi tłumienia zdolności i dodatkowych wystąpień fazy. Zakaz Celerity, Scarce i tytuł mają ograniczenia opisane we wcześniejszych paczkach. Ochrona w projekcji maskuje nazwę i ID eventu oraz wskazane komendy, ale identyfikatory i kolejność zakrytych kart w strefach nadal mogą umożliwiać śledzenie; surowy diagnostyczny game log zapisuje identyfikatory komend. To nie jest pełna gwarancja prywatności. Status `PARTIAL_FIX`, nie kompletna zgodność.
- Walidacja: 13/13 nowych testów (po pełnym przebiegu dodano dwa testy bez zmian kodu produkcyjnego); wcześniejszy zestaw celowany 128/128 w 10 plikach, typecheck i build przeszły (ostrzeżenie o dużych chunkach). Pełne `npm test` na tym samym kodzie produkcyjnym: **4111 passed / 15 failed** w 12 plikach; nazwy wszystkich 15 porażek identyczne z poprzednim przebiegiem Nu/Ibn, co nie dowodzi, że są nieszkodliwe. Log `/home/user/vtes-nehemiah-full.log`.
- Otwarte wpisy po regeneracji: **2568 kart** — library **1449** (602 `CONFIRMED_BUG`, 825 `CODE_DISCREPANCY`, 22 `UNRESOLVED`), crypt **1119** (5 `CONFIRMED_BUG`, 1110 `CODE_DISCREPANCY`, 3 `PARTIAL_FIX`, 1 `UNRESOLVED`). Jeden wpis może obejmować wiele problemów; rozbieżności statyczne i nierozstrzygnięte nie są równoznaczne z potwierdzonymi błędami, zaś `FIXED_TARGETED` nie dowodzi kompletnej poprawności.

## Naprawy po audycie — wznawianie dobierania do rozmiaru ręki

- `drawUpToHandSize` zapisuje kontynuację w ramce wyboru źródła, wznawia ją dopiero po faktycznym dobraniu i odczytuje aktualny hand size. Działa po serializacji; nie tworzy duplikatu przy dwukrotnym żądaniu tego samego oczekującego refill (Deal with the Devil). Ten sam mechanizm obsługuje wzrost hand size, usuwa dawny limit 20 kart, a wybór pustej biblioteki kończy bieżącą próbę bez zapętlenia. Zwykły pojedynczy replacement nie zamienia się w pełny refill.
- `tests/cards/draw-up-redirect.test.ts` (12 scenariuszy) obejmuje wielokrotny wybór Tarot, wybór biblioteki, opróżnienie i spalenie Black Market Cache, zmienny hand size, pustą bibliotekę, wielu graczy, Deal with the Devil i wybór innego gracza dla Lupine Assault; rozszerzony test Nehemiah sprawdza pełne wznowienie po save/load. Nie rozstrzygnięto przez to błędu Lupine Assault z terminem replacement. Nehemiah nadal `PARTIAL_FIX` z innych powodów.
- **Nowe otwarte ustalenie Shilmulo Tarot (101767):** przy pustej bibliotece i ręce poniżej rozmiaru gracz może korzystać z Tarot, a nie wyłącznie podczas nowej prośby o draw; potwierdzenie LSJ: https://groups.google.com/g/rec.games.trading-cards.jyhad/c/gKohsQE9iFY/m/Jwyq9QFLo6cJ . W odtworzonym oknie unlock z ready Ravnos, Tarot i kartą na nim, pustą biblioteką i niepełną ręką silnik oferuje tylko wycofanie, Edge i pass, nie dobór z Tarot. Dlatego poprzednia wąska ocena zmieniona na `PARTIAL_FIX`. Wybór pustej biblioteki zamyka bieżącą próbę, ale nie daje późniejszej niezależnej okazji skorzystania z Tarot.
- **Zakres i ryzyko:** nie przebudowano kolejkowania wielu osobnych `drawCards`/replacement ani wyboru pomiędzy wieloma źródłami przekierowania. Oczekujące refill dla tego samego gracza są obecnie łączone; semantyki wszystkich zagnieżdżonych efektów i kolejności faz nie zweryfikowano. Prywatność identyfikatorów i logów nadal wymaga pracy; ta poprawka nie potwierdza kompletności żadnej karty.
- Walidacja: 156/156 testów celowanych w 12 plikach, typecheck i build przeszły (ostrzeżenie o wielkości chunków). Pełny `npm test`: **4125 passed / 15 failed** w 12 plikach. Nazwy 15 porażek identyczne z poprzednim przebiegiem, lecz to nie dowodzi ich nieszkodliwości. Po pełnym przebiegu zmieniono wyłącznie asercje w nowym teście (nie kod produkcyjny), oba celowane pliki ponownie 25/25. Log `/home/user/vtes-draw-up-full.log`.
- Otwarte wpisy: **2569 kart** — library **1450** (602 `CONFIRMED_BUG`, 825 `CODE_DISCREPANCY`, 1 `PARTIAL_FIX`, 22 `UNRESOLVED`), crypt **1119** (5 `CONFIRMED_BUG`, 1110 `CODE_DISCREPANCY`, 3 `PARTIAL_FIX`, 1 `UNRESOLVED`). Liczba wzrosła o wykryty problem Shilmulo Tarot, nie jest liczbą potwierdzonych defektów; jeden wpis może obejmować wiele problemów, a status `FIXED_TARGETED` nie dowodzi kompletności.

## Naprawy po audycie — kilka źródeł przekierowania pojedynczego draw

- Dotychczas `drawRedirectSource` zwracał tylko pierwszą kartę, przez co kontroler jednocześnie działających Black Market Cache i Shilmulo Tarot nie miał wyboru wszystkich legalnych źródeł. Silnik wylicza teraz wszystkie aktywne źródła dla właściwego gracza, a następnie przekazuje wybrany efekt odpowiedniemu handlerowi; jego skutki, np. spalenie pustego Cache, nadal wykonuje ten handler. Jeden wybór biblioteki odrzuca obie alternatywy dla tego draw. Zachowano istniejące identyfikatory odpowiedzi i kontynuację refill w zapisie gry.
- `tests/cards/multiple-draw-redirects.test.ts`: 7 scenariuszy — wybór każdej karty jako pierwszej, zwykła biblioteka, pojedynczy replacement bez nadmiarowego draw, pełny refill, save/load, brak gotowości, brak kontroli, pusty store i zniknięcie pierwszego źródła przed decyzją. Test nie dowodzi ogólnej zgodności wszystkich efektów zmieniających kontrolę czy kolejności wielu efektów; wybór dotyczy obecnie zaimplementowanych store redirectów, nie dowolnego replacement effect.
- **Nowe ustalenie Heart of Nizchetus (100903), `CONFIRMED_BUG`:** odtworzono Heart i Tarot w unlock, ręka 1 karta, biblioteka co najmniej 2, wybór draw 2. Pierwszą decyzją jest przeniesienie karty z ręki na spód mimo zerowej liczby wykonanych draw; ramka bury znajduje się nad przekierowanymi draw. Tekst wymaga najpierw draw, potem przesunięcia tej samej liczby kart. Opcje liczby draw ograniczają się też do liczby kart w bibliotece, bez uwzględnienia możliwości store; zakres i regułę pustej biblioteki należy rozstrzygnąć przy naprawie. Dotychczasowy pozytywny test bez redirect nie obejmuje tej sytuacji.
- **Dodatkowe ograniczenie Shilmulo Tarot:** LSJ skorygował wcześniejszą odpowiedź — Alastor jedynie umieszcza equipment w grze i nie powoduje zapełnienia, w przeciwieństwie do jego zagrania/wyposażenia: https://groups.google.com/g/rec.games.trading-cards.jyhad/c/887DQTpntKI/m/uTcPGmJbHRYJ . Obecny `onEnterPlay` napełnia przy ogólnym `putPermanentInPlay`; stary `library-search.test.ts` wywołuje ten sam op i oczekuje zapełnienia, więc nie sprawdza wymaganego rozróżnienia. Otrzymanie stale dostępnej opcji draw przy pustej bibliotece pozostaje otwarte. Żadnej karty nie oznaczono jako całkowicie naprawionej.
- Walidacja: **168/168** testów celowanych w 14 plikach, typecheck i build przeszły (ostrzeżenie o dużych chunkach). Pełny zestaw: **4132 passed / 15 failed** w 12 plikach. Poprzedni log pełnego przebiegu nie był dostępny, więc same liczby nie dowodzą identyczności porażek; obecny log `/home/user/vtes-multi-redirect-full.log`.
- Otwarte wpisy: **2570 kart** — library **1451** (603 `CONFIRMED_BUG`, 825 `CODE_DISCREPANCY`, 1 `PARTIAL_FIX`, 22 `UNRESOLVED`) i crypt **1119** (5 `CONFIRMED_BUG`, 1110 `CODE_DISCREPANCY`, 3 `PARTIAL_FIX`, 1 `UNRESOLVED`). Wzrost wynika z nowego ustalenia Heart. To liczba kart z otwartymi wpisami, nie wszystkich błędów; część wpisów pochodzi z analizy statycznej, a celowana poprawka nie dowodzi pełnej zgodności.

## Naprawy po audycie — Heart of Nizchetus i liczony draw

- Heart (100903): liczony ciąg dodatkowych draw kończy się przed wyborem kart na spód. Przekierowanie zawiesza dokładnie jeden draw, kontynuacja i liczba faktycznie dobranych kart zapisane są w ramce choice; po jej odpowiedzi silnik wznawia sekwencję, a dopiero na koniec pyta o tyle kart, ile rzeczywiście dobrano. Jeżeli wybrano pustą bibliotekę i nic nie dobrano, bieżąca próba kończy się bez zapętlonego pytania. To ograniczona implementacja oparta na wyborze liczby z góry; brak odrębnego rulingu potwierdzającego wszystkie warianty wyboru „up to”.
- Liczba opcji uwzględnia karty w aktualnie dostępnych store, a wspólna funkcja wyznacza źródła zarówno przy ofertach, jak i przy samym draw. `tests/cards/heart-draw-redirect.test.ts`: 7 scenariuszy z Tarot i Cache, wielokrotnymi draw, wyborem świeżo dobranych kart, pustą biblioteką, faktyczną liczbą kart, save/load i kontrolami dostępności. `cheap-tail.test.ts` dalej testuje zachowanie bez przekierowania.
- Heart pozostaje **`PARTIAL_FIX`**: zwykły `drawCards` i inne wielokrotne replacement wciąż nie korzystają z nowej kontynuacji; nie zweryfikowano wszystkich dodatkowych faz, źródeł i kolejności. `CardInstance` nie przechowuje właściciela obcej karty w ręce, więc nie zaimplementowano interakcji z Agaitas; według LSJ karta zabrana z biblioteki prey po wyborze przez Heart trafia na spód biblioteki swojego właściciela: https://rec.games.trading-cards.jyhad.narkive.com/dFdRazeL/lsj-heart-of-nizchetus-agaitas . Sam Agaitas ma wciąż pusty handler. Prywatność identyfikatorów i stała możliwość draw z Tarot po opróżnieniu biblioteki pozostają otwarte.
- Walidacja: **175/175** celowanych w 15 plikach, typecheck i build przeszły (ostrzeżenie o dużych chunkach). Pełny `npm test`: **4139 passed / 15 failed** w 12 plikach; nazwy 15 porażek są identyczne z poprzednim przebiegiem, co nie dowodzi ich nieszkodliwości. Log `/home/user/vtes-heart-redirect-full.log`.
- Otwarte wpisy: **2570 kart** — library **1451** (602 `CONFIRMED_BUG`, 825 `CODE_DISCREPANCY`, 2 `PARTIAL_FIX`, 22 `UNRESOLVED`) i crypt **1119** (5 `CONFIRMED_BUG`, 1110 `CODE_DISCREPANCY`, 3 `PARTIAL_FIX`, 1 `UNRESOLVED`). Jeden wpis może obejmować wiele problemów; rozbieżności statyczne i nierozstrzygnięte nie są równoznaczne z potwierdzonym błędem.

## Naprawy po audycie — Black Hand i Seraph

- **64 karty crypt** mają teraz importowany nadruk Black Hand, w tym **10** z nadrukiem Seraph. Dwa nadruki `Black Hand Seraph` rozpoznawane są jako dwie niezależne cechy. Parser pomija tekst `[MERGED]` i wzmianki o innych wampirach. Cechy przechodzą do ready, uncontrolled i crypt, ale dynamiczne nadawanie/utrata oraz pełne zasady merged nie są implementowane.
- **26 kart library** otrzymało warunek zagrania: 23 przez kwalifikację zagrywającego wampira oraz trzy mastery przez kwalifikację kontrolowanego ready wampira. Warunki Black Hand i Seraph nie są utożsamiane. Wśród tych kart **Watch Commander** poprawiono też warunek directed i sprawdzono efekt +1 intercept, w tym rush skierowany na miniona oraz kontrole negatywne. Wspólny warunek directed nie wymaga już, żeby cel był zapisany jako Methuselah, a nie minion.
- **22 wpisy zmieniono na `FIXED_TARGETED`: 21 prostych crypt bez dodatkowej treści i Watch Commander.** To naprawy wykrytych problemów, a nie certyfikat kompletnej zgodności. Pozostałe **25 kart library** ma tylko poprawiony wymóg; ich własne efekty/ograniczenia w większości nadal są błędne. Inne z 64 krypt mają dalsze otwarte zdolności. Tych kart nie doliczono do 22. Shakar: the Hunt i inne karty używające tych cech pozostają otwarte; same flagi nie realizują całej mechaniki Black Hand.
- Testy `black-hand-traits.test.ts`: **38/38** (pełna lista importu, niezależność cech, kontrole negatywne, działanie różnych typów kart i directed block). Szerszy wcześniejszy przebieg 10 plików: **120 passed / 1 failed**; jedyny błąd to istniejący test `granted-action-requirements.test.ts` zakładający brak Skaald. Typecheck i build przechodzą; build ostrzega o dużych chunkach. Pełny test, przed dodaniem 4 kolejnych asercji scenariuszowych, **4173 passed / 15 failed**; nazwy porażek są identyczne z poprzednim pełnym przebiegiem. Logi `/home/user/vtes-blackhand-{target-final,wide,typecheck,build,full}.log`.
- Otwarte wpisy: **2548 kart** — library **1450** (602 `CONFIRMED_BUG`, 824 `CODE_DISCREPANCY`, 2 `PARTIAL_FIX`, 22 `UNRESOLVED`) oraz crypt **1098** (5 `CONFIRMED_BUG`, 1089 `CODE_DISCREPANCY`, 3 `PARTIAL_FIX`, 1 `UNRESOLVED`). To liczba kart ze wskazanymi statusami, nie wszystkich błędnych kart; statyczna rozbieżność i nierozstrzygnięcie nie są równoważne potwierdzonemu błędowi. Jeden wpis może obejmować wiele problemów.

## Naprawy po audycie — statystyki crypt i kredyty walki (104 karty)

- Dla **104 kart crypt** wdrożono brakujące, nadrukowane i bezwarunkowe statystyki własne lub opcjonalne kredyty walki: 48 klauzul bleed, 32 strength, 4 stealth, 6 intercept, 16 press oraz 5 maneuver. Liczby klauzul nakładają się na kartach. Wykorzystano istniejące self-entry i mechaniki silnika, bez ponownego dodawania już zaimplementowanych wartości; wampiry advanced dotyczą wyłącznie wersji niemerged. Dwóch imbued pominięto, ponieważ importer nadal błędnie traktuje imbued jak wampiry.
- **Rurik Rakoczy:** poprawiono też błędny stały bleed na +1 tylko wtedy, gdy Ludmijla jest ready, niezależnie od jej kontrolera, i dodano opcjonalny press. **Fidus:** +1 stealth wyłącznie dla undirected, nie dla wszystkich akcji, oraz -1 strength; slave pozostaje otwarty. **Gabriel:** usunięto nieuprawniony stały strength; płatna zdolność nadal otwarta. **Jacob Fermor:** usunięto błędne +1 bleed dla siebie, podczas gdy bonus dla werewolves pozostaje otwarty.
- **13 wpisów `FIXED_TARGETED`:** Adrianne, Aidan Lyle, Appolonius, Charles Delmare, Julian Sanders, Khurshid, Lazverinus, Muse, Matata, Nehsi, Silvia Giovanni, Tammy Walenski, Rurik Rakoczy. Tylko znane i sprawdzone klauzule oznaczono jako naprawione; to nie certyfikat zgodności wszystkich interakcji. **91 pozostałych kart `PARTIAL_FIX`** nadal ma inne znane lub statycznie wskazane problemy, a ich wcześniejszy opis zachowano jako historyczny.
- `tests/cards/crypt-printed-statics-audit.test.ts`: **163/163**, w tym indywidualne sprawdzenie wszystkich 104 kart w trzech strefach, rzeczywisty bleed/stealth/intercept, **32** walki z hand strike i obrażeniami, **21** rozpoczęć walki z kredytami, przykładowe użycie obu rodzajów kredytów i kontrole negatywne Fidus/Gabriel/Jacob/Rurik. Testy nie sprawdzają wszystkich pozostałych zdolności tych kart ani interakcji merged.
- Rozszerzony przebieg 12 plików: **387 passed / 1 failed** (stary test zakładający brak Nosferatu Kingdom). Typecheck i build przechodzą; build ostrzega o wielkości chunków. Pełny zestaw: **4340 passed / 15 failed** w 12 plikach; nazwy porażek identyczne z poprzednim pełnym przebiegiem, co nie dowodzi ich nieszkodliwości. Logi `/home/user/vtes-crypt-flat-{target,wide,type,build,full}.log`.
- Otwarte wpisy: **2535 kart** — library **1450** (602 `CONFIRMED_BUG`, 824 `CODE_DISCREPANCY`, 2 `PARTIAL_FIX`, 22 `UNRESOLVED`) i crypt **1085** (5 `CONFIRMED_BUG`, 985 `CODE_DISCREPANCY`, 94 `PARTIAL_FIX`, 1 `UNRESOLVED`). Są to karty ze wskazanymi statusami, nie liczba wszystkich błędów; nierozstrzygnięta i historyczna analiza statyczna nie oznacza potwierdzenia scenariuszem.

## Naprawy po audycie — warunkowe statystyki crypt (104 karty)

- Poprawiono **105 klauzul w 104 kartach**: 26 bleed, 31 stealth, 24 intercept i 24 strength; 34 błędnie bezwarunkowe premie/penalty przestały działać stale. Zachowano inne statystyki, w tym wcześniej poprawione flat traits i kredyty walki; Rebekka otrzymała także drukowane stałe +1 stealth. Advanced dotyczą tylko tekstu przed `[MERGED]`.
- Warunki dotyczą rodzaju/typu akcji, klanu, sekty, tytułu, wieku i pochodnej capacity działającego lub przeciwnika w walce, gotowych minionów kontrolowanych przez cel, braku takich minionów, Edge lub wskazanego wampira. Gotowe locked miniony liczą się, torpor nie; kilka pasujących minionów nie zwielokrotnia pojedynczego bonusu. Aktualny cel jest odczytywany po redirect, również przez `currentStealth` i `currentBleed`; `prospectiveBleed` używa planowanego celu. Pozostałe wartości karty nie są nadpisywane.
- **63 wpisy `FIXED_TARGETED`, 41 `PARTIAL_FIX`**. Druga grupa zachowuje inne znane problemy: m.in. merged, brakujące działania/zdolności, magaji i circle. Przy Joaquina sprawdzono equip kartą z ręki; equip z innego miniona nie zostało objęte. `FIXED_TARGETED` oznacza naprawę wykrytych klauzul w testowanym zakresie, nie dowód kompletności wszystkich interakcji.
- **Ograniczenie wielu celów:** model akcji przechowuje jeden docelowy seat, więc nie wdrożono tu prawidłowej oceny akcji skierowanych do wielu Methuselahów. Kestrelle, Rain i Sarah pozostają `PARTIAL_FIX`; w przypadku Kestrelle, według dyskusji z przywołanym RTR, wystarczy jeden kwalifikujący się cel, aby akcja otrzymała jeden bonus: https://www.vekn.net/forum/rules-questions/71325-kestrelle-hayes-and-multiple-targets?start=6 . Testy pojedynczego celu nie obejmują tego przypadku. Nie potwierdzono wszystkich sposobów wykonywania recruit/employ/equip bez zagrania odpowiedniej karty.
- `tests/cards/crypt-conditional-wave.test.ts`: **174/174**. Każda klauzula ma pozytywny i negatywny odczyt na akcji/walce, ale część rodzajów akcji jest w tych parametrycznych testach symulowana zmianą metadanych ogłoszenia; dodatkowe scenariusze faktycznie zagrywają equipment, ally i political action, wykonują **24 pary walk z hand strike**, a także rzeczywisty Deflection i sprawdzają staty po redirect. Sprawdzono trzy strefy krypt, usunięte bezwarunkowe premie, ready/torpor, wiele minionów i zmienną capacity. Inne zdolności nie są tym pokryte.
- Szerszy zestaw: **495/495** w 10 plikach. `typecheck` i `build` przeszły (build ostrzega o rozmiarze chunków). Pełne `npm test`: **4514 passed / 15 failed** w 12 plikach. Poprzedni pełny przebieg miał 4340 passed / 15 failed, lecz jego log w tym środowisku nie był dostępny, więc sama liczba nie potwierdza identyczności porażek. Obecny log `/home/user/vtes-conditional-full.log`.
- Otwarte wpisy: **2472 kart** — library **1450** (602 `CONFIRMED_BUG`, 824 `CODE_DISCREPANCY`, 2 `PARTIAL_FIX`, 22 `UNRESOLVED`) oraz crypt **1022** (5 `CONFIRMED_BUG`, 890 `CODE_DISCREPANCY`, 126 `PARTIAL_FIX`, 1 `UNRESOLVED`). Są to karty z otwartym wpisem, nie liczba wszystkich błędów. Statyczna rozbieżność i nierozstrzygnięcie nie są potwierdzeniem scenariuszem.

## Naprawy po audycie — ikony klanów na kartach minion (191 kart)

- Z 296 obsługiwanych kart niemasterowych z ikoną, 103 miały już właściwe wymagania, a Tainted Vitae własny handler egzekwujący klan. W pozostałych **191 kartach** dodano wymaganie drukowanej ikony do kompilowanej specyfikacji: musi ją spełniać **zagrywający wampir**, nie dowolny inny kontrolowany wampir. Kilka nadrukowanych ikon to alternatywy; Assamite korzysta z wewnętrznej nazwy Banu Haqim, a antitribu pozostają odrębnymi klanami. Mastery zachowują osobny mechanizm ready kontrolowanego wampira. Istniejące jawne wymaganie klanu jest przecinane z ikonami; przy pustym przecięciu budowa rejestru zgłasza błąd zamiast niewłaściwie raportować brak wymagania do kalkulacji kosztu.
- Koszt kart zagrywanych z ręki dzięki innej karcie oraz deterministycznego wyszukiwania equipment uwzględnia teraz klanowe wymaganie przy obliczaniu modyfikatorów. Testy Piper z Abyssal Hunter i Vast Wealth z Blood Shield sprawdzają zgodność wymogu, cenę po doliczeniu klanowego podatku, niedostateczne pool i faktyczny efekt po rozwiązaniu. Mechanizm `ignoreRequirements` nadal świadomie pomija wymóg w przypadkach, które go nakazują. Efekty innych kart nie są przez to automatycznie naprawione.
- `tests/cards/library-clan-icons.test.ts` zawiera jawny wykaz 191 kart i osobne testy wszystkich handlerów (właściwy i obcy klan, ally, zignorowane wymagania); scenariusze rzeczywiste obejmują action, ally, equipment, retainer, political action, combat, reaction, modifier, alternatywne ikony i drugiego wampira. Poprawiono też trzy starsze scenariusze, które grały kartami nieuprawnionych klanów. Ten zestaw nie dowodzi zgodności pozostałych zdolności kart, a nie wszystkie specjalne ścieżki i bespoke handlery zostały przebadane scenariuszowo.
- **188 wpisów pozostaje `PARTIAL_FIX`**, ponieważ istnieją inne znane lub statycznie wskazane rozbieżności; wcześniejsze ustalenia są historyczne i nieaktualne w części dotyczącej brakującej ikony. Trzy wcześniejsze `REVIEWED_NO_ISSUE_FOUND` stały się `FIXED_TARGETED` po wykryciu i naprawie pominiętego wymogu: Innocent Bystander, Uncontrolled Impulse i Walk through Arcadia. To nie certyfikat pełnej zgodności żadnej karty.
- **Poza zakresem:** Living Wood Staff ma ikonę Avenger, która jest creed Imbued, nie klanem — wykluczono ją z gate klanowego; creed i poprawne typowanie Imbued pozostają niezaimplementowane. Kwestia specjalnych allies grających „as a vampire” oraz wszystkich możliwych efektów zmieniających typ/klan wymaga osobnej weryfikacji; testowana jest zwykła odmowa dla ally. Nie naprawiono innych reguł wyszukiwania, ani wszystkich efektów samych 191 kart.
- Walidacja: **318/318** testów w 9 plikach, `typecheck` i build przeszły (ostrzeżenie build o rozmiarze chunków); `git diff --check` czysty. Pełny zestaw przed dodaniem jednego scenariusza Vast Wealth oraz zabezpieczenia i testu pustego przecięcia: **4720 passed / 15 failed** w 12 plikach; nazwy wszystkich 15 porażek są identyczne z poprzednim pełnym przebiegiem. Samo podobieństwo nazw nie dowodzi, że porażki są nieszkodliwe. Logi `/home/user/vtes-clan-icons-{wide-final,type-final,build,full}.log`.
- Otwarte wpisy: **2472 kart** — library **1450** (526 `CONFIRMED_BUG`, 712 `CODE_DISCREPANCY`, 190 `PARTIAL_FIX`, 22 `UNRESOLVED`) i crypt **1022** (5 `CONFIRMED_BUG`, 890 `CODE_DISCREPANCY`, 126 `PARTIAL_FIX`, 1 `UNRESOLVED`). To karty z otwartym wpisem, nie liczba wszystkich błędów; częściowe poprawki i ustalenia statyczne nie oznaczają pełnej weryfikacji.

## Naprawy po audycie — drukowana unikalność i wyszukiwanie equipment (253 karty)

- Dla **253 kart library**, których efektywny handler nie zgłaszał drukowanej unikalności, dodano `isUnique` oraz obsługę w odpowiednim kompilatorze albo overlay. Są to **219** kart z bezwarunkowym nadrukiem na początku tekstu oraz **34** dodatkowe, osobno sprawdzone karty z nadrukiem po wstępnej klauzuli lub opisie location. Nadrukowana unikalność jest przekazywana do istniejących zasad własnych duplikatów, kontestowania i zapytań innych kart. Część handlerów bespoke już wcześniej sprawdzała własną kopię, ale nie zgłaszała `isUnique`, przez co np. istniejące kopie nie kontestowały się prawidłowo. To **253 poprawione cechy**, nie 253 w pełni naprawione karty.
- Nie stosuje się prostego wyszukiwania każdego słowa „unique”: wyłączone są wzmianki o innych kartach i tytułach, ograniczenia per minion oraz unikalność wynikająca tylko z jednego trybu. Fanfare for Elysium i Spirit Claws, gdzie Unique dotyczy efektu konkretnego trybu, pozostają do osobnej implementacji; sama metadana karty nie wystarcza. Również wiele pozostałych klauzul nowo oznaczonych kart to nadal placeholdery, m.in. efekty i wymagania nieobjęte tą paczką.
- Magic of the Smith nie oferuje już kontrolowanej własnej kopii Unique, uwzględnia wymagany klan i wybrany tryb przy kalkulacji kosztu. Vast Wealth rozpatruje pierwszy sprzęt, nie pierwszy spełniający wymagania; gdy pierwszy nie spełnia sprawdzonych wymagań lub jego wejście wymusiłoby self-contest, trafia do ash heap bez kosztu i dalszy sprzęt nie jest wybierany. Źródła: https://www.vekn.net/forum/rules-questions/79883-enkidu-vast-wealth oraz zasady Unique w https://www.vekn.net/rulebook . Kontrola pierwszej karty nie obejmuje jeszcze wszystkich możliwych ograniczeń equip ani pełnej obsługi kosztu, a istniejąca ścieżka nie oferuje osobnego wyboru nic nie znaleźć.
- **Wykryte, ale nienaprawione:** źródła https://www.vekn.net/forum/rules-questions/79511-vidal-jarbeaux i https://www.vekn.net/forum/rules-questions/82962-meditative-grove-vs-rotschreck wskazują różnicę między sprzętem z Vast Wealth/Concealed Weapon/Magic of the Smith a zwykłym zagraniem. Obecny `playCardFromHand` emituje `CardPlayed` i uruchamia mechanizm replacement także w przypadkach wyekwipowania przez inną kartę. Wpisy Vast Wealth i Magic of the Smith są `PARTIAL_FIX`, Concealed Weapon ma `CODE_DISCREPANCY`, a analogiczne Angel's Gift i Contraband `UNRESOLVED` do potwierdzenia. Nie poprawiono jeszcze tych konsekwencji ani wszystkich sposobów wyposażania z innych stref.
- `tests/cards/printed-unique-cards.test.ts`: **260/260**, w tym jawny snapshot i weryfikacja metadanych 253 kart, negatywne przykłady, rzeczywiste wejście i zakaz własnej kopii equipment, ally i retainera, contest sprzętu i bespoke Alamut, późniejszy nadruk Ankara Citadel. Testy wyszukiwania sprawdzają pierwszą niekwalifikującą się kartę, ash heap, koszt, kontest oraz wykluczenie Sword of Nuln z Black Market Cache. Jeden stary test Bruisers używał dwóch kopii Alamut u różnych graczy, które prawidłowo teraz kontestują; zmieniono drugą lokację na inną.
- Statusy 253 kart: **241 `PARTIAL_FIX`, 9 `FIXED_TARGETED`, 3 nadal `UNRESOLVED`**. Historyczne ustalenia pozostają w pliku z aktualizacją: tylko brak metadanych/obsługi unikalności objęto poprawką. Dziewięć wcześniej uznanych za bez wykrytej niezgodności miało przegląd ograniczony; celowana naprawa nie oznacza sprawdzenia wszystkich interakcji.
- Walidacja: **631/631** w 11 plikach, `typecheck`, `build` i `git diff --check` przeszły; build nadal ostrzega o dużych chunkach. Pełny zestaw: **4986 passed / 15 failed** w 12 plikach. Nazwy 15 porażek są takie same jak w poprzednim pełnym przebiegu; nie dowodzi to ich nieszkodliwości. Logi `/home/user/vtes-printed-unique-{wide-final,type-final,build,full-final}.log`.
- Otwarte wpisy: **2477 kart** — library **1455** (448 `CONFIRMED_BUG`, 595 `CODE_DISCREPANCY`, 388 `PARTIAL_FIX`, 24 `UNRESOLVED`) i crypt **1022** (5 `CONFIRMED_BUG`, 890 `CODE_DISCREPANCY`, 126 `PARTIAL_FIX`, 1 `UNRESOLVED`). Wzrost o 5 wynika z nowo udokumentowanych kwestii wyszukiwania/equip, nie jest liczbą wszystkich błędów. Statyczne i nierozstrzygnięte ustalenia nie są równoważne potwierdzeniu scenariuszem.

## Naprawy po audycie — drukowane podtypy zasobów (132 karty)

- Przeniesiono nadrukowane podtypy do kompilowanych handlerów i kart wchodzących do gry: **70 ally oraz 24 retainery** bez odpowiedniego tagu, **37 equipment** bez tagów weapon/melee/gun/vehicle oraz usunięto błędny `mortal` z **Amam the Devourer**, który jest mummy. To **132 karty z poprawioną cechą**, nie 132 kompletne implementacje. Lista i dokładne zmiany w `tests/cards/fixtures/printed-subtype-tags.json`; zachowywane są inne tagi i właściwości kart.
- Źródłem są linie statystyk ally/retainerów i początkowe linie typu equipment w rejestrze; nie wyciąga się typu z samej nazwy ani ze wzmianki o innej karcie. Pięć kart z nadrukiem jedynie „Ally/Retainer with … life” nie dostaje sztucznego podtypu. W rejestrze każdy ze 168 wskazanych nadrukowanych podtypów ally/retainerów zgłasza teraz właściwy tag; nie oznacza to implementacji wszystkich skutków bycia danym typem.
- Scapelli otrzymał także brakujące drukowane 3 life, 0 strength i 1 bleed; wcześniej `allyEntry` rzucał błąd przy rekrutacji. Jego strike, press i inne niezweryfikowane klauzule nadal są otwarte. Testy sprawdzają rzeczywistą rekrutację, a nie tylko obecność metadanych.
- `tests/cards/printed-subtypes.test.ts`: **139/139**. Każdy z 132 wpisów ma sprawdzony handler, a dla ally i retainera także wynik `allyEntry`/`permanentEntry`; scenariusze pokazują Fleshforge Chamber dla ghoul ally/retainera, Biothaumaturgic Experiment z pominięciem wymogu klanu i późniejsze przeniesienie zwierzęcia przez Luciano, Scapelli, premię Ashur-uballita dla zrekrutowanego Reanimated Corpse, limit vehicle po założeniu Ambulance oraz Angel's Gift z Dagger. Oddzielny scenariusz Powder of Rigidity sprawdza Werewolf Pack w walce. Tylko te wybrane interakcje odtworzono w grze.
- Sam tag weapon nie implementuje profilu ani strike. Aby nie uznać braku danych o damage/aggravated za bezpieczne zero, Concealed Weapon zachowawczo nie oferuje broni bez profilu, jeżeli musi sprawdzić te ograniczenia. To może też tymczasowo wykluczyć legalną broń, np. Dagger; profile i pełne efekty tych kart wymagają dalszej pracy. Pozostają także m.in. dynamiczna zmiana podtypu, stany zapisane przed dodaniem tagów i specjalne ścieżki wyposażania. Wcześniej udokumentowane problemy `CardPlayed`/replacement przy equip przez inną kartę nadal są otwarte.
- Wszystkie 132 wpisy pozostają **`PARTIAL_FIX`**: 87 już miało ten status, a 26 `CODE_DISCREPANCY` i 19 `CONFIRMED_BUG` otrzymało częściową poprawkę. Poprzednie ustalenia pozostawiono jako historyczne, z aktualizacją konkretnego podtypu; nie założono, że inne efekty są poprawne.
- Naprawiono też kruchy `card-audit.test.ts`: zamiast wymagać historycznego statusu Blood Turnip w aktualnym audycie, używa jawnej fixture ustaleń i nadal sprawdza generowanie wszystkich statusów oraz pustego audytu. Pierwszy pełny przebieg wykrył ten przestarzały test; końcowy już go zaliczył.
- Walidacja: **824/824** w 14 plikach, `typecheck`, `build` i `git diff --check` przeszły; build ostrzega o dużych chunkach. Pełny zestaw: **5126 passed / 15 failed** w 12 plikach; nazwy 15 porażek identyczne z poprzednim pełnym przebiegiem, co nie oznacza, że są nieszkodliwe. Logi `/home/user/vtes-subtypes-{wide-final,type-final,build,full-final}.log`.
- Otwarte wpisy: **2477 kart** — library **1455** (429 `CONFIRMED_BUG`, 569 `CODE_DISCREPANCY`, 433 `PARTIAL_FIX`, 24 `UNRESOLVED`) oraz crypt **1022** (5 `CONFIRMED_BUG`, 890 `CODE_DISCREPANCY`, 126 `PARTIAL_FIX`, 1 `UNRESOLVED`). Jest to liczba kart z otwartym wpisem, nie wszystkich błędów; statyczne i nierozstrzygnięte ustalenia nie są potwierdzeniem scenariuszem.

## Naprawy po audycie — wymagania wampira Sabbatu (12 kart)

- Dodano jawne wymaganie wampira Sabbatu do 11 kart action/political action i modifiera Notorious Brutality. W tej ostatniej poprawiono również próg capacity na 8 lub więcej. Kompilatory sprawdzają wymagania działającego miniona, a `requiresSects` udostępnia je innym mechanizmom. Nie zmieniono masterów, których wymaganie dotyczy kontrolującego, ani pozostałych kart i sekt. To poprawka konkretnych warunków, **nie pełnych kart**.
- `tests/cards/printed-sabbat-requirements.test.ts`: 24 testy sprawdzają każdy tekst, metadane i dopuszczalne tryby; 11 kart sprawdzono w rzeczywistym wyborze akcji dla obu sekt, Notorious Brutality w oknie po próbie bloku dla dwóch wartości capacity i dwóch sekt. Notorious Brutality wciąż ma błędny timing i efekt: jego test dotyczy tylko warunków w aktualnym oknie, nie dowodzi legalności tego okna według tekstu. Pozostałe karty nadal mają m.in. placeholdery, brak celów i inne niezgodności; wszystkie 12 to `PARTIAL_FIX`.
- Wstępny skan tekstów czterech sekt wskazał 197 trafień, po tej paczce 79 potencjalnych braków. Liczba zawiera fałszywe trafienia i alternatywy, np. Anarch Manifesto, No Confidence oraz Mozambique Allure, więc nie jest liczbą potwierdzonych błędów i nie należy jej automatycznie przepisywać na `requiresSect`. Szczególnej analizy wymagają Grey Thorne i Vivienne Géroux, mogący grać określone karty „jako Anarch vampire”, a nie mający po prostu sekty anarch; nie objęto ich tą paczką. Lokalny skan to `/home/user/sect-requirements-after.jsonl`.
- Walidacja: **638/638** testów w 5 plikach, typecheck, build i `git diff --check` przeszły; build ostrzega o dużych chunkach. Pełny zestaw: **5150 passed / 15 failed** w 12 plikach, z identycznymi nazwami 15 porażek jak w poprzedniej paczce (nie dowodzi to ich nieszkodliwości). Logi `/home/user/sabbat-{wide,type,build,full}.log`.
- Otwarte wpisy po regeneracji: **2477 kart** — library **1455** (424 `CONFIRMED_BUG`, 562 `CODE_DISCREPANCY`, 445 `PARTIAL_FIX`, 24 `UNRESOLVED`) i crypt **1022** (5 `CONFIRMED_BUG`, 890 `CODE_DISCREPANCY`, 126 `PARTIAL_FIX`, 1 `UNRESOLVED`). Status opisuje stan udokumentowanych ustaleń, nie pełną liczbę błędów.

## Naprawy po audycie — wymagania Laibon dla działań i zasobów (18 kart)

- Jawnie dodano wymóg Laibon dla 18 kart: action, political action, equipment i retainer. Overseer ma dodatkowo próg capacity powyżej 4. Wymóg dotyczy aktora, nie samego kontrolowania Laibon; po zmianie sekty działającego wampira wybór jest ponownie obliczany. Kompilatory przekazują też wymaganie do `requiresSects`. Lista kart w `tests/cards/printed-laibon-requirements.test.ts`.
- To **częściowa naprawa warunków**, nie pozostałych efektów, celów czy kosztów kart. Np. Ilomba i Swarm nadal nie obsługują drukowanego wyboru innego nosiciela oraz dalszych skutków, zaś Overseer nie przyznaje tytułu. Pozytywna opcja w aktualnym placeholderze dowodzi wyłącznie działania gate, nie pełnej legalności akcji. 18 wpisów to `PARTIAL_FIX`: 9 już miało ten status, 5 wcześniej `CODE_DISCREPANCY`, 4 `CONFIRMED_BUG`.
- **44 testy** sprawdzają metadane, miniona właściwej i niewłaściwej sekty oraz sojusznika, działające opcje dla każdej z kart, zmiany sekty i torpor na przedstawicielach czterech typów, oraz próg Overseer. Scenariusz Magic of the Smith sprawdza, że Kerrie w bibliotece jest oferowana Laibonowi, ale nie Camarilli; Biothaumaturgic Experiment może zatrudnić Elephant Guardian ignorując wymaganie. Nie sprawdzono wszystkich specjalnych ścieżek dołączania i wyposażania ani pełnych efektów tych kart.
- Nie dodano fałszywego wymogu samego Laibon do Mozambique Allure: tekst dopuszcza także nietytułowanego wampira. Alternatywa nie jest jeszcze w pełni zaimplementowana — statycznie nie widać ograniczenia tytułu dla nie-Laibon, a inne efekty również pozostają otwarte. Pozostałe kandydatury, w tym karty z Aye/Orun i różnymi oknami, wymagają osobnej analizy; po tej paczce naiwny skan nadal daje **61 potencjalnych** braków, łącznie z fałszywymi trafieniami, nie 61 potwierdzonych błędów.
- Walidacja: **731/731** testów w 8 plikach, typecheck, build i `git diff --check` przeszły; build nadal ostrzega o dużych chunkach. Pełny zestaw: **5194 passed / 15 failed** w 12 plikach; nazwy 15 porażek są identyczne z poprzednim przebiegiem, co nie dowodzi ich nieszkodliwości. Logi `/home/user/laibon-{wide,type,build,full}.log`.
- Po regeneracji audytu **2477 kart z otwartym wpisem**: library **1455** (420 `CONFIRMED_BUG`, 557 `CODE_DISCREPANCY`, 454 `PARTIAL_FIX`, 24 `UNRESOLVED`) i crypt **1022** (5 `CONFIRMED_BUG`, 890 `CODE_DISCREPANCY`, 126 `PARTIAL_FIX`, 1 `UNRESOLVED`). Rozbieżność statyczna nie oznacza potwierdzenia scenariuszem; liczba wpisów nie jest liczbą wszystkich błędów.

## Naprawy po audycie — alternatywne wymaganie i okna Laibon (8 kart)

- Mozambique Allure: zamiast błędnie wymagać samej sekty, wspólny gate dopuszcza **Laibon lub nietytułowanego wampira**; zatytułowany nie-Laibon oraz ally nie przechodzą. Warunek jest dynamiczny. Oddzielnie kompilator action nie oferuje gałęzi Laibon, gdy crypt kontrolera jest pusty; gałąź nietytułowanego nie-Laibon nie wymaga cryptu. Ruling [LSJ 20070411-2]/[RTR 20000501] przytoczono w https://vtes.cardsrealm.com/pt-pt/card/mozambique-allure . Zapytanie `modesPlayableBy` nie ma stanu gry i nie ocenia pustego cryptu; ten warunek sprawdza enumerator zwykłych akcji.
- W alternatywie nie wpisano `requiresSect: ["laibon"]`, bo ograniczyłoby to poprawną gałąź nietytułowanego wampira. `requiresSects` dotąd opisuje wymaganie bezwarunkowe i nie wyraża tej alternatywy; dokładna interpretacja zapytań o karty „requiring a Laibon” wymaga osobnego rozstrzygnięcia. Model nie zawiera tytułów magaji/kholo, a importer nie rozpoznaje drukowanego magaji; dlatego testy używają reprezentowanego `personal2`, a nie dowodzą obsługi tych rzeczywistych tytułów. Sama akcja nadal ma placeholder: nie dobiera cryptu, nie zmienia sekty ani nie odblokowuje właściwych klanów. Nowe kontrole nie oznaczają pełnej poprawności.
- Dodano warunek grającego Laibon dla siedmiu kart combat, reaction i modifier; Those Who Endure Judge otrzymał również próg capacity powyżej 4. Dwa nadruki wymagające **ready** sprawdzają torpor i stan przejścia do torpor, również przez `modesPlayableBy`. Ancestor's Insight ma nadal błędne tryby i efekty; dla niego test obejmuje metadane i zapytanie o tryby, nie rzeczywistą poprawną reakcję lub modifier. Reszta także zachowuje inne błędy, w tym timing i placeholdery. Osiem kart ma `PARTIAL_FIX` (wcześniej 3 `CONFIRMED_BUG`, 5 `CODE_DISCREPANCY`).
- `tests/cards/laibon-window-requirements.test.ts`: **23 testy** obejmują metadane, scenariusze obecnych okien combat/reaction/modifier dla sześciu kart, próg capacity oraz macierz alternatywy, zmianę sekty/tytułu, torpor i pusty crypt. Pozytywna opcja dla pozostałych placeholderów nie potwierdza ich drukowanego timingu ani efektu. Weryfikacja wymogu ready dla Ancestor's Insight/Terra Incognita obejmuje również stan `torporPending` i locked. Aye/Orun oraz inne dodatkowe warunki nie są implementowane w tej paczce.
- Walidacja: **165/165** testów w 10 plikach, typecheck, build i `git diff --check` przeszły; build ostrzega o dużych chunkach. Pełny zestaw **5217 passed / 15 failed** w 12 plikach, nazwy 15 porażek takie same jak poprzednio, co nie dowodzi ich nieszkodliwości. Logi `/home/user/laibon-windows-{wide,type,build,full}.log`.
- Po regeneracji audytu **2477 kart z otwartym wpisem**: library **1455** (417 `CONFIRMED_BUG`, 552 `CODE_DISCREPANCY`, 462 `PARTIAL_FIX`, 24 `UNRESOLVED`) i crypt **1022** (5 `CONFIRMED_BUG`, 890 `CODE_DISCREPANCY`, 126 `PARTIAL_FIX`, 1 `UNRESOLVED`). Naiwny skan sekt wykazuje 54 potencjalne trafienia, ale nadal zgłasza Mozambique Allure, ponieważ nie rozumie alternatywy, oraz inne fałszywe dopasowania. Liczby nie dowodzą pełnej poprawności ani nie są liczbą wszystkich błędów.

## Naprawy po audycie — częściowe Aye/Orun i wymagania (8 kart)

- Aye i Orun nie dają już błędnie 1 pool. Są trifle i trafiają na wskazanego Laibon — również w torpor i kontrolowanego przez innego Methuselah; master pozostaje kontrolowany i posiadany przez gracza, który go zagrał. Limit refundu pierwszego trifle w fazie obsługuje istniejący silnik. Testy potwierdzają również brak oferty bez celu i zachowanie właściciela karty.
- Dodano wspólny warunek liczby nazwanych kart na **grającym** minionie i zastosowano go wraz z wymaganiem Laibon do Dusk Work, High Aye, High Orun, Neebi, Supernatural Resistance i Unholy Radiance. Liczą się także karty zablokowane i położone przez innych graczy. Głosowanie liczy 1 głos za każdą pełną grupę trzech Orun na Laibon, na bieżąco; nie sumuje wielokrotnie tekstu każdej kopii. To nie jest implementacja pozostałych efektów tych sześciu kart.
- **Istotne otwarte luki:** nie zaimplementowano limitu Aye+Orun względem capacity i wyboru spalenia jednej karty przy przekroczeniu, więc nadmiar może pozostać i wpływać na liczbę kart/głosów. Ruling o jednej karcie: https://groups.google.com/g/rec.games.trading-cards.jyhad/c/LpFSLRuWONA/m/Ma_3LtLeyCAJ . Brak także anulowania Frenzy i wake z Aye, obowiązkowego spalenia po wskazanych zdarzeniach oraz pozornej capacity Orun dla cudzych non-Orun kart (która nie zwiększa rzeczywistej capacity ani limitu krwi: https://www.vekn.net/forum/rules-questions/44177-orun ). Timing, tryby i dalsze efekty sześciu zależnych kart pozostają placeholderami. Zmiany są częściowe, a nie dowodem pełnej grywalności; wszystkie 8 wpisów ma `PARTIAL_FIX` (poprzednio 4 `CONFIRMED_BUG`, 4 `CODE_DISCREPANCY`).
- `tests/cards/aye-orun-partial.test.ts`: **16 testów** sprawdza celowanie, trifle, kontrolę i własność, dwa trifle w fazie, progi dwóch i trzech kart przy mieszanych typach/owner/lock, faktyczne dołożenie trzeciego Aye, aktualne okna modifier i combat oraz głosy dla 2/3/5/6 Orun i zmianę po spaleniu cudzej karty. Dodatnie scenariusze placeholderów dowodzą tylko sprawdzonej części; inne wymogi nie są przez nie potwierdzone.
- Walidacja: **365/365** testów w 10 plikach, typecheck, build i `git diff --check` przeszły; build ostrzega o dużych chunkach. Pełny zestaw **5233 passed / 15 failed** w 12 plikach. Po restarcie brakowało poprzedniego logu, więc 12 plików z porażkami uruchomiono dodatkowo na archiwalnej kopii poprzedniego HEAD: te same 15 nazw porażek; nie dowodzi to ich nieszkodliwości. Logi `/home/user/aye-{wide,type,build,full,baseline}.log`. `npm ci` odtworzył brakujące zależności i zgłosił 9 podatności; nie wykonywano automatycznego `audit fix`.
- Otwarte wpisy po regeneracji: **2477 kart** — library **1455** (413 `CONFIRMED_BUG`, 548 `CODE_DISCREPANCY`, 470 `PARTIAL_FIX`, 24 `UNRESOLVED`) i crypt **1022** (5 `CONFIRMED_BUG`, 890 `CODE_DISCREPANCY`, 126 `PARTIAL_FIX`, 1 `UNRESOLVED`). Status i liczba kart nie oznaczają pełnego audytu wszystkich możliwych błędów.

## Naprawy po audycie — striki i Shadow Play (8 kart)

- Naprawiono wcześniej wskazane rozbieżności: **Dead Hand** (+1 hand i na superior filtr prevent Fortitude), **Shadow Parasite** (3R/4R tylko na long), **Taste of Death** (1R/2R aggravated tylko na long), **Torment the Soul** (1R normal/aggravated po pierwszej rundzie), **Starvation of Marena** (2R/3R i opcjonalny press), **Tongue of the Serpent** (close strike steal 1/2 blood lub life), **Form of the Cobra** (close zamiast ranged steal) i **Shadow Play** (+1/+2 stealth). Dodano wybór close-only dla prymitywu steal, zachowując dotychczasowy domyślny ranged. Tongue i Cobra można zadeklarować na long, ale ich strike tam nie dosięga. Doprecyzowano również close strike dla wariantu ser **Donnybrook**, który już miał ogólną blokadę zagrania przy long i status `FIXED_TARGETED`.
- Wspólną obsługę steal przeniesiono za sprawdzenie dodge: kradzież jest efektem strike, który unik może zatrzymać, chociaż nie jest damage i nie podlega zapobieganiu obrażeniom. Dotyczy też istniejących ranged steal, np. Theft of Vitae. Reguły: https://www.vekn.net/rulebook . Nie jest to pełny przegląd wszystkich innych interakcji mechanizmu strike i kart z kradzieżą.
- `tests/cards/audit-strike-repairs.test.ts`: **25 testów** obejmuje oba tryby i trafienia, ograniczenia zasięgu/rundy, koszt, wymaganie superior, Fortitude i inny prevent, możliwość wykorzystania press, kradzież life i limit capacity, unik przeciw Tongue i Theft, Cobra na obu dystansach oraz stealth po próbie bloku. Nie przetestowano wszystkich możliwych interakcji; `FIXED_TARGETED` zamyka jedynie opisane wcześniejsze ustalenia, nie dowodzi pełnej zgodności kart. Osiem wpisów zmieniło status na `FIXED_TARGETED` (1 poprzednio `CONFIRMED_BUG`, 7 `CODE_DISCREPANCY`); nie ukryto żadnego częściowo poprawionego wpisu.
- Walidacja: **160/160** testów w 12 plikach, typecheck, build i `git diff --check` przeszły; build ostrzega o dużych chunkach. Pełny zestaw: **5258 passed / 15 failed** w 12 plikach; nazwy 15 porażek identyczne z poprzednią iteracją, co nie dowodzi ich nieszkodliwości. Logi `/home/user/strike-{wide,type,build,full,audit}.log`.
- Po regeneracji **2469 kart z otwartym wpisem**, o 8 mniej: library **1447** (412 `CONFIRMED_BUG`, 541 `CODE_DISCREPANCY`, 470 `PARTIAL_FIX`, 24 `UNRESOLVED`) i crypt **1022** (5 `CONFIRMED_BUG`, 890 `CODE_DISCREPANCY`, 126 `PARTIAL_FIX`, 1 `UNRESOLVED`). Karty z `PARTIAL_FIX` pozostają na liście, a liczba wpisów nie jest liczbą wszystkich możliwych błędów.

## Naprawy po audycie — strength, czas i Veil the Legions (4 karty)

- **Veil the Legions:** usunięto sztuczny limit X=3. Oferowane są wszystkie wartości od 0 do liczby krwi pozostałej po uwzględnieniu modyfikowanego kosztu zagrania; test obejmuje X=6 oraz koszt dodatkowy 2 blood. Dotychczasowy test sprawdza także późniejsze akcje i limit kopii. **Shadow Strike:** zamiast maneuver+press bez strike ma strength ranged z opcjonalnym maneuver na obu poziomach i press na superior. Strike oparty na ranged strength nie jest hand strike: poprawiono wspólną klasyfikację (również Earthshock) i blokadę przy hand-strikes-only, także dla deklaracji w oknie range. Te dwa wcześniejsze ustalenia zamknięto jako `FIXED_TARGETED`; nie jest to dowód wszystkich interakcji, np. celowania ranged strike w retainery.
- **Seduction** ma teraz `onlyAsAnnounced`, więc nie jest oferowana podczas próby bloku. Jednak ogólny `onlyAsAnnounced` traktuje każde ponowne wejście w stan A jak ogłoszenie; w osobnym scenariuszu po nieudanym bloku i Shadow Play ponownie zaoferował Seduction (`/home/user/shadow-window-diagnostic.log`). Wybór działającego wampira na superior jest wykluczany mimo braku takiego ograniczenia w tekście i wymaga rozstrzygnięcia. Własny inny wampir może być wskazany nawet jeśli nie może blokować: https://groups.google.com/g/rec.games.trading-cards.jyhad/c/ZrlebBiQQHk . **Serenading the Kami:** dodano wymóg vampire, oba poziomy +1/+2 strength i `onlyAsAnnounced`; bonus jest rzeczywiście stosowany w walce po bloku. Nadal nie obejmuje walki po udanym, niezablokowanym rushu ani innych ewentualnych zastosowań strength podczas całej akcji; dzieli lukę okna ogłoszenia. Obie karty pozostają `PARTIAL_FIX`, a nie znikają z licznika.
- `tests/cards/audit-action-and-shadow.test.ts`: **12 testów** sprawdza X i zmieniony koszt, czas względem próby bloku, rzeczywisty damage w walce po bloku, oba tryby Shadow Strike, deklarację w range i strike, zasięg, flagę hand, ograniczenie hand-strikes-only i wspólną ścieżkę Earthshock. Przedział ogłoszenia po nieudanym bloku zbadano osobno jako znaną niezgodność, nie jako przechodzący test poprawności.
- Walidacja: **156/156** testów w 13 plikach, typecheck, build i `git diff --check` przeszły; build ostrzega o dużych chunkach. Pełny zestaw przed dodaniem ostatniego testu regresyjnego Earthshock: **5269 passed / 15 failed** w 12 plikach, te same nazwy porażek co w poprzedniej iteracji; nie dowodzi to ich nieszkodliwości. Logi `/home/user/shadow-{wide,type,build,full,audit}.log`.
- Po regeneracji **2467 kart z otwartym wpisem**, o 2 mniej: library **1445** (412 `CONFIRMED_BUG`, 537 `CODE_DISCREPANCY`, 472 `PARTIAL_FIX`, 24 `UNRESOLVED`) i crypt **1022** (5 `CONFIRMED_BUG`, 890 `CODE_DISCREPANCY`, 126 `PARTIAL_FIX`, 1 `UNRESOLVED`). `PARTIAL_FIX` pozostaje otwarty; statusy i licznik nie są kompletną miarą wszystkich błędów.

## Naprawy po audycie — Hecata (otwarte ustalenia klanu)

- W rejestrze jest 18 kart Hecata; na początku tej paczki jedyny otwarty wpis dotyczył **Huldu, The Desecrator (G6), 201757**. Warunek `requiresReady` dla jej `preventForOther` uniemożliwia użycie z torporu i podczas przechodzenia do torporu, ale nie wyklucza locked-ready. Warunek jest opcjonalny: **Opikun**, którego tekst nie wymaga ready, zachowuje możliwość użycia z torporu (ruling: https://groups.google.com/g/rec.games.trading-cards.jyhad/c/rUyNDsUPDnI). Dodatkowo dla obu kart sprawdzany jest udział celu w danym combat: nie wystarczy, że inny własny minion ma oczekujące obrażenia.
- `tests/cards/hecata-huldu-audit.test.ts`: **13 testów** obejmuje import cech i +1 bleed, locked/unlocked ready, torpor i torporPending, brak blood, koszt i zapobieganie 1 damage, ograniczenie once/combat, innego własnego miniona i ally, aggravated, cel po obu stronach combat, innych graczy i bystandera oraz regresję Opikun z torporu i jego ograniczeń. Część kontroli celu i rodzaju obrażeń używa zmienionego w teście stanu otwartego okna; nie jest to pełny test każdej ścieżki gry.
- Wpis Huldu zmieniono na `FIXED_TARGETED`. Pozostałych 17 kart miało wcześniej `REVIEWED_NO_ISSUE_FOUND` po przeglądach o zakresie opisanym w ich evidence; nie przeprowadzono tu ponownego wyczerpującego audytu tych kart. Po regeneracji **0 otwartych wpisów Hecata**, co nie gwarantuje braku innych błędów w klanie. Wszystkich otwartych wpisów jest **2466**: library **1445**, crypt **1021**.
- Walidacja: Huldu **13/13**; w szerszym zestawie **345 passed / 1 failed** (znany test Keegana w `granted-action-requirements.test.ts`); typecheck, build i `git diff --check` przeszły. Pełny zestaw **5283 passed / 15 failed**, 12 plików — te same nazwy 15 porażek co przed tą paczką, w innej kolejności; nie dowodzi to braku regresji w nieobjętych scenariuszach. Build ostrzega o dużych chunkach. Logi `/home/user/hecata-{target,wide,type,build,full,audit}.log`.
