import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import type { MinionState, Sect, VampireTitle } from "../../src/engine/index.ts";
import registry from "../../src/cards/registry.json";
import type { CardRegistry } from "../../src/cards/types.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

// These tests cover the requirement, not the other printed effects or timing.
const cases = [
  [100062, "Ancestor's Insight"], [100153, "Bestial Vengeance"],
  [100699, "Familial Bond"], [101683, "Savannah Runner"],
  [101880, "Strange Day"], [101959, "Terra Incognita"],
  [101975, "Those Who Endure Judge"],
] as const;
const disciplines = { ani: "superior", aus: "superior", cel: "superior" } as const;

describe("Laibon requirements in combat and action windows", () => {
  it.each(cases)("%i %s checks the playing minion and advertises the sect", (id, name) => {
    const card = (registry as unknown as CardRegistry).entries[id]?.card;
    expect(card?.name).toBe(name);
    if (!card || card.kind !== "library") throw new Error("library card expected");
    expect(card.cardText).toMatch(/Requires a (?:ready )?Laibon/i);
    const h = testRegistry[name]!;
    expect(h.requiresSects?.()).toEqual(["laibon"]);
    const minion = (overrides: Partial<MinionState>) => makeMinion("v", "Alice", { sect: "laibon", capacity: 8, blood: 8, disciplines, ...overrides });
    expect(h.modesPlayableBy!(minion({})).length).toBeGreaterThan(0);
    expect(h.modesPlayableBy!(minion({ sect: "sabbat" }))).toEqual([]);
    expect(h.modesPlayableBy!(minion({ kind: "ally" }))).toEqual([]);
    if (id === 100062 || id === 101959) {
      expect(h.modesPlayableBy!(minion({ inTorpor: true }))).toEqual([]);
      expect(h.modesPlayableBy!(minion({ torporPending: { other: null } }))).toEqual([]);
      expect(h.modesPlayableBy!(minion({ locked: true })).length).toBeGreaterThan(0);
    }
  });

  it.each(["Familial Bond", "Savannah Runner", "Terra Incognita"])(
    "%s only offers the reacting Laibon in the current block window", (name) => {
      for (const [sect, expected] of [["laibon", true], ["camarilla", false]] as const) {
        const state = threeSeatGame();
        const m = state.seats[1]!.minions.find(v => v.id === "M")!;
        Object.assign(m, { sect, disciplines, blood: 8, capacity: 8 });
        state.seats[1]!.hand.push({ id: "card", name });
        const engine = new VtesEngine(state, testRegistry);
        runTrace(engine, [["Alice", "hunt:V1"],
          ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
          ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"]]);
        const dp = engine.decision()!;
        expect(dp.seat).toBe("Bob");
        expect(dp.options.some(o => o.kind === "playCard" && o.card === "card" && o.minion === "M"), sect).toBe(expected);
      }
    },
  );

  it("Bestial Vengeance tests the combatant's sect in the current maneuver window", () => {
    for (const [sect, expected] of [["laibon", true], ["sabbat", false]] as const) {
      const state = threeSeatGame();
      Object.assign(state.seats[0]!.minions[0]!, { sect, disciplines, blood: 8 });
      state.seats[0]!.hand.push({ id: "card", name: "Bestial Vengeance" });
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [["Alice", "bleed:V1"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "block:M"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
      const dp = engine.decision()!;
      expect(dp.window).toBe("combat.range");
      expect(dp.options.some(o => o.kind === "playCard" && o.card === "card"), sect).toBe(expected);
    }
  });

  it.each(["Strange Day", "Those Who Endure Judge"])("%s checks the acting minion in its current modifier window", (name) => {
    for (const [sect, capacity, expected] of [["laibon", 5, true], ["camarilla", 5, false], ...(name === "Those Who Endure Judge" ? [["laibon", 4, false] as const] : [])] as const) {
      const state = threeSeatGame();
      Object.assign(state.seats[0]!.minions[0]!, { sect, capacity, blood: 8 });
      state.seats[0]!.hand.push({ id: "card", name });
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [["Alice", "bleed:V1"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "block:M"]]);
      expect(engine.decision()!.options.some(o => o.kind === "playCard" && o.card === "card"), `${sect} ${capacity}`).toBe(expected);
    }
  });
});

describe("Mozambique Allure alternative requirement", () => {
  const matrix: Array<[Sect | null, VampireTitle | null, "vampire" | "ally", boolean]> = [
    ["laibon", null, "vampire", true], ["laibon", "personal2", "vampire", true],
    ["camarilla", null, "vampire", true], ["camarilla", "prince", "vampire", false],
    ["sabbat", "bishop", "vampire", false], [null, null, "vampire", true],
    ["laibon", null, "ally", false], ["camarilla", null, "ally", false],
  ];
  it.each(matrix)("sect %s title %s kind %s allows play: %s", (sect, title, kind, expected) => {
    const state = threeSeatGame();
    const v = state.seats[0]!.minions[0]!;
    Object.assign(v, { sect, title, kind, blood: 5 });
    state.seats[0]!.hand.push({ id: "card", name: "Mozambique Allure" });
    state.seats[0]!.crypt.push(makeMinion("crypt", "Alice"));
    const h = testRegistry["Mozambique Allure"]!;
    expect(h.modesPlayableBy!(v).length > 0).toBe(expected);
    const dp = new VtesEngine(state, testRegistry).decision()!;
    expect(dp.options.some(o => o.kind === "playCard" && o.card === "card" && o.minion === "V1")).toBe(expected);
  });

  it("only the Laibon branch requires a nonempty crypt", () => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    Object.assign(actor, { sect: "laibon", title: null });
    state.seats[0]!.hand.push({ id: "card", name: "Mozambique Allure" });
    const engine = new VtesEngine(state, testRegistry);
    const offered = () => engine.decision()!.options.some(o => o.kind === "playCard" && o.card === "card" && o.minion === "V1");
    expect(offered()).toBe(false);
    actor.sect = "camarilla";
    expect(offered()).toBe(true);
    actor.sect = "laibon";
    state.seats[0]!.crypt.push(makeMinion("crypt", "Alice"));
    expect(offered()).toBe(true);
  });

  it("re-evaluates title, sect and readiness without requiring a Laibon unconditionally", () => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    Object.assign(actor, { sect: "camarilla", title: "prince" });
    state.seats[0]!.minions.push(makeMinion("other", "Alice", { sect: "laibon" }));
    state.seats[0]!.hand.push({ id: "card", name: "Mozambique Allure" });
    state.seats[0]!.crypt.push(makeMinion("crypt", "Alice"));
    const engine = new VtesEngine(state, testRegistry);
    const offered = () => engine.decision()!.options.some(o => o.kind === "playCard" && o.card === "card" && o.minion === "V1");
    expect(offered()).toBe(false);
    actor.title = null;
    expect(offered()).toBe(true);
    actor.title = "personal2"; actor.sect = "laibon";
    expect(offered()).toBe(true);
    actor.inTorpor = true;
    expect(offered()).toBe(false);
    expect(testRegistry["Mozambique Allure"]!.requiresSects?.()).not.toContain("laibon");
  });
});
