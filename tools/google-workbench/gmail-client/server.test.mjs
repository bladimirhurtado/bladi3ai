import test from "node:test";
import assert from "node:assert/strict";
import { decodeBase64Url, collectBody, findHeader, normalizeMessage, SCOPES } from "./server.mjs";

test("decodes base64url UTF-8 content", () => {
  const encoded = Buffer.from("Hola, mundo 🌍", "utf8").toString("base64url");
  assert.equal(decodeBase64Url(encoded), "Hola, mundo 🌍");
});

test("finds headers case-insensitively", () => {
  assert.equal(findHeader([{ name: "sUbJeCt", value: "Prueba" }], "Subject"), "Prueba");
  assert.equal(findHeader([], "From"), "");
});

test("extracts plain text from a multipart message", () => {
  const text = Buffer.from("Texto del correo", "utf8").toString("base64url");
  const html = Buffer.from("<p>html</p>", "utf8").toString("base64url");
  const payload = { mimeType: "multipart/alternative", parts: [
    { mimeType: "text/html", body: { data: html } },
    { mimeType: "text/plain", body: { data: text } },
  ] };
  assert.equal(collectBody(payload), "Texto del correo");
});

test("normalizes a message and provides a safe fallback subject", () => {
  const message = normalizeMessage({ id: "abc", threadId: "t1", snippet: "vista previa", payload: { headers: [{ name: "From", value: "a@example.com" }] } });
  assert.equal(message.id, "abc");
  assert.equal(message.from, "a@example.com");
  assert.equal(message.subject, "(Sin asunto)");
  assert.equal(message.snippet, "vista previa");
});

test("asks for read-only and send scopes, not delete or modify", () => {
  assert.deepEqual(SCOPES, ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"]);
  assert.equal(SCOPES.some((scope) => /delete|modify|mail\.google\.com\/\b/.test(scope)), false);
});
