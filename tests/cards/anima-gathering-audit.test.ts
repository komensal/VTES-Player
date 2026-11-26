import { describe, expect, it } from "vitest";
import type { GameState, MinionState } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

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

function animaGame() {
  const state = threeSeatGame();
  Object.assign(find(state, "V1"), {
    blood: 4,
    capacity: 6,
    disciplines: { aus: "basic" },
  });
  // V2 is a younger ready vampire (capacity 3 < V1's 6) — legal target.
  state.seats[0]!.minions.push(
    makeMinion("V2", "Alice", { blood: 2, capacity: 3 }),
  );
  state.seats[0]!.hand = [{ id: "ag", name: "Anima Gathering" }];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

describe("Anima Gathering (100068)", () => {
  it("putInPlayOnTarget: attaches to the chosen minion after a successful action", () => {
    const { state, engine } = animaGame();
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Anima Gathering:basic:V1:V2:ag");

    resolveUnblocked(engine, "play:Anima Gathering:basic:V1:V2:ag");

    const v2 = find(state, "V2");
    expect(v2.attached.some((p) => p.card.name === "Anima Gathering")).toBe(true);
    const entry = v2.attached.find((p) => p.card.name === "Anima Gathering")!;
    expect(entry.tags).toContain("Anima Gathering");
    expect(entry.locked).toBe(false);
  });
});
