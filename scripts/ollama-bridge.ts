/** Dev-only bridge. The upstream is fixed to the local Ollama service. */
import type { Plugin } from "vite";

export function ollamaBridge(): Plugin {
  return {
    name: "vtes-local-ollama",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? "").split("?", 1)[0];
        if (path !== "/__vtes_ollama/decide" && path !== "/__vtes_ollama/status") return next();
        const reply = (status: number, data: unknown) => {
          if (res.writableEnded || res.destroyed) return;
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(data));
        };
        // Never expose a GPU service to the LAN or a website via DNS rebinding.
        const remote = req.socket.remoteAddress ?? "";
        const local = remote === "127.0.0.1" || remote === "::1" || remote === "::ffff:127.0.0.1";
        const host = req.headers.host ?? "";
        let safeOrigin = false;
        try {
          const origin = new URL(req.headers.origin ?? "");
          safeOrigin = origin.host === host && (origin.hostname === "localhost" || origin.hostname === "127.0.0.1" || origin.hostname === "[::1]") && (origin.protocol === "http:" || origin.protocol === "https:");
        } catch { /* no same-origin browser request */ }
        if (req.method !== "POST" || !local || !safeOrigin) { reply(403, { error: "Ollama is available only from the local game page." }); return; }
        if (!(req.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) { reply(415, { error: "Expected JSON." }); return; }
        let size = 0, tooLarge = false;
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > 512 * 1024) { tooLarge = true; reply(413, { error: "Ollama request is too large." }); return; }
          chunks.push(chunk);
        });
        req.on("end", () => {
          if (tooLarge) return;
          void (async () => {
            let body: { model?: unknown; prompt?: unknown };
            try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
            catch { reply(400, { error: "Invalid JSON." }); return; }
            if (typeof body?.model !== "string" || !/^[a-zA-Z0-9_.:/-]{1,120}$/.test(body.model)) { reply(400, { error: "Invalid Ollama model name." }); return; }
            if (path === "/__vtes_ollama/decide" && (typeof body.prompt !== "string" || body.prompt.length > 400_000)) { reply(400, { error: "Invalid decision prompt." }); return; }
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 90_000);
            res.on("close", () => controller.abort());
            try {
              if (path === "/__vtes_ollama/status") {
                const upstream = await fetch("http://127.0.0.1:11434/api/tags", { signal: controller.signal });
                if (!upstream.ok) throw new Error(`Ollama returned HTTP ${upstream.status}`);
                const data = await upstream.json() as { models?: Array<{ name?: string }> };
                const models = (data.models ?? []).map((m) => m.name).filter((n): n is string => typeof n === "string");
                const requested = body.model.includes(":") ? body.model : `${body.model}:latest`;
                reply(200, { available: models.includes(requested), models });
              } else {
                const upstream = await fetch("http://127.0.0.1:11434/api/chat", {
                  method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
                  body: JSON.stringify({ model: body.model, stream: false, think: false, format: "json", options: { temperature: 0, num_predict: 128, num_ctx: 8192 }, messages: [{ role: "user", content: body.prompt }] }),
                });
                if (!upstream.ok) throw new Error(`Ollama returned HTTP ${upstream.status}. Is the selected model installed?`);
                const data = await upstream.json() as { message?: { content?: string } };
                let answer: { id?: unknown };
                try { answer = JSON.parse(data.message?.content ?? ""); } catch { throw new Error("Ollama returned invalid JSON."); }
                if (typeof answer.id !== "string" || answer.id.length > 512) throw new Error("Ollama returned no option id.");
                reply(200, { id: answer.id });
              }
            } catch (error) {
              reply(503, { error: `Local Ollama unavailable: ${error instanceof Error ? error.message : String(error)}` });
            } finally { clearTimeout(timer); }
          })();
        });
      });
    },
  };
}
