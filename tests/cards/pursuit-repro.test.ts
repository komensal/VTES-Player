/**
 * Repro test: Pursuit superior should be available in the
 * announceAdditionalStrikes window (p. 32), NOT during chooseStrike.
 * Bug: Pursuit was offered during chooseStrike, so players couldn't use it
 * to grant additional strikes before the first pair resolved.
 */

import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function enterCombat(engine: VtesEngine): void {
  runTrace(engine, [
    ["Alice", "bleed:V1"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"],
    ["Bob", "block:M"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
}

const toStrikes: Array<[string, string]> = [
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // before range
  ["Alice", "pass"], ["Bob", "pass"], // range → close
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // before strikes
];

describe("Pursuit superior — additional strike in normal strike round", () => {
  it("does NOT offer Pursuit:superior during chooseStrike (it's for announceAdditionalStrikes)", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { cel: "superior" };
    v1.blood = 3;
    const m = state.seats[1]!.minions.find(m => m.id === "M")!;
    m.blood = 3;
    // Give V1 a Pursuit card
    state.seats[0]!.hand.push({ id: "pu1", name: "Pursuit" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, toStrikes);

    // Now we should be at chooseStrike for V1 (acting side)
    const dp = engine.decision()!;
    expect(dp.window).toBe("combat.chooseStrike");
    expect(dp.seat).toBe("Alice");

    // Pursuit:superior should NOT be offered during chooseStrike; it's only
    // available in the announceAdditionalStrikes window after the first pair resolves
    const hasPursuit = dp.options.some(o => o.id.startsWith("play:Pursuit:superior"));
    expect(hasPursuit).toBe(false);
  });

  it("offers Pursuit:superior in announceAdditionalStrikes after the first pair resolves", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { cel: "superior" };
    v1.blood = 5;
    const m = state.seats[1]!.minions.find(m => m.id === "M")!;
    m.blood = 5;
    m.capacity = 5;
    state.seats[0]!.hand.push({ id: "pu1", name: "Pursuit" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, [
      ...toStrikes,
      ["Alice", "strike:hand"], // V1's normal strike
      ["Bob", "strike:hand"], // M's normal strike
      ["Alice", "pass"], // V1 mends M's 1 damage
      ["Bob", "pass"], // M mends V1's 1 damage
      // Announce additional strikes window (p. 32): acting minion decides first
      ["Alice", "play:Pursuit:superior"], // grant 1 additional strike
      // card.asPlayed: all seats respond in order
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      // Alternation: opposing next, then acting. Two consecutive declines settle.
      ["Bob", "pass"], // decline
      ["Alice", "pass"], // decline → all declined, enter additional sub-round
      // Additional sub-round: only V1 has additional strikes
      ["Alice", "strike:hand"],
      ["Bob", "pass"], // M mends
      ["Alice", "pass"],
      ["Bob", "pass"], // press (no press needed, equal damage)
      ["Alice", "pass"],
      ["Bob", "pass"],
      ["Carol", "pass"], // end of round
    ]);

    // M took 2 hand strikes of 1 (normal + 1 additional), mended each.
    expect(m.blood).toBe(3); // 5 - 2
  });
});
