/**
 * Neural option scorer shared by browser inference and the PyTorch trainer.
 *
 * It is intentionally a residual policy: it starts near the known-good
 * HeuristicAgent (`expertScale * standardized heuristic score`) and learns
 * state/action interactions on top, rather than beginning as a random
 * policy. The exported dense-layer layout matches scripts/train_ml.py.
 */

import type { Agent, PlayerView } from "../engine/agent.ts";
import type { DecisionPoint, LegalOption, WindowId } from "../engine/options.ts";
import { TITLE_VOTES, type MinionState, type SeatId } from "../engine/state.ts";
import { HeuristicAgent } from "./heuristic.ts";
import { predatorOf, preyOf, relationTo } from "./seats.ts";

export const ML_FEATURE_SIZE = 96;
export const ML_HIDDEN_1 = 256;
export const ML_HIDDEN_2 = 128;
export const ML_MODEL_VERSION = 1;
export const ML_TEMPERATURE = 1.15;

export interface MlModel {
  format: "vtes-mlp-v1";
  featureSize: 96;
  hidden1: 256;
  hidden2: 128;
  w1: number[];
  b1: number[];
  w2: number[];
  b2: number[];
  w3: number[];
  b3: number;
  expertScale: number;
  training?: { rounds: number; games: number; device: string; updatedAt: string };
}

export interface MlDecisionSample {
  /** One encoded row per legal option; action masking is by row count. */
  options: number[][];
  /** Safety constraints applied in the rollout, replayed by PyTorch PPO. */
  allowed: boolean[];
  chosen: number;
  oldLogProbability: number;
}

const OPTION_KINDS = [
  "pass", "takeAction", "endMinionPhase", "announceWithdrawal", "gainEdgePool",
  "discard", "burnOptionDiscard", "playCard", "answerChoice", "declareBlock",
  "chooseStrike", "usePress", "useManeuver", "useAbility", "useEntryAction",
  "preventCredit", "burnForIntercept", "burnForUnlock", "cancelBlock", "cancelVotes",
  "payToCancel", "chooseTerms", "castVote", "diablerizeOffer", "transferToVampire",
  "influenceOut", "cryptDraw", "transferToPool",
] as const;

const WINDOWS: WindowId[] = [
  "turn.unlock", "turn.master", "turn.minion", "turn.influence", "turn.discard",
  "action.announce", "action.effects", "action.afterResolution", "card.asPlayed",
  "combat.beforeRange", "combat.range", "combat.beforeStrikes", "combat.chooseStrike",
  "combat.beforeResolution", "combat.damageResolution", "combat.grantAdditionalStrikes",
  "combat.press", "combat.endOfRound", "referendum.terms", "referendum.polling",
  "referendum.afterResolution", "diablerie.offer", "oust", "torpor", "choice",
];

const ACTIONS = ["bleed", "hunt", "leaveTorpor", "diablerize", "rescue", "cardEffect"] as const;
const MINION_NAMES = ["capacity", "blood", "strength", "bleedAmount"] as const;

function clamp01(value: number, max: number): number {
  return Math.max(0, Math.min(1, value / max));
}

