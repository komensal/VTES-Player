/**
 * Crimson Fury (100447) — "Only usable when this vampire is being diablerized.
 * Usable by a locked vampire. Usable by a vampire in torpor.
 * [ani] The diablerie is canceled and the diablerist burns 1 blood.
 * [ANI] Burn both the diablerist and this vampire. (The diablerie is still considered successful.)"
 *
 * The card is a diablerie-interrupt, not a combat strike, so the previous
 * spec printing two damage strikes is the "spec describes a different card" defect.
 */
import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeMinion, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function gameWithVictim(opts: { victimBlood?: number; victimLocked?: boolean; victimDisc?: "basic" | "superior" } = {}) {
  const state = threeSeatGame();
  const v1 = state.seats[0]!.minions[0]!;
  Object.assign(v1, { capacity: 6, blood: 4, disciplines: { ani: "basic" } });
  const w = state.seats[1]!.minions.find((m) => m.id === "W")!;
  Object.assign(w, {
    inTorpor: true,
    blood: opts.victimBlood ?? 2,
    capacity: 3,
    disciplines: { ani: opts.victimDisc ?? "basic" },
    locked: opts.victimLocked ?? false,
  });
  const n = state.seats[2]!.minions[0]!;
  Object.assign(n, { title: "prince" });
  return { state, engine: new VtesEngine(state, testRegistry), v1, w };
}

function driveToEnd(engine: VtesEngine, state: any, take?: string) {
  for (let i = 0; i < 120; i++) {
    if (state.frames.every((f: any) => f.kind === "turn")) break;
    const dp = engine.decision();
    if (!dp) break;
    const wanted = take ? dp.options.find((o: any) => o.id.includes(take)) : undefined;
    if (wanted) {
      engine.choose(wanted.id);
      continue;
    }
    const pick =
      dp.options.find((o: any) => o.id.endsWith(":for")) ??
      dp.options.find((o: any) => o.id === "pass") ??
      dp.options.find((o: any) => o.id === "end") ??
      dp.options[0];
    if (!pick) break;
    engine.choose(pick.id);
  }
}

