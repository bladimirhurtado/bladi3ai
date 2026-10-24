import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomBytes, timingSafeEqual } from "node:crypto";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `http://127.0.0.1:${PORT}/oauth2callback`;
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"];
const tokens = { value: null };
const pendingStates = new Map();
const MAX_BODY_BYTES = 64 * 1024;

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(body);
}
function redirect(res, location) {
  res.writeHead(302, { location, "cache-control": "no-store" });
  res.end();
}
function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
function headers(res) {
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "no-referrer");
  res.setHeader("x-frame-options", "DENY");
  res.setHeader("content-security-policy", "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
}
function isLocalOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    return ["127.0.0.1", "localhost", "::1"].includes(parsed.hostname) && Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80)) === PORT;
  } catch { return false; }
}
async function readJson(req) {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
    if (Buffer.byteLength(data) > MAX_BODY_BYTES) throw Object.assign(new Error("El cuerpo de la petición es demasiado grande."), { status: 413 });
  }
  try { return JSON.parse(data || "{}"); }
  catch { throw Object.assign(new Error("JSON inválido."), { status: 400 }); }
}
function decodeBase64Url(value = "") {
  try { return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"); }
  catch { return ""; }
}
function findHeader(headers = [], name) {
  return headers.find((h) => String(h.name).toLowerCase() === name.toLowerCase())?.value || "";
}
function collectBody(payload) {
  if (!payload) return "";
  const mime = String(payload.mimeType || "").toLowerCase();
  const data = payload.body?.data;
  if (data && (mime === "text/plain" || !payload.parts?.length)) return decodeBase64Url(data);
  const parts = payload.parts || [];
  for (const part of parts) {
    const found = collectBody(part);
    if (found && String(part.mimeType || "").toLowerCase() === "text/plain") return found;
  }
  for (const part of parts) {
    const found = collectBody(part);
    if (found) return found;
  }
  return data ? decodeBase64Url(data) : "";
}
export function normalizeMessage(message) {
  const hs = message.payload?.headers || [];
  return {
    id: message.id,
    threadId: message.threadId,
    from: findHeader(hs, "From"),
    to: findHeader(hs, "To"),
    subject: findHeader(hs, "Subject") || "(Sin asunto)",
    date: findHeader(hs, "Date"),
    snippet: message.snippet || "",
    body: collectBody(message.payload),
  };
}
async function exchangeToken(params) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.error || "Google OAuth no pudo completar la operación.");
  return data;
}
async function accessToken() {
  if (!tokens.value) throw Object.assign(new Error("Conecta primero tu cuenta de Google."), { status: 401 });
  if (tokens.value.expires_at > Date.now() + 60000) return tokens.value.access_token;
  if (!tokens.value.refresh_token) {
    tokens.value = null;
    throw Object.assign(new Error("La sesión caducó. Vuelve a conectar Google."), { status: 401 });
  }
  const refreshed = await exchangeToken({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: tokens.value.refresh_token,
    grant_type: "refresh_token",
  });
  tokens.value = {
    ...tokens.value,
    access_token: refreshed.access_token,
    expires_at: Date.now() + Number(refreshed.expires_in || 3600) * 1000,
  };
  return tokens.value.access_token;
}
async function gmail(pathname, options = {}, retry = true) {
  const token = await accessToken();
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${pathname}`, {
    ...options,
    headers: { authorization: `Bearer ${token}`, ...(options.headers || {}) },
    signal: AbortSignal.timeout(20000),
  });
  if (response.status === 401 && retry && tokens.value?.refresh_token) {
    tokens.value.expires_at = 0;
    await accessToken();
    return gmail(pathname, options, false);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `Gmail API respondió HTTP ${response.status}`;
    throw Object.assign(new Error(message), { status: response.status === 403 ? 403 : 502 });
  }
  return data;
}
function requireConfig() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw Object.assign(new Error("Falta configurar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET. Consulta README.md."), { status: 503 });
  }
}
async function handle(req, res) {
  headers(res);
  const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
  if (req.method === "GET" && url.pathname === "/") {
    const page = await readFile(path.join(HERE, "index.html"));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(page);
    return;
  }
  if (req.method === "GET" && url.pathname === "/app.js") {
    res.writeHead(200, { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" });
    res.end(await readFile(path.join(HERE, "app.js"))); return;
  }
  if (req.method === "GET" && url.pathname === "/styles.css") {
    res.writeHead(200, { "content-type": "text/css; charset=utf-8", "cache-control": "no-store" });
    res.end(await readFile(path.join(HERE, "styles.css"))); return;
  }
  if (req.method === "GET" && url.pathname === "/auth/google") {
    requireConfig();
    const state = randomBytes(24).toString("hex");
    pendingStates.set(state, Date.now() + 5 * 60 * 1000);
    const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    auth.search = new URLSearchParams({
      client_id: CLIENT_ID, redirect_uri: REDIRECT_URI, response_type: "code",
      scope: SCOPES.join(" "), access_type: "offline", prompt: "consent", state,
    }).toString();
    redirect(res, auth.toString()); return;
  }
  if (req.method === "GET" && url.pathname === "/oauth2callback") {
    const state = url.searchParams.get("state") || "";
    const expiry = pendingStates.get(state);
    pendingStates.delete(state);
    if (!expiry || expiry < Date.now()) { json(res, 400, { error: "Estado OAuth inválido o caducado. Intenta conectar de nuevo." }); return; }
    if (url.searchParams.has("error")) { json(res, 400, { error: "Google canceló o rechazó la autorización." }); return; }
    const code = url.searchParams.get("code");
    if (!code) { json(res, 400, { error: "Google no devolvió el código de autorización." }); return; }
    requireConfig();
    const data = await exchangeToken({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, grant_type: "authorization_code" });
    tokens.value = { access_token: data.access_token, refresh_token: data.refresh_token || tokens.value?.refresh_token || null, expires_at: Date.now() + Number(data.expires_in || 3600) * 1000 };
    redirect(res, "/"); return;
  }
  if (req.method === "GET" && url.pathname === "/api/status") {
    json(res, 200, { connected: Boolean(tokens.value), authMode: "OAuth; tokens kept in process memory only", scopes: SCOPES }); return;
  }
  if (url.pathname.startsWith("/api/") && req.method !== "GET" && !isLocalOrigin(req)) {
    json(res, 403, { error: "Origen de petición no permitido." }); return;
  }
  if (req.method === "POST" && url.pathname === "/api/logout") {
    tokens.value = null; json(res, 200, { ok: true }); return;
  }
  if (req.method === "GET" && url.pathname === "/api/messages") {
    const maxResults = Math.max(1, Math.min(25, Number(url.searchParams.get("maxResults") || 15)));
    const q = (url.searchParams.get("q") || "").slice(0, 500);
    const list = await gmail(`messages?maxResults=${maxResults}&q=${encodeURIComponent(q)}`);
    const messages = await Promise.all((list.messages || []).map(async (item) => {
      const detail = await gmail(`messages/${encodeURIComponent(item.id)}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`);
      return normalizeMessage(detail);
    }));
    json(res, 200, { messages, resultSizeEstimate: list.resultSizeEstimate || 0 }); return;
  }
  const messageMatch = url.pathname.match(/^\/api\/messages\/([A-Za-z0-9_-]+)$/);
  if (req.method === "GET" && messageMatch) {
    const message = await gmail(`messages/${encodeURIComponent(messageMatch[1])}?format=full`);
    json(res, 200, { message: normalizeMessage(message) }); return;
  }
  if (req.method === "POST" && url.pathname === "/api/send") {
    const input = await readJson(req);
    const to = String(input.to || "").trim();
    const subject = String(input.subject || "").trim();
    const body = String(input.body || "");
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(to)) { json(res, 400, { error: "Introduce una dirección de correo válida." }); return; }
    if (!subject || subject.length > 998 || body.length > 100000) { json(res, 400, { error: "El asunto es obligatorio y el mensaje no puede superar 100.000 caracteres." }); return; }
    const rawMessage = `To: ${to}\r\nSubject: ${subject.replace(/[\r\n]/g, " ")}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset="UTF-8"\r\nContent-Transfer-Encoding: 8bit\r\n\r\n${body}`;
    const raw = Buffer.from(rawMessage, "utf8").toString("base64url");
    const result = await gmail("messages/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ raw }) });
    json(res, 200, { ok: true, id: result.id, threadId: result.threadId }); return;
  }
  json(res, 404, { error: "Ruta no encontrada." });
}

const server = http.createServer(async (req, res) => {
  try { await handle(req, res); }
  catch (error) {
    const status = Number(error.status) || 502;
    if (!res.headersSent) headers(res);
    if (!res.headersSent) json(res, status, { error: error.message || "Error inesperado." });
    else res.end();
  }
});
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  server.listen(PORT, HOST, () => console.log(`Gmail Workbench disponible en http://${HOST}:${PORT}`));
}
export { handle, server, SCOPES, decodeBase64Url, collectBody, findHeader };
