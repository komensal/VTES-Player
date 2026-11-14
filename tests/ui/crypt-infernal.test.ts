import { describe, expect, it } from "vitest";
import registry from "../../src/cards/registry.json";
import { VtesEngine, redactFor, viewFor } from "../../src/engine/index.ts";
import { HeuristicAgent } from "../../src/ai/heuristic.ts";
import { hasStandaloneCryptTrait, importCryptCard } from "../../src/ui/cardinfo.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { makeAlly, makeMinion, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

// Independently checked against printed crypt text, excluding [MERGED].
const ids = [200104, 200136, 200154, 200166, 200305, 200395, 200409, 200520, 200587, 200597, 200605, 200611, 200948, 200964, 200985, 201048, 201049, 201112, 201113, 201240, 201411, 201421, 201422, 201480];
const deck = (seat: string, id: number): SnapshotDeck => ({
  seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 2 }],
  crypt: [{ id }], library: [], pool: 20,
});
function setup() {
  const state = threeSeatGame();
  const imported = buildGame({ decks: [deck("Alice", 200104), deck("Bob", 200136), deck("Carol", 200132)], seed: 1, maxTurns: 40 });
  state.seats[0]!.minions = [imported.seats[0]!.minions[0]!, makeMinion("ordinary", "Alice", { locked: true })];
  state.seats[1]!.minions = [imported.seats[1]!.minions[0]!];
  const actor = state.seats[0]!.minions[0]!;
  actor.locked = true;
  state.seats[1]!.minions[0]!.locked = true;
  state.seats[0]!.library = [{ id: "lib", name: "Blood Doll" }];
  const tf = state.frames[0]!;
  if (tf.kind !== "turn") throw new Error("missing turn");
  Object.assign(tf, { phase: "unlock", unlockDone: false, edgeDone: false, unlockAbilitiesDone: false, unlockOthersDone: [] });
  return state;
}
const opt = (id: string) => `infernal:unlock:${id}`;

