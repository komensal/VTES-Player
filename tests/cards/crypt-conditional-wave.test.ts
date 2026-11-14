import { describe, expect, it } from "vitest";
import type { ConditionalStatic, GameEvent, GameState, MinionState } from "../../src/engine/index.ts";
import { VtesEngine, conditionalStaticNoAction, currentBleed, currentIntercept, currentStealth, prospectiveBleed } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";
import fixture from "./fixtures/crypt-conditional-wave.json";

// Expectations were reviewed against the unmerged printed texts. They describe
// only the tested clauses, not a claim that every card is implemented fully.
const cases = fixture.flatMap((card) => card.conditions.map((condition) => ({
  id: card.id, name: card.name, condition: condition as ConditionalStatic,
})));
type Announcement = Extract<GameEvent, { type: "ActionAnnounced" }>;

function attach(m: MinionState, name: string) {
  const entry = testRegistry[name]?.cryptEntry?.();
  if (!entry) throw new Error(`missing crypt entry ${name}`);
  m.attached.push({ card: { id: m.id, name }, controller: m.controller, owner: m.controller,
    locked: false, usedThisPhase: false, statics: entry.statics, tags: entry.tags });
}
function passUntil(engine: VtesEngine, predicate: () => boolean) {
  for (let i = 0; i < 80 && !predicate(); i++) {
    const dp = engine.decision();
    if (!dp) break;
    const option = dp.options.find((o) => o.id === "pass") ?? dp.options[0];
    if (!option) break;
    runTrace(engine, [[dp.seat, option.id]]);
  }
  expect(predicate()).toBe(true);
}
function action(state: GameState): Announcement {
  const ev = state.eventLog.find((e) => e.type === "ActionAnnounced");
  if (!ev || ev.type !== "ActionAnnounced") throw new Error("no action");
  return ev;
}
function matching(m: MinionState, filter: NonNullable<ConditionalStatic["inCombatWith"]>, bearer: MinionState) {
  m.kind = filter.kind ?? "vampire";
  m.clan = filter.clan ?? filter.clans?.[0] ?? "Malkavian";
  m.sect = filter.sect ?? "sabbat";
  m.title = filter.titled ? "prince" : null;
  bearer.capacity = 6;
  m.capacity = filter.younger ? 5 : filter.older ? 7 : filter.maxCapacity ?? 6;
}
function mismatch(m: MinionState, f: NonNullable<ConditionalStatic["inCombatWith"]>, bearer: MinionState) {
  if (f.clan || f.clans) m.clan = "UNMATCHED";
  else if (f.sect) m.sect = f.sect === "sabbat" ? "camarilla" : "sabbat";
  else if (f.titled) m.title = null;
  else if (f.younger || f.older) m.capacity = bearer.capacity;
  else if (f.maxCapacity !== undefined) m.capacity = f.maxCapacity + 1;
  else if (f.kind) m.kind = f.kind === "vampire" ? "ally" : "vampire";
  else throw new Error("unsupported opponent filter");
}
function targetMatch(m: MinionState, f: NonNullable<ConditionalStatic["targetReady"]>["minion"]) {
  m.kind = f.kind ?? "vampire";
  m.clan = f.clans?.[0] ?? "UNMATCHED";
  m.sect = f.sect ?? (f.notSect === "sabbat" ? "camarilla" : "sabbat");
  m.title = f.titles?.[0] ?? (f.titled ? "prince" : null);
  m.capacity = f.minCapacity ?? 5;
  m.inTorpor = false;
  delete m.torporPending;
}

