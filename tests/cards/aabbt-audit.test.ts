import { describe, expect, it } from "vitest";
import { VtesEngine, type GameState, type MinionState } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function find(state: GameState, id: string): MinionState {
  const m = state.seats.flatMap((s) => s.minions).find((m) => m.id === id);
  if (!m) throw new Error(`no minion ${id}`);
  return m;
}

function combat(fury = false, aggravated = false) {
  const state = threeSeatGame();
  const attacker = find(state, "V1");
  Object.assign(attacker, { blood: 4, strength: 2, disciplines: { tha: "superior" } });
  const aabbt = find(state, "M");
  const spec = testRegistry["Aabbt Kindred (G2)"]!.cryptEntry!();
  Object.assign(aabbt, { name: "Aabbt Kindred (G2)", blood: 4, strength: 0 });
  aabbt.attached.push({ card: { id: aabbt.id, name: aabbt.name }, controller: "Bob", owner: "Bob", locked: false,
    usedThisPhase: false, statics: spec.statics, tags: spec.tags });
  if (fury) state.seats[0]!.hand.push({ id: "fury", name: "Blood Fury" });
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "bleed:V1"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:M"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "pass"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
  if (aggravated) {
    const cf = state.frames.find((f) => f.kind === "combat");
    if (!cf || cf.kind !== "combat") throw new Error("no combat");
    cf.handStrikesAggravated.acting = true; // isolate aggravated damage without requiring another card
  }
  if (fury) {
    runTrace(engine, [["Alice", "play:Blood Fury:superior:V1:fury"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Bob", "strike:hand"]]);
  } else {
    runTrace(engine, [["Alice", "strike:hand"], ["Bob", "strike:hand"]]);
  }
  return { state, engine, aabbt };
}

const prevent = "ability:Aabbt Kindred (G2):M:preventSelf";

describe("Aabbt Kindred — prevention", () => {
  it("imports the non-unique crypt card and its ability into all crypt zones", () => {
    const deck = (seat: string, id: number): SnapshotDeck => ({
      seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 0 }],
      crypt: [{ id }], library: [], pool: 20,
    });
    const state = buildGame({ decks: [deck("Alice", 200001), deck("Bob", 200067), deck("Carol", 200132)], seed: 1, maxTurns: 40 });
    const seat = state.seats[0]!;
    for (const m of [seat.minions[0]!, seat.uncontrolled[0]!.card, seat.crypt[0]!]) {
      expect(m.nonUnique).toBe(true);
      expect(m.attached.find((p) => p.card.id === m.id)).toBeDefined();
    }
  });

  it("prevents one damage and cannot use the ability again in that combat", () => {
    const { state, engine, aabbt } = combat();
    expect(engine.decision()!.options.some((o) => o.id === prevent)).toBe(true);
    engine.choose(prevent);
    const cf = state.frames.find((f) => f.kind === "combat");
    if (!cf || cf.kind !== "combat") throw new Error("no combat");
    expect(cf.usedThisCombat).toContain("M");
    expect(cf.pendingDamage[0]?.amount).toBe(1);
    expect(state.eventLog.filter((e) => e.type === "DamagePrevented" && e.minion === "M")).toHaveLength(1);
    expect(aabbt.blood).toBe(4);
    for (let i = 0; i < 20 && state.frames.includes(cf); i++) {
      const dp = engine.decision();
      if (!dp) break;
      expect(dp.options.some((o) => o.id === prevent)).toBe(false);
      engine.choose((dp.options.find((o) => o.id === "pass") ?? dp.options[0]!).id);
    }
    expect(aabbt.blood).toBe(3);
  });

  it("can use prevention again in a later combat during the same turn", () => {
    const { state, engine } = combat();
    engine.choose(prevent);
    for (let i = 0; i < 80 && state.frames.some((f) => f.kind === "combat" || f.kind === "action"); i++) {
      const dp = engine.decision();
      if (!dp) throw new Error("no decision");
      engine.choose((dp.options.find((o) => o.id === "pass") ?? dp.options[0]!).id);
    }
    expect(state.frames.some((f) => f.kind === "combat" || f.kind === "action")).toBe(false);
    state.seats[0]!.minions.push(makeMinion("V2", "Alice", { blood: 4, strength: 2 }));
    engine.emit({ type: "MinionUnlocked", minion: "M" }); // stand-in for an unlock effect between combats
    runTrace(engine, [
      ["Alice", "bleed:V2"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "block:M"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "strike:hand"], ["Bob", "strike:hand"],
    ]);
    expect(engine.decision()!.options.some((o) => o.id === prevent)).toBe(true);
    engine.choose(prevent);
    expect(state.eventLog.filter((e) => e.type === "DamagePrevented" && e.minion === "M")).toHaveLength(2);
  });

  it("does not prevent unpreventable damage", () => {
    const { state, engine, aabbt } = combat();
    const cf = state.frames.find((f) => f.kind === "combat");
    if (!cf || cf.kind !== "combat" || !cf.pendingDamage[0]) throw new Error("no damage");
    cf.pendingDamage[0].unpreventable = true; // isolate a real damage packet with this property
    for (let i = 0; i < 40 && aabbt.blood === 4; i++) {
      const dp = engine.decision();
      if (!dp || aabbt.blood !== 4) break;
      expect(dp.options.some((o) => o.id === prevent)).toBe(false);
      engine.choose((dp.options.find((o) => o.id === "pass") ?? dp.options[0]!).id);
    }
    expect(aabbt.blood).toBe(2);
    expect(state.eventLog.some((e) => e.type === "DamagePrevented" && e.minion === "M")).toBe(false);
  });

  it("can prevent aggravated damage", () => {
    const { state, engine } = combat(false, true);
    const cf = state.frames.find((f) => f.kind === "combat");
    if (!cf || cf.kind !== "combat") throw new Error("no combat");
    expect(cf.pendingDamage[0]?.aggravated).toBe(true);
    expect(engine.decision()!.options.some((o) => o.id === prevent)).toBe(true);
    engine.choose(prevent);
    expect(state.eventLog.some((e) => e.type === "DamagePrevented" && e.minion === "M" && e.amount === 1)).toBe(true);
  });

  it("can prevent Blood Fury even though it bars cards requiring Fortitude", () => {
    const { state, engine } = combat(true);
    const cf = state.frames.find((f) => f.kind === "combat");
    if (!cf || cf.kind !== "combat") throw new Error("no combat");
    expect(cf.pendingDamage[0]?.noPreventBy).toContain("for");
    expect(engine.decision()!.options.some((o) => o.id === prevent)).toBe(true);
    engine.choose(prevent);
    expect(state.eventLog.some((e) => e.type === "DamagePrevented" && e.minion === "M" && e.amount === 1)).toBe(true);
  });
});
