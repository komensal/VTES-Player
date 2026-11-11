import { describe, expect, it } from "vitest";
import { VtesEngine, capacityOf, disciplinesOf } from "../../src/engine/index.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function atMaster(name: string) {
  const state = threeSeatGame();
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("fixture");
  turn.phase = "master"; turn.masterActionsLeft = 1;
  state.seats[0]!.hand = [{ id: "master", name }];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

describe("batch 3 card audit regressions", () => {
  it.each(["Animalism", "Celerity", "Auspex"])('%s targets any vampire including torpor, but not superior or allies', (name) => {
    const { state, engine } = atMaster(name);
    const code = { Animalism: "ani", Celerity: "cel", Auspex: "aus" }[name]!;
    const opponent = state.seats[1]!.minions[0]!;
    opponent.inTorpor = true; opponent.disciplines = {};
    state.seats[0]!.minions.push(makeMinion("superior", "Alice", { disciplines: { [code]: "superior" } }), makeAlly("ally", "Alice", 2));
    const options = engine.decision()!.options.map((o) => o.id);
    expect(options).toContain(`play:${name}:-:V1:master`);
    expect(options).toContain(`play:${name}:-:W:master`);
    expect(options).not.toContain(`play:${name}:-:superior:master`);
    expect(options).not.toContain(`play:${name}:-:ally:master`);
    runTrace(engine, [["Alice", `play:${name}:-:W:master`], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(disciplinesOf(opponent)[code]).toBe("basic");
    expect(capacityOf(opponent)).toBe(opponent.capacity + 1);
    expect(opponent.attached.find((p) => p.card.id === "master")?.controller).toBe("Alice");
  });

  it("Art of Pain requires a ready controlled clan member and enough pool", () => {
    const { state, engine } = atMaster("The Art of Pain");
    state.seats[1]!.minions[0]!.clan = "Toreador antitribu";
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:The Art of Pain"))).toBe(false);
    state.seats[0]!.minions[0]!.clan = "Toreador antitribu";
    state.seats[0]!.pool = 2;
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:The Art of Pain"))).toBe(false);
  });

  it("Art of Pain costs 2 pool, is unique and targets any ready Toreador antitribu only", () => {
    const { state, engine } = atMaster("The Art of Pain");
    const alice = state.seats[0]!;
    const target = state.seats[1]!.minions[0]!;
    alice.minions[0]!.clan = "Toreador antitribu"; // printed clan requirement
    target.clan = "Toreador antitribu"; target.inTorpor = false;
    alice.minions.push(makeMinion("torpor", "Alice", { clan: "Toreador antitribu", inTorpor: true }));
    alice.minions.push(makeMinion("wrong", "Alice", { clan: "Toreador" }));
    const options = engine.decision()!.options.map((o) => o.id);
    expect(options).toContain("play:The Art of Pain:-:W:master");
    expect(options).not.toContain("play:The Art of Pain:-:torpor:master");
    expect(options).not.toContain("play:The Art of Pain:-:wrong:master");
    runTrace(engine, [["Alice", "play:The Art of Pain:-:W:master"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(alice.pool).toBe(8);
    expect(target.attached.find((p) => p.card.id === "master")).toMatchObject({ controller: "Alice", statics: { strength: 2 } });
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.masterActionsLeft = 1;
    alice.hand.push({ id: "second", name: "The Art of Pain" });
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:The Art of Pain"))).toBe(false);
  });

  it("Art of Pain's +2 strength actually increases its bearer's hand-strike damage", () => {
    const { state, engine } = atMaster("The Art of Pain");
    const actor = state.seats[0]!.minions[0]!;
    actor.clan = "Toreador antitribu"; actor.blood = 5;
    state.seats[1]!.minions.find((m) => m.id === "M")!.blood = 5;
    runTrace(engine, [["Alice", "play:The Art of Pain:-:V1:master"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    for (let i = 0; i < 50 && !state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M"); i++) {
      const dp = engine.decision()!;
      engine.choose((dp.options.find((o) => o.id === "pass") ?? dp.options.find((o) => o.id === "strike:hand"))!.id);
    }
    expect(state.eventLog.find((e) => e.type === "DamageInflicted" && e.minion === "M")).toMatchObject({ amount: 3 });
  });
});
