import { describe, expect, it } from "vitest";
import { MlWorkerPool } from "../../src/ui/ml-worker-pool.ts";
import type { MlModel } from "../../src/ai/ml-agent.ts";
import type { MlTrainingEpisode } from "../../src/ui/ai-lab.ts";

const model = {} as MlModel;
const episode = (seed: number): MlTrainingEpisode => ({ seed, reward: 0, ownVictoryPoints: 0, opponentMeanVictoryPoints: 0, winner: false, ousted: false, errors: null, samples: [] });
class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  sent: any[] = [];
  terminated = false;
  postMessage(message: unknown) { this.sent.push(message); }
  terminate() { this.terminated = true; }
  reply(index: number, seed: number) { this.onmessage?.({ data: { index, episode: episode(seed) } } as MessageEvent); }
}
function createPool(count: number) {
  const workers: FakeWorker[] = [];
  const pool = new MlWorkerPool(count, () => {
    const worker = new FakeWorker(); workers.push(worker); return worker as unknown as Worker;
  });
  return { workers, pool };
}

describe("ML rollout worker pool", () => {
  it("runs games concurrently and returns deterministic task order", async () => {
    const { pool, workers } = createPool(2);
    const progress: number[] = [];
    const done = pool.run(model, [1, 2, 3].map((seed) => ({ seed, gameIndex: seed })), () => false, (e) => progress.push(e.seed));
    expect(workers.map((w) => w.sent.map((m) => m.type))).toEqual([["model", "game"], ["model", "game"]]);
    workers[1]!.reply(1, 2);
    expect(workers[1]!.sent[2]).toMatchObject({ type: "game", index: 2, seed: 3 });
    workers[1]!.reply(2, 3);
    workers[0]!.reply(0, 1);
    expect(progress).toEqual([2, 3, 1]);
    expect((await done).map((e) => e.seed)).toEqual([1, 2, 3]);
    pool.close();
    expect(workers.every((w) => w.terminated)).toBe(true);
  });

  it("cancellation stops scheduling, but keeps games already in flight", async () => {
    const { pool, workers } = createPool(2);
    let cancelled = false;
    const done = pool.run(model, [1, 2, 3].map((seed) => ({ seed, gameIndex: seed })), () => cancelled, () => {});
    cancelled = true;
    workers[1]!.reply(1, 2);
    workers[0]!.reply(0, 1);
    expect((await done).map((e) => e.seed)).toEqual([1, 2]);
    expect(workers.every((w) => w.sent.length === 2)).toBe(true);
    pool.close();
  });

  it("propagates worker errors", async () => {
    const { pool, workers } = createPool(1);
    const done = pool.run(model, [{ seed: 1, gameIndex: 1 }], () => false, () => {});
    workers[0]!.onmessage?.({ data: { index: 0, error: "bad game" } } as MessageEvent);
    await expect(done).rejects.toThrow("bad game");
    pool.close();
  });
});
