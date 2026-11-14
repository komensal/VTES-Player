import { describe, expect, it } from "vitest";
import { VtesEngine, canCommitDiablerie, type GameState } from "../../src/engine/index.ts";
import { buildGame, type SnapshotDeck } from "../../src/ui/decks.ts";
import { makeMinion, runTrace, testRegistry } from "../engine/fixtures.ts";

const deck = (seat: string, id: number): SnapshotDeck => ({ seat, ready: [{ id }], uncontrolled: [], crypt: [], library: [], pool: 20 });
function game(): GameState {
  const state = buildGame({ decks: [deck("Alice", 200004), deck("Bob", 200053), deck("Carol", 200132)], seed: 1, maxTurns: 40 });
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("no turn");
  turn.phase = "master";
  turn.masterActionsLeft = 1;
  state.seats[0]!.hand.push({ id: "taj1", name: "Tajdid" }, { id: "taj2", name: "Tajdid" });
  return state;
}
function options(engine: VtesEngine): string[] { return engine.decision()!.options.map((o) => o.id); }
function play(state: GameState) {
  const engine = new VtesEngine(state, testRegistry);
  runTrace(engine, [["Alice", "play:Tajdid:-:taj1"], ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
  return engine;
}
function minionPhase(state: GameState, seat = "Alice") {
  const turn = state.frames[0]!;
  if (turn.kind !== "turn") throw new Error("no turn");
  turn.seat = seat;
  turn.phase = "minion";
}

describe("Tajdid (101927)", () => {
  it("requires a controlled ready Banu Haqim vampire, not an ally or a torpid one", () => {
    const state = game();
    const actor = state.seats[0]!.minions[0]!;
    const engine = new VtesEngine(state, testRegistry);
    expect(options(engine)).toContain("play:Tajdid:-:taj1");
    expect(testRegistry["Tajdid"]!.requiresClans!()).toContain("Banu Haqim");
    actor.inTorpor = true;
    expect(options(engine)).not.toContain("play:Tajdid:-:taj1");
    actor.inTorpor = false;
    actor.kind = "ally";
    expect(options(engine)).not.toContain("play:Tajdid:-:taj1");
    actor.kind = "vampire";
    actor.clan = "Brujah";
    expect(options(engine)).not.toContain("play:Tajdid:-:taj1");
    actor.clan = "Banu Haqim";
    actor.locked = true; // locked vampires are still ready
    expect(options(engine)).toContain("play:Tajdid:-:taj1");
  });

  it("applies only upon resolution, globally and for the rest of the game", () => {
    const state = game();
    const alice = state.seats[0]!.minions[0]!;
    const bob = state.seats[1]!.minions[0]!;
    const outsider = state.seats[2]!.minions[0]!;
    outsider.bloodCursed = true; // control: the curse on another clan remains
    const engine = new VtesEngine(state, testRegistry);
    expect(canCommitDiablerie(state, alice)).toBe(false);
    expect(canCommitDiablerie(state, bob)).toBe(false);
    const pool = state.seats[0]!.pool;
    runTrace(engine, [["Alice", "play:Tajdid:-:taj1"]]);
    expect(canCommitDiablerie(state, alice)).toBe(false); // as-played window
    runTrace(engine, [["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(state.seats[0]!.pool).toBe(pool); // no fictitious pool gain
    expect(state.seats[0]!.ashHeap?.map((c) => c.id)).toContain("taj1");
    expect(state.seats[0]!.permanents.some((p) => p.card.name === "Tajdid")).toBe(false);
    expect(state.bloodCurseDiablerieExceptions).toEqual(["Banu Haqim"]);
    expect(alice.bloodCursed).toBe(true); // the trait itself was not removed
    expect(canCommitDiablerie(state, alice)).toBe(true);
    expect(canCommitDiablerie(state, bob)).toBe(true);
    expect(canCommitDiablerie(state, outsider)).toBe(false);
    outsider.clan = "Banu Haqim";
    expect(canCommitDiablerie(state, outsider)).toBe(true); // read live, not snapshotted
    outsider.clan = "Brujah";
    const later = makeMinion("later", "Carol", { bloodCursed: true, clan: "Banu Haqim" });
    expect(canCommitDiablerie(state, later)).toBe(true);
    later.inTorpor = true;
    expect(canCommitDiablerie(state, later)).toBe(false);
    later.inTorpor = false;
    later.kind = "ally";
    expect(canCommitDiablerie(state, later)).toBe(false);
    state.seats[0]!.ousted = true;
    expect(canCommitDiablerie(state, bob)).toBe(true);
    const saved = JSON.parse(JSON.stringify(state)) as GameState;
    expect(canCommitDiablerie(saved, saved.seats[1]!.minions[0]!)).toBe(true);
  });

  it.each(["Cloak of Blood", "Stealing Years"])("enables %s and built-in diablerie after resolving", (card) => {
    const state = game();
    const actor = state.seats[0]!.minions[0]!;
    Object.assign(actor, { capacity: 6, blood: 5, sect: "anarch" });
    const victim = state.seats[2]!.minions[0]!;
    Object.assign(victim, { inTorpor: true, capacity: 8 });
    state.seats[0]!.hand.push({ id: "action", name: card });
    const engine = play(state);
    minionPhase(state);
    const ids = options(engine);
    expect(ids).toContain(`diablerize:${actor.id}:${victim.id}`);
    expect(ids.some((id) => id.startsWith(`play:${card}:`))).toBe(true);
    expect(ids.some((id) => id.startsWith(`rescue:${actor.id}:${victim.id}:`))).toBe(true);
  });

  it.each(["built-in", "Cloak of Blood"])("commits %s diablerie after the exception resolves", (action) => {
    const state = game();
    const actor = state.seats[0]!.minions[0]!;
    Object.assign(actor, { capacity: 6, blood: 3 });
    const victim = state.seats[2]!.minions[0]!;
    Object.assign(victim, { inTorpor: true, capacity: 4, blood: 2 });
    if (action !== "built-in") state.seats[0]!.hand.push({ id: "cloak", name: action });
    const engine = play(state);
    minionPhase(state);
    const prefix = action === "built-in" ? `diablerize:${actor.id}:${victim.id}` : `play:Cloak of Blood:basic:${actor.id}:${victim.id}:cloak`;
    expect(options(engine)).toContain(prefix);
    engine.choose(prefix);
    for (let i = 0; i < 30 && !state.eventLog.some((e) => e.type === "DiablerieCommitted"); i++) {
      const dp = engine.decision();
      if (!dp) throw new Error("game ended before diablerie");
      const pass = dp.options.find((o) => o.id === "pass");
      if (!pass) throw new Error(`unexpected ${dp.window} options: ${dp.options.map((o) => o.id)}`);
      engine.choose(pass.id);
    }
    expect(state.eventLog.some((e) => e.type === "DiablerieCommitted" && e.diablerist === actor.id && e.victim === victim.id)).toBe(true);
    expect(state.seats[2]!.minions).not.toContain(victim);
  });

  it("allows a cursed blocker to diablerize a vampire blocked leaving torpor", () => {
    const state = game();
    const engine = play(state);
    const acting = state.seats[0]!.minions[0]!;
    const blocker = state.seats[1]!.minions[0]!;
    Object.assign(acting, { inTorpor: true, blood: 3 });
    minionPhase(state);
    runTrace(engine, [
      ["Alice", `leave:${acting.id}`],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", `block:${blocker.id}`],
    ]);
    engine.emit({ type: "InterceptModified", actionId: engine.action()!.actionId, minion: blocker.id, delta: 1, source: "test" });
    runTrace(engine, [["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"]]);
    expect(engine.decision()!.window).toBe("diablerie.offer");
    expect(options(engine)).toContain(`diablerize:offer:${blocker.id}:${acting.id}`);
    runTrace(engine, [["Bob", `diablerize:offer:${blocker.id}:${acting.id}`]]);
    expect(state.eventLog.some((e) => e.type === "DiablerieCommitted" && e.diablerist === blocker.id)).toBe(true);
  });

  it("a resolved copy bars another player from playing a copy later", () => {
    const state = game();
    play(state);
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("no turn");
    turn.seat = "Bob";
    turn.phase = "master";
    turn.masterActionsLeft = 1;
    state.seats[1]!.hand.push({ id: "taj3", name: "Tajdid" });
    expect(options(new VtesEngine(state, testRegistry))).not.toContain("play:Tajdid:-:taj3");
  });

  it("canceled by Wash has no effect, but still counts against the one-per-game limit", () => {
    const state = game();
    state.seats[1]!.hand.push({ id: "wash", name: "Wash" });
    const engine = new VtesEngine(state, testRegistry);
    runTrace(engine, [
      ["Alice", "play:Tajdid:-:taj1"],
      ["Alice", "pass"], ["Bob", "play:Wash"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    expect(state.eventLog.some((e) => e.type === "CardCanceled" && e.name === "Tajdid")).toBe(true);
    expect(state.eventLog.some((e) => e.type === "BloodCurseDiablerieBarLifted")).toBe(false);
    expect(canCommitDiablerie(state, state.seats[0]!.minions[0]!)).toBe(false);
    expect(options(engine)).not.toContain("play:Tajdid:-:taj2"); // Wash returned the MPA
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("no turn");
    turn.seat = "Bob";
    turn.phase = "master";
    turn.masterActionsLeft = 1;
    state.seats[1]!.hand.push({ id: "taj3", name: "Tajdid" });
    expect(options(new VtesEngine(state, testRegistry))).not.toContain("play:Tajdid:-:taj3");
  });
});
