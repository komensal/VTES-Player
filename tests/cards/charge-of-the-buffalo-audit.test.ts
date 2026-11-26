/**
 * Charge of the Buffalo (100330).
 *
 * [for] Ⓓ Enter combat with a locked minion.
 * [spi] Ⓓ Enter combat with a minion. Set the range for the first round of
 * that combat to close, and this acting vampire's initial strike during
 * that round is strike: hand strike at +1 damage.
 * [SPI] As [spi] above, but the strike is at +2 damage.
 */

import { describe, expect, it } from "vitest";
import type { CombatFrame, GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function combat(state: GameState): CombatFrame {
  const cf = state.frames.find((f) => f.kind === "combat");
  if (cf?.kind !== "combat") throw new Error("no combat");
  return cf;
}

function game(discipline: "for" | "spi", level: "basic" | "superior" = "basic") {
  const state = threeSeatGame();
  const v1 = state.seats[0]!.minions[0]!;
  Object.assign(v1, { blood: 3, strength: 1, disciplines: { [discipline]: level } });
  Object.assign(state.seats[1]!.minions[0]!, { locked: true }); // W is locked
  Object.assign(state.seats[1]!.minions[1]!, { locked: false, blood: 5 }); // M is unlocked, with room to lose blood
  state.seats[0]!.hand = [{ id: "cb", name: "Charge of the Buffalo" }];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

function resolveRush(engine: VtesEngine, play: string): void {
  runTrace(engine, [
    ["Alice", play],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // announce
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // A
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // C → resolve
  ]);
}

describe("Charge of the Buffalo (100330)", () => {
  it("[for] offers only LOCKED minions and enters combat with one", () => {
    const { state, engine } = game("for");
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Charge of the Buffalo:basic:V1:for:W:cb");
    expect(ids).not.toContain("play:Charge of the Buffalo:basic:V1:for:M:cb");
    resolveRush(engine, "play:Charge of the Buffalo:basic:V1:for:W:cb");
    expect(combat(state).opposing).toBe("W");
  });

  it("[spi] sets the first round to close and forces a +1 hand strike", () => {
    const { state, engine } = game("spi");
    resolveRush(engine, "play:Charge of the Buffalo:basic:V1:spi:M:cb");
    const cf = combat(state);
    expect(cf.range).toBe("close");
    expect(cf.skipRangeNextRound).toBe(true);
    expect(cf.forcedHandStrike?.acting).toBe(1);

    // Drive to the acting side's strike choice: only the forced hand strike.
    for (let i = 0; i < 10 && engine.decision()!.window !== "combat.chooseStrike"; i++) {
      const dp = engine.decision()!;
      runTrace(engine, [[dp.seat, "pass"]]);
    }
    const dp = engine.decision()!;
    expect(dp.seat).toBe("Alice");
    const strikes = dp.options.filter((o) => o.kind === "chooseStrike").map((o) => o.id);
    expect(strikes).toEqual(["strike:hand"]);

    const bloodBefore = state.seats[1]!.minions[1]!.blood;
    runTrace(engine, [["Alice", "strike:hand"]]);
    // Let the other side strike and the damage step finish.
    for (let i = 0; i < 10 && state.seats[1]!.minions[1]!.blood === bloodBefore; i++) {
      const dp = engine.decision()!;
      const strike = dp.options.find((o) => o.id === "strike:hand");
      runTrace(engine, [[dp.seat, strike ? "strike:hand" : "pass"]]);
    }
    expect(state.seats[1]!.minions[1]!.blood).toBe(bloodBefore - 2); // strength 1 + bonus 1
  });

  it("[SPI] forces the same strike at +2 damage", () => {
    const { state, engine } = game("spi", "superior");
    resolveRush(engine, "play:Charge of the Buffalo:superior:V1:spi:M:cb");
    expect(combat(state).forcedHandStrike?.acting).toBe(2);
    for (let i = 0; i < 10 && engine.decision()!.window !== "combat.chooseStrike"; i++) {
      const dp = engine.decision()!;
      runTrace(engine, [[dp.seat, "pass"]]);
    }
    const bloodBefore = state.seats[1]!.minions[1]!.blood;
    runTrace(engine, [["Alice", "strike:hand"]]);
    for (let i = 0; i < 10 && state.seats[1]!.minions[1]!.blood === bloodBefore; i++) {
      const dp = engine.decision()!;
      const strike = dp.options.find((o) => o.id === "strike:hand");
      runTrace(engine, [[dp.seat, strike ? "strike:hand" : "pass"]]);
    }
    for (let i = 0; i < 10 && state.seats[1]!.minions[1]!.blood === bloodBefore; i++) {
      const dp = engine.decision()!;
      const strike = dp.options.find((o) => o.id === "strike:hand");
      runTrace(engine, [[dp.seat, strike ? "strike:hand" : "pass"]]);
    }
    expect(state.seats[1]!.minions[1]!.blood).toBe(bloodBefore - 3);
  });
});
