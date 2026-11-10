import { describe, expect, it } from "vitest";
import { HeuristicWorkerPool } from "../../src/ui/heuristic-worker-pool.ts";
import type { TrainingGameTask } from "../../src/ai/trainer.ts";

class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  sent: Array<{ index: number; task: TrainingGameTask }> = [];
  terminated = false;
  postMessage(message: { index: number; task: TrainingGameTask }) { this.sent.push(message); }
  terminate() { this.terminated = true; }
  reply(index: number) { this.onmessage?.({ data: { index, result: { victoryPoints: index, won: false, ousted: false, error: false } } } as MessageEvent); }
}
function createPool(count: number) {
  const workers: FakeWorker[] = [];
  const pool = new HeuristicWorkerPool(count, () => {
    const worker = new FakeWorker(); workers.push(worker); return worker as unknown as Worker;
  });
  return { workers, pool };
}
const tasks: TrainingGameTask[] = [0, 1, 2, 3].map((i) => ({ candidateIndex: i % 2, gameIndex: i, seed: 42 + i, weights: {} }));

describe("heuristic game worker pool", () => {
  it("schedules simultaneously and reuses idle workers for out-of-order games", async () => {
    const { pool, workers } = createPool(2);
    const received: number[] = [];
    const done = pool.run(tasks, () => false, (i) => received.push(i));
    expect(workers.map((w) => w.sent[0]!.index)).toEqual([0, 1]);
    workers[1]!.reply(1);
    expect(workers[1]!.sent[1]!.index).toBe(2);
    workers[1]!.reply(2);
    expect(workers[1]!.sent[2]!.index).toBe(3);
    workers[0]!.reply(0);
    workers[1]!.reply(3);
    await done;
    expect(received).toEqual([1, 2, 0, 3]);
    pool.close();
    expect(workers.every((w) => w.terminated)).toBe(true);
  });

  it("stops dispatching after cancellation and keeps in-flight results", async () => {
    const { pool, workers } = createPool(2);
    let cancelled = false;
    const received: number[] = [];
    const done = pool.run(tasks, () => cancelled, (i) => received.push(i));
    cancelled = true;
    workers[1]!.reply(1); workers[0]!.reply(0);
    await done;
    expect(received).toEqual([1, 0]);
    expect(workers.map((w) => w.sent.length)).toEqual([1, 1]);
    pool.close();
  });

  it("propagates failures and rejects an unexpected response", async () => {
    const { pool, workers } = createPool(1);
    const done = pool.run(tasks, () => false, () => {});
    workers[0]!.reply(2);
    await expect(done).rejects.toThrow(/unexpected game/);
    pool.close();
    const other = createPool(1);
    const failed = other.pool.run(tasks, () => false, () => {});
    other.workers[0]!.onmessage?.({ data: { index: 0, error: "broken" } } as MessageEvent);
    await expect(failed).rejects.toThrow("broken");
    other.pool.close();
  });

  it("terminates already created workers if construction fails", () => {
    const worker = new FakeWorker();
    let calls = 0;
    expect(() => new HeuristicWorkerPool(2, () => {
      if (++calls === 2) throw new Error("worker refused");
      return worker as unknown as Worker;
    })).toThrow("worker refused");
    expect(worker.terminated).toBe(true);
  });
});
