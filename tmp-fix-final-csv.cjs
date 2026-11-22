const fs = require('fs');
let data = fs.readFileSync('docs/card-audit/preconstructed-cards.csv', 'utf-8');

const fixedCards = [101309, 102262]; // Obedience, Touch of Valeren

let count = 0;
const lines = data.split('\n');
for (let i = 0; i < lines.length; i++) {
  for (const id of fixedCards) {
    if (lines[i].startsWith(`"${id}",`) && lines[i].includes('PARTIAL_FIX')) {
      lines[i] = lines[i].replace('PARTIAL_FIX', 'FIXED_TARGETED');
      count++;
    }
  }
}
data = lines.join('\n');

fs.writeFileSync('docs/card-audit/preconstructed-cards.csv', data);
console.log(`Zmieniono ${count} kart w CSV na FIXED_TARGETED`);