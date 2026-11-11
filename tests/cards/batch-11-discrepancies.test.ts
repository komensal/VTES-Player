/** Targeted regressions and remaining characterization from batch 11.
 * The Consanguineous Boon test still records a known defect.
 */
import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

const announce = (card: string): Array<[string, string]> => [
  ["Alice", `play:${card}`],
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
];

describe("batch 11 audit: observed behavior", () => {
  it("Consanguineous Boon omits a registered clan from its terms", () => {
    const state = threeSeatGame();
    Object.assign(state.seats[0]!.minions[0]!, { title: "prince", clan: "Brujah" });
    state.seats[1]!.minions[0]!.clan = "Toreador antitribu";
    state.seats[0]!.hand.push({ id: "boon", name: "Consanguineous Boon" });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, announce("Consanguineous Boon"));
    const terms = engine.decision()!.options.map((option) => option.id);
    expect(terms).toContain("terms:Brujah"); // control: we reached the terms decision
    expect(terms).toContain("terms:Nosferatu"); // not limited to clans in play
    // Known defect: this actual clan should be available too.
    expect(terms).not.toContain("terms:Toreador antitribu");
  });

  it.each(["Camarilla Exemplary", "Sabbat Priest", "Archon"])("%s charges vampires but not allies attempting to block", (card) => {
    function blockDecision(withCard: boolean) {
      const state = threeSeatGame();
      const actor = state.seats[0]!.minions[0]!;
      state.seats[1]!.minions[1]!.blood = 0;
      state.seats[1]!.minions.push(makeMinion("ally", "Bob", { kind: "ally", clan: null }));
      if (withCard) {
        const handler = testRegistry[card]!;
        actor.attached.push({
          card: { id: "toll", name: card }, locked: false,
          usedThisPhase: false, statics: { ...handler.permanentStatics },
          tags: [...(handler.permanentTags ?? [])], controller: "Alice",
        });
      }
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [
        ["Alice", "bleed:V1"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"],
      ]);
      expect(engine.decision()?.seat).toBe("Bob");
      return { state, engine, options: engine.decision()!.options.map((option) => option.id) };
    }
    const without = blockDecision(false);
    const withCard = blockDecision(true);
    expect(without.options).toContain("block:ally");
    expect(without.options).toContain("block:M"); // vampire without blood can block when untaxed
    expect(withCard.options).toContain("block:W"); // a vampire with blood can pay
    expect(withCard.options).not.toContain("block:M");
    expect(withCard.options).toContain("block:ally");
    const ally = withCard.state.seats[1]!.minions.find((m) => m.id === "ally")!;
    const life = ally.blood;
    withCard.engine.choose("block:ally");
    expect(ally.blood).toBe(life);
    const vampireAttempt = blockDecision(true);
    const vampire = vampireAttempt.state.seats[1]!.minions[0]!;
    const blood = vampire.blood;
    vampireAttempt.engine.choose("block:W");
    expect(vampire.blood).toBe(blood - 1);
  });

  it("Can't Take it with You gains for every seat before burning pool", () => {
    const state = threeSeatGame();
    Object.assign(state.seats[0]!.minions[0]!, { title: "innerCircle", sect: "camarilla" });
    state.seats[0]!.hand.push({ id: "ctiwy", name: "Can't Take it with You" });
    state.seats[0]!.permanents.push({
      card: { id: "loc", name: "The Barrens" }, locked: false,
      usedThisPhase: false, statics: {}, tags: ["location"],
    });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ...announce("Can't Take it with You"),
      ["Alice", "vote:V1:for"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    expect(state.eventLog.some((e) => e.type === "ReferendumResolved" && e.passed)).toBe(true);
    const moves = state.eventLog
      .filter((e) => e.type === "PoolGained" || e.type === "PoolBurned")
      .map((e) => ({ type: e.type, seat: e.seat, amount: e.amount }));
    expect(moves).toEqual([
      { type: "PoolGained", seat: "Alice", amount: 1 },
      { type: "PoolGained", seat: "Bob", amount: 1 },
      { type: "PoolGained", seat: "Carol", amount: 1 },
      { type: "PoolBurned", seat: "Alice", amount: 1 },
    ]);
  });
});
