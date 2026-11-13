# Naprawy po audycie — grupowanie i kolejność prac

Wpis audytu nie musi oznaczać jednego błędu: jedna karta może mieć wiele braków, a wspólny silnik może dotyczyć kart z różnych paczek. [Wstępna kategoryzacja per karta](open-issue-categories.md) i CSV powstają automatycznie ze słów w evidence. Są tylko mapą kandydatów, nie dowodem wspólnej przyczyny ani prognozą liczby naprawionych kart.

## Rozpoznane grupy i priorytety

1. **Podstawowe cechy krypty / import:** utracone cechy takie jak Infernal, Scarce, slave i Black Hand. Trzeba osobno zdefiniować każdą cechę, jej źródła, cykl życia i skutki oraz sprawdzić tekst, żeby nie rozpoznać wzmianki o innym minionie jako cechy samej karty. Samo zapisanie flagi nie implementuje zasad. Naprawiono import `non-unique` dla pięciu kart oraz `Sterile` dla 42 kart; obecne akcje tworzenia wampirów z `requiresNonSterile` respektują flagę. Nie obejmuje to efektów zmieniających sterile w grze ani innych niezaimplementowanych akcji. Import drukowanego Flight dla 26 kart oraz odczyt jawnych grantów również naprawiono; nie wdrożono jeszcze wszystkich kart nadających Flight. Drukowane Blood cursed importowane dla 50 kart; istniejące ścieżki diablerii respektują zakaz. Tajdid znosi wpływ klątwy na diablerię Banu Haqim; nie obejmuje to innych niewdrożonych źródeł ani pozostałych ograniczeń diablerii. Drukowany niemerged Infernal jest importowany dla 24 krypt, a silnik oferuje opłacane odblokowanie w fazie unlock. Nie zaimplementowano wielu źródeł zmiany tej cechy, kart wymagających Infernal ani wszystkich interakcji z ich opłatą i kolejnością efektów. Drukowany niemerged Scarce jest importowany dla 34 krypt, z karą przy przeniesieniu z uncontrolled podczas influence (w tym istniejącymi ścieżkami Gather/Tomb); nie wdrożono kart filtrujących lub modyfikujących Scarce ani wszystkich interakcji z kartami i zmianami klanu. Pozostałe zdolności tych kart pozostają otwarte.
2. **Silnik akcji i ograniczeń bloku:** powtarzające się warunki rodzaju blokującego, koszt, stealth/intercept, granty akcji i uprawnienia. Naprawiono wspólny rodzaj filtra trwałej opłaty blockToll dla Archon, Camarilla Exemplary i Sabbat Priest. Osobne braki tych kart nie zostały przez to automatycznie naprawione.
3. **Efekty polityczne i sekwencjonowanie:** wspólne wybory terms, głosy, kolejność wypłat i strat. Naprawiono kolejność dwóch faz Can't Take it with You i uzupełniono listę klanów z aktualnej krypty dla Consanguineous Boon i Condemnation; creed imbued są jawnie wykluczone. Import 41 niemerged tytułów osobistych przywraca status titled i liczbę głosów; tytuł merged Kemintiri i inne niewdrożone zdolności wampirów pozostają otwarte. Pokrycia klanów spoza rejestru nie ustalono, a rejestr nadal nie ma osobnego typu crypt dla imbued.
4. **Walka:** czas zagrywania i koszt, strike/additional strikes, press, zapobieganie obrażeniom i trwanie efektów. [additional-strike-followups.md](../additional-strike-followups.md) opisuje znane otwarte problemy. Zmiany w jądrze trzeba sprawdzać również na kartach przeciwnika i przy wielu rundach.
5. **Koszty, strefy i trwałe efekty:** ograniczenia celów, kontroler/właściciel, lokacje, ekwipunek, ash heap, hand size, koszty i efekty z kart w grze. Warunkowe premie hand size poprawiono dla czterech wampirów (pozostałe braki ich tekstów są otwarte). Nie należy bez kontroli uruchamiać wszystkich płaskich statystyk hand size na minionach: część istniejących specyfikacji zapisuje je niezgodnie z warunkami nadruku.
6. **Braki indywidualne / placeholdery:** wiele wpisów opisuje pustą specyfikację lub prosty efekt w miejscu złożonego tekstu. Niektóre da się łączyć w nowe prymitywy, lecz sam wspólny silnik nie uzupełni wszystkich wymogów, wyborów i wyjątków kart.

