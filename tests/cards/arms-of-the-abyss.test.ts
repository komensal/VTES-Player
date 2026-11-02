import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function combat(state: GameState) {
  const frame = state.frames.find((f) => f.kind === "combat");
  if (frame?.kind !== "combat") throw new Error("no combat frame");
  return frame;
}

describe("Arms of the Abyss (100091)", () => {
  it("declares a dodge; superior also grants one limited additional strike", () => {
    for (const [mode, discipline, strikes] of [
      ["basic", "basic", 0],
      ["superior", "superior", 1],
    ] as const) {
      const state = threeSeatGame();
      const alice = state.seats[0]!;
      alice.minions[0]!.disciplines = { obt: discipline };
      alice.minions[0]!.blood = 5;
      alice.hand.push({ id: `aoa-${mode}`, name: "Arms of the Abyss" });
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [
        ["Alice", "bleed:V1"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "block:M"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ]);

      let played = false;
      for (let i = 0; i < 30 && !state.eventLog.some((e) => e.type === "CardResolved" && e.cardId === `aoa-${mode}`); i++) {
        const dp = engine.decision();
        if (!dp) throw new Error("no decision while playing Arms of the Abyss");
        const play = dp.options.find((o) => o.id.startsWith(`play:Arms of the Abyss:${mode}:V1:aoa-${mode}`));
        const option = play ?? dp.options.find((o) => o.id === "pass");
        if (!option) throw new Error(`cannot proceed through ${dp.window}`);
        runTrace(engine, [[dp.seat, option.id]]);
        if (play) played = true;
      }

      const frame = combat(state);
      expect(played).toBe(true);
      expect(frame.strikes.acting?.dodge).toBe(true);
      expect(frame.additionalStrikes.acting).toBe(strikes);
      expect(frame.usedLimitedAddl.acting).toBe(false);
    }
  });
});
