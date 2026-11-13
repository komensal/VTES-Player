import { describe, expect, it } from "vitest";
import registry from "../../src/cards/registry.json";
import { VtesEngine, redactFor, viewFor, type GameState, type PermanentInPlay } from "../../src/engine/index.ts";
import { HeuristicAgent } from "../../src/ai/heuristic.ts";
import { hasStandaloneCryptTrait, importCryptCard } from "../../src/ui/cardinfo.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { makeAlly, makeMinion, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

// Reviewed against unmerged printed text, not inferred from clan.
const ids = [200037, 200038, 200057, 200119, 200145, 200206, 200443, 200618, 200728, 200751, 200793, 200824, 200859, 200891, 200961, 200963, 200988, 200995, 201016, 201031, 201044, 201067, 201070, 201094, 201132, 201153, 201248, 201263, 201266, 201274, 201331, 201433, 201484, 201510];
const deck = (seat: string, id: number): SnapshotDeck => ({
  seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 2 }],
  crypt: [{ id }], library: [], pool: 20,
});
function fixture(): GameState {
  const state = threeSeatGame();
  const imported = buildGame({ decks: [deck("Alice", 201248), deck("Bob", 200132)], seed: 1, maxTurns: 40 });
  const card = imported.seats[0]!.uncontrolled[0]!.card;
  state.seats[0]!.uncontrolled = [{ card, counters: card.capacity }];
  state.seats[0]!.library = [{ id: "lib", name: "Blood Doll" }];
  const tf = state.frames[0]!;
  if (tf.kind !== "turn") throw new Error("missing turn");
  tf.phase = "influence";
  tf.transfersLeft = 0;
  return state;
}
function inPlay(id: string, name: string, over: Partial<PermanentInPlay> = {}): PermanentInPlay {
  const h = testRegistry[name]!;
  return { card: { id, name }, controller: "Alice", locked: false, usedThisPhase: false,
    statics: { ...(h.permanentStatics ?? {}) }, tags: [...(h.permanentTags ?? [])], ...over };
}
const optionId = (state: GameState) => `inf:out:${state.seats[0]!.uncontrolled[0]!.card.id}`;
const idsOf = (engine: VtesEngine) => engine.decision()!.options.map((o) => o.id);

