import { describe, expect, it } from "vitest";
import registry from "../../src/cards/registry.json";
import { VtesEngine, prospectiveBleed, type MinionState } from "../../src/engine/index.ts";
import { hasStandaloneCryptTrait, importCryptCard } from "../../src/ui/cardinfo.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { testRegistry } from "../engine/fixtures.ts";

// Independently checked against the registry's standalone Sterile clauses.
const sterileIds = [
  200021, 200032, 200057, 200094, 200170, 200306, 200319, 200322, 200370, 200371,
  200404, 200487, 200497, 200505, 200585, 200607, 200628, 200652, 200688, 200697,
  200730, 200755, 200799, 200814, 200859, 200923, 200936, 201023, 201051, 201052,
  201094, 201105, 201220, 201285, 201330, 201359, 201378, 201389, 201453, 201459,
  201508, 201510,
];
const deck = (seat: string, id: number): SnapshotDeck => ({
  seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 0 }],
  crypt: [{ id }], library: [], pool: 20,
});
const game = (id: number) => buildGame({
  decks: [deck("Alice", id), deck("Bob", 200132), deck("Carol", 201783)], seed: 1, maxTurns: 40,
});

describe("printed sterile crypt trait", () => {
  it("parses standalone traits, not references to another minion or non-sterile", () => {
    for (const text of ["Sterile.", "Sabbat: Sterile.", "Sabbat: Ability. Sterile.\n[MERGED] Ability."])
      expect(hasStandaloneCryptTrait(text, "sterile")).toBe(true);
    for (const text of ["Requires a non-sterile vampire.", "A Gangrel becomes a sterile Ahrimane.", "Sabbat: Non-sterile.", "Sabbat: Sterile vampires get +1 bleed."])
      expect(hasStandaloneCryptTrait(text, "sterile")).toBe(false);
    expect(hasStandaloneCryptTrait("Sabbat: Non-unique.", "non-unique")).toBe(true);
    expect(hasStandaloneCryptTrait("Sabbat: Choose a non-unique minion.", "non-unique")).toBe(false);
  });

  it("imports all 42 cards and preserves the trait in every crypt zone", () => {
    const crypt = Object.values(registry.entries).map((e) => e.card).filter((c) => c.kind === "crypt");
    expect(crypt.filter((c) => importCryptCard(c.id).sterile).map((c) => c.id).sort((a, b) => a - b)).toEqual(sterileIds);
    for (const id of sterileIds) {
      const seat = game(id).seats[0]!;
      expect(seat.minions[0]!.sterile, `${id} ready`).toBe(true);
      expect(seat.uncontrolled[0]!.card.sterile, `${id} uncontrolled`).toBe(true);
      expect(seat.crypt[0]!.sterile, `${id} crypt`).toBe(true);
    }
    const ordinary = game(200067).seats[0]!;
    expect(ordinary.minions[0]!.sterile).toBeUndefined();
    expect(ordinary.uncontrolled[0]!.card.sterile).toBeUndefined();
    expect(ordinary.crypt[0]!.sterile).toBeUndefined();
  });

  it("The Siamese still has its printed bleed bonus", () => {
    const state = game(201285);
    const siamese = state.seats[0]!.minions[0]!;
    expect(siamese.sterile).toBe(true);
    expect(prospectiveBleed(state, siamese, "Bob")).toBe(2);
  });

  it.each<[string, Partial<MinionState>]>([
    ["The Embrace", {}],
    ["Third Tradition: Progeny", { title: "prince" }],
    ["Creation Rites", { title: "archbishop" }],
    ["Tumnimos", { clan: "Ravnos" }],
    ["Waters of Duat", { clan: "Ministry" }],
    ["Childe of the Revolution", { title: "baron" }],
  ])("%s permits a non-sterile vampire but not an imported sterile vampire", (card, overrides) => {
    function options(id: number): string[] {
      const state = game(id);
      const actor = state.seats[0]!.minions[0]!;
      Object.assign(actor, { capacity: 8, blood: 6, ...overrides });
      state.seats[0]!.hand.push({ id: "action", name: card });
      const turn = state.frames[0]!;
      if (turn.kind !== "turn") throw new Error("missing turn");
      turn.phase = "minion";
      return new VtesEngine(state, testRegistry).decision()!.options.map((o) => o.id);
    }
    expect(options(200067).some((o) => o.startsWith(`play:${card}:`))).toBe(true);
    const sterileOptions = options(200404);
    expect(sterileOptions.some((o) => o.startsWith(`play:${card}:`))).toBe(false);
    expect(sterileOptions).toContain("bleed:Alice-v0"); // not a general action ban
  });
});
