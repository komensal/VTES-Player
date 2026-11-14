# Wstępna kategoryzacja otwartych ustaleń

Zakres: **2467** wpisów o statusie CODE_DISCREPANCY, CONFIRMED_BUG, UNRESOLVED lub PARTIAL_FIX. Jeden wpis dotyczy karty, niekoniecznie jednego błędu.

To powtarzalne, zgrubne grupowanie po słowach w tekście evidence, a nie potwierdzone wspólne przyczyny. Kategoria może dotyczyć tylko części wpisu, również już poprawionej. Kategorie nakładają się — nie sumować liczników. Brak słowa nie dowodzi braku problemu. Przed zmianą każdą grupę należy zbadać w kodzie i testach.

| Obszar do dalszej analizy | Kandydatów |
|---|---:|
| `crypt_import_lub_cechy` | 562 |
| `placeholder_lub_brak_efektu` | 1944 |
| `akcje_i_blok` | 1652 |
| `walka` | 747 |
| `polityka_i_glosy` | 359 |
| `koszty_i_zasoby` | 872 |
| `karty_i_strefy` | 1571 |
| `czas_i_warunki` | 723 |
| `inne_do_recznego_przegladu` | 6 |

Wykaz per karta: `open-issue-categories.csv`; dowody i ograniczenia: `manual-findings.json`. Regeneracja: `python3 scripts/categorize-card-audit.py`.
