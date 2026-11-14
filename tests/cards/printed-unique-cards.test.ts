import { describe, expect, it } from "vitest";
import type { GameState, PermanentInPlay } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";
import registry from "../../src/cards/registry.json";
import type { CardRegistry } from "../../src/cards/types.ts";
import fixture from "./fixtures/printed-unique-cards.json";

function permanent(id: string, name: string): PermanentInPlay {
  return { card: { id, name }, locked: false, usedThisPhase: false, statics: {}, tags: [] };
}
function phase(state: GameState, value: "master" | "minion") {
  const frame = state.frames[0]!;
  if (frame.kind !== "turn") throw new Error("fixture");
  frame.phase = value;
  frame.masterActionsLeft = 1;
}
function hasPlay(engine: VtesEngine, id: string): boolean {
  return engine.decision()!.options.some((o) => o.kind === "playCard" && o.card === id);
}
function resolveAction(engine: VtesEngine, id: string) {
  runTrace(engine, [["Alice", id],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
}

describe("printed uniqueness previously absent from runtime queries", () => {
  it.each(fixture)("$id $name reports its own printed Unique trait", ({ id, name, types, late }) => {
    const entry = (registry as unknown as CardRegistry).entries[id];
    expect(entry?.card.name).toBe(name);
    if (!entry || entry.card.kind !== "library") throw new Error(`not library: ${id}`);
    expect(entry.card.types).toEqual(types);
    expect(entry.card.cardText).toMatch(late
      ? /(?:^|\.)\s*Unique(?:\.| (?:location|mortal|werewolf))/i
      : /^\s*(?:(?:master|equipment|ally|retainer|event)\s*[:.]\s*)?unique\b/i);
    expect(testRegistry[name]?.isUnique).toBe(true);
  });
  it("does not infer Unique from a per-minion limit or a mention of another unique card", () => {
    expect(testRegistry["Laptop Computer"]?.isUnique).not.toBe(true);
    expect(testRegistry["Concealed Weapon"]?.isUnique).not.toBe(true);
    expect(testRegistry["Sport Bike"]?.isUnique).not.toBe(true);
  });
});

describe("printed uniqueness affects actual play and contests", () => {
  it("a Blood Shield equip cannot be voluntarily duplicated, even on another minion", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.clan = "Osebo";
    state.seats[0]!.minions.push(makeMinion("V2", "Alice", { clan: "Osebo" }));
    state.seats[0]!.hand.push({ id: "shield1", name: "Blood Shield" });
    const engine = new VtesEngine(state, testRegistry);
    const option = engine.decision()!.options.find((o) => o.kind === "playCard" && o.card === "shield1" && o.minion === "V1");
    expect(option).toBeDefined();
    resolveAction(engine, option!.id);
    expect(state.seats[0]!.pool).toBe(8);
    expect(state.seats[0]!.minions[0]!.attached.some((p) => p.card.id === "shield1")).toBe(true);
    state.seats[0]!.hand.push({ id: "shield2", name: "Blood Shield" });
    expect(hasPlay(engine, "shield2")).toBe(false);
  });
  it("a rival's Blood Shield can be equipped and both copies enter a contest", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.clan = "Osebo";
    state.seats[1]!.minions[0]!.attached.push(permanent("other", "Blood Shield"));
    state.seats[0]!.hand.push({ id: "mine", name: "Blood Shield" });
    const engine = new VtesEngine(state, testRegistry);
    const option = engine.decision()!.options.find((o) => o.kind === "playCard" && o.card === "mine");
    expect(option).toBeDefined();
    resolveAction(engine, option!.id);
    engine.decision();
    expect(state.seats[0]!.contested?.map((x) => x.card.id)).toContain("mine");
    expect(state.seats[1]!.contested?.map((x) => x.card.id)).toContain("other");
  });
  it("a newly recruited unique ally cannot be recruited again", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions.push(makeMinion("V2", "Alice"));
    state.seats[0]!.hand.push({ id: "ally1", name: "Caiaphas Smith" });
    const engine = new VtesEngine(state, testRegistry);
    const option = engine.decision()!.options.find((o) => o.kind === "playCard" && o.card === "ally1" && o.minion === "V1");
    expect(option).toBeDefined();
    resolveAction(engine, option!.id);
    expect(state.seats[0]!.minions.some((m) => m.id === "ally1" && m.kind === "ally")).toBe(true);
    state.seats[0]!.hand.push({ id: "ally2", name: "Caiaphas Smith" });
    expect(hasPlay(engine, "ally2")).toBe(false);
  });
  it("employing a unique retainer prevents employing another with a different vampire", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.clan = "Banu Haqim";
    state.seats[0]!.minions.push(makeMinion("V2", "Alice", { clan: "Banu Haqim" }));
    state.seats[0]!.hand.push({ id: "ret1", name: "Nar-Sheptha" });
    const engine = new VtesEngine(state, testRegistry);
    const option = engine.decision()!.options.find((o) => o.kind === "playCard" && o.card === "ret1" && o.minion === "V1");
    expect(option).toBeDefined();
    resolveAction(engine, option!.id);
    expect(state.seats[0]!.minions[0]!.attached.some((p) => p.card.id === "ret1")).toBe(true);
    expect(state.seats[0]!.pool).toBe(9);
    state.seats[0]!.hand.push({ id: "ret2", name: "Nar-Sheptha" });
    expect(hasPlay(engine, "ret2")).toBe(false);
  });
  it("recognises a later Unique sentence on The Ankara Citadel", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.clan = "Tremere";
    state.seats[0]!.minions.push(makeMinion("V2", "Alice", { clan: "Tremere" }));
    state.seats[0]!.hand.push({ id: "new-citadel", name: "The Ankara Citadel, Turkey" });
    const engine = new VtesEngine(state, testRegistry);
    expect(hasPlay(engine, "new-citadel")).toBe(true);
    state.seats[0]!.minions[0]!.attached.push(permanent("old-citadel", "The Ankara Citadel, Turkey"));
    expect(hasPlay(engine, "new-citadel")).toBe(false);
  });
  it("a bespoke unique master reports its trait and contests a rival's copy", () => {
    const state = threeSeatGame();
    phase(state, "master");
    state.seats[0]!.minions[0]!.clan = "Banu Haqim";
    state.seats[1]!.permanents.push(permanent("other", "Alamut"));
    state.seats[0]!.hand.push({ id: "mine", name: "Alamut" });
    const engine = new VtesEngine(state, testRegistry);
    const option = engine.decision()!.options.find((o) => o.kind === "playCard" && o.card === "mine");
    expect(option).toBeDefined();
    runTrace(engine, [["Alice", option!.id], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    engine.decision();
    expect(state.seats[0]!.contested?.map((x) => x.card.id)).toContain("mine");
    expect(state.seats[1]!.contested?.map((x) => x.card.id)).toContain("other");
  });
});
