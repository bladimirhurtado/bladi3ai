#!/usr/bin/env node
import { readFile, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createScopedRunner, validateScopeManifest } from "./scoped-runner.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function assertOutsideRepository(path, label) {
  const rel = relative(REPO_ROOT, resolve(path));
  const isOutside = rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel);
  if (!isOutside) throw new Error(`${label} must be stored outside the repository to avoid committing secrets or audit evidence`);
}

function requireAbsoluteEnv(name) {
  const value = process.env[name];
  if (typeof value !== "string" || !isAbsolute(value)) {
    throw new Error(`${name} must be an absolute file path`);
  }
  return value;
}

async function readJsonFile(path, label) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    throw new Error(`${label} could not be read as valid JSON`);
  }
}

async function readRuntimeHeaders() {
  const path = process.env.AEGIS_HEADERS_FILE;
  if (!path) return {};
  if (!isAbsolute(path)) throw new Error("AEGIS_HEADERS_FILE must be an absolute path");
  const info = await stat(path);
  if (process.platform !== "win32" && (info.mode & 0o077) !== 0) {
    throw new Error("runtime header file permissions are too broad; use owner-only permissions such as chmod 600");
  }
  const headers = await readJsonFile(path, "Runtime header file");
  if (!headers || typeof headers !== "object" || Array.isArray(headers) ||
      !Object.entries(headers).every(([key, value]) => /^[a-z0-9-]+$/i.test(key) && typeof value === "string")) {
    throw new Error("runtime header file must contain a JSON object of string header values");
  }
  return headers;
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args[0] === "--check";
  const actionId = checkOnly ? args[1] : args[0];
  if (!actionId || args.length !== (checkOnly ? 2 : 1)) {
    throw new Error("Usage: node scoped-cli.mjs [--check] <allow-listed-action-id>");
  }

  const scopePath = requireAbsoluteEnv("AEGIS_SCOPE_FILE");
  assertOutsideRepository(scopePath, "Scope manifest");
  const manifest = await readJsonFile(scopePath, "Scope manifest");
  validateScopeManifest(manifest);
  const action = manifest.target.actions.find(item => item.id === actionId);
  if (!action) throw new Error("Action ID is not present in the approved scope");
  if (checkOnly) {
    process.stdout.write(JSON.stringify({
      valid: true,
      engagementId: manifest.engagement.id,
      targetOrigin: new URL(manifest.target.baseUrl).origin,
      actionId: action.id,
      method: action.method,
      exactPath: action.path,
      note: "Validation only. No network request was sent."
    }, null, 2) + "\n");
    return;
  }

  if (process.env.AEGIS_LIVE_EXECUTION !== "YES") {
    throw new Error("Live execution is disabled; set AEGIS_LIVE_EXECUTION=YES only after reviewing the written scope and stop conditions");
  }
  const auditPath = requireAbsoluteEnv("AEGIS_AUDIT_PATH");
  assertOutsideRepository(auditPath, "Audit ledger");
  if (process.env.AEGIS_HEADERS_FILE) assertOutsideRepository(process.env.AEGIS_HEADERS_FILE, "Runtime header file");
  const runner = await createScopedRunner(manifest, {
    auditPath,
    getHeaders: readRuntimeHeaders
  });
  try {
    const result = await runner.runAction(actionId);
    process.stdout.write(JSON.stringify({
      ok: result.ok,
      engagementId: manifest.engagement.id,
      actionId,
      status: result.status,
      contentType: result.contentType,
      bytes: result.bytes,
      responseSha256: result.responseSha256,
      durationMs: result.durationMs,
      stopped: result.stopped,
      stopReason: result.stopReason
    }, null, 2) + "\n");
    if (!result.ok) process.exitCode = 2;
  } finally {
    try {
      await runner.close();
    } catch (error) {
      process.stderr.write("AEGIS closeout failed; inspect the audit ledger and lock before any restart: " +
        String(error?.message ?? "unknown closeout error") + "\n");
      process.exitCode = 1;
    }
  }
}

main().catch(error => {
  process.stderr.write("AEGIS: " + String(error?.message ?? "operation failed") + "\n");
  process.exitCode = 1;
});