describe("printed Scarce", () => {
  it("imports exactly 34 reviewed cards in all crypt zones without revealing hidden traits", () => {
    const crypt = Object.values(registry.entries).map((e) => e.card).filter((c) => c.kind === "crypt");
    expect(crypt.filter((c) => importCryptCard(c.id).scarce).map((c) => c.id).sort((a, b) => a - b)).toEqual(ids);
    for (const id of ids) {
      const state = buildGame({ decks: [deck("Alice", id), deck("Bob", 200132)], seed: 1, maxTurns: 40 });
      expect(state.seats[0]!.minions[0]!.scarce, `${id} ready`).toBe(true);
      expect(state.seats[0]!.uncontrolled[0]!.card.scarce, `${id} uncontrolled`).toBe(true);
      expect(state.seats[0]!.crypt[0]!.scarce, `${id} crypt`).toBe(true);
    }
    expect(hasStandaloneCryptTrait("Independent: Scarce.", "scarce")).toBe(true);
    expect(hasStandaloneCryptTrait("Independent: Choose a scarce vampire.", "scarce")).toBe(false);
    expect(hasStandaloneCryptTrait("Independent: Non-scarce.", "scarce")).toBe(false);
    expect(importCryptCard(200132).scarce).toBe(false);
    const red = redactFor(buildGame({ decks: [deck("Alice", 201248), deck("Bob", 200037)], seed: 1, maxTurns: 40 }), "Alice");
    expect(red.seats[1]!.minions[0]!.scarce).toBe(true);
    expect(red.seats[1]!.uncontrolled[0]!.card.scarce).toBeUndefined();
    expect(red.seats[0]!.crypt[0]!.scarce).toBeUndefined();
  });

  it("burns 3 per controlled same-clan vampire, including torpor and non-scarce, but not allies or opponents", () => {
    const state = fixture();
    const seat = state.seats[0]!;
    const card = seat.uncontrolled[0]!.card;
    seat.minions.push(makeMinion("same", "Alice", { clan: card.clan, scarce: false }));
    seat.minions.push(makeMinion("torpor", "Alice", { clan: card.clan, inTorpor: true }));
    seat.minions.push(makeMinion("other", "Alice", { clan: "Brujah" }));
    seat.minions.push(makeAlly("ally", "Alice", 3, { clan: card.clan }));
    state.seats[1]!.minions.push(makeMinion("opponent", "Bob", { clan: card.clan }));
    seat.contested = [{ card: { id: "contested", name: "contested" }, minion: makeMinion("contested", "Alice", { clan: card.clan }) }];
    const engine = new VtesEngine(state, testRegistry);
    const option = engine.decision()!.options.find((o) => o.id === optionId(state))!;
    expect(option).toMatchObject({ kind: "influenceOut", poolBurn: 6 });
    expect(option.label).toContain("6 pool");
    engine.choose(option.id);
    expect(seat.pool).toBe(4);
    expect(seat.minions).toContain(card);
    expect(card.blood).toBe(card.capacity);
    const events = state.eventLog.filter((e) => e.type === "VampireEnteredPlay" || e.type === "PoolBurned");
    expect(events).toEqual([{ type: "VampireEnteredPlay", seat: "Alice", minion: card.id, blood: card.capacity }, { type: "PoolBurned", seat: "Alice", amount: 6 }]);
  });

  it("does not charge ordinary vampires or scarce vampires with no same-clan controller", () => {
    for (const scarce of [true, false]) {
      const state = fixture();
      const seat = state.seats[0]!;
      const card = seat.uncontrolled[0]!.card;
      card.scarce = scarce;
      if (!scarce) seat.minions.push(makeMinion("same", "Alice", { clan: card.clan }));
      state.seats[1]!.minions.push(makeMinion("other", "Bob", { clan: card.clan }));
      const engine = new VtesEngine(state, testRegistry);
      engine.choose(optionId(state));
      expect(seat.pool).toBe(10);
      expect(seat.minions).toContain(card);
      expect(state.eventLog.some((e) => e.type === "PoolBurned")).toBe(false);
    }
  });

  it("pays the penalty before a newly influenced vampire is contested", () => {
    const state = fixture();
    const card = state.seats[0]!.uncontrolled[0]!.card;
    state.seats[0]!.minions.push(makeMinion("same", "Alice", { clan: card.clan }));
    state.seats[1]!.minions.push({ ...card, id: "opponent-copy", controller: "Bob", owner: "Bob" });
    const engine = new VtesEngine(state, testRegistry);
    engine.choose(optionId(state));
    expect(state.seats[0]!.pool).toBe(7);
    expect(state.seats[0]!.contested?.some((c) => c.minion?.id === card.id)).toBe(true);
    const penalty = state.eventLog.findIndex((e) => e.type === "PoolBurned" && e.seat === "Alice");
    const contest = state.eventLog.findIndex((e) => e.type === "ContestBegan");
    expect(penalty).toBeGreaterThanOrEqual(0);
    expect(contest).toBeGreaterThan(penalty);
  });

  it("applies the penalty independently to successive moves", () => {
    const state = fixture();
    const seat = state.seats[0]!;
    const first = seat.uncontrolled[0]!.card;
    const second = makeMinion("second", "Alice", { clan: first.clan, scarce: true, capacity: 3 });
    seat.uncontrolled.push({ card: second, counters: 3 });
    const engine = new VtesEngine(state, testRegistry);
    engine.choose(optionId(state));
    expect(seat.pool).toBe(10);
    engine.choose("inf:out:second");
    expect(seat.pool).toBe(7);
  });

  it("stacks with Masquerade Enforcement and exposes the resulting pool burn", () => {
    const state = fixture();
    const seat = state.seats[0]!;
    const card = seat.uncontrolled[0]!.card;
    seat.minions.push(makeMinion("same", "Alice", { clan: card.clan }));
    state.seats[1]!.permanents.push(inPlay("enforcement", "Masquerade Enforcement", { controller: "Bob" }));
    const engine = new VtesEngine(state, testRegistry);
    const option = engine.decision()!.options.find((o) => o.id === optionId(state))!;
    expect(option).toMatchObject({ kind: "influenceOut", poolBurn: 4 });
    engine.choose(option.id);
    expect(seat.pool).toBe(6);
  });

  it("allows a lethal penalty, but the heuristic does not choose it", () => {
    const state = fixture();
    const seat = state.seats[0]!;
    const card = seat.uncontrolled[0]!.card;
    seat.pool = 2;
    seat.minions.push(makeMinion("same", "Alice", { clan: card.clan }));
    const engine = new VtesEngine(state, testRegistry);
    const dp = engine.decision()!;
    const option = dp.options.find((o) => o.id === optionId(state))!;
    expect(option).toMatchObject({ kind: "influenceOut", poolBurn: 3 });
    const bot = new HeuristicAgent();
    expect(bot.score(option, dp, viewFor(state, "Alice"))).toBeLessThan(bot.score(dp.options.find((o) => o.id === "pass")!, dp, viewFor(state, "Alice")));
    engine.choose(option.id);
    expect(seat.ousted).toBe(true);
    expect(state.eventLog).toContainEqual({ type: "PoolBurned", seat: "Alice", amount: 2 });
  });

  it("charges Gather during influence, but not moves outside that controller's influence phase", () => {
    const state = fixture();
    const card = state.seats[0]!.uncontrolled[0]!.card;
    state.seats[0]!.minions.push(makeMinion("same", "Alice", { clan: card.clan }));
    state.seats[0]!.permanents.push(inPlay("g", "Gather", { linkedUncontrolled: card.id }));
    const engine = new VtesEngine(state, testRegistry);
    expect(idsOf(engine)).toContain(`ability:Gather:g:graduate:${card.id}`);
    engine.choose(`ability:Gather:g:graduate:${card.id}`);
    expect(state.seats[0]!.pool).toBe(7);

    const outside = fixture();
    const second = outside.seats[0]!.uncontrolled[0]!.card;
    outside.seats[0]!.minions.push(makeMinion("same", "Alice", { clan: second.clan }));
    const tf = outside.frames[0]!;
    if (tf.kind !== "turn") throw new Error("no turn");
    tf.phase = "minion";
    new VtesEngine(outside, testRegistry).moveUncontrolledToReady("Alice", second.id);
    expect(outside.seats[0]!.pool).toBe(10);
  });

  it.each(["Gather", "Tomb of Rameses III"])("reports lethal %s graduation so the heuristic can decline it", (name) => {
    const state = fixture();
    const seat = state.seats[0]!;
    const card = seat.uncontrolled[0]!.card;
    seat.pool = 2;
    seat.minions.push(makeMinion("same", "Alice", { clan: card.clan }));
    seat.permanents.push(inPlay("source", name, { linkedUncontrolled: card.id, counters: 0 }));
    const engine = new VtesEngine(state, testRegistry);
    if (name !== "Gather") engine.choose("pass");
    const dp = engine.decision()!;
    const option = dp.options.find((o) => o.id.includes(name === "Gather" ? ":graduate:" : ":graduateAtEnd:yes"))!;
    expect(option).toBeDefined();
    expect(option).toHaveProperty("params.poolBurn", "3");
    const bot = new HeuristicAgent();
    expect(bot.score(option, dp, viewFor(state, "Alice"))).toBeLessThan(bot.score(dp.options.find((o) => o.id === "pass")!, dp, viewFor(state, "Alice")));
  });

  it("charges Tomb of Rameses III at the end of influence even though its choice frame advances the phase", () => {
    const state = fixture();
    const card = state.seats[0]!.uncontrolled[0]!.card;
    state.seats[0]!.minions.push(makeMinion("same", "Alice", { clan: card.clan }));
    state.seats[0]!.permanents.push(inPlay("tomb", "Tomb of Rameses III", { linkedUncontrolled: card.id, counters: 0 }));
    const engine = new VtesEngine(state, testRegistry);
    engine.choose("pass");
    expect(idsOf(engine)).toContain("choice:Tomb of Rameses III:tomb:graduateAtEnd:yes");
    engine.choose("choice:Tomb of Rameses III:tomb:graduateAtEnd:yes");
    expect(state.seats[0]!.pool).toBe(7);
    expect(state.seats[0]!.minions).toContain(card);
  });
});
