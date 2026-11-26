/**
 * Infamous Warlock (100976).
 *
 * Put this card on a Tremere antitribu with a title. The vampire with this
 * card cannot cast votes or ballots.
 */

import { describe, expect, it } from "vitest";
import type { GameState, ReferendumFrame } from "../../src/engine/index.ts";
import { VtesEngine, vampireMayVote } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function game(): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const tf = state.frames[0]!;
  if (tf.kind !== "turn") throw new Error("turn fixture");
  tf.phase = "master";
  tf.masterActionsLeft = 1;
  state.seats[0]!.hand = [{ id: "iw", name: "Infamous Warlock" }];
  state.seats[0]!.minions = [
    makeMinion("T1", "Alice", { clan: "Tremere antitribu", title: "bishop" }),
    makeMinion("T2", "Alice", { clan: "Tremere antitribu", title: null }), // no title
    makeMinion("G1", "Alice", { clan: "Giovanni", title: "bishop" }), // wrong clan
  ];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

function rf(): ReferendumFrame {
  return {
    kind: "referendum",
    variant: "political",
    calledBy: "V1",
    calledBySeat: "Alice",
    title: "Test",
    votes: [],
    cycle: { order: ["Alice", "Bob", "Carol"], index: 0, passed: [] },
  } as unknown as ReferendumFrame;
}

describe("Infamous Warlock (100976)", () => {
  it("is offered only on a TITLED Tremere antitribu", () => {
    const { engine } = game();
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids.some((i) => i.startsWith("play:Infamous Warlock") && i.includes(":T1:"))).toBe(true);
    expect(ids.some((i) => i.startsWith("play:Infamous Warlock") && i.includes(":T2:"))).toBe(false);
    expect(ids.some((i) => i.startsWith("play:Infamous Warlock") && i.includes(":G1:"))).toBe(false);
  });

  it("the bearer cannot cast votes or ballots afterwards", () => {
    const { state, engine } = game();
    const bearer = state.seats[0]!.minions[0]!;
    expect(vampireMayVote(rf(), bearer)).toBe(true); // a bishop may vote before
    runTrace(engine, [
      ["Alice", "play:Infamous Warlock"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
    ]);
    expect(bearer.attached.some((p) => p.card.name === "Infamous Warlock")).toBe(true);
    expect(vampireMayVote(rf(), bearer)).toBe(false);
    // Another vampire is unaffected.
    expect(vampireMayVote(rf(), state.seats[0]!.minions[2]!)).toBe(true);
  });
});
