import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import type { GameState, PermanentInPlay } from "../../src/engine/index.ts";
import { makeAlly, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function puppy(counters = 3): PermanentInPlay {
  return { card: { id: "puppy", name: "Blood Puppy" }, controller: "Alice", locked: false, usedThisPhase: false, statics: {}, tags: [], counters };
}
function atUnlock(n = 3): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  state.seats[0]!.permanents.push(puppy(n));
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("fixture");
  turn.phase = "unlock"; turn.unlockDone = false; turn.unlockAbilitiesDone = false;
  return { state, engine: new VtesEngine(state, testRegistry) };
}

describe("Blood Puppy", () => {
  it("costs 2 pool, enters as unique with 3 blood and grants a burn action", () => {
    const state = threeSeatGame();
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.phase = "master"; turn.masterActionsLeft = 1;
    state.seats[0]!.hand.push({ id: "puppy", name: "Blood Puppy" });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", "play:Blood Puppy"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(state.seats[0]!.pool).toBe(8);
    expect(state.seats[0]!.permanents.find((p) => p.card.id === "puppy")?.counters).toBe(3);
    expect(testRegistry["Blood Puppy"]!.isUnique).toBe(true);
    state.seats[0]!.hand.push({ id: "second", name: "Blood Puppy" });
    turn.masterActionsLeft = 1;
    expect(engine.decision()!.options.some((o) => o.kind === "playCard" && o.card === "second")).toBe(false);
  });

  it.each([
    [0, 4, 11, false], // one blood to pool
    [1, 6, 10, false], // one blood from bank
    [2, null, 15, true], // burn to move all blood to pool
  ])("unlock option %i moves the right counters and spends the shared use", (option, expectedCounters, expectedPool, burned) => {
    const { state, engine } = atUnlock(5);
    const ids = engine.decision()!.options.map((o) => o.id);
    for (let i = 0; i < 3; i++) expect(ids).toContain(`ability:Blood Puppy:puppy:store:${i}`);
    engine.choose(`ability:Blood Puppy:puppy:store:${option}`);
    expect(state.seats[0]!.pool).toBe(expectedPool);
    expect(state.seats[0]!.permanents.find((p) => p.card.id === "puppy")?.counters ?? null).toBe(expectedCounters);
    expect((state.seats[0]!.ashHeap ?? []).some((c) => c.id === "puppy")).toBe(burned);
    expect(engine.decision()?.options.some((o) => o.id.startsWith("ability:Blood Puppy:puppy:store:"))).toBe(false);
  });

  it("an empty puppy can be refilled or burned, but cannot give one blood", () => {
    const { state, engine } = atUnlock(0);
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).not.toContain("ability:Blood Puppy:puppy:store:0");
    expect(ids).toContain("ability:Blood Puppy:puppy:store:1");
    expect(ids).toContain("ability:Blood Puppy:puppy:store:2");
    engine.choose("ability:Blood Puppy:puppy:store:2");
    expect(state.seats[0]!.pool).toBe(10);
    expect(state.seats[0]!.permanents).toHaveLength(0);
  });

  it("any opposing minion, including an ally, may burn the puppy without taking its blood", () => {
    const state = threeSeatGame();
    state.seats[0]!.permanents.push(puppy(3));
    state.seats[1]!.minions.push(makeAlly("ally", "Bob", 2));
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.seat = "Bob";
    const engine = new VtesEngine(state, testRegistry);
    const id = "act:Blood Puppy:puppy:burn:ally";
    expect(engine.decision()!.options.some((o) => o.id === id)).toBe(true);
    engine.choose(id);
    const action = state.frames.find((f) => f.kind === "action");
    expect(action).toMatchObject({ acting: "ally", target: "Alice", directed: true });
    for (let i = 0; i < 20 && state.seats[0]!.permanents.length; i++) {
      const dp = engine.decision()!;
      engine.choose(dp.options.find((o) => o.id === "pass")!.id);
    }
    expect(state.seats[0]!.permanents).toHaveLength(0);
    expect(state.seats[0]!.pool).toBe(10);
    expect(state.seats[1]!.pool).toBe(10);
  });
});
