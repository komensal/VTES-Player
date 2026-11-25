/**
 * Celestial Harmony (100313).
 *
 * [aus] Choose a Methuselah. That Methuselah selects all but one of the
 * cards in his or her hand and shows them to you.
 * [AUS] As above, but all Methuselahs are chosen.
 *
 * The seat is chosen at resolution, the OWNER picks the one card that stays
 * hidden, and the look is recorded as knowledge — the actor remembers the
 * shown cards, never the hidden one.
 */

import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function game(level: "basic" | "superior"): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const v1 = state.seats[0]!.minions[0]!;
  v1.disciplines = { aus: level };
  v1.blood = 3;
  state.seats[0]!.hand = [{ id: "ch", name: "Celestial Harmony" }];
  state.seats[1]!.hand = [
    { id: "b1", name: "Deflection" },
    { id: "b2", name: "Conditioning" },
  ];
  state.seats[2]!.hand = [];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

function resolveUnblocked(engine: VtesEngine, play: string): void {
  runTrace(engine, [
    ["Alice", play],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // announce
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // A
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // C → resolve
  ]);
}

describe("Celestial Harmony (100313)", () => {
  it("[aus] lets the actor choose any other Methuselah at resolution", () => {
    const { engine } = game("basic");
    resolveUnblocked(engine, "play:Celestial Harmony:basic:V1:ch");
    const dp = engine.decision()!;
    expect(dp.seat).toBe("Alice");
    const ids = dp.options.map((o) => o.id);
    expect(ids).toContain("choice:Celestial Harmony:ch:showHandAllButOne:seat:Bob");
    expect(ids).toContain("choice:Celestial Harmony:ch:showHandAllButOne:seat:Carol");
    expect(ids.some((i) => i.endsWith(":Alice"))).toBe(false);
  });

  it("[aus] the owner hides one card and the actor is shown the rest", () => {
    const { state, engine } = game("basic");
    resolveUnblocked(engine, "play:Celestial Harmony:basic:V1:ch");
    engine.choose("choice:Celestial Harmony:ch:showHandAllButOne:seat:Bob");
    // The choice belongs to BOB, not to the actor.
    const dp = engine.decision()!;
    expect(dp.seat).toBe("Bob");
    const ids = dp.options.map((o) => o.id);
    expect(ids).toContain("choice:Celestial Harmony:ch:showHandAllButOne:hide:b1");
    expect(ids).toContain("choice:Celestial Harmony:ch:showHandAllButOne:hide:b2");

    engine.choose("choice:Celestial Harmony:ch:showHandAllButOne:hide:b1");
    const reveal = state.eventLog.find((e) => e.type === "CardsRevealed");
    expect(reveal).toBeDefined();
    if (reveal?.type !== "CardsRevealed") throw new Error("no reveal");
    expect(reveal.to).toBe("Alice");
    expect(reveal.cards).toEqual(["b2"]); // b1 stayed hidden
    expect(state.knowledge?.["Alice"] ?? []).toContain("b2");
    expect(state.knowledge?.["Alice"] ?? []).not.toContain("b1");
    // Bob's hand is untouched: showing is not discarding.
    expect(state.seats[1]!.hand.length).toBe(2);
  });

  it("[aus] a one-card or empty hand shows nothing", () => {
    const { state, engine } = game("basic");
    state.seats[1]!.hand = [{ id: "b1", name: "Deflection" }];
    resolveUnblocked(engine, "play:Celestial Harmony:basic:V1:ch");
    engine.choose("choice:Celestial Harmony:ch:showHandAllButOne:seat:Bob");
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toEqual(["choice:Celestial Harmony:ch:showHandAllButOne:none"]);
    engine.choose("choice:Celestial Harmony:ch:showHandAllButOne:none");
    expect(state.eventLog.some((e) => e.type === "CardsRevealed")).toBe(false);
  });

  it("[AUS] asks every other Methuselah in turn, including an empty hand", () => {
    const { state, engine } = game("superior");
    resolveUnblocked(engine, "play:Celestial Harmony:superior:V1:ch");
    // No seat pick at superior: Bob is asked directly.
    let dp = engine.decision()!;
    expect(dp.seat).toBe("Bob");
    engine.choose("choice:Celestial Harmony:ch:showHandAllButOne:hide:b2");
    dp = engine.decision()!;
    expect(dp.seat).toBe("Carol"); // empty hand, but still chosen
    engine.choose("choice:Celestial Harmony:ch:showHandAllButOne:none");

    const reveals = state.eventLog.filter((e) => e.type === "CardsRevealed");
    expect(reveals.length).toBe(1); // Bob's only; Carol had nothing to show
    if (reveals[0]?.type !== "CardsRevealed") throw new Error("no reveal");
    expect(reveals[0].to).toBe("Alice");
    expect(reveals[0].cards).toEqual(["b1"]);
    expect(state.knowledge?.["Alice"] ?? []).toContain("b1");
    expect(state.knowledge?.["Alice"] ?? []).not.toContain("b2");
  });
});
