/**
 * Improvised Tactics (100965) — [aus] press-step draw.
 *
 * "During the press step each round, draw one card. Discard down to your
 * hand size afterward." Not a hand-size bonus: a card is drawn at the press
 * step, once per round.
 */

import { describe, expect, it } from "vitest";
import type { CombatFrame, GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function combat(state: GameState): CombatFrame {
  const cf = state.frames.find((f) => f.kind === "combat");
  if (cf?.kind !== "combat") throw new Error("no combat");
  return cf;
}

function game(): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const v1 = state.seats[0]!.minions[0]!;
  Object.assign(v1, { blood: 3, strength: 1, sect: "anarch", disciplines: { aus: "basic" } });
  state.seats[0]!.hand = [{ id: "it", name: "Improvised Tactics" }];
  // The blocker needs intercept for the block to succeed.
  state.seats[1]!.minions[1]!.attached.push({
    card: { id: "bike", name: "Sport Bike" },
    locked: false,
    usedThisPhase: false,
    statics: { intercept: 1 },
    tags: ["equipment"],
  });
  state.seats[0]!.library = [
    { id: "l1", name: "Conditioning" },
    { id: "l2", name: "Conditioning" },
    { id: "l3", name: "Conditioning" },
  ];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

describe("Improvised Tactics (100965) [aus]", () => {
  it("draws one card at the press step, once per round", () => {
    const { state, engine } = game();
    runTrace(engine, [
      ["Alice", "hunt:V1"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // announce
      ["Alice", "pass"], ["Bob", "block:M"],
      ["Alice", "pass"],
    ]);
    // Play the card in the first window that offers it (combat.beforeRange).
    for (let i = 0; i < 12; i++) {
      const dp = engine.decision()!;
      if (dp.options.some((o) => o.id === "play:Improvised Tactics:basic:V1:it")) {
        runTrace(engine, [[dp.seat, "play:Improvised Tactics:basic:V1:it"]]);
        break;
      }
      runTrace(engine, [[dp.seat, "pass"]]);
    }
    for (let i = 0; i < 6; i++) {
      const dp = engine.decision()!;
      const strike = dp.options.find((o) => o.id === "strike:hand");
      runTrace(engine, [[dp.seat, strike ? "strike:hand" : dp.options[0]!.id]]);
    }
    expect(combat(state).pressStepDraw?.acting).toBe(1);

    // Drive the round to the press step: range, then both hand strikes.
    for (let i = 0; i < 14 && combat(state).step !== "press"; i++) {
      const dp = engine.decision()!;
      const strike = dp.options.find((o) => o.id === "strike:hand");
      runTrace(engine, [[dp.seat, strike ? "strike:hand" : "pass"]]);
    }
    for (let i = 0; i < 8 && !combat(state).pressStepDrawDone; i++) {
      const dp = engine.decision()!;
      const strike = dp.options.find((o) => o.id === "strike:hand");
      runTrace(engine, [[dp.seat, strike ? "strike:hand" : dp.options[0]!.id]]);
    }
    expect(combat(state).pressStepDrawDone).toBe(true);
    // One card was drawn at press step (plus the replacement draw when the
    // combat card was played). The library shrank by at least one.
    expect(state.seats[0]!.library.length).toBeLessThan(3);
    // A CardDrawn event was emitted for Alice.
    expect(state.eventLog.some((e) => e.type === "CardDrawn" && e.seat === "Alice")).toBe(true);
  });
});
