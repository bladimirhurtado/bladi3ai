import { ACTIONS, MODES, rng, initial, predict, applyAction, judge } from "./engine.mjs";

const $ = id => document.getElementById(id);
const logLines = [];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function addLog(message, cls = "") {
  logLines.push({ message, cls });
  $("log").replaceChildren(...logLines.slice(-60).map(item => {
    const node = document.createElement("div");
    node.className = "entry " + item.cls;
    node.textContent = item.message;
    return node;
  }));
  $("log").scrollTop = $("log").scrollHeight;
}
function renderBoard(s) {
  $("board").textContent = [
    "┌──────────── AEGIS OFFENSIVE LAB ────────────┐",
    "│ TRUST       " + String(s.trust).padEnd(28) + "│",
    "│ KNOWLEDGE   " + String(s.knowledge).padEnd(28) + "│",
    "│ THREAT      " + String(s.hiddenThreat).padEnd(28) + "│",
    "│ BUDGET      " + String(s.budget).padEnd(28) + "│",
    "│ SIGNAL      " + String(s.signal).padEnd(28) + "│",
    "└──────────────────────────────────────────────┘"
  ].join("\n");
}
async function hashText(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
async function hashChain(events) {
  let previous = "GENESIS";
  const hashes = [];
  for (const event of events) {
    previous = await hashText(previous + "|" + JSON.stringify(event));
    hashes.push(previous);
  }
  return { head: previous, hashes };
}
async function run() {
  $("run").disabled = true;
  logLines.length = 0;
  $("log").replaceChildren();
  $("tree").replaceChildren();
  $("integrity").replaceChildren();
  $("score").textContent = "—";
  $("verdict").textContent = "Replay pending.";
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  const random = rng(seed);
  const state = initial(seed);
  const start = initial(seed);
  const events = [];
  $("status").textContent = "Offensive synthetic match running.";
  renderBoard(state);
  addLog("JUDGE: seed " + seed + " | adversary " + state.mode, "ok");

  const preview = predict(state, 5);
  preview.line.forEach((line, index) => {
    const node = document.createElement("div");
    node.className = "node";
    const title = document.createElement("span");
    title.textContent = (index + 1) + ". " + line;
    const small = document.createElement("small");
    small.textContent = "candidate branch (synthetic model)";
    node.append(title, small);
    $("tree").appendChild(node);
  });
  addLog("AEGIS: evaluated deterministic candidate branches to 5 plies.");

  try {
    for (let round = 0; round < 8 && state.budget > 0; round++) {
      const plan = predict(state, 3);
      let action = ACTIONS.find(item => item.name === plan.line[0]?.split(" → ")[0]) || ACTIONS[0];
      if (state.mode === "noise" && state.trust < 9 && state.budget >= 2) action = ACTIONS.find(item => item.name === "verify");
      if (action.cost > state.budget) action = [...ACTIONS].reverse().find(item => item.cost <= state.budget);
      if (!action) break;
      const { response, recovered } = applyAction(state, action, random, events);
      addLog("R" + state.round + " AEGIS → " + action.name + " | initiative");
      await sleep(100);
      addLog("R" + state.round + " HYDRA → " + response.move + (response.deception ? " [DECEPTION]" : ""));
      if (state.round % 3 === 0 || recovered) addLog("JUDGE → verification " + (recovered ? "+ recovery" : "completed"), recovered ? "warn" : "ok");
      renderBoard(state);
      await sleep(100);
    }
    const chain = await hashChain(events);
    const result = judge(events, start);
    const integrityItems = [
      ["✓ Offline synthetic scope", true],
      ["✓ Shared deterministic planning engine", true],
      ["✓ Bounded 5-ply preview", true],
      ["✓ Budgeted actions and five adversary modes", true],
      [result.valid ? "✓ Independent event replay" : "✗ Independent event replay", result.valid],
      ["✓ SHA-256 event-chain generated", true],
      [result.evidence ? "✓ Evidence threshold met" : "✗ Evidence threshold not met", result.evidence],
      [result.survival ? "✓ Survival threshold met" : "✗ Survival threshold not met", result.survival]
    ];
    for (const [label, ok] of integrityItems) {
      const item = document.createElement("li");
      item.className = ok ? "ok" : "warn";
      item.textContent = label;
      $("integrity").appendChild(item);
    }
    $("score").textContent = result.score + "/100";
    const passed = result.valid && result.score >= 80 && result.evidence && result.survival;
    $("verdict").textContent = passed ? "PASS — synthetic gate met; not a real-system result." : "FAIL — synthetic gate not met; inspect the event log.";
    addLog("JUDGE: " + (result.valid ? "REPLAY VALID" : "REPLAY INVALID") + " | score " + result.score + "/100", result.valid ? "ok" : "warn");
    addLog("EVENT CHAIN HEAD: " + chain.head.slice(0, 24) + "…");
    $("status").textContent = "Synthetic match complete — independent replay finished.";
  } catch (error) {
    $("status").textContent = "Test halted: " + error.message;
    addLog("ERROR: " + error.message, "warn");
  } finally {
    $("run").disabled = false;
  }
}
$("run").addEventListener("click", run);
renderBoard(initial(12345));
