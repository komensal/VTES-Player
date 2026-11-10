/** One isolated game at a time; every worker has its own engine registry. */
import { runLocalHeuristicGame } from "./training-games.ts";
import type { TrainingGameTask } from "../ai/trainer.ts";

self.onmessage = (event: MessageEvent<{ index: number; task: TrainingGameTask }>) => {
  try {
    self.postMessage({ index: event.data.index, result: runLocalHeuristicGame(event.data.task) });
  } catch (error) {
    self.postMessage({ index: event.data.index, error: error instanceof Error ? error.message : String(error) });
  }
};
