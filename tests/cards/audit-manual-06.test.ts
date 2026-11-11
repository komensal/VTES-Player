import { describe, expect, it } from "vitest";
import { VtesEngine, currentBleed, playCostFor } from "../../src/engine/index.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function atEffects(engine: VtesEngine, action = "bleed:V1") {
  runTrace(engine, [["Alice", action], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
}
function playModifier(engine: VtesEngine, prefix: string) {
  const id = engine.decision()!.options.find((o) => o.id.startsWith(prefix))?.id;
  expect(id, `missing ${prefix}`).toBeDefined();
  runTrace(engine, [["Alice", id!], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
}

describe("Charisma — legal bearer", () => {
  it("can be placed on any ready vampire, but not one in torpor or an ally", () => {
    const state = threeSeatGame();
    const tf = state.frames[0]!;
    if (tf.kind !== "turn") throw new Error("fixture");
    tf.phase = "master"; tf.masterActionsLeft = 1;
    state.seats[0]!.hand = [{ id: "ch", name: "Charisma" }];
    state.seats[1]!.minions.push(makeMinion("t", "Bob", { inTorpor: true }), makeAlly("a", "Bob", 2));
    const engine = new VtesEngine(state, testRegistry);
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Charisma:-:V1:ch");
    expect(ids).toContain("play:Charisma:-:W:ch");
    expect(ids).not.toContain("play:Charisma:-:t:ch");
    expect(ids).not.toContain("play:Charisma:-:a:ch");
    runTrace(engine, [["Alice", "play:Charisma:-:W:ch"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    const w = state.seats[1]!.minions.find((m) => m.id === "W")!;
    expect(w.attached.some((p) => p.card.id === "ch")).toBe(true);
    expect(playCostFor(state, { name: "Aggressive Corpse", bloodCost: 2, poolCost: 0, types: ["ally"], requires: [] }, w, null, null).blood).toBe(1);
  });
});

describe("Changeling — distinct Vicissitude modes", () => {
  it("basic gives limited bleed, not stealth", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.disciplines = { vic: "basic" };
    state.seats[0]!.hand = [{ id: "c", name: "Changeling" }];
    const engine = new VtesEngine(state, testRegistry);
    atEffects(engine);
    playModifier(engine, "play:Changeling:basic:");
    const af = state.frames.find((f) => f.kind === "action");
    if (!af || af.kind !== "action") throw new Error("action missing");
    expect(currentBleed(state, af)).toBe(2);
    expect(state.eventLog.some((e) => e.type === "StealthModified" && e.source === "Changeling")).toBe(false);
  });
  it("basic is not offered on a hunt, while superior stealth works on a block attempt", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.disciplines = { vic: "superior" };
    state.seats[0]!.minions[0]!.blood = 1;
    state.seats[0]!.hand = [{ id: "c", name: "Changeling" }];
    state.seats[1]!.minions.find((m) => m.id === "M")!.attached.push({ card: { id: "i", name: "test" }, locked: false, usedThisPhase: false, statics: { intercept: 1 }, tags: [] });
    const engine = new VtesEngine(state, testRegistry);
    atEffects(engine, "hunt:V1");
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:Changeling:basic:"))).toBe(false);
    runTrace(engine, [["Alice", "pass"], ["Bob", "block:M"]]);
    playModifier(engine, "play:Changeling:superior:");
    expect(state.eventLog.some((e) => e.type === "StealthModified" && e.source === "Changeling")).toBe(true);
  });
});

describe("Command of the Beast — non-limited superior", () => {
  it("permits superior after a limited modifier, but not a second limited modifier", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.disciplines = { dom: "superior" };
    state.seats[0]!.hand = [{ id: "c1", name: "Command of the Beast" }, { id: "c2", name: "Conditioning" }];
    const engine = new VtesEngine(state, testRegistry);
    atEffects(engine);
    playModifier(engine, "play:Conditioning:basic:");
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids.some((id) => id.startsWith("play:Command of the Beast:basic:"))).toBe(false);
    expect(ids.some((id) => id.startsWith("play:Command of the Beast:superior:"))).toBe(true);
    playModifier(engine, "play:Command of the Beast:superior:");
    const af = state.frames.find((f) => f.kind === "action");
    if (!af || af.kind !== "action") throw new Error("action missing");
    expect(currentBleed(state, af)).toBe(4);
  });
  it("neither mode is offered during a hunt", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.disciplines = { dom: "superior" };
    state.seats[0]!.minions[0]!.blood = 1;
    state.seats[0]!.hand = [{ id: "c", name: "Command of the Beast" }];
    const engine = new VtesEngine(state, testRegistry);
    atEffects(engine, "hunt:V1");
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:Command of the Beast:"))).toBe(false);
  });
});

describe("Conflagration — Daimoinon levels", () => {
  it.each([["basic", false], ["superior", true]] as const)("offers superior only with %s Daimoinon", (level, superior) => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.disciplines = { dai: level };
    state.seats[0]!.minions[0]!.blood = 4;
    state.seats[0]!.hand = [{ id: "c", name: "Conflagration" }];
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids.some((id) => id.startsWith("play:Conflagration:basic:"))).toBe(true);
    expect(ids.some((id) => id.startsWith("play:Conflagration:superior:"))).toBe(superior);
    playModifier(engine, `play:Conflagration:${level}:`);
    expect(state.eventLog.some((e) => e.type === "CardPlayed" && e.name === "Conflagration" && e.discipline === "dai")).toBe(true);
    runTrace(engine, [["Bob", "strike:hand"]]);
    for (let i = 0; i < 12 && !state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M"); i++) {
      const dp = engine.decision();
      if (!dp) break;
      engine.choose((dp.options.find((o) => o.id === "pass") ?? dp.options[0]!).id);
    }
    expect(state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M" && e.amount === (superior ? 2 : 1) && e.aggravated)).toBe(true);
  });
});

