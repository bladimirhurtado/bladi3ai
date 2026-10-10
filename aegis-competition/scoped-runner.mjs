import { createHash } from "node:crypto";
import { appendFile, mkdir, open, readFile, unlink } from "node:fs/promises";
import { dirname } from "node:path";

const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const FORBIDDEN_HEADERS = new Set([
  "cookie", "set-cookie", "host", "content-length", "transfer-encoding",
  "connection", "proxy-authorization", "proxy-authenticate", "origin", "referer"
]);
const GENESIS = "GENESIS";

function reject(message) {
  throw new Error("AEGIS_SCOPE_GATE: " + message);
}
function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function isIsoDate(value) {
  return nonEmptyString(value) && Number.isFinite(Date.parse(value));
}
function boundedInteger(value, min, max) {
  return Number.isSafeInteger(value) && value >= min && value <= max;
}
function hashObject(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
function loopback(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
}
function validPath(path) {
  return typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("\\") &&
    !/[?#\u0000-\u001f]/.test(path) &&
    !path.split("/").some(part => part === "." || part === "..");
}

/**
 * Validate the organizer-approved scope card. Fails closed: live execution is
 * impossible unless explicit written authorization, exact routes, and bounded
 * limits are present. This initial adapter intentionally supports read-only
 * HTTP methods only; it does not scan, exploit, authenticate by guessing, or
 * follow redirects.
 */
export function validateScopeManifest(manifest, now = Date.now()) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) reject("scope manifest must be an object");
  if (manifest.schemaVersion !== "1.0") reject("unsupported schemaVersion");
  const engagement = manifest.engagement;
  if (!engagement || !nonEmptyString(engagement.id) || !nonEmptyString(engagement.organizer)) {
    reject("engagement id and organizer are required");
  }
  const authorization = manifest.authorization;
  if (!authorization || authorization.confirmed !== true ||
      !nonEmptyString(authorization.writtenPermissionRef) ||
      !nonEmptyString(authorization.approvedBy) ||
      !isIsoDate(authorization.startsAt) || !isIsoDate(authorization.expiresAt)) {
    reject("written, dated authorization is required");
  }
  const startsAt = Date.parse(authorization.startsAt);
  const expiresAt = Date.parse(authorization.expiresAt);
  if (startsAt >= expiresAt) reject("authorization time window is invalid");
  if (now < startsAt) reject("authorization window has not started");
  if (now >= expiresAt) reject("authorization has expired");

  const target = manifest.target;
  if (!target || target.exactTargetConfirmed !== true || !nonEmptyString(target.baseUrl)) {
    reject("exact target must be explicitly confirmed");
  }
  let base;
  try { base = new URL(target.baseUrl); } catch { reject("target baseUrl is not a valid absolute URL"); }
  if (base.username || base.password || base.search || base.hash) reject("target URL must not contain credentials, query, or fragment");
  if (base.pathname !== "/") reject("target baseUrl must be an origin; routes belong in the exact action list");
  if (base.protocol !== "https:" && !(base.protocol === "http:" && loopback(base.hostname)) &&
      !(base.protocol === "http:" && target.allowPlainHttp === true && nonEmptyString(authorization.writtenPermissionRef))) {
    reject("HTTPS is required except for loopback labs or explicitly authorized internal HTTP");
  }

  const limits = manifest.limits;
  if (!limits ||
      !boundedInteger(limits.maxActions, 1, 500) ||
      !boundedInteger(limits.maxDurationMs, 1000, 3_600_000) ||
      !boundedInteger(limits.requestsPerMinute, 1, 60) ||
      !boundedInteger(limits.requestTimeoutMs, 100, 60_000) ||
      !boundedInteger(limits.maxResponseBytes, 256, 1_000_000)) {
    reject("limits are missing or outside enforced bounds");
  }
  if (!nonEmptyString(manifest.successCriteria)) reject("measurable success criteria are required");
  if (!Array.isArray(manifest.stopConditions) || manifest.stopConditions.length === 0 ||
      !manifest.stopConditions.every(nonEmptyString)) reject("explicit stop conditions are required");

  if (!Array.isArray(target.actions) || target.actions.length === 0) reject("at least one exact action must be allow-listed");
  const ids = new Set();
  for (const action of target.actions) {
    if (!action || !/^[a-z0-9][a-z0-9._-]{0,63}$/.test(action.id || "")) reject("action id is invalid");
    if (ids.has(action.id)) reject("duplicate action id: " + action.id);
    ids.add(action.id);
    if (!READ_ONLY_METHODS.has(action.method)) reject("only GET, HEAD, and OPTIONS are currently permitted");
    if (!validPath(action.path)) reject("action path must be an exact absolute path without traversal/query/fragment");
    if (!boundedInteger(action.maxExecutions, 1, limits.maxActions)) reject("action maxExecutions is invalid");
  }

  const allowedHeaderNames = target.allowedHeaderNames ?? [];
  if (!Array.isArray(allowedHeaderNames) || !allowedHeaderNames.every(name => typeof name === "string" && /^[a-z0-9-]+$/i.test(name))) {
    reject("allowedHeaderNames must be a list of header names");
  }
  for (const name of allowedHeaderNames) {
    if (FORBIDDEN_HEADERS.has(name.toLowerCase()) || name.toLowerCase().startsWith("proxy-")) {
      reject("unsafe header cannot be allow-listed: " + name);
    }
  }
  return { manifest, baseUrl: base, startsAt, expiresAt };
}

