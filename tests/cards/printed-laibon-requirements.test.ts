import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import registry from "../../src/cards/registry.json";
import type { CardRegistry } from "../../src/cards/types.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

// Only the acting minion requirement (and Overseer's capacity) is corrected;
// the action's effects, targets, and other clauses are not validated here.
const cases = [
  [100603, "Earth-Feeder"], [100623, "The Eldest Command Undeath"],
  [100626, "Elephant Guardian"], [100735, "Fire on the Mountain"],
  [100818, "Ghoul Messenger"], [100922, "Hiding in the Open"],
  [100956, "Ilomba"], [101037, "Kduva's Mask"], [101039, "Kerrie"],
  [101069, "Kuta"], [101176, "Masai Blood Milk"], [101289, "Nkishi"],
  [101339, "Overseer"], [101709, "The Secret Must Be Kept"],
  [101750, "Shaman"], [101787, "Sires Command, Childer Inherit"],
  [101914, "Swarm"], [102172, "Well-Marked"],
] as const;

describe("printed Laibon requirements", () => {
  it.each(cases)("%i %s exposes and applies the requirement", (id, name) => {
    const card = (registry as unknown as CardRegistry).entries[id]?.card;
    expect(card?.name).toBe(name);
    if (!card || card.kind !== "library") throw new Error("expected library card");
    expect(card.cardText).toMatch(/Requires a (?:ready )?Laibon\b/i);
    const handler = testRegistry[name]!;
    expect(handler.requiresSects?.()).toEqual(["laibon"]);
    const laibon = makeMinion("l", "Alice", { sect: "laibon", capacity: 8 });
    const other = makeMinion("o", "Alice", { sect: "independent", capacity: 8 });
    const ally = makeMinion("a", "Alice", { kind: "ally", sect: "laibon", capacity: 8 });
    expect(handler.modesPlayableBy!(laibon).length).toBeGreaterThan(0);
    expect(handler.modesPlayableBy!(other)).toEqual([]);
    expect(handler.modesPlayableBy!(ally)).toEqual([]);
  });

  it.each(cases)("%i %s restricts its current hand-play options", (_id, name) => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    Object.assign(alice.minions[0]!, { sect: "laibon", capacity: 8, blood: 8 });
    alice.minions.push(makeMinion("other", "Alice", { sect: "independent", capacity: 8, blood: 8 }));
    alice.hand.push({ id: "card", name });
    const options = new VtesEngine(state, testRegistry).decision()!.options;
    const plays = options.filter(o => o.kind === "playCard" && o.card === "card");
    expect(plays.some(o => o.kind === "playCard" && o.minion === "V1")).toBe(true);
    expect(plays.some(o => o.kind === "playCard" && o.minion === "other")).toBe(false);
  });

  it.each(["Earth-Feeder", "Kuta", "Kerrie", "Elephant Guardian"])(
    "%s checks the current actor, not merely a controlled Laibon", (name) => {
      const state = threeSeatGame();
      const actor = state.seats[0]!.minions[0]!;
      Object.assign(actor, { sect: "independent", capacity: 8, blood: 8 });
      state.seats[0]!.minions.push(makeMinion("other", "Alice", { sect: "laibon", capacity: 8, blood: 8 }));
      state.seats[0]!.hand.push({ id: "card", name });
      const engine = new VtesEngine(state, testRegistry);
      const offered = () => engine.decision()!.options.some(o => o.kind === "playCard" && o.card === "card" && o.minion === "V1");
      expect(offered()).toBe(false);
      actor.sect = "laibon";
      expect(offered()).toBe(true);
      actor.inTorpor = true;
      expect(offered()).toBe(false);
    },
  );

  it("Overseer requires capacity above four as well as Laibon", () => {
    const state = threeSeatGame();
    Object.assign(state.seats[0]!.minions[0]!, { sect: "laibon", capacity: 4, blood: 4 });
    state.seats[0]!.hand.push({ id: "card", name: "Overseer" });
    const engine = new VtesEngine(state, testRegistry);
    const offered = () => engine.decision()!.options.some(o => o.kind === "playCard" && o.card === "card");
    expect(offered()).toBe(false);
    state.seats[0]!.minions[0]!.capacity = 5;
    expect(offered()).toBe(true);
  });

  it("does not add a Laibon-only gate to Mozambique Allure's alternative", () => {
    const h = testRegistry["Mozambique Allure"]!;
    const other = makeMinion("v", "Alice", { sect: "independent", title: null });
    expect(h.requiresSects?.()).not.toContain("laibon");
    expect(h.modesPlayableBy!(other).length).toBeGreaterThan(0);
    // The full alternative and printed effects still need their own implementation.
  });

  it("Magic of the Smith applies the Laibon requirement to searched equipment", () => {
    for (const [sect, expected] of [["laibon", true], ["camarilla", false]] as const) {
      const state = threeSeatGame();
      Object.assign(state.seats[0]!.minions[0]!, { sect, disciplines: { tha: "basic" }, blood: 5 });
      state.seats[0]!.hand.push({ id: "ms", name: "Magic of the Smith" });
      state.seats[0]!.library.push({ id: "filler", name: "Conditioning" }, { id: "k", name: "Kerrie" });
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [["Alice", "play:Magic of the Smith:basic:V1:ms"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
      expect(engine.decision()!.options.some(o => o.id === "choice:Magic of the Smith:ms:searchEquip:k"), sect).toBe(expected);
    }
  });

  it("Biothaumaturgic Experiment can employ a Laibon animal ignoring requirements", () => {
    const state = threeSeatGame();
    Object.assign(state.seats[0]!.minions[0]!, { sect: "camarilla", disciplines: { tha: "basic" }, blood: 5 });
    state.seats[0]!.hand.push({ id: "bx", name: "Biothaumaturgic Experiment" }, { id: "eg", name: "Elephant Guardian" });
    const engine = new VtesEngine(state, testRegistry);
    const options = engine.decision()!.options;
    expect(options.some(o => o.kind === "playCard" && o.card === "eg")).toBe(false);
    const action = options.find(o => o.id.startsWith("play:Biothaumaturgic Experiment:basic:V1:eg:"));
    expect(action).toBeDefined();
    runTrace(engine, [["Alice", action!.id],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(state.seats[0]!.minions[0]!.attached.some(p => p.card.id === "eg" && p.life === 3)).toBe(true);
  });
});
