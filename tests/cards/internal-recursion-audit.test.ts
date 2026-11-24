import { describe, expect, it } from "vitest";
import type { CombatFrame, GameState, MinionState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function find(state: GameState, id: string): MinionState {
  const m = state.seats.flatMap((s) => s.minions).find((x) => x.id === id);
  if (!m) throw new Error(`no minion ${id}`);
  return m;
}

function combat(state: GameState): CombatFrame {
  const cf = state.frames.find((f) => f.kind === "combat");
  if (cf?.kind !== "combat") throw new Error("no combat");
  return cf;
}

function reactThenBlock(
  mode: "pre" | "close" | "long" | "tem",
  level: "basic" | "superior",
  actor: Partial<MinionState> = {},
): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  Object.assign(find(state, "V1"), { blood: 4, strength: 1, ...actor });
  Object.assign(find(state, "M"), {
    blood: 4,
    strength: 1,
    capacity: 6,
    disciplines: level === "superior" ? { tem: "superior" } : { [mode === "pre" ? "pre" : "tem"]: "basic" },
    attached: [{
      card: { id: "bike", name: "Sport Bike" },
      locked: false,
      usedThisPhase: false,
      statics: { intercept: 1 },
      tags: ["equipment"],
    }],
  });
  state.seats[1]!.hand.push({ id: "ir", name: "Internal Recursion" });
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "hunt:V1"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // announce
    ["Alice", "pass"], ["Bob", "block:M"],
    ["Alice", "pass"],
    ["Bob", `play:Internal Recursion:${level}:M:${mode}:ir`],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
  ]);
  for (let i = 0; i < 10 && !state.frames.some((f) => f.kind === "combat"); i++) {
    const dp = engine.decision()!;
    runTrace(engine, [[dp.seat, "pass"]]);
  }
  return { state, engine };
}

function ownCombatEndsStrike(engine: VtesEngine): void {
  runTrace(engine, [
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // before range
    ["Alice", "pass"], ["Bob", "pass"], // range
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // before strikes
    ["Alice", "strike:hand"],
  ]);
  const dp = engine.decision()!;
  expect(dp.seat).toBe("Bob");
  expect(dp.options.some((o) => o.id === "strike:combatEnds")).toBe(true);
  runTrace(engine, [["Bob", "strike:combatEnds"]]);
}

describe("Internal Recursion (100998)", () => {
  it.each([
    ["close", "close"],
    ["long", "long"],
  ] as const)("[tem] sets the first round's range to %s", (mode, expected) => {
    const { state } = reactThenBlock(mode, "basic");
    expect(combat(state).range).toBe(expected);
    expect(combat(state).skipRangeNextRound).toBe(true);
  });

  it("[pre] unlocks the blocker after their own combat-ends strike against a younger vampire", () => {
    const { state, engine } = reactThenBlock("pre", "basic", { capacity: 4 });
    expect(find(state, "M").locked).toBe(true);
    ownCombatEndsStrike(engine);
    expect(find(state, "M").locked).toBe(false);
  });

  it("[pre] does not unlock the blocker against an older vampire", () => {
    const { state, engine } = reactThenBlock("pre", "basic", { capacity: 7 });
    ownCombatEndsStrike(engine);
    expect(find(state, "M").locked).toBe(true);
  });

  it("[TEM] makes the acting vampire skip its next unlock phase", () => {
    const { state, engine } = reactThenBlock("tem", "superior");
    const actor = find(state, "V1");
    expect(actor.locked).toBe(true);
    expect(actor.skipNextUnlock).toBe(true);

    const turn = state.frames.find((f) => f.kind === "turn");
    if (turn?.kind !== "turn") throw new Error("no turn");
    state.frames = [turn];
    turn.phase = "unlock";
    turn.unlockDone = false;
    turn.unlockAbilitiesDone = false;
    turn.edgeDone = true;
    engine.decision(); // settle runs the real unlock sweep
    expect(actor.locked).toBe(true);
    expect(actor.skipNextUnlock).toBe(false); // one-shot, spent by that sweep
  });
});