## Zasady aktualizacji statusu

Zmieniać status po sprawdzeniu konkretnej karty, nie hurtowo po wspólnym refaktorze. `FIXED_TARGETED` oznacza naprawę wskazanego problemu, nie dowód kompletności. Wpis pozostaje otwarty, jeśli inne opisane rozbieżności pozostały. Testy regresyjne powinny sprawdzać poprawne zachowanie oraz kontrole negatywne; wcześniejsze testy charakteryzujące błędy trzeba zastępować, a nie utrwalać wadliwe wyniki.

Historia przeglądów w `batch-11-manual-*.md` oraz starszych paczkach opisuje stan z czasu audytu; bieżące statusy i dowody są w `manual-findings.json` i generowanym inwentarzu.

## Zakaz Celerity True Brujah — częściowy zakres

Drukowany niemerged zakaz w 10 kryptach jest importowany i uwzględniony przy wyborze trybów kart kompilowanych ze specyfikacji; szczegóły i ograniczenia w `batches.md`. Priorytetem dalszej pracy pozostaje egzekwowanie **używania** już znajdujących się w grze kart, bespoke handlerów i niestandardowych źródeł zagrania, z rzeczywistym wyborem dyscyplin w kartach wielodyscyplinowych. Nie zastępować tego globalnym filtrem wszystkich nadrukowanych dyscyplin: legalne są efekty przez inne dyscypliny.

## Nu i Ibn Khaldun — fazowe odblokowanie

Zaimplementowano i przetestowano ich opcjonalne odblokowanie za blood w bieżących oknach fazowych, akcji i głosowania (szczegóły i ograniczenia w `batches.md`). Pozostała obsługa wszystkich okien, w tym wpływu innych ograniczeń oraz używania Celerity ze źródeł i przez handlery nieobjęte poprzednią poprawką.

## Nehemiah — kontynuacja po przekierowaniu dobierania i prywatność

Przesuwanie do dwóch kart i zwykłe dobieranie wdrożono celowo; szczegóły w `batches.md`. Wspólny mechanizm dobierania do hand size wymaga wznawialnej kontynuacji po wyborze przekierowania (m.in. Shilmulo Tarot), z testami wielu kart, pustej biblioteki, innych źródeł draw i save/load. Osobno należy sprawdzić prywatność identyfikatorów i kolejności kart w maskowanych strefach oraz surowych logów; maskowanie pojedynczych eventów i komend nie zamyka tego problemu. Nehemiah pozostaje `PARTIAL_FIX`.

## Kontynuacja dobierania — stan po poprawce

`drawUpToHandSize` oraz refill przy wzroście hand size wznawiają się po wyborze źródła; testy i pozostałe ograniczenia w `batches.md`. Dalsza praca: ciągła opcja Shilmulo Tarot przy pustej bibliotece i niepełnej ręce (LSJ), kolejka wielu osobnych dobierań, kolejność wielu możliwych źródeł i współdziałanie z odroczonymi replacement (w tym Lupine Assault). Odseparować te problemy od samego pojedynczego replacement; nie oznaczać kart kompletnością po naprawie wspólnego refill.

## Kilka źródeł redirect — kolejny etap

Wybór pomiędzy dostępnymi store przy pojedynczym draw i podczas refill poprawiono; szczegóły oraz scenariusze w `batches.md`. Priorytet: sekwencyjna, wznawialna kolejka liczonych draw i ich następnych efektów (Heart: najpierw wszystkie rzeczywiste draw, potem tyle samo kart na spód; dobór z store oraz pusta biblioteka), inne ścieżki wielu replacement, możliwość ciągłego wyboru Tarot przy pustej bibliotece oraz rozróżnienie zagrania/wyposażenia od samego umieszczenia Tarot w grze. Nie usuwać zależnych ramek ani nie zakładać, że asynchroniczny choice kończy się natychmiast.
