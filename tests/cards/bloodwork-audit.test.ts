/**
 * Bloodwork (100225).
 *
 * Requires a ready Black Hand vampire.
 * Ⓓ Bleed at +1 bleed. If more than 2 pool is bled with this action,
 * ignore the excess. If the Methuselah you are bleeding controls a ready
 * Sabbat vampire, this action is at +1 stealth.
 */

import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function game(sabbatPrey: boolean): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const v1 = state.seats[0]!.minions[0]!;
  Object.assign(v1, { blackHand: true, blood: 3, capacity: 6 });
  state.seats[0]!.hand = [{ id: "bw", name: "Bloodwork" }];
  if (sabbatPrey) {
    // The prey's ready Sabbat vampire is what turns the stealth on.
    Object.assign(state.seats[1]!.minions[0]!, { sect: "sabbat" });
  } else {
    Object.assign(state.seats[1]!.minions[0]!, { sect: "camarilla" });
  }
  return { state, engine: new VtesEngine(state, testRegistry) };
}

function resolveUnblocked(engine: VtesEngine): void {
  runTrace(engine, [
    ["Alice", "play:Bloodwork:basic:V1:bw"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // announce
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // A
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // C → resolve
  ]);
}

describe("Bloodwork (100225)", () => {
  it("requires a Black Hand vampire", () => {
    const { state, engine } = game(true);
    state.seats[0]!.minions[0]!.blackHand = false;
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:Bloodwork"))).toBe(false);
  });

  it("bleeds at +1 bleed", () => {
    const { state, engine } = game(true);
    resolveUnblocked(engine);
    // Base 1 + the printed 1 = 2, which is exactly the cap.
    expect(state.seats[1]!.pool).toBe(8);
  });

  it("caps the bleed at 2 pool, ignoring the excess", () => {
    const { state, engine } = game(true);
    state.seats[0]!.minions[0]!.bleedAmount = 5; // 5 + 1 would be 6 without the cap
    resolveUnblocked(engine);
    expect(state.seats[1]!.pool).toBe(8); // 10 − 2, not 10 − 6
  });

  it("grants +1 stealth only when the prey controls a ready Sabbat vampire", () => {
    const withSabbat = game(true);
    resolveUnblocked(withSabbat.engine);
    expect(withSabbat.state.eventLog.some((e) => e.type === "StealthModified" && e.delta === 1)).toBe(true);

    const withoutSabbat = game(false);
    resolveUnblocked(withoutSabbat.engine);
    expect(withoutSabbat.state.eventLog.some((e) => e.type === "StealthModified" && e.delta === 1)).toBe(false);
  });
});
