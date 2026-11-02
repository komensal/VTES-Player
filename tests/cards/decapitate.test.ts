/** Decapitate (100511): its superior Potence use burns the opposing vampire that is pending torpor. */
import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { buildHandlerRegistry } from "../../src/cards/effects/cards.ts";
import { threeSeatGame } from "../engine/fixtures.ts";

const registry = buildHandlerRegistry();

function startDecapitateCombat(pot: "basic" | "superior" = "superior"): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const turn = state.frames.find((frame) => frame.kind === "turn");
  if (turn?.kind === "turn") turn.phase = "minion";
  state.seats[0]!.hand.push({ id: "decapitate", name: "Decapitate" });
  const attacker = state.seats[0]!.minions.find((minion) => minion.id === "V1")!;
  attacker.disciplines = { ...attacker.disciplines, pot };
  attacker.blood = 4;
  const target = state.seats[1]!.minions.find((minion) => minion.id === "W")!;
  const engine = new VtesEngine(state, registry);

  for (let i = 0; i < 40 && !state.frames.some((frame) => frame.kind === "combat"); i++) {
    const dp = engine.decision();
    if (!dp) break;
    const choice = dp.options.find((option) => option.id === "bleed:V1") ??
      dp.options.find((option) => option.id === "block:W") ??
      dp.options.find((option) => option.kind === "pass") ??
      dp.options[0]!;
    engine.choose(choice.id);
  }
  // Make the blocker unable to mend the strike damage after the block is
  // established; editing it before block declaration makes it ineligible.
  target.capacity = 1;
  target.blood = 0;
  return { state, engine };
}

function findWindow(engine: VtesEngine, window: string, seat = "Alice", limit = 120) {
  for (let i = 0; i < limit; i++) {
    const dp = engine.decision();
    if (!dp) return null;
    if (dp.window === window && dp.seat === seat) return dp;
    const pass = dp.options.find((option) => option.kind === "pass");
    engine.choose((pass ?? dp.options[0]!).id);
  }
  return null;
}

describe("Decapitate (100511)", () => {
  it("offers superior Decapitate in the torpor window and burns the opposing vampire", () => {
    const { state, engine } = startDecapitateCombat();
    const dp = findWindow(engine, "torpor");
    expect(dp, "Decapitate should cause the torpor window to open").not.toBeNull();
    const option = dp!.options.find((candidate) =>
      candidate.kind === "playCard" && candidate.name === "Decapitate" &&
      candidate.mode === "superior" && candidate.minion === "V1" && candidate.params["target"] === "W",
    );
    expect(option).toBeDefined();

    // The superior use is not available to a vampire that is itself going
    // to torpor, even if its opponent is also pending torpor.
    const attacker = state.seats[0]!.minions.find((minion) => minion.id === "V1")!;
    attacker.torporPending = { other: "W" };
    expect(engine.decision()?.options.some((candidate) =>
      candidate.kind === "playCard" && candidate.name === "Decapitate",
    )).toBe(false);
    delete attacker.torporPending;
    const refreshed = engine.decision()!;
    const legal = refreshed.options.find((candidate) =>
      candidate.kind === "playCard" && candidate.name === "Decapitate" &&
      candidate.mode === "superior" && candidate.minion === "V1" && candidate.params["target"] === "W",
    );
    expect(legal).toBeDefined();
    engine.choose(legal!.id);

    for (let i = 0; i < 40 && state.seats[1]!.minions.some((minion) => minion.id === "W"); i++) {
      const next = engine.decision();
      if (!next) break;
      const pass = next.options.find((candidate) => candidate.kind === "pass");
      engine.choose((pass ?? next.options[0]!).id);
    }
    expect(state.seats[1]!.minions.some((minion) => minion.id === "W")).toBe(false);
    expect(state.seats[1]!.ashHeap?.some((card) => card.id === "W")).toBe(true);
  });

  it("keeps the basic hand/melee strike at +2 damage", () => {
    const { engine } = startDecapitateCombat("basic");
    const dp = findWindow(engine, "combat.chooseStrike", "Alice");
    expect(dp).not.toBeNull();
    expect(dp!.options.some((candidate) =>
      candidate.kind === "playCard" && candidate.name === "Decapitate" && candidate.mode === "basic",
    )).toBe(true);
  });

  it("does not expose the burn effect at basic Potence", () => {
    const { state, engine } = startDecapitateCombat("basic");
    const dp = findWindow(engine, "torpor");
    expect(dp).toBeNull();
    expect(state.seats[1]!.minions.find((minion) => minion.id === "W")?.inTorpor).toBe(true);
  });
});
