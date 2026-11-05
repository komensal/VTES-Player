import { comparisonGame, type ComparisonConfig } from "./bot-comparison.ts";
import { TRAINING_SEATS } from "./ai-lab.ts";

self.onmessage = (event: MessageEvent<ComparisonConfig>) => {
  const config = event.data;
  void (async () => {
    try {
      for (let deal = 0; deal < config.deals; deal++) {
        const seed = (config.seed + deal) | 0;
        for (let seatIndex = 0; seatIndex < TRAINING_SEATS.length; seatIndex++) {
          const a = await comparisonGame(config, config.a, seed, seatIndex);
          const b = await comparisonGame(config, config.b, seed, seatIndex);
          self.postMessage({ type: "pair", pair: { seed, seat: TRAINING_SEATS[seatIndex], a, b } });
        }
      }
      self.postMessage({ type: "done" });
    } catch (error) {
      self.postMessage({ type: "error", error: error instanceof Error ? error.message : String(error) });
    }
  })();
};
