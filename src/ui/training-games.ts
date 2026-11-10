/** Shared deterministic fixtures for local heuristic and neural game workers. */
import playtestConfig from "../../config/playtest-decks.json" with { type: "json" };
import { buildHandlerRegistry } from "../cards/effects/cards.ts";
import { runTrainingGame, type TrainingGameTask } from "../ai/trainer.ts";
import type { SeatId } from "../engine/state.ts";
import { buildGame, type DeckDef } from "./decks.ts";

const config = playtestConfig as unknown as { decks: DeckDef[]; maxTurns: number | null };
export const TRAINING_SEATS: SeatId[] = ["Lab 1", "Lab 2", "Lab 3", "Lab 4", "Lab 5"];
export const TRAINING_REGISTRY = buildHandlerRegistry();

/** Rotate the included deck snapshots and seed the seating and shuffle. */
export function buildTrainingState(seed: number) {
  const source = config.decks;
  const offset = Math.abs(seed) % source.length;
  const decks = TRAINING_SEATS.map((seat, i) => ({ ...source[(i + offset) % source.length]!, seat }));
  return buildGame({ decks, seed, maxTurns: config.maxTurns, randomSeating: true });
}

export function runLocalHeuristicGame(task: TrainingGameTask) {
  return runTrainingGame(task, TRAINING_SEATS, buildTrainingState, TRAINING_REGISTRY);
}
