const fs = require('fs');
let data = fs.readFileSync('docs/card-audit/manual-findings.json', 'utf-8');

const fixedCards = [101309, 102262]; // Obedience, Touch of Valeren

let count = 0;
for (const id of fixedCards) {
  data = data.replace(new RegExp(`("id": ${id},\\n[\\s\\S]*?)"status": "PARTIAL_FIX",`), `$1"status": "FIXED_TARGETED",`);
  count++;
}

fs.writeFileSync('docs/card-audit/manual-findings.json', data);
console.log(`Zmieniono ${count} kart na FIXED_TARGETED`);