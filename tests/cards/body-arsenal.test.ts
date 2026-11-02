import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

describe("Body Arsenal (100228)", () => {
  it("makes hand-strike damage aggravated; superior also adds +1 strength", () => {
    for (const [mode, discipline, amount] of [
      ["basic", "basic", 1],
      ["superior", "superior", 2],
    ] as const) {
      const state = threeSeatGame();
      const alice = state.seats[0]!;
      const vampire = alice.minions[0]!;
      vampire.disciplines = { vic: discipline };
      vampire.blood = 5;
      alice.hand.push({ id: `ba-${mode}`, name: "Body Arsenal" });
      const m = state.seats[1]!.minions.find((x) => x.id === "M")!;
      m.blood = 5;
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [
        ["Alice", "bleed:V1"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "block:M"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ]);

      let played = false;
      for (let i = 0; i < 50 && !state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M"); i++) {
        const dp = engine.decision();
        if (!dp) throw new Error("no decision while resolving Body Arsenal");
        const play = dp.options.find((o) => o.id.startsWith(`play:Body Arsenal:${mode}:V1:ba-${mode}`));
        const option = play ?? (dp.window === "combat.chooseStrike"
          ? dp.options.find((o) => o.id === "strike:hand")
          : dp.options.find((o) => o.id === "pass"));
        if (!option) throw new Error(`no applicable choice in ${dp.window}: ${dp.options.map((o) => o.id).join(", ")}`);
        runTrace(engine, [[dp.seat, option.id]]);
        if (option.id.startsWith("play:Body Arsenal:")) played = true;
      }

      const damage = state.eventLog.find((e) => e.type === "DamageInflicted" && e.minion === "M");
      expect(played).toBe(true);
      expect(damage).toMatchObject({ amount, aggravated: true });
    }
  });
});
