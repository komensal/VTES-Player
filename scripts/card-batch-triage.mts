/** Reproducible screening for a bounded tranche, not a manual card audit.
 * npm run cards:triage -- --after 100112 --count 1000 --output /tmp/triage.jsonl
 * Or repeat a fixed selection using --ids-file <manifest> --output <file>.
 * Each line is a snapshot: printed text, raw spec, runtime hook names and
 * heuristic flags. Flags can be false positives; no flag proves correctness.
 */
import { readFileSync, writeFileSync } from "node:fs";
import data from "../src/cards/registry.json";
import { buildHandlerRegistry, cardSpecs, cryptSpecs } from "../src/cards/effects/cards.ts";
import type { CardRegistry } from "../src/cards/types.ts";
import { batchFlags, selectBatch } from "./card-batch-utils.ts";

function argument(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const value = process.argv[i + 1];
  if (!value || value.startsWith("--")) throw new Error(`Missing value for --${name}`);
  return value;
}
const output = argument("output");
if (!output) throw new Error("Missing --output");
const registry = data as unknown as CardRegistry;
const all = Object.values(registry.entries);
const idsFile = argument("ids-file");
let entries;
if (idsFile) {
  const ids = JSON.parse(readFileSync(idsFile, "utf8")) as unknown;
  if (!Array.isArray(ids) || ids.length === 0 || ids.some((id) => !Number.isSafeInteger(id)) || new Set(ids).size !== ids.length) throw new Error("Invalid ID manifest");
  const byId = new Map(all.map((entry) => [entry.card.id, entry]));
  entries = ids.map((id) => {
    const entry = byId.get(id as number);
    if (!entry) throw new Error(`Unknown ID ${id}`);
    return entry;
  });
} else {
  const after = Number(argument("after"));
  const count = Number(argument("count"));
  if (!Number.isSafeInteger(after) || after < 0 || !Number.isSafeInteger(count) || count < 1) throw new Error("Invalid range");
  const known = new Set<number>((JSON.parse(readFileSync("docs/card-audit/manual-findings.json", "utf8")) as { id: number }[]).map((f) => f.id));
  entries = selectBatch(all, after, count, known);
  if (entries.length !== count) throw new Error(`Only ${entries.length} eligible cards for requested ${count}`);
}
const specs = new Map([...cardSpecs, ...cryptSpecs].map((spec) => [spec.krcgId, spec]));
const handlers = buildHandlerRegistry();
const rows = entries.map(({ card, supported }) => {
  const spec = specs.get(card.id);
  const handler = handlers[card.name];
  const hooks = handler ? Object.keys(handler).filter((key) => typeof (handler as unknown as Record<string, unknown>)[key] === "function").sort() : [];
  return {
    id: card.id, name: card.name, kind: card.kind, supported,
    printed: card, spec: spec ?? null, handlerHooks: hooks,
    flags: batchFlags(card, spec, !!handler),
  };
});
writeFileSync(output, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
const counts = new Map<string, number>();
for (const row of rows) for (const flag of row.flags) counts.set(flag, (counts.get(flag) ?? 0) + 1);
console.log(`${rows.length} cards, IDs ${rows[0]!.id}–${rows.at(-1)!.id}, ${rows.filter((r) => r.flags.length > 0).length} with >=1 heuristic flag`);
for (const [name, n] of [...counts].sort()) console.log(`${name}: ${n}`);
