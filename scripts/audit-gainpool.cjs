// Audit helper: cards declaring gainPool whose printed text never grants pool.
// Usage: node scripts/audit-gainpool.cjs [--fix-no-pool-word]
const fs = require("fs");
const cardsPath = "src/cards/effects/cards.ts";
const cards = fs.readFileSync(cardsPath, "utf8");
const registry = require("../src/cards/registry.json").entries;
const fix = process.argv.includes("--fix-no-pool-word");
const findings = [];
const seen = new Set();
for (const m of cards.matchAll(/kind: "gainPool"/g)) {
  const before = cards.slice(0, m.index);
  const id = (before.match(/krcgId:\s*(\d+)(?![\s\S]*krcgId:)/) || [])[1];
  if (!id || seen.has(id)) continue;
  seen.add(id);
  const entry = registry[id];
  if (!entry) continue;
  const text = entry.card.cardText || "";
  const grantsPool = /(gain|gains|gaining|add|adds|get|gets|move|moves|take|takes|steal|steals)[^.\n]{0,60}pool/i.test(text)
    || /pool[^.\n]{0,40}(gained|added)/i.test(text);
  if (!grantsPool) {
    findings.push({ id, name: entry.card.name, text });
  } else if (process.argv.includes("--show-remaining")) {
    console.log(`KEPT ${id} ${entry.card.name}\n   ${text.replace(/\n/g, " | ").slice(0, 260)}`);
  }
}
for (const f of findings) {
  const marker = /pool/i.test(f.text) ? "pool-word" : "NO pool word";
  console.log(`${marker} ${f.id} ${f.name}`);
  if (process.argv.includes("--show-pool-word") && /pool/i.test(f.text)) {
    console.log("   " + f.text.replace(/\n/g, " | ").slice(0, 340));
  }
}
console.log("\nsuspect cards:", findings.length, "of", seen.size, "with gainPool");

if (process.argv.includes("--fix-reviewed-remaining")) {
  // Manually verified against registry cardText:
  // - REMOVE: no "gain N pool" on play at all. Bounty moves counters to the
  //   OPPONENT's pool, Gird Minions spends your own pool, Kaymakli moves the
  //   uncontrolled vampires' blood, Malkavian Game/Prank are X-and-guess,
  //   Betrayer/Regarhagan's Hold/Goodnight Sweet Prince/Brothers Grimm grant
  //   pool only conditionally or to somebody else.
  // - AMOUNT: printed magnitude was flattened to 1 by the bulk pass.
  const remove = ["100242", "100831", "101036", "101153", "101155", "100156", "101584", "100843", "100258"];
  const amount = { "100667": 5, "100926": 4 };
  let out = cards;
  for (const id of remove) {
    const start = out.indexOf(`krcgId: ${id},`);
    const end = out.indexOf("krcgId:", start + 1);
    let block = out.slice(start, end < 0 ? out.length : end);
    const fixed = block
      .replace(/\{ kind: "gainPool", amount: \d+ \},\s*/g, "")
      .replace(/,\s*\{ kind: "gainPool", amount: \d+ \}/g, "")
      .replace(/effects: \[\{ kind: "gainPool", amount: \d+ \}\]/g, "effects: []");
    if (fixed === block) console.log("NO MATCH", id);
    out = out.slice(0, start) + fixed + out.slice(end < 0 ? out.length : end);
  }
  for (const [id, n] of Object.entries(amount)) {
    const start = out.indexOf(`krcgId: ${id},`);
    const end = out.indexOf("krcgId:", start + 1);
    const block = out.slice(start, end < 0 ? out.length : end);
    const fixed = block.replace(/\{ kind: "gainPool", amount: \d+ \}/g, `{ kind: "gainPool", amount: ${n} }`);
    out = out.slice(0, start) + fixed + out.slice(end < 0 ? out.length : end);
  }
  fs.writeFileSync(cardsPath, out);
  console.log("reviewed-remaining fix applied:", remove.length, "removed,", Object.keys(amount).length, "amounts corrected");
}

if (fix || process.argv.includes("--fix-all-suspects")) {
  // --fix-no-pool-word: only cards with no "pool" anywhere in print.
  // --fix-all-suspects: also the 20 pool-word cards, each manually read and
  // confirmed to burn/cost pool rather than grant it.
  const targets = new Set(
    findings
      .filter((f) => process.argv.includes("--fix-all-suspects") || !/pool/i.test(f.text))
      .map((f) => f.id),
  );
  let out = cards;
  let removed = 0;
  for (const id of targets) {
    const start = out.indexOf(`krcgId: ${id},`);
    if (start < 0) { console.log("MISS", id); continue; }
    const next = out.indexOf("krcgId:", start + 1);
    const end = next < 0 ? out.length : next;
    let block = out.slice(start, end);
    const before = block;
    block = block.replace(/\{ kind: "gainPool", amount: \d+ \},\s*/g, "");
    block = block.replace(/,\s*\{ kind: "gainPool", amount: \d+ \}/g, "");
    block = block.replace(/effects: \[\{ kind: "gainPool", amount: \d+ \}\]/g, "effects: []");
    if (block !== before) {
      removed += (before.match(/kind: "gainPool"/g) || []).length;
      out = out.slice(0, start) + block + out.slice(end);
    } else {
      console.log("NO MATCH IN BLOCK", id);
    }
  }
  fs.writeFileSync(cardsPath, out);
  console.log(`\nFIX: removed ${removed} gainPool declarations from ${targets.size} cards with no "pool" in print.`);
}
