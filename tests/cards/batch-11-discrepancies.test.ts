/** Characterization of audited discrepancies, not expected VTES behavior.
 * When the defects are fixed, replace the assertions with the correct rules.
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

  it("Camarilla Exemplary's toll also prevents an ally from attempting to block", () => {
    function blockOptions(withExemplary: boolean): string[] {
      const state = threeSeatGame();
      const actor = state.seats[0]!.minions[0]!;
      state.seats[1]!.minions.push(makeMinion("ally", "Bob", { kind: "ally", clan: null }));
      if (withExemplary) {
        const handler = testRegistry["Camarilla Exemplary"]!;
        actor.attached.push({
          card: { id: "exemplary", name: "Camarilla Exemplary" }, locked: false,
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
      return engine.decision()!.options.map((option) => option.id);
    }
    const without = blockOptions(false);
    const withCard = blockOptions(true);
    expect(without).toContain("block:ally");
    expect(withCard).toContain("block:W"); // a vampire with blood can pay
    // Known defect: the card charges vampires, not allies.
    expect(withCard).not.toContain("block:ally");
  });

  it("Can't Take it with You interleaves gain and burn by seat", () => {
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
    // Known defect: the printed "then" places every gain before any burn.
    expect(moves).toEqual([
      { type: "PoolGained", seat: "Alice", amount: 1 },
      { type: "PoolBurned", seat: "Alice", amount: 1 },
      { type: "PoolGained", seat: "Bob", amount: 1 },
      { type: "PoolGained", seat: "Carol", amount: 1 },
    ]);
  });
});
