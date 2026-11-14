import { describe, expect, it } from "vitest";
import { VtesEngine, currentIntercept, currentStealth, prospectiveBleed } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { runTrace, testRegistry } from "../engine/fixtures.ts";

// Reviewed against the unmerged printed text: only unconditional self bonuses,
// plus the explicitly self-granted optional combat credits. Other clauses are
// intentionally outside this fixture. Imbued are excluded from this vampire test.
type Expected = { bleed?: number; strength?: number; stealth?: number; intercept?: number; pressPerCombat?: number; maneuverPerCombat?: number };
const cases: Array<[number, Expected]> = [
  [200011, { bleed: 2 }],
  [200014, { bleed: 1 }],
  [200016, { bleed: 1 }],
  [200030, { bleed: 1 }],
  [200049, { bleed: 2 }],
  [200060, { bleed: 1 }],
  [200063, { bleed: 1 }],
  [200069, { bleed: 1 }],
  [200079, { intercept: 1 }],
  [200111, { intercept: -1 }],
  [200135, { bleed: 2 }],
  [200155, { strength: 1 }],
  [200157, { strength: 1, bleed: 1 }],
  [200167, { bleed: 1 }],
  [200186, { stealth: -1 }],
  [200222, { bleed: 1 }],
  [200223, { strength: 1 }],
  [200227, { strength: 1 }],
  [200248, { intercept: 1 }],
  [200284, { strength: 1 }],
  [200291, { bleed: 1 }],
  [200294, { bleed: 1 }],
  [200307, { stealth: 1 }],
  [200337, { stealth: 1 }],
  [200372, { bleed: 1 }],
  [200385, { strength: 2 }],
  [200395, { strength: 1 }],
  [200424, { strength: 2 }],
  [200436, { bleed: 1 }],
  [200450, { bleed: 1 }],
  [200455, { bleed: 1, strength: 1, pressPerCombat: 1 }],
  [200467, { strength: -1 }],
  [200495, { strength: 1 }],
  [200550, { bleed: 1 }],
  [200568, { bleed: 1, strength: 2 }],
  [200573, { bleed: 2 }],
  [200611, { bleed: 1 }],
  [200648, { strength: 1 }],
  [200652, { strength: 1 }],
  [200655, { strength: 1 }],
  [200680, { bleed: 1 }],
  [200710, { strength: 1 }],
  [200724, { strength: 1 }],
  [200736, { strength: 1 }],
  [200754, { bleed: 1, strength: 1 }],
  [200781, { strength: 2 }],
  [200795, { intercept: 1 }],
  [200815, { bleed: 1 }],
  [200823, { strength: 2 }],
  [200826, { bleed: 2 }],
  [200856, { bleed: 2, intercept: 1 }],
  [200871, { bleed: 3 }],
  [200908, { bleed: 1 }],
  [200909, { bleed: 1 }],
  [200923, { strength: -1 }],
  [200942, { bleed: 1 }],
  [200950, { bleed: 1 }],
  [200956, { strength: 2 }],
  [200958, { strength: 2 }],
  [200975, { bleed: 1 }],
  [200986, { bleed: 1 }],
  [201006, { bleed: 1 }],
  [201023, { strength: 1 }],
  [201025, { intercept: -1 }],
  [201028, { bleed: 1 }],
  [201031, { bleed: 1 }],
  [201033, { strength: 1 }],
  [201083, { strength: 1 }],
  [201084, { bleed: 1 }],
  [201094, { strength: 1 }],
  [201118, { strength: 1 }],
  [201138, { strength: 2 }],
  [201139, { bleed: 1 }],
  [201148, { bleed: 1 }],
  [201151, { bleed: 2 }],
  [201204, { bleed: 1 }],
  [201248, { bleed: 1, strength: 1 }],
  [201324, { bleed: 1 }],
  [201327, { bleed: 1 }],
  [201384, { strength: 1 }],
  [201413, { bleed: 1 }],
  [201427, { bleed: 1 }],
  [201437, { bleed: 1 }],
  [201527, { stealth: -1 }],
  [200025, { pressPerCombat: 1 }],
  [200100, { pressPerCombat: 1 }],
  [200125, { pressPerCombat: 1 }],
  [200244, { pressPerCombat: 1 }],
  [201513, { pressPerCombat: 1 }],
  [200663, { pressPerCombat: 1 }],
  [200667, { pressPerCombat: 1 }],
  [200735, { pressPerCombat: 1 }],
  [200790, { pressPerCombat: 1 }],
  [200805, { pressPerCombat: 1 }],
  [200957, { pressPerCombat: 1 }],
  [201194, { pressPerCombat: 1 }],
  [201519, { pressPerCombat: 1 }],
  [201288, { pressPerCombat: 1 }],
  [201445, { pressPerCombat: 1 }],
  [200607, { maneuverPerCombat: 1 }],
  [201698, { maneuverPerCombat: 1 }],
  [200821, { maneuverPerCombat: 1 }],
  [201045, { maneuverPerCombat: 1 }],
  [201338, { maneuverPerCombat: 1 }],
];

