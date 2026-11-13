import { describe, expect, it } from "vitest";
import registry from "../../src/cards/registry.json";
import { cardSpecs } from "../../src/cards/effects/cards.ts";
import { meetsRequirements } from "../../src/cards/effects/compile.ts";
import { VtesEngine, currentIntercept } from "../../src/engine/index.ts";
import { importCryptCard, printedBlackHandTraits } from "../../src/ui/cardinfo.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

// Independently checked against each card's unmerged printed text.
const blackHandIds = [200038,200124,200129,200146,200165,200204,200246,200277,200287,200325,200348,200359,200371,200381,200410,200435,200449,200488,200496,200507,200560,200589,200633,200650,200667,200710,200754,200764,200766,200775,200852,200865,200919,200926,200942,201011,201013,201032,201057,201062,201066,201083,201123,201126,201166,201185,201189,201198,201247,201261,201263,201271,201296,201304,201343,201345,201354,201461,201467,201483,201485,201486,201510,201622];
const seraphIds = [200124,200165,200348,200410,200507,200650,200667,200766,201354,201485];
const deck = (seat: string, id: number): SnapshotDeck => ({ seat, ready: [{ id }], uncontrolled: [{ vampire: { id }, counters: 0 }], crypt: [{ id }], library: [], pool: 20 });
const game = (id: number) => buildGame({ decks: [deck("Alice", id), deck("Bob", 200132), deck("Carol", 201783)], seed: 1, maxTurns: 40 });

const blackHandCards = ["Black Hand Ritual", "Bloodwork", "Chronicle of the Lost Tribe", "Circumspect Revelation", "Follow the Blood", "Guarded Rubrics", "Marijava Thuggee", "Ministry", "Mustajib", "Recruitment Exercise", "Reunion Kamut", "Seraph", "The Art of Memory", "Truth in Ink", "Watch Commander"];
const seraphCards = ["Black Hand Emissary", "Council of Seraphim", "Deep Cover Agent", "Emergency Powers", "Praetorian Backer", "Seraph's Second", "Tattoo Signal", "Watchtower: Greatest Fall"];

describe("Black Hand and Seraph", () => {
  it("reads self clauses, including the historical combined wording, but not references or merged-only text", () => {
    expect(printedBlackHandTraits("Sabbat. Black Hand Seraph: ability.")).toEqual({ blackHand: true, seraph: true });
    expect(printedBlackHandTraits("Sabbat: Black Hand. Seraph.")).toEqual({ blackHand: true, seraph: true });
    expect(printedBlackHandTraits("Sabbat: Seraph.")).toEqual({ blackHand: false, seraph: true });
    for (const text of ["Sabbat: Other Black Hand vampires get +1 bleed.", "Sabbat: Choose a Seraph.", "Sabbat. [MERGED] Black Hand. Seraph.", "Sabbat: Black Hand vampires cannot block."])
      expect(printedBlackHandTraits(text)).toEqual({ blackHand: false, seraph: false });
  });
  it("imports all 64 Black Hand and 10 Seraph cards in all crypt zones, and not other cards", () => {
    const crypt = Object.values(registry.entries).map((e) => e.card).filter((c) => c.kind === "crypt");
    expect(crypt.filter((c) => importCryptCard(c.id).blackHand).map((c) => c.id).sort((a,b) => a-b)).toEqual(blackHandIds);
    expect(crypt.filter((c) => importCryptCard(c.id).seraph).map((c) => c.id).sort((a,b) => a-b)).toEqual(seraphIds);
    for (const id of blackHandIds) {
      const s = game(id).seats[0]!;
      for (const m of [s.minions[0]!, s.uncontrolled[0]!.card, s.crypt[0]!]) {
        expect(m.blackHand, `${id}`).toBe(true);
        expect(m.seraph === true, `${id}`).toBe(seraphIds.includes(id));
      }
    }
    expect(game(200067).seats[0]!.minions[0]!.blackHand).toBeUndefined();
  });
  it.each(blackHandCards)("%s requires a Black Hand vampire in the actual compiled handler", (name) => {
    const spec = cardSpecs.find((s) => s.name === name)!;
    const handler = testRegistry[name]!;
    expect(spec.requiresBlackHand).toBe(true);
    const yes = makeMinion("v", "Alice", { blackHand: true });
    const no = makeMinion("v", "Alice", { seraph: true, sect: "sabbat" });
    const ally = makeAlly("a", "Alice", 3, { blackHand: true });
    expect(meetsRequirements(yes, spec)).toBe(true);
    expect(meetsRequirements(no, spec)).toBe(false);
    expect(meetsRequirements(ally, spec)).toBe(false);
    expect(handler.modesPlayableBy!(yes).length).toBeGreaterThan(0);
    expect(handler.modesPlayableBy!(no)).toEqual([]);
    expect(handler.modesPlayableBy!(ally)).toEqual([]);
  });
  it.each(seraphCards)("%s requires a Seraph, not just Black Hand", (name) => {
    const spec = cardSpecs.find((s) => s.name === name)!;
    const handler = testRegistry[name]!;
    const yes = makeMinion("v", "Alice", { seraph: true });
    const no = makeMinion("v", "Alice", { blackHand: true });
    const ally = makeAlly("a", "Alice", 3, { seraph: true });
    expect(spec.requiresSeraph).toBe(true);
    expect(handler.modesPlayableBy!(yes).length).toBeGreaterThan(0);
    expect(handler.modesPlayableBy!(no)).toEqual([]);
    expect(handler.modesPlayableBy!(ally)).toEqual([]);
  });
  it.each([["Recruitment Exercise", 200129, 200067], ["Tattoo Signal", 200165, 200129], ["Guarded Rubrics", 200129, 200067], ["Marijava Thuggee", 200129, 200067], ["Seraph", 200129, 200067], ["Watchtower: Greatest Fall", 200165, 200129]] as const)("%s is offered to the qualifying imported vampire, not the other", (name, good, bad) => {
    const options = (id: number) => {
      const state = game(id);
      state.seats[0]!.hand.push({ id: "c", name });
      const turn = state.frames[0]!;
      if (turn.kind !== "turn") throw new Error("missing turn");
      turn.phase = "minion";
      return new VtesEngine(state, testRegistry).decision()!.options.map((o) => o.id);
    };
    expect(options(good).some((o) => o.startsWith(`play:${name}:`))).toBe(true);
    expect(options(bad).some((o) => o.startsWith(`play:${name}:`))).toBe(false);
    expect(options(bad)).toContain("bleed:Alice-v0");
  });
  it.each([["Drop Point Network", "blackHand"], ["Watchtower: Chosen are Called", "seraph"], ["Watchtower: Four Ride Forth", "seraph"]] as const)("%s needs a ready controlled qualifying vampire, which may be locked", (name, trait) => {
    function options(kind: "ready" | "locked" | "torpor" | "ally" | "opponent" | "wrongTrait") {
      const state = threeSeatGame();
      const turn = state.frames[0]!;
      if (turn.kind !== "turn") throw new Error("missing turn");
      turn.phase = "master";
      turn.masterActionsLeft = 1;
      const m = state.seats[0]!.minions[0]!;
      if (kind === "opponent") state.seats[1]!.minions[0]![trait] = true;
      else if (kind === "wrongTrait") m[trait === "seraph" ? "blackHand" : "seraph"] = true;
      else m[trait] = true;
      if (kind === "locked") m.locked = true;
      if (kind === "torpor") m.inTorpor = true;
      if (kind === "ally") m.kind = "ally";
      state.seats[0]!.hand = [{ id: "master", name }];
      return new VtesEngine(state, testRegistry).decision()!.options.some((o) => o.kind === "playCard" && o.name === name);
    }
    expect(options("ready")).toBe(true);
    expect(options("locked")).toBe(true);
    for (const kind of ["torpor", "ally", "opponent", "wrongTrait"] as const) expect(options(kind), kind).toBe(false);
  });
});

