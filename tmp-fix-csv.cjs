const fs = require('fs');
let data = fs.readFileSync('docs/card-audit/preconstructed-cards.csv', 'utf-8');

const fixedCards = [
  100032, 100227, 100645, 100678, 101272, 101338, 101588, 101649,
  101897, 101931, 102144, 102233, 102314, 102362, 200039, 201052,
  201274, 201462, 201510, 201680, 201776,
];

let count = 0;
for (const id of fixedCards) {
  const oldStatus = `"${id}",`;
  // Find the line with this ID and replace PARTIAL_FIX with FIXED_TARGETED
  const lines = data.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(`"${id}",`) && lines[i].includes('PARTIAL_FIX')) {
      lines[i] = lines[i].replace('PARTIAL_FIX', 'FIXED_TARGETED');
      count++;
    }
  }
  data = lines.join('\n');
}

fs.writeFileSync('docs/card-audit/preconstructed-cards.csv', data);
console.log(`Zmieniono ${count} kart w CSV na FIXED_TARGETED`);