/**
 * Chair of Hades (100318).
 *
 * [nec] Ⓓ Remove a mortal or ghoul (ally or retainer) from the game.
 * [NEC] Ⓓ Remove a non-wraith ally or retainer or a vampire with capacity
 * 2 or less from the game.
 *
 * Removal is not a burn: nothing is filed to the ash heap (p. 16).
 */

import { describe, expect, it } from "vitest";
import type { GameState, PermanentInPlay } from "../../src/engine/index.ts";
import { VtesEngine } from "../../src/engine/index.ts";
import { makeAlly, makeMinion, runTrace, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

function selfEntry(id: string, tags: string[]): PermanentInPlay {
  return { card: { id, name: id }, locked: false, usedThisPhase: false, statics: {}, tags };
}

function retainer(id: string, tags: string[]): PermanentInPlay {
  return { card: { id, name: id }, locked: false, usedThisPhase: false, statics: {}, tags, life: 1 };
}

function game(level: "basic" | "superior") {
  const state = threeSeatGame();
  const v1 = state.seats[0]!.minions[0]!;
  v1.disciplines = { nec: level };
  v1.blood = 3;
  state.seats[0]!.hand = [{ id: "ch", name: "Chair of Hades" }];
  state.seats[0]!.minions.push(
    makeAlly("GHOUL", "Alice", 3, { attached: [selfEntry("GHOUL", ["ghoul"])] }),
    makeAlly("WRAITH", "Alice", 3, { attached: [selfEntry("WRAITH", ["wraith"])] }),
    makeMinion("SMALL", "Alice", { capacity: 2 }),
    makeMinion("BIG", "Alice", { capacity: 7 }),
  );
  state.seats[0]!.minions[0]!.attached.push(retainer("RGHoul", ["ghoul"]), retainer("RAnimal", ["animal"]));
  return { state, engine: new VtesEngine(state, testRegistry) };
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

describe("Chair of Hades (100318)", () => {
  it("[nec] offers only mortal/ghoul allies and retainers", () => {
    const { engine } = game("basic");
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Chair of Hades:basic:V1:nec:GHOUL:ch");
    expect(ids).toContain("play:Chair of Hades:basic:V1:nec:RGHoul:ch");
    for (const forbidden of ["WRAITH", "RAnimal", "SMALL", "BIG"]) {
      expect(ids).not.toContain(`play:Chair of Hades:basic:V1:nec:${forbidden}:ch`);
    }
  });

  it("[nec] removes the ally from the game, not to the ash heap", () => {
    const { state, engine } = game("basic");
    resolveUnblocked(engine, "play:Chair of Hades:basic:V1:nec:GHOUL:ch");
    expect(state.seats[0]!.minions.some((m) => m.id === "GHOUL")).toBe(false);
    expect(state.eventLog.some((e) => e.type === "MinionRemovedFromGame" && e.minion === "GHOUL")).toBe(true);
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "GHOUL") ?? false).toBe(false);
  });

  it("[NEC] also offers non-wraith retainers and small vampires, never wraiths", () => {
    const { engine } = game("superior");
    const ids = engine.decision()!.options.map((o) => o.id);
    expect(ids).toContain("play:Chair of Hades:superior:V1:nec:GHOUL:ch");
    expect(ids).toContain("play:Chair of Hades:superior:V1:nec:RGHoul:ch");
    expect(ids).toContain("play:Chair of Hades:superior:V1:nec:RAnimal:ch"); // non-wraith
    expect(ids).toContain("play:Chair of Hades:superior:V1:nec:SMALL:ch");
    expect(ids).not.toContain("play:Chair of Hades:superior:V1:nec:WRAITH:ch");
    expect(ids).not.toContain("play:Chair of Hades:superior:V1:nec:BIG:ch");
  });

  it("[NEC] removes a small vampire from the game", () => {
    const { state, engine } = game("superior");
    resolveUnblocked(engine, "play:Chair of Hades:superior:V1:nec:SMALL:ch");
    expect(state.seats[0]!.minions.some((m) => m.id === "SMALL")).toBe(false);
    expect(state.eventLog.some((e) => e.type === "MinionRemovedFromGame" && e.minion === "SMALL")).toBe(true);
  });

  it("[nec] a retainer is removed with no ash-heap filing", () => {
    const { state, engine } = game("basic");
    resolveUnblocked(engine, "play:Chair of Hades:basic:V1:nec:RGHoul:ch");
    const v1 = state.seats[0]!.minions[0]!;
    expect(v1.attached.some((p) => p.card.id === "RGHoul")).toBe(false);
    expect(state.eventLog.some((e) => e.type === "PermanentBurned" && e.cardId === "RGHoul" && e.removed === true)).toBe(true);
    expect(state.seats[0]!.ashHeap?.some((c) => c.id === "RGHoul") ?? false).toBe(false);
  });
});
