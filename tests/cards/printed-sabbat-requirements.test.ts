import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import registry from "../../src/cards/registry.json";
import type { CardRegistry } from "../../src/cards/types.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

// These requirements are only one corrected fragment of each card; they
// do not attest to its effects, targets, cost, or other printed clauses.
const cases = [
  [100220, "Blooding"], [100371, "Code of Milan Suspended"],
  [100452, "Crusade: Aragon"], [100801, "Games of Instinct"],
  [100988, "Inquisition"], [101087, "Legacy of Pander"],
  [101173, "Martial Ritus"], [101241, "Monomancy"],
  [101304, "Notorious Brutality"], [101661, "Rumble"],
  [101903, "Sunrise Service"], [102206, "Zillah's Tears"],
] as const;

describe("printed Sabbat vampire requirements", () => {
  it.each(cases)("%i %s advertises and applies its requirement", (id, name) => {
    const card = (registry as unknown as CardRegistry).entries[id]?.card;
    expect(card?.name).toBe(name);
    if (!card || card.kind !== "library") throw new Error("expected library card");
    expect(card.cardText).toMatch(/Requires a (?:ready )?Sabbat vampire/i);
    const handler = testRegistry[name]!;
    expect(handler.requiresSects?.()).toEqual(["sabbat"]);
    const sabbat = makeMinion("s", "Alice", { sect: "sabbat", capacity: 9 });
    const camarilla = makeMinion("c", "Alice", { sect: "camarilla", capacity: 9 });
    expect(handler.modesPlayableBy!(sabbat).length).toBeGreaterThan(0);
    expect(handler.modesPlayableBy!(camarilla)).toEqual([]);
    const ally = makeMinion("a", "Alice", { kind: "ally", sect: "sabbat", capacity: 9 });
    expect(handler.modesPlayableBy!(ally)).toEqual([]);
  });

  it.each(cases.filter(([id]) => id !== 101304))("%s %s offers hand plays only to the Sabbat vampire", (_id, name) => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    Object.assign(alice.minions[0]!, { sect: "sabbat", blood: 9 });
    alice.minions.push(makeMinion("wrong", "Alice", { sect: "camarilla", blood: 9 }));
    alice.hand.push({ id: "card", name });
    const options = new VtesEngine(state, testRegistry).decision()!.options.filter(o => o.kind === "playCard" && o.card === "card");
    expect(options.some(o => o.kind === "playCard" && o.minion === "V1")).toBe(true);
    expect(options.some(o => o.kind === "playCard" && o.minion === "wrong")).toBe(false);
  });

  it("Notorious Brutality requires both Sabbat and capacity above seven in the action window", () => {
    for (const [sect, capacity, legal] of [["sabbat", 8, true], ["sabbat", 7, false], ["camarilla", 8, false]] as const) {
      const state = threeSeatGame();
      Object.assign(state.seats[0]!.minions[0]!, { sect, capacity, blood: 9 });
      state.seats[0]!.hand.push({ id: "card", name: "Notorious Brutality" });
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [["Alice", "bleed:V1"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "block:M"]]);
      const found = engine.decision()!.options.some(o => o.kind === "playCard" && o.card === "card");
      expect(found, `${sect} ${capacity}`).toBe(legal);
    }
  });
});