describe("104 crypt cards: conditional clauses in live derived values", () => {
  it.each(cases)("$id $name: applies on matching state and not on a nonmatching state", ({ name, condition: c }) => {
    const state = threeSeatGame();
    state.seats[1]!.minions = [state.seats[1]!.minions[0]!];
    const actor = state.seats[0]!.minions[0]!;
    const other = state.seats[1]!.minions[0]!;
    const field = c.bleed !== undefined ? "bleed" : c.stealth !== undefined ? "stealth" : c.intercept !== undefined ? "intercept" : "strength";
    const amount = c[field]!;
    const bearer = field === "intercept" ? other : actor;
    attach(bearer, name);
    // Use a legal real bleed to create the action and its announcement.
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", `bleed:${actor.id}`]]);
    const ann = action(state);
    const frame = state.frames.find((f) => f.kind === "action");
    if (!frame || frame.kind !== "action") throw new Error("no action frame");
    if (c.actionKinds) ann.actionKind = c.actionKinds[0]!;
    if (c.excludedActionKinds) ann.actionKind = "bleed";
    if (c.actionCardTypes) ann.cardTypes = [c.actionCardTypes[0]!];
    if (c.actionDirected !== undefined) { ann.directed = c.actionDirected; frame.directed = c.actionDirected; }
    if (c.actingMinion) matching(actor, c.actingMinion, bearer);
    if (c.readyNamedVampire) state.seats[2]!.minions.push(makeMinion("named", "Carol", { name: `${c.readyNamedVampire} (G4)` }));
    if (c.controller?.hasEdge) state.edge = bearer.controller;
    if (c.targetReady) {
      targetMatch(other, c.targetReady.minion);
      if (!c.targetReady.exists) other.inTorpor = true;
    }
    if (c.inCombatWith) {
      matching(other, c.inCombatWith, bearer);
      other.blood = 8;
      other.attached.push({ card: { id: "intercept", name: "test" }, locked: false, usedThisPhase: false, statics: { intercept: 10 }, tags: [] });
      passUntil(engine, () => engine.decision()?.options.some((o) => o.id === `block:${other.id}`) === true);
      runTrace(engine, [["Bob", `block:${other.id}`]]);
      passUntil(engine, () => state.frames.some((f) => f.kind === "combat"));
    }
    const read = () => field === "bleed" ? currentBleed(state, frame)
      : field === "stealth" ? currentStealth(state, ann.actionId)
      : field === "intercept" ? currentIntercept(state, ann.actionId, bearer.id)
      : conditionalStaticNoAction(state, bearer, "strength");
    const yes = read();
    if (c.targetReady) other.inTorpor = !other.inTorpor;
    else if (c.inCombatWith) mismatch(other, c.inCombatWith, bearer);
    else if (c.actingMinion) mismatch(actor, c.actingMinion, bearer);
    else if (c.readyNamedVampire) state.seats[2]!.minions.at(-1)!.inTorpor = true;
    else if (c.controller?.hasEdge) state.edge = "Carol";
    else if (c.actionKinds) ann.actionKind = c.actionKinds[0] === "hunt" ? "bleed" : "hunt";
    else if (c.excludedActionKinds) ann.actionKind = c.excludedActionKinds[0]!;
    else if (c.actionCardTypes) ann.cardTypes = ["action"];
    else if (c.actionDirected !== undefined) { ann.directed = !c.actionDirected; frame.directed = !c.actionDirected; }
    else throw new Error("no negative case");
    const no = read();
    expect(yes - no).toBe(amount);
  });
});

