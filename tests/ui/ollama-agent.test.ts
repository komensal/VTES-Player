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
import { makeMinion, testRegistry, threeSeatGame } from "../engine/fixtures.ts";

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

  it("explains signed referendum impacts to the affected voter", () => {
    const engine = new VtesEngine(buildGame(setup), buildHandlerRegistry());
    const dp = engine.decision()!;
    const original = viewFor(engine.state, dp.seat);
    const victim = original.seats.find((s) => s.id !== original.you)!;
    const view = { ...original, referendum: { caller: original.you, cardName: "Kine Resources Contested", variant: "political" as const, callingMinion: null, step: "polling" as const, terms: { alloc: `${victim.id}=3` }, votesFor: 3, votesAgainst: 0, usedSources: [], bloodHuntTarget: null, effectKind: "burn" as const, perSeat: { [victim.id]: -3 } } };
    const prompt = JSON.parse(ollamaPrompt({ ...dp, window: "referendum.polling" }, dp.options, { ...view, you: victim.id }));
    expect(prompt.voteContext.yourKnownPoolChange).toBe(-3);
    expect(prompt.voteContext.poolChangesIfPassed[victim.id]).toBe(-3);
    expect(prompt.voteContext.guidance).toMatch(/Negative pool change means loss/);
    expect(prompt.voteContext.prey).toBeTruthy();
    const parity = JSON.parse(ollamaPrompt({ ...dp, window: "referendum.polling" }, dp.options, {
      ...view, you: victim.id,
      referendum: { ...view.referendum, cardName: "Parity Shift", effectKind: "burn" as const, perSeat: { [victim.id]: 3, [original.you]: -3 } },
    }));
    expect(parity.voteContext.yourKnownPoolChange).toBe(3);
    expect(parity.voteContext.poolChangesIfPassed[original.you]).toBe(-3);
    const { perSeat: _perSeat, ...withoutPerSeat } = view.referendum;
    const unknown = JSON.parse(ollamaPrompt({ ...dp, window: "referendum.polling" }, dp.options, { ...view, referendum: withoutPerSeat }));
    expect(unknown.voteContext.poolChangesIfPassed).toBeNull();
    expect(unknown.voteContext.yourKnownPoolChange).toBeNull();
  });

  it("avoids transferring its last pool while keeping the engine's legal choices intact", async () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    alice.pool = 1;
    alice.uncontrolled.push({ card: makeMinion("X", "Alice", { capacity: 5 }), counters: 2 });
    alice.crypt.push(makeMinion("Y", "Alice"));
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.phase = "influence"; turn.transfersLeft = 4;
    const engine = new VtesEngine(state, testRegistry);
    const dp = engine.decision()!;
    expect(dp.options.some((o) => o.kind === "transferToVampire")).toBe(true);
    expect(dp.options.some((o) => o.kind === "cryptDraw")).toBe(true);
    const fetchMock = vi.fn().mockImplementation(async (_url, init) => {
      const body = JSON.parse(init.body);
      expect(body.optionIds).not.toContain("inf:add:X");
      expect(body.optionIds).not.toContain("inf:crypt");
      expect(body.optionIds).toContain("inf:take:X");
      return new Response(JSON.stringify({ id: "inf:take:X" }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const agent = new OllamaAgent();
    expect(await agent.decideAsync(dp, dp.options, viewFor(state, "Alice"), new AbortController().signal)).toBe("inf:take:X");
    expect(fetchMock).toHaveBeenCalledOnce();
    alice.pool = 8;
    const fetchSafe = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "inf:add:X" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchSafe);
    expect(await agent.decideAsync(dp, dp.options, viewFor(state, "Alice"), new AbortController().signal)).toBe("inf:add:X");
    expect(JSON.parse(fetchSafe.mock.calls[0]![1].body).optionIds).toContain("inf:crypt");
  });

  it("concentrates transfers, then moves the completed vampire into play", async () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    alice.minions = []; alice.pool = 10;
    alice.uncontrolled = [
      { card: makeMinion("near", "Alice", { capacity: 5 }), counters: 3 },
      { card: makeMinion("far", "Alice", { capacity: 7 }), counters: 2 },
    ];
    state.seats[1]!.uncontrolled.push({ card: makeMinion("SECRET-OPPONENT", "Bob"), counters: 4 });
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.phase = "influence"; turn.transfersLeft = 4;
    const engine = new VtesEngine(state, testRegistry);
    const fetchMock = vi.fn().mockImplementation(async (_url, init) => {
      const request = JSON.parse(init.body);
      expect(request.optionIds).toContain("inf:add:near");
      expect(request.optionIds).not.toContain("inf:add:far");
      expect(request.prompt).not.toContain("SECRET-OPPONENT");
      expect(JSON.parse(request.prompt).influenceContext.candidates).toContainEqual({ id: "near", capacity: 5, counters: alice.uncontrolled[0]!.counters, remaining: 5 - alice.uncontrolled[0]!.counters });
      return new Response(JSON.stringify({ id: "inf:add:near" }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const agent = new OllamaAgent();
    for (let i = 0; i < 3; i++) {
      const dp = engine.decision()!;
      engine.choose(await agent.decideAsync(dp, dp.options, viewFor(state, "Alice"), new AbortController().signal));
    }
    expect(alice.minions.some((m) => m.id === "near")).toBe(true);
    expect(alice.uncontrolled.find((u) => u.card.id === "far")!.counters).toBe(2);
    expect(alice.pool).toBe(8);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not spend low pool on an unaffordable vampire or oscillate in fallback", async () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    alice.minions = []; alice.pool = 3;
    alice.uncontrolled = [{ card: makeMinion("large", "Alice", { capacity: 8 }), counters: 3 }];
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.phase = "influence"; turn.transfersLeft = 4;
    const engine = new VtesEngine(state, testRegistry);
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    const agent = new OllamaAgent();
    for (let i = 0; i < 3; i++) {
      const dp = engine.decision()!;
      if (dp.window !== "turn.influence") break;
      const choice = await agent.decideAsync(dp, dp.options, viewFor(state, "Alice"), new AbortController().signal);
      expect(choice).not.toBe("inf:add:large");
      engine.choose(choice);
    }
    expect(alice.pool).toBeGreaterThanOrEqual(3);
    expect(engine.decision()!.window).not.toBe("turn.influence");
    expect(agent.fallbacks).toBeGreaterThan(0);
  });

  it("allows a boardless seat to finish at low pool without taking counters back", async () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    alice.minions = []; alice.pool = 3;
    alice.uncontrolled = [{ card: makeMinion("near", "Alice", { capacity: 5 }), counters: 3 }];
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.phase = "influence"; turn.transfersLeft = 4;
    const engine = new VtesEngine(state, testRegistry);
    const fetchMock = vi.fn().mockImplementation(async (_url, init) => {
      const ids = JSON.parse(init.body).optionIds;
      expect(ids).toContain("inf:add:near");
      expect(ids).not.toContain("inf:take:near");
      return new Response(JSON.stringify({ id: "inf:add:near" }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const agent = new OllamaAgent();
    for (let i = 0; i < 3; i++) {
      const dp = engine.decision()!;
      engine.choose(await agent.decideAsync(dp, dp.options, viewFor(state, "Alice"), new AbortController().signal));
    }
    expect(alice.pool).toBe(1);
    expect(alice.minions.some((m) => m.id === "near")).toBe(true);
  });

  it("uses effective capacity and leaves contested entries to the model", async () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    const card = makeMinion("boosted", "Alice", { capacity: 4, attached: [{ card: { id: "boost", name: "Capacity" }, locked: false, usedThisPhase: false, statics: { capacityBonus: 2 }, tags: [] }] });
    alice.uncontrolled = [{ card, counters: 4 }, { card: makeMinion("other", "Alice", { capacity: 5 }), counters: 4 }];
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.phase = "influence"; turn.transfersLeft = 4;
    const engine = new VtesEngine(state, testRegistry);
    const dp = engine.decision()!;
    const prompt = JSON.parse(ollamaPrompt(dp, dp.options, viewFor(state, "Alice")));
    expect(prompt.influenceContext.candidates[0]).toMatchObject({ capacity: 6, remaining: 2 });
    const fetchMock = vi.fn().mockImplementation(async (_url, init) => {
      const ids = JSON.parse(init.body).optionIds;
      expect(ids).toContain("inf:add:other");
      expect(ids).not.toContain("inf:add:boosted");
      return new Response(JSON.stringify({ id: "inf:add:other" }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    await new OllamaAgent().decideAsync(dp, dp.options, viewFor(state, "Alice"), new AbortController().signal);
    expect(fetchMock).toHaveBeenCalledOnce();
    alice.uncontrolled[1]!.counters = 5;
    state.seats[1]!.minions[0]!.name = "other";
    const contested = engine.decision()!;
    const fetchContest = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "pass" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchContest);
    await new OllamaAgent().decideAsync(contested, contested.options, viewFor(state, "Alice"), new AbortController().signal);
    expect(fetchContest).toHaveBeenCalledOnce();
  });

  it("keeps card abilities and taxed entries available for model judgment", async () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    alice.uncontrolled = [{ card: makeMinion("full", "Alice", { capacity: 5 }), counters: 5 }];
    state.seats[1]!.permanents.push({ card: { id: "tax", name: "Masquerade Enforcement" }, locked: false, usedThisPhase: false, statics: { influenceOutPoolTax: 1 }, tags: [] });
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.phase = "influence"; turn.transfersLeft = 4;
    const engine = new VtesEngine(state, testRegistry);
    const dp = engine.decision()!;
    const fetchMock = vi.fn().mockImplementation(async (_url, init) => {
      const ids = JSON.parse(init.body).optionIds;
      expect(ids).toContain("inf:out:full");
      expect(ids).toContain("pass");
      return new Response(JSON.stringify({ id: "pass" }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    expect(await new OllamaAgent().decideAsync(dp, dp.options, viewFor(state, "Alice"), new AbortController().signal)).toBe("pass");
    alice.pool = 2; alice.minions = [];
    alice.uncontrolled.push({ card: makeMinion("unfunded", "Alice", { capacity: 5 }), counters: 4 });
    const withTax = engine.decision()!;
    const taxed = vi.fn().mockImplementation(async (_url, init) => {
      const ids = JSON.parse(init.body).optionIds;
      expect(ids).not.toContain("inf:add:unfunded");
      return new Response(JSON.stringify({ id: "pass" }), { status: 200 });
    });
    vi.stubGlobal("fetch", taxed);
    await new OllamaAgent().decideAsync(withTax, withTax.options, viewFor(state, "Alice"), new AbortController().signal);
    expect(taxed).toHaveBeenCalledOnce();
    state.seats[1]!.permanents = [];
    const special = { id: "special", kind: "playCard" as const, label: "Special", card: "c1", name: "Special", minion: null, mode: null, params: {}, cost: { blood: 0, pool: 0 }, effects: [] };
    const specialDp = engine.decision()!;
    const abilityFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "special" }), { status: 200 }));
    vi.stubGlobal("fetch", abilityFetch);
    expect(await new OllamaAgent().decideAsync(specialDp, [...specialDp.options, special], viewFor(state, "Alice"), new AbortController().signal)).toBe("special");
  });

  it("concentrates and graduates with the fallback when the service is offline", async () => {
    const state = threeSeatGame();
    const alice = state.seats[0]!;
    alice.minions = []; alice.pool = 10;
    alice.uncontrolled = [{ card: makeMinion("near", "Alice", { capacity: 5 }), counters: 3 }, { card: makeMinion("far", "Alice", { capacity: 7 }), counters: 2 }];
    const turn = state.frames[0]!;
    if (turn.kind !== "turn") throw new Error("fixture");
    turn.phase = "influence"; turn.transfersLeft = 4;
    const engine = new VtesEngine(state, testRegistry);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const agent = new OllamaAgent();
    for (let i = 0; i < 3; i++) {
      const dp = engine.decision()!;
      engine.choose(await agent.decideAsync(dp, dp.options, viewFor(state, "Alice"), new AbortController().signal));
    }
    expect(agent.fallbacks).toBeGreaterThan(0);
    expect(alice.minions.some((m) => m.id === "near")).toBe(true);
    expect(alice.uncontrolled.find((u) => u.card.id === "far")!.counters).toBe(2);
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
