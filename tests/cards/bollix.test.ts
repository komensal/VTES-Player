/** Bollix (100232): Celerity maneuver/press plus its Presence cancel and Thaumaturgy strike. */
import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { buildHandlerRegistry } from "../../src/cards/effects/cards.ts";
import { threeSeatGame } from "../engine/fixtures.ts";

const registry = buildHandlerRegistry();

function startBollixCombat(options: { anarch?: boolean; cel?: boolean; pre?: boolean; tha?: boolean } = {}): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const turn = state.frames.find((frame) => frame.kind === "turn");
  if (turn?.kind === "turn") turn.phase = "minion";
  state.seats[1]!.hand.push({ id: "bollix", name: "Bollix" });
  const blocker = state.seats[1]!.minions.find((minion) => minion.id === "W")!;
  blocker.sect = options.anarch === false ? "camarilla" : "anarch";
  if (options.cel === false) {
    const { cel: _cel, ...withoutCel } = blocker.disciplines;
    blocker.disciplines = withoutCel;
  } else {
    blocker.disciplines = { ...blocker.disciplines, cel: "basic" };
  }
  if (options.pre) blocker.disciplines = { ...blocker.disciplines, pre: "basic" };
  if (options.tha) blocker.disciplines = { ...blocker.disciplines, tha: "basic" };
  const engine = new VtesEngine(state, registry);
  for (let i = 0; i < 30 && !state.frames.some((frame) => frame.kind === "combat"); i++) {
    const dp = engine.decision();
    if (!dp) break;
    const choice = dp.options.find((option) => option.id === "bleed:V1") ??
      dp.options.find((option) => option.id === "block:W") ??
      dp.options.find((option) => option.kind === "pass") ??
      dp.options[0]!;
    engine.choose(choice.id);
  }
  return { state, engine };
}

function findWindow(engine: VtesEngine, window: string, seat = "Alice", limit = 100) {
  for (let i = 0; i < limit; i++) {
    const dp = engine.decision();
    if (!dp) return null;
    if (dp.window === window && dp.seat === seat) return dp;
    const pass = dp.options.find((option) => option.kind === "pass");
    engine.choose((pass ?? dp.options[0]!).id);
  }
  return null;
}

describe("Bollix (100232)", () => {
  it("offers the Anarch blocker's Celerity maneuver after the acting vampire plays Pursuit", () => {
    const { state, engine } = startBollixCombat();
    const attacker = state.seats[0]!.minions.find((minion) => minion.id === "V1")!;
    attacker.disciplines = { ...attacker.disciplines, cel: "basic" };
    state.seats[0]!.hand.push({ id: "pursuit", name: "Pursuit" });
    const actorRange = findWindow(engine, "combat.range", "Alice");
    const pursuit = actorRange?.options.find((option) => option.id.startsWith("play:Pursuit"));
    expect(pursuit, "attacker's Pursuit maneuver").toBeDefined();
    engine.choose(pursuit!.id);
    // Resolve the acting vampire's as-played response; the opposing
    // combatant then gets the next range decision with its own card options.
    const blockerRange = findWindow(engine, "combat.range", "Bob");
    expect(blockerRange, "combat range decision for Bob").not.toBeNull();
    const maneuver = blockerRange!.options.find((option) => option.id.startsWith("play:Bollix") &&
      option.kind === "playCard" && option.params["variant"] === "maneuver");
    expect(maneuver).toBeDefined();
    expect(() => engine.choose(maneuver!.id)).not.toThrow();
  });

  it("offers its Celerity press in the press window", () => {
    const { engine } = startBollixCombat();
    const dp = findWindow(engine, "combat.press", "Bob");
    expect(dp, "press decision for Bob").not.toBeNull();
    const press = dp!.options.find((option) => option.id.startsWith("play:Bollix") &&
      option.kind === "playCard" && option.params["variant"] === "press");
    expect(press).toBeDefined();
    expect(() => engine.choose(press!.id)).not.toThrow();
  });

  it("offers its Presence cancel against an opposing grapple as the card is played", () => {
    const { state, engine } = startBollixCombat({ pre: true });
    const attacker = state.seats[0]!.minions.find((minion) => minion.id === "V1")!;
    attacker.disciplines = { ...attacker.disciplines, pot: "basic" };
    state.seats[0]!.hand.push({ id: "grapple", name: "Immortal Grapple" });
    const strikeWindow = findWindow(engine, "combat.beforeStrikes");
    const grapple = strikeWindow?.options.find((option) => option.id.startsWith("play:Immortal Grapple"));
    expect(grapple, "attacker's grapple option").toBeDefined();
    engine.choose(grapple!.id);
    const cancelWindow = findWindow(engine, "card.asPlayed", "Bob");
    const cancel = cancelWindow?.options.find((option) => option.id.startsWith("play:Bollix") &&
      option.kind === "playCard" && option.params["variant"] === "cancel");
    expect(cancel, "Bollix Presence cancel option").toBeDefined();
    expect(() => engine.choose(cancel!.id)).not.toThrow();
  });

  it("offers its Thaumaturgy hand strike before strikes are chosen", () => {
    const { engine } = startBollixCombat({ tha: true });
    const dp = findWindow(engine, "combat.chooseStrike", "Bob");
    expect(dp, "strike-card decision for Bob").not.toBeNull();
    expect(dp!.options.some((option) => option.id.startsWith("play:Bollix") &&
      option.kind === "playCard" && option.params["variant"] === "strike")).toBe(true);
  });

  it("does not offer the Celerity mode without the Anarch requirement or Celerity", () => {
    for (const options of [{ anarch: false }, { cel: false }]) {
      const { engine } = startBollixCombat(options);
      const dp = findWindow(engine, "combat.range", "Bob");
      expect(dp).not.toBeNull();
      expect(dp!.options.some((option) => option.id.startsWith("play:Bollix")), JSON.stringify(options)).toBe(false);
    }
  });
});
