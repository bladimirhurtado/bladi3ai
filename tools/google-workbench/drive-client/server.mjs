import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomBytes, timingSafeEqual } from "node:crypto";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8788);
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `http://127.0.0.1:${PORT}/oauth2callback`;
const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];
const session = { tokens: null };
const states = new Map();

function json(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", "x-frame-options": "DENY", "content-security-policy": "default-src 'self'; connect-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'" });
  res.end(JSON.stringify(data));
}
function redirect(res, location) { res.writeHead(302, { location, "cache-control": "no-store" }); res.end(); }
function localOrigin(req) {
  if (!req.headers.origin) return true;
  try { const u = new URL(req.headers.origin); return ["127.0.0.1", "localhost", "::1"].includes(u.hostname) && Number(u.port || 80) === PORT; } catch { return false; }
}
function config() {
  if (!CLIENT_ID || !CLIENT_SECRET) throw Object.assign(new Error("Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET; consulta README.md."), { status: 503 });
}
async function tokenRequest(params) {
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(params), signal: AbortSignal.timeout(15000) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.error || "No se pudo completar OAuth.");
  return data;
}
async function getToken() {
  if (!session.tokens) throw Object.assign(new Error("Conecta primero Google Drive."), { status: 401 });
  if (session.tokens.expires_at > Date.now() + 60000) return session.tokens.access_token;
  if (!session.tokens.refresh_token) { session.tokens = null; throw Object.assign(new Error("La sesión caducó. Conecta de nuevo."), { status: 401 }); }
  const refreshed = await tokenRequest({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: session.tokens.refresh_token, grant_type: "refresh_token" });
  session.tokens = { ...session.tokens, access_token: refreshed.access_token, expires_at: Date.now() + Number(refreshed.expires_in || 3600) * 1000 };
  return session.tokens.access_token;
}
async function drive(pathname, retry = true) {
  const token = await getToken();
  const response = await fetch(`https://www.googleapis.com/drive/v3/${pathname}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000) });
  if (response.status === 401 && retry && session.tokens?.refresh_token) {
    session.tokens.expires_at = 0; await getToken(); return drive(pathname, false);
  }
  const type = response.headers.get("content-type") || "";
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Object.assign(new Error(data.error?.message || `Drive API respondió HTTP ${response.status}`), { status: response.status === 403 ? 403 : 502 });
  }
  if (type.includes("application/json")) return response.json();
  const reader = response.body?.getReader();
  if (!reader) return { content: "", contentType: type, truncated: false };
  const chunks = [];
  let total = 0;
  let truncated = false;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const remaining = 1_000_001 - total;
    if (value.byteLength > remaining) {
      chunks.push(value.slice(0, Math.max(0, remaining)));
      total += Math.max(0, remaining);
      truncated = true;
      await reader.cancel();
      break;
    }
    chunks.push(value);
    total += value.byteLength;
    if (total > 1_000_000) { truncated = true; await reader.cancel(); break; }
  }
  return { content: Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8"), contentType: type, truncated };
}
export function escapeDriveQuery(value = "") { return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'").slice(0, 200); }
async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", "x-frame-options": "DENY", "content-security-policy": "default-src 'self'; connect-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'" });
    res.end(await readFile(path.join(HERE, "index.html"))); return;
  }
  if (req.method === "GET" && url.pathname === "/app.js") { res.writeHead(200, { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" }); res.end(await readFile(path.join(HERE, "app.js"))); return; }
  if (req.method === "GET" && url.pathname === "/styles.css") { res.writeHead(200, { "content-type": "text/css; charset=utf-8", "cache-control": "no-store" }); res.end(await readFile(path.join(HERE, "styles.css"))); return; }
  if (req.method === "GET" && url.pathname === "/auth/google") {
    config(); const state = randomBytes(24).toString("hex"); states.set(state, Date.now() + 300000);
    const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    auth.search = new URLSearchParams({ client_id: CLIENT_ID, redirect_uri: REDIRECT_URI, response_type: "code", scope: SCOPES.join(" "), access_type: "offline", prompt: "consent", state }).toString();
    redirect(res, auth.toString()); return;
  }
  if (req.method === "GET" && url.pathname === "/oauth2callback") {
    const state = url.searchParams.get("state") || "", expires = states.get(state); states.delete(state);
    if (!expires || expires < Date.now()) { json(res, 400, { error: "Estado OAuth inválido o caducado." }); return; }
    if (url.searchParams.has("error")) { json(res, 400, { error: "Google canceló o rechazó la autorización." }); return; }
    const code = url.searchParams.get("code"); if (!code) { json(res, 400, { error: "Falta el código OAuth." }); return; }
    config();
    const data = await tokenRequest({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, grant_type: "authorization_code" });
    session.tokens = { access_token: data.access_token, refresh_token: data.refresh_token || session.tokens?.refresh_token || null, expires_at: Date.now() + Number(data.expires_in || 3600) * 1000 };
    redirect(res, "/"); return;
  }
  if (req.method === "GET" && url.pathname === "/api/status") { json(res, 200, { connected: Boolean(session.tokens), scopes: SCOPES, tokenStorage: "memory only" }); return; }
  if (req.method === "POST" && url.pathname === "/api/logout") {
    if (!localOrigin(req)) { json(res, 403, { error: "Origen no permitido." }); return; }
    session.tokens = null; json(res, 200, { ok: true }); return;
  }
  if (req.method === "GET" && url.pathname === "/api/files") {
    const name = escapeDriveQuery(url.searchParams.get("q") || "");
    const q = name ? `trashed = false and name contains '${name}'` : "trashed = false";
    const params = new URLSearchParams({ q, pageSize: "50", orderBy: "modifiedTime desc", fields: "nextPageToken,files(id,name,mimeType,modifiedTime,size,webViewLink,owners(displayName,emailAddress))" });
    const result = await drive(`files?${params}`);
    json(res, 200, { files: result.files || [], nextPageToken: result.nextPageToken || null }); return;
  }
  const fileMatch = url.pathname.match(/^\/api\/files\/([A-Za-z0-9_-]+)$/);
  if (req.method === "GET" && fileMatch) {
    const params = new URLSearchParams({ fields: "id,name,mimeType,modifiedTime,size,webViewLink,description,owners(displayName,emailAddress)" });
    const file = await drive(`files/${encodeURIComponent(fileMatch[1])}?${params}`);
    json(res, 200, { file }); return;
  }
  const textMatch = url.pathname.match(/^\/api\/files\/([A-Za-z0-9_-]+)\/text$/);
  if (req.method === "GET" && textMatch) {
    const meta = await drive(`files/${encodeURIComponent(textMatch[1])}?fields=id,name,mimeType`);
    let result;
    if (meta.mimeType?.startsWith("application/vnd.google-apps.")) {
      const params = new URLSearchParams({ mimeType: "text/plain" });
      result = await drive(`files/${encodeURIComponent(textMatch[1])}/export?${params}`);
    } else {
      const supportedText = /^text\\//.test(meta.mimeType || "") || ["application/json", "application/xml", "application/csv", "application/rtf"].includes(meta.mimeType || "");
      if (!supportedText) { json(res, 415, { error: "La vista previa está limitada a documentos de Google Workspace y archivos de texto; este formato no se convierte a texto." }); return; }
      result = await drive(`files/${encodeURIComponent(textMatch[1])}?alt=media`);
    }
    if (result.truncated) { json(res, 413, { error: "El contenido supera el límite de vista previa de 1 MB." }); return; }
    json(res, 200, { name: meta.name, content: String(result.content || ""), contentType: result.contentType || "text/plain" }); return;
  }
  json(res, 404, { error: "Ruta no encontrada." });
}
const server = http.createServer(async (req, res) => {
  try { await handle(req, res); }
  catch (error) { if (!res.headersSent) json(res, Number(error.status) || 502, { error: error.message || "Error inesperado." }); else res.end(); }
});
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) server.listen(PORT, HOST, () => console.log(`Drive Workbench disponible en http://${HOST}:${PORT}`));
export { handle, server, SCOPES };
