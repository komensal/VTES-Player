import { describe, expect, it } from "vitest";
import type { GameState, ReferendumFrame } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function lobbyGame(mode: "basic" | "superior" = "basic") {
  const state = threeSeatGame();
  const v1 = state.seats[0]!.minions[0]!;
  v1.disciplines = { pre: mode };
  v1.blood = 3;
  state.seats[0]!.hand = [
    { id: "cl", name: "Charming Lobby" },
    { id: "au", name: "Anarchist Uprising" },
  ];
  return { state, engine: new VtesEngine(state, testRegistry), mode };
}

function aliceAction(play: string): Array<[string, string]> {
  return [
    ["Alice", play],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // as played
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // announce
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // A
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"], // C → resolve
  ];
}

function referendum(state: GameState): ReferendumFrame {
  const frame = state.frames.find((f) => f.kind === "referendum");
  if (frame?.kind !== "referendum") throw new Error("no referendum");
  return frame;
}

function passLobbyVote(engine: VtesEngine): void {
  runTrace(engine, [
    ["Alice", "vote:caller:for"],
    ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
  ]);
}

describe("Charming Lobby (100334)", () => {
  it("plays the chosen hand card's referendum, burns it on a pass and arms the global auto-pass", () => {
    const { state, engine } = lobbyGame();
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Charming Lobby:basic:V1:au:cl");

    runTrace(engine, aliceAction("play:Charming Lobby:basic:V1:au:cl"));
    expect(referendum(state)).toMatchObject({
      cardName: "Anarchist Uprising",
      cardInstanceId: "au",
      handlerName: "Charming Lobby",
      handlerMode: "basic",
    });
    expect(state.seats[0]!.hand.some((c) => c.id === "au")).toBe(false);
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "au") ?? false).toBe(false);

    passLobbyVote(engine);
    expect(state.eventLog.some((e) => e.type === "ReferendumResolved" && e.passed)).toBe(true);
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "au")).toBe(true);
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "cl")).toBe(true);
    expect(state.autoPassNextReferendum).toBe(true);
    expect(state.seats.map((s) => s.pool)).toEqual([9, 8, 9]);
  });

  it("superior grants exactly 2 additional votes to the caller in the first referendum", () => {
    const { state, engine } = lobbyGame("superior");
    runTrace(engine, aliceAction("play:Charming Lobby:superior:V1:au:cl"));
    expect(referendum(state).handlerMode).toBe("superior");
    expect(referendum(state).minionVoteGrants?.V1).toEqual({ any: 2, for: 0, against: 0 });
  });

  it("the next referendum passes automatically even when another Methuselah calls it", () => {
    const { state, engine } = lobbyGame();
    runTrace(engine, aliceAction("play:Charming Lobby:basic:V1:au:cl"));
    passLobbyVote(engine);
    expect(state.autoPassNextReferendum).toBe(true);

    const turn = state.frames.find((f) => f.kind === "turn");
    if (turn?.kind !== "turn") throw new Error("no turn");
    turn.seat = "Bob";
    turn.phase = "minion";
    state.seats[1]!.hand.push({ id: "dc", name: "Domain Challenge" });
    const votesBefore = state.eventLog.filter((e) => e.type === "VoteCast").length;

    runTrace(engine, [
      ["Bob", "play:Domain Challenge:basic:W:dc"],
      ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], // as played
      ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], // announce
      ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], // A
      ["Bob", "pass"], ["Carol", "pass"], ["Alice", "pass"], // C → auto-pass
    ]);
    const resolved = state.eventLog.filter((e) => e.type === "ReferendumResolved").at(-1);
    expect(resolved).toMatchObject({ passed: true, votesFor: 0, votesAgainst: 0 });
    expect(state.eventLog.filter((e) => e.type === "VoteCast")).toHaveLength(votesBefore);
    expect(state.autoPassNextReferendum).toBeUndefined();
  });

  it("a blocked Lobby leaves the announced political action card in hand and unplayed", () => {
    const { state, engine } = lobbyGame();
    const blocker = state.seats[1]!.minions.find((m) => m.id === "M")!;
    blocker.attached.push({
      card: { id: "bike", name: "Sport Bike" },
      locked: false,
      usedThisPhase: false,
      statics: { intercept: 1 },
      tags: ["equipment"],
    });

    runTrace(engine, [
      ["Alice", "play:Charming Lobby:basic:V1:au:cl"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "block:M"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "pass"], ["Bob", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
      ["Alice", "strike:hand"], ["Bob", "strike:hand"],
      ["Alice", "pass"], ["Bob", "pass"],
      ["Alice", "pass"], ["Bob", "pass"],
      ["Alice", "pass"], ["Bob", "pass"], ["Carol", "pass"],
    ]);
    expect(state.eventLog.some((e) => e.type === "ReferendumCalled")).toBe(false);
    expect(state.eventLog.some((e) => e.type === "CardPlayed" && e.cardId === "au")).toBe(false);
    expect(state.seats[0]!.hand.some((c) => c.id === "au")).toBe(true);
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "cl")).toBe(true);
  });
});
