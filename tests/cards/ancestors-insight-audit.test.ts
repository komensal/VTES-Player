import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

const ids = (engine: VtesEngine): string[] => engine.decision()!.options.map((o) => o.id);

/** Full bleed announcement sequence up to the post-block reaction window,
 *  mirroring bleed-redirects.test.ts BLEED_TO_MODIFIER. */
const BLEED_SEQ: Array<[string, string]> = [
  ["Alice", "bleed:V1"],
  ["Alice", "pass"],
  ["Bob", "pass"],
  ["Carol", "pass"],
  ["Alice", "pass"],
  ["Bob", "pass"],
  ["Carol", "pass"],
];

describe("Ancestor's Insight (100062)", () => {
  it("basic [aus] is offered as a reaction to reduce a bleed against you", () => {
    const state = threeSeatGame();
    // Bob needs a ready Laibon with aus to play Ancestor's Insight
    state.seats[1]!.minions.push(makeMinion("L1", "Bob", { sect: "laibon", capacity: 5, disciplines: { aus: "basic" } }));
    state.seats[1]!.hand.push({ id: "ai1", name: "Ancestor's Insight" });
    const engine = new VtesEngine(state, testRegistry);

    // Steps 1-4: block window. Step 5 (Alice pass): reaction window — Bob can react.
    runTrace(engine, [
      ["Alice", "bleed:V1"],
      ["Alice", "pass"],
      ["Bob", "pass"],
      ["Carol", "pass"],
      ["Alice", "pass"],
    ]);
    console.log("Reaction window options:", ids(engine));
    expect(ids(engine)).toContain("play:Ancestor's Insight:basic:L1:ai1");
  });

  it("superior [AUS] is offered as an action modifier during a bleed action", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]! = makeMinion("V1", "Alice", {
      disciplines: { aus: "superior" },
      sect: "laibon",
    });
    state.seats[0]!.hand.push({ id: "ai1", name: "Ancestor's Insight" });
    const engine = new VtesEngine(state, testRegistry);

    runTrace(engine, BLEED_SEQ);
    expect(ids(engine)).toContain("play:Ancestor's Insight:superior:V1:ai1");
  });
});