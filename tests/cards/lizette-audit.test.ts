import { describe, expect, it } from "vitest";
import { VtesEngine, currentBleed, type GameState } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { testRegistry } from "../engine/fixtures.ts";

function table() {
  const deck = (seat: string, id: number): SnapshotDeck => ({ seat, ready: [{ id }], crypt: [], uncontrolled: [], library: [], pool: 20 });
  const state = buildGame({ decks: [deck("Alice", 200847), deck("Bob", 200067), deck("Carol", 200132)], seed: 1, maxTurns: 40 });
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("no turn");
  turn.phase = "minion";
  turn.unlockDone = turn.edgeDone = turn.unlockAbilitiesDone = true;
  const lizette = state.seats[0]!.minions[0]!;
  lizette.blood = 5;
  lizette.locked = false;
  const engine = new VtesEngine(state, testRegistry);
  return { state, engine, lizette };
}
function action(state: GameState) {
  const af = state.frames.find((f) => f.kind === "action");
  if (!af || af.kind !== "action") throw new Error("no action");
  return af;
}
function until(engine: VtesEngine, predicate: () => boolean, limit = 80) {
  for (let i = 0; i < limit && !predicate(); i++) {
    const dp = engine.decision();
    if (predicate()) return;
    if (!dp) throw new Error("no decision");
    const choice = dp.options.find((o) => o.id === "pass") ?? dp.options.find((o) => o.id === "strike:hand");
    if (!choice) throw new Error(`unexpected window ${dp.window}`);
    engine.choose(choice.id);
  }
  expect(predicate()).toBe(true);
}

describe("Lizette — paid bleed", () => {
  it("burns one blood for +1 bleed, once, and the actual bleed costs prey two pool", () => {
    const { state, engine, lizette } = table();
    engine.choose(`bleed:${lizette.id}`);
    const ability = `ability:Lizette (G4):${lizette.id}:bleedForBlood`;
    until(engine, () => engine.decision()?.options.some((o) => o.id === ability) === true);
    expect(currentBleed(state, action(state))).toBe(1);
    engine.choose(ability);
    expect(lizette.blood).toBe(4);
    expect(currentBleed(state, action(state))).toBe(2);
    expect(engine.decision()!.options.some((o) => o.id === ability)).toBe(false);
    until(engine, () => !state.frames.some((f) => f.kind === "action"));
    expect(state.seats[1]!.pool).toBe(18);
  });

  it.each(["ability-first", "modifier-first"] as const)("stacks with a limited action modifier: %s", (order) => {
    const { state, engine, lizette } = table();
    state.seats[0]!.hand.push({ id: "fata", name: "Fata Morgana" });
    engine.choose(`bleed:${lizette.id}`);
    const ability = `ability:Lizette (G4):${lizette.id}:bleedForBlood`;
    const playModifier = () => {
      until(engine, () => engine.decision()?.options.some((o) => o.id.startsWith("play:Fata Morgana:superior") && o.id.includes(":bleed")) === true);
      const opt = engine.decision()!.options.find((o) => o.id.startsWith("play:Fata Morgana:superior") && o.id.includes(":bleed"))!;
      engine.choose(opt.id);
      until(engine, () => state.eventLog.some((e) => e.type === "BleedAmountModified" && e.source === "Fata Morgana"));
    };
    const playAbility = () => {
      until(engine, () => engine.decision()?.options.some((o) => o.id === ability) === true);
      engine.choose(ability);
    };
    if (order === "ability-first") { playAbility(); playModifier(); }
    else { playModifier(); playAbility(); }
    expect(currentBleed(state, action(state))).toBe(3);
    expect(lizette.blood).toBe(3);
  });

  it("follows Lizette's controller after she changes sides", () => {
    const { state, engine, lizette } = table();
    engine.changeMinionControl(lizette.id, "Bob");
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("no turn");
    turn.seat = "Bob"; // isolate a later turn under the new controller
    engine.choose(`bleed:${lizette.id}`);
    const ability = `ability:Lizette (G4):${lizette.id}:bleedForBlood`;
    until(engine, () => engine.decision()?.options.some((o) => o.id === ability) === true);
    expect(engine.decision()!.seat).toBe("Bob");
    engine.choose(ability);
    expect(lizette.blood).toBe(4);
    expect(currentBleed(state, action(state))).toBe(2);
  });

  it("does not offer the ability when Lizette can no longer pay", () => {
    const { engine, lizette } = table();
    engine.choose(`bleed:${lizette.id}`);
    engine.emit({ type: "BloodBurned", minion: lizette.id, amount: 5 }); // stand-in for another effect during the action
    const dp = engine.decision()!;
    expect(dp.seat).toBe("Alice");
    expect(dp.options.some((o) => o.id.includes("bleedForBlood"))).toBe(false);
  });

  it("does not offer a bleed increase after the action resolves", () => {
    const { state, engine, lizette } = table();
    state.seats[0]!.hand.push({ id: "drive", name: "Freak Drive" });
    engine.choose(`bleed:${lizette.id}`);
    until(engine, () => engine.decision()?.window === "action.afterResolution");
    expect(engine.decision()!.options.some((o) => o.id.includes("Freak Drive"))).toBe(true);
    expect(engine.decision()!.options.some((o) => o.id.includes("bleedForBlood"))).toBe(false);
  });

  it("does not offer the ability during a hunt or another minion's bleed", () => {
    const hunt = table();
    hunt.engine.choose(`hunt:${hunt.lizette.id}`);
    expect(hunt.engine.decision()!.options.some((o) => o.id.includes("bleedForBlood"))).toBe(false);
    const other = table();
    const vamp = other.state.seats[1]!.minions[0]!;
    other.engine.changeMinionControl(vamp.id, "Alice");
    other.engine.choose(`bleed:${vamp.id}`);
    expect(other.engine.decision()!.options.some((o) => o.id.includes("bleedForBlood"))).toBe(false);
  });

  it("does not offer a bonus during combat after the bleed is blocked", () => {
    const { state, engine, lizette } = table();
    engine.choose(`bleed:${lizette.id}`);
    const blocker = state.seats[1]!.minions[0]!;
    until(engine, () => engine.decision()?.options.some((o) => o.id === `block:${blocker.id}`) === true);
    engine.choose(`block:${blocker.id}`);
    until(engine, () => state.frames.some((f) => f.kind === "combat"));
    for (let i = 0; i < 40 && state.frames.some((f) => f.kind === "combat"); i++) {
      const dp = engine.decision();
      if (!dp) break;
      expect(dp.options.some((o) => o.id.includes("bleedForBlood"))).toBe(false);
      const choice = dp.options.find((o) => o.id === "pass") ?? dp.options.find((o) => o.id === "strike:hand");
      if (!choice) break;
      engine.choose(choice.id);
    }
  });
});
