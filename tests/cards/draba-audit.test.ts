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

function drabaGame() {
  const state = threeSeatGame();
  Object.assign(find(state, "V1"), {
    blood: 4,
    capacity: 6,
    disciplines: { chi: "basic" },
  });
  // Bob has a minion V2 that can be targeted
  state.seats[1]!.minions.push(
    { id: "V2", name: "V2", controller: "Bob", kind: "vampire", capacity: 4, blood: 3, locked: false, inTorpor: false, disciplines: {}, attached: [] },
  );
  state.seats[0]!.hand = [{ id: "dr", name: "Draba" }];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

describe("Draba (100578)", () => {
  it("basic: stealth + setStealthZero + putInPlayOnTarget after successful action", () => {
    const { state, engine } = drabaGame();
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Draba:basic:V1:V2:dr");

    resolveUnblocked(engine, "play:Draba:basic:V1:V2:dr");

    const v2 = find(state, "V2");
    expect(v2.attached.some((p) => p.card.name === "Draba")).toBe(true);
  });
});
