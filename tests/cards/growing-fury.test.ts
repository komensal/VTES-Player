import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function combat(state: GameState) {
  const frame = state.frames.find((f) => f.kind === "combat");
  if (frame?.kind !== "combat") throw new Error("no combat frame");
  return frame;
}

function choosePlay(engine: VtesEngine, prefix: string): string {
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

describe("Growing Fury (100862)", () => {
  it("adds +2/+3 damage to its hand strike after the first round", () => {
    for (const [mode, discipline, expectedBonus] of [
      ["basic", "basic", 2],
      ["superior", "superior", 3],
    ] as const) {
      const state = threeSeatGame();
      const alice = state.seats[0]!;
      const vampire = alice.minions[0]!;
      vampire.disciplines = { pot: discipline };
      vampire.blood = 5;
      alice.hand.push({ id: `gf-${mode}`, name: "Growing Fury" });
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [
        ["Alice", "bleed:V1"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "block:M"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ]);

      // Construct the card's legal later-round state; its own option gate
      // must still forbid it in round one.
      combat(state).round = 2;
      const option = choosePlay(engine, `play:Growing Fury:${mode}:V1:gf-${mode}`);
      engine.choose(option);
      for (let i = 0; i < 8 && !state.eventLog.some((e) => e.type === "CardResolved" && e.cardId === `gf-${mode}`); i++) {
        const dp = engine.decision();
        if (!dp || dp.window !== "card.asPlayed") break;
        const pass = dp.options.find((o) => o.id === "pass");
        if (!pass) throw new Error("no pass in card.asPlayed");
        runTrace(engine, [[dp.seat, pass.id]]);
      }

      expect(combat(state).strikes.acting).toMatchObject({
        name: "Growing Fury",
        source: "card",
        handStrike: true,
        handBonus: expectedBonus,
      });
    }
  });

  it("Increased Strength adds damage to a Potence strike card without changing base strength", () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    const vampire = alice.minions[0]!;
    vampire.disciplines = { pot: "basic" };
    vampire.blood = 5;
    alice.hand.push(
      { id: "is", name: "Increased Strength" },
      { id: "gf", name: "Growing Fury" },
    );
    const m = state.seats[1]!.minions.find((x) => x.id === "M")!;
    m.blood = 5;
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ["Alice", "bleed:V1"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "block:M"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    combat(state).round = 2;

    const increased = choosePlay(engine, "play:Increased Strength:basic:V1:is");
    engine.choose(increased);
    for (let i = 0; i < 8 && !state.eventLog.some((e) => e.type === "CardResolved" && e.cardId === "is"); i++) {
      const dp = engine.decision();
      if (!dp || dp.window !== "card.asPlayed") break;
      runTrace(engine, [[dp.seat, dp.options.find((o) => o.id === "pass")!.id]]);
    }
    const fury = choosePlay(engine, "play:Growing Fury:basic:V1:gf");
    engine.choose(fury);
    for (let i = 0; i < 50 && !state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M"); i++) {
      const dp = engine.decision();
      if (!dp) throw new Error("no decision while resolving the strike");
      const option = dp.window === "combat.chooseStrike"
        ? dp.options.find((o) => o.id === "strike:hand")
        : dp.options.find((o) => o.id === "pass");
      if (!option) throw new Error(`no usable option in ${dp.window}`);
      runTrace(engine, [[dp.seat, option.id]]);
    }
    expect(state.eventLog.find((e) => e.type === "DamageInflicted" && e.minion === "M")).toMatchObject({ amount: 4 });
    expect(vampire.strength).toBe(1);
  });
});
