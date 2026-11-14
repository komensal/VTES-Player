import { describe, expect, it } from "vitest";
import type { CardMode } from "../../src/cards/effects/spec.ts";
import { buildHandlerRegistry, cardSpecs } from "../../src/cards/effects/cards.ts";
import { VtesEngine, currentIntercept, playCostFor } from "../../src/engine/index.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";
import fixture from "./fixtures/library-clan-icons.json";

// Snapshot of the 191 minion cards whose vampire-clan icon was absent from
// their effective handler before this repair. The separate Avenger creed card
// is intentionally excluded until Imbued are represented correctly.
const specById = new Map(cardSpecs.map((spec) => [spec.krcgId, spec]));
function disciplinesFor(modes: CardMode[]): Record<string, "superior"> {
  const all: Record<string, "superior"> = {};
  for (const mode of modes) {
    const d = mode.discipline;
    const values = d === null ? [] : typeof d === "string" ? [d] : Array.isArray(d) ? d : d.all;
    for (const value of values) all[value] = "superior";
  }
  return all;
}

describe("191 missing printed vampire-clan requirements", () => {
  it.each(fixture)("$id $name: queries and all ordinary modes require the playing vampire's clan", ({ id, name, clans }) => {
    const spec = specById.get(id)!;
    const handler = testRegistry[name]!;
    expect(handler.requiresClans!()).toEqual(clans);
    const disciplines = disciplinesFor(spec.modes);
    for (const clan of clans) {
      const eligible = makeMinion("v", "Alice", { clan, disciplines });
      expect(handler.modesPlayableBy!(eligible), `${name} ${clan}`).not.toEqual([]);
      // The same printed requirement cannot be met by a different vampire
      // controlled by the same Methuselah, or by a fictitious clan-bearing ally.
      const ally = makeAlly("a", "Alice", 4, { clan, disciplines });
      expect(handler.modesPlayableBy!(ally), `${name} ally`).toEqual([]);
    }
    const wrong = makeMinion("wrong", "Alice", { clan: "__not_this_clan__", disciplines });
    expect(handler.modesPlayableBy!(wrong), `${name} wrong clan`).toEqual([]);
    // A source that explicitly ignores requirements may waive the icon too.
    expect(handler.modesPlayableBy!(wrong, true), `${name} ignore requirements`).not.toEqual([]);
  });
  it("does not mistake an Imbued creed icon for a vampire clan", () => {
    expect(testRegistry["Living Wood Staff"]!.requiresClans!()).toEqual([]);
  });
  it("rejects a contradictory explicit clan rather than reporting an empty cost requirement", () => {
    const spec = specById.get(100002)!;
    const previous = spec.requiresClan;
    try {
      spec.requiresClan = ["Ventrue"];
      expect(() => buildHandlerRegistry()).toThrow("Conflicting printed and explicit clan requirements: 419 Operation");
    } finally {
      if (previous === undefined) delete spec.requiresClan;
      else spec.requiresClan = previous;
    }
  });
});

function offers(card: string, clan: string, kind: "vampire" | "ally" = "vampire") {
  const state = threeSeatGame();
  const actor = state.seats[0]!.minions[0]!;
  Object.assign(actor, { clan, kind, blood: 10, capacity: 10 });
  state.seats[0]!.pool = 40;
  state.seats[0]!.hand = [{ id: "c", name: card }];
  const engine = new VtesEngine(state, testRegistry);
  return engine.decision()!.options.some((o) => o.kind === "playCard" && o.name === card && o.minion === actor.id);
}

