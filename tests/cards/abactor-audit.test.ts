import { describe, expect, it } from "vitest";
import { VtesEngine, currentStealth } from "../../src/engine/index.ts";
import type { GameState, PermanentInPlay } from "../../src/engine/index.ts";
import { makeAlly, makeMinion, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function entry(id: string, name: string, statics: PermanentInPlay["statics"] = {}): PermanentInPlay {
  return { card: { id, name }, locked: false, usedThisPhase: false, statics, tags: [] };
}
function table(blood = 1) {
  const state = threeSeatGame();
  const actor = state.seats[0]!.minions[0]!;
  Object.assign(actor, { blood, capacity: 10, disciplines: { for: "basic" } });
  state.seats[0]!.hand.push({ id: "ab", name: "Abactor" });
  return { state, actor, engine: new VtesEngine(state, testRegistry) };
}
function announce(engine: VtesEngine) {
  const play = engine.decision()!.options.find((o) => o.id.startsWith("play:Abactor:") && o.id.includes(":V1:"));
  expect(play).toBeDefined();
  engine.choose(play!.id);
  while (engine.decision()?.window === "card.asPlayed") engine.choose("pass");
}
function advanceUntil(engine: VtesEngine, predicate: () => boolean, limit = 70) {
  for (let i = 0; i < limit && !predicate(); i++) {
    const dp = engine.decision();
    if (predicate()) return;
    if (!dp) throw new Error("no decision");
    const pick = dp.options.find((o) => o.id === "pass") ?? dp.options.find((o) => o.id === "strike:hand");
    if (!pick) throw new Error(`no pass or hand in ${dp.window}: ${dp.options.map((o) => o.id)}`);
    engine.choose(pick.id);
  }
  expect(predicate()).toBe(true);
}
function action(state: GameState) { return state.frames.find((f) => f.kind === "action"); }
function referendum(state: GameState) { return state.frames.find((f) => f.kind === "referendum"); }

describe("Abactor", () => {
  it("hunts at +4 and calls a blood hunt while the action is still underway", () => {
    const { state, actor, engine } = table();
    actor.attached.push(entry("bonus", "Hunt bonus", { hunt: 1 }));
    announce(engine);
    const af = action(state)!;
    expect(af.kind === "action" && af.actionKind).toBe("hunt");
    if (af.kind !== "action") throw new Error("no action");
    expect(currentStealth(state, af.actionId)).toBe(1);
    advanceUntil(engine, () => !!referendum(state));
    expect(actor.blood).toBe(7); // 1 + (1 base + 4 + 1 hunt)
    expect(action(state)).toBeDefined();
    const rf = referendum(state)!;
    expect(rf.kind === "referendum" && rf.variant).toBe("bloodHunt");
    expect(state.eventLog.some((e) => e.type === "ActionResolved")).toBe(false);
    expect(state.eventLog.some((e) => e.type === "DiablerieCommitted")).toBe(false);
  });

  it("waits until after the blood hunt to apply after-resolution damage", () => {
    const { state, actor, engine } = table();
    announce(engine);
    const af = action(state)!;
    if (af.kind !== "action") throw new Error("no action");
    // Model a previously played modifier's queued after-resolution damage.
    af.afterResolutionDamage.push({ minion: actor.id, amount: 1, aggravated: false });
    advanceUntil(engine, () => !!referendum(state));
    expect(actor.blood).toBe(6);
    advanceUntil(engine, () => !action(state));
    expect(actor.blood).toBe(5);
  });

  it("finishes the referendum before offering Freak Drive", () => {
    const { state, actor, engine } = table();
    state.seats[0]!.hand.push({ id: "fd", name: "Freak Drive" });
    announce(engine);
    advanceUntil(engine, () => !!referendum(state));
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:Freak Drive"))).toBe(false);
    advanceUntil(engine, () => engine.decision()?.options.some((o) => o.id.startsWith("play:Freak Drive")) === true);
    expect(referendum(state)).toBeUndefined();
    const option = engine.decision()!.options.find((o) => o.id.startsWith("play:Freak Drive"))!;
    engine.choose(option.id);
    advanceUntil(engine, () => !action(state));
    expect(actor.locked).toBe(false);
  });

  it("does not call a blood hunt when Masquerade Endangered prevents gaining blood", () => {
    const { state, actor, engine } = table();
    state.seats[1]!.hand.push({ id: "me", name: "Masquerade Endangered" });
    announce(engine);
    advanceUntil(engine, () => engine.decision()?.options.some((o) => o.id.startsWith("play:Masquerade Endangered")) === true);
    const opt = engine.decision()!.options.find((o) => o.id.startsWith("play:Masquerade Endangered"))!;
    engine.choose(opt.id);
    let sawReferendum = false;
    for (let i = 0; i < 60 && action(state); i++) {
      const dp = engine.decision();
      sawReferendum ||= !!referendum(state);
      if (!dp || !action(state)) break;
      const pass = dp.options.find((o) => o.id === "pass");
      if (!pass) throw new Error(`no pass in ${dp.window}`);
      engine.choose(pass.id);
    }
    expect(action(state)).toBeUndefined();
    expect(sawReferendum).toBe(false);
    expect(actor.blood).toBe(1);
  });

  it("no blood hunt can be called on a protected vampire", () => {
    const { state, actor, engine } = table();
    actor.attached.push(entry("shield", "shield", { noBloodHunt: true }));
    announce(engine);
    advanceUntil(engine, () => !action(state));
    expect(referendum(state)).toBeUndefined();
    expect(actor.blood).toBe(6);
  });

  it("does not let an ally play this hunt, and honors a ban on hunts", () => {
    const { state, actor, engine } = table();
    state.seats[0]!.minions.push(makeAlly("A1", "Alice", 3));
    let opts = engine.decision()!.options.map((o) => o.id);
    expect(opts.some((o) => o.startsWith("play:Abactor:") && o.includes(":V1:"))).toBe(true);
    expect(opts.some((o) => o.startsWith("play:Abactor:") && o.includes(":A1:"))).toBe(false);
    actor.attached.push(entry("bar", "bar", { cannotHunt: true }));
    opts = engine.decision()!.options.map((o) => o.id);
    expect(opts.some((o) => o.startsWith("play:Abactor:"))).toBe(false);
  });

  it("burns the hunter when the referendum passes and then closes the action", () => {
    const { state, engine } = table();
    state.seats[2]!.minions[0]!.title = "prince";
    state.seats[0]!.hand.push({ id: "fd", name: "Freak Drive" });
    announce(engine);
    advanceUntil(engine, () => !!referendum(state));
    let voted = false;
    for (let i = 0; i < 80 && action(state); i++) {
      const dp = engine.decision();
      if (!dp) break;
      const vote = dp.options.find((o) => o.id.startsWith("vote:") && o.id.endsWith(":for"));
      const pick = vote ?? dp.options.find((o) => o.id === "pass");
      if (!pick) throw new Error(`no vote or pass in ${dp.window}`);
      if (vote) voted = true;
      engine.choose(pick.id);
    }
    expect(voted).toBe(true);
    expect(state.eventLog.some((e) => e.type === "MinionBurned" && e.minion === "V1")).toBe(true);
    expect(action(state)).toBeUndefined();
    expect(state.seats[0]!.hand.some((c) => c.name === "Freak Drive")).toBe(true);
  });

  it("does not gain blood or call a blood hunt when blocked", () => {
    const { state, actor, engine } = table();
    const blocker = state.seats[1]!.minions.find((m) => m.id === "M")!;
    blocker.attached.push(entry("int", "intercept", { intercept: 1 }));
    announce(engine);
    advanceUntil(engine, () => engine.decision()?.options.some((o) => o.id === "block:M") === true);
    engine.choose("block:M");
    for (let i = 0; i < 100 && action(state); i++) {
      const dp = engine.decision();
      if (!dp) break;
      const pick = dp.options.find((o) => o.id === "pass") ?? dp.options.find((o) => o.id === "strike:hand");
      if (!pick) throw new Error(`no pass or hand in ${dp.window}`);
      engine.choose(pick.id);
    }
    expect(action(state)).toBeUndefined();
    expect(referendum(state)).toBeUndefined();
    expect(state.eventLog.some((e) => e.type === "ReferendumResolved")).toBe(false);
    expect(actor.blood).toBeLessThanOrEqual(1);
  });

  it("calls a blood hunt when Go-getter continues a blocked Abactor as unblocked", () => {
    const { state, actor, engine } = table(4);
    actor.clan = "Ravnos";
    actor.disciplines = { obf: "superior" };
    const blocker = state.seats[1]!.minions.find((m) => m.id === "M")!;
    blocker.strength = 0;
    blocker.attached.push(entry("int", "intercept", { intercept: 1 }));
    state.seats[0]!.hand.push({ id: "gg", name: "Go-getter" });
    announce(engine);
    advanceUntil(engine, () => engine.decision()?.options.some((o) => o.id === "block:M") === true);
    engine.choose("block:M");
    advanceUntil(engine, () => engine.decision()?.options.some((o) => o.id.startsWith("play:Go-getter:superior")) === true);
    engine.choose(engine.decision()!.options.find((o) => o.id.startsWith("play:Go-getter:superior"))!.id);
    advanceUntil(engine, () => !!referendum(state));
    expect(state.eventLog.some((e) => e.type === "ActionContinued")).toBe(true);
    expect(actor.blood).toBe(8); // 4 - 1 for Go-getter + 5 from Abactor
    expect(action(state)).toBeDefined();
  });

  it("offers a bloodless vampire the hunt instead of allowing another minion to act", () => {
    const { state, engine } = table(0);
    state.seats[0]!.minions.push(makeMinion("V2", "Alice", { blood: 2 }));
    const opts = engine.decision()!.options.map((o) => o.id);
    expect(opts.some((o) => o.startsWith("play:Abactor:") && o.includes(":V1:"))).toBe(true);
    expect(opts).not.toContain("bleed:V2");
  });
});
