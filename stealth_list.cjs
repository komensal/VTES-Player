const fs = require("fs");
const findings = JSON.parse(fs.readFileSync("docs/card-audit/manual-findings.json", "utf-8"));
const d = require("./src/cards/registry.json");
const entries = d.entries;
const confirmed = findings.filter(f => f.status === "CONFIRMED_BUG");
const stealthOnly = confirmed.filter(f => {
  const ev = (f.evidence || "").toLowerCase();
  const hasStealth = ev.includes("stealth") && (ev.includes("tylko") || ev.includes("sam") || ev.includes("wyłącznie") || ev.includes("only"));
  const noBleed = !ev.includes("modifyBleed") && !ev.includes("intercept");
  return hasStealth && noBleed;
});
console.log("Liczba stealth_only CONFIRMED_BUG:", stealthOnly.length);
stealthOnly.forEach(f => {
  const e = entries[f.id];
  const text = e ? e.card.cardText : "NIE ZNALEZIONO";
  console.log(f.id + "|" + f.name + "|" + text.substring(0, 180));
});
