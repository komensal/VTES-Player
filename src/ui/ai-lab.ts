/** Browser wiring for the local AI Lab; deck/UI dependencies stay out of src/ai. */

import playtestConfig from "../../config/playtest-decks.json" with { type: "json" };
import { trainHeuristic, type TrainingOptions } from "../ai/trainer.ts";
import { buildHandlerRegistry } from "../cards/effects/cards.ts";
import type { SeatId } from "../engine/state.ts";
import { HeuristicAgent } from "../ai/heuristic.ts";
import { MlAgent, type MlDecisionSample, type MlModel } from "../ai/ml-agent.ts";
import { PLAYSTYLES } from "../ai/playstyles.ts";
import { runGame } from "../ai/batch.ts";
import { buildGame, type DeckDef } from "./decks.ts";
import { seatSeed } from "./settings.ts";

const config = playtestConfig as unknown as { decks: DeckDef[]; maxTurns: number | null };
export const TRAINING_SEATS: SeatId[] = ["Lab 1", "Lab 2", "Lab 3", "Lab 4", "Lab 5"];
const registry = buildHandlerRegistry();

/** Five-seat training tables from the included playtest snapshots. The three
 *  snapshots are repeated and rotated so the candidate does not always see
 *  the same deck assignment. Random seating remains seeded and reproducible. */
export function buildTrainingState(seed: number) {
  const source = config.decks;
  const offset = Math.abs(seed) % source.length;
  const decks = TRAINING_SEATS.map((seat, i) => ({
    ...source[(i + offset) % source.length]!,
    seat,
  }));
  return buildGame({ decks, seed, maxTurns: config.maxTurns, randomSeating: true });
}

export type LocalTrainingOptions = Omit<TrainingOptions, "seats" | "registry" | "buildState">;

export function runLocalTraining(options: LocalTrainingOptions) {
  return trainHeuristic({
    ...options,
    seats: TRAINING_SEATS,
    registry,
    buildState: buildTrainingState,
  });
}

export interface MlTrainingEpisode {
  seed: number;
  reward: number;
  ownVictoryPoints: number;
  opponentMeanVictoryPoints: number;
  winner: boolean;
  ousted: boolean;
  errors: string | null;
  samples: MlDecisionSample[];
}

const ML_OPPONENT_STYLES = ["balanced", "bruiser", "stalker", "turtle", "politician", "builder"] as const;

/** Play a real five-seat engine game and collect only the candidate's
 *  masked-view decisions. Four changing heuristic styles provide opponents. */
export function runLocalMlEpisode(model: MlModel, seed: number, gameIndex: number): MlTrainingEpisode {
  const candidateSeat = TRAINING_SEATS[gameIndex % TRAINING_SEATS.length]!;
  const candidate = new MlAgent({ model, seed: seed ^ 0x1f123bb5, explore: true });
  const agents: Record<SeatId, MlAgent | HeuristicAgent> = {};
  const start = Math.abs(seed + gameIndex * 3) % ML_OPPONENT_STYLES.length;
  let opponent = 0;
  for (const seat of TRAINING_SEATS) {
    if (seat === candidateSeat) {
      agents[seat] = candidate;
      continue;
    }
    const style = ML_OPPONENT_STYLES[(start + opponent) % ML_OPPONENT_STYLES.length]!;
    const styleSeed = (seatSeed(seat) ^ seed ^ (gameIndex * 0x45d9f3b)) | 0;
    agents[seat] = new HeuristicAgent({ seed: styleSeed, weights: PLAYSTYLES[style] });
    opponent++;
  }
  const result = runGame(seed, buildTrainingState(seed), agents, registry);
  const ownVp = result.victoryPoints[candidateSeat] ?? 0;
  const otherVps = TRAINING_SEATS.filter((seat) => seat !== candidateSeat)
    .map((seat) => result.victoryPoints[seat] ?? 0);
  const opponentMean = otherVps.reduce((a, b) => a + b, 0) / otherVps.length;
  const winner = result.winner === candidateSeat;
  const ousted = result.ousted.includes(candidateSeat);
  const reward = ownVp - opponentMean + (winner ? 1.25 : 0) - (ousted ? 0.75 : 0);
  return {
    seed,
    reward,
    ownVictoryPoints: ownVp,
    opponentMeanVictoryPoints: opponentMean,
    winner,
    ousted,
    errors: result.error ?? null,
    samples: candidate.samples,
  };
}
