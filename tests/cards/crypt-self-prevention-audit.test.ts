import { describe, expect, it } from "vitest";
import { VtesEngine, hasFlight, type CombatFrame, type GameState } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { testRegistry } from "../engine/fixtures.ts";

const cards = [
  { id: 200493, name: "Ganhuru (G4)", nonAggOnly: true },
  { id: 200847, name: "Lizette (G4)", nonAggOnly: false },
  { id: 201400, name: "Ublo-Satha (G2)", nonAggOnly: false },
  { id: 201477, name: "Xaviar (G3)", nonAggOnly: false },
] as const;

function frame(state: GameState): CombatFrame {
  const cf = state.frames.find((f) => f.kind === "combat");
  if (!cf || cf.kind !== "combat") throw new Error("no combat");
  return cf;
}
function until(engine: VtesEngine, predicate: () => boolean, limit = 80) {
  for (let i = 0; i < limit && !predicate(); i++) {
    const dp = engine.decision();
    if (predicate()) return;
    if (!dp) throw new Error("no decision");
    const choice = dp.options.find((o) => o.id === "pass") ?? dp.options.find((o) => o.id === "strike:hand");
    if (!choice) throw new Error(`unexpected window ${dp.window}: ${dp.options.map((o) => o.id).join(", ")}`);
    engine.choose(choice.id);
  }
  expect(predicate()).toBe(true);
}
function fight(id: number, aggravated: boolean) {
  const deck = (seat: string, card: number): SnapshotDeck => ({ seat, ready: [{ id: card }], crypt: [], uncontrolled: [], library: [], pool: 20 });
  const state = buildGame({ decks: [deck("Alice", 200067), deck("Bob", id), deck("Carol", 200132)], seed: 1, maxTurns: 40 });
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("no turn");
  turn.phase = "minion";
  turn.unlockDone = turn.edgeDone = turn.unlockAbilitiesDone = true;
  const attacker = state.seats[0]!.minions[0]!;
  const defender = state.seats[1]!.minions[0]!;
  Object.assign(attacker, { blood: 4, locked: false, strength: 2 });
  Object.assign(defender, { blood: 4, locked: false, strength: 0 });
  const engine = new VtesEngine(state, testRegistry);
  engine.choose(`bleed:${attacker.id}`);
  until(engine, () => engine.decision()?.options.some((o) => o.id === `block:${defender.id}`) === true);
  engine.choose(`block:${defender.id}`);
  until(engine, () => state.frames.some((f) => f.kind === "combat"));
  if (aggravated) frame(state).handStrikesAggravated.acting = true; // test the two damage types on the same strike path
  until(engine, () => {
    const cf = state.frames.find((f) => f.kind === "combat");
    return cf?.kind === "combat" && cf.step === "damageResolution" && cf.pendingDamage[0]?.minion === defender.id;
  });
  return { state, engine, defender };
}

describe("crypt self-prevention — other printed vampires", () => {
  it.each(cards)("$name imports its self entry in all crypt zones", ({ id }) => {
    const deck = (seat: string): SnapshotDeck => ({ seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 0 }], crypt: [{ id }], library: [], pool: 20 });
    const state = buildGame({ decks: [deck("Alice"), deck("Bob"), deck("Carol")], seed: 1, maxTurns: 40 });
    const seat = state.seats[0]!;
    for (const m of [seat.minions[0]!, seat.uncontrolled[0]!.card, seat.crypt[0]!]) {
      expect(m.attached.some((p) => p.card.id === m.id)).toBe(true);
      if (id === 201400) expect(hasFlight(m)).toBe(true);
      if (id === 201477) expect(m.title).toBe("personal2");
    }
  });
  it.each(cards)("$name prevents 1 normal damage once in combat", ({ id, name }) => {
    const { state, engine, defender } = fight(id, false);
    const option = `ability:${name}:${defender.id}:preventSelf`;
    expect(engine.decision()!.options.some((o) => o.id === option)).toBe(true);
    engine.choose(option);
    expect(frame(state).pendingDamage[0]?.amount).toBe(1);
    expect(frame(state).usedThisCombat).toContain(defender.id);
    expect(engine.decision()!.options.some((o) => o.id === option)).toBe(false);
  });
  it("Ganhuru cannot prevent aggravated damage treated as normal", () => {
    const { state, engine, defender } = fight(200493, true);
    const damage = frame(state).pendingDamage[0]!;
    damage.treatAsNormal = true;
    expect(engine.decision()!.options.some((o) => o.id === `ability:Ganhuru (G4):${defender.id}:preventSelf`)).toBe(false);
  });
  it.each(cards)("$name handles aggravated damage according to its text", ({ id, name, nonAggOnly }) => {
    const { state, engine, defender } = fight(id, true);
    expect(frame(state).pendingDamage[0]?.aggravated).toBe(true);
    const option = `ability:${name}:${defender.id}:preventSelf`;
    expect(engine.decision()!.options.some((o) => o.id === option)).toBe(!nonAggOnly);
    if (!nonAggOnly) {
      engine.choose(option);
      expect(state.eventLog.some((e) => e.type === "DamagePrevented" && e.minion === defender.id && e.amount === 1)).toBe(true);
    }
  });
});
