/**
 * Bay and Howl (100143) and Convergence (100421).
 *
 * "Move 1 blood from each ready <clan> you control to a <clan> in your
 * uncontrolled region." Every ready donor gives exactly one blood; a donor
 * with none is skipped; only the named clan takes part; the recipient is
 * chosen at resolution.
 */

import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function game(cardName: string, clan: string): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const tf = state.frames[0]!;
  if (tf.kind !== "turn") throw new Error("turn fixture");
  tf.phase = "master";
  tf.masterActionsLeft = 1;
  const alice = state.seats[0]!;
  alice.hand = [{ id: "mc", name: cardName }];
  alice.minions = [
    makeMinion("D1", "Alice", { clan, blood: 2 }),
    makeMinion("D2", "Alice", { clan, blood: 1 }),
    makeMinion("EMPTY", "Alice", { clan, blood: 0 }), // nothing to give
    makeMinion("TORPOR", "Alice", { clan, blood: 3, inTorpor: true }), // not ready
    makeMinion("OTHER", "Alice", { clan: "Ventrue", blood: 4 }), // wrong clan
  ];
  alice.uncontrolled = [
    { card: makeMinion("U1", "Alice", { clan }), counters: 0 },
    { card: makeMinion("U2", "Alice", { clan: "Ventrue" }), counters: 0 },
  ];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

function resolveMaster(engine: VtesEngine, cardName: string): void {
  runTrace(engine, [
    ["Alice", `play:${cardName}`],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
  ]);
}

for (const [cardName, clan] of [["Bay and Howl", "Gangrel antitribu"], ["Convergence", "Pander"]] as const) {
  describe(`${cardName} — ready ${clan} blood to uncontrolled`, () => {
    it("offers only uncontrolled vampires of the named clan", () => {
      const { engine } = game(cardName, clan);
      resolveMaster(engine, cardName);
      const ids = engine.decision()!.options.map((o) => o.id);
      expect(ids).toContain(`choice:${cardName}:mc:moveBloodFromReadyClanToUncontrolled:U1`);
      expect(ids.some((i) => i.endsWith(":U2"))).toBe(false);
    });

    it("moves exactly one blood from each ready donor, skipping empty and torpid ones", () => {
      const { state, engine } = game(cardName, clan);
      resolveMaster(engine, cardName);
      engine.choose(`choice:${cardName}:mc:moveBloodFromReadyClanToUncontrolled:U1`);
      const alice = state.seats[0]!;
      const bloodOf = (id: string) => alice.minions.find((m) => m.id === id)!.blood;
      expect(bloodOf("D1")).toBe(1);
      expect(bloodOf("D2")).toBe(0);
      expect(bloodOf("EMPTY")).toBe(0);
      expect(bloodOf("TORPOR")).toBe(3);
      expect(bloodOf("OTHER")).toBe(4);
      expect(alice.uncontrolled[0]!.counters).toBe(2); // D1 + D2, nobody else
    });

    it("asks nothing when no donor has blood", () => {
      const { state, engine } = game(cardName, clan);
      for (const m of state.seats[0]!.minions) {
        if (m.clan === clan) m.blood = 0;
      }
      resolveMaster(engine, cardName);
      const dp = engine.decision()!;
      expect(dp.window).toBe("turn.master");
      expect(dp.options.some((o) => o.id.includes("moveBloodFromReadyClanToUncontrolled"))).toBe(false);
    });
  });
}

describe("Convergence — a choice between two recipients", () => {
  it("delivers all the blood to the chosen uncontrolled Pander only", () => {
    const { state, engine } = game("Convergence", "Pander");
    state.seats[0]!.uncontrolled.push({ card: makeMinion("U3", "Alice", { clan: "Pander" }), counters: 0 });
    resolveMaster(engine, "Convergence");
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("choice:Convergence:mc:moveBloodFromReadyClanToUncontrolled:U1");
    expect(ids).toContain("choice:Convergence:mc:moveBloodFromReadyClanToUncontrolled:U3");
    engine.choose("choice:Convergence:mc:moveBloodFromReadyClanToUncontrolled:U3");
    const alice = state.seats[0]!;
    expect(alice.uncontrolled.find((u) => u.card.id === "U1")!.counters).toBe(0);
    expect(alice.uncontrolled.find((u) => u.card.id === "U3")!.counters).toBe(2);
  });
});
