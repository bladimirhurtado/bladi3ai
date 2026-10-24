const $ = (s) => document.querySelector(s);
const escapeHtml = (v = "") => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
let connected = false;
async function api(path, options = {}) {
  const response = await fetch(path, { cache: "no-store", ...options, headers: { ...(options.body ? { "content-type": "application/json" } : {}), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`); return data;
}
function setConnected(value) {
  connected = value; $("#dot").classList.toggle("connected", value); $("#status").textContent = value ? "Google Drive conectado" : "Sin conectar";
  $("#connect").hidden = value; $("#disconnect").hidden = !value; $("#refresh").disabled = !value; $("#search button").disabled = !value;
}
async function loadFiles() {
  if (!connected) return;
  $("#help").textContent = "Cargando archivos…";
  try {
    const data = await api(`/api/files?q=${encodeURIComponent($("#query").value.trim())}`);
    const files = data.files || []; $("#count").textContent = String(files.length);
    $("#help").textContent = data.nextPageToken ? "Mostrando los primeros 50 archivos; paginación adicional pendiente." : `${files.length} archivo(s)`;
    $("#files").innerHTML = files.length ? files.map((f) => `<button class="file-card" data-id="${escapeHtml(f.id)}"><span class="file-name">${escapeHtml(f.name || "(Sin nombre)")}</span><span class="file-type">${escapeHtml((f.mimeType || "").replace("application/vnd.google-apps.", "Google "))}</span><span class="file-date">${escapeHtml(f.modifiedTime || "")}</span></button>`).join("") : '<p class="muted">No se encontraron archivos.</p>';
    $("#files").querySelectorAll("[data-id]").forEach((b) => b.addEventListener("click", () => openFile(b.dataset.id)));
  } catch (e) { $("#help").textContent = e.message; }
}
async function openFile(id) {
  $("#detail").textContent = "Cargando metadatos…";
  try {
    const { file } = await api(`/api/files/${encodeURIComponent(id)}`);
    $("#detail-title").textContent = file.name || "Archivo"; $("#detail-type").textContent = file.mimeType || "";
    const date = file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : "No disponible";
    $("#detail").classList.remove("empty");
    $("#detail").innerHTML = `<dl><dt>Tipo</dt><dd>${escapeHtml(file.mimeType)}</dd><dt>Última modificación</dt><dd>${escapeHtml(date)}</dd><dt>Tamaño</dt><dd>${escapeHtml(file.size ? `${file.size} bytes` : "No disponible para este tipo")}</dd><dt>Propietario</dt><dd>${escapeHtml(file.owners?.map((o) => o.displayName || o.emailAddress).join(", ") || "No disponible")}</dd></dl>${file.webViewLink ? `<p><a href="${escapeHtml(file.webViewLink)}" target="_blank" rel="noopener noreferrer">Abrir en Google Drive</a></p>` : ""}<button id="preview" class="secondary">Vista previa de texto</button><pre id="preview-content"></pre>`;
    $("#preview").addEventListener("click", async () => {
      $("#preview-content").textContent = "Cargando vista previa…";
      try { const data = await api(`/api/files/${encodeURIComponent(id)}/text`); $("#preview-content").textContent = data.content || "(Sin contenido de texto)"; }
      catch (e) { $("#preview-content").textContent = `No se pudo mostrar: ${e.message}`; }
    });
  } catch (e) { $("#detail").textContent = e.message; }
}
$("#connect").addEventListener("click", () => { location.href = "/auth/google"; });
$("#disconnect").addEventListener("click", async () => { try { await api("/api/logout", { method: "POST", body: "{}" }); setConnected(false); $("#files").replaceChildren(); $("#detail").textContent = "Sesión desconectada."; } catch (e) { alert(e.message); } });
$("#refresh").addEventListener("click", loadFiles);
$("#search").addEventListener("submit", (e) => { e.preventDefault(); loadFiles(); });
api("/api/status").then((s) => { setConnected(s.connected); if (s.connected) loadFiles(); }).catch((e) => { setConnected(false); $("#help").textContent = e.message; });
