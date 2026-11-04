/**
 * Mask Empathy (101178) — docs/card-rules-audit.md:
 * "entire printed text replaced by damage strikes".
 *
 *   "[pre] Strike: ranged. Burn a retainer employed by the opposing minion
 *    (usable at close range).
 *    [PRE] Play before range is determined. This vampire burns 1 blood to
 *    burn a retainer employed by the opposing minion."
 *
 * The card deals NO damage at either level, so the interesting assertions
 * are what it does NOT do as much as what it does.
 */

import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import type { DecisionPoint } from "../../src/engine/index.ts";
import type { MinionState } from "../../src/engine/index.ts";
import { testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function runUntil(engine: VtesEngine, stop: (dp: DecisionPoint) => boolean): DecisionPoint {
  for (let i = 0; i < 300; i++) {
    const dp = engine.decision();
    if (!dp) throw new Error("no decision pending");
    if (stop(dp)) return dp;
    const pass = dp.options.find((o) => o.id === "pass");
    if (!pass) return dp;
    engine.choose(pass.id);
  }
  throw new Error("loop did not settle");
}

function choose(engine: VtesEngine, prefix: string): string {
  const dp = engine.decision();
  if (!dp) throw new Error("no decision pending");
  const opt = dp.options.find((o) => o.id.startsWith(prefix));
  if (!opt) {
    throw new Error(`${prefix} not offered; legal: ${dp.options.map((o) => o.id).join(", ")}`);
  }
  engine.choose(opt.id);
  return opt.id;
}

/** V1 bleeds, M blocks, and Alice's pre-range window opens. */
function toBeforeRange(engine: VtesEngine): void {
  choose(engine, "bleed:V1");
  runUntil(engine, (dp) => dp.window === "action.effects" && dp.seat === "Bob");
  choose(engine, "block:M");
  runUntil(engine, (dp) => dp.window === "combat.beforeRange" && dp.seat === "Alice");
}

function withRetainer(disciplines: MinionState["disciplines"]) {
  const state = threeSeatGame();
  const v1 = state.seats[0]!.minions[0]!;
  v1.disciplines = disciplines;
  v1.blood = 5;
  const m = state.seats[1]!.minions.find((x) => x.id === "M")!;
  m.attached.push({
    card: { id: "rt1", name: "Ghoul" },
    statics: {},
    tags: ["retainer"],
    life: 1,
  } as unknown as MinionState["attached"][number]);
  state.seats[0]!.hand.push({ id: "k", name: "Mask Empathy" });
  return { state, v1, m, engine: new VtesEngine(state, testRegistry) };
}

describe("Mask Empathy (101178)", () => {
  it("[PRE] burns 1 blood to burn the opposing minion's retainer, before range", () => {
    const { state, v1, m, engine } = withRetainer({ pre: "superior" });

    toBeforeRange(engine);
    choose(engine, "play:Mask Empathy:superior");
    for (let i = 0; i < 10; i++) {
      const dp = engine.decision();
      if (!dp) break;
      const pass = dp.options.find((o) => o.id === "pass");
      if (!pass) break;
      engine.choose(pass.id);
    }

    expect(state.eventLog.some((e) => e.type === "PermanentBurned" && e.name === "Ghoul")).toBe(
      true,
    );
    expect(m.attached.map((p) => p.card.name)).toEqual([]);
    expect(v1.blood).toBe(4); // 5 − the card's own 1 blood
    // It is not a damage strike: nothing was inflicted.
    expect(state.eventLog.some((e) => e.type === "DamageInflicted")).toBe(false);
  });

  it("[pre] is a ranged strike that burns the retainer instead of dealing damage", () => {
    const { state, m, engine } = withRetainer({ pre: "basic" });

    // Pre-range: the basic mode is a STRIKE, so it is not offered yet.
    toBeforeRange(engine);
    expect(
      engine.decision()!.options.some((o) => o.id.startsWith("play:Mask Empathy")),
    ).toBe(false);

    runUntil(engine, (dp) => dp.window === "combat.chooseStrike" && dp.seat === "Alice");
    // One option per retainer, named by card id in the option id.
    expect(
      engine.decision()!.options.some((o) => o.id === "play:Mask Empathy:basic:V1:rt1:k"),
    ).toBe(true);

    choose(engine, "play:Mask Empathy:basic");
    runUntil(engine, (dp) => dp.window === "combat.chooseStrike" && dp.seat === "Bob");
    choose(engine, "strike:hand");
    for (let i = 0; i < 40; i++) {
      const dp = engine.decision();
      if (!dp) break;
      const pass = dp.options.find((o) => o.id === "pass");
      if (!pass) break;
      engine.choose(pass.id);
    }

    expect(state.eventLog.some((e) => e.type === "PermanentBurned" && e.name === "Ghoul")).toBe(
      true,
    );
    expect(m.attached.map((p) => p.card.name)).toEqual([]);
  });

  it("is not offered at all when the opposing minion employs no retainer", () => {
    const { engine } = (() => {
      const state = threeSeatGame();
      const v1 = state.seats[0]!.minions[0]!;
      v1.disciplines = { pre: "superior" };
      v1.blood = 5;
      state.seats[0]!.hand.push({ id: "k", name: "Mask Empathy" });
      return { engine: new VtesEngine(state, testRegistry) };
    })();

    toBeforeRange(engine);
    expect(
      engine.decision()!.options.some((o) => o.id.startsWith("play:Mask Empathy")),
    ).toBe(false);
  });
});