describe("Watch Commander", () => {
  function setup(directed: boolean, blackHand: boolean) {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.attached.push({ card: { id: "st", name: "stealth" }, locked: false, usedThisPhase: false, statics: { stealth: 1 }, tags: [] });
    state.seats[1]!.minions[0]!.blackHand = blackHand;
    state.seats[1]!.hand.push({ id: "wc", name: "Watch Commander" });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", directed ? "bleed:V1" : "hunt:V1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], ["Bob", "block:W"], ["Alice", "pass"]]);
    return { state, engine };
  }
  it("provides needed intercept during its Black Hand bearer's directed block", () => {
    const { state, engine } = setup(true, true);
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:Watch Commander:"))).toBe(true);
    runTrace(engine, [["Bob", "play:Watch Commander"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    const af = state.frames.find((f) => f.kind === "action");
    if (af?.kind !== "action") throw new Error("missing action");
    expect(currentIntercept(state, af.actionId, "W")).toBe(1);
  });
  it("also works when the directed action names a minion rather than a Methuselah", () => {
    const state = threeSeatGame();
    state.seats[0]!.minions[0]!.attached.push({ card: { id: "st", name: "stealth" }, locked: false, usedThisPhase: false, statics: { stealth: 1 }, tags: [] });
    state.seats[0]!.hand.push({ id: "br", name: "Bum's Rush" });
    state.seats[1]!.minions[0]!.blackHand = true;
    state.seats[1]!.hand.push({ id: "wc", name: "Watch Commander" });
    const engine = new VtesEngine(state, testRegistry);
    const rush = engine.decision()!.options.find((o) => o.id.startsWith("play:Bum's Rush") && o.id.includes(":W:"));
    expect(rush).toBeDefined();
    runTrace(engine, [["Alice", rush!.id]]);
    for (let i = 0; i < 20 && !engine.decision()!.options.some((o) => o.id === "block:W"); i++) {
      const dp = engine.decision()!;
      runTrace(engine, [[dp.seat, "pass"]]);
    }
    runTrace(engine, [["Bob", "block:W"], ["Alice", "pass"]]);
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:Watch Commander:"))).toBe(true);
  });
  it("is not playable when its intercept is not needed", () => {
    const { state, engine } = setup(true, true);
    const af = state.frames.find((f) => f.kind === "action");
    if (af?.kind !== "action") throw new Error("missing action");
    state.seats[0]!.minions[0]!.attached = [];
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:Watch Commander:"))).toBe(false);
  });
  it("is unavailable for an undirected action or a non-Black Hand blocker", () => {
    for (const [directed, blackHand] of [[false, true], [true, false]]) {
      const { engine } = setup(directed!, blackHand!);
      expect(engine.decision()!.options.some((o) => o.id.startsWith("play:Watch Commander:"))).toBe(false);
    }
  });
});
