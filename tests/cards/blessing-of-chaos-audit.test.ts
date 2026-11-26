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

function blessingGame() {
  const state = threeSeatGame();
  Object.assign(find(state, "V1"), {
    blood: 4,
    capacity: 6,
    disciplines: { dem: "basic" },
  });
  state.seats[0]!.hand = [{ id: "bc", name: "Blessing of Chaos" }];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

describe("Blessing of Chaos (100182)", () => {
  it("basic: puts itself in play on the acting vampire after a successful action", () => {
    const { state, engine } = blessingGame();
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Blessing of Chaos:basic:V1:dem:bc");

    resolveUnblocked(engine, "play:Blessing of Chaos:basic:V1:dem:bc");

    const v1 = find(state, "V1");
    expect(v1.attached.some((p) => p.card.name === "Blessing of Chaos")).toBe(true);
    const entry = v1.attached.find((p) => p.card.name === "Blessing of Chaos")!;
    expect(entry.tags).toContain("Blessing of Chaos");
    expect(entry.locked).toBe(false);
  });
});
