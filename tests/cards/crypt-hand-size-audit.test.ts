import { describe, expect, it } from "vitest";
import { VtesEngine, handSizeOf } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { runTrace, testRegistry } from "../engine/fixtures.ts";

const deck = (seat: string, id: number): SnapshotDeck => ({
  seat, ready: [{ id }], uncontrolled: [], crypt: [], library: [], pool: 20,
});
function game(id: number) {
  return buildGame({
    decks: [deck("Alice", id), deck("Bob", 200067), deck("Carol", 200132)],
    seed: 1, maxTurns: 40,
  });
}

describe("crypt hand size bonuses from printed conditions", () => {
  it.each([
    [201035, "Nana Buruku"],
    [201410, "Unmada"],
    [201634, "Abraham Mellon"],
  ])("%s %s affects only its controller while ready", (id) => {
    const state = game(id);
    const vampire = state.seats[0]!.minions[0]!;
    expect(handSizeOf(state, "Alice")).toBe(8);
    expect(handSizeOf(state, "Bob")).toBe(7);
    vampire.locked = true; // locked is still ready
    expect(handSizeOf(state, "Alice")).toBe(8);
    vampire.inTorpor = true;
    expect(handSizeOf(state, "Alice")).toBe(7);
    vampire.inTorpor = false;
    expect(handSizeOf(state, "Alice")).toBe(8);
    state.seats[0]!.minions = [];
    expect(handSizeOf(state, "Alice")).toBe(7);
  });

  it("Henri's hand-size bonus does not apply during someone else's combat", () => {
    const state = game(200589);
    const actor = state.seats[1]!.minions[0]!;
    const blocker = state.seats[2]!.minions[0]!;
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("missing turn");
    turn.seat = "Bob";
    turn.phase = "minion";
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ["Bob", `bleed:${actor.id}`],
      ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"],
      ["Bob", "pass"], ["Carol", `block:${blocker.id}`],
      ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"],
    ]);
    expect(state.frames.some((f) => f.kind === "combat")).toBe(true);
    expect(handSizeOf(state, "Alice")).toBe(7);
  });

  it("Henri's hand-size bonus lasts only through his own combat", () => {
    const state = game(200589);
    const henri = state.seats[0]!.minions[0]!;
    const blocker = state.seats[1]!.minions[0]!;
    const engine = new VtesEngine(state, testRegistry);
    // BuildGame snapshots start at unlock; put the turn in minion phase.
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("missing turn");
    turn.phase = "minion";
    expect(handSizeOf(state, "Alice")).toBe(7);
    runTrace(engine, [
      ["Alice", `bleed:${henri.id}`],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", `block:${blocker.id}`],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    expect(state.frames.some((f) => f.kind === "combat")).toBe(true);
    expect(handSizeOf(state, "Alice")).toBe(8);
    expect(handSizeOf(state, "Bob")).toBe(7);
    state.frames = state.frames.filter((f) => f.kind !== "combat");
    expect(handSizeOf(state, "Alice")).toBe(7);
  });
});
