import { describe, it, expect } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { threeSeatGame, testRegistry } from "../engine/fixtures.ts";
import type { GameState } from "../../src/engine/index.ts";

function find(state: GameState, id: string) { return state.seats.flatMap(s=>s.minions).find(x=>x.id===id)!; }

describe("Penitent Resilience", () => {
  it("ma 3 tryby: [for] round, [for][obe] combat-long i [FOR][OBE] actionModifier", async () => {
    const { cardSpecs } = await import("../../src/cards/effects/cards.ts");
    const spec = (cardSpecs as any[]).find((c:any)=>c.name==="Penitent Resilience");
    expect(spec.cardType).toBe("modifierOrCombat");
    expect(spec.modes.length).toBe(3);
    expect(spec.modes[0].effects.some((e:any)=>e.kind==="treatAggravatedAsNormal")).toBe(true);
    expect(spec.modes[2].effects[0].kind).toBe("blockRestriction");
  });
});

describe("Rigor Mortis", () => {
  it("wymaga beforeRange i blokuje additional strikes", async () => {
    const { cardSpecs } = await import("../../src/cards/effects/cards.ts");
    const spec = (cardSpecs as any[]).find((c:any)=>c.name==="Rigor Mortis");
    expect(spec.usable).toContain("onlyBeforeRange");
    expect(spec.combatLimit).toBe("round");
    const pre = spec.modes.find((m:any)=>m.discipline==="pre");
    expect(pre.effects.some((e:any)=>e.kind==="barOpponentAdditionalStrikes")).toBe(true);
    const thnSup = spec.modes.find((m:any)=>m.level==="superior");
    expect(thnSup.effects.some((e:any)=>e.kind==="cancelOpposingManeuverOncePerRound")).toBe(true);
  });
  it("jest oferowany przed range, nie w press step", async () => {
    const state = threeSeatGame();
    const v1 = find(state, "V1");
    Object.assign(v1, { capacity: 6, disciplines: { pre: "basic" } });
    state.seats[0]!.hand.push({ id: "rigor", name: "Rigor Mortis" });
    const engine = new VtesEngine(state, testRegistry);
    engine.choose("bleed:V1");
    for(let i=0;i<20;i++){ const d=engine.decision(); if(!d) break;
      if(d.window==="action.effects" && d.options.some(o=>o.id==="block:M")){ engine.choose("block:M"); break;}
      engine.choose(d.options.find(o=>o.id==="pass")!.id);
    }
    let offeredBeforeRange=false;
    for(let i=0;i<40;i++){ const d=engine.decision(); if(!d) break;
      if(d.window==="combat.beforeRange" && d.options.some(o=>o.id.includes("Rigor Mortis"))) offeredBeforeRange=true;
      const p=d.options.find(o=>o.id==="pass"); if(p) engine.choose(p.id); else break;
    }
    expect(offeredBeforeRange).toBe(true);
  });
});

describe("Scourge of Alecto", () => {
  it("wymaga obu dyscyplin, ma Frenzy i cap 4", async () => {
    const { cardSpecs } = await import("../../src/cards/effects/cards.ts");
    const spec = (cardSpecs as any[]).find((c:any)=>c.name==="Scourge of Alecto");
    expect(spec.frenzy).toBe(true);
    const basic = spec.modes.find((m:any)=>m.level==="basic");
    expect(basic.discipline).toEqual({ all: ["cel","pre"] });
    expect(basic.effects[0].capDamage).toBe(4);
    const sup = spec.modes.find((m:any)=>m.level==="superior");
    expect(sup.effects.some((e:any)=>e.kind==="maneuver")).toBe(true);
  });
});

describe("Sympathetic Agony", () => {
  it("bar jest warunkowy na obrażenia, superior blokuje też additional", async () => {
    const { cardSpecs } = await import("../../src/cards/effects/cards.ts");
    const spec = (cardSpecs as any[]).find((c:any)=>c.name==="Sympathetic Agony");
    const basic = spec.modes.find((m:any)=>m.level==="basic");
    expect(basic.effects[0].kind).toBe("barPressIfDamaged");
    expect(basic.effects[0].additionalStrikes).toBe(false);
    const sup = spec.modes.find((m:any)=>m.level==="superior");
    expect(sup.effects[0].additionalStrikes).toBe(true);
  });
});

describe("Telepathic Tracking", () => {
  it("basic daje press + maneuver dopiero w następnej rundzie", async () => {
    const { cardSpecs } = await import("../../src/cards/effects/cards.ts");
    const spec = (cardSpecs as any[]).find((c:any)=>c.name==="Telepathic Tracking");
    const basic = spec.modes.find((m:any)=>m.level==="basic");
    expect(basic.effects.some((e:any)=>e.kind==="press" && e.continueOnly)).toBe(true);
    expect(basic.effects.some((e:any)=>e.kind==="maneuverNextRound")).toBe(true);
    expect(basic.effects.some((e:any)=>e.kind==="combatCredits")).toBe(false);
    const sup = spec.modes.find((m:any)=>m.level==="superior");
    expect(sup.effects[0].kind).toBe("startNewRound");
    expect(sup.usable).toContain("onlyIfCombatWouldEnd");
  });
});