describe("target-dependent bonuses follow the actual target", () => {
  it("recomputes on a redirected bleed and counts locked vampires but not torpid ones", () => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    attach(actor, "Ganesh (G5)");
    const bob = state.seats[1]!.minions[0]!;
    bob.clan = "Giovanni"; bob.locked = true;
    const carol = state.seats[2]!.minions[0]!;
    carol.clan = "Giovanni"; carol.inTorpor = true;
    expect(prospectiveBleed(state, actor, "Bob")).toBe(2);
    expect(prospectiveBleed(state, actor, "Carol")).toBe(1);
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", "bleed:V1"]]);
    const frame = state.frames.find((f) => f.kind === "action");
    if (!frame || frame.kind !== "action") throw new Error("no action");
    expect(currentBleed(state, frame)).toBe(2);
    frame.target = "Carol";
    expect(currentBleed(state, frame)).toBe(1);
    carol.inTorpor = false;
    expect(currentBleed(state, frame)).toBe(2);
  });
  it("updates both bleed and stealth after an actual Deflection", () => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    attach(actor, "Phaedyme (G5)");
    attach(actor, "Gillespi Giovanni (G2)");
    const bob = state.seats[1]!.minions[0]!;
    bob.sect = "camarilla";
    state.seats[2]!.minions[0]!.sect = "sabbat";
    state.seats[1]!.hand = [{ id: "d1", name: "Deflection" }];
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", "bleed:V1"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    const frame = state.frames.find((f) => f.kind === "action");
    if (!frame || frame.kind !== "action") throw new Error("no action");
    expect(currentBleed(state, frame)).toBe(2);
    expect(currentStealth(state, frame.actionId)).toBe(1);
    runTrace(engine, [["Alice", "pass"], ["Bob", "play:Deflection:superior:W:Carol:d1"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(frame.target).toBe("Carol");
    expect(currentBleed(state, frame)).toBe(1);
    expect(currentStealth(state, frame.actionId)).toBe(0);
  });
  it("does not give absent-target bonuses on undirected actions", () => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    attach(actor, "Rain (G4)");
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", "hunt:V1"]]);
    // The built-in hunt itself is a +1 stealth action.
    expect(currentStealth(state, action(state).actionId)).toBe(1);
  });
  it("imports conditional statics in ready, uncontrolled, and crypt zones", () => {
    const deck = (seat: string, id: number): SnapshotDeck => ({ seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 0 }], crypt: [{ id }], library: [], pool: 20 });
    for (const { id } of fixture) {
      const state = buildGame({ decks: [deck("Alice", id), deck("Bob", 200067), deck("Carol", 200132)], seed: 1, maxTurns: 40 });
      const s = state.seats[0]!;
      for (const vampire of [s.minions[0]!, s.uncontrolled[0]!.card, s.crypt[0]!]) {
        const own = vampire.attached.find((p) => p.card.id === vampire.id);
        expect(own?.statics.conditional?.length, `${id}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("conditional combat strength reaches real hand-strike damage", () => {
  const combatCases = cases.filter(({ condition }) => condition.strength !== undefined && condition.inCombatWith);
  function hit(name: string, c: ConditionalStatic, applies: boolean): number {
    const state = threeSeatGame();
    state.seats[1]!.minions = [state.seats[1]!.minions[0]!];
    const actor = state.seats[0]!.minions[0]!;
    const defender = state.seats[1]!.minions[0]!;
    attach(actor, name);
    matching(defender, c.inCombatWith!, actor);
    if (!applies) mismatch(defender, c.inCombatWith!, actor);
    defender.blood = 8;
    defender.attached.push({ card: { id: "intercept", name: "test" }, locked: false, usedThisPhase: false, statics: { intercept: 10 }, tags: [] });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", `bleed:${actor.id}`]]);
    passUntil(engine, () => engine.decision()?.options.some((o) => o.id === `block:${defender.id}`) === true);
    runTrace(engine, [["Bob", `block:${defender.id}`]]);
    passUntil(engine, () => state.frames.some((f) => f.kind === "combat"));
    for (let i = 0; i < 80; i++) {
      const dp = engine.decision();
      if (!dp || state.eventLog.some((e) => e.type === "CombatEnded")) break;
      const pick = dp.options.find((o) => o.id === "strike:hand") ??
        dp.options.find((o) => o.id === "press:end") ?? dp.options.find((o) => o.id === "pass") ?? dp.options[0]!;
      runTrace(engine, [[dp.seat, pick.id]]);
    }
    const damage = state.eventLog.find((e) => e.type === "DamageInflicted" && e.source === actor.id && e.minion === defender.id);
    return damage?.type === "DamageInflicted" ? damage.amount : 0;
  }
  it.each(combatCases)("$id $name: matching and nonmatching opponents", ({ name, condition }) => {
    expect(hit(name, condition, false)).toBe(1);
    expect(hit(name, condition, true)).toBe(Math.max(0, 1 + condition.strength!));
  });
});

describe("wrong unconditional bonuses were removed, unrelated flat traits retained", () => {
  it.each(fixture.filter((card) => card.remove.length > 0))("$id $name no longer applies an unconditional bonus", ({ name, remove }) => {
    const entry = testRegistry[name]?.cryptEntry?.();
    expect(entry).toBeDefined();
    for (const field of remove) expect(entry!.statics[field as "bleed" | "strength" | "intercept" | "stealth"]).toBeUndefined();
  });
  it("keeps explicitly printed flat bleed and strength alongside conditionals", () => {
    for (const name of ["Cornelius Ottavio (G2)", "Queen Anne (G2)", "Adonai (G2)", "Vasantasena (G2)"]) {
      expect(testRegistry[name]!.cryptEntry!().statics.bleed).toBe(1);
    }
    for (const name of ["Brunhilde (G3)", "Phaedyme (G5)", "Dylan (G2 ADV)", "Ondine \"Boudicca\" Sinclair (G5)"]) {
      expect(testRegistry[name]!.cryptEntry!().statics.strength).toBe(1);
    }
  });
});

describe("real action types and dynamic capacity", () => {
  it.each([
    ["Joaquina Amaya (G2)", "Sport Bike", "equipment", 2],
    ["Nettie Hale (G2)", "Aggressive Corpse", "ally", 2],
    ["Natasha Volfchek (G1)", "Kine Resources Contested", "politicalAction", 2],
  ])("%s applies on an announced %s action", (name, card, type, expected) => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    actor.clan = "Hecata"; actor.blood = 5;
    attach(actor, name);
    state.seats[0]!.hand = [{ id: "card", name: card }];
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", `play:${card}`]]);
    passUntil(engine, () => state.eventLog.some((e) => e.type === "ActionAnnounced"));
    const ann = action(state);
    expect(ann.cardTypes).toContain(type);
    expect(currentStealth(state, ann.actionId)).toBe(expected);
  });
  it("uses derived, not printed, capacity for Zubeida and David Morgan", () => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    attach(actor, "Zubeida (G5)");
    const target = state.seats[1]!.minions[0]!;
    state.seats[1]!.minions = [target];
    target.capacity = 6;
    const capacityCard = { card: { id: "cap", name: "capacity" }, locked: false, usedThisPhase: false, statics: { capacityBonus: 1 }, tags: [] };
    expect(prospectiveBleed(state, actor, "Bob")).toBe(2);
    target.attached.push(capacityCard);
    expect(prospectiveBleed(state, actor, "Bob")).toBe(1);
    target.attached.pop();
    attach(target, "David Morgan, The Scourge (G3)");
    actor.capacity = 2;
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", "bleed:V1"]]);
    expect(currentIntercept(state, action(state).actionId, target.id)).toBe(1);
    actor.attached.push(capacityCard);
    expect(currentIntercept(state, action(state).actionId, target.id)).toBe(0);
  });
});

describe("board conditions remain live", () => {
  it("does not stack multiple qualifying vampires, ignores allies and rechecks torpor", () => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    attach(actor, "Ganesh (G5)");
    const target = state.seats[1]!;
    target.minions = [makeMinion("g1", "Bob", { clan: "Giovanni", locked: true }),
      makeMinion("g2", "Bob", { clan: "Giovanni" })];
    expect(prospectiveBleed(state, actor, "Bob")).toBe(2);
    target.minions[0]!.inTorpor = true;
    expect(prospectiveBleed(state, actor, "Bob")).toBe(2);
    target.minions[1]!.kind = "ally";
    expect(prospectiveBleed(state, actor, "Bob")).toBe(1);
    target.minions[0]!.inTorpor = false;
    expect(prospectiveBleed(state, actor, "Bob")).toBe(2);
  });
  it("checks both branches of a clan union without adding the bonus twice", () => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    attach(actor, "Martin Franckel (G3)");
    const target = state.seats[1]!;
    target.minions = [makeMinion("t", "Bob", { clan: "Tremere" })];
    expect(prospectiveBleed(state, actor, "Bob")).toBe(1);
    target.minions[0]!.clan = "Tremere antitribu";
    expect(prospectiveBleed(state, actor, "Bob")).toBe(1);
    target.minions[0]!.inTorpor = true;
    expect(prospectiveBleed(state, actor, "Bob")).toBe(0);
  });
});
