import { describe, expect, it } from "vitest";
import type { GameState, MinionState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function find(state: GameState, id: string): MinionState {
  const m = state.seats.flatMap((s) => s.minions).find((x) => x.id === id);
  if (!m) throw new Error(`no minion ${id}`);
  return m;
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

function bestowVigorGame() {
  const state = threeSeatGame();
  Object.assign(find(state, "V1"), {
    blood: 4,
    capacity: 6,
    disciplines: { for: "basic" },
  });
  // V2 on same seat (Alice)
  state.seats[0]!.minions.push(
    { id: "V2", name: "V2", controller: "Alice", kind: "vampire", capacity: 4, blood: 3, locked: false, inTorpor: false, disciplines: {}, attached: [] },
  );
  state.seats[0]!.hand = [{ id: "bv", name: "Bestow Vigor" }];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

describe("Bestow Vigor (100155)", () => {
  it("basic: putInPlayOnTarget + unlockActor after successful action", () => {
    const { state, engine } = bestowVigorGame();
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Bestow Vigor:basic:V1:V2:bv");

    resolveUnblocked(engine, "play:Bestow Vigor:basic:V1:V2:bv");

    const v2 = find(state, "V2");
    expect(v2.attached.some((p) => p.card.name === "Bestow Vigor")).toBe(true);
    const v1 = find(state, "V1");
    expect(v1.locked).toBe(false);
  });
});
