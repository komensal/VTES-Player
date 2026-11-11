import { describe, expect, it } from "vitest";
import { currentStealth, VtesEngine } from "../../src/engine/index.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function setup() {
  const state = threeSeatGame();
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("fixture");
  turn.phase = "master"; turn.masterActionsLeft = 1;
  state.seats[0]!.hand = [{ id: "bv", name: "Bestial Visage" }];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

describe("Bestial Visage audit regression", () => {
  it("allows friendly, opposing and torpor Gangrel antitribu but not other clans or allies", () => {
    const { state, engine } = setup();
    state.seats[0]!.minions[0]!.clan = "Gangrel antitribu";
    Object.assign(state.seats[1]!.minions[0]!, { clan: "Gangrel antitribu", inTorpor: true });
    state.seats[0]!.minions.push(makeMinion("other", "Alice", { clan: "Gangrel" }));
    state.seats[0]!.minions.push(makeAlly("ally", "Alice", 2, { clan: "Gangrel antitribu" }));
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Bestial Visage:-:V1:bv");
    expect(ids).toContain("play:Bestial Visage:-:W:bv");
    expect(ids).not.toContain("play:Bestial Visage:-:other:bv");
    expect(ids).not.toContain("play:Bestial Visage:-:ally:bv");
    runTrace(engine, [["Alice", "play:Bestial Visage:-:W:bv"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(state.seats[0]!.pool).toBe(10);
    expect(state.seats[1]!.minions[0]!.attached.find((p) => p.card.id === "bv")).toMatchObject({ controller: "Alice", statics: { stealth: -1 } });
  });

  it("actually reduces the bearer's stealth on actions and stacks", () => {
    const { state, engine } = setup();
    state.seats[0]!.minions[0]!.clan = "Gangrel antitribu";
    runTrace(engine, [["Alice", "play:Bestial Visage:-:V1:bv"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.masterActionsLeft = 1;
    state.seats[0]!.hand.push({ id: "bv2", name: "Bestial Visage" });
    runTrace(engine, [["Alice", "play:Bestial Visage:-:V1:bv2"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Alice", "hunt:V1"]]);
    const frame = state.frames.find((f) => f.kind === "action");
    if (!frame || frame.kind !== "action") throw new Error("no action");
    expect(currentStealth(state, frame.actionId)).toBe(-1); // hunt +1, two copies -2
  });
});
