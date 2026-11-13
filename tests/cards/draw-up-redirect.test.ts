import { describe, expect, it } from "vitest";
import { VtesEngine, type GameState, type PermanentInPlay } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

const cards = (prefix: string, count: number) => Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i}`, name: `${prefix} ${i}` }));
function tarot(state: GameState, seat = "Alice", stored = cards("s", 2)) {
  const minion = makeMinion(`ravnos-${seat}`, seat, { clan: "Ravnos" });
  const entry: PermanentInPlay = { card: { id: `tarot-${seat}`, name: "Shilmulo Tarot" }, locked: false, usedThisPhase: false, statics: {}, tags: ["Shilmulo Tarot"], stored, storedFaceUp: false };
  minion.attached.push(entry);
  state.seats.find((s) => s.id === seat)!.minions.push(minion);
  return { minion, entry };
}
function cache(state: GameState, seat = "Alice") {
  const entry: PermanentInPlay = { card: { id: `cache-${seat}`, name: "Black Market Cache" }, locked: false, usedThisPhase: false, statics: {}, tags: ["Black Market Cache", "location"], stored: cards("c", 1), storedFaceUp: true, controller: seat };
  state.seats.find((s) => s.id === seat)!.permanents.push(entry);
  return entry;
}
const choice = (seat: string, pick: string) => `choice:Shilmulo Tarot:tarot-${seat}:drawFrom:${pick}`;
const options = (engine: VtesEngine) => engine.decision()?.options.map((o) => o.id) ?? [];

describe("draw up to hand size with draw redirects", () => {
  it("asks for each redirected draw, then finishes from the library once the store empties", () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    alice.hand = cards("h", 4);
    alice.library = cards("l", 5);
    tarot(state);
    const engine = new VtesEngine(state, testRegistry);
    engine.drawUpToHandSize("Alice");
    expect(options(engine)).toContain(choice("Alice", "s0"));
    engine.choose(choice("Alice", "s1"));
    expect(alice.hand.map((c) => c.id)).toEqual(["h0", "h1", "h2", "h3", "s1"]);
    expect(options(engine)).toContain(choice("Alice", "s0"));
    engine.choose(choice("Alice", "s0"));
    expect(alice.hand.map((c) => c.id)).toEqual(["h0", "h1", "h2", "h3", "s1", "s0", "l0"]);
    expect(state.frames.some((f) => f.kind === "choice")).toBe(false);
  });

  it("allows a library draw each time, without consuming the stored cards or overdrawing", () => {
    const state = threeSeatGame();
    state.seats[0]!.hand = cards("h", 5);
    state.seats[0]!.library = cards("l", 3);
    const { entry } = tarot(state);
    const engine = new VtesEngine(state, testRegistry);
    engine.drawUpToHandSize("Alice");
    engine.choose(choice("Alice", "library"));
    expect(options(engine)).toContain(choice("Alice", "library"));
    engine.choose(choice("Alice", "library"));
    expect(state.seats[0]!.hand.map((c) => c.id)).toEqual(["h0", "h1", "h2", "h3", "h4", "l0", "l1"]);
    expect(entry.stored).toHaveLength(2);
    expect(state.frames.some((f) => f.kind === "choice")).toBe(false);
  });

  it("stops if the chosen library is empty, rather than looping or forcing the store", () => {
    const state = threeSeatGame();
    state.seats[0]!.hand = cards("h", 4);
    state.seats[0]!.library = [];
    const { entry } = tarot(state);
    const engine = new VtesEngine(state, testRegistry);
    engine.drawUpToHandSize("Alice");
    engine.choose(choice("Alice", "library"));
    expect(state.seats[0]!.hand).toHaveLength(4);
    expect(entry.stored).toHaveLength(2);
    expect(state.frames.some((f) => f.kind === "choice")).toBe(false);
  });

  it("rechecks modified hand size after the redirected draw and survives serialization", () => {
    const state = threeSeatGame();
    state.seats[0]!.hand = cards("h", 5);
    state.seats[0]!.library = cards("l", 6);
    tarot(state);
    const engine = new VtesEngine(state, testRegistry);
    engine.drawUpToHandSize("Alice");
    const restored = JSON.parse(JSON.stringify(state)) as GameState;
    restored.seats[0]!.permanents.push({ card: { id: "bonus", name: "bonus" }, locked: false, usedThisPhase: false, statics: { handSize: 1 }, tags: [] });
    const resumed = new VtesEngine(restored, testRegistry);
    resumed.choose(choice("Alice", "s0"));
    resumed.choose(choice("Alice", "s1"));
    expect(restored.seats[0]!.hand.map((c) => c.id)).toEqual(["h0", "h1", "h2", "h3", "h4", "s0", "s1", "l0"]);
  });

  it("resumes a refill caused by a hand-size increase", () => {
    const state = threeSeatGame();
    state.seats[0]!.hand = cards("h", 5);
    state.seats[0]!.library = cards("l", 5);
    tarot(state);
    const engine = new VtesEngine(state, testRegistry);
    engine.putPermanentInPlay({ card: { id: "size", name: "size" }, seat: "Alice", attachTo: null, statics: { handSize: 1 }, tags: [] });
    expect(options(engine)).toContain(choice("Alice", "s0"));
    engine.choose(choice("Alice", "s0"));
    engine.choose(choice("Alice", "s1"));
    expect(state.seats[0]!.hand.map((c) => c.id)).toEqual(["h0", "h1", "h2", "h3", "h4", "s0", "s1", "l0"]);
  });

  it("continues after a Black Market Cache is emptied and burns", () => {
    const state = threeSeatGame();
    state.seats[0]!.hand = cards("h", 5);
    state.seats[0]!.library = cards("l", 4);
    cache(state);
    const engine = new VtesEngine(state, testRegistry);
    engine.drawUpToHandSize("Alice");
    engine.choose("choice:Black Market Cache:cache-Alice:drawFrom:c0");
    expect(state.seats[0]!.hand.map((c) => c.id)).toEqual(["h0", "h1", "h2", "h3", "h4", "c0", "l0"]);
    expect(state.seats[0]!.permanents.some((p) => p.card.id === "cache-Alice")).toBe(false);
  });

  it("rechecks a shrinking hand size when the redirecting permanent burns", () => {
    const state = threeSeatGame();
    state.seats[0]!.hand = cards("h", 6);
    state.seats[0]!.library = cards("l", 5);
    cache(state).statics.handSize = 1;
    const engine = new VtesEngine(state, testRegistry);
    engine.drawUpToHandSize("Alice");
    engine.choose("choice:Black Market Cache:cache-Alice:drawFrom:c0");
    expect(state.seats[0]!.hand).toHaveLength(7);
    expect(state.seats[0]!.library).toHaveLength(5);
  });

  it("does not turn a single-card replacement into a refill", () => {
    const state = threeSeatGame();
    state.seats[0]!.hand = cards("h", 3);
    state.seats[0]!.library = cards("l", 5);
    tarot(state);
    const engine = new VtesEngine(state, testRegistry);
    engine.discardFromHand("Alice", "h0", true);
    engine.choose(choice("Alice", "s0"));
    expect(state.seats[0]!.hand.map((c) => c.id)).toEqual(["h1", "h2", "s0"]);
    expect(state.frames.some((f) => f.kind === "choice")).toBe(false);
  });

  it("keeps pending refills for two different seats separate", () => {
    const state = threeSeatGame();
    for (const seat of state.seats.slice(0, 2)) {
      seat.hand = cards(`${seat.id}-h`, 5);
      seat.library = cards(`${seat.id}-l`, 3);
    }
    tarot(state, "Alice", cards("Alice-s", 1));
    cache(state, "Bob");
    const engine = new VtesEngine(state, testRegistry);
    engine.drawUpToHandSize("Alice");
    engine.drawUpToHandSize("Bob");
    expect(engine.decision()!.seat).toBe("Bob");
    engine.choose("choice:Black Market Cache:cache-Bob:drawFrom:c0");
    expect(state.seats[1]!.hand).toHaveLength(7);
    expect(engine.decision()!.seat).toBe("Alice");
    engine.choose(choice("Alice", "Alice-s0"));
    expect(state.seats[0]!.hand).toHaveLength(7);
  });

  it("does not cap ordinary refills at twenty cards", () => {
    const state = threeSeatGame();
    state.seats[0]!.hand = [];
    state.seats[0]!.library = cards("l", 35);
    state.seats[0]!.permanents.push({ card: { id: "bonus", name: "bonus" }, locked: false, usedThisPhase: false, statics: { handSize: 18 }, tags: [] });
    new VtesEngine(state, testRegistry).drawUpToHandSize("Alice");
    expect(state.seats[0]!.hand).toHaveLength(25);
  });

  it("Lupine Assault finishes a player's redirected refill before the next player's choices", () => {
    const state = threeSeatGame();
    const tf = state.frames[0]!;
    if (tf.kind !== "turn") throw new Error("no turn");
    Object.assign(tf, { phase: "master", masterActionsLeft: 1 });
    for (const seat of state.seats) {
      seat.hand = cards(`${seat.id}-h`, 6);
      seat.library = cards(`${seat.id}-l`, 10);
    }
    state.seats[0]!.hand.push({ id: "lupine", name: "Lupine Assault" });
    tarot(state, "Bob", cards("Bob-s", 2));
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", "play:Lupine Assault"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    const seen = new Set<string>();
    let redirected = 0;
    for (let i = 0; i < 30; i++) {
      const dp = engine.decision();
      if (!dp) break;
      const discard = dp.options.find((o) => o.id.includes(":tableDiscard:"));
      if (discard) {
        if (seen.has("Bob") && dp.seat !== "Bob") expect(state.seats[1]!.hand).toHaveLength(7);
        seen.add(dp.seat);
        engine.choose(discard.id);
        continue;
      }
      const stored = dp.options.find((o) => o.id.startsWith("choice:Shilmulo Tarot:") && !o.id.endsWith(":library"));
      if (stored) { expect(dp.seat).toBe("Bob"); redirected++; engine.choose(stored.id); continue; }
      break;
    }
    expect([...seen].sort()).toEqual(["Alice", "Bob", "Carol"]);
    expect(redirected).toBe(2);
    expect(state.seats[1]!.hand).toHaveLength(7);
    expect(state.seats[2]!.hand).toHaveLength(7);
    // Alice's held Lupine replacement has a separate, open timing issue.
    expect(state.frames.some((f) => f.kind === "choice")).toBe(false);
  });

  it("Deal with the Devil has only one pending refill after resolution", () => {
    const state = threeSeatGame();
    const tf = state.frames[0]!;
    if (tf.kind !== "turn") throw new Error("no turn");
    Object.assign(tf, { phase: "master", masterActionsLeft: 1 });
    state.seats[0]!.hand = [{ id: "dd", name: "Deal with the Devil" }, { id: "old", name: "Conditioning" }];
    state.seats[0]!.library = cards("l", 10);
    tarot(state);
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", "play:Deal with the Devil"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(state.frames.filter((f) => f.kind === "choice" && f.key === "drawFrom")).toHaveLength(1);
    engine.choose(choice("Alice", "s0"));
    engine.choose(choice("Alice", "s1"));
    expect(state.seats[0]!.hand).toHaveLength(7);
    expect(state.seats[0]!.hand.some((c) => c.id === "old")).toBe(false);
    expect(state.frames.some((f) => f.kind === "choice")).toBe(false);
  });
});