describe("Confusion — bleed-only restriction", () => {
  it("does not offer superior stealth during a hunt, even when a block is underway", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.disciplines = { dem: "superior" };
    state.seats[0]!.minions[0]!.blood = 1;
    state.seats[0]!.hand = [{ id: "c", name: "Confusion" }];
    state.seats[1]!.minions.find((m) => m.id === "M")!.attached.push({ card: { id: "i", name: "test" }, locked: false, usedThisPhase: false, statics: { intercept: 1 }, tags: [] });
    const engine = new VtesEngine(state, testRegistry);
    atEffects(engine, "hunt:V1");
    runTrace(engine, [["Alice", "pass"], ["Bob", "block:M"]]);
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:Confusion:"))).toBe(false);
  });
  it("still offers the basic limited +1 during a bleed", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.disciplines = { dem: "superior" };
    state.seats[0]!.hand = [{ id: "c", name: "Confusion" }];
    const engine = new VtesEngine(state, testRegistry);
    atEffects(engine);
    playModifier(engine, "play:Confusion:basic:");
    const af = state.frames.find((f) => f.kind === "action");
    if (!af || af.kind !== "action") throw new Error("action missing");
    expect(currentBleed(state, af)).toBe(2);
  });
});

describe("Compress — distinct basic discipline modes", () => {
  it.each([["pot", "pot", 3, false], ["thn", "thn", 2, true]] as const)("resolves %s instead of the other basic mode", (discipline, variant, amount, aggravated) => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.disciplines = { [discipline]: "basic" };
    state.seats[0]!.minions[0]!.blood = 5;
    state.seats[0]!.minions[0]!.strength = 1;
    state.seats[0]!.hand = [{ id: "c", name: "Compress" }];
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    const option = engine.decision()!.options.find((o) => o.kind === "playCard" && o.name === "Compress" && o.params["variant"] === variant);
    expect(option).toBeDefined();
    runTrace(engine, [["Alice", option!.id], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Bob", "strike:hand"]]);
    expect(state.eventLog.some((e) => e.type === "CardPlayed" && e.name === "Compress" && e.discipline === discipline)).toBe(true);
    for (let i = 0; i < 12 && !state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M"); i++) {
      const dp = engine.decision(); if (!dp) break;
      engine.choose((dp.options.find((o) => o.id === "pass") ?? dp.options[0]!).id);
    }
    expect(state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M" && e.amount === amount && !!e.aggravated === aggravated)).toBe(true);
  });
});
