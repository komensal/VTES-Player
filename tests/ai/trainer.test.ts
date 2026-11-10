/** Seeded, local self-play tuning (AI Training Lab). */

import { describe, expect, it } from "vitest";
import { runTrainingGame, trainHeuristic, type TrainingGameExecutor } from "../../src/ai/trainer.ts";
import { threeSeatGame, testRegistry } from "../engine/fixtures.ts";
import { buildTrainingState, runLocalTraining, TRAINING_SEATS } from "../../src/ui/ai-lab.ts";

function tinyFinishedState() {
  const state = threeSeatGame();
  state.frames = [];
  return state;
}

describe("AI self-play trainer", () => {
  it("builds reproducible five-seat tables from the playtest decks", () => {
    const a = buildTrainingState(123);
    const b = buildTrainingState(123);
    expect(a.seats).toHaveLength(5);
    expect(a.seats.map((s) => s.id).sort()).toEqual([...TRAINING_SEATS].sort());
    expect(a.seats.map((s) => s.id)).toEqual(b.seats.map((s) => s.id));
    expect(a.seats.map((s) => s.minions.map((m) => m.name))).toEqual(
      b.seats.map((s) => s.minions.map((m) => m.name)),
    );
  });

  it("is reproducible and evaluates every candidate over the requested games", async () => {
    const options = {
      population: 3,
      generations: 2,
      gamesPerCandidate: 2,
      seed: 731,
      seats: ["Alice", "Bob", "Carol"],
      registry: testRegistry,
      buildState: tinyFinishedState,
    };
    const first = await trainHeuristic(options);
    const second = await trainHeuristic(options);
    expect(first.completedGames).toBe(12);
    expect(first.totalGames).toBe(12);
    expect(first.generationsCompleted).toBe(2);
    expect(first.history).toHaveLength(2);
    expect(first.history.every((row) => row.baselineMeanVictoryPoints !== null)).toBe(true);
    expect(first.candidates.some((candidate) => candidate.id.endsWith("-baseline"))).toBe(true);
    expect(first.history).toEqual(second.history);
    expect(first.candidates).toEqual(second.candidates);
    expect(first.best).toEqual(second.best);
  });

  it("produces the same report when games finish in reverse order", async () => {
    const options = { population: 3, generations: 3, gamesPerCandidate: 2, seed: 731,
      seats: ["Alice", "Bob", "Carol"], registry: testRegistry, buildState: tinyFinishedState };
    const executeGames: TrainingGameExecutor = async (tasks, _cancelled, onResult) => {
      for (let i = tasks.length - 1; i >= 0; i--) {
        onResult(i, runTrainingGame(tasks[i]!, options.seats, options.buildState, options.registry));
      }
    };
    const serial = await trainHeuristic(options);
    const parallel = await trainHeuristic({ ...options, executeGames });
    expect(parallel).toEqual(serial);
  });

  it("rejects missing or duplicated game results instead of scoring a partial generation", async () => {
    const options = { population: 2, generations: 1, gamesPerCandidate: 1, seed: 9,
      seats: ["Alice", "Bob", "Carol"], registry: testRegistry, buildState: tinyFinishedState };
    await expect(trainHeuristic({ ...options, executeGames: async () => {} })).rejects.toThrow(/did not return every game/);
    await expect(trainHeuristic({ ...options, executeGames: async (_tasks, _cancel, record) => {
      const result = { victoryPoints: 0, won: false, ousted: false, error: false };
      record(0, result); record(0, result);
    } })).rejects.toThrow(/duplicate/);
  });

  it("runs the real five-seat local tournament without game errors", async () => {
    const report = await runLocalTraining({
      population: 2,
      generations: 1,
      gamesPerCandidate: 1,
      seed: 42,
    });
    expect(report.completedGames).toBe(2);
    expect(report.candidates).toHaveLength(2);
    expect(report.candidates.every((c) => c.errors === 0 && c.games === 1)).toBe(true);
  });

  it("honours cancellation between games", async () => {
    const report = await trainHeuristic({
      population: 2,
      generations: 2,
      gamesPerCandidate: 4,
      seed: 9,
      seats: ["Alice", "Bob", "Carol"],
      registry: testRegistry,
      buildState: tinyFinishedState,
      shouldCancel: () => true,
    });
    expect(report.cancelled).toBe(true);
    expect(report.completedGames).toBe(0);
  });
});
