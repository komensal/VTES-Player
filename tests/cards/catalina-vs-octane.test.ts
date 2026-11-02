/**
 * Repro test: Catalina Vega (G6) vs Octane (G6) - exact scenario from user log.
 * Both strike hand, 1 damage each, combat ends after 1 round.
 * Question: was Pursuit (or other additional strike card) offered in chooseStrike?
 */
import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function enterCombat(engine: VtesEngine): void {
  runTrace(engine, [
    ["Alice", "bleed:Catalina"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"],
    ["Bob", "block:Octane"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
}

const toStrikes: Array<[string, string]> = [
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // before range
  ["Alice", "pass"], ["Bob", "pass"], // range → close
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // before strikes
];

describe("Catalina Vega vs Octane - exact user log scenario", () => {
  it("reproduces the log: hand strikes, 1 dmg each, combat ends after 1 round", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!; // V1 = Catalina Vega (acting)
    v1.name = "Catalina Vega (G6)";
    v1.id = "Catalina";
    v1.blood = 6; // G6 = 6 capacity, typically 6 blood
    // Catalina Vega disciplines? In V5 she has cel, dom, for, pre (Group 6 Ventrue)
    // But test registry may not have full disciplines. Let's give her cel:superior for Pursuit.
    v1.disciplines = { cel: "superior" };
    
    const m = state.seats[1]!.minions.find(m => m.id === "M")!; // M = Octane (blocking)
    m.name = "Octane (G6)";
    m.id = "Octane";
    m.blood = 6;
    
    // Give Catalina a Pursuit card in hand
    state.seats[0]!.hand.push({ id: "pu1", name: "Pursuit" });
    
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, toStrikes);

    // Now at chooseStrike for Catalina (acting)
    const dp = engine.decision()!;
    expect(dp.window).toBe("combat.chooseStrike");
    expect(dp.seat).toBe("Alice");

    // Pursuit:superior is NOT offered in chooseStrike — additional-strike-only cards
    // go into the post-first-pair grantAdditionalStrikes window (V5 p. 32).
    const hasPursuitInChooseStrike = dp.options.some(o => o.id.startsWith("play:Pursuit:superior"));
    expect(hasPursuitInChooseStrike).toBe(false);
    
    // Hand strike should be offered
    const hasHandStrike = dp.options.some(o => o.id === "strike:hand");
    expect(hasHandStrike).toBe(true);

    // Both strike hand; then grantAdditionalStrikes window opens (Alice has Pursuit in hand)
    runTrace(engine, [
      ["Alice", "strike:hand"],
      ["Bob", "strike:hand"],
      ["Alice", "pass"], // damageResolution Alice
      ["Bob", "pass"],   // damageResolution Bob
    ]);

    // After damage resolution, check the grantAdditionalStrikes window
    const grantDp = engine.decision()!;
    expect(grantDp.window).toBe("combat.grantAdditionalStrikes");
    expect(grantDp.seat).toBe("Alice");

    // Pursuit:superior should be offered here (p. 32: additional strikes are GAINED after first pair)
    const hasPursuitInGrant = grantDp.options.some(o => o.id.startsWith("play:Pursuit:superior"));
    expect(hasPursuitInGrant).toBe(true);

    runTrace(engine, [
      // Alice plays Pursuit:superior in the grant window, granting herself additional strikes
      ["Alice", "play:Pursuit:superior"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as-played window
      // Alternation protocol in grant window: Bob declines, Alice declines
      ["Bob", "pass"],
      ["Alice", "pass"],
      // Additional strike sub-round (Catalina gets additional strike; Bob does not)
      ["Alice", "strike:hand"],
      ["Bob", "pass"], // damageResolution for Octane (takes 1 dmg, mends 1 blood: 4 -> 3)
      ["Alice", "pass"], ["Bob", "pass"], // press
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // end of round
    ]);
    // Octane took 3 blood loss total: 1 first strike + 1 mend + 1 additional strike
    expect(m.blood).toBe(3);
  });

  it("without Pursuit in hand - combat ends after 1 round with hand strikes", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.name = "Catalina Vega (G6)";
    v1.id = "Catalina";
    v1.blood = 6;
    v1.disciplines = { cel: "superior" };
    
    const m = state.seats[1]!.minions.find(m => m.id === "M")!;
    m.name = "Octane (G6)";
    m.id = "Octane";
    m.blood = 6;
    
    // NO Pursuit in hand
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, toStrikes);

    const dp = engine.decision()!;
    expect(dp.window).toBe("combat.chooseStrike");
    
    runTrace(engine, [
      ["Alice", "strike:hand"],
      ["Bob", "strike:hand"],
      ["Alice", "pass"], // damageResolution Alice
      ["Bob", "pass"],   // damageResolution Bob
      // No Pursuit in hand → no grantAdditionalStrikes window opens
      ["Alice", "pass"], ["Bob", "pass"], // press
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // end of round
    ]);
    
    // Octane took 1 damage, mended it: 6 -> 5 -> 4 (burns 1 blood to mend)
    expect(m.blood).toBe(4);
  });
});
