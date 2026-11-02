import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function combat(state: GameState) {
  const frame = state.frames.find((f) => f.kind === "combat");
  if (frame?.kind !== "combat") throw new Error("no combat frame");
  return frame;
}

function setup(opponentAlly = false) {
  const state = threeSeatGame();
  const alice = state.seats[0]!;
  const vampire = alice.minions[0]!;
  vampire.disciplines = { tha: "superior" };
  vampire.blood = 5;
  alice.hand.push({ id: "btw", name: "Blood to Water" });
  const target = state.seats[1]!.minions.find((m) => m.id === "M")!;
  target.blood = 5;
  if (opponentAlly) Object.assign(target, { kind: "ally" });
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "bleed:V1"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:M"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
  combat(state).round = 2;
  combat(state).range = "close";
  return { state, engine, target };
}

function findBeforeResolution(engine: VtesEngine, prefix: string): string {
  const seen: string[] = [];
  for (let i = 0; i < 40; i++) {
    const dp = engine.decision();
    if (!dp) throw new Error(`no decision while seeking ${prefix}; saw ${seen.join(" -> ")}`);
    seen.push(`${dp.window}/${dp.seat}`);
    if (dp.window === "combat.beforeResolution" && dp.seat === "Alice") {
      const option = dp.options.find((o) => o.id.startsWith(prefix));
      if (option) return option.id;
      throw new Error(`missing ${prefix}; options: ${dp.options.map((o) => o.id).join(", ")}`);
    }
    const option = dp.window === "combat.chooseStrike"
      ? dp.options.find((o) => o.id === "strike:hand")
      : dp.options.find((o) => o.id === "pass");
    if (!option) throw new Error(`cannot proceed through ${dp.window}; saw ${seen.join(" -> ")}`);
    runTrace(engine, [[dp.seat, option.id]]);
  }
  throw new Error(`did not reach beforeResolution for ${prefix}; saw ${seen.join(" -> ")}`);
}

function resolveCard(engine: VtesEngine, state: GameState): void {
  for (let i = 0; i < 8 && !state.eventLog.some((e) => e.type === "CardResolved" && e.cardId === "btw"); i++) {
    const dp = engine.decision();
    if (!dp || dp.window !== "card.asPlayed") break;
    const pass = dp.options.find((o) => o.id === "pass");
    if (!pass) throw new Error("no pass in as-played window");
    runTrace(engine, [[dp.seat, pass.id]]);
  }
}

describe("Blood to Water (100214)", () => {
  it("burns 3 or 5 blood from the opposing vampire at close range", () => {
    for (const [mode, expected] of [["basic", 2], ["superior", 0]] as const) {
      const { state, engine, target } = setup();
      const option = findBeforeResolution(engine, `play:Blood to Water:${mode}:V1:btw`);
      engine.choose(option);
      resolveCard(engine, state);
      expect(target.blood).toBe(expected);
      expect(state.eventLog.some((e) => e.type === "BloodBurned" && e.minion === "M" && e.amount === (5 - expected))).toBe(true);
    }
  });

  it("basic burns an opposing ally, while superior is not offered against one", () => {
    const { state, engine } = setup(true);
    const basic = findBeforeResolution(engine, "play:Blood to Water:basic:V1:btw");
    const dp = engine.decision();
    expect(dp?.options.some((o) => o.id.startsWith("play:Blood to Water:superior:V1:btw"))).toBe(false);
    engine.choose(basic);
    resolveCard(engine, state);
    expect(state.seats[1]!.minions.some((m) => m.id === "M")).toBe(false);
  });
});
