/** The local training panel is reachable and exposes its controls. */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const shell = readFileSync("src/ui/shell.ts", "utf8");
const trainer = readFileSync("src/ai/trainer.ts", "utf8");
const mlScript = readFileSync("scripts/train_ml.py", "utf8");

describe("AI Training Lab UI", () => {
  it("has a main-menu entry and a wired trainer screen", () => {
    expect(shell).toContain(`<button id="m-trainer">AI Training Lab</button>`);
    expect(shell).toContain(`case "trainer":`);
    expect(shell).toContain(`this.on("#m-trainer", () => this.go("trainer"))`);
  });

  it("lets the player configure, run, cancel, seed, and save/clear a trained profile", () => {
    for (const id of [
      "trainer-population",
      "trainer-generations",
      "trainer-games",
      "trainer-workers",
      "trainer-seed",
      "trainer-run",
      "trainer-cancel",
      "trainer-new-seed",
      "trainer-clear",
    ]) {
      expect(shell).toContain(`id="${id}"`);
    }
    expect(shell).toContain("Save as Trained bot");
    expect(shell).toContain("Progress vs current Balanced bot");
    expect(shell).toContain("Δ vs Balanced");
    expect(shell).toContain("settings.trainedBotWeights = candidate.weights");
  });

  it("exposes a local PyTorch neural-training loop and selectable saved model", () => {
    for (const id of ["ml-games", "ml-rounds", "ml-seed", "ml-trainer-run", "ml-trainer-cancel", "ml-trainer-clear"]) {
      expect(shell).toContain(`id="${id}"`);
    }
    expect(shell).toContain("/__vtes_ml/train");
    expect(shell).toContain("MlWorkerPool");
    expect(shell).toContain("settings.trainedMlModel = model");
    expect(shell).toContain("meanVp - opponentVp");
    expect(mlScript).toContain("torch.cuda.is_available()");
    expect(mlScript).toContain("clip_epsilon = 0.2");
    expect(mlScript).toContain("mask[j, :len(options)] = torch.tensor(allowed, dtype=torch.bool)");
  });

  it("uses a seeded local search rather than Math.random", () => {
    expect(trainer).toContain("function random01");
    expect(trainer).toContain("nextPopulation");
    expect(trainer).not.toContain("Math.random");
  });
});
