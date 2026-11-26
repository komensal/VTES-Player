// Audit helper: which resolution cases are empty, and does any card use them?
const fs = require("fs");
const s = fs.readFileSync("src/cards/effects/compile.ts", "utf8");
const cards = fs.readFileSync("src/cards/effects/cards.ts", "utf8");
const lines = s.split("\n");
const empty = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^\s*case "([A-Za-z0-9]+)": \{/);
  if (!m) continue;
  let body = "";
  for (let j = i + 1; j < Math.min(i + 14, lines.length); j++) {
    body += lines[j] + "\n";
    if (/^\s*\}/.test(lines[j])) break;
  }
  const stripped = body.replace(/\/\/[^\n]*/g, "").replace(/\s/g, "");
  if (stripped === "break;}") empty.push({ kind: m[1], line: i + 1 });
}
const used = [];
const unused = [];
for (const { kind, line } of empty) {
  const n = (cards.match(new RegExp('kind: "' + kind + '"', "g")) || []).length;
  (n > 0 ? used : unused).push(`${kind} x${n} (compile:${line})`);
}
console.log("EMPTY but used by cards:\n" + used.join("\n"));
console.log("\nEMPTY and unused:\n" + unused.join("\n"));
console.log("\ntotals:", { empty: empty.length, used: used.length, unused: unused.length });
