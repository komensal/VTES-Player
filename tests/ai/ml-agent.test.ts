import { describe, expect, it } from "vitest";
import { createInitialMlModel, encodeMlOption, isMlModel, MlAgent, ML_FEATURE_SIZE } from "../../src/ai/ml-agent.ts";
import { viewFor, type PlayerView } from "../../src/engine/agent.ts";
import type { DecisionPoint, LegalOption } from "../../src/engine/options.ts";
import type { GameState } from "../../src/engine/state.ts";
import { threeSeatGame } from "../engine/fixtures.ts";
import { VtesEngine } from "../../src/engine/engine.ts";
import { buildHandlerRegistry } from "../../src/cards/effects/cards.ts";
import { buildTrainingState } from "../../src/ui/ai-lab.ts";

describe("neural policy model", () => {
  it("creates a repeatable, shape-checked residual MLP compatible with browser inference", () => {
    const a = createInitialMlModel(24);
    const b = createInitialMlModel(24);
    expect(isMlModel(a)).toBe(true);
    expect(a).toEqual(b);
    expect(a.w1).toHaveLength(96 * 256);
    expect(a.w2).toHaveLength(256 * 128);
    expect(a.w3).toHaveLength(128);
    expect(isMlModel({ ...a, w1: [] })).toBe(false);
  });

  it("never votes FOR a blood hunt on its own minion, even if learned weights demand it", () => {
    const state = threeSeatGame();
    const view = viewFor(state, "Alice") as PlayerView;
    view.referendum = {
      caller: "Alice",
      cardName: "",
      variant: "bloodHunt",
      callingMinion: null,
      step: "polling",
      terms: {},
      votesFor: 0,
      votesAgainst: 0,
      usedSources: [],
      bloodHuntTarget: "V1",
    };
    const options = [
      { id: "for", kind: "castVote", label: "FOR", source: "V1", count: 1, inFavor: true, minion: "V1" },
      { id: "against", kind: "castVote", label: "AGAINST", source: "V1", count: 1, inFavor: false, minion: "V1" },
    ] as LegalOption[];
    const dp = { window: "referendum.polling", options } as unknown as DecisionPoint;
    const model = createInitialMlModel(15);
    model.w3.fill(0);
    model.b3 = 10_000;
    model.expertScale = 0;
    const agent = new MlAgent({ model, seed: 1, explore: true });
    expect(agent.decide(dp, options, view)).toBe("against");
    expect(agent.samples[0]?.allowed).toEqual([false, true]);
  });

  it("encodes options from a masked PlayerView and produces only offered, seeded choices", () => {
    const engine = new VtesEngine(buildTrainingState(911), buildHandlerRegistry());
    const dp = engine.decision();
    expect(dp).not.toBeNull();
    const view = viewFor(engine.state, dp!.seat);
    const vectors = dp!.options.map((option) => encodeMlOption(option, dp!, view, 0));
    expect(vectors.length).toBe(dp!.options.length);
    expect(vectors.every((row) => row.length === ML_FEATURE_SIZE && row.every(Number.isFinite))).toBe(true);

    const model = createInitialMlModel(912);
    const a = new MlAgent({ model, seed: 77, explore: true });
    const b = new MlAgent({ model, seed: 77, explore: true });
    const choiceA = a.decide(dp!, dp!.options, view);
    const choiceB = b.decide(dp!, dp!.options, view);
    expect(dp!.options.some((option) => option.id === choiceA)).toBe(true);
    expect(choiceA).toBe(choiceB);
    expect(a.samples).toEqual(b.samples);
    if (dp!.options.length > 1) expect(a.samples).toHaveLength(1);
  });
});
