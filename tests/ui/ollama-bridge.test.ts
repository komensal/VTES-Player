import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createServer, type ViteDevServer } from "vite";
import { ollamaBridge } from "../../scripts/ollama-bridge.ts";
import type { AddressInfo } from "node:net";

let server: ViteDevServer;
let base: string;
const realFetch = globalThis.fetch.bind(globalThis);
const upstreamCalls: Array<{ url: string; init?: RequestInit }> = [];

beforeAll(async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    if (url.startsWith("http://127.0.0.1:11434/")) {
      upstreamCalls.push({ url, ...(init ? { init } : {}) });
      if (url.endsWith("/api/tags")) return new Response(JSON.stringify({ models: [{ name: "qwen3:8b" }] }), { status: 200 });
      return new Response(JSON.stringify({ message: { content: '{"id":"legal-1"}' } }), { status: 200 });
    }
    return realFetch(input, init);
  });
  server = await createServer({ configFile: false, logLevel: "silent", server: { host: "127.0.0.1", port: 0 }, plugins: [ollamaBridge()] });
  await server.listen();
  base = `http://127.0.0.1:${(server.httpServer!.address() as AddressInfo).port}`;
});
afterAll(async () => { await server?.close(); vi.restoreAllMocks(); });

describe("local Ollama bridge", () => {
  it("checks installed models and translates a JSON decision", async () => {
    const post = (path: string, data: object) => realFetch(`${base}${path}`, { method: "POST", headers: { origin: base, "content-type": "application/json" }, body: JSON.stringify(data) });
    const status = await post("/__vtes_ollama/status", { model: "qwen3:8b" });
    expect(await status.json()).toMatchObject({ available: true });
    const response = await post("/__vtes_ollama/decide", { model: "qwen3:8b", prompt: "legal choices" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: "legal-1" });
    const request = upstreamCalls.find((c) => c.url.endsWith("/api/chat"));
    expect(JSON.parse(String(request?.init?.body))).toMatchObject({ model: "qwen3:8b", format: "json", stream: false, think: false });
  });

  it("rejects cross-origin calls and invalid model names without invoking Ollama", async () => {
    const previous = upstreamCalls.length;
    const cross = await realFetch(`${base}/__vtes_ollama/status`, { method: "POST", headers: { origin: "https://evil.invalid", "content-type": "application/json" }, body: '{"model":"qwen3:8b"}' });
    expect(cross.status).toBe(403);
    const invalid = await realFetch(`${base}/__vtes_ollama/status`, { method: "POST", headers: { origin: base, "content-type": "application/json" }, body: '{"model":"bad model"}' });
    expect(invalid.status).toBe(400);
    expect(upstreamCalls).toHaveLength(previous);
  });
});
