import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function currentCombat(state: GameState) {
  const frame = state.frames.find((f) => f.kind === "combat");
  if (frame?.kind !== "combat") throw new Error("no combat frame");
  return frame;
}

function findOption(engine: VtesEngine, prefix: string): string {
  for (let i = 0; i < 30; i++) {
    const dp = engine.decision();
    if (!dp) throw new Error(`no decision while looking for ${prefix}`);
    const option = dp.options.find((o) => o.id.startsWith(prefix));
    if (option) return option.id;
    const pass = dp.options.find((o) => o.id === "pass");
    if (!pass) throw new Error(`cannot pass ${dp.window} while looking for ${prefix}`);
    runTrace(engine, [[dp.seat, pass.id]]);
  }
  throw new Error(`did not find ${prefix}`);
}

describe("Blood Sweat (100211)", () => {
  it("is not offered at close range", () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    alice.minions[0]!.disciplines = { qui: "basic" };
    alice.hand.push({ id: "bs-close", name: "Blood Sweat" });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ["Alice", "bleed:V1"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "block:M"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    for (let i = 0; i < 30; i++) {
      const dp = engine.decision();
      if (!dp) throw new Error("combat ended before strike choice");
      if (dp.window === "combat.chooseStrike" && dp.seat === "Alice") {
        expect(dp.options.some((o) => o.id.includes("Blood Sweat"))).toBe(false);
        return;
      }
      const pass = dp.options.find((o) => o.id === "pass");
      if (!pass) throw new Error(`cannot pass ${dp.window}`);
      engine.choose(pass.id);
    }
    throw new Error("did not reach Alice's strike choice");
  });

  it("inflicts 2/3 ranged, unpreventable damage", () => {
    for (const [mode, discipline, amount] of [
      ["basic", "basic", 2],
      ["superior", "superior", 3],
    ] as const) {
      const state = threeSeatGame();
      const alice = state.seats[0]!;
      const vampire = alice.minions[0]!;
      vampire.disciplines = { qui: discipline };
      vampire.blood = 5;
      alice.hand.push({ id: `bs-${mode}`, name: "Blood Sweat" });
      const m = state.seats[1]!.minions.find((x) => x.id === "M")!;
      m.blood = 5;
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [
        ["Alice", "bleed:V1"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "block:M"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ]);
      currentCombat(state).range = "long";

      const option = findOption(engine, `play:Blood Sweat:${mode}:V1:bs-${mode}`);
      engine.choose(option);
      for (let i = 0; i < 8 && !state.eventLog.some((e) => e.type === "CardResolved" && e.cardId === `bs-${mode}`); i++) {
        const dp = engine.decision();
        if (!dp || dp.window !== "card.asPlayed") break;
        runTrace(engine, [[dp.seat, dp.options.find((o) => o.id === "pass")!.id]]);
      }

      for (let i = 0; i < 30 && !state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M"); i++) {
        const dp = engine.decision();
        if (!dp) throw new Error("no decision while resolving Blood Sweat");
        const choice = dp.window === "combat.chooseStrike"
          ? dp.options.find((o) => o.id === "strike:hand")
          : dp.options.find((o) => o.id === "pass");
        if (!choice) throw new Error(`cannot proceed through ${dp.window}`);
        runTrace(engine, [[dp.seat, choice.id]]);
      }

      expect(m.blood).toBe(5 - amount);
      expect(state.eventLog.find((e) => e.type === "DamageInflicted" && e.minion === "M")).toMatchObject({ amount, aggravated: false });
    }
  });
});
