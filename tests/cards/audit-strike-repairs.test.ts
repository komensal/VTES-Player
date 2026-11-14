import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import { currentStealth } from "../../src/engine/derived.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function combatGame(card: string, discipline: string, range: "close" | "long" = "close", round = 1, defenderCards: string[] = []) {
  const state = threeSeatGame();
  const actor = state.seats[0]!.minions[0]!;
  const foe = state.seats[1]!.minions.find((m) => m.id === "M")!;
  Object.assign(actor, { blood: 3, capacity: 8, strength: 2, disciplines: { [discipline]: "superior" } });
  Object.assign(foe, { blood: 7, capacity: 7, strength: 0, disciplines: { for: "superior", tha: "superior" } });
  state.seats[0]!.hand.push({ id: "repair", name: card });
  defenderCards.forEach((name, i) => state.seats[1]!.hand.push({ id: `def${i}`, name }));
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
  const cf = state.frames.find((f) => f.kind === "combat");
  if (!cf || cf.kind !== "combat") throw new Error("no combat");
  cf.range = range;
  cf.round = round;
  return { state, engine, actor, foe, cf };
}

function walk(engine: VtesEngine, window: string, seat = "Alice") {
  for (let i = 0; i < 40; i++) {
    const dp = engine.decision();
    if (!dp) throw new Error(`no decision before ${window}`);
    if (dp.window === window && dp.seat === seat) return dp;
    const pick = dp.options.find((o) => o.id === "pass") ?? dp.options.find((o) => o.id === "strike:hand");
    if (!pick) throw new Error(`no pass/hand at ${dp.window} for ${dp.seat}`);
    engine.choose(pick.id);
  }
  throw new Error(`did not reach ${window} for ${seat}`);
}
function play(engine: VtesEngine, name: string, mode: string, variant?: string) {
  const dp = walk(engine, "combat.chooseStrike");
  const option = dp.options.find((o) => o.id.startsWith(`play:${name}:${mode}:V1:${variant ? `${variant}:` : ""}repair`));
  expect(option, `${name} ${mode}`).toBeDefined();
  engine.choose(option!.id);
  for (let i = 0; i < 3; i++) {
    const asPlayed = engine.decision();
    if (asPlayed?.window !== "card.asPlayed") break;
    engine.choose("pass");
  }
}

