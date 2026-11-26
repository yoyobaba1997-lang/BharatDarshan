import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

async function startApi(t, envOverrides = {}) {
  const port = 47000 + Math.floor(Math.random() * 1000);
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["src/server.js"], {
    cwd: new URL("../", import.meta.url),
    env: { ...process.env, PORT: String(port), ...envOverrides },
    stdio: "ignore"
  });
  t.after(() => child.kill());
  for (let i = 0; i < 50; i++) {
    try {
      const response = await fetch(base + "/health");
      if (response.ok) return { base, child };
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("API server did not become healthy");
}

test("rate limit returns 429 and Retry-After based on configured window", async t => {
  const { base } = await startApi(t, { API_RATE_LIMIT: "2", API_RATE_WINDOW_MS: "5000" });
  const first = await fetch(base + "/health");
  const second = await fetch(base + "/health");
  const third = await fetch(base + "/health");
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(third.status, 429);
  assert.equal(third.headers.get("retry-after"), "5");
  const body = await third.json();
  assert.match(body.error, /Rate limit exceeded/);
});

test("invalid rate-limit settings safely fall back to defaults", async t => {
  const { base } = await startApi(t, { API_RATE_LIMIT: "0", API_RATE_WINDOW_MS: "bad" });
  for (let i = 0; i < 3; i++) {
    const response = await fetch(base + "/health");
    assert.equal(response.status, 200);
  }
});
