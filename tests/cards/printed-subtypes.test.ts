import { describe, expect, it } from "vitest";
import { VtesEngine, minionHasTag } from "../../src/engine/index.ts";
import type { GameState, MinionState, PermanentInPlay } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";
import registry from "../../src/cards/registry.json";
import type { CardRegistry } from "../../src/cards/types.ts";
import fixture from "./fixtures/printed-subtype-tags.json";

function minion(state: GameState, id: string): MinionState {
  const m = state.seats.flatMap((s) => s.minions).find((x) => x.id === id);
  if (!m) throw new Error(`missing minion ${id}`);
  return m;
}
function perm(id: string, name: string, tags: string[] = []): PermanentInPlay {
  return { card: { id, name }, locked: false, usedThisPhase: false, statics: {}, tags };
}
function masterPhase(state: GameState) {
  const frame = state.frames[0]!;
  if (frame.kind !== "turn") throw new Error("fixture");
  frame.phase = "master"; frame.masterActionsLeft = 1;
}
function resolveAction(engine: VtesEngine, id: string): void {
  runTrace(engine, [["Alice", id],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
}
function intoCombat(state: GameState): VtesEngine {
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [["Alice", "bleed:V1"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:M"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
  return engine;
}

describe("132 corrected printed subtype tags", () => {
  it.each(fixture)("$id $name: hand query and arriving card retain its tags", ({ id, name, type, add, remove }) => {
    const c = (registry as unknown as CardRegistry).entries[id]?.card;
    if (!c || c.kind !== "library") throw new Error(`not a library card: ${id}`);
    expect(c.name).toBe(name);
    expect(c.types).toEqual(type);
    const h = testRegistry[name]!;
    for (const tag of add) expect(h.permanentTags, name).toContain(tag);
    for (const tag of remove) expect(h.permanentTags, name).not.toContain(tag);
    const arriving = h.isAlly ? h.allyEntry?.("basic").tags
      : h.isRetainer ? h.permanentEntry?.("basic").tags
      : h.permanentTags;
    expect(arriving, name).toBeDefined();
    for (const tag of add) expect(arriving, name).toContain(tag);
    for (const tag of remove) expect(arriving, name).not.toContain(tag);
  });
  it("does not infer a subtype from a name or a later mention", () => {
    expect(testRegistry["Ghoul Escort"]!.permanentTags).toContain("ghoul");
    expect(testRegistry["Gargoyle Slave"]!.permanentTags).not.toContain("ghoul");
    expect(testRegistry["Camarilla Vitae Slave"]!.permanentTags).not.toContain("ghoul");
    expect(testRegistry["Laptop Computer"]!.permanentTags).not.toContain("weapon");
    expect(testRegistry["Sport Bike"]!.permanentTags).not.toContain("gun");
    expect(testRegistry["Amam the Devourer"]!.allyEntry!("basic").tags).toContain("mummy");
    expect(testRegistry["Amam the Devourer"]!.allyEntry!("basic").tags).not.toContain("mortal");
  });
});

describe("subtypes in actual games", () => {
  it("Fleshforge Chamber stores newly recognised ghoul ally and retainer, not an animal", () => {
    const state = threeSeatGame(); masterPhase(state);
    state.seats[0]!.permanents.push(perm("ffc", "Fleshforge Chamber"));
    state.seats[0]!.hand.push(
      { id: "bima", name: "Bima" },
      { id: "dhabi", name: "D'habi Revenant" },
      { id: "animal", name: "Duma Rafiki" },
    );
    const engine = new VtesEngine(state, testRegistry);
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("ability:Fleshforge Chamber:ffc:store:bima");
    expect(ids).toContain("ability:Fleshforge Chamber:ffc:store:dhabi");
    expect(ids).not.toContain("ability:Fleshforge Chamber:ffc:store:animal");
    runTrace(engine, [["Alice", "ability:Fleshforge Chamber:ffc:store:dhabi"]]);
    expect(state.seats[0]!.permanents.find((p) => p.card.id === "ffc")!.stored?.map((c) => c.id)).toContain("dhabi");
    expect(state.seats[0]!.hand.some((c) => c.id === "dhabi")).toBe(false);
  });
  it("Biothaumaturgic Experiment employs an Akunanse animal ignoring its clan requirement", () => {
    const state = threeSeatGame();
    Object.assign(minion(state, "V1"), { clan: "Tremere", blood: 5, disciplines: { tha: "basic" } });
    state.seats[0]!.hand.push({ id: "bx", name: "Biothaumaturgic Experiment" }, { id: "duma", name: "Duma Rafiki" });
    const luciano = makeMinion("luc", "Alice");
    const crypt = testRegistry["Luciano Carvalho (G7)"]!.cryptEntry!();
    luciano.attached.push({ ...perm("luc", "Luciano Carvalho (G7)"), statics: crypt.statics, tags: crypt.tags });
    state.seats[0]!.minions.push(luciano);
    const engine = new VtesEngine(state, testRegistry);
    const dp = engine.decision()!;
    expect(dp.options.some((o) => o.kind === "playCard" && o.card === "duma")).toBe(false);
    const opt = dp.options.find((o) => o.id.startsWith("play:Biothaumaturgic Experiment:basic:V1:duma:"));
    expect(opt).toBeDefined();
    resolveAction(engine, opt!.id);
    const attached = minion(state, "V1").attached.find((p) => p.card.id === "duma");
    expect(attached?.tags).toContain("animal");
    expect(attached?.life).toBe(2);
    expect(minion(state, "V1").blood).toBe(4);
    expect(state.seats[0]!.pool).toBe(9);
    runTrace(engine, [["Alice", "end"], ["Alice", "pass"]]);
    const move = engine.decision()!.options.find((o) => o.id.includes("discardPhaseChoice:duma:luc"));
    expect(move).toBeDefined();
    runTrace(engine, [["Alice", move!.id]]);
    expect(minion(state, "V1").attached.some((p) => p.card.id === "duma")).toBe(false);
    expect(luciano.attached.some((p) => p.card.id === "duma" && p.tags.includes("animal"))).toBe(true);
  });
  it("Scapelli enters with printed stats and is a mortal, not a generic ally", () => {
    const state = threeSeatGame(); minion(state, "V1").clan = "Giovanni";
    state.seats[0]!.hand.push({ id: "scap", name: 'Scapelli, The Family "Mechanic"' });
    const engine = new VtesEngine(state, testRegistry);
    const opt = engine.decision()!.options.find((o) => o.kind === "playCard" && o.card === "scap");
    expect(opt).toBeDefined(); resolveAction(engine, opt!.id);
    const ally = minion(state, "scap");
    expect(ally).toMatchObject({ kind: "ally", blood: 3, strength: 0, bleedAmount: 1 });
    expect(minionHasTag(ally, "mortal")).toBe(true);
    expect(state.seats[0]!.pool).toBe(7);
  });
  it("a recruited Reanimated Corpse is recognised as zombie for Ashur's starting life bonus", () => {
    function recruit(withAshur: boolean) {
      const state = threeSeatGame();
      Object.assign(minion(state, "V1"), { blood: 5, disciplines: { thn: "basic" } });
      if (withAshur) {
        const vampire = makeMinion("ashur", "Alice");
        const crypt = testRegistry["Ashur-uballit, Son of the Abyss (G6)"]!.cryptEntry!();
        vampire.attached.push({ ...perm("ashur", "Ashur-uballit, Son of the Abyss (G6)"), statics: crypt.statics, tags: crypt.tags });
        state.seats[0]!.minions.push(vampire);
      }
      state.seats[0]!.hand.push({ id: "corpse", name: "Reanimated Corpse" });
      const engine = new VtesEngine(state, testRegistry);
      const opt = engine.decision()!.options.find((o) => o.kind === "playCard" && o.card === "corpse");
      expect(opt).toBeDefined(); resolveAction(engine, opt!.id);
      return minion(state, "corpse");
    }
    const ordinary = recruit(false), enhanced = recruit(true);
    expect(minionHasTag(ordinary, "zombie")).toBe(true);
    expect(ordinary.blood).toBe(2);
    expect(enhanced.blood).toBe(3);
  });
  it("a real Ambulance equip carries the vehicle tag and prevents a second vehicle on its bearer", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions.push(makeMinion("V2", "Alice"));
    state.seats[0]!.hand.push({ id: "amb", name: "Ambulance" });
    const engine = new VtesEngine(state, testRegistry);
    const opt = engine.decision()!.options.find((o) => o.kind === "playCard" && o.card === "amb" && o.minion === "V1");
    expect(opt).toBeDefined(); resolveAction(engine, opt!.id);
    expect(minion(state, "V1").attached.find((p) => p.card.id === "amb")?.tags).toContain("vehicle");
    minion(state, "V1").locked = false;
    state.seats[0]!.hand.push({ id: "bike", name: "Sport Bike" });
    const options = engine.decision()!.options.filter((o) => o.kind === "playCard" && o.card === "bike");
    expect(options.some((o) => o.kind === "playCard" && o.minion === "V1")).toBe(false);
    expect(options.some((o) => o.kind === "playCard" && o.minion === "V2")).toBe(true);
  });
  it("Angel's Gift recognises Dagger as melee; Concealed Weapon does not assume its unknown strike is safe", () => {
    const state = threeSeatGame(); minion(state, "V1").clan = "Salubri";
    state.seats[0]!.hand.push({ id: "gift", name: "Angel's Gift" }, { id: "cw", name: "Concealed Weapon" }, { id: "dagger", name: "Dagger" });
    const engine = intoCombat(state);
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids.some((id) => id.startsWith("play:Angel's Gift:basic:V1:equip:dagger:"))).toBe(true);
    expect(ids.some((id) => id.startsWith("play:Concealed Weapon") && id.includes(":dagger:"))).toBe(false);
    const option = ids.find((id) => id.startsWith("play:Angel's Gift:basic:V1:equip:dagger:"))!;
    runTrace(engine, [["Alice", option], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(minion(state, "V1").attached.find((p) => p.card.id === "dagger")?.tags).toEqual(expect.arrayContaining(["equipment", "weapon", "melee"]));
    expect(state.seats[0]!.pool).toBe(9);
  });
});
