import fs from 'fs';

const findings = JSON.parse(fs.readFileSync('docs/card-audit/manual-findings.json', 'utf-8'));
const regText = fs.readFileSync('src/cards/registry.json', 'utf-8');
const reg = JSON.parse(regText);
const entries = reg.entries || reg;

// Znajdź wszystkie PARTIAL_FIX karty z "unique" w drukowanym tekście ale bez unique: true w spec
const cardsToFix = new Set();
for (const f of findings) {
  if (f.status !== 'PARTIAL_FIX') continue;
  const e = entries[f.id];
  const c = e ? (e.card || e) : null;
  if (c && c.cardText && /unique/i.test(c.cardText)) {
    cardsToFix.add(f.id);
  }
}
console.log('Cards to fix:', cardsToFix.size);

// Przetwórz cards.ts liniowo
const lines = fs.readFileSync('src/cards/effects/cards.ts', 'utf-8').split('\n');
const newLines = [];
let currentId = null;
let blockLines = [];
let modifiedCount = 0;
const modifiedIds = [];

function flushBlock() {
  if (currentId === null || blockLines.length === 0) return;

  if (cardsToFix.has(currentId)) {
    const blockText = blockLines.join('\n');
    const hasUniqueTrue = blockText.includes('unique: true');

    if (!hasUniqueTrue) {
      const usableIdx = blockLines.findIndex(l => l.trim() === 'usable: [],');
      if (usableIdx >= 0) {
        let lastCostIdx = -1;
        for (let j = usableIdx - 1; j >= 0; j--) {
          if (/^\s*(bloodCost|poolCost): [0-9]+,/.test(blockLines[j])) {
            lastCostIdx = j;
            break;
          }
        }
        if (lastCostIdx >= 0) {
          blockLines.splice(lastCostIdx + 1, 0, '    unique: true,');
          modifiedCount++;
          modifiedIds.push(currentId);
        } else {
          console.log('No cost line for card', currentId);
        }
      } else {
        console.log('No usable line for card', currentId);
      }
    }
  }

  newLines.push(...blockLines);
  blockLines = [];
}

for (const line of lines) {
  const idMatch = line.match(/^\s*krcgId: (\d+),/);
  if (idMatch) {
    flushBlock();
    currentId = parseInt(idMatch[1]);
    blockLines = [line];
  } else {
    blockLines.push(line);
  }
}
flushBlock();

fs.writeFileSync('src/cards/effects/cards.ts', newLines.join('\n'));

// Aktualizuj findingi tylko dla faktycznie zmodyfikowanych kart
for (const id of modifiedIds) {
  const idx = findings.findIndex(x => x.id === id);
  if (idx >= 0 && findings[idx].status === 'PARTIAL_FIX') {
    findings[idx].status = 'FIXED_TARGETED';
    findings[idx].evidence = 'Naprawiono: dodano unique: true do spec zgodnie z drukowanym "Unique" w tekście karty.';
  }
}
fs.writeFileSync('docs/card-audit/manual-findings.json', JSON.stringify(findings, null, 2) + '\n');

console.log('Successfully modified:', modifiedCount);
console.log('Modified IDs:', modifiedIds.join(', '));
const stillMissing = cardsToFix.size - modifiedCount;
console.log('Still missing unique: true:', stillMissing);