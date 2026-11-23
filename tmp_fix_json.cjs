const fs = require("fs");
let content = fs.readFileSync("docs/card-audit/manual-findings.json", "utf-8");
// Napraw niepoprawne cudzysłowy wewnątrz wartości stringów JSON
content = content.split('"notFirstRound"').join('\\"notFirstRound\\"');
fs.writeFileSync("docs/card-audit/manual-findings.json", content);
try {
  JSON.parse(content);
  console.log("JSON OK");
} catch (e) {
  console.log("JSON błąd:", e.message);
}
