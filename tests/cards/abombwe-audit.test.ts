import { describe, expect, it } from "vitest";
import type { GameState } from "../../src/engine/index.ts";
import { capacityOf, disciplinesOf, VtesEngine } from "../../src/engine/index.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function setup(): { state: GameState; engine: VtesEngine } {
  const state = threeSeatGame();
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("turn fixture");
  turn.phase = "master";
  turn.masterActionsLeft = 1;
  state.seats[0]!.hand = [{ id: "abo1", name: "Abombwe" }];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

function play(engine: VtesEngine, target: string, card = "abo1"): void {
  runTrace(engine, [["Alice", `play:Abombwe:-:${target}:${card}`],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
}

describe("Abombwe — card audit", () => {
  it("targets any Laibon or vampire with Protean, including another player's vampire and torpor", () => {
    const { state, engine } = setup();
    Object.assign(state.seats[0]!.minions[0]!, { sect: "laibon", disciplines: {} });
    Object.assign(state.seats[1]!.minions[0]!, { sect: "camarilla", disciplines: { pro: "basic" }, inTorpor: true });
    Object.assign(state.seats[2]!.minions[0]!, { sect: "camarilla", disciplines: {} });
    state.seats[0]!.minions.push(makeMinion("high", "Alice", { sect: "laibon", disciplines: { abo: "superior" } }));
    state.seats[0]!.minions.push(makeAlly("ally", "Alice", 2, { sect: "laibon" }));
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Abombwe:-:V1:abo1");
    expect(ids).toContain("play:Abombwe:-:W:abo1");
    expect(ids).not.toContain("play:Abombwe:-:N:abo1");
    expect(ids).not.toContain("play:Abombwe:-:high:abo1");
    expect(ids).not.toContain("play:Abombwe:-:ally:abo1");
    play(engine, "W");
    const target = state.seats[1]!.minions[0]!;
    expect(target.inTorpor).toBe(true);
    expect(capacityOf(target)).toBe(target.capacity + 1);
    expect(disciplinesOf(target).abo).toBe("basic");
    expect(target.attached.find((p) => p.card.id === "abo1")).toMatchObject({ controller: "Alice", tags: ["discipline"] });
    expect(state.seats[0]!.pool).toBe(10);
  });

  it("applies Laibon or Protean based on current traits and rejects superior Abombwe", () => {
    const { state, engine } = setup();
    const m = state.seats[0]!.minions[0]!;
    Object.assign(m, { sect: "camarilla", disciplines: {} });
    expect(engine.decision()!.options.some((o) => o.id === "play:Abombwe:-:V1:abo1")).toBe(false);
    m.attached.push({ card: { id: "p", name: "Protean" }, locked: false, usedThisPhase: false,
      statics: { disciplineBoost: "pro" }, tags: ["discipline"] });
    expect(engine.decision()!.options.some((o) => o.id === "play:Abombwe:-:V1:abo1")).toBe(true);
    m.disciplines.abo = "superior";
    expect(engine.decision()!.options.some((o) => o.id === "play:Abombwe:-:V1:abo1")).toBe(false);
  });

  it("is a trifle, stacks none to basic to superior, and cannot give a third level", () => {
    const { state, engine } = setup();
    const v = state.seats[0]!.minions[0]!;
    Object.assign(v, { sect: "laibon", disciplines: {} });
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("turn fixture");
    play(engine, "V1");
    expect(disciplinesOf(v).abo).toBe("basic");
    expect(capacityOf(v)).toBe(v.capacity + 1);
    expect(turn.masterActionsLeft).toBe(1);
    state.seats[0]!.hand.push({ id: "abo2", name: "Abombwe" });
    play(engine, "V1", "abo2");
    expect(disciplinesOf(v).abo).toBe("superior");
    expect(capacityOf(v)).toBe(v.capacity + 2);
    expect(turn.masterActionsLeft).toBe(0);
    turn.masterActionsLeft = 1;
    state.seats[0]!.hand.push({ id: "abo3", name: "Abombwe" });
    expect(engine.decision()!.options.some((o) => o.id === "play:Abombwe:-:V1:abo3")).toBe(false);
  });
});
