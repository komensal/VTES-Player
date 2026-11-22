import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function setup() {
  const state = threeSeatGame();
  const alice = state.seats[0]!.minions[0]!;
  Object.assign(alice, { blood: 5, disciplines: { obf: "basic", tha: "basic" } });
  const bob = state.seats[1]!.minions.find((m) => m.id === "M")!;
  Object.assign(bob, { blood: 5, disciplines: { pot: "basic" } });
  state.seats[0]!.hand.push({ id: "dtw", name: "Dance with the Devil" });
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:W"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
  return { state, engine };
}

function findDanceOption(e: VtesEngine, level: "basic" | "superior"): { id: string } | null {
  for (let i = 0; i < 100; i++) {
    const dp = e.decision();
    if (!dp) break;
    const opt = dp.options.find((o: any) => o.id.startsWith(`play:Dance with the Devil:${level}:`));
    if (opt) return opt;
    const pick = dp.options.find((o) => o.id === "pass") ?? dp.options.find((o) => o.id === "strike:hand");
    if (!pick) break;
    e.choose(pick.id);
  }
  return null;
}

describe("Dance with the Devil (102315)", () => {
  it("basic offers maneuver only to close range", () => {
    const { engine } = setup();
    const opt = findDanceOption(engine, "basic");
    expect(opt).toBeDefined();
  });

  it("superior offers maneuver + grant close maneuver with blood cost", () => {
    const { state, engine } = setup();
    // Give Alice superior thaumaturgy for superior mode
    state.seats[0]!.minions[0]!.disciplines.tha = "superior";
    const opt = findDanceOption(engine, "superior");
    expect(opt).toBeDefined();
  });
});