describe("printed Infernal", () => {
  it("imports exactly the independently reviewed 24 cards in every crypt zone", () => {
    const crypt = Object.values(registry.entries).map((e) => e.card).filter((c) => c.kind === "crypt");
    expect(crypt.filter((c) => importCryptCard(c.id).infernal).map((c) => c.id).sort((a, b) => a - b)).toEqual(ids);
    for (const id of ids) {
      const state = buildGame({ decks: [deck("Alice", id), deck("Bob", 200132)], seed: 1, maxTurns: 40 });
      const alice = state.seats[0]!;
      expect(alice.minions[0]!.infernal, `${id} ready`).toBe(true);
      expect(alice.uncontrolled[0]!.card.infernal, `${id} uncontrolled`).toBe(true);
      expect(alice.crypt[0]!.infernal, `${id} crypt`).toBe(true);
    }
    for (const text of ["Independent: Infernal vampires get +1 bleed.", "Independent: Another vampire becomes infernal.", "Independent: Non-infernal."]) {
      expect(hasStandaloneCryptTrait(text, "infernal")).toBe(false);
    }
    expect(hasStandaloneCryptTrait("Independent: Infernal.", "infernal")).toBe(true);
    expect(importCryptCard(200132).infernal).toBe(false);
    const redacted = redactFor(buildGame({ decks: [deck("Alice", 200104), deck("Bob", 200136)], seed: 1, maxTurns: 40 }), "Alice");
    expect(redacted.seats[1]!.minions[0]!.infernal).toBe(true);
    expect(redacted.seats[1]!.uncontrolled[0]!.card.infernal).toBeUndefined();
    expect(redacted.seats[0]!.crypt[0]!.infernal).toBeUndefined();
  });

  it("skips only infernal minions in the normal sweep; declining spends nothing", () => {
    const state = setup();
    const engine = new VtesEngine(state, testRegistry);
    const dp = engine.decision()!;
    const actor = state.seats[0]!.minions[0]!;
    expect(dp.window).toBe("turn.unlock");
    expect(dp.options.map((o) => o.id)).toContain(opt(actor.id));
    expect(state.seats[0]!.minions[1]!.locked).toBe(false);
    expect(actor.locked).toBe(true);
    expect(state.seats[1]!.minions[0]!.locked).toBe(true);
    const pool = state.seats[0]!.pool;
    engine.choose("pass");
    expect(actor.locked).toBe(true);
    expect(state.seats[0]!.pool).toBe(pool);
  });

  it("pays per minion in chosen order and respects already-unlocked and torpor minions", () => {
    const state = setup();
    const seat = state.seats[0]!;
    const a = seat.minions[0]!;
    const b = makeMinion("torpor", "Alice", { infernal: true, inTorpor: true, locked: true });
    const c = makeAlly("ally", "Alice", 3, { infernal: true, locked: true });
    const d = makeMinion("unlocked", "Alice", { infernal: true, locked: false });
    seat.minions.push(b, c, d);
    const engine = new VtesEngine(state, testRegistry);
    const ids = () => engine.decision()!.options.map((o) => o.id);
    expect(ids()).toEqual(expect.arrayContaining([opt(a.id), opt(b.id), opt(c.id)]));
    expect(ids()).not.toContain(opt(d.id));
    engine.choose(opt(c.id));
    expect(c.locked).toBe(false);
    expect(seat.pool).toBe(9);
    engine.choose(opt(b.id));
    expect(b.locked).toBe(false);
    expect(b.inTorpor).toBe(true);
    engine.choose(opt(a.id));
    expect(a.locked).toBe(false);
    expect(seat.pool).toBe(7);
    expect(state.eventLog.filter((e) => e.type === "PoolBurned" && e.seat === "Alice")).toHaveLength(3);
  });

  it("tracks the choice per minion across serialization and resets it for a later turn", () => {
    const state = setup();
    state.edge = "Alice"; // keep a decision open after the first unlock
    const actor = state.seats[0]!.minions[0]!;
    const engine = new VtesEngine(state, testRegistry);
    engine.decision();
    engine.choose(opt(actor.id));
    actor.locked = true; // some other effect locks it again in this phase
    const saved = JSON.parse(JSON.stringify(state)) as typeof state;
    const resumed = new VtesEngine(saved, testRegistry);
    expect(resumed.decision()!.options.map((o) => o.id)).not.toContain(opt(actor.id));
    const turn = saved.frames[0]!;
    if (turn.kind !== "turn") throw new Error("missing turn");
    // New turn frames have their own latch.
    delete turn.infernalUnlockUsed;
    Object.assign(turn, { phase: "unlock", unlockDone: false, edgeDone: false, unlockAbilitiesDone: false, unlockOthersDone: [] });
    expect(resumed.decision()!.options.map((o) => o.id)).toContain(opt(actor.id));
  });

  it("other normal-unlock suppression does not forbid the paid infernal unlock", () => {
    const state = setup();
    const a = state.seats[0]!.minions[0]!;
    a.skipNextUnlock = true;
    a.counters = { stun: 1 };
    const engine = new VtesEngine(state, testRegistry);
    expect(engine.decision()!.options.map((o) => o.id)).toContain(opt(a.id));
    expect(a.counters.stun).toBe(0);
    engine.choose(opt(a.id));
    expect(a.locked).toBe(false);
    expect(a.skipNextUnlock).toBe(false);
  });

  it("pays the additional clan blood surcharge or offers no unlock when unable", () => {
    const state = setup();
    const actor = state.seats[0]!.minions[0]!;
    actor.clan = "Nosferatu";
    actor.blood = 0;
    state.seats[1]!.permanents.push({ card: { id: "w", name: "Whispers of the Nictuku" }, locked: false, usedThisPhase: false, statics: { clanUnlockSurcharge: { clan: "Nosferatu", blood: 1 } }, tags: [] });
    const engine = new VtesEngine(state, testRegistry);
    // Keep the unlock decision open through the Edge even when unaffordable.
    state.edge = "Alice";
    expect(engine.decision()!.options.map((o) => o.id)).not.toContain(opt(actor.id));
    actor.blood = 2;
    expect(engine.decision()!.options.map((o) => o.id)).toContain(opt(actor.id));
    engine.choose(opt(actor.id));
    expect(actor.blood).toBe(1);
    expect(actor.locked).toBe(false);
    expect(state.seats[0]!.pool).toBe(9);
  });

  it("permits paying the last pool but the heuristic avoids self-ousting", () => {
    const state = setup();
    const actor = state.seats[0]!.minions[0]!;
    state.seats[0]!.pool = 1;
    const engine = new VtesEngine(state, testRegistry);
    const dp = engine.decision()!;
    const option = dp.options.find((o) => o.id === opt(actor.id))!;
    expect(option).toBeDefined();
    const bot = new HeuristicAgent();
    expect(bot.score(option, dp, viewFor(state, "Alice"))).toBeLessThan(bot.score(dp.options.find((o) => o.id === "pass")!, dp, viewFor(state, "Alice")));
    engine.choose(option.id);
    expect(state.eventLog.some((e) => e.type === "PoolBurned" && e.seat === "Alice")).toBe(true);
    expect(state.seats[0]!.ousted).toBe(true);
  });
});
