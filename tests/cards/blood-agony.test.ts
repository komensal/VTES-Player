import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

describe("Blood Agony (100192)", () => {
  it("aggravates the next hand strike, or all hand strikes at superior", () => {
    for (const [mode, discipline] of [["basic", "basic"], ["superior", "superior"]] as const) {
      const state = threeSeatGame();
      const alice = state.seats[0]!;
      const vampire = alice.minions[0]!;
      vampire.disciplines = { qui: discipline };
      vampire.blood = 5;
      alice.hand.push({ id: `baga-${mode}`, name: "Blood Agony" });
      const target = state.seats[1]!.minions.find((m) => m.id === "M")!;
      target.blood = 5;
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [
        ["Alice", "bleed:V1"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "block:M"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ]);
      const combat = state.frames.find((f) => f.kind === "combat");
      if (combat?.kind !== "combat") throw new Error("no combat frame");
      combat.round = 2;
      combat.range = "close";

      let played = false;
      for (let i = 0; i < 50 && !state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M"); i++) {
        const dp = engine.decision();
        if (!dp) throw new Error("no decision while resolving Blood Agony");
        const play = dp.options.find((o) => o.id.startsWith(`play:Blood Agony:${mode}:V1:baga-${mode}`));
        const option = play ?? (dp.window === "combat.chooseStrike"
          ? dp.options.find((o) => o.id === "strike:hand")
          : dp.options.find((o) => o.id === "pass"));
        if (!option) throw new Error(`cannot proceed through ${dp.window}`);
        runTrace(engine, [[dp.seat, option.id]]);
        if (play) played = true;
      }

      expect(played).toBe(true);
      expect(state.eventLog.find((e) => e.type === "DamageInflicted" && e.minion === "M")).toMatchObject({ aggravated: true });
    }
  });
});
