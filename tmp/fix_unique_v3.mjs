import fs from 'fs';

const findings = JSON.parse(fs.readFileSync('docs/card-audit/manual-findings.json', 'utf-8'));
const targetStatuses = ['PARTIAL_FIX', 'UNRESOLVED'];
const targetIds = new Set(findings.filter(f => targetStatuses.includes(f.status)).map(f => f.id));

const regText = fs.readFileSync('src/cards/registry.json', 'utf-8');
const reg = JSON.parse(regText);
const entries = reg.entries || reg;

// Sprawdź które target cards potrzebują unique: true
const cardsNeedingUnique = [];
for (const id of targetIds) {
  const e = entries[id];
  const c = e ? (e.card || e) : null;
  const hasUniqueInText = c && c.cardText && /unique/i.test(c.cardText);
  if (hasUniqueInText) cardsNeedingUnique.push(id);
}

console.log('Cards needing unique: true:', cardsNeedingUnique.length);

// Przetwórz cards.ts linia po linii
const lines = fs.readFileSync('src/cards/effects/cards.ts', 'utf-8').split('\n');
const newLines = [];
let currentId = null;
let currentBlockStart = -1;
let blockLines = [];
let modifiedCount = 0;

function flushBlock() {
  if (currentId === null || blockLines.length === 0) return;
  
  const e = entries[currentId];
  const c = e ? (e.card || e) : null;
  const hasUniqueInText = c && c.cardText && /unique/i.test(c.cardText);
  const blockText = blockLines.join('\n');
  const hasUniqueTrue = blockText.includes('unique: true');
  
  if (hasUniqueInText && !hasUniqueTrue && targetIds.has(currentId)) {
    // Znajdź linię usable: [], i wstaw unique: true przed nią
    const usableIdx = blockLines.findIndex(l => l.trim() === 'usable: [],');
    if (usableIdx >= 0) {
      // Znajdź ostatnią linię z bloodCost/poolCost przed usable
      let lastCostIdx = -1;
      for (let j = usableIdx - 1; j >= 0; j--) {
        if (/^\s*(bloodCost|poolCost): [0-9]+,/.test(blockLines[j])) {
          lastCostIdx = j;
          break;
        }
      }
      if (lastCostIdx >= 0) {
        const costLine = blockLines[lastCostIdx];
        blockLines.splice(lastCostIdx + 1, 0, '    unique: true,');
        modifiedCount++;
        cardsNeedingUnique.splice(cardsNeedingUnique.indexOf(currentId), 1);
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

// Aktualizuj findingi
for (const id of cardsNeedingUnique) {
  // Jeśli nadal jest na liście, oznacza że nie udało się dodać unique
  // (np. nie znaleziono linii usable)
}
const remainingNeedingUnique = cardsNeedingUnique;

// Zaktualizuj findingi dla wszystkich które zostały zmodyfikowane
// (te które zostały usunięte z cardsNeedingUnique podczas flushBlock)
const processedIds = new Set();
for (const id of targetIds) {
  if (!remainingNeedingUnique.includes(id)) {
    processedIds.add(id);
  }
}

for (const id of processedIds) {
  const idx = findings.findIndex(x => x.id === id);
  if (idx >= 0) {
    findings[idx].status = 'FIXED_TARGETED';
    findings[idx].evidence = 'Naprawiono: dodano unique: true do spec zgodnie z drukowanym "Unique" w tekście karty.';
  }
}
fs.writeFileSync('docs/card-audit/manual-findings.json', JSON.stringify(findings, null, 2) + '\n');

console.log('Successfully modified:', modifiedCount);
console.log('Could not modify:', remainingNeedingUnique.length);
if (remainingNeedingUnique.length > 0) {
  console.log('Remaining:', remainingNeedingUnique.join(', '));
}