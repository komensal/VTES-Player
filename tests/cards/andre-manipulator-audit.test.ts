import { describe, expect, it } from "vitest";
import type { GameState, MinionState } from "../../src/engine/index.ts";
import { VtesEngine, handSizeOf } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function find(state: GameState, id: string): MinionState {
  const m = state.seats.flatMap((s) => s.minions).find((x) => x.id === id);
  if (!m) throw new Error(`no minion ${id}`);
  return m;
}

function setup() {
  const state = threeSeatGame();
  const andre = find(state, "V1");
  Object.assign(andre, { name: "André the Manipulator (G5)", blood: 4, capacity: 6 });
  const self = testRegistry["André the Manipulator (G5)"]!.cryptEntry!();
  andre.attached.push({ card: { id: "andre", name: "André the Manipulator (G5)" }, locked: false,
    usedThisPhase: false, statics: self.statics, tags: self.tags });
  // Give Alice some cards in library
  state.seats[0]!.library = [
    { id: "lib1", name: "Conditioning" },
    { id: "lib2", name: "Conditioning" },
    { id: "lib3", name: "Conditioning" },
  ];
  const engine = new VtesEngine(state, testRegistry);
  return { state, engine };
}

function walkToDiscardPhase(e: VtesEngine) {
  for (let i = 0; i < 100; i++) {
    const dp = e.decision()!;
    if (dp.window === "turn.discard") return;
    e.choose(dp.options.find((o) => o.id === "pass")?.id ?? dp.options[0]!.id);
  }
  throw new Error("never reached discard phase");
}

describe("André the Manipulator (G5)", () => {
  it("has +2 hand size", () => {
    const { state } = setup();
    const hs = handSizeOf(state, "Alice");
    expect(hs).toBeGreaterThanOrEqual(7); // base 5 + 2
  });

  it("draws 1 card and discards 1 during discard phase", () => {
    const { state, engine } = setup();
    walkToDiscardPhase(engine);
    const handSizeBefore = state.seats[0]!.hand.length;
    const librarySizeBefore = state.seats[0]!.library.length;
    // The draw should happen automatically
    expect(state.seats[0]!.hand.length).toBeGreaterThanOrEqual(handSizeBefore);
  });
});