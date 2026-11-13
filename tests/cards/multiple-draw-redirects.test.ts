import { describe, expect, it } from "vitest";
import { VtesEngine, type GameState, type PermanentInPlay } from "../../src/engine/index.ts";
import { makeMinion, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

const hand = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `h${i}`, name: `Hand ${i}` }));
const tarotPick = "choice:Shilmulo Tarot:tarot:drawFrom:t1";
const cachePick = "choice:Black Market Cache:cache:drawFrom:c1";
const libraryPick = "choice:Black Market Cache:cache:drawFrom:library";

function setup() {
  const state = threeSeatGame();
  const alice = state.seats[0]!;
  alice.hand = hand(5);
  alice.library = [{ id: "l1", name: "Library" }, { id: "l2", name: "Library 2" }];
  const cache: PermanentInPlay = {
    card: { id: "cache", name: "Black Market Cache" }, locked: false, usedThisPhase: false,
    statics: {}, tags: ["Black Market Cache"], controller: "Alice",
    stored: [{ id: "c1", name: "Cache secret" }], storedFaceUp: true,
  };
  const tarot: PermanentInPlay = {
    card: { id: "tarot", name: "Shilmulo Tarot" }, locked: false, usedThisPhase: false,
    statics: {}, tags: ["Shilmulo Tarot"], stored: [{ id: "t1", name: "Tarot secret" }], storedFaceUp: false,
  };
  const ravnos = makeMinion("ravnos", "Alice", { clan: "Ravnos" });
  ravnos.attached.push(tarot);
  alice.permanents.push(cache);
  alice.minions.push(ravnos);
  return { state, alice, cache, tarot, ravnos, engine: new VtesEngine(state, testRegistry) };
}
const options = (e: VtesEngine) => e.decision()!.options.map((o) => o.id);

describe("multiple sources for a single redirected draw", () => {
  it("offers every source and the library; selecting Tarot does not touch Cache", () => {
    const x = setup();
    x.engine.drawUpToHandSize("Alice");
    expect(options(x.engine)).toEqual(expect.arrayContaining([cachePick, tarotPick, libraryPick]));
    expect(options(x.engine).filter((id) => id.endsWith(":drawFrom:library"))).toHaveLength(1);
    x.engine.choose(tarotPick);
    expect(x.alice.hand.at(-1)!.id).toBe("t1");
    expect(x.cache.stored!.map((c) => c.id)).toEqual(["c1"]);
    expect(x.tarot.stored).toEqual([]);
    expect(options(x.engine)).toContain(cachePick);
    x.engine.choose(cachePick);
    expect(x.alice.hand.slice(-2).map((c) => c.id)).toEqual(["t1", "c1"]);
    expect(x.alice.permanents.some((p) => p.card.id === "cache")).toBe(false);
    expect(x.alice.library.map((c) => c.id)).toEqual(["l1", "l2"]);
    expect(x.state.eventLog.filter((e) => e.type === "StoredCardDrawn").map((e) => e.holder)).toEqual(["tarot", "cache"]);
  });

  it("choosing Cache first burns it and then offers Tarot", () => {
    const x = setup();
    x.engine.drawUpToHandSize("Alice");
    x.engine.choose(cachePick);
    expect(x.alice.permanents.some((p) => p.card.id === "cache")).toBe(false);
    expect(options(x.engine)).toContain(tarotPick);
    x.engine.choose(tarotPick);
    expect(x.alice.hand.slice(-2).map((c) => c.id)).toEqual(["c1", "t1"]);
  });

  it("offers both sources for a single replacement without adding extra draws", () => {
    const x = setup();
    x.engine.discardFromHand("Alice", "h0", true);
    expect(options(x.engine)).toEqual(expect.arrayContaining([cachePick, tarotPick, libraryPick]));
    x.engine.choose(tarotPick);
    expect(x.alice.hand.map((c) => c.id)).toEqual(["h1", "h2", "h3", "h4", "t1"]);
    expect(x.state.frames.some((f) => f.kind === "choice")).toBe(false);
  });

  it("drawing from the library declines both alternatives for that draw", () => {
    const x = setup();
    x.alice.hand = hand(6);
    x.engine.drawUpToHandSize("Alice");
    x.engine.choose(libraryPick);
    expect(x.alice.hand.at(-1)!.id).toBe("l1");
    expect(x.cache.stored).toHaveLength(1);
    expect(x.tarot.stored).toHaveLength(1);
    expect(x.state.frames.some((f) => f.kind === "choice")).toBe(false);
  });

  it("does not offer an empty, uncontrolled, or inactive store", () => {
    const x = setup();
    x.ravnos.inTorpor = true;
    x.engine.drawUpToHandSize("Alice");
    expect(options(x.engine)).toContain(cachePick);
    expect(options(x.engine)).not.toContain(tarotPick);
    x.ravnos.inTorpor = false;
    expect(options(x.engine)).toContain(tarotPick);
    x.cache.controller = "Bob";
    expect(options(x.engine)).not.toContain(cachePick);
    x.tarot.stored = [];
    expect(options(x.engine)).not.toContain(tarotPick);
    expect(options(x.engine)).toContain(libraryPick);
  });

  it("retains all sources and the refill continuation through save/load", () => {
    const x = setup();
    x.engine.drawUpToHandSize("Alice");
    const saved = JSON.parse(JSON.stringify(x.state)) as GameState;
    const resumed = new VtesEngine(saved, testRegistry);
    expect(options(resumed)).toEqual(expect.arrayContaining([cachePick, tarotPick, libraryPick]));
    resumed.choose(tarotPick);
    resumed.choose(cachePick);
    expect(saved.seats[0]!.hand.slice(-2).map((c) => c.id)).toEqual(["t1", "c1"]);
  });

  it("still allows the library if the original store is gone by the queued decision", () => {
    const x = setup();
    x.alice.hand = hand(6);
    x.engine.drawUpToHandSize("Alice");
    x.alice.permanents = [];
    expect(options(x.engine)).toContain(libraryPick);
    expect(options(x.engine)).toContain(tarotPick);
    x.engine.choose(libraryPick);
    expect(x.alice.hand.at(-1)!.id).toBe("l1");
  });
});
