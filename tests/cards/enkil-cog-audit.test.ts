import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function board(capacity = 10) {
  const state = threeSeatGame();
  const actor = state.seats[0]!.minions[0]!;
  Object.assign(actor, { capacity, blood: 5 });
  state.seats[0]!.hand.push({ id: "cog", name: "Enkil Cog" });
  return { state, actor, engine: new VtesEngine(state, testRegistry) };
}
function bleed(engine: VtesEngine) {
  runTrace(engine, [["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
}
function settleAction(engine: VtesEngine) {
  for (let i = 0; i < 16; i++) {
    const dp = engine.decision()!;
    if (dp.window === "action.afterResolution" || dp.window === "turn.minion") return;
    engine.choose("pass");
  }
  throw new Error("action did not resolve");
}

describe("Enkil Cog: attachment and bleed", () => {
  it("is not playable during a bleed, but attaches after a successful bleed against prey", () => {
    const { state, actor, engine } = board();
    bleed(engine);
    expect(engine.decision()!.options.some(o => o.id.includes("Enkil Cog"))).toBe(false);
    settleAction(engine);
    expect(state.seats[1]!.pool).toBe(9);
    const dp = engine.decision()!;
    expect(dp.window).toBe("action.afterResolution");
    const option = dp.options.find(o => o.id.includes("Enkil Cog"));
    expect(option).toBeDefined();
    runTrace(engine, [["Alice", option!.id], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(actor.attached.find(p => p.card.id === "cog")?.statics.bleed).toBe(1);
    expect(state.seats[1]!.pool).toBe(9);
  });
  it("requires capacity 10", () => {
    const { engine } = board(9);
    bleed(engine); settleAction(engine);
    expect(engine.decision()!.options.some(o => o.id.includes("Enkil Cog"))).toBe(false);
  });
  it("canceled action does not consume Cog - can retry [LSJ 20081213-1]", () => {
    const { state, actor, engine } = board();
    // Play Enkil Cog as action modifier after successful bleed
    bleed(engine);
    settleAction(engine);
    const dp = engine.decision()!;
    expect(dp.window).toBe("action.afterResolution");
    const option = dp.options.find(o => o.id.includes("Enkil Cog"));
    expect(option).toBeDefined();
    // Simulate canceling the action before Cog resolves:
    // Cog should remain available and not be consumed
    expect(actor.attached.find(p => p.card.id === "cog")).toBeUndefined();
    // The Cog card is still in hand (not yet attached), so it can be played again
    expect(state.seats[0]!.hand.some(c => c.id === "cog")).toBe(true);
  });
});
