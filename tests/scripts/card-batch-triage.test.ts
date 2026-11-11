import { describe, expect, it } from "vitest";
import type { CardDef, RegistryEntry } from "../../src/cards/types.ts";
import type { CardSpec } from "../../src/cards/effects/spec.ts";
import { batchFlags, selectBatch } from "../../scripts/card-batch-utils.ts";

const entry = (id: number) => ({ card: { id } } as RegistryEntry);
const master = { kind: "library", id: 1, cardText: "Put this card in play." } as CardDef;
const pool = { krcgId: 1, name: "Example", cardType: "master", bloodCost: 0, usable: [], modes: [{ level: "basic", discipline: null, effects: [{ kind: "gainPool", amount: 1 }] }] } satisfies CardSpec;
describe("batch screening", () => {
  it("sorts, excludes previous findings, and applies the requested boundary and limit", () => {
    expect(selectBatch([entry(5), entry(3), entry(6), entry(4), entry(2)], 2, 2, new Set([4])).map((x) => x.card.id)).toEqual([3, 5]);
  });
  it("flags obvious candidate text but never claims that a flag proves a bug", () => {
    expect(batchFlags(master, pool, true)).toEqual(["master_gain_pool_text_mismatch"]);
    expect(batchFlags({ ...master, cardText: "Gain 1 pool." }, pool, true)).toEqual([]);
    expect(batchFlags(master, undefined, false)).toEqual(["no_runtime_handler", "no_raw_spec"]);
  });
  it("flags stealth-only action and uppercase levels; flags are independently composable", () => {
    const action: CardSpec = { krcgId: 2, name: "Example", cardType: "action", bloodCost: 0, usable: [], modes: [{ level: "basic", discipline: "aus", effects: [{ kind: "actionStealth", amount: 1 }] }] };
    expect(batchFlags({ ...master, cardText: "[AUS] something" }, action, true)).toEqual(["action_only_stealth", "uppercase_level_without_superior_mode"]);
  });
});
