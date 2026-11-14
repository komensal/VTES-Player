#!/usr/bin/env python3
"""Group open audit findings by evidence keywords, not by proven root cause.

Run from the repository root: python3 scripts/categorize-card-audit.py
Categories overlap; every row is a candidate for manual investigation.
"""
import csv
import json
import re
from collections import Counter
from pathlib import Path

root = Path('docs/card-audit')
findings = json.loads((root / 'manual-findings.json').read_text(encoding='utf-8'))
registry = json.loads(Path('src/cards/registry.json').read_text(encoding='utf-8'))['entries']
open_status = {'CODE_DISCREPANCY', 'CONFIRMED_BUG', 'UNRESOLVED', 'PARTIAL_FIX'}
# Intentionally broad topics; a keyword may refer to already-correct behavior
# or only one of multiple issues. These are not claims of shared root causes.
patterns = [
    ('crypt_import_lub_cechy', r'import|makeVampire|parser|non.unique|scarce|infernal|slave|sterile|flight|blood cursed|magaji|seraph|black hand'),
    ('placeholder_lub_brak_efektu', r'pust[ayąe]|brak handlera|zamiast|tylko stealth|jedynie stealth|tylko gainpool'),
    ('akcje_i_blok', r'action|akcj|block|blok|stealth|intercept|rush|bleed'),
    ('walka', r'combat|walk[aię]|strike|damage|obraż|press|maneuver|preven|frenzy'),
    ('polityka_i_glosy', r'referend|politic|polity|\bvot\w*|głos|ballot|wybór klanu|title|tytuł'),
    ('koszty_i_zasoby', r'koszt|cost|blood|\bpool\b|\blife\b|krew|krwi|krwaw|zapl[aą]t'),
    ('karty_i_strefy', r'ash heap|crypt|library|\bhand\b|ręk[aię]|talia|bibliotek|discard|burn|spale|attach|dołącz|permanent|location|sprzęt|equipment|retainer|ally'),
    ('czas_i_warunki', r'timing|kolejnoś|\bonce\b|limit|\bturn\b|\bphase\b|faz[ayieę]|gotow|\bready\b|warun'),
]
rows = []
counts = Counter()
for f in sorted(findings, key=lambda x: x['id']):
    if f['status'] not in open_status:
        continue
    text = f['evidence']
    groups = [name for name, pattern in patterns if re.search(pattern, text, re.IGNORECASE)]
    if not groups:
        groups = ['inne_do_recznego_przegladu']
    counts.update(groups)
    rows.append({'id': f['id'], 'name': f['name'], 'kind': registry[str(f['id'])]['card']['kind'],
                 'status': f['status'], 'categories': '; '.join(groups)})

with (root / 'open-issue-categories.csv').open('w', newline='', encoding='utf-8') as out:
    writer = csv.DictWriter(out, fieldnames=['id', 'name', 'kind', 'status', 'categories'], lineterminator='\n')
    writer.writeheader()
    writer.writerows(rows)

lines = [
    '# Wstępna kategoryzacja otwartych ustaleń', '',
    f'Zakres: **{len(rows)}** wpisów o statusie CODE_DISCREPANCY, CONFIRMED_BUG, UNRESOLVED lub PARTIAL_FIX. Jeden wpis dotyczy karty, niekoniecznie jednego błędu.', '',
    'To powtarzalne, zgrubne grupowanie po słowach w tekście evidence, a nie potwierdzone wspólne przyczyny. Kategoria może dotyczyć tylko części wpisu, również już poprawionej. Kategorie nakładają się — nie sumować liczników. Brak słowa nie dowodzi braku problemu. Przed zmianą każdą grupę należy zbadać w kodzie i testach.', '',
    '| Obszar do dalszej analizy | Kandydatów |', '|---|---:|',
]
for name, _ in patterns:
    lines.append(f'| `{name}` | {counts[name]} |')
lines.append(f'| `inne_do_recznego_przegladu` | {counts["inne_do_recznego_przegladu"]} |')
lines += ['', 'Wykaz per karta: `open-issue-categories.csv`; dowody i ograniczenia: `manual-findings.json`. Regeneracja: `python3 scripts/categorize-card-audit.py`.', '']
(root / 'open-issue-categories.md').write_text('\n'.join(lines), encoding='utf-8')
print(f'{len(rows)} open findings categorized')
for key, count in counts.most_common():
    print(f'{key}: {count}')