const deck = (seat: string, id: number): SnapshotDeck => ({
  seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 0 }], crypt: [{ id }], library: [], pool: 20,
});
function game(id: number) {
  const state = buildGame({ decks: [deck("Alice", id), deck("Bob", 200067), deck("Carol", 200132)], seed: 1, maxTurns: 40 });
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("missing turn");
  turn.phase = "minion";
  return state;
}
function actionId(state: ReturnType<typeof game>): string {
  const e = state.eventLog.find((ev) => ev.type === "ActionAnnounced");
  if (!e || e.type !== "ActionAnnounced") throw new Error("missing action");
  return e.actionId;
}
function passUntil(engine: VtesEngine, predicate: () => boolean, max = 40) {
  for (let i = 0; i < max && !predicate(); i++) {
    const dp = engine.decision();
    if (!dp) break;
    const pass = dp.options.find((o) => o.id === "pass");
    if (!pass) throw new Error(`no pass at ${dp.window}: ${dp.options.map((o) => o.id)}`);
    runTrace(engine, [[dp.seat, pass.id]]);
  }
  expect(predicate()).toBe(true);
}

describe("printed crypt statics in a real game", () => {
  it.each(cases)("crypt %i: reported static and game values match the printed clause", (id, expected) => {
    const state = game(id);
    const actor = state.seats[0]!.minions[0]!;
    const entry = actor.attached.find((p) => p.card.id === actor.id)!;
    expect(entry, `${id} self entry`).toBeDefined();
    for (const [key, value] of Object.entries(expected)) {
      expect(entry.statics[key as keyof Expected], `${id}: ${key}`).toBe(value);
    }
    // Self-entries are also preserved in the uncontrolled region and crypt.
    for (const copy of [state.seats[0]!.uncontrolled[0]!.card, state.seats[0]!.crypt[0]!]) {
      const own = copy.attached.find((p) => p.card.id === copy.id)!;
      for (const [key, value] of Object.entries(expected)) expect(own.statics[key as keyof Expected], `${id} zone ${key}`).toBe(value);
    }
    // Isolate the flat clause: Cornelius also has a separate conditional
    // bonus when the target controls a ready non-Camarilla vampire.
    if (id === 200291) state.seats[1]!.minions[0]!.sect = "camarilla";
    if (expected.bleed !== undefined) expect(prospectiveBleed(state, actor, "Bob"), `${id} bleed`).toBe(1 + expected.bleed);
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", `bleed:${actor.id}`]]);
    const aid = actionId(state);
    if (expected.stealth !== undefined) expect(currentStealth(state, aid), `${id} stealth`).toBe(expected.stealth);
    if (expected.intercept !== undefined) expect(currentIntercept(state, aid, actor.id), `${id} intercept`).toBe(expected.intercept);
  });

  it("does not add printed bonuses to an unrelated vampire or count an existing bonus twice", () => {
    const state = game(200016); // Adrianne +1 bleed
    expect(prospectiveBleed(state, state.seats[0]!.minions[0]!, "Bob")).toBe(2);
    expect(prospectiveBleed(state, state.seats[1]!.minions[0]!, "Carol")).toBe(1);
    const both = game(200385); // Dracon already had +1 bleed, now +2 strength
    expect(prospectiveBleed(both, both.seats[0]!.minions[0]!, "Bob")).toBe(2);
  });
});

describe("printed strength in combat", () => {
  it.each(cases.filter(([, e]) => e.strength !== undefined))("crypt %i inflicts the corresponding hand-strike damage", (id, expected) => {
    const state = game(id);
    const actor = state.seats[0]!.minions[0]!;
    const blocker = state.seats[1]!.minions[0]!;
    blocker.blood = 10;
    blocker.capacity = 10;
    blocker.attached.push({ card: { id: "test-intercept", name: "test" }, locked: false, usedThisPhase: false, statics: { intercept: 10 }, tags: [] });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", `bleed:${actor.id}`]]);
    passUntil(engine, () => engine.decision()?.options.some((o) => o.id === `block:${blocker.id}`) === true);
    runTrace(engine, [["Bob", `block:${blocker.id}`]]);
    passUntil(engine, () => state.frames.some((f) => f.kind === "combat"));
    for (let i = 0; i < 50; i++) {
      if (state.eventLog.some((e) => e.type === "CombatEnded")) break;
      const dp = engine.decision();
      if (!dp) break;
      const pick = dp.options.find((o) => o.id === "strike:hand") ??
        dp.options.find((o) => o.id === "press:end") ??
        dp.options.find((o) => o.id === "pass") ?? dp.options[0]!;
      runTrace(engine, [[dp.seat, pick.id]]);
    }
    const hits = state.eventLog.filter((e) => e.type === "DamageInflicted" && e.source === actor.id && e.minion === blocker.id);
    const damage = hits.reduce((n, e) => n + (e.type === "DamageInflicted" ? e.amount : 0), 0);
    expect(damage, `${id} hand strike`).toBe(Math.max(0, 1 + expected.strength!));
  });
});

