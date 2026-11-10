import { afterEach, describe, expect, it, vi } from "vitest";
import playtestDecks from "../../config/playtest-decks.json";
import { buildGame, type DeckDef, type GameSetup } from "../../src/ui/decks.ts";
import { VtesEngine, viewFor } from "../../src/engine/index.ts";
import { buildHandlerRegistry } from "../../src/cards/effects/cards.ts";
import { OllamaAgent, ollamaPrompt } from "../../src/ai/ollama-agent.ts";
import { LocalTransport } from "../../src/ui/transport.ts";
import { comparisonGame, comparisonPosition, type ComparisonConfig } from "../../src/ui/bot-comparison.ts";
import { botAgentFor } from "../../src/ui/botagent.ts";
import { DEFAULT_SETTINGS } from "../../src/ui/settings.ts";

const cfg = playtestDecks as unknown as { seed: number; decks: DeckDef[] };
const setup: GameSetup = { decks: cfg.decks, seed: cfg.seed, maxTurns: 40 };
afterEach(() => vi.unstubAllGlobals());

describe("local Ollama agent", () => {
  it("passes only the candidate's masked hand and accepts an offered id", async () => {
    const state = buildGame(setup);
    const engine = new VtesEngine(state, buildHandlerRegistry());
    const dp = engine.decision()!;
    const enemy = engine.state.seats.find((s) => s.id !== dp.seat)!;
    enemy.hand[0]!.name = "PRIVATE-OPPONENT-CARD-SENTINEL";
    const view = viewFor(engine.state, dp.seat);
    const options = dp.options.length > 1 ? dp.options : [dp.options[0]!, { id: "test-extra", kind: "pass" as const, label: "Pass" }];
    const prompt = ollamaPrompt(dp, options, view);
    expect(prompt).not.toContain("PRIVATE-OPPONENT-CARD-SENTINEL");
    expect(prompt).toContain('"rules"');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: options[0]!.id }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const agent = new OllamaAgent("qwen3:8b", 1);
    expect(await agent.decideAsync(dp, options, view, new AbortController().signal)).toBe(options[0]!.id);
    const request = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(request.prompt).not.toContain("PRIVATE-OPPONENT-CARD-SENTINEL");
    expect(agent.fallbacks).toBe(0);
  });

  it("falls back on invented ids and records the failure", async () => {
    const engine = new VtesEngine(buildGame(setup), buildHandlerRegistry());
    const dp = engine.decision()!;
    const view = viewFor(engine.state, dp.seat);
    const options = dp.options.length > 1 ? dp.options : [dp.options[0]!, { id: "test-extra", kind: "pass" as const, label: "Pass" }];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "not-legal" }), { status: 200 })));
    const agent = new OllamaAgent();
    const choice = await agent.decideAsync(dp, options, view, new AbortController().signal);
    expect(options.some((o) => o.id === choice)).toBe(true);
    expect(agent.fallbacks).toBe(1);
    expect(agent.lastError).toMatch(/invalid option/);
  });

  it("retries malformed and illegal answers without recording a fallback", async () => {
    const engine = new VtesEngine(buildGame(setup), buildHandlerRegistry());
    const dp = engine.decision()!;
    const view = viewFor(engine.state, dp.seat);
    const options = dp.options.length > 1 ? dp.options : [dp.options[0]!, { id: "test-extra", kind: "pass" as const, label: "Pass" }];
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "invalid JSON", retryable: true }), { status: 502 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "invented" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: options[0]!.id }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const agent = new OllamaAgent();
    expect(await agent.decideAsync(dp, options, view, new AbortController().signal)).toBe(options[0]!.id);
    expect(agent.requests).toBe(3);
    expect(agent.fallbacks).toBe(0);
    expect(JSON.parse(fetchMock.mock.calls[2]![1].body)).toMatchObject({ attempt: 2, optionIds: options.map((o) => o.id) });
  });

  it("falls back only after exhausting malformed-response retries", async () => {
    const engine = new VtesEngine(buildGame(setup), buildHandlerRegistry());
    const dp = engine.decision()!;
    const view = viewFor(engine.state, dp.seat);
    const options = dp.options.length > 1 ? dp.options : [dp.options[0]!, { id: "test-extra", kind: "pass" as const, label: "Pass" }];
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ error: "invalid JSON", retryable: true }), { status: 502 }));
    vi.stubGlobal("fetch", fetchMock);
    const agent = new OllamaAgent();
    const choice = await agent.decideAsync(dp, options, view, new AbortController().signal);
    expect(options.some((o) => o.id === choice)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(agent.fallbacks).toBe(1);
    expect(agent.lastError).toMatch(/3 attempts/);
  });

  it("includes the pending public card in the prompt", () => {
    const engine = new VtesEngine(buildGame(setup), buildHandlerRegistry());
    const dp = engine.decision()!;
    const view = { ...viewFor(engine.state, dp.seat), pendingCard: { name: "Direct Intervention", seat: "Alice", minion: null, isMaster: false, isEvent: false } };
    expect(JSON.parse(ollamaPrompt(dp, dp.options, view)).pendingCard).toEqual(view.pendingCard);
  });

  it("constructs distinct seat agents from one configured model", () => {
    const settings = { ...DEFAULT_SETTINGS, ollamaModel: "qwen3:8b" };
    const a = botAgentFor("Alice", { playstyle: "ollama", settings });
    const b = botAgentFor("Bob", { playstyle: "ollama", settings });
    expect(a).toBeInstanceOf(OllamaAgent);
    expect(a).not.toBe(b);
    if (!(a instanceof OllamaAgent) || !(b instanceof OllamaAgent)) throw new Error("expected Ollama agents");
    expect(a.model).toBe(b.model);
  });
});

