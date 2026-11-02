import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function startCombat(level: "basic" | "superior"): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const alice = state.seats[0]!;
  const blocker = state.seats[1]!.minions.find((m) => m.id === "M")!;
  alice.minions[0]!.disciplines = { nec: level };
  alice.hand.push({ id: "blight", name: "Blight" });
  blocker.blood = blocker.capacity;
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "bleed:V1"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:M"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
  return { state, engine };
}

describe("Blight (100187)", () => {
  it("reduces opposing strength by 1 for the combat", () => {
    const { state, engine } = startCombat("basic");
    const dp = engine.decision();
    expect(dp?.window).toBe("combat.beforeRange");
    const play = dp?.options.find((o) => o.id.startsWith("play:Blight:basic"));
    expect(play).toBeDefined();
    engine.choose(play!.id);
    for (let i = 0; i < 5; i++) {
      const next = engine.decision();
      if (!next || next.window !== "card.asPlayed") break;
      engine.choose(next.options.find((o) => o.id === "pass")!.id);
    }
    const frame = state.frames.find((f) => f.kind === "combat");
    if (frame?.kind !== "combat") throw new Error("no combat frame");
    expect(frame.strengthBonus.opposing).toBe(-1);
    expect(frame.restrict.opposing.press).toBe(false);
    expect(frame.noAdditionalStrikes?.opposing ?? false).toBe(false);
  });

  it("superior also bars presses and additional strikes for the opposing minion", () => {
    const { state, engine } = startCombat("superior");
    const dp = engine.decision();
    const play = dp?.options.find((o) => o.id.startsWith("play:Blight:superior"));
    expect(play).toBeDefined();
    engine.choose(play!.id);
    for (let i = 0; i < 5; i++) {
      const next = engine.decision();
      if (!next || next.window !== "card.asPlayed") break;
      engine.choose(next.options.find((o) => o.id === "pass")!.id);
    }
    const frame = state.frames.find((f) => f.kind === "combat");
    if (frame?.kind !== "combat") throw new Error("no combat frame");
    expect(frame.strengthBonus.opposing).toBe(-1);
    expect(frame.restrict.opposing.press).toBe(true);
    expect(frame.noAdditionalStrikes?.opposing).toBe(true);
  });
});
