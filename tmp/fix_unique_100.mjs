import fs from 'fs';

const findings = JSON.parse(fs.readFileSync('docs/card-audit/manual-findings.json', 'utf-8'));
const targetIds = new Set(findings.filter(f => f.status === 'PARTIAL_FIX').map(f => f.id));

const cardsTs = fs.readFileSync('src/cards/effects/cards.ts', 'utf-8');
const regText = fs.readFileSync('src/cards/registry.json', 'utf-8');
const reg = JSON.parse(regText);
const entries = reg.entries || reg;

// Znajdź wszystkie pozycje krcgId
const krcgRegex = /krcgId: (\d+),/g;
let match;
const positions = [];
while ((match = krcgRegex.exec(cardsTs)) !== null) {
  positions.push({ id: parseInt(match[1]), pos: match.index });
}

console.log('Total cards in cards.ts:', positions.length);
console.log('PARTIAL_FIX target IDs:', targetIds.size);

// Zbierz karty które potrzebują unique: true (pierwsze 100)
const cardsNeedingUnique = [];
for (let i = 0; i < positions.length && cardsNeedingUnique.length < 100; i++) {
  const { id } = positions[i];
  if (!targetIds.has(id)) continue;
  
  const e = entries[id];
  const c = e ? (e.card || e) : null;
  const hasUniqueInText = c && c.cardText && /unique/i.test(c.cardText);
  
  if (hasUniqueInText) {
    cardsNeedingUnique.push(id);
  }
}

console.log('Cards needing unique: (first 100):', cardsNeedingUnique.length);

// Przetwórz cards.ts - znajdź bloki i dodaj unique: true
const resultParts = [];
let modifiedCount = 0;
const modifiedIds = [];
const couldNotModify = [];

for (let i = 0; i < positions.length; i++) {
  const { id, pos: startPos } = positions[i];
  const endPos = i + 1 < positions.length ? positions[i + 1].pos : cardsTs.length;
  
  if (i === 0) {
    resultParts.push(cardsTs.substring(0, startPos));
  }
  
  let block = cardsTs.substring(startPos, endPos);
  
  if (cardsNeedingUnique.includes(id)) {
    const hasUniqueTrue = block.includes('unique: true');
    if (!hasUniqueTrue) {
      // Znajdź ostatnią linię bloodCost/poolCost przed usable
      const costLines = [...block.matchAll(/\n    (bloodCost|poolCost): [0-9]+,/g)];
      if (costLines.length > 0) {
        const lastMatch = costLines[costLines.length - 1];
        const lastCostLine = lastMatch[0];
        const searchStr = lastCostLine + '\n    usable: [],';
        
        if (block.includes(searchStr)) {
          block = block.replace(searchStr, lastCostLine + ',\n    unique: true,\n    usable: [],');
          modifiedCount++;
          modifiedIds.push(id);
        } else {
          couldNotModify.push(id);
        }
      } else {
        couldNotModify.push(id);
      }
    }
  }
  
  resultParts.push(block);
}

const newCardsTs = resultParts.join('');
fs.writeFileSync('src/cards/effects/cards.ts', newCardsTs);

// Aktualizuj findingi dla zmodyfikowanych kart
for (const id of modifiedIds) {
  const idx = findings.findIndex(x => x.id === id);
  if (idx >= 0) {
    findings[idx].status = 'FIXED_TARGETED';
    findings[idx].evidence = 'Naprawiono: dodano unique: true do spec zgodnie z drukowanym "Unique" w tekście karty.';
  }
}
fs.writeFileSync('docs/card-audit/manual-findings.json', JSON.stringify(findings, null, 2) + '\n');

console.log('Successfully modified:', modifiedCount);
console.log('Modified IDs:', modifiedIds.join(', '));
console.log('Could not modify:', couldNotModify.length);
if (couldNotModify.length > 0) {
  console.log('Remaining IDs:', couldNotModify.join(', '));
}