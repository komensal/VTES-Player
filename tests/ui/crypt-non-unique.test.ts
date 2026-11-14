import { describe, expect, it } from "vitest";
import registry from "../../src/cards/registry.json";
import { VtesEngine } from "../../src/engine/index.ts";
import { importCryptCard } from "../../src/ui/cardinfo.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { testRegistry } from "../engine/fixtures.ts";

const exceptions = [200001, 200466, 200541, 200605, 201423];
const deck = (seat: string, id: number): SnapshotDeck => ({
  seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 1 }],
  crypt: [{ id }], library: [], pool: 20,
});

describe("printed non-unique crypt vampires", () => {
  it("imports all five explicit exceptions, without marking ordinary crypt cards", () => {
    const crypt = Object.values(registry.entries).map((e) => e.card).filter((c) => c.kind === "crypt");
    const marked = crypt.filter((c) => importCryptCard(c.id).nonUnique).map((c) => c.id).sort((a, b) => a - b);
    expect(marked).toEqual(exceptions);
    expect(importCryptCard(200067).nonUnique).toBe(false);
  });

  it.each(exceptions)("preserves the trait in every zone and does not contest card %i", (id) => {
    const state = buildGame({ decks: [deck("Alice", id), deck("Bob", id), deck("Carol", 200067)], seed: 1, maxTurns: 40 });
    for (const seat of state.seats.slice(0, 2)) {
      expect(seat.minions[0]!.nonUnique).toBe(true);
      expect(seat.uncontrolled[0]!.card.nonUnique).toBe(true);
      expect(seat.crypt[0]!.nonUnique).toBe(true);
    }
    new VtesEngine(state, testRegistry).decision();
    for (const seat of state.seats.slice(0, 2)) {
      expect(seat.minions).toHaveLength(1);
      expect(seat.contested ?? []).toEqual([]);
    }
  });

  it("still contests an ordinary unique crypt vampire", () => {
    const state = buildGame({ decks: [deck("Alice", 200067), deck("Bob", 200067), deck("Carol", 200001)], seed: 1, maxTurns: 40 });
    new VtesEngine(state, testRegistry).decision();
    for (const seat of state.seats.slice(0, 2)) {
      expect(seat.minions).toHaveLength(0);
      expect(seat.contested).toHaveLength(1);
    }
  });
});
