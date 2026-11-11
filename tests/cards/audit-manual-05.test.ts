import { describe, expect, it } from "vitest";
import { capacityOf, disciplinesOf, VtesEngine } from "../../src/engine/index.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function setup() {
  const state = threeSeatGame();
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("fixture");
  turn.phase = "master"; turn.masterActionsLeft = 1;
  state.seats[0]!.hand = [{ id: "code1", name: "Blooding by the Code" }];
  state.seats[0]!.minions[0]!.clan = "Salubri antitribu";
  state.seats[0]!.minions[0]!.disciplines = { val: "basic" };
  return { state, engine: new VtesEngine(state, testRegistry) };
}
function play(engine: VtesEngine, target: string, card: string) {
  runTrace(engine, [["Alice", `play:Blooding by the Code:-:${target}:${card}`], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
}

describe("Blooding by the Code — manual audit", () => {
  it("targets own Salubri antitribu (including torpor) but not an ally or another player's vampire", () => {
    const { state, engine } = setup();
    const alice = state.seats[0]!;
    alice.minions.push(makeMinion("torpor", "Alice", { clan: "Salubri antitribu", inTorpor: true }));
    alice.minions.push(makeMinion("other", "Alice", { clan: "Salubri" }));
    alice.minions.push(makeAlly("ally", "Alice", 2, { clan: "Salubri antitribu" }));
    state.seats[1]!.minions[0]!.clan = "Salubri antitribu";
    const opts = engine.decision()!.options.map((o) => o.id);
    expect(opts).toContain("play:Blooding by the Code:-:V1:code1");
    expect(opts).toContain("play:Blooding by the Code:-:torpor:code1");
    for (const target of ["other", "ally", "W"]) expect(opts).not.toContain(`play:Blooding by the Code:-:${target}:code1`);
    play(engine, "torpor", "code1");
    expect(alice.pool).toBe(9);
    const target = alice.minions.find((m) => m.id === "torpor")!;
    expect(disciplinesOf(target).val).toBe("basic");
    expect(capacityOf(target)).toBe(target.capacity + 1);
    expect(target.attached[0]?.statics.strength).toBe(1);
  });

  it("upgrades Valeren, increases hand damage, and limits one per vampire rather than globally", () => {
    const { state, engine } = setup();
    const v = state.seats[0]!.minions[0]!;
    state.seats[0]!.minions.push(makeMinion("V2", "Alice", { clan: "Salubri antitribu" }));
    play(engine, "V1", "code1");
    expect(disciplinesOf(v).val).toBe("superior");
    expect(capacityOf(v)).toBe(v.capacity + 1);
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.masterActionsLeft = 1;
    state.seats[0]!.hand.push({ id: "code2", name: "Blooding by the Code" });
    const opts = engine.decision()!.options.map((o) => o.id);
    expect(opts).not.toContain("play:Blooding by the Code:-:V1:code2");
    expect(opts).toContain("play:Blooding by the Code:-:V2:code2");
    v.blood = 5; state.seats[1]!.minions.find((m) => m.id === "M")!.blood = 5;
    runTrace(engine, [["Alice", "pass"], ["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    for (let i = 0; i < 50 && !state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M"); i++) {
      const dp = engine.decision()!;
      engine.choose((dp.options.find((o) => o.id === "pass") ?? dp.options.find((o) => o.id === "strike:hand"))!.id);
    }
    expect(state.eventLog.find((e) => e.type === "DamageInflicted" && e.minion === "M")).toMatchObject({ amount: 2 });
  });
});
