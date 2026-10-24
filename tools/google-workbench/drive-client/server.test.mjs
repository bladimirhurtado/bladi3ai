import test from "node:test";
import assert from "node:assert/strict";
import { escapeDriveQuery, SCOPES } from "./server.mjs";

test("escapes Drive query string literals", () => {
  assert.equal(escapeDriveQuery("O'Brien"), "O\\'Brien");
  assert.equal(escapeDriveQuery("folder\\name"), "folder\\\\name");
});

test("limits query length", () => {
  assert.equal(escapeDriveQuery("x".repeat(500)).length, 200);
});

test("uses read-only Drive scope", () => {
  assert.deepEqual(SCOPES, ["https://www.googleapis.com/auth/drive.readonly"]);
  assert.equal(SCOPES.some((scope) => /drive\\.(file|metadata|appdata)|drive$/.test(scope)), false);
});