describe("asynchronous table decisions", () => {
  it("waits without exposing a bot decision, and ignores responses after the bot is removed", async () => {
    const t = new LocalTransport({ setup });
    while (t.decision()!.options.length < 2) await t.choose(t.decision()!.options[0]!.id);
    const dp = t.decision()!;
    let resolve!: (value: string) => void;
    let signal!: AbortSignal;
    const asyncAgent = {
      decide: () => dp.options[0]!.id,
      decideAsync: (_dp: unknown, _options: unknown, _view: unknown, s: AbortSignal) => { signal = s; return new Promise<string>((r) => { resolve = r; }); },
    };
    t.setAgent(dp.seat, asyncAgent);
    await Promise.resolve();
    expect(t.isThinking).toBe(true);
    const before = t.history.snapshot().commands.length;
    t.setAgent(dp.seat, null);
    expect(signal.aborted).toBe(true);
    resolve(dp.options[0]!.id);
    await Promise.resolve(); await Promise.resolve();
    expect(t.history.snapshot().commands).toHaveLength(before);
    expect(t.isThinking).toBe(false);
  });

  it("applies a valid delayed response, then continues pumping", async () => {
    const t = new LocalTransport({ setup });
    while (t.decision()!.options.length < 2) await t.choose(t.decision()!.options[0]!.id);
    const dp = t.decision()!;
    let resolve!: (value: string) => void;
    t.setAgent(dp.seat, {
      decide: (_dp, options) => options[0]!.id,
      decideAsync: () => new Promise<string>((r) => { resolve = r; }),
    });
    await Promise.resolve();
    const before = t.history.snapshot().commands.length;
    resolve(dp.options[0]!.id);
    await new Promise((r) => setTimeout(r, 0));
    expect(t.history.snapshot().commands.length).toBeGreaterThan(before);
    t.setAgent(dp.seat, null);
  });

  it("aborts an in-flight response when the table is closed", async () => {
    const t = new LocalTransport({ setup });
    while (t.decision()!.options.length < 2) await t.choose(t.decision()!.options[0]!.id);
    const dp = t.decision()!;
    let resolve!: (value: string) => void;
    let signal!: AbortSignal;
    t.setAgent(dp.seat, {
      decide: (_dp, options) => options[0]!.id,
      decideAsync: (_dp, _options, _view, s) => { signal = s; return new Promise<string>((r) => { resolve = r; }); },
    });
    await Promise.resolve();
    const before = t.history.snapshot().commands.length;
    t.stop();
    expect(signal.aborted).toBe(true);
    resolve(dp.options[0]!.id);
    await Promise.resolve(); await Promise.resolve();
    expect(t.history.snapshot().commands).toHaveLength(before);
    await expect(t.choose(dp.options[0]!.id)).rejects.toThrow(/closed/);
  });

  it("records the actual bot style in a snapshot", () => {
    const t = new LocalTransport({ setup });
    const seat = "Bob";
    t.setAgent(seat, botAgentFor(seat, { playstyle: "ollama", settings: DEFAULT_SETTINGS }));
    expect(t.history.snapshot().botPlaystyles?.[seat]).toBe("ollama");
    t.setAgent(seat, null);
  });
});

describe("paired comparison", () => {
  it("resumes at the next seat and seed without replaying completed pairs", () => {
    const config: ComparisonConfig = { a: "ollama", b: "balanced", deals: 100, seed: 4242, model: "qwen3:8b", neural: null, trained: null };
    expect(comparisonPosition(config, 22)).toEqual({ seed: 4246, seatIndex: 2 });
    expect(comparisonPosition(config, 23)).toEqual({ seed: 4246, seatIndex: 3 });
    expect(comparisonPosition(config, 25)).toEqual({ seed: 4247, seatIndex: 0 });
  });

  it("stops instead of scoring a failed LLM game as Ollama", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "model missing" }), { status: 503 })));
    const config: ComparisonConfig = { a: "ollama", b: "balanced", deals: 1, seed: 4242, model: "missing", neural: null, trained: null };
    await expect(comparisonGame(config, "ollama", 4242, 0)).rejects.toThrow(/fell back to Balanced/);
  }, 30_000);

  it("replays the same initial scenario and deterministic opponents", async () => {
    const config: ComparisonConfig = { a: "balanced", b: "balanced", deals: 1, seed: 4242, model: "qwen3:8b", neural: null, trained: null };
    const a = await comparisonGame(config, "balanced", 4242, 0);
    const b = await comparisonGame(config, "balanced", 4242, 0);
    expect({ ...a, decisionMs: 0 }).toEqual({ ...b, decisionMs: 0 });
  }, 30_000);
});
