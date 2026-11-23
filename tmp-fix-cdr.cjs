const fs = require('fs');
let data = fs.readFileSync('docs/card-audit/manual-findings.json', 'utf-8');
const old = `"id": 200257,\n    "name": "Cedric (G4)",\n    "status": "PARTIAL_FIX",`;
const newStr = `"id": 200257,\n    "name": "Cedric (G4)",\n    "status": "FIXED_TARGETED",`;
if (data.includes(old)) {
    data = data.replace(old, newStr);
    console.log('Cedric: OK');
} else {
    console.log('Cedric: NOT FOUND');
}
fs.writeFileSync('docs/card-audit/manual-findings.json', data);