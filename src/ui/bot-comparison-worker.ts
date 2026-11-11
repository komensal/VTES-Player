import { comparisonGame, comparisonPosition, type ComparisonConfig } from "./bot-comparison.ts";
import { TRAINING_SEATS } from "./ai-lab.ts";

self.onmessage = (event: MessageEvent<{ config: ComparisonConfig; startPair: number }>) => {
  const { config, startPair } = event.data;
  void (async () => {
    try {
      for (let pairIndex = startPair; pairIndex < config.deals * TRAINING_SEATS.length; pairIndex++) {
        const { seed, seatIndex } = comparisonPosition(config, pairIndex);
        const a = await comparisonGame(config, config.a, seed, seatIndex);
        const b = await comparisonGame(config, config.b, seed, seatIndex);
        self.postMessage({ type: "pair", pair: { seed, seat: TRAINING_SEATS[seatIndex], a, b } });
      }
      self.postMessage({ type: "done" });
    } catch (error) {
      self.postMessage({ type: "error", error: error instanceof Error ? error.message : String(error) });
    }
  })();
};
