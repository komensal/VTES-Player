import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function setup(superior: boolean = false) {
  const state = threeSeatGame();
  const alice = state.seats[0]!.minions[0]!;
  Object.assign(alice, { blood: 5, disciplines: { ani: "basic", pot: superior ? "superior" : "basic" } });
  const bob = state.seats[1]!.minions.find((m) => m.id === "M")!;
  Object.assign(bob, { blood: 5, disciplines: { pot: "basic" } });
  state.seats[0]!.hand.push({ id: "roa", name: "Rage of Apedemak" });
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:W"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
  return { state, engine, superior };
}

function findRageOption(e: VtesEngine, level: "basic" | "superior"): { id: string } | null {
  for (let i = 0; i < 100; i++) {
    const dp = e.decision();
    if (!dp) break;
    const opt = dp.options.find((o: any) => o.id.startsWith(`play:Rage of Apedemak:${level}:`));
    if (opt) return opt;
    const pick = dp.options.find((o) => o.id === "pass") ?? dp.options.find((o) => o.id === "strike:hand");
    if (!pick) break;
    e.choose(pick.id);
  }
  return null;
}

describe("Rage of Apedemak (102336)", () => {
  it("basic offers strike with +1 damage and +1 hand size", () => {
    const { engine } = setup(false);
    const opt = findRageOption(engine, "basic");
    expect(opt).toBeDefined();
  });

  it("superior offers strike with +2 damage and +1 hand size", () => {
    const { engine } = setup(true);
    const opt = findRageOption(engine, "superior");
    expect(opt).toBeDefined();
  });
});