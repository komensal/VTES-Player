import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame, type TraceStep } from "../engine/fixtures.ts";

const ids = (engine: VtesEngine): string[] => engine.decision()!.options.map((o) => o.id);

/** Alice's younger vampire V1 (capacity 4) bleeds Bob; passes up to the
 *  post-block reaction window where Bob can play Lost in Translation. */
const YOUNGER_VAMPIRE_BLEEDS: TraceStep[] = [
  ["Alice", "bleed:V1"],
  ["Alice", "pass"],
  ["Bob", "pass"],
  ["Carol", "pass"],
  ["Alice", "pass"],
  ["Bob", "pass"],
  ["Carol", "pass"],
  ["Alice", "pass"],   // action modifier window: Alice passes → Bob's reaction window
];

describe("Lost in Translation (101126)", () => {
  it("is offered when a younger vampire bleeds you after blocks are declined", () => {
    const state = threeSeatGame();
    // Make V1 younger than Bob's W (capacity 5) so Lost in Translation is usable.
    state.seats[0]!.minions[0]! = makeMinion("V1", "Alice", {
      disciplines: { dom: "basic" },
      capacity: 4,
    });
    state.seats[1]!.hand.push({ id: "lit1", name: "Lost in Translation" });
    state.seats[1]!.hand.push({ id: "lit2", name: "Lost in Translation" });
    const engine = new VtesEngine(state, testRegistry);

    runTrace(engine, YOUNGER_VAMPIRE_BLEEDS);
    expect(ids(engine)).toContain("play:Lost in Translation:basic:W:Carol:lit1");
    expect(ids(engine)).toContain("play:Lost in Translation:basic:W:Carol:lit2");
  });

  it("only one Lost in Translation may be played per action", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]! = makeMinion("V1", "Alice", {
      disciplines: { dom: "basic" },
      capacity: 4,
    });
    state.seats[1]!.hand.push({ id: "lit1", name: "Lost in Translation" });
    state.seats[1]!.hand.push({ id: "lit2", name: "Lost in Translation" });
    const engine = new VtesEngine(state, testRegistry);

    runTrace(engine, [
      ...YOUNGER_VAMPIRE_BLEEDS,
      ["Bob", "play:Lost in Translation:basic:W:Carol:lit1"],
    ]);
    expect(ids(engine)).not.toContain("play:Lost in Translation:basic:W:Carol:lit2");
  });

  it("redirects the bleed to the third Methuselah (not the reactor, not the acting controller)", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]! = makeMinion("V1", "Alice", {
      disciplines: { dom: "basic" },
      capacity: 4,
    });
    state.seats[1]!.hand.push({ id: "lit1", name: "Lost in Translation" });
    const engine = new VtesEngine(state, testRegistry);

    runTrace(engine, [
      ...YOUNGER_VAMPIRE_BLEEDS,
      ["Bob", "play:Lost in Translation:basic:W:Carol:lit1"],
      ["Alice", "pass"],   // card.asPlayed: Alice passes
      ["Bob", "pass"],
      ["Carol", "pass"],
      ["Alice", "pass"],
    ]);
    // Target should now be Carol (the third seat), not Alice.
    const actionFrame = state.frames.find((f) => f.kind === "action");
    if (!actionFrame || actionFrame.kind !== "action") throw new Error("no action frame");
    expect(actionFrame.target).toBe("Carol");
  });
});