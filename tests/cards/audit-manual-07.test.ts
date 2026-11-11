import { describe, expect, it } from "vitest";
import { VtesEngine, type CombatFrame, type GameState } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function combat(state: GameState): CombatFrame {
  const cf = state.frames.find((f) => f.kind === "combat");
  if (!cf || cf.kind !== "combat") throw new Error("combat missing");
  return cf;
}

function game(level: "basic" | "superior") {
  const state = threeSeatGame();
  Object.assign(state.seats[0]!.minions[0]!, { blood: 5, disciplines: { obt: level, pot: level } });
  Object.assign(state.seats[1]!.minions.find((m) => m.id === "M")!, { blood: 8, capacity: 8 });
  state.seats[0]!.hand.push({ id: "dark", name: "Dark Steel" });
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "bleed:V1"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:M"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
  expect(combat(state).step).toBe("beforeRange");
  return { state, engine };
}

function playAndResolve(engine: VtesEngine, level: string) {
  const play = engine.decision()!.options.find((o) => o.id.startsWith(`play:Dark Steel:${level}:V1`));
  expect(play).toBeDefined();
  engine.choose(play!.id);
  for (let i = 0; i < 10 && engine.decision()?.window === "card.asPlayed"; i++) {
    engine.choose(engine.decision()!.options.find((o) => o.id === "pass")!.id);
  }
}

function passUntil(engine: VtesEngine, stop: () => boolean, max = 80) {
  for (let i = 0; i < max && !stop(); i++) {
    const dp = engine.decision();
    if (!dp) throw new Error("game ended unexpectedly");
    const pick = dp.options.find((o) => o.id === "pass") ?? dp.options[0];
    if (!pick) throw new Error(`no option at ${dp.window}`);
    engine.choose(pick.id);
  }
  expect(stop()).toBe(true);
}

describe("Dark Steel (100495)", () => {
  it.each([["basic", 1], ["superior", 2]] as const)(
    "%s can be played at close before range; optional close maneuver does not force range away and damage is %i",
    (level, amount) => {
      const { state, engine } = game(level);
      const cf = combat(state);
      expect(cf.range).toBe("close");
      playAndResolve(engine, level);
      expect(cf.range).toBe("close");
      expect(cf.closeManeuvers.acting).toBe(1);
      expect(cf.roundDamage[0]?.amount).toBe(amount);
      const victim = state.seats[1]!.minions.find((m) => m.id === "M")!;
      passUntil(engine, () => !state.frames.some((f) => f.kind === "combat"));
      expect(victim.blood).toBe(8 - 1 - amount); // hand strike plus environmental
    },
  );

  it("can use the granted maneuver to close at range, but does not force it", () => {
    const { state, engine } = game("basic");
    const cf = combat(state);
    playAndResolve(engine, "basic");
    // Another effect can set range to long before the range step.
    cf.range = "long";
    passUntil(engine, () => !!engine.decision()?.options.some((o) => o.id === "maneuver:credit"));
    expect(cf.range).toBe("long");
    engine.choose("maneuver:credit");
    expect(cf.range).toBe("close");
    expect(cf.closeManeuvers.acting).toBe(0);
  });
  it("does not deal close-only damage at long range when the optional maneuver is declined", () => {
    const { state, engine } = game("superior");
    const cf = combat(state);
    const victim = state.seats[1]!.minions.find((m) => m.id === "M")!;
    playAndResolve(engine, "superior");
    cf.range = "long";
    passUntil(engine, () => !state.frames.some((f) => f.kind === "combat"));
    expect(victim.blood).toBe(8);
  });

  it("allows only one Dark Steel per combat", () => {
    const { state, engine } = game("superior");
    state.seats[0]!.hand.push({ id: "second", name: "Dark Steel" });
    playAndResolve(engine, "superior");
    passUntil(engine, () => engine.decision()?.window === "combat.beforeRange" && engine.decision()?.seat === "Alice");
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:Dark Steel"))).toBe(false);
    expect(state.seats[0]!.hand.some((c) => c.id === "second")).toBe(true);
  });

});
