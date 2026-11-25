/**
 * Black Hand Ritual (100168).
 *
 * +1 stealth action. Requires a ready Black Hand vampire.
 * Unlock a younger Black Hand vampire or Ⓓ burn any Gehenna card in play.
 */

import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function game(): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const v1 = state.seats[0]!.minions[0]!;
  Object.assign(v1, { blackHand: true, blood: 3, capacity: 6 });
  state.seats[0]!.hand = [{ id: "bhr", name: "Black Hand Ritual" }];
  state.seats[0]!.minions.push(
    makeMinion("V2", "Alice", { blackHand: true, capacity: 3, locked: true }),
    makeMinion("V3", "Alice", { blackHand: true, capacity: 9, locked: true }), // older
    makeMinion("V4", "Alice", { blackHand: false, capacity: 2, locked: true }), // not Black Hand
  );
  return { state, engine: new VtesEngine(state, testRegistry) };
}

function resolveUnblocked(engine: VtesEngine, play: string): void {
  runTrace(engine, [
    ["Alice", play],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // announce
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // A
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // C → resolve
  ]);
}

describe("Black Hand Ritual (100168)", () => {
  it("[unlock] offers only younger Black Hand vampires and unlocks one", () => {
    const { state, engine } = game();
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Black Hand Ritual:basic:V1:unlock:V2:bhr");
    expect(ids).not.toContain("play:Black Hand Ritual:basic:V1:unlock:V3:bhr");
    expect(ids).not.toContain("play:Black Hand Ritual:basic:V1:unlock:V4:bhr");

    resolveUnblocked(engine, "play:Black Hand Ritual:basic:V1:unlock:V2:bhr");
    expect(state.seats[0]!.minions.find((m) => m.id === "V2")!.locked).toBe(false);
  });

  it("[burn] offers only Gehenna cards in play and burns one", () => {
    const { state, engine } = game();
    state.seats[1]!.permanents.push(
      { card: { id: "ev1", name: "Dragonbound" }, locked: false, usedThisPhase: false, statics: {}, tags: ["event", "gehenna"] },
      { card: { id: "loc", name: "Hunting Ground" }, locked: false, usedThisPhase: false, statics: {}, tags: ["location"] },
    );
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Black Hand Ritual:basic:V1:burn:ev1:bhr");
    expect(ids).not.toContain("play:Black Hand Ritual:basic:V1:burn:loc:bhr");

    resolveUnblocked(engine, "play:Black Hand Ritual:basic:V1:burn:ev1:bhr");
    expect(state.eventLog.some((e) => e.type === "PermanentBurned" && e.cardId === "ev1")).toBe(true);
    expect(state.seats[1]!.permanents.some((p) => p.card.id === "ev1")).toBe(false);
  });
});
