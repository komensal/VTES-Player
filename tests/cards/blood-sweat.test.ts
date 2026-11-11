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

describe("Exuding Blood (100677)", () => {
  function setup() {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.disciplines = { qui: "superior" };
    state.seats[0]!.minions[0]!.blood = 5;
    const foe = state.seats[1]!.minions.find((m) => m.id === "M")!;
    foe.blood = 5;
    state.seats[0]!.hand.push({ id: "ex", name: "Exuding Blood" });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    return { state, engine, foe };
  }

  it("is not playable at close range", () => {
    const { engine } = setup();
    for (let i = 0; i < 30; i++) {
      const dp = engine.decision();
      if (!dp) throw new Error("combat ended before strike choice");
      if (dp.window === "combat.chooseStrike" && dp.seat === "Alice") {
        expect(dp.options.some((o) => o.id.startsWith("play:Exuding Blood"))).toBe(false);
        return;
      }
      const pass = dp.options.find((o) => o.id === "pass");
      if (!pass) throw new Error(`cannot pass ${dp.window}`);
      engine.choose(pass.id);
    }
    throw new Error("did not reach strike choice");
  });

  it.each([["basic", 1], ["superior", 2]] as const)("%s deals %i unpreventable damage at long range", (mode, amount) => {
    const { state, engine, foe } = setup();
    const cf = currentCombat(state);
    cf.range = "long";
    cf.preventCredits.opposing = 3;
    engine.choose(findOption(engine, `play:Exuding Blood:${mode}:V1:ex`));
    for (let i = 0; i < 40 && !state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M"); i++) {
      const dp = engine.decision();
      if (!dp) throw new Error("no decision while resolving strike");
      const choice = dp.options.find((o) => o.id === "strike:hand") ?? dp.options.find((o) => o.id === "pass");
      if (!choice) throw new Error(`cannot proceed through ${dp.window}`);
      engine.choose(choice.id);
    }
    expect(foe.blood).toBe(5 - amount);
    expect(state.seats[0]!.minions[0]!.blood).toBe(5); // no blood cost; opposing hand strike misses at long range
    expect(state.eventLog.find((e) => e.type === "DamageInflicted" && e.minion === "M")).toMatchObject({ amount });
    expect(state.eventLog.some((e) => e.type === "DamagePrevented" && e.minion === "M")).toBe(false);
    expect(cf.preventCredits.opposing).toBe(3);
  });
});
