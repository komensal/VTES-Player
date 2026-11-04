/**
 * Street Cred (101882) — "Only usable at the end of a round ... in which
 * this vampire successfully inflicted more damage than the opposing minion.
 * A vampire can play only 1 Street Cred each turn." Basic is [pot] for 1,
 * superior [POT] for 2, each to a YOUNGER vampire in your uncontrolled
 * region.
 */
import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import type { DecisionPoint } from "../../src/engine/index.ts";
import { testRegistry, threeSeatGame, makeMinion } from "../engine/fixtures.ts";

function runUntil(engine: VtesEngine, stop: (dp: DecisionPoint) => boolean): DecisionPoint {
  for (let i = 0; i < 600; i++) {
    const dp = engine.decision();
    if (!dp) throw new Error("no decision pending");
    if (stop(dp)) return dp;
    const pass = dp.options.find((o) => o.id === "pass");
    if (!pass) return dp;
    engine.choose(pass.id);
  }
  throw new Error("loop");
}
function choose(engine: VtesEngine, prefix: string): string {
  const dp = engine.decision(); if (!dp) throw new Error("no decision");
  const opt = dp.options.find(o=>o.id.startsWith(prefix));
  if(!opt) throw new Error(prefix + " not offered; legal: " + dp.options.map(o=>o.id).join(", "));
  engine.choose(opt.id); return opt.id;
}
function freshState(capacity=6){
  const state = threeSeatGame();
  const v1:any = state.seats[0]!.minions[0]!; v1.disciplines = { pot: "superior" }; v1.blood = 5; v1.capacity = capacity;
  const yc = makeMinion("u1", "Alice", { capacity: 4 }); (yc as any).name="Young One"; yc.id="u1";
  const oc = makeMinion("u2", "Alice", { capacity: 8 }); (oc as any).name="Old One"; oc.id="u2";
  state.seats[0]!.uncontrolled = [{ card: yc as any, counters: 0 }, { card: oc as any, counters: 0 }];
  state.seats[0]!.hand = [{ id: "k", name: "Street Cred" } as any];
  return { state, engine: new VtesEngine(state, testRegistry) };
}
function enterCombat(engine: VtesEngine){
  choose(engine, "bleed:V1");
  runUntil(engine, dp=>dp.window==="action.effects" && dp.seat==="Bob");
  choose(engine, "block:M");
}
function drainToPressAndMutate(engine: VtesEngine, dmg:{acting:number,opposing:number}){
  // beforeRange -> chooseStrike -> press
  for(let i=0;i<200;i++){
    const dp=engine.decision(); if(!dp) break;
    if(dp.window==="combat.chooseStrike"){
      engine.choose(dp.options.find(o=>o.id==="strike:hand")!.id);
      continue;
    }
    if(dp.window==="combat.press"){
      const cf:any = (engine as any).state.frames.find((f:any)=>f.kind==="combat");
      cf.damageTakenThisRound.acting = dmg.acting;
      cf.damageTakenThisRound.opposing = dmg.opposing;
      engine.choose("pass");
      continue;
    }
    if(dp.window==="combat.endOfRound") break;
    const p=dp.options.find(o=>o.id==="pass"); if(p) engine.choose(p.id); else if(dp.options[0]) engine.choose(dp.options[0]!.id); else break;
  }
}
function drainCombatToEnd(state:any, engine:VtesEngine){
  for(let i=0;i<200;i++){ const d=engine.decision(); if(!d) break; const p=d.options.find(o=>o.id==="pass"); if(p) engine.choose(p.id); else if(d.options[0]) engine.choose(d.options[0]!.id); else break; if(state.eventLog.some((e:any)=>e.type==="CombatEnded")) break; }
}

