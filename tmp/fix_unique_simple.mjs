import fs from 'fs';

const findings = JSON.parse(fs.readFileSync('docs/card-audit/manual-findings.json', 'utf-8'));
const targetIds = new Set(findings.filter(f => f.status === 'PARTIAL_FIX').map(f => f.id));

const regText = fs.readFileSync('src/cards/registry.json', 'utf-8');
const reg = JSON.parse(regText);
const entries = reg.entries || reg;

// Zbierz pierwsze 100 PARTIAL_FIX kart z "unique" w drukowanym tekście
const cardsNeedingUnique = new Set();
let count = 0;
for (const id of targetIds) {
  const e = entries[id];
  const c = e ? (e.card || e) : null;
  if (c && c.cardText && /unique/i.test(c.cardText)) {
    cardsNeedingUnique.add(id);
    count++;
    if (count >= 100) break;
  }
}
console.log('Cards needing unique (target):', cardsNeedingUnique.size);

// Przetwórz cards.ts liniowo
const lines = fs.readFileSync('src/cards/effects/cards.ts', 'utf-8').split('\n');
const newLines = [];
let currentId = null;
let blockLines = [];
let modifiedCount = 0;
const modifiedIds = [];

function flushBlock() {
  if (currentId === null || blockLines.length === 0) return;
  
  if (cardsNeedingUnique.has(currentId)) {
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
          cardsNeedingUnique.delete(currentId);
        } else {
          console.log('No cost line found for', currentId);
        }
      } else {
        console.log('No usable line found for', currentId);
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

// Aktualizuj findingi dla zmodyfikowanych kart
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
console.log('Cards still needing unique:', cardsNeedingUnique.size);
if (cardsNeedingUnique.size > 0) {
  console.log('Remaining:', [...cardsNeedingUnique].join(', '));
}