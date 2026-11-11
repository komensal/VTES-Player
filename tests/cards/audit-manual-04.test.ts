import { describe, expect, it } from "vitest";
import { capacityOf, currentStealth, disciplinesOf, VtesEngine } from "../../src/engine/index.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

describe("Blood Buff — manual card audit", () => {
  it("is a trifle on a ready Blood Brother you control, granting Sanguinus but not capacity", () => {
    const state = threeSeatGame();
    const tf = state.frames[0]!;
    if (tf.kind !== "turn") throw new Error("fixture");
    tf.phase = "master"; tf.masterActionsLeft = 1;
    const v = state.seats[0]!.minions[0]!; v.clan = "Blood Brother"; v.disciplines = {};
    state.seats[0]!.minions.push(makeMinion("sleep", "Alice", { clan: "Blood Brother", inTorpor: true }));
    state.seats[0]!.minions.push(makeAlly("ally", "Alice", 2, { clan: "Blood Brother" }));
    state.seats[1]!.minions[0]!.clan = "Blood Brother";
    state.seats[0]!.hand = [{ id: "buff", name: "Blood Buff" }];
    const engine = new VtesEngine(state, testRegistry);
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Blood Buff:-:V1:buff");
    expect(ids).not.toContain("play:Blood Buff:-:W:buff");
    expect(ids).not.toContain("play:Blood Buff:-:sleep:buff");
    expect(ids).not.toContain("play:Blood Buff:-:ally:buff");
    runTrace(engine, [["Alice", "play:Blood Buff:-:V1:buff"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(disciplinesOf(v).san).toBe("basic");
    expect(capacityOf(v)).toBe(v.capacity);
    expect(state.seats[0]!.pool).toBe(10);
    expect(tf.masterActionsLeft).toBe(1);
    state.seats[0]!.hand.push({ id: "buff2", name: "Blood Buff" });
    runTrace(engine, [["Alice", "play:Blood Buff:-:V1:buff2"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(disciplinesOf(v).san).toBe("superior");
    expect(tf.masterActionsLeft).toBe(0);
  });
});

describe("Biothaumaturgic Experiment — action stealth", () => {
  it.each(["basic", "superior"] as const)("announces the %s action at +1 stealth", (mode) => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.disciplines = { tha: "superior" };
    state.seats[0]!.hand = [{ id: "bx", name: "Biothaumaturgic Experiment" }, { id: "spy", name: "Raven Spy" }];
    const engine = new VtesEngine(state, testRegistry);
    const option = engine.decision()!.options.find((o) => o.id.startsWith(`play:Biothaumaturgic Experiment:${mode}:V1:`));
    expect(option).toBeDefined();
    runTrace(engine, [["Alice", option!.id], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    const frame = state.frames.find((f) => f.kind === "action");
    if (!frame || frame.kind !== "action") throw new Error("no action");
    expect(currentStealth(state, frame.actionId)).toBe(1);
  });
});
