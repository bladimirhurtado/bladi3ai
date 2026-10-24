const $ = (selector) => document.querySelector(selector);
const state = { connected: false, messages: [] };
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
async function api(path, options = {}) {
  const response = await fetch(path, { cache: "no-store", ...options, headers: { ...(options.body ? { "content-type": "application/json" } : {}), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
  return data;
}
function setStatus(connected) {
  state.connected = connected;
  $("#status-dot").classList.toggle("connected", connected);
  $("#status-text").textContent = connected ? "Google conectado" : "Sin conectar";
  $("#connect").hidden = connected;
  $("#disconnect").hidden = !connected;
  $("#refresh").disabled = !connected;
  $("#search-form").querySelector("button").disabled = !connected;
  $("#compose-form").querySelector("button").disabled = !connected;
}
async function refreshStatus() {
  const status = await api("/api/status");
  setStatus(status.connected);
  if (status.connected) await loadMessages();
}
function renderMessages(messages) {
  $("#count").textContent = String(messages.length);
  const list = $("#message-list");
  if (!messages.length) { list.innerHTML = '<p class="muted empty-list">No se encontraron mensajes.</p>'; return; }
  list.innerHTML = messages.map((m) => `<button class="message-card" data-id="${escapeHtml(m.id)}"><span class="message-from">${escapeHtml(m.from || "Remitente desconocido")}</span><span class="message-subject">${escapeHtml(m.subject || "(Sin asunto)")}</span><span class="message-snippet">${escapeHtml(m.snippet || "")}</span><span class="message-date">${escapeHtml(m.date || "")}</span></button>`).join("");
  list.querySelectorAll("[data-id]").forEach((button) => button.addEventListener("click", () => openMessage(button.dataset.id)));
}
async function loadMessages(query = $("#query").value.trim()) {
  if (!state.connected) return;
  $("#list-help").textContent = "Cargando mensajes…";
  try {
    const data = await api(`/api/messages?maxResults=20&q=${encodeURIComponent(query)}`);
    state.messages = data.messages || [];
    renderMessages(state.messages);
    $("#list-help").textContent = `${data.resultSizeEstimate || state.messages.length} resultado(s) aproximado(s)`;
  } catch (error) { $("#list-help").textContent = error.message; }
}
async function openMessage(id) {
  $("#reader-content").textContent = "Cargando mensaje…";
  try {
    const { message } = await api(`/api/messages/${encodeURIComponent(id)}`);
    $("#reader-title").textContent = message.subject || "(Sin asunto)";
    $("#reader-date").textContent = message.date || "";
    $("#reader-content").classList.remove("empty");
    $("#reader-content").innerHTML = `<p><strong>De:</strong> ${escapeHtml(message.from)}</p><p><strong>Para:</strong> ${escapeHtml(message.to)}</p><hr><pre>${escapeHtml(message.body || message.snippet || "Este mensaje no contiene texto plano visible.")}</pre>`;
  } catch (error) { $("#reader-content").textContent = error.message; }
}
$("#connect").addEventListener("click", () => { window.location.href = "/auth/google"; });
$("#disconnect").addEventListener("click", async () => {
  try { await api("/api/logout", { method: "POST", body: "{}" }); state.messages = []; renderMessages([]); $("#reader-content").textContent = "Sesión desconectada."; setStatus(false); }
  catch (error) { alert(error.message); }
});
$("#refresh").addEventListener("click", () => loadMessages());
$("#search-form").addEventListener("submit", (event) => { event.preventDefault(); loadMessages($("#query").value.trim()); });
$("#compose-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.connected) return;
  const form = new FormData(event.currentTarget);
  const mail = { to: form.get("to").trim(), subject: form.get("subject").trim(), body: form.get("body") };
  const ok = window.confirm(`Vas a enviar un correo a ${mail.to}\n\nAsunto: ${mail.subject}\n\n¿Confirmas el envío?`);
  if (!ok) return;
  $("#send-status").textContent = "Enviando…";
  try {
    await api("/api/send", { method: "POST", body: JSON.stringify(mail) });
    $("#send-status").textContent = "Mensaje enviado correctamente.";
    event.currentTarget.reset();
  } catch (error) { $("#send-status").textContent = `No se pudo enviar: ${error.message}`; }
});
refreshStatus().catch((error) => { setStatus(false); $("#list-help").textContent = error.message; });
