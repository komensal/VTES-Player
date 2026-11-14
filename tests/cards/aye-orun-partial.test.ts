import { describe, expect, it } from "vitest";
import { VtesEngine } from "../../src/engine/index.ts";
import type { GameState, PermanentInPlay } from "../../src/engine/index.ts";
import { makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

const pass3: Array<[string, string]> = [["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]];
function masterPhase(state: GameState) {
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("no turn");
  turn.phase = "master"; turn.masterActionsLeft = 1;
  return turn;
}
function perm(id: string, name: string, locked = false, controller = "Alice"): PermanentInPlay {
  return { card: { id, name }, locked, controller, owner: controller, usedThisPhase: false, statics: {}, tags: [name] };
}
function playMaster(engine: VtesEngine, card: string, target: string) {
  const o = engine.decision()!.options.find(x => x.kind === "playCard" && x.name === card && x.params["target"] === target);
  if (!o) throw new Error(`missing ${card} on ${target}`);
  runTrace(engine, [["Alice", o.id], ...pass3]);
}

// Attachment, trifle, Orun votes and the printed count are partial fixes.
// Capacity overflow and burn/use abilities are deliberately not claimed here.
describe("Aye and Orun partial implementation", () => {
  it.each(["Aye", "Orun"])("%s is a trifle targeting any Laibon, including in torpor", name => {
    const state = threeSeatGame(); const turn = masterPhase(state);
    const alice = state.seats[0]!; const bob = state.seats[1]!;
    Object.assign(alice.minions[0]!, { sect: "laibon", capacity: 8 });
    bob.minions[0]!.sect = "laibon";
    bob.minions[1]!.sect = "camarilla";
    bob.minions.push(makeMinion("torpid", "Bob", { sect: "laibon", inTorpor: true }));
    bob.minions.push(makeMinion("ally", "Bob", { kind: "ally", sect: "laibon" }));
    alice.hand.push({ id: "card", name });
    const engine = new VtesEngine(state, testRegistry);
    const opts = engine.decision()!.options.filter(x => x.kind === "playCard" && x.name === name);
    const targets = opts.map(x => x.kind === "playCard" ? x.params["target"] : "");
    expect(targets).toEqual(expect.arrayContaining(["V1", "W", "torpid"]));
    expect(targets).not.toContain("M"); expect(targets).not.toContain("ally");
    expect(testRegistry[name]!.isTrifle).toBe(true);
    playMaster(engine, name, "torpid");
    const placed = bob.minions.find(m => m.id === "torpid")!.attached.find(p => p.card.id === "card");
    expect(placed).toMatchObject({ controller: "Alice", owner: "Alice", locked: false });
    expect(placed!.tags).toContain(name);
    expect(alice.pool).toBe(10); // not the old placeholder's +1 pool
    expect(turn.masterActionsLeft).toBe(1); // trifle refunds the first action
  });

  it.each(["Aye", "Orun"])("%s has no target without any Laibon", name => {
    const state = threeSeatGame(); masterPhase(state);
    state.seats[0]!.hand.push({ id: "card", name });
    const dp = new VtesEngine(state, testRegistry).decision()!;
    expect(dp.options.some(o => o.kind === "playCard" && o.card === "card")).toBe(false);
  });

  it("the second trifle in the same phase does not refund another action", () => {
    const state = threeSeatGame(); const turn = masterPhase(state);
    state.seats[0]!.minions[0]!.sect = "laibon";
    state.seats[0]!.hand.push({ id: "a", name: "Aye" }, { id: "o", name: "Orun" });
    const engine = new VtesEngine(state, testRegistry);
    playMaster(engine, "Aye", "V1");
    expect(turn.masterActionsLeft).toBe(1);
    playMaster(engine, "Orun", "V1");
    expect(turn.masterActionsLeft).toBe(0);
    expect(state.seats[0]!.minions[0]!.attached.map(p => p.card.name)).toEqual(["Aye", "Orun"]);
  });

  const counts = [
    [100595, "Dusk Work", "Aye"], [100924, "High Aye", "Aye"],
    [100927, "High Orun", "Orun"], [101269, "Neebi", "Aye"],
    [101906, "Supernatural Resistance", "Orun"], [102073, "Unholy Radiance", "Orun"],
  ] as const;
  it.each(counts)("%i %s requires three %s on its playing Laibon", (_id, name, required) => {
    const h = testRegistry[name]!;
    const v = makeMinion("v", "Alice", { sect: "laibon", capacity: 9 });
    const other = required === "Aye" ? "Orun" : "Aye";
    v.attached = [perm("one", required), perm("two", required, true, "Bob"), perm("wrong", other)];
    expect(h.requiresSects?.()).toEqual(["laibon"]);
    expect(h.modesPlayableBy!(v)).toEqual([]);
    v.attached.push(perm("three", required, true, "Carol"));
    expect(h.modesPlayableBy!(v).length).toBeGreaterThan(0);
    v.sect = "sabbat";
    expect(h.modesPlayableBy!(v)).toEqual([]);
    v.sect = "laibon"; v.kind = "ally";
    expect(h.modesPlayableBy!(v)).toEqual([]);
  });

  it("an Aye really played onto a Laibon completes High Aye's count", () => {
    const state = threeSeatGame(); masterPhase(state);
    const v = state.seats[0]!.minions[0]!;
    Object.assign(v, { sect: "laibon", capacity: 6 });
    v.attached = [perm("one", "Aye"), perm("two", "Aye", true)];
    state.seats[0]!.hand.push({ id: "third", name: "Aye" });
    const h = testRegistry["High Aye"]!;
    expect(h.modesPlayableBy!(v)).toEqual([]);
    playMaster(new VtesEngine(state, testRegistry), "Aye", "V1");
    expect(h.modesPlayableBy!(v)).toEqual(["basic"]);
  });

  it("High Aye checks three attached cards in the current modifier window", () => {
    for (const n of [2, 3]) {
      const state = threeSeatGame(); const v = state.seats[0]!.minions[0]!;
      Object.assign(v, { sect: "laibon", capacity: 8 });
      v.attached = Array.from({ length: n }, (_, i) => perm(`a${i}`, "Aye", i === 0));
      state.seats[0]!.hand.push({ id: "high", name: "High Aye" });
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [["Alice", "bleed:V1"], ...pass3, ["Alice", "pass"], ["Bob", "block:M"]]);
      expect(engine.decision()!.options.some(o => o.kind === "playCard" && o.card === "high"), `count ${n}`).toBe(n === 3);
    }
  });

  it("Neebi counts only Aye on the combatant in the current range window", () => {
    for (const n of [2, 3]) {
      const state = threeSeatGame(); const v = state.seats[0]!.minions[0]!;
      Object.assign(v, { sect: "laibon", capacity: 8 });
      v.attached = Array.from({ length: n }, (_, i) => perm(`a${i}`, "Aye", i === 0));
      state.seats[0]!.hand.push({ id: "neebi", name: "Neebi" });
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [["Alice", "bleed:V1"], ...pass3, ["Alice", "pass"], ["Bob", "block:M"], ...pass3, ...pass3]);
      const dp = engine.decision()!;
      expect(dp.window).toBe("combat.range");
      expect(dp.options.some(o => o.kind === "playCard" && o.card === "neebi"), `count ${n}`).toBe(n === 3);
    }
  });

  it("losing an Orun during polling updates votes and files the card to its owner's ash heap", () => {
    const state = threeSeatGame(); const v = state.seats[0]!.minions[0]!;
    Object.assign(v, { sect: "laibon", capacity: 8, title: "personal1" });
    v.attached = [perm("one", "Orun"), perm("two", "Orun"), perm("three", "Orun", false, "Bob")];
    state.seats[0]!.hand.push({ id: "au", name: "Anarchist Uprising" });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [["Alice", "play:Anarchist Uprising"], ...pass3, ...pass3, ...pass3, ...pass3]);
    const count = () => {
      const option = engine.decision()!.options.find(o => o.kind === "castVote" && o.id === "vote:V1:for");
      return option?.kind === "castVote" ? option.count : 0;
    };
    expect(count()).toBe(2);
    engine.burnPermanent("three");
    expect(count()).toBe(1);
    expect(state.seats[1]!.ashHeap?.some(c => c.id === "three")).toBe(true);
  });

  it("Orun grants one vote per full group of three, not one per card", () => {
    for (const [n, votes] of [[2, 0], [3, 1], [5, 1], [6, 2]] as const) {
      const state = threeSeatGame(); const v = state.seats[0]!.minions[0]!;
      Object.assign(v, { sect: "laibon", capacity: 8, title: null });
      v.attached = Array.from({ length: n }, (_, i) => perm(`o${i}`, "Orun", i === 0, i === 1 ? "Bob" : "Alice"));
      state.seats[0]!.hand.push({ id: "au", name: "Anarchist Uprising" });
      const engine = new VtesEngine(state, testRegistry);
      runTrace(engine, [["Alice", "play:Anarchist Uprising"], ...pass3, ...pass3, ...pass3, ...pass3]);
      const vote = engine.decision()!.options.find(o => o.kind === "castVote" && o.id === "vote:V1:for");
      expect(vote?.kind === "castVote" ? vote.count : 0, `count ${n}`).toBe(votes);
    }
  });
});
