import { describe, expect, it } from "vitest";
import { VtesEngine, currentStealth } from "../../src/engine/index.ts";
import type { CombatFrame, GameState } from "../../src/engine/index.ts";
import { testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function until(engine: VtesEngine, predicate: () => boolean, max = 120) {
  for (let i = 0; i < max && !predicate(); i++) {
    const dp = engine.decision();
    if (predicate()) return;
    const option = dp?.options.find((o) => o.id === "pass") ?? dp?.options.find((o) => o.id === "strike:hand");
    if (!option) throw new Error(`no pass or strike at ${dp?.window}`);
    engine.choose(option.id);
  }
  expect(predicate()).toBe(true);
}
function frame(state: GameState): CombatFrame {
  const cf = state.frames.find((f) => f.kind === "combat");
  if (!cf || cf.kind !== "combat") throw new Error("no combat");
  return cf;
}
function attached(level: "basic" | "superior") {
  const state = threeSeatGame();
  const actor = state.seats[0]!.minions[0]!;
  actor.disciplines = { for: level };
  actor.blood = 6;
  state.seats[0]!.hand.push({ id: "skin", name: "Ablative Skin" });
  const engine = new VtesEngine(state, testRegistry);
  const play = engine.decision()!.options.find((o) => o.id.startsWith(`play:Ablative Skin:${level}:`));
  expect(play).toBeDefined();
  engine.choose(play!.id);
  until(engine, () => state.frames.some((f) => f.kind === "action"));
  const af = state.frames.find((f) => f.kind === "action");
  expect(af?.kind === "action" && currentStealth(state, af.actionId)).toBe(1);
  until(engine, () => actor.attached.some((p) => p.card.id === "skin"));
  until(engine, () => !state.frames.some((f) => f.kind === "action"));
  return { state, actor, engine, skin: actor.attached.find((p) => p.card.id === "skin")! };
}
function startCombat(state: GameState, engine: VtesEngine) {
  const actor = state.seats[0]!.minions[0]!;
  actor.locked = false; // a later action; no unlock card is part of this test
  const blocker = state.seats[1]!.minions.find((m) => m.id === "M")!;
  blocker.strength = 3;
  engine.choose("bleed:V1");
  until(engine, () => engine.decision()?.options.some((o) => o.id === "block:M") === true);
  engine.choose("block:M");
  until(engine, () => state.frames.some((f) => f.kind === "combat"));
  return frame(state);
}
function damageWindow(state: GameState, engine: VtesEngine) {
  until(engine, () => {
    const cf = state.frames.find((f) => f.kind === "combat");
    return cf?.kind === "combat" && cf.step === "damageResolution" && cf.pendingDamage[0]?.minion === "V1";
  });
}

describe("Ablative Skin", () => {
  it.each(["basic", "superior"] as const)("attaches three counters in %s mode", (level) => {
    const { actor, skin } = attached(level);
    expect(skin.counters).toBe(3);
    expect(skin.tags.includes("ablativeSuperior")).toBe(level === "superior");
    expect(actor.attached).toContain(skin);
  });

  it("allows multiple copies and keeps each copy's counters and mode separate", () => {
    const { state, actor, engine, skin } = attached("superior");
    actor.locked = false; // simulate the next minion phase
    actor.cannotRepeat = [];
    actor.playedSinceUnlock = [];
    state.seats[0]!.hand.push({ id: "skin2", name: "Ablative Skin" });
    const play = engine.decision()!.options.find((o) => o.id.startsWith("play:Ablative Skin:basic:") && o.id.includes(":skin2"));
    expect(play).toBeDefined();
    engine.choose(play!.id);
    until(engine, () => actor.attached.some((p) => p.card.id === "skin2"));
    const second = actor.attached.find((p) => p.card.id === "skin2")!;
    expect(second.counters).toBe(3);
    expect(second.tags).not.toContain("ablativeSuperior");
    expect(skin.tags).toContain("ablativeSuperior");
    expect(skin.counters).toBe(3);
  });

  it("burns when another effect removes the last counters", () => {
    const { state, actor, engine } = attached("basic");
    engine.removeCounters("skin", 3); // simulate another effect removing them
    engine.decision();
    expect(actor.attached.some((p) => p.card.id === "skin")).toBe(false);
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "skin")).toBe(true);
  });

  it("offers a choice of how many counters to spend, preserves unused counters and burns when depleted", () => {
    const { state, actor, engine, skin } = attached("basic");
    startCombat(state, engine);
    damageWindow(state, engine);
    expect(engine.decision()!.options.map((o) => o.id)).toEqual(expect.arrayContaining([
      "ability:Ablative Skin:skin:prevent:1", "ability:Ablative Skin:skin:prevent:2", "ability:Ablative Skin:skin:prevent:3",
    ]));
    engine.choose("ability:Ablative Skin:skin:prevent:1");
    expect(skin.counters).toBe(2);
    expect(frame(state).pendingDamage[0]!.amount).toBe(2);
    engine.choose("ability:Ablative Skin:skin:prevent:2");
    expect(actor.attached.some((p) => p.card.id === "skin")).toBe(false);
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "skin")).toBe(true);
    expect(state.eventLog.flatMap((e) => e.type === "DamagePrevented" && e.minion === "V1" ? [e.amount] : [])).toEqual([1, 2]);
  });

  it.each(["basic", "superior"] as const)("%s handles aggravated damage according to the played version", (level) => {
    const { state, engine } = attached(level);
    startCombat(state, engine).handStrikesAggravated.opposing = true;
    damageWindow(state, engine);
    const offered = engine.decision()!.options.some((o) => o.id.startsWith("ability:Ablative Skin"));
    expect(offered).toBe(level === "superior");
    if (level === "superior") {
      engine.choose("ability:Ablative Skin:skin:prevent:3");
      expect(state.eventLog.some((e) => e.type === "DamagePrevented" && e.amount === 3)).toBe(true);
    }
  });

  it("cannot prevent Blood Fury damage barred to Fortitude cards", () => {
    const { state, engine, skin } = attached("superior");
    const blocker = state.seats[1]!.minions.find((m) => m.id === "M")!;
    blocker.disciplines = { tha: "superior" };
    state.seats[1]!.hand.push({ id: "fury", name: "Blood Fury" });
    startCombat(state, engine);
    until(engine, () => engine.decision()?.options.some((o) => o.id.startsWith("play:Blood Fury:superior")) === true);
    engine.choose(engine.decision()!.options.find((o) => o.id.startsWith("play:Blood Fury:superior"))!.id);
    damageWindow(state, engine);
    expect(frame(state).pendingDamage[0]!.noPreventBy).toContain("for");
    expect(engine.decision()!.options.some((o) => o.id.startsWith("ability:Ablative Skin"))).toBe(false);
    expect(skin.counters).toBe(3);
  });

  it("does not attach when blocked", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.disciplines = { for: "basic" };
    state.seats[0]!.hand.push({ id: "skin", name: "Ablative Skin" });
    const blocker = state.seats[1]!.minions.find((m) => m.id === "M")!;
    blocker.attached.push({ card: { id: "int", name: "intercept" }, locked: false, usedThisPhase: false, statics: { intercept: 1 }, tags: [] });
    const engine = new VtesEngine(state, testRegistry);
    engine.choose(engine.decision()!.options.find((o) => o.id.startsWith("play:Ablative Skin:basic"))!.id);
    until(engine, () => engine.decision()?.options.some((o) => o.id === "block:M") === true);
    engine.choose("block:M");
    until(engine, () => !state.frames.some((f) => f.kind === "action"));
    expect(state.seats[0]!.minions[0]!.attached.some((p) => p.card.id === "skin")).toBe(false);
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "skin")).toBe(true);
  });
});
