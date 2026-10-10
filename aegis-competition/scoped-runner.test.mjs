import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createScopedRunner, validateScopeManifest } from "./scoped-runner.mjs";

const now = Date.now();
function scope(overrides = {}) {
  return {
    schemaVersion: "1.0",
    engagement: { id: "test-engagement-01", organizer: "Authorized test organizer" },
    authorization: {
      confirmed: true,
      writtenPermissionRef: "TEST-RULES-001",
      approvedBy: "test approver",
      startsAt: new Date(now - 60_000).toISOString(),
      expiresAt: new Date(now + 60 * 60_000).toISOString()
    },
    target: {
      exactTargetConfirmed: true,
      baseUrl: "http://127.0.0.1",
      allowedHeaderNames: [],
      actions: [{ id: "health-status", method: "GET", path: "/status", maxExecutions: 2 }]
    },
    limits: {
      maxActions: 3,
      maxDurationMs: 60_000,
      requestsPerMinute: 3,
      requestTimeoutMs: 2_000,
      maxResponseBytes: 4_096
    },
    successCriteria: "Receive HTTP 200 from the explicitly allow-listed status endpoint.",
    stopConditions: ["Authorization expires", "Any redirect or scope mismatch", "Rate or action budget exhausted"],
    ...overrides
  };
}

function expectReject(fn, match) {
  assert.throws(fn, match);
}
async function expectAsyncReject(fn, match) {
  await assert.rejects(fn, match);
}

expectReject(() => validateScopeManifest(scope({ authorization: { confirmed: false } })), /written, dated authorization/);
expectReject(() => validateScopeManifest(scope({
  target: { exactTargetConfirmed: true, baseUrl: "http://example.com", actions: [{ id: "x", method: "GET", path: "/", maxExecutions: 1 }] }
})), /HTTPS is required/);
expectReject(() => validateScopeManifest(scope({
  target: { exactTargetConfirmed: true, baseUrl: "http://127.0.0.1", actions: [{ id: "x", method: "POST", path: "/", maxExecutions: 1 }] }
})), /only GET, HEAD, and OPTIONS/);
expectReject(() => validateScopeManifest(scope({
  target: { exactTargetConfirmed: true, baseUrl: "http://127.0.0.1", actions: [{ id: "x", method: "GET", path: "/../admin", maxExecutions: 1 }] }
})), /exact absolute path/);
expectReject(() => validateScopeManifest(scope({
  target: { exactTargetConfirmed: true, baseUrl: "http://127.0.0.1", actions: [{ id: "x", method: "GET", path: "//elsewhere", maxExecutions: 1 }] }
})), /exact absolute path/);

const dir = await mkdtemp(join(tmpdir(), "aegis-scope-test-"));
const auditPath = join(dir, "audit.jsonl");
try {
  let calls = 0;
  const runner = await createScopedRunner(scope(), {
    auditPath,
    fetchImpl: async (url, init) => {
      calls++;
      assert.equal(url.origin, "http://127.0.0.1");
      assert.equal(url.pathname, "/status");
      assert.equal(init.method, "GET");
      assert.equal(init.redirect, "manual");
      assert.equal(init.body, undefined);
      return new Response(JSON.stringify({ status: "ready" }), {
        status: 200, headers: { "content-type": "application/json" }
      });
    }
  });
  const result = await runner.runAction("health-status");
  assert.equal(result.status, 200);
  assert.equal(result.ok, true);
  assert.equal(result.body, '{"status":"ready"}');
  assert.equal(calls, 1);
  assert.equal(runner.status().totalActions, 1);
  assert.equal(runner.status().auditRecords, 2);
  await expectAsyncReject(() => createScopedRunner(scope(), { auditPath, fetchImpl: async () => new Response("must not run") }), /locked/);
  await runner.close();

  // Budget counters restore from the persisted chain after restart.
  const reopened = await createScopedRunner(scope(), {
    auditPath,
    fetchImpl: async () => { throw new Error("should not be called in this assertion"); }
  });
  assert.equal(reopened.status().totalActions, 1);
  assert.equal(reopened.status().stopped, false);
  await reopened.close();

  // A redirect is never followed and stops the runner.
  const redirectRunner = await createScopedRunner(scope({ engagement: { id: "redirect-test", organizer: "Organizer" } }), {
    auditPath: join(dir, "redirect.jsonl"),
    fetchImpl: async () => new Response(null, { status: 302, headers: { location: "https://outside.example/" } })
  });
  const redirectResult = await redirectRunner.runAction("health-status");
  assert.equal(redirectResult.stopped, true);
  assert.match(redirectResult.stopReason, /redirect blocked/);
  await expectAsyncReject(() => redirectRunner.runAction("health-status"), /runner is stopped/);
  await redirectRunner.close();

  // Authentication and rate-limit responses cause an immediate stop.
  const authRunner = await createScopedRunner(scope({ engagement: { id: "auth-test", organizer: "Organizer" } }), {
    auditPath: join(dir, "auth.jsonl"),
    fetchImpl: async () => new Response("denied", { status: 403 })
  });
  const authResult = await authRunner.runAction("health-status");
  assert.equal(authResult.stopped, true);
  assert.match(authResult.stopReason, /status 403/);
  await authRunner.close();

  // Runtime credentials must be explicitly header-allow-listed.
  const headerScope = scope({
    engagement: { id: "header-test", organizer: "Organizer" },
    target: {
      exactTargetConfirmed: true, baseUrl: "http://127.0.0.1",
      allowedHeaderNames: ["authorization"],
      actions: [{ id: "health-status", method: "GET", path: "/status", maxExecutions: 1 }]
    }
  });
  const headerRunner = await createScopedRunner(headerScope, {
    auditPath: join(dir, "header.jsonl"),
    getHeaders: () => ({ Cookie: "not-allowed" }),
    fetchImpl: async () => { throw new Error("blocked headers must stop before network"); }
  });
  await expectAsyncReject(() => headerRunner.runAction("health-status"), /runtime header is not allow-listed/);
  await headerRunner.close();

  // A corrupted audit trail fails closed at reopen.
  const tamperPath = join(dir, "tampered.jsonl");
  const tamperRunner = await createScopedRunner(scope({ engagement: { id: "tamper-test", organizer: "Organizer" } }), {
    auditPath: tamperPath,
    fetchImpl: async () => new Response("ok", { status: 200 })
  });
  await tamperRunner.runAction("health-status");
  await tamperRunner.close();
  const original = await readFile(tamperPath, "utf8");
  await import("node:fs/promises").then(fs => fs.writeFile(tamperPath, original.replace('"status":200', '"status":201')));
  await expectAsyncReject(() => createScopedRunner(scope({ engagement: { id: "tamper-test", organizer: "Organizer" } }), {
    auditPath: tamperPath, fetchImpl: async () => new Response("should not run")
  }), /audit ledger chain or engagement identifier is invalid|audit ledger record hash mismatch/);

  console.log("AEGIS scoped-runner tests: PASS");
} finally {
  await rm(dir, { recursive: true, force: true });
}
