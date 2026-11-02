import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function intoCombat(engine: VtesEngine): void {
  runTrace(engine, [
    ["Alice", "bleed:V1"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:M"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
}

function currentCombat(state: GameState) {
  const frame = state.frames.find((f) => f.kind === "combat");
  if (frame?.kind !== "combat") throw new Error("no combat frame");
  return frame;
}

function passToWindow(engine: VtesEngine, window: string) {
  for (let i = 0; i < 40; i++) {
    const dp = engine.decision();
    if (!dp) throw new Error(`no decision while seeking ${window}`);
    if (dp.window === window) return dp;
    const pass = dp.options.find((o) => o.id === "pass");
    if (!pass) throw new Error(`cannot pass ${dp.window} while seeking ${window}`);
    runTrace(engine, [[dp.seat, pass.id]]);
  }
  throw new Error(`did not reach ${window}`);
}

function playPrefix(engine: VtesEngine, prefix: string): string {
  for (let i = 0; i < 40; i++) {
    const dp = engine.decision();
    if (!dp) throw new Error(`no decision while seeking ${prefix}`);
    const option = dp.options.find((o) => o.id.startsWith(prefix));
    if (option) {
      runTrace(engine, [[dp.seat, option.id]]);
      return option.id;
    }
    const pass = dp.options.find((o) => o.id === "pass");
    if (!pass) throw new Error(`cannot pass ${dp.window} while seeking ${prefix}`);
    runTrace(engine, [[dp.seat, pass.id]]);
  }
  throw new Error(`did not find ${prefix}`);
}

function resolveAsPlayed(engine: VtesEngine, state: GameState, cardId: string): void {
  for (let i = 0; i < 8 && !state.eventLog.some((e) => e.type === "CardResolved" && e.cardId === cardId); i++) {
    const dp = engine.decision();
    if (!dp) break;
    if (dp.window !== "card.asPlayed") break;
    runTrace(engine, [[dp.seat, dp.options.find((o) => o.id === "pass")!.id]]);
  }
}

describe("Call the Wild Hunt (100282)", () => {
  it("burns a chosen X animals for ranged environmental damage in initial strike resolution", () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    const v1 = alice.minions[0]!;
    v1.disciplines = { ani: "superior", pro: "superior" };
    v1.blood = 5;
    v1.strength = 1;
    const m = state.seats[1]!.minions.find((x) => x.id === "M")!;
    m.blood = 5;
    m.strength = 1;
    alice.library = [];
    alice.hand.push(
      { id: "cwh", name: "Call the Wild Hunt" },
      { id: "rv", name: "Raven Spy" },
      { id: "dp", name: "Dog Pack" },
      { id: "fs", name: "Faithful Servant" },
    );
    const engine = new VtesEngine(state, testRegistry);
    intoCombat(engine);

    const call = playPrefix(engine, "play:Call the Wild Hunt:superior:V1:cwh");
    resolveAsPlayed(engine, state, "cwh");
    expect(state.eventLog.some((e) => e.type === "CardResolved" && e.cardId === "cwh")).toBe(true);

    // Long range demonstrates that the damage is ranged; neither hand
    // strike reaches, but the environmental damage still does.
    currentCombat(state).range = "long";
    passToWindow(engine, "combat.range");
    runTrace(engine, [["Alice", "pass"], ["Bob", "pass"]]);
    passToWindow(engine, "combat.beforeStrikes");
    runTrace(engine, [["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    runTrace(engine, [["Alice", "strike:hand"], ["Bob", "strike:hand"]]);

    const trigger = engine.decision();
    expect(trigger?.window).toBe("combat.beforeResolution");
    const use = trigger?.options.find((o) => o.id === "trigger:Call the Wild Hunt:cwh:animal-damage");
    expect(use).toBeDefined();
    engine.choose(use!.id);

    const count = engine.decision();
    expect(count?.window).toBe("choice");
    const x2 = count?.options.find((o) => o.kind === "answerChoice" && o.params["wildHuntX"] === "2");
    expect(x2).toBeDefined();
    engine.choose(x2!.id);

    const firstPick = engine.decision();
    expect(firstPick?.window).toBe("choice");
    const pickLabels = (options: NonNullable<typeof firstPick>["options"]) => options
      .filter((o) => o.kind === "answerChoice" && o.card)
      .map((o) => o.label.replace(/^Select /, "").replace(/ \(\d+ of \d+\)$/, ""));
    expect(pickLabels(firstPick!.options)).toEqual(["Raven Spy", "Dog Pack"]);
    expect(firstPick?.options.some((o) => o.kind === "answerChoice" && o.label.includes("Faithful Servant"))).toBe(false);
    engine.choose(firstPick!.options.find((o) => o.kind === "answerChoice" && o.label.includes("Raven Spy"))!.id);
    const secondPick = engine.decision();
    expect(secondPick?.window).toBe("choice");
    expect(pickLabels(secondPick!.options)).toEqual(["Dog Pack"]);
    engine.choose(secondPick!.options[0]!.id);

    expect(alice.hand.some((c) => c.id === "rv" || c.id === "dp")).toBe(false);
    expect(alice.hand.some((c) => c.id === "fs")).toBe(true);
    expect(alice.ashHeap?.map((c) => c.id)).toContain("rv");
    expect(alice.ashHeap?.map((c) => c.id)).toContain("dp");
    expect(currentCombat(state).initialStrikeDamageUsed).toContain("cwh");
    expect(currentCombat(state).initialStrikeDamage).toMatchObject([
      { cardId: "cwh", minion: "M", amount: 2 },
    ]);

    passToWindow(engine, "combat.damageResolution");
    expect(currentCombat(state).initialStrikeDamage).toEqual([]);
    const damage = state.eventLog.find((e) => e.type === "DamageInflicted" && e.minion === "M" && e.source === null);
    expect(damage).toMatchObject({ amount: 2, aggravated: false });
    while (engine.decision()?.window === "combat.damageResolution") {
      const dp = engine.decision()!;
      runTrace(engine, [[dp.seat, dp.options[0]!.id]]);
    }
    expect(m.blood).toBe(3);
    expect(call).toContain("Call the Wild Hunt");
  });
});
