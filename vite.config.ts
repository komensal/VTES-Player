import { appendFileSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { basename, resolve } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

/**
 * Writes each playthrough's log into `logs/` in the repo
 * (docs/game-log-design.md).
 *
 * DEV SERVER ONLY, and that is the whole design: the browser cannot write
 * to disk, but the owner plays through `Play VTES.bat`, which runs the dev
 * server — so the file lands in the repo, ready for Claude Code to read,
 * with nobody having to export anything. The published static site has no
 * such endpoint and the client falls back to keeping the log in memory.
 *
 * `basename` is not decoration: the file name arrives over HTTP, so
 * without it a request for `../../etc/passwd` would be honoured. It is
 * stripped to a bare name and forced under `logs/`.
 */
function gameLogPlugin(): Plugin {
  const dir = resolve(process.cwd(), "logs");
  return {
    name: "vtes-game-log",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        if (req.method !== "POST" || !url.startsWith("/__vtes_log/")) return next();

        const name = basename(decodeURIComponent(url.slice("/__vtes_log/".length)));
        if (!/^[\w.-]+\.log$/.test(name)) {
          res.statusCode = 400;
          res.end("bad log name");
          return;
        }
        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", () => {
          try {
            mkdirSync(dir, { recursive: true });
            appendFileSync(resolve(dir, name), Buffer.concat(chunks));
            res.statusCode = 204;
            res.end();
          } catch (err) {
            // Never take the game down over a log line.
            server.config.logger.warn(`[vtes] could not write logs/${name}: ${String(err)}`);
            res.statusCode = 500;
            res.end("write failed");
          }
        });
      });
    },
  };
}

/** Local-only bridge to the user's Python/PyTorch installation. Game rollouts
 * stay in the browser's ordinary engine; only encoded public decisions and
 * rewards cross this same-origin endpoint for a gradient update. */
function mlTrainingPlugin(): Plugin {
  return {
    name: "vtes-local-pytorch-training",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "POST" || (req.url ?? "").split("?", 1)[0] !== "/__vtes_ml/train") return next();
        const chunks: Buffer[] = [];
        let size = 0;
        let finished = false;
        const maxBytes = 128 * 1024 * 1024;
        req.on("data", (chunk: Buffer) => {
          if (finished) return;
          size += chunk.length;
          if (size > maxBytes) {
            finished = true;
            res.statusCode = 413;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Training batch exceeds 128 MB. Reduce games per round." }));
            return;
          }
          chunks.push(chunk);
        });
        req.on("end", () => {
          if (finished) return;
          let body: string;
          try { body = Buffer.concat(chunks).toString("utf8"); }
          catch { res.statusCode = 400; res.end(JSON.stringify({ error: "Could not read training batch." })); return; }

          const python = process.env.VTES_PYTHON || (process.platform === "win32" ? "python" : "python3");
          const script = resolve(process.cwd(), "scripts", "train_ml.py");
          const child = spawn(python, [script], { cwd: process.cwd(), windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
          let stdout = "";
          let stderr = "";
          const outputLimit = 32 * 1024 * 1024;
          child.stdout.setEncoding("utf8");
          child.stderr.setEncoding("utf8");
          child.stdout.on("data", (text: string) => { if (stdout.length < outputLimit) stdout += text; });
          child.stderr.on("data", (text: string) => { if (stderr.length < 100_000) stderr += text; });
          const timer = setTimeout(() => child.kill(), 10 * 60 * 1000);
          child.on("error", (error) => {
            clearTimeout(timer);
            if (res.writableEnded) return;
            res.statusCode = 503;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: `Cannot start ${python}. Install Python and PyTorch, or set VTES_PYTHON.`, detail: String(error) }));
          });
          child.on("close", (code) => {
            clearTimeout(timer);
            if (res.writableEnded) return;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            if (code !== 0) {
              res.statusCode = 503;
              res.end(JSON.stringify({ error: "PyTorch training failed. Check the local Python environment.", detail: stderr.slice(-6000) }));
              return;
            }
            try {
              const result = JSON.parse(stdout);
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: "PyTorch trainer returned invalid JSON.", detail: stderr.slice(-2000) }));
            }
          });
          child.stdin.on("error", () => {});
          child.stdin.end(body);
        });
      });
    },
  };
}

export default defineConfig({
  // GitHub Pages serves from /<repo>/ — adjust base when the repo name is set.
  base: "./",
  // The Arena preview is proxied through a generated e2b.app hostname.
  server: { host: "0.0.0.0", allowedHosts: true },
  plugins: [gameLogPlugin(), mlTrainingPlugin()],
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
