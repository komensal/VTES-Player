import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { testRegistry } from "../engine/fixtures.ts";

describe("Abdelsobek import", () => {
  it("retains the granted action in all crypt zones and offers it from a real deck", () => {
    const deck = (seat: string, id: number): SnapshotDeck => ({
      seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 0 }],
      crypt: [{ id }], library: [], pool: 20,
    });
    const state = buildGame({ decks: [deck("Alice", 200005), deck("Bob", 200067), deck("Carol", 200132)], seed: 1, maxTurns: 40 });
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("no turn");
    turn.phase = "minion";
    turn.unlockDone = turn.edgeDone = turn.unlockAbilitiesDone = true;
    const seat = state.seats[0]!;
    const actor = seat.minions[0]!;
    actor.blood = 2;
    actor.locked = false;
    for (const m of [actor, seat.uncontrolled[0]!.card, seat.crypt[0]!]) {
      expect(m.attached.find((p) => p.card.id === m.id)).toBeDefined();
    }
    const engine = new VtesEngine(state, testRegistry);
    expect(engine.decision()!.options.some((o) => o.id.startsWith("act:Abdelsobek") && o.id.endsWith(`unlock:${actor.id}`))).toBe(true);
  });
});
