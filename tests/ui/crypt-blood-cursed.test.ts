import { describe, expect, it } from "vitest";
import registry from "../../src/cards/registry.json";
import { VtesEngine, canCommitDiablerie } from "../../src/engine/index.ts";
import { hasStandaloneCryptTrait, importCryptCard } from "../../src/ui/cardinfo.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { runTrace, testRegistry } from "../engine/fixtures.ts";

// Independently reviewed standalone printed traits in the current registry.
const cursedIds = [200004, 200007, 200035, 200036, 200053, 200062, 200065, 200108, 200121, 200155, 200161, 200162, 200163, 200175, 200192, 200350, 200422, 200445, 200459, 200466, 200469, 200559, 200569, 200614, 200630, 200666, 200668, 200676, 200745, 200752, 200759, 200818, 200969, 201080, 201095, 201096, 201137, 201170, 201223, 201323, 201340, 201352, 201353, 201365, 201370, 201413, 201426, 201472, 201495, 201500];
const deck = (seat: string, id: number): SnapshotDeck => ({
  seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 0 }],
  crypt: [{ id }], library: [], pool: 20,
});
function game(alice = 200004, bob = 200132) {
  const state = buildGame({ decks: [deck("Alice", alice), deck("Bob", bob), deck("Carol", 201783)], seed: 1, maxTurns: 40 });
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("missing turn");
  turn.phase = "minion";
  return state;
}

