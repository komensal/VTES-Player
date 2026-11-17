/**
 * Nephandus (101272): "Nephandus can strike: 1R damage" and "Each strike or
 * damaging effect made by the opposing minion against Nephandus in combat
 * inflicts 1 less damage."
 */
import { describe, expect, it } from "vitest";
import type { CombatFrame, GameState, MinionState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function find(state: GameState, id: string): MinionState {
  const m = state.seats.flatMap((s) => s.minions).find((x) => x.id === id);
  if (!m) throw new Error(`no minion ${id}`);
  return m;
}

/** Nephandus (Bob's ally, 5 life) fights V1 (Alice's vampire) in combat. */
function setup(inCombat: boolean): { engine: VtesEngine; nephandus: string } {
  const state = threeSeatGame();
  state.seats[1]!.minions.push(makeMinion("NEPH", "Bob", { kind: "ally", name: "Nephandus", blood: 5 }));
  if (inCombat) {
    state.frames.push({
      kind: "combat",
      acting: "V1",
      actingSeat: "Alice",
      opposing: "NEPH",
      opposingSeat: "Bob",
      fromBlock: true,
      round: 1,
      step: "range",
      range: "long",
      awaiting: "acting",
      declines: 0,
      strikes: { acting: null, opposing: null },
      strikeRound: "normal",
      additionalStrikes: { acting: 0, opposing: 0 },
      maneuverCredits: { acting: 0, opposing: 0 },
      closeManeuvers: { acting: 0, opposing: 0 },
      preventCreditsFirstRound: { acting: 0, opposing: 0 },
      unlockForBlood: { acting: 0, opposing: 0 },
      grantedCombatEnds: { acting: false, opposing: false },
      committedStrike: { acting: null, opposing: null },
      usedWeaponManeuver: { acting: null, opposing: null },
      restrict: {
        acting: { maneuver: false, press: false, equipment: false },
        opposing: { maneuver: false, press: false, equipment: false },
      },
      cycle: { order: ["Alice", "Bob", "Carol"], cursor: 0, passes: 0 },
    } as unknown as CombatFrame);
  }
  return { engine: new VtesEngine(state, testRegistry), nephandus: "NEPH" };
}

/** Deliver `amount` damage from `source` to Nephandus, through the engine's
 *  own damage path. */
function hit(engine: VtesEngine, source: string | null, amount: number): void {
  (engine as unknown as {
    applyResolvedDamage(pd: { minion: string; amount: number; source: string | null; aggravated: boolean; fromStrike: boolean }): void;
  }).applyResolvedDamage({ minion: "NEPH", amount, source, aggravated: false, fromStrike: true });
}

describe("Nephandus (101272)", () => {
  it("has its printed 1R strike on the ally itself", () => {
    expect(testRegistry["Nephandus"]?.abilityOptions).toBeDefined();
  });

  it("a strike from the opposing minion in combat inflicts 1 less damage", () => {
    const { engine } = setup(true);
    hit(engine, "V1", 2);
    expect(find(engine.state, "NEPH").blood).toBe(4);
  });

  it("a 1-damage strike from the opposing minion is fully absorbed", () => {
    const { engine } = setup(true);
    hit(engine, "V1", 1);
    expect(find(engine.state, "NEPH").blood).toBe(5);
  });

  it("NEGATIVE SPACE: damage from outside the combat is not reduced", () => {
    const { engine } = setup(false);
    hit(engine, "V1", 2);
    expect(find(engine.state, "NEPH").blood).toBe(3);
  });

  it("NEGATIVE SPACE: environmental damage (no source) is not reduced", () => {
    const { engine } = setup(true);
    hit(engine, null, 2);
    expect(find(engine.state, "NEPH").blood).toBe(3);
  });
});
