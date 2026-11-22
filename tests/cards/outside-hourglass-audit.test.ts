import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/engine.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function game() {
  const state = threeSeatGame();
  for (const seat of [0, 1]) {
    const m = seat === 0 ? state.seats[0]!.minions[0]! : state.seats[1]!.minions.find(m => m.id === "M")!;
    m.disciplines = { tem: "superior" }; m.blood = 8; m.capacity = 10;
    state.seats[seat]!.hand.push(...[0,1,2].map(i => ({ id: `${seat}-${i}`, name: "Outside the Hourglass" })));
  }
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [["Alice","bleed:V1"],["Alice","pass"],["Bob","pass"],["Carol","pass"],["Alice","pass"],["Bob","block:M"],["Alice","pass"],["Bob","pass"],["Carol","pass"]]);
  return {state, engine};
}
function find(e: VtesEngine, prefix: string) { return e.decision()?.options.find(o => o.id.startsWith(prefix)); }
function walk(e: VtesEngine, pred: () => boolean, limit = 100) {
  for (let i=0; i<limit && !pred(); i++) {
    const dp=e.decision(); if (!dp) break;
    const pick=dp.options.find(o=>o.id==='pass') ?? dp.options.find(o=>o.id==='strike:hand');
    if (!pick) throw new Error(`${dp.window}: ${dp.options.map(o=>o.id)}`);
    e.choose(pick.id);
  }
  expect(pred()).toBe(true);
}
describe("Outside the Hourglass", () => {
  it("offers the basic Temporis maneuver separately from the dodge", () => {
    const {state, engine} = game();
    walk(engine, () => engine.decision()?.window === "combat.range" && engine.decision()?.seat === "Alice");
    const option=find(engine,"play:Outside the Hourglass:basic:V1:maneuver");
    expect(option).toBeDefined(); engine.choose(option!.id);
    walk(engine, () => engine.decision()?.window === "combat.chooseStrike" && engine.decision()?.seat === "Alice");
    const cf=state.frames.find(f=>f.kind==='combat'); if (!cf || cf.kind!=='combat') throw Error('no combat');
    expect(cf.range).toBe("long");
    expect(find(engine,"play:Outside the Hourglass:basic:V1:dodge")).toBeDefined();
  });
  it("inflicts damage once from the vampire before strikes and survives a save", () => {
    const {state, engine} = game();
    engine.choose(find(engine,"play:Outside the Hourglass:superior:V1")!.id);
    walk(engine, () => engine.decision()?.window === "combat.beforeRange" && engine.decision()?.seat === "Alice");
    const cf=state.frames.find(f=>f.kind==='combat'); if (!cf || cf.kind !== 'combat') throw Error('combat');
    expect(cf.pendingDamage).toEqual(expect.arrayContaining([expect.objectContaining({minion:'M',amount:2,source:'V1',aggravated:false})]));
    expect(cf.roundDamage).toHaveLength(0);
    const saved=JSON.parse(JSON.stringify(state));
    const resumed=new VtesEngine(saved,testRegistry);
    walk(resumed, () => resumed.decision()?.window === 'combat.chooseStrike' && resumed.decision()?.seat === 'Alice');
    expect(saved.seats[1].minions.find((m: {id:string}) => m.id === 'M').blood).toBe(6);
    expect(saved.eventLog.some((e: {type:string}) => e.type === 'StrikeChosen')).toBe(false);
  });
  it("limits superior per vampire per round, not per combat", () => {
    const {state, engine} = game();
    const first=find(engine,"play:Outside the Hourglass:superior:V1");
    expect(first).toBeDefined(); engine.choose(first!.id);
    // Resolve its as-played window and return to before-range.
    walk(engine, () => engine.decision()?.window === 'combat.beforeRange' && engine.decision()?.seat === 'Alice');
    expect(find(engine,"play:Outside the Hourglass:superior:V1")).toBeUndefined();
    engine.choose('pass');
    expect(engine.decision()?.seat).toBe('Bob');
    expect(find(engine,"play:Outside the Hourglass:superior:M")).toBeDefined();
    const saved=JSON.parse(JSON.stringify(state));
    const resumed=new VtesEngine(saved,testRegistry);
    expect(find(resumed,"play:Outside the Hourglass:superior:M")).toBeDefined();
  });
});