describe("Crimson Fury (100447)", () => {
  it("[ani] cancels the diablerie and the diablerist burns 1 blood", () => {
    const { state, engine } = gameWithVictim({ victimBlood: 2, victimDisc: "basic" });
    state.seats[1]!.hand.push({ id: "cf", name: "Crimson Fury" });
    engine.choose("diablerize:V1:W");
    driveToEnd(engine, state, "Crimson Fury:basic");
    // Victim paid 1 blood (cost) + diablerist burned 1
    expect(state.eventLog.some((e: any) => e.type === "DiablerieCommitted")).toBe(false);
    expect(state.eventLog.filter((e: any) => e.type === "BloodBurned" && e.minion === "V1").length).toBe(1);
    expect(state.eventLog.filter((e: any) => e.type === "BloodBurned" && e.minion === "W").length).toBe(1);
    // Both still in play (victim not burned, no blood hunt)
    expect(state.seats[1]!.minions.some((m: any) => m.id === "W")).toBe(true);
    expect(state.seats[0]!.minions.some((m: any) => m.id === "V1")).toBe(true);
    expect(state.eventLog.some((e: any) => e.type === "BloodHuntCalled")).toBe(false);
  });

  it("[ANI] burns both but the diablerie is still considered successful", () => {
    const { state, engine } = gameWithVictim({ victimBlood: 2, victimDisc: "superior" });
    state.seats[1]!.hand.push({ id: "cf", name: "Crimson Fury" });
    engine.choose("diablerize:V1:W");
    driveToEnd(engine, state, "Crimson Fury:superior");
    expect(state.eventLog.some((e: any) => e.type === "DiablerieCommitted" && e.victim === "W")).toBe(true);
    expect(state.seats[1]!.minions.some((m: any) => m.id === "W")).toBe(false);
    expect(state.seats[0]!.minions.some((m: any) => m.id === "V1")).toBe(false);
    expect(state.eventLog.some((e: any) => e.type === "MinionBurned" && e.minion === "W")).toBe(true);
    expect(state.eventLog.some((e: any) => e.type === "MinionBurned" && e.minion === "V1")).toBe(true);
  });

  it("is usable by a locked vampire in torpor", () => {
    const { state, engine } = gameWithVictim({ victimBlood: 2, victimDisc: "basic", victimLocked: true });
    const w = state.seats[1]!.minions.find((m) => m.id === "W")!;
    expect(w.locked).toBe(true);
    expect(w.inTorpor).toBe(true);
    state.seats[1]!.hand.push({ id: "cf", name: "Crimson Fury" });
    engine.choose("diablerize:V1:W");
    // Drive to the interrupt window and check option exists
    for (let i = 0; i < 30; i++) {
      const dp = engine.decision();
      if (!dp) break;
      if (dp.window === "diablerie.beingDiablerized") {
        expect(dp.options.some((o) => o.id.includes("Crimson Fury"))).toBe(true);
        return;
      }
      const p = dp.options.find((o) => o.id === "pass");
      if (p) engine.choose(p.id);
      else break;
    }
    throw new Error("diablerie.beingDiablerized window not reached");
  });

  it("offers both levels when the victim has superior", () => {
    const { state, engine } = gameWithVictim({ victimDisc: "superior" });
    state.seats[1]!.hand.push({ id: "cf", name: "Crimson Fury" });
    engine.choose("diablerize:V1:W");
    for (let i = 0; i < 30; i++) {
      const dp = engine.decision();
      if (!dp) break;
      if (dp.window === "diablerie.beingDiablerized") {
        expect(dp.options.some((o) => o.id.includes("Crimson Fury:basic"))).toBe(true);
        expect(dp.options.some((o) => o.id.includes("Crimson Fury:superior"))).toBe(true);
        return;
      }
      const p = dp.options.find((o) => o.id === "pass");
      if (p) engine.choose(p.id);
    }
    throw new Error("window not reached");
  });

  it("not offered outside diablerie (e.g. in combat)", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { ani: "superior" };
    v1.blood = 5;
    const m = state.seats[1]!.minions.find((x) => x.id === "M")!;
    state.seats[0]!.hand.push({ id: "cf", name: "Crimson Fury" });
    const engine = new VtesEngine(state, testRegistry);
    // Start a bleed and block to enter combat
    engine.choose("bleed:V1");
    for (let i = 0; i < 20; i++) {
      const dp = engine.decision();
      if (!dp) break;
      if (dp.window === "action.effects" && dp.options.some((o) => o.id === "block:M")) {
        engine.choose("block:M");
        break;
      }
      const p = dp.options.find((o) => o.id === "pass");
      if (p) engine.choose(p.id);
    }
    // Drain to combat
    for (let i = 0; i < 30; i++) {
      const dp = engine.decision();
      if (!dp) break;
      if (dp.window.startsWith("combat.")) {
        expect(dp.options.some((o) => o.id.includes("Crimson Fury"))).toBe(false);
        return;
      }
      const p = dp.options.find((o) => o.id === "pass");
      if (p) engine.choose(p.id);
    }
  });

  it("not offered if the victim lacks the discipline", () => {
    const { state, engine } = gameWithVictim({ victimDisc: "basic" });
    // Victim has no ani
    const w = state.seats[1]!.minions.find((m) => m.id === "W")!;
    w.disciplines = {};
    state.seats[1]!.hand.push({ id: "cf", name: "Crimson Fury" });
    engine.choose("diablerize:V1:W");
    for (let i = 0; i < 30; i++) {
      const dp = engine.decision();
      if (!dp) break;
      if (dp.window === "diablerie.beingDiablerized") {
        expect(dp.options.some((o) => o.id.includes("Crimson Fury"))).toBe(false);
        return;
      }
      const p = dp.options.find((o) => o.id === "pass");
      if (p) engine.choose(p.id);
      else break;
    }
    // If window never opened, it means no options (which also means not offered)
    expect(state.eventLog.some((e: any) => e.type === "DiablerieCommitted")).toBe(true);
  });
});