function recordOf(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function num(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function minionById(view: PlayerView, id: string | null | undefined): { minion: MinionState; seat: SeatId } | null {
  if (!id) return null;
  for (const seat of view.seats) {
    const minion = seat.minions.find((m) => m.id === id);
    if (minion) return { minion, seat: seat.id };
  }
  return null;
}

function titleVotes(minion: MinionState): number {
  return minion.title ? TITLE_VOTES[minion.title] : 0;
}

/** Fixed-size, public-information-only feature vector for one offered option. */
export function encodeMlOption(
  option: LegalOption,
  dp: DecisionPoint,
  view: PlayerView,
  expertZScore: number,
): number[] {
  const x = new Array<number>(ML_FEATURE_SIZE).fill(0);
  x[0] = Math.max(-4, Math.min(4, expertZScore));

  const kindIndex = OPTION_KINDS.indexOf(option.kind as (typeof OPTION_KINDS)[number]);
  if (kindIndex >= 0) x[1 + kindIndex] = 1;
  const windowIndex = WINDOWS.indexOf(dp.window);
  if (windowIndex >= 0) x[29 + windowIndex] = 1;

  const o = option as unknown as Record<string, unknown>;
  const action = typeof o["action"] === "string" ? o["action"] : "";
  const actionIndex = ACTIONS.indexOf(action as (typeof ACTIONS)[number]);
  if (actionIndex >= 0) x[54 + actionIndex] = 1;

  const cost = recordOf(o["cost"]);
  const pool = view.seats.find((s) => s.id === view.you)?.pool ?? 0;
  const prey = preyOf(view, view.you);
  const predator = predatorOf(view, view.you);
  const preyPool = view.seats.find((s) => s.id === prey)?.pool ?? 0;
  const predatorPool = view.seats.find((s) => s.id === predator)?.pool ?? 0;

  // Numeric option features (indices 60–71).
  x[60] = clamp01(num(o, "amount"), 10);
  x[61] = clamp01(num(o, "count"), 12);
  x[62] = clamp01(num(o, "gain"), 10);
  x[63] = clamp01(num(o, "bleed"), 10);
  x[64] = clamp01(num(o, "toll"), 5);
  x[65] = clamp01(num(o, "intercept"), 10);
  x[66] = clamp01(num(o, "stealth"), 10);
  x[67] = clamp01(num(cost, "pool"), 10);
  x[68] = clamp01(num(cost, "blood"), 10);
  x[69] = o["inFavor"] === true ? 1 : o["inFavor"] === false ? -1 : 0;
  x[70] = o["wouldSucceed"] === true ? 1 : o["wouldSucceed"] === false ? -1 : 0;
  x[71] = o["toContinue"] === true ? 1 : o["toContinue"] === false ? -1 : 0;

  const actorId = typeof o["minion"] === "string"
    ? o["minion"]
    : view.action?.acting;
  const actor = minionById(view, actorId);
  const targetId = typeof o["targetMinion"] === "string"
    ? o["targetMinion"]
    : typeof o["target"] === "string"
      ? o["target"]
      : view.action?.target;
  const target = minionById(view, targetId);

  // Actor features (indices 72–80).
  if (actor) {
    x[72] = clamp01(actor.minion.capacity, 11);
    x[73] = clamp01(actor.minion.blood, 11);
    x[74] = clamp01(actor.minion.strength, 10);
    x[75] = clamp01(actor.minion.bleedAmount, 10);
    x[76] = clamp01(titleVotes(actor.minion), 4);
    x[77] = actor.minion.locked ? 1 : 0;
    x[78] = actor.minion.inTorpor ? 1 : 0;
    x[79] = actor.seat === view.you ? 1 : 0;
    x[80] = clamp01(actor.minion.attached.length, 10);
  }

  // Target features (indices 81–89).
  if (target) {
    x[81] = clamp01(target.minion.capacity, 11);
    x[82] = clamp01(target.minion.blood, 11);
    x[83] = clamp01(target.minion.strength, 10);
    x[84] = clamp01(titleVotes(target.minion), 4);
    x[85] = target.minion.inTorpor ? 1 : 0;
    const relation = relationTo(view, view.you, target.seat);
    x[86] = relation === "me" ? 1 : relation === "prey" ? 0.5 : relation === "predator" ? -0.5 : -1;
    x[87] = clamp01(view.seats.find((s) => s.id === target.seat)?.pool ?? 0, 30);
    x[88] = target.seat === view.you ? 1 : 0;
    x[89] = clamp01(target.minion.attached.length, 10);
  }

  // Table context (indices 90–95), all face-up information.
  x[90] = clamp01(pool, 30);
  x[91] = clamp01(preyPool, 30);
  x[92] = clamp01(predatorPool, 30);
  x[93] = clamp01(view.seats.find((s) => s.id === view.you)?.minions.length ?? 0, 6);
  x[94] = clamp01(view.seats.reduce((n, s) => n + s.minions.filter((m) => !m.inTorpor).length, 0), 20);
  x[95] = view.edge === view.you ? 1 : view.edge ? -1 : 0;
  return x;
}

/** Seeded Xavier initialization; the residual starts small around the expert prior. */
export function createInitialMlModel(seed: number): MlModel {
  let state = (seed | 0) || 1;
  const random = (): number => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
  const init = (length: number, fanIn: number, fanOut: number, scale = 1): number[] => {
    const limit = Math.sqrt(6 / (fanIn + fanOut)) * scale;
    return Array.from({ length }, () => (random() * 2 - 1) * limit);
  };
  return {
    format: "vtes-mlp-v1",
    featureSize: ML_FEATURE_SIZE,
    hidden1: ML_HIDDEN_1,
    hidden2: ML_HIDDEN_2,
    w1: init(ML_FEATURE_SIZE * ML_HIDDEN_1, ML_FEATURE_SIZE, ML_HIDDEN_1),
    b1: Array(ML_HIDDEN_1).fill(0),
    w2: init(ML_HIDDEN_1 * ML_HIDDEN_2, ML_HIDDEN_1, ML_HIDDEN_2),
    b2: Array(ML_HIDDEN_2).fill(0),
    w3: init(ML_HIDDEN_2, ML_HIDDEN_2, 1, 0.15),
    b3: 0,
    expertScale: 1.4,
  };
}

export function isMlModel(value: unknown): value is MlModel {
  if (!value || typeof value !== "object") return false;
  const m = value as Partial<MlModel>;
  return m.format === "vtes-mlp-v1" && m.featureSize === ML_FEATURE_SIZE &&
    m.hidden1 === ML_HIDDEN_1 && m.hidden2 === ML_HIDDEN_2 &&
    Array.isArray(m.w1) && m.w1.length === ML_FEATURE_SIZE * ML_HIDDEN_1 &&
    Array.isArray(m.b1) && m.b1.length === ML_HIDDEN_1 &&
    Array.isArray(m.w2) && m.w2.length === ML_HIDDEN_1 * ML_HIDDEN_2 &&
    Array.isArray(m.b2) && m.b2.length === ML_HIDDEN_2 &&
    Array.isArray(m.w3) && m.w3.length === ML_HIDDEN_2 &&
    typeof m.b3 === "number" && typeof m.expertScale === "number";
}

function forward(model: MlModel, x: number[]): number {
  const h1 = new Float32Array(ML_HIDDEN_1);
  for (let r = 0; r < ML_HIDDEN_1; r++) {
    let sum = model.b1[r] ?? 0;
    const row = r * ML_FEATURE_SIZE;
    for (let c = 0; c < ML_FEATURE_SIZE; c++) sum += (model.w1[row + c] ?? 0) * (x[c] ?? 0);
    h1[r] = Math.max(0, sum);
  }
  const h2 = new Float32Array(ML_HIDDEN_2);
  for (let r = 0; r < ML_HIDDEN_2; r++) {
    let sum = model.b2[r] ?? 0;
    const row = r * ML_HIDDEN_1;
    for (let c = 0; c < ML_HIDDEN_1; c++) sum += (model.w2[row + c] ?? 0) * h1[c]!;
    h2[r] = Math.max(0, sum);
  }
  let residual = model.b3;
  for (let i = 0; i < ML_HIDDEN_2; i++) residual += (model.w3[i] ?? 0) * h2[i]!;
  return model.expertScale * x[0]! + residual;
}

export interface MlAgentOptions {
  model: MlModel;
  seed?: number;
  /** Sample from the policy and retain log-probabilities for training. */
  explore?: boolean;
  temperature?: number;
}

export class MlAgent implements Agent {
  readonly samples: MlDecisionSample[] = [];
  private readonly expert: HeuristicAgent;
  private rngState: number;
  private readonly temperature: number;

  constructor(private readonly opts: MlAgentOptions) {
    if (!isMlModel(opts.model)) throw new Error("invalid VTES ML model");
    this.expert = new HeuristicAgent({ seed: (opts.seed ?? 1) ^ 0x4a71 });
    this.rngState = (opts.seed ?? 1) | 1;
    this.temperature = Math.max(0.25, opts.temperature ?? ML_TEMPERATURE);
  }

  decide(dp: DecisionPoint, options: LegalOption[], view: PlayerView): string {
    if (options.length === 0) throw new Error("no options offered");
    const expertScores = options.map((o) => this.expert.score(o, dp, view));
    const mean = expertScores.reduce((a, b) => a + b, 0) / expertScores.length;
    const variance = expertScores.reduce((a, s) => a + (s - mean) ** 2, 0) / expertScores.length;
    const sd = Math.sqrt(variance) || 1;
    const features = options.map((o, i) => encodeMlOption(o, dp, view, (expertScores[i]! - mean) / sd));
    const ownBloodHuntTarget = view.referendum?.variant === "bloodHunt" && view.referendum.bloodHuntTarget
      ? minionById(view, view.referendum.bloodHuntTarget)?.seat === view.you
      : false;
    const hasVoteAlternative = options.some((option) =>
      !(option.kind === "castVote" && option.inFavor === true),
    );
    const hasNonGuardedOption = expertScores.some((score) => score > -500);
    const allowed = options.map((option, i) => {
      // Preserve hard safety rules (including own-vampire diablerie and
      // self-oust guards), and never vote FOR a hunt on our own minion when
      // the referendum offers any alternative. Learned weights cannot undo it.
      if (ownBloodHuntTarget && hasVoteAlternative && option.kind === "castVote" && option.inFavor) return false;
      if (hasNonGuardedOption && expertScores[i]! <= -500) return false;
      return true;
    });
    const logits = features.map((x, i) => allowed[i]
      ? forward(this.opts.model, x) / (this.opts.explore ? this.temperature : 1)
      : Number.NEGATIVE_INFINITY,
    );

    let chosen = 0;
    let logProbability = 0;
    if (this.opts.explore && options.length > 1) {
      const max = Math.max(...logits);
      const weights = logits.map((v) => Math.exp(v - max));
      const total = weights.reduce((a, b) => a + b, 0);
      let draw = this.nextFloat() * total;
      for (let i = 0; i < weights.length; i++) {
        draw -= weights[i]!;
        if (draw <= 0) { chosen = i; break; }
      }
      logProbability = logits[chosen]! - max - Math.log(total);
      this.samples.push({ options: features, allowed, chosen, oldLogProbability: logProbability });
    } else {
      for (let i = 1; i < logits.length; i++) if (logits[i]! > logits[chosen]!) chosen = i;
    }
    return options[chosen]!.id;
  }

  private nextFloat(): number {
    let x = this.rngState | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.rngState = x | 0;
    return (x >>> 0) / 0x1_0000_0000;
  }
}
