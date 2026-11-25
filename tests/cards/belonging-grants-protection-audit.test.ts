/**
 * Belonging Grants Protection (100150).
 *
 * +1 stealth action. Requires a ready magaji.
 * Unlock another ready Laibon or move 2 blood from the blood bank to a
 * younger Laibon in your uncontrolled region.
 */

import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function game(): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const v1 = state.seats[0]!.minions[0]!;
  Object.assign(v1, { sect: "laibon", title: "magaji", blood: 3, capacity: 6 });
  state.seats[0]!.hand = [{ id: "bg", name: "Belonging Grants Protection" }];
  state.seats[0]!.minions.push(
    makeMinion("V2", "Alice", { sect: "laibon", locked: true }),
    makeMinion("V3", "Alice", { sect: "laibon", locked: false }), // nothing to unlock
    makeMinion("V4", "Alice", { sect: "camarilla", locked: true }), // wrong sect
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

describe("Belonging Grants Protection (100150)", () => {
  it("requires a magaji: without the title there is no play option", () => {
    const { state, engine } = game();
    state.seats[0]!.minions[0]!.title = null;
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids.some((i) => i.startsWith("play:Belonging Grants Protection"))).toBe(false);
  });

  it("[unlock] offers another ready Laibon, never the actor or a non-Laibon", () => {
    const { state, engine } = game();
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Belonging Grants Protection:basic:V1:unlock:V2:bg");
    expect(ids).not.toContain("play:Belonging Grants Protection:basic:V1:unlock:V1:bg");
    expect(ids).not.toContain("play:Belonging Grants Protection:basic:V1:unlock:V3:bg");
    expect(ids).not.toContain("play:Belonging Grants Protection:basic:V1:unlock:V4:bg");

    resolveUnblocked(engine, "play:Belonging Grants Protection:basic:V1:unlock:V2:bg");
    expect(state.seats[0]!.minions.find((m) => m.id === "V2")!.locked).toBe(false);
  });

  it("[blood] moves 2 blood from the bank to a younger Laibon", () => {
    const { state, engine } = game();
    state.seats[0]!.uncontrolled = [
      { card: makeMinion("U1", "Alice", { sect: "laibon", capacity: 3 }), counters: 0 },
      { card: makeMinion("U2", "Alice", { sect: "laibon", capacity: 9 }), counters: 0 }, // older
      { card: makeMinion("U3", "Alice", { sect: "camarilla", capacity: 2 }), counters: 0 }, // wrong sect
    ];
    resolveUnblocked(engine, "play:Belonging Grants Protection:basic:V1:blood:bg");
    // One legal recipient, so the transfer is automatic.
    expect(state.seats[0]!.uncontrolled[0]!.counters).toBe(2);
    expect(state.seats[0]!.uncontrolled[1]!.counters).toBe(0);
    expect(state.seats[0]!.uncontrolled[2]!.counters).toBe(0);
  });

  it("[blood] asks which younger Laibon when there is more than one", () => {
    const { state, engine } = game();
    state.seats[0]!.uncontrolled = [
      { card: makeMinion("U1", "Alice", { sect: "laibon", capacity: 3 }), counters: 0 },
      { card: makeMinion("U2", "Alice", { sect: "laibon", capacity: 4 }), counters: 0 },
    ];
    resolveUnblocked(engine, "play:Belonging Grants Protection:basic:V1:blood:bg");
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("choice:Belonging Grants Protection:bg:bloodFromBankToUncontrolled:U1");
    expect(ids).toContain("choice:Belonging Grants Protection:bg:bloodFromBankToUncontrolled:U2");
    engine.choose("choice:Belonging Grants Protection:bg:bloodFromBankToUncontrolled:U2");
    expect(state.seats[0]!.uncontrolled[0]!.counters).toBe(0);
    expect(state.seats[0]!.uncontrolled[1]!.counters).toBe(2);
  });
});
