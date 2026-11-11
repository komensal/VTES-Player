# Naprawy po audycie — grupowanie i kolejność prac

Wpis audytu nie musi oznaczać jednego błędu: jedna karta może mieć wiele braków, a wspólny silnik może dotyczyć kart z różnych paczek. [Wstępna kategoryzacja per karta](open-issue-categories.md) i CSV powstają automatycznie ze słów w evidence. Są tylko mapą kandydatów, nie dowodem wspólnej przyczyny ani prognozą liczby naprawionych kart.

## Rozpoznane grupy i priorytety

1. **Podstawowe cechy krypty / import:** utracone cechy takie jak Infernal, Scarce, slave, Black Hand i Blood cursed. Trzeba osobno zdefiniować każdą cechę, jej źródła, cykl życia i skutki oraz sprawdzić tekst, żeby nie rozpoznać wzmianki o innym minionie jako cechy samej karty. Samo zapisanie flagi nie implementuje zasad. Naprawiono import `non-unique` dla pięciu kart oraz `Sterile` dla 42 kart; obecne akcje tworzenia wampirów z `requiresNonSterile` respektują flagę. Nie obejmuje to efektów zmieniających sterile w grze ani innych niezaimplementowanych akcji. Import drukowanego Flight dla 26 kart oraz odczyt jawnych grantów również naprawiono; nie wdrożono jeszcze wszystkich kart nadających Flight. Pozostałe zdolności większości tych kart pozostają otwarte.
2. **Silnik akcji i ograniczeń bloku:** powtarzające się warunki rodzaju blokującego, koszt, stealth/intercept, granty akcji i uprawnienia. Naprawiono wspólny rodzaj filtra trwałej opłaty blockToll dla Archon, Camarilla Exemplary i Sabbat Priest. Osobne braki tych kart nie zostały przez to automatycznie naprawione.
3. **Efekty polityczne i sekwencjonowanie:** wspólne wybory terms, głosy, kolejność wypłat i strat. Naprawiono kolejność dwóch faz Can't Take it with You i uzupełniono listę klanów z aktualnej krypty dla Consanguineous Boon i Condemnation; creed imbued są jawnie wykluczone. Pokrycia klanów spoza rejestru nie ustalono, a rejestr nadal nie ma osobnego typu crypt dla imbued.
4. **Walka:** czas zagrywania i koszt, strike/additional strikes, press, zapobieganie obrażeniom i trwanie efektów. [additional-strike-followups.md](../additional-strike-followups.md) opisuje znane otwarte problemy. Zmiany w jądrze trzeba sprawdzać również na kartach przeciwnika i przy wielu rundach.
5. **Koszty, strefy i trwałe efekty:** ograniczenia celów, kontroler/właściciel, lokacje, ekwipunek, ash heap, hand size, koszty i efekty z kart w grze. Warunkowe premie hand size poprawiono dla czterech wampirów (pozostałe braki ich tekstów są otwarte). Nie należy bez kontroli uruchamiać wszystkich płaskich statystyk hand size na minionach: część istniejących specyfikacji zapisuje je niezgodnie z warunkami nadruku.
6. **Braki indywidualne / placeholdery:** wiele wpisów opisuje pustą specyfikację lub prosty efekt w miejscu złożonego tekstu. Niektóre da się łączyć w nowe prymitywy, lecz sam wspólny silnik nie uzupełni wszystkich wymogów, wyborów i wyjątków kart.

## Zasady aktualizacji statusu

Zmieniać status po sprawdzeniu konkretnej karty, nie hurtowo po wspólnym refaktorze. `FIXED_TARGETED` oznacza naprawę wskazanego problemu, nie dowód kompletności. Wpis pozostaje otwarty, jeśli inne opisane rozbieżności pozostały. Testy regresyjne powinny sprawdzać poprawne zachowanie oraz kontrole negatywne; wcześniejsze testy charakteryzujące błędy trzeba zastępować, a nie utrwalać wadliwe wyniki.

Historia przeglądów w `batch-11-manual-*.md` oraz starszych paczkach opisuje stan z czasu audytu; bieżące statusy i dowody są w `manual-findings.json` i generowanym inwentarzu.
