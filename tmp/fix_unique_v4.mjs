import fs from 'fs';

const findings = JSON.parse(fs.readFileSync('docs/card-audit/manual-findings.json', 'utf-8'));
const targetStatuses = ['PARTIAL_FIX', 'UNRESOLVED'];
const targetIds = new Set(findings.filter(f => targetStatuses.includes(f.status)).map(f => f.id));

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
console.log('Target IDs:', targetIds.size);

const resultParts = [];
let modifiedCount = 0;
const couldNotModify = [];
const lastPos = 0;

for (let i = 0; i < positions.length; i++) {
  const { id, pos: startPos } = positions[i];
  const endPos = i + 1 < positions.length ? positions[i + 1].pos : cardsTs.length;
  
  // Dodaj Everything przed tym krcgId (komentarze między kartami)
  if (i === 0) {
    resultParts.push(cardsTs.substring(0, startPos));
  }
  
  let block = cardsTs.substring(startPos, endPos);
  
  if (targetIds.has(id)) {
    const e = entries[id];
    const c = e ? (e.card || e) : null;
    const hasUniqueInText = c && c.cardText && /unique/i.test(c.cardText);
    const hasUniqueTrue = block.includes('unique: true');
    
    if (hasUniqueInText && !hasUniqueTrue) {
      // Dodaj unique: true po ostatniej linii bloodCost/poolCost przed usable
      const costLines = [...block.matchAll(/\n    (bloodCost|poolCost): [0-9]+,/g)];
      if (costLines.length > 0) {
        const lastMatch = costLines[costLines.length - 1];
        const lastCostLine = lastMatch[0];
        const searchStr = lastCostLine + '\n    usable: [],';
        
        if (block.includes(searchStr)) {
          block = block.replace(searchStr, lastCostLine + ',\n    unique: true,\n    usable: [],');
          modifiedCount++;
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

// Aktualizuj findingi
for (const id of targetIds) {
  const e = entries[id];
  const c = e ? (e.card || e) : null;
  const hasUniqueInText = c && c.cardText && /unique/i.test(c.cardText);
  
  if (hasUniqueInText && !couldNotModify.includes(id)) {
    const idx = findings.findIndex(x => x.id === id);
    if (idx >= 0) {
      findings[idx].status = 'FIXED_TARGETED';
      findings[idx].evidence = 'Naprawiono: dodano unique: true do spec zgodnie z drukowanym "Unique" w tekście karty.';
    }
  }
}
fs.writeFileSync('docs/card-audit/manual-findings.json', JSON.stringify(findings, null, 2) + '\n');

console.log('Successfully modified:', modifiedCount);
console.log('Could not modify:', couldNotModify.length);
if (couldNotModify.length > 0) {
  console.log('Remaining IDs:', couldNotModify.join(', '));
}