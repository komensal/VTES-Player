import { describe, expect, it } from "vitest";
import registry from "../../src/cards/registry.json";
import { VtesEngine, disciplinesOf, redactFor } from "../../src/engine/index.ts";
import { compileSpec } from "../../src/cards/effects/compile.ts";
import { importCryptCard, printedDisciplineUseBars } from "../../src/ui/cardinfo.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

const ids = [200037, 200038, 200618, 200793, 200891, 200988, 201044, 201067, 201274, 201331];
const deck = (seat: string, id: number): SnapshotDeck => ({
  seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 2 }],
  crypt: [{ id }], library: [], pool: 20,
});
function game(id = 201274) {
  const state = threeSeatGame();
  const built = buildGame({ decks: [deck("Alice", id), deck("Bob", 200132)], seed: 1, maxTurns: 40 });
  const actor = built.seats[0]!.minions[0]!;
  state.seats[0]!.minions = [actor];
  state.seats[0]!.hand = [{ id: "celerity", name: "Celerity" }, { id: "flurry", name: "Flurry of Action" }];
  const tf = state.frames[0]!;
  if (tf.kind !== "turn") throw new Error("no turn");
  tf.phase = "master";
  tf.masterActionsLeft = 1;
  return { state, actor };
}
function addCelerity(engine: VtesEngine, actorId: string) {
  runTrace(engine, [["Alice", `play:Celerity:-:${actorId}:celerity`], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"]]);
}
const offered = (engine: VtesEngine) => engine.decision()!.options;

describe("printed True Brujah Celerity restriction", () => {
  it("imports exactly 10 reviewed printed restrictions and does not expose hidden ones", () => {
    const crypt = Object.values(registry.entries).map((e) => e.card).filter((c) => c.kind === "crypt");
    expect(crypt.filter((c) => importCryptCard(c.id).cannotUseDisciplines.includes("cel")).map((c) => c.id).sort((a, b) => a - b)).toEqual(ids);
    for (const id of ids) {
      const seat = buildGame({ decks: [deck("Alice", id), deck("Bob", 200132)], seed: 1, maxTurns: 40 }).seats[0]!;
      expect(seat.minions[0]!.cannotUseDisciplines, `${id} ready`).toEqual(["cel"]);
      expect(seat.uncontrolled[0]!.card.cannotUseDisciplines, `${id} uncontrolled`).toEqual(["cel"]);
      expect(seat.crypt[0]!.cannotUseDisciplines, `${id} crypt`).toEqual(["cel"]);
    }
    expect(printedDisciplineUseBars("Independent: Other vampires cannot use cards requiring Celerity [cel].", "Al-Muntaquim (G4)")).toEqual([]);
    expect(printedDisciplineUseBars("Independent: He may block. [MERGED] He cannot use cards requiring Celerity [cel].", "Example (G4)")).toEqual([]);
    expect(printedDisciplineUseBars("Independent: Nu cannot use cards requiring Celerity [cel].", "Nu, The Pillar (G2)")).toEqual(["cel"]);
    const red = redactFor(buildGame({ decks: [deck("Alice", 201274), deck("Bob", 200037)], seed: 1, maxTurns: 40 }), "Alice");
    expect(red.seats[1]!.minions[0]!.cannotUseDisciplines).toEqual(["cel"]);
    expect(red.seats[1]!.uncontrolled[0]!.card.cannotUseDisciplines).toBeUndefined();
    expect(red.seats[0]!.crypt[0]!.cannotUseDisciplines).toBeUndefined();
  });

  it.each(ids)("%i may gain Celerity but cannot play a Celerity action", (id) => {
    const { state, actor } = game(id);
    const engine = new VtesEngine(state, testRegistry);
    addCelerity(engine, actor.id);
    expect(disciplinesOf(actor).cel).toBe("basic");
    expect(offered(engine).some((o) => o.kind === "playCard" && o.name === "Flurry of Action")).toBe(false);
    expect(offered(engine).some((o) => o.id === `bleed:${actor.id}`)).toBe(true);
  });

  it("a vampire without the printed restriction can use the same acquired Celerity", () => {
    const { state, actor } = game(200132);
    delete actor.disciplines.cel;
    const engine = new VtesEngine(state, testRegistry);
    addCelerity(engine, actor.id);
    expect(disciplinesOf(actor).cel).toBe("basic");
    expect(offered(engine).some((o) => o.kind === "playCard" && o.name === "Flurry of Action")).toBe(true);
  });

  it("blocks only the chosen Celerity mode of Line Brawl, not the Potence or Presence modes", () => {
    const { state, actor } = game();
    const tf = state.frames[0]!;
    if (tf.kind !== "turn") throw new Error("no turn");
    tf.phase = "minion";
    actor.sect = "anarch";
    actor.disciplines.cel = "basic";
    state.seats[0]!.hand = [{ id: "brawl", name: "Line Brawl" }];
    const engine = new VtesEngine(state, testRegistry);
    const ids = offered(engine).filter((o) => o.kind === "playCard" && o.name === "Line Brawl").map((o) => o.id);
    expect(ids.some((id) => id.includes(":steal:"))).toBe(false);
    expect(ids.some((id) => id.includes(":combat:"))).toBe(true);
    expect(ids.some((id) => id.includes(":bleed:"))).toBe(true);
    actor.cannotUseDisciplines = [];
    expect(offered(engine).some((o) => o.kind === "playCard" && o.id.includes("Line Brawl:basic:") && o.id.includes(":steal:"))).toBe(true);
  });

  it("does not confuse an alternative requirement with a combined requirement, even when other requirements are ignored", () => {
    const { actor } = game();
    actor.disciplines = { cel: "superior", for: "superior" };
    const spec = (discipline: string[] | { all: string[] }) => compileSpec({
      krcgId: 999999, name: "Test discipline mode", cardType: "actionModifier", bloodCost: 0, usable: [],
      modes: [{ level: "basic", discipline, effects: [{ kind: "modifyStealth", amount: 1 }] }],
    });
    expect(spec(["cel", "for"]).modesPlayableBy!(actor)).toEqual(["basic"]);
    expect(spec({ all: ["cel", "for"] }).modesPlayableBy!(actor)).toEqual([]);
    expect(spec({ all: ["cel", "for"] }).modesPlayableBy!(actor, true)).toEqual([]);
    // Scourge of Alecto is a real card requiring both Celerity and Presence.
    actor.disciplines.pre = "superior";
    expect(testRegistry["Scourge of Alecto"]!.modesPlayableBy!(actor)).toEqual([]);
    actor.cannotUseDisciplines = [];
    expect(testRegistry["Scourge of Alecto"]!.modesPlayableBy!(actor)).toEqual(["basic", "superior"]);
    actor.cannotUseDisciplines = ["cel"];
    expect(spec(["cel", "for"]).modesPlayableBy!(actor, true)).toEqual(["basic"]);
    delete actor.disciplines.for;
    expect(spec(["cel", "for"]).modesPlayableBy!(actor)).toEqual([]);
  });

  it.each([true, false])("Subversion can use Presence but not Celerity alone (Presence: %s)", (hasPresence) => {
    const { state, actor } = game();
    const tf = state.frames[0]!;
    if (tf.kind !== "turn") throw new Error("no turn");
    tf.phase = "minion";
    actor.disciplines = { cel: "superior", ...(hasPresence ? { pre: "superior" as const } : {}) };
    state.seats[0]!.hand = [{ id: "sub", name: "Subversion" }];
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", `bleed:${actor.id}`], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    const option = offered(engine).find((o) => o.id.startsWith("play:Subversion:superior:") && o.id.includes(":bleed:"));
    expect(Boolean(option)).toBe(hasPresence);
    if (option) {
      engine.choose(option.id);
      const bobPool = state.seats[1]!.pool;
      runTrace(engine, [["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
      expect(state.seats[1]!.pool).toBe(bobPool - 2);
    }
  });

  it.each([true, false])("Make the Misere excludes the barred rider (restricted: %s)", (restricted) => {
    const state = threeSeatGame();
    const actor = state.seats[0]!.minions[0]!;
    Object.assign(actor, { sect: "anarch", disciplines: { cel: "basic", pot: "basic" }, cannotUseDisciplines: restricted ? ["cel"] : [] });
    state.seats[1]!.minions.find((m) => m.id === "W")!.locked = true;
    state.seats[0]!.hand = [{ id: "misere", name: "Make the Misere" }];
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ["Alice", "play:Make the Misere:basic:V1:W:misere"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    const combat = state.frames.find((f) => f.kind === "combat");
    if (combat?.kind !== "combat") throw new Error("no combat");
    expect(combat.maneuverCredits.acting).toBe(restricted ? 0 : 1);
    expect(combat.strengthBonus.acting).toBe(1);
  });

  it("blocks the Celerity combat mode while leaving Potence available", () => {
    const { state, actor } = game();
    const tf = state.frames[0]!;
    if (tf.kind !== "turn") throw new Error("no turn");
    tf.phase = "minion";
    actor.sect = "anarch";
    actor.disciplines.cel = "basic";
    state.seats[0]!.hand = [{ id: "dust", name: "Dust Up" }];
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ["Alice", `bleed:${actor.id}`], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "block:M"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    let found = false;
    for (let i = 0; i < 30; i++) {
      const dp = engine.decision()!;
      if (dp.seat === "Alice" && dp.window === "combat.chooseStrike") {
        const opts = dp.options.filter((o) => o.kind === "playCard" && o.name === "Dust Up");
        expect(opts.some((o) => o.id.includes(":pot:"))).toBe(true);
        expect(opts.some((o) => o.id.includes(":cel:"))).toBe(false);
        found = true;
        break;
      }
      const choice = dp.options.find((o) => o.id === "pass") ?? dp.options.find((o) => o.id === "strike:hand");
      if (!choice) throw new Error(`unexpected ${dp.window}`);
      engine.choose(choice.id);
    }
    expect(found).toBe(true);
  });
});