function parseLedgerLine(line, expectedPrevious, engagementId, scopeHash) {
  let record;
  try { record = JSON.parse(line); } catch { reject("audit ledger contains invalid JSON"); }
  if (!record || record.schemaVersion !== "1.0" || record.engagementId !== engagementId ||
      !isIsoDate(record.timestamp) || !nonEmptyString(record.type) ||
      record.previousHash !== expectedPrevious || typeof record.hash !== "string") {
    reject("audit ledger chain or engagement identifier is invalid");
  }
  if (record.scopeHash !== scopeHash) reject("audit ledger scope hash mismatch");
  const { hash, ...unsigned } = record;
  if (hashObject(unsigned) !== hash) reject("audit ledger record hash mismatch");
  return record;
}

async function readLedger(auditPath, engagementId, scopeHash) {
  try {
    const raw = await readFile(auditPath, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const records = [];
    let previous = GENESIS;
    for (const line of lines) {
      const record = parseLedgerLine(line, previous, engagementId, scopeHash);
      records.push(record);
      previous = record.hash;
    }
    return records;
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

/**
 * Create a scoped HTTP runner for an organizer-approved engagement.
 *
 * Every request must be named in target.actions. Callers cannot provide a URL,
 * HTTP method, body, or redirect destination. Credentials may be supplied via
 * getHeaders at runtime; only manifest-allow-listed headers are accepted.
 * Audit entries are chained and persisted before a request is sent.
 */
export async function createScopedRunner(manifest, options = {}) {
  const now = options.clock ?? Date.now;
  validateScopeManifest(manifest, now());
  // Detach from caller-owned objects so later mutation cannot expand scope.
  manifest = JSON.parse(JSON.stringify(manifest));
  const validated = validateScopeManifest(manifest, now());
  const scopeHash = hashObject(manifest);
  const auditPath = options.auditPath;
  if (!nonEmptyString(auditPath)) reject("a durable auditPath is mandatory");
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") reject("fetch implementation is unavailable");
  const onEvent = typeof options.onEvent === "function" ? options.onEvent : () => {};
  const getHeaders = typeof options.getHeaders === "function" ? options.getHeaders : async () => ({});
  await mkdir(dirname(auditPath), { recursive: true });
  const lockPath = options.lockPath ?? (auditPath + ".lock");
  let lockHandle;
  try {
    lockHandle = await open(lockPath, "wx", 0o600);
    await lockHandle.writeFile(JSON.stringify({
      engagementId: manifest.engagement.id,
      pid: process.pid,
      acquiredAt: new Date(now()).toISOString()
    }));
    await lockHandle.sync();
  } catch (error) {
    if (lockHandle) await lockHandle.close().catch(() => {});
    if (error?.code === "EEXIST") reject("audit ledger is locked or a stale lock needs operator review");
    throw error;
  }

  let records;
  try {
    records = await readLedger(auditPath, manifest.engagement.id, scopeHash);
  } catch (error) {
    await lockHandle.close().catch(() => {});
    await unlink(lockPath).catch(() => {});
    throw error;
  }
  let previousHash = records.at(-1)?.hash ?? GENESIS;
  let auditRecordCount = records.length;
  let startedAt = records.length ? Date.parse(records[0].timestamp) : now();
  let totalActions = 0;
  const perAction = new Map();
  const recentActions = [];
  const inFlight = new Set();
  let stopped = false;
  let stopReason = null;
  let busy = false;
  let closed = false;
  let activeController = null;
  let auditQueue = Promise.resolve();
  let auditBroken = false;

  for (const record of records) {
    if (record.type === "action_started") {
      totalActions++;
      perAction.set(record.actionId, (perAction.get(record.actionId) ?? 0) + 1);
      recentActions.push(Date.parse(record.timestamp));
      inFlight.add(record.attemptId);
    } else if (record.type === "action_completed" || record.type === "action_failed") {
      inFlight.delete(record.attemptId);
    } else if (record.type === "runner_stopped") {
      stopped = true;
      stopReason = record.reason;
    }
  }
  if (inFlight.size > 0) {
    stopped = true;
    stopReason = "unresolved action found in previous session; operator review required";
  }

  async function appendEvent(type, details = {}) {
    if (auditBroken) reject("audit ledger is unavailable; session remains halted");
    const write = auditQueue.then(async () => {
      if (auditBroken) reject("audit ledger is unavailable; session remains halted");
      const unsigned = {
        schemaVersion: "1.0",
        engagementId: manifest.engagement.id,
        scopeHash,
        timestamp: new Date(now()).toISOString(),
        type,
        previousHash,
        ...details
      };
      const record = { ...unsigned, hash: hashObject(unsigned) };
      // Serialize concurrent stop/completion events to preserve one valid chain.
      try {
        await appendFile(auditPath, JSON.stringify(record) + "\n", { encoding: "utf8", mode: 0o600 });
      } catch (error) {
        auditBroken = true;
        throw error;
      }
      previousHash = record.hash;
      auditRecordCount++;
      try { onEvent(record); } catch { /* observers must not break durable auditing */ }
      return record;
    });
    auditQueue = write.catch(() => {});
    return write;
  }

  async function stop(reason) {
    if (closed) reject("runner is closed");
    if (!stopped) {
      stopped = true;
      stopReason = String(reason || "manual stop").slice(0, 240);
      // Stop must cancel an in-flight request, not merely block the next one.
      if (activeController) activeController.abort();
      try {
        await appendEvent("runner_stopped", { reason: stopReason });
      } catch {
        auditBroken = true;
        stopReason = "audit ledger write failure; session halted";
        throw new Error("AEGIS_SCOPE_GATE: " + stopReason);
      }
    }
    return { stopped, stopReason };
  }

  async function runAction(actionId) {
    if (closed) reject("runner is closed");
    if (busy) reject("concurrent actions are disabled");
    busy = true;
    try {
      if (stopped) reject("runner is stopped: " + stopReason);
      const current = now();
      const fresh = validateScopeManifest(manifest, current);
      if (current - startedAt >= manifest.limits.maxDurationMs) {
        await stop("engagement runtime limit reached");
        reject("engagement runtime limit reached");
      }
      if (totalActions >= manifest.limits.maxActions) {
        await stop("total action budget exhausted");
        reject("total action budget exhausted");
      }
      const action = manifest.target.actions.find(item => item.id === actionId);
      if (!action) reject("action id is not allow-listed");
      if ((perAction.get(actionId) ?? 0) >= action.maxExecutions) {
        await stop("per-action execution limit reached: " + actionId);
        reject("per-action execution limit reached");
      }
      const cutoff = current - 60_000;
      while (recentActions.length && recentActions[0] <= cutoff) recentActions.shift();
      if (recentActions.length >= manifest.limits.requestsPerMinute) {
        await stop("request-rate limit reached");
        reject("request-rate limit reached");
      }

      const url = new URL(action.path, fresh.baseUrl.origin);
      if (url.origin !== fresh.baseUrl.origin || url.pathname !== action.path || url.search || url.hash) {
        await stop("route failed exact-scope check");
        reject("route failed exact-scope check");
      }

      const rawHeaders = await getHeaders();
      if (stopped) reject("runner is stopped: " + stopReason);
      if (now() - startedAt >= manifest.limits.maxDurationMs) {
        await stop("engagement runtime limit reached while preparing headers");
        reject("engagement runtime limit reached");
      }
      const headers = new Headers(rawHeaders ?? {});
      const permitted = new Set((manifest.target.allowedHeaderNames ?? []).map(name => name.toLowerCase()));
      for (const [name] of headers) {
        if (!permitted.has(name.toLowerCase()) || FORBIDDEN_HEADERS.has(name.toLowerCase()) || name.toLowerCase().startsWith("proxy-")) {
          reject("runtime header is not allow-listed: " + name);
        }
      }

      const attemptId = `${current}-${totalActions + 1}-${actionId}`;
      const controller = new AbortController();
      activeController = controller;
      let timer = null;
      let actionStarted = false;
      try {
        // Persist the intent before any network side effect. If this write fails,
        // no request is issued; an incomplete logged attempt fails closed at restart.
        await appendEvent("action_started", {
          attemptId,
          actionId,
          method: action.method,
          route: action.path,
          targetOrigin: fresh.baseUrl.origin
        });
        actionStarted = true;
        totalActions++;
        perAction.set(actionId, (perAction.get(actionId) ?? 0) + 1);
        recentActions.push(current);

        if (stopped || controller.signal.aborted) {
          throw new DOMException("Stopped before request", "AbortError");
        }
        const remainingSessionMs = manifest.limits.maxDurationMs - (now() - startedAt);
        const effectiveTimeoutMs = Math.min(manifest.limits.requestTimeoutMs, Math.max(1, remainingSessionMs));
        timer = setTimeout(() => controller.abort(), effectiveTimeoutMs);
        const response = await fetchImpl(url, {
          method: action.method,
          headers,
          body: undefined,
          redirect: "manual",
          signal: controller.signal
        });
        if (response.status >= 300 && response.status < 400) {
          await appendEvent("action_failed", { attemptId, actionId, reason: "redirect blocked", status: response.status });
          actionStarted = false;
          await stop("redirect blocked");
          return { ok: false, status: response.status, stopped, stopReason };
        }

        const chunks = [];
        let bytes = 0;
        if (response.body) {
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > manifest.limits.maxResponseBytes) {
              await reader.cancel().catch(() => {});
              await appendEvent("action_failed", { attemptId, actionId, reason: "response byte limit exceeded", status: response.status, bytes });
              actionStarted = false;
              await stop("response byte limit exceeded");
              return { ok: false, status: response.status, stopped, stopReason };
            }
            chunks.push(Buffer.from(value));
          }
        }
        const body = Buffer.concat(chunks);
        const responseHash = createHash("sha256").update(body).digest("hex");
        const durationMs = Math.max(0, now() - current);
        await appendEvent("action_completed", {
          attemptId, actionId, status: response.status, bytes,
          responseSha256: responseHash, durationMs
        });
        actionStarted = false;
        const successful = response.status >= 200 && response.status < 300;
        if (!successful) await stop("target returned non-success status " + response.status);
        return {
          ok: successful,
          status: response.status,
          contentType: response.headers.get("content-type"),
          body: body.toString("utf8"),
          bytes,
          responseSha256: responseHash,
          durationMs,
          stopped,
          stopReason
        };
      } catch (error) {
        const reason = stopped
          ? stopReason
          : error?.name === "AbortError"
            ? "request timed out or was stopped"
            : "request failed; automatic retries are disabled";
        try {
          if (actionStarted) {
            await appendEvent("action_failed", {
              attemptId, actionId, reason,
              errorName: String(error?.name ?? "Error").slice(0, 80)
            });
            actionStarted = false;
          }
          await stop(reason);
        } catch {
          // A request may already have reached the target; never continue without
          // a durable record of the outcome.
          stopped = true;
          auditBroken = true;
          stopReason = "audit ledger write failure; session halted";
        }
        throw new Error("AEGIS_SCOPE_GATE: " + (stopReason ?? reason));
      } finally {
        if (timer) clearTimeout(timer);
        if (activeController === controller) activeController = null;
      }
    } finally {
      busy = false;
    }
  }

  async function close() {
    if (closed) return { closed: true };
    if (busy) reject("cannot close while an action is running");
    await appendEvent("runner_closed", { reason: "operator closed session" });
    closed = true;
    if (lockHandle) {
      await lockHandle.close();
      lockHandle = null;
    }
    try { await unlink(lockPath); } catch (error) { if (error?.code !== "ENOENT") throw error; }
    return { closed: true };
  }

  return {
    runAction,
    stop,
    close,
    status: () => ({
      engagementId: manifest.engagement.id,
      scopeHash,
      stopped,
      closed,
      stopReason,
      totalActions,
      remainingActions: Math.max(0, manifest.limits.maxActions - totalActions),
      auditRecords: auditRecordCount,
      lastAuditHash: previousHash
    })
  };
}
