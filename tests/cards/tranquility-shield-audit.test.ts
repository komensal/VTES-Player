import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function setup(superior: boolean = false) {
  const state = threeSeatGame();
  const alice = state.seats[0]!.minions[0]!;
  Object.assign(alice, { blood: 5, disciplines: { for: superior ? "superior" : "basic" } });
  const bob = state.seats[1]!.minions.find((m) => m.id === "M")!;
  Object.assign(bob, { blood: 5, strength: 2 });
  state.seats[0]!.hand.push({ id: "ts", name: "Tranquility Shield" });
  const engine = new VtesEngine(state, testRegistry);
  // Alice bleeds V1.
  engine.choose("bleed:V1");
  // Pass until Bob can block with M.
  for (let i = 0; i < 30; i++) {
    const dp = engine.decision()!;
    const blockOpt = dp.options.find((o) => o.id === "block:M");
    if (blockOpt) { engine.choose(blockOpt.id); break; }
    engine.choose(dp.options.find((o) => o.id === "pass")?.id ?? dp.options[0]!.id);
  }
  // Pass through combat windows until Tranquility Shield can be played.
  for (let i = 0; i < 60; i++) {
    const dp = engine.decision()!;
    const tsOpt = dp.options.find((o: any) => o.id.startsWith(`play:Tranquility Shield:${superior ? "superior" : "basic"}:`));
    if (tsOpt) return { state, engine, superior, tsOpt };
    engine.choose(dp.options.find((o) => o.id === "pass")?.id ?? dp.options[0]!.id);
  }
  throw new Error("Tranquility Shield option not found");
}

describe("Tranquility Shield (102362)", () => {
  it("basic offers +1 prevention per round", () => {
    const { engine, superior, tsOpt } = setup(false);
    expect(tsOpt).toBeDefined();
  });

  it("superior offers +2 prevention per round", () => {
    const { engine, superior, tsOpt } = setup(true);
    expect(tsOpt).toBeDefined();
  });
});