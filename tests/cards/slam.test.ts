/**
 * Slam (101798) — "[pot] Strike: hand strike at +2 damage." A
 * strikeHandBonus combat card (superior adds a maneuver rider).
 */

import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function enterCombat(engine: VtesEngine): void {
  runTrace(engine, [
    ["Alice", "bleed:V1"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"],
    ["Bob", "block:M"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
}

function atRange(engine: VtesEngine): string[] {
  for (let i = 0; i < 12; i++) {
    const dp = engine.decision();
    if (!dp) return [];
    if (dp.window === "combat.range") return dp.options.map((o) => o.id);
    const pass = dp.options.find((o) => o.id === "pass");
    if (!pass) return [];
    runTrace(engine, [[dp.seat, pass.id]]);
  }
  return [];
}

const toStrikes: Array<[string, string]> = [
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // before range
  ["Alice", "pass"], ["Bob", "pass"], // range → close
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // before strikes
];

describe("Slam (101798)", () => {
  it("strikes for strength + 2 damage", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { pot: "basic" };
    v1.strength = 1;
    v1.blood = 5;
    v1.capacity = 5;
    const m = state.seats[1]!.minions.find((x) => x.id === "M")!;
    m.blood = 5;
    m.capacity = 5;
    state.seats[0]!.hand.push({ id: "sl1", name: "Slam" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, [
      ...toStrikes,
      ["Alice", "play:Slam:basic:V1"], // V1's strike: hand at +2 → 3 damage
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as-played
      ["Bob", "strike:hand"],
      ["Alice", "pass"], // V1 mends M's hand strike
      ["Bob", "pass"], // M takes 3 → mends 3
      ["Alice", "pass"], ["Bob", "pass"], // press
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // end of round
    ]);

    const dmg = state.eventLog.find(
      (e) => e.type === "DamageInflicted" && e.minion === "M",
    );
    expect(dmg).toMatchObject({ amount: 3 });
  });

  it("superior commits at range and restricts its maneuver to getting close", () => {
    for (const range of ["close", "long"] as const) {
      const state = threeSeatGame();
      const v1 = state.seats[0]!.minions[0]!;
      v1.disciplines = { pot: "superior" };
      v1.blood = 5;
      state.seats[0]!.hand.push({ id: `sl-${range}`, name: "Slam" });
      const engine = new VtesEngine(state, testRegistry);
      enterCombat(engine);
      const cf0 = state.frames.find((f) => f.kind === "combat");
      if (cf0?.kind !== "combat") throw new Error("no combat frame");
      cf0.range = range;

      const id = atRange(engine).find((o) => o.startsWith(`play:Slam:superior:V1`));
      expect(id, `Slam superior missing at ${range}`).toBeDefined();
      engine.choose(id!);
      for (let i = 0; i < 6; i++) {
        const dp = engine.decision();
        if (!dp || dp.window !== "card.asPlayed") break;
        const pass = dp.options.find((o) => o.id === "pass");
        if (!pass) break;
        runTrace(engine, [[dp.seat, pass.id]]);
      }

      const cf = state.frames.find((f) => f.kind === "combat");
      expect(cf?.kind === "combat" ? cf.strikes.acting?.name : null).toBe("Slam");
      expect(cf?.kind === "combat" ? cf.maneuverCredits.acting : null).toBe(0);
      expect(cf?.kind === "combat" ? cf.closeManeuvers.acting : null).toBe(range === "long" ? 1 : 0);
      if (range === "long") {
        let usedCloseManeuver = false;
        for (let i = 0; i < 6 && !usedCloseManeuver; i++) {
          const dp = engine.decision();
          if (!dp || dp.window !== "combat.range") break;
          const credit = dp.options.find((o) => o.id === "maneuver:credit");
          if (credit && dp.seat === "Alice") {
            runTrace(engine, [[dp.seat, credit.id]]);
            usedCloseManeuver = true;
          } else {
            const pass = dp.options.find((o) => o.id === "pass");
            if (!pass) break;
            runTrace(engine, [[dp.seat, pass.id]]);
          }
        }
        expect(usedCloseManeuver).toBe(true);
        const afterManeuver = state.frames.find((f) => f.kind === "combat");
        expect(afterManeuver?.kind === "combat" ? afterManeuver.range : null).toBe("close");
      }
    }
  });
});
