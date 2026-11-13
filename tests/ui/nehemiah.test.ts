import { describe, expect, it } from "vitest";
import { VtesEngine, redactFor, type GameState } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { testRegistry, threeSeatGame, makeMinion } from "../engine/fixtures.ts";
import { narrate } from "../../src/ui/narrate.ts";

const deck = (seat: string, id: number): SnapshotDeck => ({ seat, ready: [{ id }], uncontrolled: [], crypt: [], library: [], pool: 20 });
const name = "Nehemiah (G4)";
function fixture() {
  const state = threeSeatGame();
  const real = buildGame({ decks: [deck("Alice", 201044), deck("Bob", 200132)], seed: 1, maxTurns: 40 });
  const vampire = real.seats[0]!.minions[0]!;
  state.seats[0]!.minions = [vampire];
  const tf = state.frames[0]!;
  if (tf.kind !== "turn") throw new Error("missing turn");
  Object.assign(tf, { phase: "unlock", unlockDone: false, edgeDone: false, unlockAbilitiesDone: false, unlockOthersDone: [] });
  state.seats[0]!.hand = Array.from({ length: 7 }, (_, i) => ({ id: `h${i}`, name: `Secret ${i}` }));
  state.seats[0]!.library = Array.from({ length: 5 }, (_, i) => ({ id: `l${i}`, name: `Library ${i}` }));
  const engine = new VtesEngine(state, testRegistry);
  const id = vampire.id;
  return { state, vampire, tf, engine, play: (card: string) => `ability:${name}:${id}:bury:${card}`, second: (card: string) => `choice:${name}:${id}:bury:${card}` };
}
const ids = (e: VtesEngine) => e.decision()!.options.map((o) => o.id);