describe("printed optional combat credits", () => {
  it.each(cases.filter(([, e]) => e.pressPerCombat || e.maneuverPerCombat))("crypt %i receives its optional credit at combat start, not its opponent", (id, expected) => {
    const state = game(id);
    const actor = state.seats[0]!.minions[0]!;
    const blocker = state.seats[1]!.minions[0]!;
    blocker.attached.push({ card: { id: "test-intercept", name: "test" }, locked: false, usedThisPhase: false, statics: { intercept: 10 }, tags: [] });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", `bleed:${actor.id}`]]);
    passUntil(engine, () => engine.decision()?.options.some((o) => o.id === `block:${blocker.id}`) === true);
    runTrace(engine, [["Bob", `block:${blocker.id}`]]);
    passUntil(engine, () => state.frames.some((f) => f.kind === "combat"));
    const cf = state.frames.find((f) => f.kind === "combat");
    if (cf?.kind !== "combat") throw new Error("missing combat");
    if (expected.pressPerCombat) {
      expect(cf.pressesCombat.acting).toBe(1);
      expect(cf.pressesCombat.opposing).toBe(0);
    }
    if (expected.maneuverPerCombat) {
      expect(cf.maneuverCredits.acting).toBe(1);
      expect(cf.maneuverCredits.opposing).toBe(0);
    }
  });
  it.each([[200025, "press:continue"], [201338, "maneuver:credit"]] as const)("%i can spend, but need not spend, its once-per-combat credit", (id, credit) => {
    const state = game(id);
    const actor = state.seats[0]!.minions[0]!;
    const blocker = state.seats[1]!.minions[0]!;
    actor.capacity = actor.blood = 10;
    blocker.capacity = blocker.blood = 10;
    blocker.attached.push({ card: { id: "test-intercept", name: "test" }, locked: false, usedThisPhase: false, statics: { intercept: 10 }, tags: [] });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", `bleed:${actor.id}`]]);
    passUntil(engine, () => engine.decision()?.options.some((o) => o.id === `block:${blocker.id}`) === true);
    runTrace(engine, [["Bob", `block:${blocker.id}`]]);
    passUntil(engine, () => state.frames.some((f) => f.kind === "combat"));
    const cf = state.frames.find((f) => f.kind === "combat");
    if (cf?.kind !== "combat") throw new Error("missing combat");
    for (let i = 0; i < 50; i++) {
      const dp = engine.decision();
      if (!dp) break;
      if (dp.seat === "Alice" && dp.options.some((o) => o.id === credit)) break;
      const pick = dp.options.find((o) => o.id === "strike:hand") ?? dp.options.find((o) => o.id === "pass") ?? dp.options[0]!;
      runTrace(engine, [[dp.seat, pick.id]]);
    }
    const dp = engine.decision()!;
    expect(dp.seat).toBe("Alice");
    expect(dp.options.some((o) => o.id === credit)).toBe(true);
    expect(dp.options.some((o) => o.id === "pass" || o.id === "press:end")).toBe(true);
    runTrace(engine, [["Alice", credit]]);
    if (credit === "press:continue") expect(cf.pressesCombat.acting).toBe(0);
    else expect(cf.maneuverCredits.acting).toBe(0);
  });
});

describe("incorrect unconditional bonuses", () => {
  it("Fidus has +1 stealth only on undirected actions, and -1 strength", () => {
    const stealth = (action: "hunt" | "bleed") => {
      const state = game(200467);
      const actor = state.seats[0]!.minions[0]!;
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [["Alice", `${action}:${actor.id}`]]);
      return currentStealth(state, actionId(state));
    };
    expect(stealth("hunt")).toBe(2); // hunt starts at +1
    expect(stealth("bleed")).toBe(0);
  });
  it("Rurik's bonus follows Ludmijla's ready state, including another controller", () => {
    const state = game(201519);
    const actor = state.seats[0]!.minions[0]!;
    const ludmijla = game(200879).seats[0]!.minions[0]!;
    ludmijla.id = "ludmijla";
    ludmijla.controller = "Bob";
    state.seats[1]!.minions.push(ludmijla);
    const value = () => prospectiveBleed(state, actor, "Bob");
    expect(value()).toBe(2); // same table, not necessarily controlled by Rurik's controller
    ludmijla.locked = true;
    expect(value()).toBe(2);
    ludmijla.inTorpor = true;
    expect(value()).toBe(1);
    ludmijla.inTorpor = false;
    ludmijla.name = "Ludmijla Rakoczy (G5 ADV)";
    expect(value()).toBe(2);
    ludmijla.kind = "ally";
    expect(value()).toBe(1);
    ludmijla.kind = "vampire";
    ludmijla.name = "Ludmijla Rakoczy II (G5)";
    expect(value()).toBe(1);
  });
  it("Gabriel has no free strength and Jacob and Rurik have no free bleed", () => {
    const gabriel = game(201527).seats[0]!.minions[0]!;
    expect(gabriel.attached.reduce((n, p) => n + (p.statics.strength ?? 0), 0)).toBe(0);
    for (const id of [200663, 201519]) {
      const state = game(id);
      expect(prospectiveBleed(state, state.seats[0]!.minions[0]!, "Bob")).toBe(1);
    }
  });
});
