const fs = require('fs');
let data = fs.readFileSync('docs/card-audit/manual-findings.json', 'utf-8');

const fixedCards = [
  100032, // AK-47
  100227, // Blur
  100645, // Enkil Cog
  100678, // Eye of Hazimel
  101272, // Nephandus
  101338, // Outside the Hourglass
  101588, // Rego Motum
  101649, // Rolling with the Punches
  101897, // Summon History
  101931, // Talbot's Chainsaw
  102144, // War Ghoul
  102233, // Revelation of the Serpent
  102314, // Dance of the Dead
  102362, // Tranquility Shield
  200039, // Alabástrom
  201052, // New Blood
  201274, // Shalmath
  201462, // Walker Grimes
  201510, // Zubeida
  201680, // Opikun
  201776, // Věnceslava
];

let count = 0;
for (const id of fixedCards) {
  const oldStatus = `"id": ${id},`;
  const oldMatch = data.match(new RegExp(`"id": ${id},\\n[\\s\\S]*?"status": "PARTIAL_FIX",`));
  if (oldMatch) {
    data = data.replace(new RegExp(`("id": ${id},\\n[\\s\\S]*?)"status": "PARTIAL_FIX",`), `$1"status": "FIXED_TARGETED",`);
    count++;
  } else {
    console.log(`ID ${id}: NOT FOUND`);
  }
}

fs.writeFileSync('docs/card-audit/manual-findings.json', data);
console.log(`Zmieniono ${count} kart na FIXED_TARGETED`);