describe("Street Cred (101882)", ()=>{
  it("basic moves 1 blood to the only younger uncontrolled vampire (no choice)", ()=>{
    const { state, engine } = freshState(6);
    enterCombat(engine);
    drainToPressAndMutate(engine, { acting:0, opposing:2 });
    const dp = runUntil(engine, dp=>dp.window==="combat.endOfRound" && dp.seat==="Alice");
    expect(dp.options.some(o=>o.id.includes("Street Cred"))).toBe(true);
    choose(engine, "play:Street Cred:basic");
    // card.asPlayed may appear (blood cost =1); drain it
    for(let i=0;i<20;i++){ const d=engine.decision(); if(!d) break; if(d.window==="choice") break; if(d.window==="combat.endOfRound") break; const p=d.options.find(o=>o.id==="pass"); if(p) engine.choose(p.id); else break; }
    expect(state.eventLog.some(e=>e.type==="CardPlayed" && (e as any).name==="Street Cred")).toBe(true);
    expect(state.seats[0]!.uncontrolled.find(u=>u.card.id==="u1")!.counters).toBe(1);
    expect(state.seats[0]!.uncontrolled.find(u=>u.card.id==="u2")!.counters).toBe(0);
  });
  it("superior moves 2 blood", ()=>{
    const { state, engine } = freshState(6);
    enterCombat(engine);
    drainToPressAndMutate(engine, { acting:0, opposing:2 });
    runUntil(engine, dp=>dp.window==="combat.endOfRound" && dp.seat==="Alice");
    choose(engine, "play:Street Cred:superior");
    for(let i=0;i<20;i++){ const d=engine.decision(); if(!d) break; if(d.window==="choice") break; if(d.window==="combat.endOfRound") break; const p=d.options.find(o=>o.id==="pass"); if(p) engine.choose(p.id); else break; }
    expect(state.seats[0]!.uncontrolled.find(u=>u.card.id==="u1")!.counters).toBe(2);
  });
  it("offers a choice when multiple younger vampires qualify", ()=>{
    const state = threeSeatGame();
    const v1:any = state.seats[0]!.minions[0]!; v1.disciplines={ pot:"superior"}; v1.blood=5; v1.capacity=10;
    const yc1 = makeMinion("u1","Alice",{capacity:3}); (yc1 as any).name="Tiny1"; yc1.id="u1";
    const yc2 = makeMinion("u2","Alice",{capacity:4}); (yc2 as any).name="Tiny2"; yc2.id="u2";
    state.seats[0]!.uncontrolled=[{card:yc1 as any,counters:0},{card:yc2 as any,counters:0}];
    state.seats[0]!.hand=[{id:"k",name:"Street Cred"} as any];
    const engine=new VtesEngine(state, testRegistry);
    enterCombat(engine);
    drainToPressAndMutate(engine,{acting:0, opposing:1});
    runUntil(engine, dp=>dp.window==="combat.endOfRound" && dp.seat==="Alice");
    choose(engine, "play:Street Cred:basic");
    // drain asPlayed
    for(let i=0;i<20;i++){ const d=engine.decision(); if(!d) break; if(d.window==="choice") break; const p=d.options.find(o=>o.id==="pass"); if(p) engine.choose(p.id); else break; }
    const ch = engine.decision()!;
    expect(ch.window).toBe("choice");
    expect(ch.options.length).toBe(2);
    engine.choose(ch.options.find(o=>o.id.includes("u2"))!.id);
    // drain remaining passes
    for(let i=0;i<20;i++){ const d=engine.decision(); if(!d) break; if(d.window==="combat.endOfRound") break; const p=d.options.find(o=>o.id==="pass"); if(p) engine.choose(p.id); else break; }
    expect(state.seats[0]!.uncontrolled.find(u=>u.card.id==="u2")!.counters).toBe(1);
  });
  it("is gated by onlyAfterInflictedMore — not offered when damage was equal", ()=>{
    const { engine } = freshState(6);
    enterCombat(engine);
    drainToPressAndMutate(engine, { acting:1, opposing:1 });
    const dp = runUntil(engine, dp=>dp.window==="combat.endOfRound" && dp.seat==="Alice");
    expect(dp.options.some(o=>o.id.includes("Street Cred"))).toBe(false);
  });
  it("also gated when the vampire took more than it inflicted", ()=>{
    const { engine } = freshState(6);
    enterCombat(engine);
    drainToPressAndMutate(engine, { acting:2, opposing:1 });
    const dp = runUntil(engine, dp=>dp.window==="combat.endOfRound" && dp.seat==="Alice");
    expect(dp.options.some(o=>o.id.includes("Street Cred"))).toBe(false);
  });
  it("oncePerTurnPerVampire — stamped into playedSinceUnlock", ()=>{
    const { state, engine } = freshState(6);
    enterCombat(engine);
    drainToPressAndMutate(engine,{acting:0, opposing:2});
    runUntil(engine, dp=>dp.window==="combat.endOfRound" && dp.seat==="Alice");
    choose(engine,"play:Street Cred:basic");
    drainCombatToEnd(state, engine);
    const v1b:any = state.seats[0]!.minions[0]!;
    expect(v1b.playedSinceUnlock).toContain("Street Cred");
  });
});
