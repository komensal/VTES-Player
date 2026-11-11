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