describe("Nehemiah (201044)", () => {
  it("moves two selected cards in order before drawing, and only once", () => {
    const { state, vampire, engine, play, second } = fixture();
    const seat = state.seats[0]!;
    expect(vampire.title).toBe("personal2");
    expect(vampire.scarce).toBe(true);
    expect(vampire.cannotUseDisciplines).toEqual(["cel"]);
    expect(ids(engine)).toContain(play("h3"));
    engine.choose(play("h3"));
    expect(engine.decision()!.window).toBe("choice");
    expect(seat.library.at(-1)!.id).toBe("h3");
    expect(seat.hand).toHaveLength(6);
    expect(ids(engine)).not.toContain(second("l0"));
    engine.choose(second("h1"));
    expect(seat.hand.map((c) => c.id)).toEqual(["h0", "h2", "h4", "h5", "h6", "l0", "l1"]);
    expect(seat.library.map((c) => c.id)).toEqual(["l2", "l3", "l4", "h3", "h1"]);
    expect(seat.ashHeap ?? []).toEqual([]);
    const events = state.eventLog.filter((ev) => ev.type === "CardBuried" || ev.type === "CardDrawn");
    expect(events.map((ev) => ev.type)).toEqual(["CardBuried", "CardBuried", "CardDrawn", "CardDrawn"]);
    expect(ids(engine)).not.toContain(play("h0"));
  });

  it("can stop after one without moving or drawing a second card", () => {
    const { state, engine, play, second } = fixture();
    engine.choose(play("h2"));
    engine.choose(second("done"));
    expect(state.seats[0]!.hand.map((c) => c.id)).toEqual(["h0", "h1", "h3", "h4", "h5", "h6", "l0"]);
    expect(state.seats[0]!.library.map((c) => c.id)).toEqual(["l1", "l2", "l3", "l4", "h2"]);
  });

  it("allows zero moved when drawing up has an effect, and skipping preserves the option", () => {
    const { state, engine, play } = fixture();
    state.seats[0]!.hand.length = 5;
    expect(ids(engine)).toContain(play("none"));
    engine.choose(play("none"));
    expect(state.seats[0]!.hand.map((c) => c.id)).toEqual(["h0", "h1", "h2", "h3", "h4", "l0", "l1"]);
    expect(state.eventLog.some((e) => e.type === "CardBuried")).toBe(false);
    expect(ids(engine)).not.toContain(play("h0"));
    const skipped = fixture();
    expect(ids(skipped.engine)).toContain(skipped.play("h0"));
    expect(skipped.vampire.attached[0]!.usedThisPhase).toBe(false);
  });

  it("a card returned to an empty library can be drawn again only after choices finish", () => {
    const { state, engine, play, second } = fixture();
    state.seats[0]!.library = [];
    engine.choose(play("h1"));
    expect(state.seats[0]!.hand.some((c) => c.id === "h1")).toBe(false);
    engine.choose(second("h4"));
    expect(state.seats[0]!.hand.slice(-2).map((c) => c.id)).toEqual(["h1", "h4"]);
    expect(state.seats[0]!.library).toEqual([]);
  });

  it("handles an empty hand and a one-card hand without leaving a choice frame stranded", () => {
    const empty = fixture();
    empty.state.seats[0]!.hand = [];
    expect(ids(empty.engine)).toContain(empty.play("none"));
    empty.engine.choose(empty.play("none"));
    expect(empty.state.seats[0]!.hand).toHaveLength(5);
    const one = fixture();
    one.state.seats[0]!.hand.length = 1;
    one.engine.choose(one.play("h0"));
    expect(one.state.frames.some((f) => f.kind === "choice")).toBe(false);
    expect(one.state.seats[0]!.hand.map((c) => c.id)).toEqual(["l0", "l1", "l2", "l3", "l4", "h0"]);
  });

  it("works locked or in torpor, but not in another turn or outside play", () => {
    for (const torpor of [false, true]) {
      const x = fixture();
      x.vampire.inTorpor = torpor;
      x.vampire.skipNextUnlock = true;
      x.vampire.locked = true;
      expect(ids(x.engine)).toContain(x.play("h0"));
      expect(x.vampire.locked).toBe(true);
    }
    const other = fixture();
    other.tf.seat = "Bob";
    other.state.edge = "Bob";
    expect(ids(other.engine)).not.toContain(other.play("h0"));
    const absent = fixture();
    absent.state.seats[0]!.minions = [];
    absent.state.edge = "Alice";
    expect(ids(absent.engine)).not.toContain(absent.play("h0"));
  });

  it("uses the current controller's hand after control changes", () => {
    const { state, vampire, tf, engine } = fixture();
    engine.changeMinionControl(vampire.id, "Bob");
    tf.seat = "Bob";
    state.seats[1]!.hand = [{ id: "bob-hand", name: "Bob Secret" }];
    state.seats[1]!.library = [{ id: "bob-lib", name: "Bob Library" }];
    const opt = `ability:${name}:${vampire.id}:bury:bob-hand`;
    expect(ids(engine)).toContain(opt);
    engine.choose(opt);
    expect(state.seats[0]!.hand).toHaveLength(7);
    expect(state.seats[1]!.hand.map((c) => c.id)).toEqual(["bob-lib", "bob-hand"]);
  });

  it("restores the second selection and spent latch across serialization", () => {
    const { state, engine, play, second } = fixture();
    engine.choose(play("h3"));
    const saved = JSON.parse(JSON.stringify(state)) as GameState;
    const resumed = new VtesEngine(saved, testRegistry);
    expect(ids(resumed)).toContain(second("h1"));
    resumed.choose(second("h1"));
    expect(saved.seats[0]!.library.slice(-2).map((c) => c.id)).toEqual(["h3", "h1"]);
    expect(ids(resumed)).not.toContain(play("h0"));
  });

  it("resets the per-phase latch in a later ordinary unlock sweep", () => {
    const { state, tf, engine, play, second } = fixture();
    engine.choose(play("h0"));
    engine.choose(second("done"));
    expect(ids(engine)).not.toContain(play("h1"));
    Object.assign(tf, { phase: "unlock", unlockDone: false, contestsDone: false, unlockAbilitiesDone: false, unlockOthersDone: [] });
    expect(ids(engine)).toContain(play("h1"));
    expect(state.seats[0]!.minions[0]!.attached[0]!.usedThisPhase).toBe(false);
  });

  it("refills to the current modified hand size", () => {
    const { state, engine, play, second } = fixture();
    state.seats[0]!.permanents.push({ card: { id: "bonus", name: "bonus" }, locked: false, usedThisPhase: false, statics: { handSize: 1 }, tags: [] });
    engine.choose(play("h0"));
    engine.choose(second("done"));
    expect(state.seats[0]!.hand).toHaveLength(8);
    expect(state.seats[0]!.hand.slice(-2).map((c) => c.id)).toEqual(["l0", "l1"]);
  });

  it("offers the draw redirect after both cards have moved, even with an empty library", () => {
    const { state, engine, play, second } = fixture();
    state.seats[0]!.library = [];
    const ravnos = makeMinion("ravnos", "Alice", { clan: "Ravnos" });
    ravnos.attached.push({ card: { id: "tarot", name: "Shilmulo Tarot" }, locked: false, usedThisPhase: false, statics: {}, tags: ["Shilmulo Tarot"], stored: [{ id: "stored", name: "Stored" }], storedFaceUp: false });
    state.seats[0]!.minions.push(ravnos);
    engine.choose(play("h0"));
    engine.choose(second("h1"));
    expect(state.seats[0]!.library.map((c) => c.id)).toEqual(["h0", "h1"]);
    expect(ids(engine)).toContain("choice:Shilmulo Tarot:tarot:drawFrom:stored");
  });

  it("does not expose buried card names or selections in opponents' projected logs", () => {
    const { state, engine, play, second } = fixture();
    engine.choose(play("h3"));
    engine.choose(second("h1"));
    const mine = redactFor(state, "Alice");
    const other = redactFor(state, "Bob");
    expect(mine.eventLog.filter((e) => e.type === "CardBuried").map((e) => e.name)).toEqual(["Secret 3", "Secret 1"]);
    expect(other.eventLog.filter((e) => e.type === "CardBuried")).toEqual([
      { type: "CardBuried", seat: "Alice", cardId: "", name: "" },
      { type: "CardBuried", seat: "Alice", cardId: "", name: "" },
    ]);
    expect(other.commandLog.filter((c) => c.seat === "Alice").map((c) => c.option)).toEqual(["[hidden card selection]", "[hidden card selection]"]);
    const buried = state.eventLog.find((e) => e.type === "CardBuried")!;
    expect(narrate(buried, state)?.text).toBe("Alice moves a card to the bottom of their library.");
    expect(state.eventLog.filter((e) => e.type === "CardBuried").map((e) => e.name)).toEqual(["Secret 3", "Secret 1"]);
  });

  it("also masks Heart of Nizchetus buried card selections in projected command logs", () => {
    const { state } = fixture();
    state.commandLog.push({ seq: 0, seat: "Alice", option: "choice:Heart of Nizchetus:heart:bury:h0" });
    state.eventLog.push({ type: "CardBuried", seat: "Alice", cardId: "h0", name: "Secret 0" });
    expect(redactFor(state, "Bob").commandLog.at(-1)!.option).toBe("[hidden card selection]");
    expect(redactFor(state, "Bob").eventLog.at(-1)).toEqual({ type: "CardBuried", seat: "Alice", cardId: "", name: "" });
    expect(redactFor(state, "Alice").commandLog.at(-1)!.option).toContain("h0");
  });
});
