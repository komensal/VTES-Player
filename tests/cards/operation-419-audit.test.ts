import { describe, expect, it } from "vitest";
import { VtesEngine, currentStealth } from "../../src/engine/index.ts";
import type { PermanentInPlay } from "../../src/engine/index.ts";
import { testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function operation(counters = 0): PermanentInPlay {
  return { card: { id: "op", name: "419 Operation" }, counters, locked: false,
    usedThisPhase: false, statics: {}, tags: ["419 Operation"] };
}
function unlock(counters = 0) {
  const state = threeSeatGame();
  const tf = state.frames[0]!;
  if (tf.kind !== "turn") throw new Error("missing turn");
  tf.phase = "unlock";
  tf.unlockDone = false;
  tf.unlockAbilitiesDone = false;
  const card = operation(counters);
  state.seats[0]!.permanents.push(card);
  return { state, card, engine: new VtesEngine(state, testRegistry) };
}
function until(engine: VtesEngine, condition: () => boolean) {
  for (let i = 0; i < 100 && !condition(); i++) {
    const dp = engine.decision();
    if (condition()) break;
    const option = dp?.options.find((o) => o.id === "pass") ?? dp?.options.find((o) => o.id === "strike:hand");
    if (!option) throw new Error(`no pass or strike in ${dp?.window}`);
    engine.choose(option.id);
  }
  expect(condition()).toBe(true);
}

describe("419 Operation", () => {
  it("requires an Osebo, has +1 stealth, and stays in play after success", () => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    state.seats[0]!.hand.push({ id: "op", name: "419 Operation" });
    const engine = new VtesEngine(state, testRegistry);
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:419 Operation"))).toBe(false);
    actor.clan = "Osebo";
    const play = engine.decision()!.options.find((o) => o.id.startsWith("play:419 Operation"))!;
    expect(play).toBeDefined();
    engine.choose(play.id);
    until(engine, () => state.frames.some((f) => f.kind === "action"));
    const af = state.frames.find((f) => f.kind === "action")!;
    if (af.kind !== "action") throw new Error("no action");
    expect(currentStealth(state, af.actionId)).toBe(1);
    until(engine, () => state.seats[0]!.permanents.some((p) => p.card.id === "op"));
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "op")).not.toBe(true);
  });

  it("is burned instead of entering play when blocked", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.clan = "Osebo";
    state.seats[0]!.hand.push({ id: "op", name: "419 Operation" });
    state.seats[1]!.minions.find((m) => m.id === "M")!.attached.push({ card: { id: "int", name: "intercept" },
      locked: false, usedThisPhase: false, statics: { intercept: 1 }, tags: [] });
    const engine = new VtesEngine(state, testRegistry);
    engine.choose(engine.decision()!.options.find((o) => o.id.startsWith("play:419 Operation"))!.id);
    until(engine, () => engine.decision()?.options.some((o) => o.id === "block:M") === true);
    engine.choose("block:M");
    until(engine, () => !state.frames.some((f) => f.kind === "action"));
    expect(state.seats[0]!.permanents.some((p) => p.card.id === "op")).toBe(false);
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "op")).toBe(true);
  });

  it("moves one pool from prey and allows only one of its two options per phase", () => {
    const { state, card, engine } = unlock(2);
    expect(engine.decision()!.options.map((o) => o.id)).toContain("ability:419 Operation:op:cash");
    engine.choose("ability:419 Operation:op:collect");
    expect(state.seats[1]!.pool).toBe(9);
    expect(card.counters).toBe(3);
    expect(engine.decision()!.options.some((o) => o.id.startsWith("ability:419 Operation:op:"))).toBe(false);
  });

  it("moves the entire pile to its controller without burning the card", () => {
    const { state, card, engine } = unlock(3);
    engine.choose("ability:419 Operation:op:cash");
    expect(state.seats[0]!.pool).toBe(13);
    expect(card.counters).toBe(0);
    expect(state.seats[0]!.permanents).toContain(card);
  });

  it.each([0, 3])("lets the prey burn the Edge to recover %i counters and burn the card", (count) => {
    const { state, engine } = unlock(count);
    state.edge = "Bob";
    until(engine, () => engine.decision()?.seat === "Bob");
    const dp = engine.decision()!;
    expect(dp.options.some((o) => o.id === "ability:419 Operation:op:burn:Bob")).toBe(true);
    engine.choose("ability:419 Operation:op:burn:Bob");
    expect(state.edge).toBeNull();
    expect(state.seats[1]!.pool).toBe(10 + count);
    expect(state.seats[0]!.permanents).toHaveLength(0);
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "op")).toBe(true);
  });

  it("uses the current prey, not the prey when the card entered play", () => {
    const { state, engine } = unlock();
    state.seats[1]!.ousted = true;
    engine.choose("ability:419 Operation:op:collect");
    expect(state.seats[2]!.pool).toBe(9);
    expect(state.seats[1]!.pool).toBe(10);
  });
});
