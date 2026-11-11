import { describe, expect, it } from "vitest";
import registry from "../../src/cards/registry.json";
import { VtesEngine, hasFlight, disciplinesOf, type MinionState } from "../../src/engine/index.ts";
import { hasStandaloneCryptTrait, importCryptCard } from "../../src/ui/cardinfo.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { runTrace, testRegistry } from "../engine/fixtures.ts";

const flightIds = [200039, 200257, 200264, 200269, 200296, 200385, 200433, 200464, 200465, 200467, 200486, 200541, 200563, 200783, 200883, 200901, 201071, 201130, 201136, 201194, 201211, 201249, 201279, 201393, 201400, 201436];
const deck = (seat: string, id: number): SnapshotDeck => ({
  seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 0 }],
  crypt: [{ id }], library: [], pool: 20,
});
function game(alice: number, bob: number) {
  const state = buildGame({ decks: [deck("Alice", alice), deck("Bob", bob), deck("Carol", 201783)], seed: 1, maxTurns: 40 });
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("missing turn");
  turn.phase = "minion";
  return state;
}
function grantFlight(m: MinionState) {
  m.attached.push({ card: { id: "wings", name: "test wings" }, locked: false, usedThisPhase: false, statics: { grantsFlight: true }, tags: [] });
}
function walkTo(engine: VtesEngine, window: string, max = 30): string[] {
  for (let i = 0; i < max; i++) {
    const dp = engine.decision();
    if (!dp) break;
    if (dp.window === window) return dp.options.map((o) => o.id);
    const pass = dp.options.find((o) => o.id === "pass");
    if (!pass) throw new Error(`cannot walk from ${dp.window}: ${dp.options.map((o) => o.id)}`);
    engine.choose(pass.id);
  }
  throw new Error(`did not reach ${window}`);
}
function beginCombat(state: ReturnType<typeof game>): VtesEngine {
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [
    ["Alice", "bleed:Alice-v0"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ["Alice", "pass"], ["Bob", "block:Bob-v0"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
  return engine;
}

describe("printed and granted flight", () => {
  it("imports exactly the 26 standalone traits and preserves them through all crypt zones", () => {
    const crypt = Object.values(registry.entries).map((e) => e.card).filter((c) => c.kind === "crypt");
    expect(crypt.filter((c) => importCryptCard(c.id).flight).map((c) => c.id).sort((a, b) => a - b)).toEqual(flightIds);
    for (const id of flightIds) {
      const seat = game(id, 200067).seats[0]!;
      expect(hasFlight(seat.minions[0]!), `${id} ready`).toBe(true);
      expect(hasFlight(seat.uncontrolled[0]!.card), `${id} uncontrolled`).toBe(true);
      expect(hasFlight(seat.crypt[0]!), `${id} crypt`).toBe(true);
    }
    expect(hasStandaloneCryptTrait("Sabbat: Flight [FLIGHT].", "flight")).toBe(true);
    expect(hasStandaloneCryptTrait("Sabbat: Other minions with flight [FLIGHT] get +1 bleed.", "flight")).toBe(false);
    expect(hasStandaloneCryptTrait("Sabbat: Gain flight [FLIGHT] during combat.", "flight")).toBe(false);
  });

  it("makes Flight modes available for printed and granted flight without inventing a Discipline", () => {
    const printed = game(200563, 200067).seats[0]!.minions[0]!;
    const plain = game(200067, 200132).seats[0]!.minions[0]!;
    const roll = testRegistry["Roll"]!;
    expect(roll.modesPlayableBy!(plain)).toEqual([]);
    plain.attached.push({ card: { id: "animal", name: "flying retainer" }, locked: false, usedThisPhase: false, statics: {}, tags: ["retainer", "flight"] });
    expect(hasFlight(plain)).toBe(false); // Flight on the retainer is not a grant to its employer.
    expect(roll.modesPlayableBy!(plain)).toEqual([]);
    expect(roll.modesPlayableBy!(printed)).toContain("basic");
    expect(disciplinesOf(printed)["flight"]).toBeUndefined();
    grantFlight(plain);
    expect(roll.modesPlayableBy!(plain)).toContain("basic");
    plain.attached = plain.attached.filter((p) => p.card.id !== "wings");
    expect(roll.modesPlayableBy!(plain)).toEqual([]);
  });

  it.each(["printed", "granted"])("Patrol plays with %s flight when intercept is needed", (kind) => {
    function atBlock(withFlight: boolean) {
      const state = game(200067, kind === "printed" && withFlight ? 200563 : 200132);
      state.seats[0]!.minions[0]!.blood = 2;
      if (withFlight && kind === "granted") grantFlight(state.seats[1]!.minions[0]!);
      state.seats[1]!.hand.push({ id: "patrol", name: "Patrol" });
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [
        ["Alice", "hunt:Alice-v0"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "block:Bob-v0"], ["Alice", "pass"],
      ]);
      expect(engine.decision()?.seat).toBe("Bob");
      return { state, engine };
    }
    const noFlight = atBlock(false);
    expect(noFlight.engine.decision()!.options.some((o) => o.id.startsWith("play:Patrol"))).toBe(false);
    const flying = atBlock(true);
    const option = flying.engine.decision()!.options.find((o) => o.id.startsWith("play:Patrol"));
    expect(option).toBeDefined();
    flying.engine.choose(option!.id);
    for (let i = 0; i < 6 && flying.engine.decision()?.window === "card.asPlayed"; i++) flying.engine.choose("pass");
    expect(flying.state.eventLog.some((e) => e.type === "InterceptModified" && e.delta === 1 && e.source === "Patrol")).toBe(true);
  });

  it("Earthshock is barred against printed flight and allowed without it", () => {
    function options(foe: number): string[] {
      const state = game(200067, foe);
      state.seats[0]!.minions[0]!.disciplines.pot = "basic";
      state.seats[0]!.hand.push({ id: "earth", name: "Earthshock" });
      return walkTo(beginCombat(state), "combat.chooseStrike");
    }
    const normal = options(200132);
    const flying = options(200563);
    expect(normal.some((o) => o.startsWith("play:Earthshock"))).toBe(true);
    expect(flying).toContain("strike:hand");
    expect(flying.some((o) => o.startsWith("play:Earthshock"))).toBe(false);
  });

  it("High Ground's before-range option requires flight the opponent lacks", () => {
    function options(actor: number, foe: number): string[] {
      const state = game(actor, foe);
      state.seats[0]!.hand.push({ id: "hg", name: "High Ground" });
      return walkTo(beginCombat(state), "combat.beforeRange");
    }
    expect(options(200563, 200067).some((o) => o.startsWith("play:High Ground"))).toBe(true);
    expect(options(200067, 200132).some((o) => o.startsWith("play:High Ground"))).toBe(false);
    expect(options(200563, 200901).some((o) => o.startsWith("play:High Ground"))).toBe(false);
  });

  it.each(["printed", "granted"])("Nest of Eagles cannot answer %s flight", (kind) => {
    function options(withFlight: boolean): string[] {
      const state = game(kind === "printed" && withFlight ? 200563 : 200067, 200132);
      if (withFlight && kind === "granted") grantFlight(state.seats[0]!.minions[0]!);
      state.seats[1]!.minions[0]!.clan = "Banu Haqim"; // printed requirement
      state.seats[1]!.hand.push({ id: "nest", name: "Nest of Eagles" });
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [
        ["Alice", "bleed:Alice-v0"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
        ["Alice", "pass"],
      ]);
      expect(engine.decision()?.seat).toBe("Bob");
      return engine.decision()!.options.map((o) => o.id);
    }
    expect(options(false).some((o) => o.startsWith("play:Nest of Eagles"))).toBe(true);
    expect(options(true).some((o) => o.startsWith("play:Nest of Eagles"))).toBe(false);
  });
});