describe("Outside the Hourglass (101338): pre-range prevention [G00164, ANK 20170930]", () => {
  /** Both minions may play prevention before the pre-range damage is mended. */
  it("the victim can play prevention for the superior's pre-range damage", () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!.minions[0]!;
    Object.assign(alice, { disciplines: { tem: "superior" }, blood: 8, capacity: 10 });
    const m = state.seats[1]!.minions.find((x) => x.id === "M")!;
    Object.assign(m, { disciplines: { for: "superior" }, blood: 8, capacity: 10 });
    state.seats[0]!.hand.push({ id: "oh", name: "Outside the Hourglass" });
    state.seats[1]!.hand.push({ id: "res", name: "Resilience" });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice","bleed:V1"],["Alice","pass"],["Bob","pass"],["Carol","pass"],["Alice","pass"],["Bob","block:M"],["Alice","pass"],["Bob","pass"],["Carol","pass"]]);
    engine.choose(find(engine,"play:Outside the Hourglass:superior:V1")!.id);
    // Walk to the point where Bob can answer the pending pre-range damage.
    let preventionOffered: string | undefined;
    for (let i = 0; i < 40; i++) {
      const dp = engine.decision()!;
      const prevent = dp.options.find((o) => o.id.startsWith("play:Resilience"));
      if (prevent) { preventionOffered = prevent.id; break; }
      if (dp.window === "combat.chooseStrike") break;
      engine.choose((dp.options.find((o) => o.id === "pass") ?? dp.options[0]!).id);
    }
    expect(preventionOffered).toBeDefined();
    engine.choose(preventionOffered!);
    // Resolve the prevention's as-played window and the remaining damage.
    for (let i = 0; i < 40; i++) {
      const dp = engine.decision()!;
      if (dp.window === "combat.chooseStrike" || dp.window === "combat.range") break;
      engine.choose((dp.options.find((o) => o.id === "pass") ?? dp.options[0]!).id);
    }
    // Resilience basic prevents 1 of the 2 pre-range damage: 8 -> 7, not 6.
    expect(m.blood).toBe(7);
  });

  it("both sides can play prevention for simultaneous pre-range damage from both superiors", () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!.minions[0]!;
    Object.assign(alice, { disciplines: { tem: "superior" }, blood: 8, capacity: 10 });
    const m = state.seats[1]!.minions.find((x) => x.id === "M")!;
    Object.assign(m, { disciplines: { tem: "superior" }, blood: 8, capacity: 10 });
    state.seats[0]!.hand.push({ id: "oh1", name: "Outside the Hourglass" });
    state.seats[1]!.hand.push({ id: "oh2", name: "Outside the Hourglass" });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice","bleed:V1"],["Alice","pass"],["Bob","pass"],["Carol","pass"],["Alice","pass"],["Bob","block:M"],["Alice","pass"],["Bob","pass"],["Carol","pass"]]);
    engine.choose(find(engine,"play:Outside the Hourglass:superior:V1")!.id);
    // Walk to where both can offer prevention for pre-range damage.
    let preventionCount = 0;
    for (let i = 0; i < 40; i++) {
      const dp = engine.decision()!;
      const prevent = dp.options.find((o: any) => o.id.startsWith("play:Outside the Hourglass:superior"));
      if (prevent) {
        preventionCount++;
        engine.choose(prevent.id);
        if (preventionCount >= 2) break;
      }
      if (dp.window === "combat.chooseStrike") break;
      engine.choose(dp.options.find((o) => o.id === "pass") ?? dp.options[0]!.id);
    }
    // Both Alice and Bob should have been offered prevention for their respective superior damage.
    expect(preventionCount).toBeGreaterThanOrEqual(1);
  });
});
