/**
 * Fortschritt Library (100775).
 *
 * "Search your library for a Gehenna event card. Show it to all players and
 * add it to your hand. Discard down to your hand size afterward. Only one
 * Fortschritt Library may be played per game."
 *
 * The search is a RESOLUTION choice (p. 48): only Gehenna events are
 * offered, "find nothing" is always legal, the library is shuffled either
 * way, and the once-per-game limit is a query over the event log.
 */

import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function game(extraHand = 0): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const tf = state.frames[0]!;
  if (tf.kind !== "turn") throw new Error("turn fixture");
  tf.phase = "master";
  tf.masterActionsLeft = 2;
  const alice = state.seats[0]!;
  alice.hand = [
    { id: "fl", name: "Fortschritt Library" },
    { id: "fl2", name: "Fortschritt Library" },
  ];
  for (let i = 0; i < extraHand; i++) alice.hand.push({ id: `h${i}`, name: "Conditioning" });
  alice.library = [
    // Playing a card draws its REPLACEMENT off the top first (p. 7).
    { id: "filler", name: "Conditioning" },
    { id: "ev1", name: "Dragonbound" }, // Gehenna event
    { id: "x1", name: ".44 Magnum" }, // equipment, not an event
    { id: "ev2", name: "Thirst" }, // Gehenna event
  ];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

function resolveMaster(engine: VtesEngine): void {
  runTrace(engine, [
    ["Alice", "play:Fortschritt Library"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
  ]);
}

describe("Fortschritt Library (100775)", () => {
  it("offers only Gehenna events, plus find-nothing, at resolution", () => {
    const { engine } = game();
    resolveMaster(engine);
    const dp = engine.decision()!;
    expect(dp.seat).toBe("Alice");
    const ids = dp.options.map((o) => o.id);
    expect(ids).toContain("choice:Fortschritt Library:fl:searchLibraryGehennaEvent:ev1");
    expect(ids).toContain("choice:Fortschritt Library:fl:searchLibraryGehennaEvent:ev2");
    expect(ids).toContain("choice:Fortschritt Library:fl:searchLibraryGehennaEvent:none");
    expect(ids.some((i) => i.endsWith(":x1"))).toBe(false);
    expect(ids.some((i) => i.endsWith(":filler"))).toBe(false);
  });

  it("moves the chosen event to the hand and out of the library", () => {
    const { state, engine } = game();
    resolveMaster(engine);
    engine.choose("choice:Fortschritt Library:fl:searchLibraryGehennaEvent:ev1");
    const alice = state.seats[0]!;
    expect(alice.hand.some((c) => c.id === "ev1" && c.name === "Dragonbound")).toBe(true);
    expect(alice.library.some((c) => c.id === "ev1")).toBe(false);
    expect(state.eventLog.some((e) => e.type === "CardSearchedToHand" && e.cardId === "ev1")).toBe(true);
    // The other event and the non-event stay in the library.
    expect(alice.library.some((c) => c.id === "ev2")).toBe(true);
    expect(alice.library.some((c) => c.id === "x1")).toBe(true);
  });

  it("find-nothing is legal, takes no card, and still shuffles", () => {
    const { state, engine } = game();
    resolveMaster(engine);
    const before = state.seats[0]!.library.length;
    engine.choose("choice:Fortschritt Library:fl:searchLibraryGehennaEvent:none");
    const alice = state.seats[0]!;
    expect(alice.hand.some((c) => c.name === "Dragonbound" || c.name === "Thirst")).toBe(false);
    expect(alice.library.length).toBe(before);
    expect(state.eventLog.some((e) => e.type === "CardSearchedToHand")).toBe(false);
  });

  it("bars a second copy in the same game, even with master actions left", () => {
    const { engine } = game();
    resolveMaster(engine);
    engine.choose("choice:Fortschritt Library:fl:searchLibraryGehennaEvent:none");
    const dp = engine.decision()!;
    expect(dp.window).toBe("turn.master");
    expect(dp.options.some((o) => o.id.startsWith("play:Fortschritt Library"))).toBe(false);
  });

  it("discards down to hand size after taking the event", () => {
    const { state, engine } = game(5);
    resolveMaster(engine);
    engine.choose("choice:Fortschritt Library:fl:searchLibraryGehennaEvent:ev2");
    const alice = state.seats[0]!;
    // Eight cards is one over the seven-card hand size (p. 7), so exactly
    // one discard is owed. Answer every discard decision until the turn
    // can move on.
    for (let i = 0; i < 12; i++) {
      const dp = engine.decision();
      if (!dp) break;
      if (dp.window === "turn.master" || dp.window === "turn.minion") break;
      const opt = dp.options.find((o) => o.id !== "pass") ?? dp.options[0]!;
      engine.choose(opt.id);
    }
    expect(alice.hand.length).toBe(7);
    expect(alice.hand.some((c) => c.id === "ev2")).toBe(true);
  });
});
