import assert from "node:assert/strict";

const base = (process.env.NEXUS_SMOKE_TEST_URL || "https://nexus-ai-hub-wfrk.netlify.app").replace(/\/$/, "");
const timeout = (ms = 20000) => AbortSignal.timeout(ms);

async function getJson(path) {
  const response = await fetch(`${base}${path}`, { signal: timeout() });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { throw new Error(`${path}: HTTP ${response.status}, non-JSON response: ${text.slice(0, 160)}`); }
  assert.ok(response.ok, `${path}: HTTP ${response.status}`);
  return body;
}

const home = await fetch(base, { signal: timeout() });
const html = await home.text();
assert.ok(home.ok, `Frontend returned HTTP ${home.status}`);
assert.ok(html.includes('<div id="root"></div>'), "Frontend HTML is missing the React root");
console.log("Frontend: PASS");

const health = await getJson("/api/_healthcheck");
assert.equal(health.ok, true, "Health check did not report ok=true");
assert.equal(health.service, "nexus", "Health check service name is incorrect");
console.log("Health endpoint: PASS");

const status = await getJson("/api/status");
assert.equal(status.status, "ready", "API status is not ready");
assert.ok(status.providers && typeof status.providers === "object", "Provider status object is missing");
console.log("Provider configuration:", JSON.stringify(status.providers));

const teamResponse = await fetch(`${base}/api/team`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "Responde exactamente OK en una frase corta. Esta es una prueba técnica; no inventes resultados." }),
  signal: timeout(24000),
});
const raw = await teamResponse.text();
let team;
try { team = JSON.parse(raw); } catch { throw new Error(`Team endpoint returned HTTP ${teamResponse.status} with non-JSON body: ${raw.slice(0, 160)}`); }
const expected = ["architect", "researcher", "coder", "critic", "synthesis"];
const statuses = team.statuses || {};
console.log("Team model names:", JSON.stringify(team.models || {}));
console.log("Team statuses:", JSON.stringify(statuses));
if (team.warnings?.length) console.log("Sanitized warnings:", JSON.stringify(team.warnings));
assert.ok(teamResponse.ok, `Team endpoint returned HTTP ${teamResponse.status}${team.error ? `: ${team.error}` : ""}`);
const failed = expected.filter((role) => statuses[role] !== true);
assert.equal(failed.length, 0, `Team smoke test failed roles: ${failed.join(", ")}`);
assert.ok(typeof team.final === "string" && team.final.trim(), "Synthesis returned no final text");
console.log("Five-model team smoke test: PASS");
