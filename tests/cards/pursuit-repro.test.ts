/**
 * Repro test: Pursuit superior should be available as a chooseStrike option
 * even when the acting minion has cel:superior and the card is in hand.
 * Bug: after the last 2 commits, Pursuit:superior was not offered, so the 
 * player chose hand strike and combat ended without the additional strike opportunity.
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
  it("offers Pursuit:superior as an option during chooseStrike in normal round", () => {
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

    // Pursuit:superior should be offered (it grants +1 additional strike)
    const hasPursuit = dp.options.some(o => o.id.startsWith("play:Pursuit:superior"));
    expect(hasPursuit).toBe(true);
  });

  it("after playing Pursuit:superior, an additional strike sub-round occurs", () => {
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
      ["Alice", "play:Pursuit:superior"], // grant 1 additional strike
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as-played
      ["Alice", "strike:hand"], // V1's normal strike
      ["Bob", "strike:hand"], // M's normal strike
      ["Alice", "pass"], // V1 mends M's 1 damage
      ["Bob", "pass"], // M mends V1's 1 damage
      // Additional sub-round: only V1 has additional strikes
      ["Alice", "strike:hand"],
      ["Bob", "pass"], // M mends
      ["Alice", "pass"], ["Bob", "pass"], // press
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // end of round
    ]);

    // M took 2 hand strikes of 1 (normal + 1 additional), mended each.
    expect(m.blood).toBe(3); // 5 - 2
  });
});
