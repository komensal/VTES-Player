import { describe, expect, it } from "vitest";
import type { GameState, MinionState, PermanentInPlay } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function find(state: GameState, id: string): MinionState {
  const m = state.seats.flatMap((s) => s.minions).find((x) => x.id === id);
  if (!m) throw new Error(`no minion ${id}`);
  return m;
}

function entry(id: string, name = "Leather Jacket"): PermanentInPlay {
  return { card: { id, name }, locked: false, usedThisPhase: false, statics: {}, tags: ["equipment"] };
}

function resolveUnblocked(engine: VtesEngine, play: string): void {
  runTrace(engine, [
    ["Alice", play],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // announce
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // A
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // C → resolve
  ]);
}

function ritualGame(level: "basic" | "superior", discipline: "dom" | "obe") {
  const state = threeSeatGame();
  Object.assign(find(state, "V1"), {
    blood: 4,
    capacity: 6,
    disciplines: { [discipline]: level },
  });
  state.seats[0]!.hand = [{ id: "cr", name: "Cleansing Ritual" }];
  return { state, engine: new VtesEngine(state, testRegistry) };
}

function attachedTargets(state: GameState): void {
  const alice = state.seats[0]!;
  alice.minions.push(
    makeMinion("V2", "Alice", {
      capacity: 3,
      locked: true,
      attached: [entry("V2", "Young Vampire"), entry("eq")],
    }),
    makeMinion("V3", "Alice", { capacity: 9, attached: [entry("olderEq")] }),
    makeMinion("V4", "Alice", { capacity: 2, inTorpor: true, attached: [entry("torporEq")] }),
    makeAlly("A1", "Alice", 2, {
      attached: [entry("A1", "Young Ally"), entry("allyEq")],
    }),
  );
  find(state, "W").capacity = 2;
  find(state, "W").attached.push(entry("otherEq"));
}

describe("Cleansing Ritual (100357)", () => {
  it("[dom] adds 1 blood only to a vampire controlled by the actor", () => {
    const { state, engine } = ritualGame("basic", "dom");
    state.seats[0]!.minions.push(makeMinion("V2", "Alice", { blood: 1, capacity: 4 }));
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Cleansing Ritual:basic:V1:dom:V2:cr");
    expect(ids.some((id) => id.includes(":W:") || id.endsWith(":W:cr"))).toBe(false);

    resolveUnblocked(engine, "play:Cleansing Ritual:basic:V1:dom:V2:cr");
    expect(find(state, "V2").blood).toBe(2);
    expect(find(state, "V1").blood).toBe(3); // 4 − printed cost 1
    expect(find(state, "W").blood).toBe(3);
  });

  it("[obe] burns a chosen card on a ready ally or younger vampire, never a self-entry or an illegal target", () => {
    const { state, engine } = ritualGame("basic", "obe");
    attachedTargets(state);
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Cleansing Ritual:basic:V1:obe:eq:cr");
    expect(ids).toContain("play:Cleansing Ritual:basic:V1:obe:allyEq:cr");
    for (const forbidden of ["V2", "A1", "olderEq", "torporEq", "otherEq"]) {
      expect(ids).not.toContain(`play:Cleansing Ritual:basic:V1:obe:${forbidden}:cr`);
    }

    resolveUnblocked(engine, "play:Cleansing Ritual:basic:V1:obe:eq:cr");
    expect(find(state, "V2").attached.map((p) => p.card.id)).toEqual(["V2"]);
    expect(find(state, "V1").blood).toBe(3);
    expect(find(state, "V2").unlocksInDiscardPhase).not.toBe(true);
  });

  it("[OBE] also unlocks the bearer for free at the next discard phase, not immediately", () => {
    const { state, engine } = ritualGame("superior", "obe");
    attachedTargets(state);
    const blood = find(state, "V2").blood;

    resolveUnblocked(engine, "play:Cleansing Ritual:superior:V1:obe:eq:cr");
    expect(find(state, "V2").attached.map((p) => p.card.id)).toEqual(["V2"]);
    expect(find(state, "V2").locked).toBe(true);
    expect(find(state, "V2").unlocksInDiscardPhase).toBe(true);

    runTrace(engine, [["Alice", "end"]]);
    expect(find(state, "V2").locked).toBe(true); // influence phase
    runTrace(engine, [["Alice", "pass"]]);
    expect(engine.decision()!.window).toBe("turn.discard");
    expect(find(state, "V2").locked).toBe(false);
    expect(find(state, "V2").blood).toBe(blood);
    expect(find(state, "V2").unlocksInDiscardPhase).toBe(false);
  });
});

describe("As the Crow (100102)", () => {
  it("unlocks after a successful action and bars a second copy by that minion", () => {
    const state = threeSeatGame();
    Object.assign(find(state, "V1"), { blood: 3, disciplines: { flight: "basic" } });
    state.seats[0]!.hand = [
      { id: "crow1", name: "As the Crow" },
      { id: "crow2", name: "As the Crow" },
    ];
    const engine = new VtesEngine(state, testRegistry);
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:As the Crow"))).toBe(false);

    runTrace(engine, [
      ["Alice", "bleed:V1"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // announce
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // A
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // C → resolve
    ]);
    expect(engine.decision()!.window).toBe("action.afterResolution");
    expect(find(state, "V1").locked).toBe(true);

    runTrace(engine, [
      ["Alice", "play:As the Crow:basic:V1:crow1"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
    ]);
    expect(find(state, "V1").locked).toBe(false);
    expect(find(state, "V1").playedSinceUnlock).toContain("As the Crow");
    expect(engine.decision()!.options.some((o) => o.id.startsWith("play:As the Crow"))).toBe(false);

    runTrace(engine, [
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // close after-resolution
    ]);
    expect(engine.decision()!.window).toBe("turn.minion");
  });
});
