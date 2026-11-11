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