describe("the acting minion is gated in real play", () => {
  it.each([
    ["419 Operation", "Osebo"],
    ["Abyssal Hunter", "Lasombra"],
    ["The Ancestor's Talisman", "Banu Haqim"],
    ["D'habi Revenant", "Baali"],
    ["Benefit Performance", "Daughter of Cacophony"],
  ])("%s requires the playing %s", (card, clan) => {
    expect(offers(card, clan)).toBe(true);
    expect(offers(card, "Ventrue")).toBe(false);
    expect(offers(card, clan, "ally")).toBe(false);
  });
  it("accepts either icon on Create Gargoyle, not an unrelated clan", () => {
    expect(offers("Create Gargoyle", "Tremere")).toBe(true);
    expect(offers("Create Gargoyle", "Tremere antitribu")).toBe(true);
    expect(offers("Create Gargoyle", "Malkavian")).toBe(false);
  });
  it("does not let a DIFFERENT matching vampire satisfy the acting vampire's icon", () => {
    const state = threeSeatGame();
    state.seats[0]!.hand = [{ id: "c", name: "419 Operation" }];
    state.seats[0]!.minions[0]!.clan = "Ventrue";
    state.seats[0]!.minions.push(makeMinion("V2", "Alice", { clan: "Osebo", blood: 5 }));
    const options = new VtesEngine(state, testRegistry).decision()!.options;
    expect(options.some((o) => o.kind === "playCard" && o.name === "419 Operation" && o.minion === "V1")).toBe(false);
    expect(options.some((o) => o.kind === "playCard" && o.name === "419 Operation" && o.minion === "V2")).toBe(true);
  });
  it("a printed clan action modifier is offered only to the right acting vampire", () => {
    function canPlay(clan: string) {
      const state = threeSeatGame();
      const actor = state.seats[0]!.minions[0]!;
      actor.clan = clan; actor.blood = 5;
      state.seats[0]!.hand = [{ id: "ui", name: "Uncontrolled Impulse" }];
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "block:M"]]);
      return engine.decision()!.options.some((o) => o.kind === "playCard" && o.name === "Uncontrolled Impulse");
    }
    expect(canPlay("Ishtarri")).toBe(true);
    expect(canPlay("Toreador")).toBe(false);
  });
  it("a printed clan reaction is offered only to the right blocking vampire", () => {
    function canPlay(clan: string) {
      const state = threeSeatGame();
      const blocker = state.seats[1]!.minions.find((m) => m.id === "M")!;
      blocker.clan = clan;
      state.seats[1]!.hand = [{ id: "cv", name: "Covincraft" }];
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [["Alice", "hunt:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"]]);
      const decision = engine.decision()!;
      expect(decision.seat).toBe("Bob");
      return decision.options.some((o) => o.kind === "playCard" && o.name === "Covincraft" && o.minion === "M");
    }
    expect(canPlay("Kiasyd")).toBe(true);
    expect(canPlay("Ventrue")).toBe(false);
  });
  it("a printed clan combat card is offered only to the right combatant", () => {
    function canPlay(clan: string) {
      const state = threeSeatGame();
      const actor = state.seats[0]!.minions[0]!;
      actor.clan = clan;
      state.seats[0]!.hand = [{ id: "rt", name: "Raking Talons" }];
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
      expect(state.frames.some((f) => f.kind === "combat")).toBe(true);
      runTrace(engine, [["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
      return engine.decision()!.options.some((o) => o.kind === "playCard" && o.name === "Raking Talons");
    }
    expect(canPlay("Gargoyle")).toBe(true);
    expect(canPlay("Tremere")).toBe(false);
  });
});

describe("playing through another card", () => {
  function piper(clan: string, pool: number, tax: boolean) {
    const state = threeSeatGame();
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("missing turn");
    turn.phase = "master"; turn.masterActionsLeft = 1;
    const actor = state.seats[0]!.minions[0]!;
    Object.assign(actor, { clan, sect: "anarch", blood: 5 });
    state.seats[0]!.pool = pool;
    state.seats[0]!.hand = [{ id: "pi", name: "Piper" }, { id: "ally", name: "Abyssal Hunter" }];
    if (tax) actor.attached.push({ card: { id: "tax", name: "test" }, locked: false, usedThisPhase: false,
      statics: { playCostMod: { amount: 1, pays: "pool", requiresClan: ["Lasombra"], minions: "bearer" } }, tags: [] });
    return { state, engine: new VtesEngine(state, testRegistry) };
  }
  it("Piper enforces the ally's icon for the recruiting Anarch", () => {
    const option = (clan: string) => piper(clan, 10, false).engine.decision()!.options.some((o) => o.id.startsWith("play:Piper:") && o.id.includes(":ally:"));
    expect(option("Lasombra")).toBe(true);
    expect(option("Ventrue")).toBe(false);
  });
  it("Piper prices a clan-dependent tax during enumeration and payment", () => {
    const low = piper("Lasombra", 3, true);
    expect(low.engine.decision()!.options.some((o) => o.id.startsWith("play:Piper:") && o.id.includes(":ally:"))).toBe(false);
    const { state, engine } = piper("Lasombra", 4, true);
    const option = engine.decision()!.options.find((o) => o.id.startsWith("play:Piper:") && o.id.includes(":ally:"));
    expect(option).toBeDefined();
    runTrace(engine, [["Alice", option!.id], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(state.seats[0]!.pool).toBe(1);
    expect(state.seats[0]!.minions.some((m) => m.id === "ally")).toBe(true);
  });
});

describe("central clan query and pricing", () => {
  it("reports icons to cost modifiers without mistaking a bearer clan for the card requirement", () => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    actor.clan = "Lasombra";
    actor.attached.push({ card: { id: "mod", name: "test" }, locked: false, usedThisPhase: false,
      statics: { playCostMod: { amount: 1, pays: "pool", requiresClan: ["Lasombra"], minions: "bearer" } }, tags: [] });
    const h = testRegistry["Abyssal Hunter"]!;
    const args = { name: h.name, bloodCost: h.bloodCost, poolCost: h.poolCost ?? 0, types: h.costTypes!("basic"), requires: [], requiresClans: h.requiresClans!() };
    expect(playCostFor(state, args, actor, null, null, actor.id, "Alice").pool).toBe((h.poolCost ?? 0) + 1);
    expect(playCostFor(state, { ...args, requiresClans: [] }, actor, null, null, actor.id, "Alice").pool).toBe(h.poolCost ?? 0);
  });
  it("does not alter an existing action's intercept as an unrelated side effect", () => {
    const state = threeSeatGame();
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", "bleed:V1"]]);
    const event = state.eventLog.find((e) => e.type === "ActionAnnounced");
    if (!event || event.type !== "ActionAnnounced") throw new Error("no action");
    expect(currentIntercept(state, event.actionId, "M")).toBe(0);
  });
});
