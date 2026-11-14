import { describe, expect, it } from "vitest";
import { redactFor } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";

// Real Fida'i (non-unique and Blood Cursed), Effie (Sterile), Enam (title
// city), Kashan (personal title), Handsome Dan (Flight).
const ids = [200466, 200404, 200422, 200759, 200563];
const deck = (seat: string): SnapshotDeck => ({
  seat, ready: [], crypt: ids.map((id) => ({ id })),
  uncontrolled: ids.map((id, i) => ({ vampire: { id }, counters: i + 1 })),
  library: [], pool: 20,
});

describe("redacted crypt trait privacy", () => {
  it("keeps public counters and own uncontrolled traits, but no printed traits in hidden cards", () => {
    const state = buildGame({ decks: [deck("Alice"), deck("Bob")], seed: 1, maxTurns: 40 });
    const bob = state.seats[1]!;
    expect(bob.crypt[0]!.bloodCursed).toBe(true);
    expect(bob.crypt[0]!.nonUnique).toBe(true);
    expect(bob.crypt[1]!.sterile).toBe(true);
    expect(bob.crypt[2]!.titleCity).toBe("Cordoba");
    expect(bob.crypt[3]!.title).toBe("personal1");
    expect(bob.crypt[4]!.attached.some((p) => p.tags.includes("flight"))).toBe(true);
    // A future optional property must not automatically cross the boundary.
    Object.assign(bob.crypt[0]!, { futureSecret: "private trait" });

    const view = redactFor(state, "Alice");
    const alice = view.seats[0]!;
    const maskedBob = view.seats[1]!;
    expect(alice.uncontrolled[0]!.card.bloodCursed).toBe(true);
    expect(alice.uncontrolled[0]!.card.nonUnique).toBe(true);
    expect(alice.uncontrolled[1]!.card.sterile).toBe(true);
    expect(maskedBob.uncontrolled.map((u) => u.counters)).toEqual([1, 2, 3, 4, 5]);
    for (const card of [...alice.crypt, ...maskedBob.crypt, ...maskedBob.uncontrolled.map((u) => u.card)]) {
      expect(card.name).toBe("");
      expect(card.capacity).toBe(0);
      expect(card.title).toBeNull();
      expect(card.clan).toBeNull();
      expect(card.sect).toBeNull();
      expect(card.disciplines).toEqual({});
      expect(card.attached).toEqual([]);
      for (const field of ["bloodCursed", "nonUnique", "sterile", "path", "titleCity", "futureSecret"]) {
        expect(Object.prototype.hasOwnProperty.call(card, field), `${card.id} ${field}`).toBe(false);
      }
    }
  });
});
