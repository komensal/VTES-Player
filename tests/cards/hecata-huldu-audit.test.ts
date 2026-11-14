import { describe, expect, it } from "vitest";
import { VtesEngine, prospectiveBleed } from "../../src/engine/index.ts";
import type { MinionState } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

const deck = (seat: string, id: number): SnapshotDeck => ({
  seat, ready: [{ id }], uncontrolled: [], crypt: [], library: [], pool: 20,
});
function imported(id: number): MinionState {
  const state = buildGame({ decks: [deck("Alice", id), deck("Bob", 200067), deck("Carol", 200132)], seed: 1, maxTurns: 40 });
  return state.seats[0]!.minions[0]!;
}
function inCombat(opts: { helperId?: number; helperBlood?: number; inTorpor?: boolean; locked?: boolean; ally?: boolean } = {}) {
  const state = threeSeatGame();
  const helper = imported(opts.helperId ?? 201757);
  Object.assign(helper, { blood: opts.helperBlood ?? 4, inTorpor: opts.inTorpor ?? false, locked: opts.locked ?? false });
  state.seats[0]!.minions.push(helper);
  const actor = state.seats[0]!.minions[0]!;
  if (opts.ally) Object.assign(actor, makeAlly(actor.id, "Alice", 6));
  Object.assign(actor, { blood: 6, strength: 0 });
  const foe = state.seats[1]!.minions.find((m) => m.id === "M")!;
  Object.assign(foe, { strength: 3, blood: 6 });
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "pass"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "strike:hand"], ["Bob", "strike:hand"],
  ]);
  const cf = state.frames.find((f) => f.kind === "combat");
  if (!cf || cf.kind !== "combat") throw new Error("no combat");
  expect(engine.decision()?.window).toBe("combat.damageResolution");
  return { state, engine, helper, actor, foe, cf };
}
function abilityId(helper: MinionState, name = "Huldu, The Desecrator (G6)") {
  return `ability:${name}:${helper.id}:preventOther`;
}

describe("Hecata: Huldu, The Desecrator (201757)", () => {
  it("imports Hecata, Sabbat, capacity, disciplines and +1 bleed", () => {
    const h = imported(201757);
    const state = threeSeatGame();
    state.seats[0]!.minions.push(h);
    expect(h).toMatchObject({ clan: "Hecata", sect: "sabbat", capacity: 8, disciplines: { aus: "superior", for: "superior", obl: "superior", obf: "basic", tha: "basic" } });
    expect(prospectiveBleed(state, h, "Bob")).toBe(2);
  });
  it.each([false, true])("a ready Huldu (locked=%s) pays 1 to prevent 1 and only once per combat", (locked) => {
    const a = inCombat({ locked });
    const id = abilityId(a.helper);
    const before = a.actor.blood;
    expect(a.engine.decision()!.options.map((o) => o.id)).toContain(id);
    a.engine.choose(id);
    expect(a.helper.blood).toBe(3);
    expect(a.cf.pendingDamage[0]).toMatchObject({ minion: "V1", amount: 2 });
    expect(a.cf.usedThisCombat).toContain(a.helper.id);
    expect(a.engine.decision()!.options.map((o) => o.id)).not.toContain(id);
    expect(a.state.eventLog.filter((e) => e.type === "DamagePrevented" && e.minion === "V1")).toHaveLength(1);
    a.engine.choose("pass");
    expect(a.actor.blood).toBe(before - 2);
  });
  it("can prevent damage to another controlled ally", () => {
    const a = inCombat({ ally: true });
    const id = abilityId(a.helper);
    expect(a.engine.decision()!.options.map((o) => o.id)).toContain(id);
    a.engine.choose(id);
    expect(a.cf.pendingDamage[0]?.amount).toBe(2);
    expect(a.helper.blood).toBe(3);
  });
  it("is unavailable from torpor and becomes available on being ready", () => {
    const a = inCombat({ inTorpor: true });
    const id = abilityId(a.helper);
    expect(a.engine.decision()!.options.map((o) => o.id)).not.toContain(id);
    a.helper.inTorpor = false;
    expect(a.engine.decision()!.options.map((o) => o.id)).toContain(id);
  });
  it("is unavailable while going to torpor", () => {
    const a = inCombat();
    a.helper.torporPending = { other: null, by: null, rushBy: null };
    expect(a.engine.decision()!.options.map((o) => o.id)).not.toContain(abilityId(a.helper));
  });
  it("is unavailable without a blood to pay", () => {
    const a = inCombat({ helperBlood: 0, locked: true });
    expect(a.engine.decision()!.options.map((o) => o.id)).not.toContain(abilityId(a.helper));
  });
  it("does not prevent damage to a minion controlled by someone else", () => {
    const a = inCombat();
    a.cf.pendingDamage[0]!.minion = a.foe.id;
    expect(a.engine.decision()!.options.map((o) => o.id)).not.toContain(abilityId(a.helper));
  });
  it("does not prevent damage to Huldu herself or a bystander", () => {
    const a = inCombat();
    a.cf.pendingDamage[0]!.minion = a.helper.id;
    expect(a.engine.decision()!.options.map((o) => o.id)).not.toContain(abilityId(a.helper));
    const other = makeMinion("bystander", "Alice");
    a.state.seats[0]!.minions.push(other);
    a.cf.pendingDamage[0]!.minion = other.id;
    expect(a.engine.decision()!.options.map((o) => o.id)).not.toContain(abilityId(a.helper));
  });
  it("can prevent aggravated damage", () => {
    const a = inCombat();
    a.cf.pendingDamage[0]!.aggravated = true;
    expect(a.engine.decision()!.options.map((o) => o.id)).toContain(abilityId(a.helper));
    a.engine.choose(abilityId(a.helper));
    expect(a.cf.pendingDamage[0]!.amount).toBe(2);
  });
  it("also recognizes the opposing combatant if controlled by Huldu's controller", () => {
    const a = inCombat();
    a.foe.controller = "Alice";
    a.cf.pendingDamage[0]!.minion = a.foe.id;
    expect(a.engine.decision()!.options.map((o) => o.id)).toContain(abilityId(a.helper));
    a.engine.choose(abilityId(a.helper));
    expect(a.cf.pendingDamage[0]!.amount).toBe(2);
  });
  it("does not impose Huldu's ready requirement on Opikun", () => {
    const a = inCombat({ helperId: 201680, inTorpor: true });
    const id = abilityId(a.helper, "Opikun (G7)");
    expect(a.engine.decision()!.options.map((o) => o.id)).toContain(id);
    a.engine.choose(id);
    expect(a.helper.blood).toBe(3);
    expect(a.cf.pendingDamage[0]!.amount).toBe(1);
  });
  it("preserves Opikun's vampire-only and non-aggravated restrictions", () => {
    const aggravated = inCombat({ helperId: 201680, inTorpor: true });
    aggravated.cf.pendingDamage[0]!.aggravated = true;
    expect(aggravated.engine.decision()!.options.map((o) => o.id)).not.toContain(abilityId(aggravated.helper, "Opikun (G7)"));
    const ally = inCombat({ helperId: 201680, ally: true });
    expect(ally.engine.decision()!.options.map((o) => o.id)).not.toContain(abilityId(ally.helper, "Opikun (G7)"));
  });
});
