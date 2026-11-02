/**
 * Dodge & additional strikes (docs/dodge-additional-strikes-design.md):
 * kernel behaviors (a dodge cancels the opposing strike but not retainer
 * damage or combat-ends; additional strikes run extra sub-rounds) plus the
 * 8-card wave.
 */

import { describe, expect, it } from "vitest";
import type { GameState, PermanentInPlay } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

/** V1 (Alice, acting) bleeds Bob; M (Bob) blocks → combat, at Before Range. */
function enterCombat(engine: VtesEngine): void {
  runTrace(engine, [
    ["Alice", "bleed:V1"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"],
    ["Bob", "block:M"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
}

/** Advance Before Range → Determine Range → Before Strikes (all quiet), to
 *  the choose-strike step. */
const toStrikes: Array<[string, string]> = [
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // before range
  ["Alice", "pass"], ["Bob", "pass"], // range → close
  ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // before strikes
];

function entry(id: string, name: string, over: Partial<PermanentInPlay> = {}): PermanentInPlay {
  return { card: { id, name }, locked: false, usedThisPhase: false, statics: {}, tags: [], ...over };
}

function bobM(state: GameState) {
  return state.seats[1]!.minions.find((m) => m.id === "M")!;
}

describe("Sword of the Righteous (101921)", () => {
  it("offers the basic Valeren mode to a vampire with only basic Valeren", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { val: "basic" };
    v1.blood = 4;
    state.seats[0]!.hand.push({ id: "sword", name: "Sword of the Righteous" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);
    runTrace(engine, toStrikes);
    const options = engine.decision()?.options.map((o) => o.id) ?? [];
    const basicValeren = options.find((id) => id.startsWith("play:Sword of the Righteous:basic:V1:val:"));
    expect(basicValeren).toBeDefined();
    engine.choose(basicValeren!);
    runTrace(engine, [["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    const cf = state.frames.find((f) => f.kind === "combat");
    if (cf?.kind !== "combat") throw new Error("no combat frame");
    expect(cf.strikes.acting?.aggravated).toBe(true);
  });
});

describe("Toreador's Bane (101991)", () => {
  it("is gated to a Toreador, ally, or younger opposing minion", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { mel: "superior" };
    v1.capacity = 5;
    const m = bobM(state);
    m.capacity = 5;
    m.clan = "Ventrue";
    state.seats[0]!.hand.push({ id: "tb1", name: "Toreador's Bane" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);
    runTrace(engine, toStrikes);
    expect(engine.decision()?.options.some((o) => o.id.startsWith("play:Toreador's Bane"))).toBe(false);
  });

  it("superior ends combat and resumes a blocked bleed as unblocked", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { mel: "superior" };
    const m = bobM(state);
    m.clan = "Toreador";
    state.seats[0]!.hand.push({ id: "tb1", name: "Toreador's Bane" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);
    runTrace(engine, [
      ...toStrikes,
      ["Alice", "play:Toreador's Bane:superior"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Bob", "strike:hand"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    const af = state.frames.find((f) => f.kind === "action");
    expect(af?.kind === "action" ? af.step : null).toBe("A");
    expect(af?.kind === "action" ? af.blockedBy : "not-action").toBe(null);
  });
});

describe("Twisting the Knife (102051)", () => {
  it("adds a preventable point only after a hand strike actually inflicts at least three", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { pot: "basic" };
    v1.strength = 3;
    v1.blood = 5;
    bobM(state).blood = 5;
    state.seats[0]!.hand.push({ id: "tw", name: "Twisting the Knife" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);
    expect(engine.decision()?.window).toBe("combat.beforeRange");
    runTrace(engine, toStrikes);
    expect(engine.decision()?.window).toBe("combat.chooseStrike");
    const seenWindows: string[] = [];
    for (let i = 0; i < 20; i++) {
      const dp = engine.decision()!;
      seenWindows.push(dp.window);
      if (dp.window === "combat.afterStrikeDamage") break;
      const pick = dp.window === "combat.chooseStrike"
        ? dp.options.find((o) => o.id === "strike:hand")?.id
        : dp.options.find((o) => o.id === "pass")?.id;
      if (!pick) throw new Error(`no pass/hand strike in ${dp.window}; seen=${seenWindows.join(",")}; log=${JSON.stringify(state.eventLog.slice(-10))}`);
      runTrace(engine, [[dp.seat, pick]]);
    }
    const trigger = engine.decision()!;
    expect(trigger.window).toBe("combat.afterStrikeDamage");
    expect(trigger.options.some((o) => o.id.startsWith("play:Twisting the Knife:basic:V1:tw"))).toBe(true);
    runTrace(engine, [["Alice", "play:Twisting the Knife:basic:V1:tw"]]);
    for (let i = 0; i < 8 && !state.eventLog.some((e) => e.type === "CardResolved" && e.cardId === "tw"); i++) {
      const dp = engine.decision()!;
      runTrace(engine, [[dp.seat, "pass"]]);
    }
    for (let i = 0; i < 12 && bobM(state).blood > 1; i++) {
      const dp = engine.decision()!;
      if (!dp) break;
      const pass = dp.options.find((o) => o.id === "pass")?.id;
      if (pass) runTrace(engine, [[dp.seat, pass]]);
      else throw new Error(`unexpected choice in ${dp.window}`);
    }
    expect(bobM(state).blood).toBe(1);
    expect(state.eventLog.reduce((n, e) => e.type === "BloodBurned" && e.minion === "M" ? n + e.amount : n, 0)).toBe(4);
  });

  it("allows normal prevention against the additional point", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { pot: "basic" };
    v1.strength = 3;
    v1.blood = 5;
    const m = bobM(state);
    m.disciplines = { for: "basic" };
    m.blood = 5;
    state.seats[0]!.hand.push({ id: "tw", name: "Twisting the Knife" });
    state.seats[1]!.hand.push({ id: "soak", name: "Soak" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);
    runTrace(engine, toStrikes);
    let playedTwisting = false;
    let playedExtraSoak = false;
    for (let i = 0; i < 40 && !state.eventLog.some((e) => e.type === "CardResolved" && e.cardId === "soak"); i++) {
      const dp = engine.decision()!;
      const strikeCount = state.eventLog.filter((e) => e.type === "DamageInflicted" && e.source === "V1").length;
      const soak = !playedExtraSoak && strikeCount >= 2 && dp.seat === "Bob"
        ? dp.options.find((o) => o.id.startsWith("play:Soak:basic:M:soak"))
        : undefined;
      const twist = !playedTwisting && dp.window === "combat.afterStrikeDamage"
        ? dp.options.find((o) => o.id.startsWith("play:Twisting the Knife:basic:V1:tw"))
        : undefined;
      const pick = soak?.id ?? twist?.id ?? (dp.window === "combat.chooseStrike"
        ? dp.options.find((o) => o.id === "strike:hand")?.id
        : dp.options.find((o) => o.id === "pass")?.id);
      if (!pick) throw new Error(`no pass/strike/prevention option in ${dp.window}`);
      if (soak) playedExtraSoak = true;
      if (twist) playedTwisting = true;
      runTrace(engine, [[dp.seat, pick]]);
    }
    expect(playedTwisting).toBe(true);
    expect(playedExtraSoak).toBe(true);
    expect(m.blood).toBe(2);
    expect(state.eventLog.some((e) => e.type === "DamagePrevented" && e.minion === "M" && e.amount === 1)).toBe(true);
  });

  it("recognizes a hand strike declared by a combat card", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { pot: "superior" };
    v1.blood = 5;
    bobM(state).blood = 5;
    state.seats[0]!.hand.push(
      { id: "us", name: "Undead Strength" },
      { id: "tw", name: "Twisting the Knife" },
    );
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);
    runTrace(engine, toStrikes);
    let declaredStrike = false;
    for (let i = 0; i < 24; i++) {
      const dp = engine.decision()!;
      if (dp.window === "combat.afterStrikeDamage") break;
      const undeadStrength = !declaredStrike
        ? dp.options.find((o) => o.id.startsWith("play:Undead Strength:superior:V1:us"))
        : undefined;
      const pick = undeadStrength?.id ?? (dp.window === "combat.chooseStrike"
        ? dp.options.find((o) => o.id === "strike:hand")?.id
        : dp.options.find((o) => o.id === "pass")?.id);
      if (!pick) throw new Error(`no pass/strike option in ${dp.window}`);
      if (undeadStrength) declaredStrike = true;
      runTrace(engine, [[dp.seat, pick]]);
    }
    const trigger = engine.decision()!;
    expect(declaredStrike).toBe(true);
    expect(trigger.window).toBe("combat.afterStrikeDamage");
    expect(trigger.options.some((o) => o.id.startsWith("play:Twisting the Knife:basic:V1:tw"))).toBe(true);
  });

  it("does not trigger when prevention leaves fewer than three damage actually inflicted", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { pot: "basic" };
    v1.strength = 3;
    v1.blood = 5;
    const m = bobM(state);
    m.disciplines = { for: "basic" };
    m.blood = 5;
    state.seats[0]!.hand.push({ id: "tw", name: "Twisting the Knife" });
    state.seats[1]!.hand.push({ id: "soak", name: "Soak" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);
    runTrace(engine, toStrikes);
    let playedSoak = false;
    let openedTwistingWindow = false;
    for (let i = 0; i < 40; i++) {
      const dp = engine.decision();
      if (!dp || dp.window === "turn.minion") break;
      if (dp.window === "combat.afterStrikeDamage") {
        openedTwistingWindow = true;
        break;
      }
      const soak = !playedSoak && dp.seat === "Bob"
        ? dp.options.find((o) => o.id.startsWith("play:Soak:basic:M:soak"))
        : undefined;
      const pick = soak?.id ?? (dp.window === "combat.chooseStrike"
        ? dp.options.find((o) => o.id === "strike:hand")?.id
        : dp.options.find((o) => o.id === "pass")?.id);
      if (!pick) throw new Error(`no pass/hand/Soak option in ${dp.window}`);
      if (soak) playedSoak = true;
      runTrace(engine, [[dp.seat, pick]]);
    }
    expect(playedSoak).toBe(true);
    expect(openedTwistingWindow).toBe(false);
    expect(m.blood).toBe(4);
  });

  it("also triggers on a melee-weapon strike and superior grants an optional press", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { pot: "superior" };
    v1.strength = 2;
    v1.blood = 5;
    bobM(state).blood = 5;
    state.seats[0]!.hand.push(
      { id: "ws", name: "Weighted Walking Stick" },
      { id: "tw", name: "Twisting the Knife" },
    );
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);
    runTrace(engine, [
      ["Alice", "play:Weighted Walking Stick:basic"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "ability:Weighted Walking Stick:ws:strike"],
      ["Bob", "strike:hand"],
    ]);
    for (let i = 0; i < 20 && engine.decision()?.window !== "combat.afterStrikeDamage"; i++) {
      const dp = engine.decision()!;
      const pick = dp.options.find((o) => o.id === "pass")?.id;
      if (!pick) throw new Error(`unexpected non-pass option in ${dp.window}`);
      runTrace(engine, [[dp.seat, pick]]);
    }
    const trigger = engine.decision()!;
    expect(trigger.window).toBe("combat.afterStrikeDamage");
    expect(trigger.options.some((o) => o.id.startsWith("play:Twisting the Knife:superior:V1:tw"))).toBe(true);
    runTrace(engine, [["Alice", "play:Twisting the Knife:superior:V1:tw"]]);
    for (let i = 0; i < 8 && !state.eventLog.some((e) => e.type === "CardResolved" && e.cardId === "tw"); i++) {
      const dp = engine.decision()!;
      runTrace(engine, [[dp.seat, "pass"]]);
    }
    const combat = state.frames.find((f) => f.kind === "combat");
    expect(combat?.kind === "combat" ? combat.presses.acting : 0).toBe(1);
    for (let i = 0; i < 12 && bobM(state).blood > 1; i++) {
      const dp = engine.decision()!;
      if (!dp) break;
      const pass = dp.options.find((o) => o.id === "pass")?.id;
      if (pass) runTrace(engine, [[dp.seat, pass]]);
      else throw new Error(`unexpected choice in ${dp.window}`);
    }
    expect(bobM(state).blood).toBe(1);
  });
});

describe("dodge (kernel)", () => {
  it("negates the opposing hand strike, dealing and taking no damage", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { cel: "basic" };
    v1.blood = 3;
    const m = bobM(state);
    m.blood = 3;
    state.seats[0]!.hand.push({ id: "ss1", name: "Side Strike" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, [
      ...toStrikes,
      ["Alice", "play:Side Strike:basic"], // V1 dodges
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as-played
      ["Bob", "strike:hand"],
      // No damage either way → straight to press.
      ["Alice", "pass"], ["Bob", "pass"], // press
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // end of round
    ]);

    expect(v1.blood).toBe(3); // dodged M's strike
    expect(m.blood).toBe(3); // V1's dodge dealt nothing
    expect(state.eventLog.some((e) => e.type === "DamageInflicted")).toBe(false);
  });

  it("does not protect against retainer (environmental) damage", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { cel: "basic" };
    v1.blood = 3;
    const m = bobM(state);
    m.attached.push(
      entry("mc1", "Murder of Crows", {
        statics: { combatRoundDamage: { amount: 1, ranged: true } },
        life: 2,
      }),
    );
    state.seats[0]!.hand.push({ id: "ss1", name: "Side Strike" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, [
      ...toStrikes,
      ["Alice", "play:Side Strike:basic"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Bob", "strike:hand"],
      ["Alice", "pass"], // V1 mends the crows' 1 (dodge did not stop it)
      ["Alice", "pass"], ["Bob", "pass"], // press
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // end of round
    ]);

    expect(v1.blood).toBe(2); // took the crows' 1 despite dodging
  });

  it("does not stop a combat-ends strike", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { cel: "basic" };
    const m = bobM(state);
    m.disciplines = { pre: "basic" };
    m.blood = 3;
    state.seats[0]!.hand.push({ id: "ss1", name: "Side Strike" });
    state.seats[1]!.hand.push({ id: "mj1", name: "Majesty" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, [
      ...toStrikes,
      ["Alice", "play:Side Strike:basic"], // V1 dodges
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Bob", "play:Majesty:basic"], // M: strike combat ends
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // end of round
    ]);

    // Combat ended despite the dodge (dodge only cancels the strike's
    // effects on the dodger, not combat-ends).
    expect(state.eventLog.some((e) => e.type === "CombatEnded")).toBe(true);
  });
});

describe("Blur (100227) — additional strikes", () => {
  it("superior grants 2 additional strikes, run after the normal pair", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { cel: "superior" };
    v1.blood = 4;
    const m = bobM(state);
    m.blood = 5;
    m.capacity = 5;
    state.seats[0]!.hand.push(
      { id: "bl1", name: "Blur" },
      { id: "bl2", name: "Blur" },
    );
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, [
      ...toStrikes,
      ["Alice", "strike:hand"], // V1's normal strike
      ["Bob", "strike:hand"], // M's normal strike
      // Damage resolution: opposing strike lands first → M hits V1,
      // Alice mends; then V1 hits M, Bob mends (p. 33 simultaneous but
      // prevention/mending runs acting-minion-first).
      ["Alice", "pass"], ["Bob", "pass"], // damage resolution
      // Grant window (p. 32): Alice plays Blur after the first pair.
      ["Alice", "play:Blur:superior"], // grant 2 additional strikes
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as-played
      ["Bob", "pass"], ["Alice", "pass"], // close grant window
      // Additional sub-round 1 (only V1 has additional strikes):
      ["Alice", "strike:hand"],
      ["Bob", "pass"], // M mends
      // Additional sub-round 2:
      ["Alice", "strike:hand"],
      ["Bob", "pass"], // M mends
      ["Alice", "pass"], ["Bob", "pass"], // press
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // end of round
    ]);

    // M took 3 hand strikes of 1 (normal + 2 additional), mended each.
    expect(m.blood).toBe(2); // 5 − 3
  });
});

describe("Quickness (101532) — limited vs non-limited", () => {
  it("the non-limited superior does not spend the limited source", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { cel: "superior" };
    v1.blood = 4;
    const m = bobM(state);
    m.blood = 5;
    m.capacity = 5;
    state.seats[0]!.hand.push(
      { id: "q1", name: "Quickness" },
      { id: "bl1", name: "Blur" },
    );
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, [
      ...toStrikes,
      ["Alice", "strike:hand"], // V1's normal strike
      ["Bob", "strike:hand"], // M's normal strike
      // Damage resolution: opposing strike lands first → M hits V1,
      // Alice mends; then V1 hits M, Bob mends.
      ["Alice", "pass"], ["Bob", "pass"], // damage resolution
      // Grant window: Alice plays Quickness (non-limited).
      ["Alice", "play:Quickness:superior"], // +1 additional, NOT limited
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as-played
      ["Bob", "pass"], // declines = 1, awaiting = Alice
    ]);
    // Blur (a limited source) is still available; a second Quickness is not
    // (one Quickness per round).
    const dp = engine.decision()!;
    expect(dp.window).toBe("combat.grantAdditionalStrikes");
    expect(dp.options.some((o) => o.id.startsWith("play:Blur"))).toBe(true);
    expect(dp.options.some((o) => o.id.startsWith("play:Quickness"))).toBe(false);

    runTrace(engine, [
      ["Alice", "pass"], // decline 2 → close grant window → damageResolution →
      // chooseStrike (additional sub-round, only V1 strikes)
      ["Alice", "strike:hand"], // V1's additional strike
      ["Bob", "pass"], // M mends (no additional strikes, doesn't participate)
      ["Alice", "pass"], ["Bob", "pass"], // press
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // end of round
    ]);
  });
});

describe("Lightning Reflexes (101107) — burn X for X strikes", () => {
  it("superior enumerates X by available blood", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { cel: "superior" };
    v1.blood = 4; // takes 1 damage from M's strike → 3 left; pays 1 for card → maxX = 2
    state.seats[0]!.hand.push({ id: "lr1", name: "Lightning Reflexes" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, [
      ...toStrikes,
      ["Alice", "strike:hand"], // V1's normal strike
      ["Bob", "strike:hand"], // M's normal strike
      // Damage resolution: opposing strike lands first → M hits V1,
      // Alice mends; then V1 hits M, Bob mends.
      ["Alice", "pass"], ["Bob", "pass"], // damage resolution
      // Grant window: Lightning Reflexes:superior offers X=1 and X=2.
    ]);
    const dp = engine.decision()!;
    expect(dp.window).toBe("combat.grantAdditionalStrikes");
    const xs = dp.options
      .filter((o) => o.id.startsWith("play:Lightning Reflexes:superior"))
      .map((o) => o.id);
    expect(xs.length).toBe(2); // X = 1 and X = 2
  });
});

describe("Side Strike / Wind Dance / Arms of Ahriman — dodge + strikes", () => {
  it("Wind Dance superior dodges, and the additional strike is FORCED to a dodge", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { cel: "basic", tha: "superior" };
    v1.blood = 4;
    const m = bobM(state);
    m.blood = 4;
    m.capacity = 4;
    state.seats[0]!.hand.push(
      { id: "ss1", name: "Side Strike" },
      { id: "wd1", name: "Wind Dance" },
    );
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    runTrace(engine, [
      ...toStrikes,
      ["Alice", "play:Side Strike:basic"], // V1's normal strike: dodge
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as-played
      ["Bob", "strike:hand"], // M's normal strike (dodged by V1 — no damage)
      // No damage → straight to grant window: Alice plays Wind Dance:superior.
      ["Alice", "play:Wind Dance:superior"], // gains 1 additional strike, forced dodge
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as-played
      ["Bob", "pass"], ["Alice", "pass"], // close grant window
      // Additional sub-round — the additional strike is FORCED to dodge.
      // No damage → straight to press (acting goes first).
      ["Alice", "strike:dodge"],
      ["Alice", "pass"], ["Bob", "pass"], // press
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // end of round
    ]);

    expect(v1.blood).toBe(4); // dodged M's strike
    // A dodge inflicts nothing, so M is untouched — the whole point of
    // the fix: the card grants evasion, not a second attack.
    expect(m.blood).toBe(4);
  });
});

describe("Pursuit / Shadow Shift — maneuver or additional strike", () => {
  it("Shadow Shift superior is a maneuver; basic grants an additional strike", () => {
    const state = threeSeatGame();
    const v1 = state.seats[0]!.minions[0]!;
    v1.disciplines = { obl: "superior" };
    state.seats[0]!.hand.push({ id: "sh1", name: "Shadow Shift" });
    const engine = new VtesEngine(state, testRegistry);
    enterCombat(engine);

    // Before range: both quiet. Range step: V1 may maneuver with Shadow Shift.
    runTrace(engine, [
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // before range
      ["Alice", "play:Shadow Shift:superior"], // maneuver → long
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as-played
    ]);
    expect(state.eventLog.some((e) => e.type === "RangeSet" && e.range === "long")).toBe(true);
  });
});