describe("Blood Cursed", () => {
  it("imports standalone printed traits in every crypt zone, not mentions or a clan rule", () => {
    const crypt = Object.values(registry.entries).map((e) => e.card).filter((c) => c.kind === "crypt");
    expect(crypt.filter((c) => importCryptCard(c.id).bloodCursed).map((c) => c.id).sort((a, b) => a - b)).toEqual(cursedIds);
    for (const id of cursedIds) {
      const seat = game(id).seats[0]!;
      expect(seat.minions[0]!.bloodCursed, `${id} ready`).toBe(true);
      expect(seat.uncontrolled[0]!.card.bloodCursed, `${id} uncontrolled`).toBe(true);
      expect(seat.crypt[0]!.bloodCursed, `${id} crypt`).toBe(true);
    }
    expect(hasStandaloneCryptTrait("Independent: Blood cursed.", "blood cursed")).toBe(true);
    expect(hasStandaloneCryptTrait("Independent: Blood cursed vampires cannot act.", "blood cursed")).toBe(false);
    expect(hasStandaloneCryptTrait("Independent: Another vampire is blood cursed.", "blood cursed")).toBe(false);
    const ordinary = game(200132).seats[0]!.minions[0]!;
    ordinary.clan = "Banu Haqim"; // clan alone does not confer the curse
    expect(ordinary.bloodCursed).toBeUndefined();
    expect(canCommitDiablerie(ordinary)).toBe(true);
  });

  it.each([200004, 200007, 200053, 200062, 200121, 200161, 200192, 200422, 200445, 200469, 200569, 200752, 200818, 201080, 201096, 201323, 201340])("%i cannot take the ordinary diablerie action", (id) => {
    const state = game(id);
    const actor = state.seats[0]!.minions[0]!;
    const victim = state.seats[1]!.minions[0]!;
    Object.assign(victim, { inTorpor: true, blood: 2 });
    const ids = new VtesEngine(state, testRegistry).decision()!.options.map((o) => o.id);
    expect(ids).not.toContain(`diablerize:${actor.id}:${victim.id}`);
    expect(ids).toContain(`bleed:${actor.id}`);
  });

  it("preserves Enam's prince title and Parnassus's printed strength bonus", () => {
    const enam = game(200422).seats[0]!.minions[0]!;
    expect(enam.sect).toBe("camarilla");
    expect(enam.title).toBe("prince");
    expect(enam.titleCity).toBe("Cordoba");
    const parnassus = game(201096).seats[0]!.minions[0]!;
    expect(parnassus.sect).toBe("independent");
    expect(parnassus.attached.find((p) => p.card.id === parnassus.id)?.statics.strength).toBe(1);
  });

  it("blocks ordinary diablerie but leaves rescue and normal actions available", () => {
    const state = game();
    const actor = state.seats[0]!.minions[0]!;
    const victim = state.seats[1]!.minions[0]!;
    Object.assign(victim, { inTorpor: true, blood: 2 });
    const ids = () => new VtesEngine(state, testRegistry).decision()!.options.map((o) => o.id);
    expect(ids()).not.toContain(`diablerize:${actor.id}:${victim.id}`);
    expect(ids().some((id) => id.startsWith(`rescue:${actor.id}:${victim.id}:`))).toBe(true);
    expect(ids()).toContain(`bleed:${actor.id}`);
    actor.bloodCursed = false;
    expect(ids()).toContain(`diablerize:${actor.id}:${victim.id}`);
  });

  it.each(["Cloak of Blood", "Stealing Years"])("%s cannot be announced by a cursed vampire", (card) => {
    const state = game();
    const actor = state.seats[0]!.minions[0]!;
    Object.assign(actor, { capacity: 6, blood: 5, sect: "anarch" });
    Object.assign(state.seats[1]!.minions[0]!, { inTorpor: true, capacity: 8 });
    state.seats[0]!.hand.push({ id: "action", name: card });
    const ids = () => new VtesEngine(state, testRegistry).decision()!.options.map((o) => o.id);
    expect(ids().some((id) => id.startsWith(`play:${card}:`))).toBe(false);
    actor.bloodCursed = false;
    expect(ids().some((id) => id.startsWith(`play:${card}:`))).toBe(true);
  });

  it.each([true, false])("blocked leave-torpor: cursed blocker=%s", (cursed) => {
    const state = game(200132, cursed ? 200004 : 200067);
    const acting = state.seats[0]!.minions[0]!;
    const blocker = state.seats[1]!.minions[0]!;
    Object.assign(acting, { inTorpor: true, blood: 3 });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ["Alice", `leave:${acting.id}`],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", `block:${blocker.id}`],
    ]);
    engine.emit({ type: "InterceptModified", actionId: engine.action()!.actionId, minion: blocker.id, delta: 1, source: "test" });
    runTrace(engine, [["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    const dp = engine.decision()!;
    if (cursed) {
      expect(dp.window).not.toBe("diablerie.offer");
      expect(acting.inTorpor).toBe(true);
      expect(state.eventLog.some((e) => e.type === "ActionResolved" && e.success === false)).toBe(true);
      expect(state.eventLog.some((e) => e.type === "CombatBegan" || e.type === "DiablerieCommitted")).toBe(false);
    } else {
      expect(dp.window).toBe("diablerie.offer");
      expect(dp.options.map((o) => o.id)).toContain(`diablerize:offer:${blocker.id}:${acting.id}`);
    }
  });

  it("does not queue Cloak of Blood's diablerie riders if the curse appears during the action", () => {
    const state = game(200067, 200132);
    const actor = state.seats[0]!.minions[0]!;
    const victim = state.seats[1]!.minions[0]!;
    Object.assign(actor, { capacity: 6, blood: 5 });
    Object.assign(victim, { inTorpor: true, blood: 2, disciplines: { aus: "basic" } });
    state.seats[0]!.hand.push({ id: "cloak", name: "Cloak of Blood" });
    const engine = new VtesEngine(state, testRegistry);
    const option = engine.decision()!.options.find((o) => o.id.startsWith("play:Cloak of Blood:"));
    expect(option).toBeDefined();
    engine.choose(option!.id);
    actor.bloodCursed = true;
    for (let i = 0; i < 16; i++) {
      const dp = engine.decision();
      if (!dp || dp.window === "turn.minion") break;
      expect(dp.options.some((o) => o.id.includes("victimDiscipline"))).toBe(false);
      const pass = dp.options.find((o) => o.id === "pass");
      if (!pass) throw new Error(`unexpected window ${dp.window}`);
      engine.choose(pass.id);
    }
    expect(state.eventLog.some((e) => e.type === "DiablerieCommitted")).toBe(false);
    expect(actor.bloodHuntVoteRiders ?? []).toEqual([]);
    expect(state.seats[1]!.minions).toContain(victim);
  });

  it("rechecks the trait if it changes after a diablerie action is announced", () => {
    const state = game(200067, 200132);
    const actor = state.seats[0]!.minions[0]!;
    const victim = state.seats[1]!.minions[0]!;
    Object.assign(victim, { inTorpor: true, blood: 2 });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", `diablerize:${actor.id}:${victim.id}`]]);
    actor.bloodCursed = true; // simulate a change while the action is in flight
    runTrace(engine, [["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(state.eventLog.some((e) => e.type === "DiablerieCommitted")).toBe(false);
    expect(state.seats[1]!.minions).toContain(victim);
    expect(victim.blood).toBe(2);
  });
});