describe("audited strike cards", () => {
  it.each([
    ["Shadow Parasite", "obt", "basic", 3, false, 1],
    ["Shadow Parasite", "obt", "superior", 4, false, 1],
    ["Taste of Death", "qui", "basic", 1, true, 1],
    ["Taste of Death", "qui", "superior", 2, true, 1],
    ["Torment the Soul", "nec", "basic", 1, false, 0],
    ["Torment the Soul", "nec", "superior", 1, true, 0],
    ["Starvation of Marena", "vic", "basic", 2, false, 1],
    ["Starvation of Marena", "vic", "superior", 3, false, 1],
  ] as const)("%s %s %s declares and resolves its strike", (name, discipline, mode, amount, aggravated, cost) => {
    const a = combatGame(name, discipline, "long", 2);
    play(a.engine, name, mode);
    expect(a.actor.blood).toBe(3 - cost);
    expect(a.cf.strikes.acting).toMatchObject({ name, damage: amount, ranged: true, aggravated });
    expect(a.cf.presses.acting).toBe(name === "Starvation of Marena" ? 1 : 0);
    a.engine.choose("strike:hand");
    expect(a.state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M" && e.amount === amount && e.aggravated === aggravated)).toBe(true);
  });

  it("Starvation's optional press can continue combat", () => {
    const a = combatGame("Starvation of Marena", "vic", "long");
    play(a.engine, "Starvation of Marena", "superior");
    a.engine.choose("strike:hand");
    const dp = walk(a.engine, "combat.press");
    expect(dp.options.some((o) => o.id === "press:continue")).toBe(true);
    a.engine.choose("press:continue");
    expect(a.cf.willContinue).toBe(true);
  });
  it.each([["Shadow Parasite", "obt"], ["Taste of Death", "qui"]] as const)("%s is not playable at close range", (name, discipline) => {
    const a = combatGame(name, discipline, "close");
    expect(walk(a.engine, "combat.chooseStrike").options.some((o) => o.id.startsWith(`play:${name}:`))).toBe(false);
  });
  it("Torment the Soul cannot be played in round one", () => {
    const a = combatGame("Torment the Soul", "nec", "long", 1);
    expect(walk(a.engine, "combat.chooseStrike").options.some((o) => o.id.startsWith("play:Torment the Soul:"))).toBe(false);
  });
  it.each(["basic", "superior"] as const)("Dead Hand %s deals hand damage and filters only superior prevention", (mode) => {
    const a = combatGame("Dead Hand", "nec", "close", 1, ["Soak", "Rego Motum"]);
    play(a.engine, "Dead Hand", mode);
    expect(a.cf.strikes.acting).toMatchObject({ handBonus: 1, handStrike: true });
    a.engine.choose("strike:hand");
    const dp = a.engine.decision()!;
    expect(dp.window).toBe("combat.damageResolution");
    expect(dp.options.some((o) => o.id.includes("Soak"))).toBe(mode === "basic");
    expect(dp.options.some((o) => o.id.includes("Rego Motum"))).toBe(true);
    expect(a.state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M" && e.amount === 3)).toBe(true);
  });
  it.each([["basic", 1], ["superior", 2]] as const)("Tongue %s steals %i at close range", (mode, amount) => {
    const a = combatGame("Tongue of the Serpent", "ser");
    play(a.engine, "Tongue of the Serpent", mode);
    expect(a.cf.strikes.acting).toMatchObject({ stealBlood: amount, ranged: false });
    a.engine.choose("strike:hand");
    expect(a.foe.blood).toBe(7 - amount);
    expect(a.actor.blood).toBe(3 + amount);
    expect(a.state.eventLog.some((e) => e.type === "DamageInflicted" && e.minion === "M")).toBe(false);
  });
  it("Tongue steals ally life as blood, capped by the vampire's capacity", () => {
    const a = combatGame("Tongue of the Serpent", "ser");
    Object.assign(a.foe, { kind: "ally", blood: 5 });
    a.actor.blood = 7;
    play(a.engine, "Tongue of the Serpent", "superior");
    a.engine.choose("strike:hand");
    expect(a.foe.blood).toBe(3);
    expect(a.actor.blood).toBe(8);
  });
  it("a basic-only vampire cannot play superior", () => {
    const a = combatGame("Shadow Parasite", "obt", "long");
    a.actor.disciplines = { obt: "basic" };
    const options = walk(a.engine, "combat.chooseStrike").options.map((o) => o.id);
    expect(options.some((id) => id.startsWith("play:Shadow Parasite:basic:"))).toBe(true);
    expect(options.some((id) => id.startsWith("play:Shadow Parasite:superior:"))).toBe(false);
  });
  it.each(["close", "long"] as const)("Form of the Cobra's steal is not ranged at %s", (range) => {
    const a = combatGame("Form of the Cobra", "pro", range);
    play(a.engine, "Form of the Cobra", "basic");
    expect(a.cf.strikes.acting).toMatchObject({ stealBlood: 1, ranged: false });
    a.engine.choose("strike:hand");
    expect(a.foe.blood).toBe(range === "close" ? 6 : 7);
    expect(a.actor.blood).toBe(range === "close" ? 4 : 3);
  });
  it("Tongue can be declared at long range but does not reach", () => {
    const a = combatGame("Tongue of the Serpent", "ser", "long");
    play(a.engine, "Tongue of the Serpent", "superior");
    a.engine.choose("strike:hand");
    expect(a.foe.blood).toBe(7);
    expect(a.actor.blood).toBe(3);
  });
  it.each([["Tongue of the Serpent", "ser", "close"], ["Theft of Vitae", "tha", "long"]] as const)("a dodge stops %s", (name, discipline, range) => {
    const a = combatGame(name, discipline, range, 1, ["Dodge"]);
    play(a.engine, name, "superior");
    const bob = walk(a.engine, "combat.chooseStrike", "Bob");
    const dodge = bob.options.find((o) => o.id.startsWith("play:Dodge:"));
    expect(dodge).toBeDefined();
    a.engine.choose(dodge!.id);
    for (let i = 0; i < 4 && a.engine.decision()?.window === "card.asPlayed"; i++) a.engine.choose("pass");
    expect(a.foe.blood).toBe(7);
    expect(a.actor.blood).toBe(3);
  });
});

describe("Absorb the Mind", () => {
  it("basic Mytherceria steals one blood at long range instead of dodging", () => {
    const a = combatGame("Absorb the Mind", "myt", "long");
    a.actor.disciplines.myt = "basic";
    play(a.engine, "Absorb the Mind", "basic", "myt");
    expect(a.cf.strikes.acting).toMatchObject({ stealBlood: 1, ranged: true, dodge: false });
    a.engine.choose("strike:hand");
    expect(a.foe.blood).toBe(6);
    expect(a.actor.blood).toBe(4);
  });

  it("basic Dominate dodges rather than stealing blood", () => {
    const a = combatGame("Absorb the Mind", "dom");
    a.actor.disciplines.dom = "basic";
    play(a.engine, "Absorb the Mind", "basic", "dom");
    expect(a.cf.strikes.acting).toMatchObject({ dodge: true, stealBlood: 0 });
    a.engine.choose("strike:hand");
    expect(a.foe.blood).toBe(7);
    expect(a.actor.blood).toBe(3);
  });

  it("offers distinct basic options when the vampire has both Disciplines", () => {
    const a = combatGame("Absorb the Mind", "myt", "long");
    a.actor.disciplines.dom = "basic";
    const opts = walk(a.engine, "combat.chooseStrike").options.filter((o) => o.id.startsWith("play:Absorb the Mind:"));
    expect(opts).toHaveLength(2);
    expect(new Set(opts.map((o) => o.id)).size).toBe(2);
    expect(opts.some((o) => o.id.includes(":myt"))).toBe(true);
    expect(opts.some((o) => o.id.includes(":dom"))).toBe(true);
  });

  it("the Mytherceria strike can be dodged", () => {
    const a = combatGame("Absorb the Mind", "myt", "long", 1, ["Dodge"]);
    play(a.engine, "Absorb the Mind", "basic", "myt");
    const dodge = walk(a.engine, "combat.chooseStrike", "Bob").options.find((o) => o.id.startsWith("play:Dodge:"));
    expect(dodge).toBeDefined();
    a.engine.choose(dodge!.id);
    for (let i = 0; i < 4 && a.engine.decision()?.window === "card.asPlayed"; i++) a.engine.choose("pass");
    expect(a.foe.blood).toBe(7);
    expect(a.actor.blood).toBe(3);
  });
});

describe("Shadow Play", () => {
  it.each([["basic", 1], ["superior", 2]] as const)("%s gives +%i stealth when needed", (mode, amount) => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    Object.assign(actor, { disciplines: { obt: "superior" }, blood: 3 });
    state.seats[0]!.hand.push({ id: "repair", name: "Shadow Play" });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", "bleed:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "block:M"]]);
    const dp = engine.decision()!;
    const option = dp.options.find((o) => o.id.startsWith(`play:Shadow Play:${mode}:V1:repair`));
    expect(option).toBeDefined();
    engine.choose(option!.id);
    for (let i = 0; i < 3; i++) if (engine.decision()?.window === "card.asPlayed") engine.choose("pass");
    const action = state.frames.find((f) => f.kind === "action");
    if (!action || action.kind !== "action") throw new Error("no action");
    expect(currentStealth(state, action.actionId)).toBe(amount);
    expect(actor.blood).toBe(2);
  });
});
