/**
 * Healing Touch (100901).
 *
 * +1 stealth action.
 * [cel] Unlock a younger vampire you control.
 * [obe] Add up to 2 life to an ally, not to exceed their starting life.
 * [OBE] Rescue a vampire from torpor. The rescued vampire gains 1 blood.
 */

import { describe, expect, it } from "vitest";
import type { GameState, MinionState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function find(state: GameState, id: string): MinionState {
  const m = state.seats.flatMap((s) => s.minions).find((x) => x.id === id);
  if (!m) throw new Error(`no minion ${id}`);
  return m;
}

function game(discipline: "cel" | "obe", level: "basic" | "superior" = "basic") {
  const state = threeSeatGame();
  Object.assign(find(state, "V1"), { blood: 4, capacity: 6, disciplines: { [discipline]: level } });
  state.seats[0]!.hand = [{ id: "ht", name: "Healing Touch" }];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

function resolveUnblocked(engine: VtesEngine, play: string): void {
  runTrace(engine, [
    ["Alice", play],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // announce
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // A
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // C → resolve
  ]);
}

describe("Healing Touch (100901)", () => {
  it("[cel] offers only younger vampires the actor controls, and unlocks one", () => {
    const { state, engine } = game("cel");
    state.seats[0]!.minions.push(
      makeMinion("V2", "Alice", { capacity: 3, locked: true }),
      makeMinion("V3", "Alice", { capacity: 9, locked: true }), // older
      makeAlly("A1", "Alice", 2, { locked: true }), // not a vampire
    );
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Healing Touch:basic:V1:cel:V2:ht");
    expect(ids.some((i) => i.includes(":V3:") || i.includes(":A1:") || i.includes(":W:"))).toBe(false);

    resolveUnblocked(engine, "play:Healing Touch:basic:V1:cel:V2:ht");
    expect(find(state, "V2").locked).toBe(false);
    expect(find(state, "V3").locked).toBe(true);
    expect(find(state, "V1").blood).toBe(3); // printed cost 1
  });

  it("[obe] offers each amount up to 2, clamped to starting life", () => {
    const { state, engine } = game("obe");
    state.seats[0]!.minions.push(makeAlly("A1", "Alice", 1)); // capacity 1 by default
    find(state, "A1").capacity = 3; // starting life 3, current life 1
    state.seats[1]!.minions.push(makeAlly("FULL", "Bob", 2)); // already at starting life

    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Healing Touch:basic:V1:obe:A1:1:ht");
    expect(ids).toContain("play:Healing Touch:basic:V1:obe:A1:2:ht");
    expect(ids.some((i) => i.includes(":FULL:"))).toBe(false);

    resolveUnblocked(engine, "play:Healing Touch:basic:V1:obe:A1:2:ht");
    expect(find(state, "A1").blood).toBe(3); // 1 + 2, capped at starting life
  });

  it("[obe] honours a smaller chosen amount", () => {
    const { state, engine } = game("obe");
    state.seats[0]!.minions.push(makeAlly("A1", "Alice", 1));
    find(state, "A1").capacity = 3;
    resolveUnblocked(engine, "play:Healing Touch:basic:V1:obe:A1:1:ht");
    expect(find(state, "A1").blood).toBe(2);
  });

  it("[OBE] rescues the actor's own torpid vampire and gives it 1 blood", () => {
    const { state, engine } = game("obe", "superior");
    state.seats[0]!.minions.push(makeMinion("V4", "Alice", { blood: 0, inTorpor: true }));
    state.seats[1]!.minions.push(makeMinion("FOREIGN", "Bob", { blood: 0, inTorpor: true }));

    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Healing Touch:superior:V1:obe:V4:ht");
    // Only the actor's own torpid vampire is a card target; the generic
    // rescue/diablerize actions are a different matter entirely.
    expect(ids.filter((i) => i.startsWith("play:Healing Touch")).some((i) => i.includes(":FOREIGN:"))).toBe(false);

    resolveUnblocked(engine, "play:Healing Touch:superior:V1:obe:V4:ht");
    expect(find(state, "V4").inTorpor).toBe(false);
    expect(find(state, "V4").blood).toBe(1);
    expect(find(state, "FOREIGN").inTorpor).toBe(true);
    expect(find(state, "V1").blood).toBe(3);
  });
});
