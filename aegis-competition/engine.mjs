export const ACTIONS = [
  { name: "scan", gain: 2, cost: 1, info: 4, risk: 0 },
  { name: "probe", gain: 3, cost: 2, info: 3, risk: 1 },
  { name: "feint", gain: 1, cost: 1, info: 1, risk: 0 },
  { name: "pressure", gain: 4, cost: 3, info: 0, risk: 2 },
  { name: "verify", gain: 2, cost: 2, info: 5, risk: 0 },
  { name: "hold", gain: 0, cost: 1, info: 1, risk: 0 }
];
export const MODES = ["mirror", "deceiver", "switcher", "noise", "meta"];

export function rng(seed) {
  let x = (seed >>> 0) || 0x9e3779b9;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}
export const clone = value => JSON.parse(JSON.stringify(value));
export function initial(seed, mode = MODES[(seed >>> 0) % MODES.length]) {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error("Seed must be an unsigned 32-bit integer");
  if (!MODES.includes(mode)) throw new Error("Unknown HYDRA mode");
  return { seed: seed >>> 0, round: 0, trust: 12, knowledge: 1, hiddenThreat: 7, budget: 22, signal: "unknown", mode };
}
export function fingerprint(s) {
  return [s.round, s.trust, s.knowledge, s.hiddenThreat, s.mode, s.budget, s.signal].join("|");
}
function stableSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function hydraResponse(s, a, random) {
  if (s.mode === "meta" && a.name === "scan") return { move: "feed-decoy", impact: 1, deception: true };
  if (s.mode === "mirror") return { move: a.name === "pressure" ? "retreat" : "mirror", impact: a.name === "pressure" ? 1 : 2, deception: false };
  if (s.mode === "deceiver") return { move: random() > 0.5 ? "bait" : "switch", impact: 3, deception: true };
  if (s.mode === "switcher") return { move: s.round % 2 ? "switch" : "wait", impact: 4, deception: s.round % 2 === 1 };
  return { move: random() > 0.65 ? "noise" : "pressure", impact: 2 + Math.floor(random() * 3), deception: true };
}
export function heuristic(s) { return s.trust * 2 + s.knowledge * 3 - s.hiddenThreat * 2 + s.budget * 0.25; }

export function predict(state, depth = 3, path = new Set()) {
  if (depth <= 0) return { value: heuristic(state), line: [] };
  const key = fingerprint(state) + "/" + depth;
  if (path.has(key)) return { value: -100, line: ["CYCLE-BLOCK"] };
  const nextPath = new Set(path); nextPath.add(key);
  let best = { value: -Infinity, line: [] };
  for (const action of ACTIONS) {
    if (action.cost > state.budget) continue;
    const next = clone(state);
    next.round += 1;
    next.budget -= action.cost;
    next.knowledge = Math.min(10, next.knowledge + action.info);
    next.trust = Math.max(0, Math.min(20, next.trust + action.gain - action.risk));
    // Each hypothetical branch gets its own deterministic random stream.
    const branchRng = rng(stableSeed(fingerprint(state) + "|" + action.name + "|" + depth));
    const response = hydraResponse(next, action, branchRng);
    next.trust = Math.max(0, next.trust - response.impact);
    next.hiddenThreat = Math.max(0, next.hiddenThreat + (response.deception ? 1 : 0) - Math.floor(next.knowledge / 5));
    next.signal = response.move;
    const child = predict(next, depth - 1, nextPath);
    const value = child.value + (action.name === "verify" ? 2 : 0) - (response.deception ? 1 : 0);
    if (value > best.value) best = { value, line: [action.name + " → " + response.move, ...child.line] };
  }
  return best;
}

export function applyAction(state, action, random, events) {
  // Never trust caller-supplied action attributes; resolve the canonical action by name.
  const canonicalAction = ACTIONS.find(a => a.name === action?.name);
  if (!canonicalAction) throw new Error("Unknown action");
  if (canonicalAction.cost > state.budget) throw new Error("Action exceeds remaining budget");
  state.round += 1;
  state.budget -= canonicalAction.cost;
  state.knowledge = Math.min(10, state.knowledge + canonicalAction.info);
  state.trust = Math.max(0, Math.min(20, state.trust + canonicalAction.gain - canonicalAction.risk));
  events.push({ type: "AEGIS", round: state.round, action: canonicalAction.name, cost: canonicalAction.cost, info: canonicalAction.info, gain: canonicalAction.gain, risk: canonicalAction.risk });
  const response = hydraResponse(state, canonicalAction, random);
  state.trust = Math.max(0, state.trust - response.impact);
  state.hiddenThreat = Math.max(0, state.hiddenThreat + (response.deception ? 1 : 0) - Math.floor(state.knowledge / 5));
  state.signal = response.move;
  events.push({ type: "HYDRA", round: state.round, move: response.move, impact: response.impact, deception: response.deception });
  let recovered = false;
  if (state.round % 3 === 0 || state.trust < 5) {
    recovered = state.trust < 5;
    if (recovered) { state.trust = 8; state.signal = "rollback-verified"; }
    events.push({ type: "VERIFY", round: state.round, recovered, trustAfterRecovery: state.trust, signalAfterRecovery: state.signal });
  }
  return { response, recovered };
}

export function judge(events, initialState) {
  if (!Array.isArray(events) || events.length === 0) {
    return { valid: false, evidence: false, survival: false, score: 0, final: null };
  }
  if (!initialState || typeof initialState !== "object" || Array.isArray(initialState)) {
    return { valid: false, evidence: false, survival: false, score: 0, final: null };
  }
  const s = clone(initialState);
  const initialKeys = ["seed", "round", "trust", "knowledge", "hiddenThreat", "budget", "signal", "mode"];
  if (Object.keys(s).length !== initialKeys.length ||
      Object.keys(s).some(key => !initialKeys.includes(key)) ||
      !Number.isSafeInteger(s.seed) || s.seed < 0 || s.seed > 0xffffffff ||
      !MODES.includes(s.mode) || s.round !== 0 || s.trust !== 12 ||
      s.knowledge !== 1 || s.hiddenThreat !== 7 || s.budget !== 22 ||
      s.signal !== "unknown") {
    return { valid: false, evidence: false, survival: false, score: 0, final: s };
  }
  const random = rng(s.seed);
  let valid = true, verified = 0, recoveredCount = 0;
  let awaitingHydra = false, awaitingVerify = false, lastRound = 0, pendingAction = null;

  for (const e of events) {
    if (!e || typeof e !== "object" || Array.isArray(e)) { valid = false; break; }

    // Reject unknown fields as well as malformed values; the replay schema is closed.
    const schemas = {
      AEGIS: ["type", "round", "action", "cost", "info", "gain", "risk"],
      HYDRA: ["type", "round", "move", "impact", "deception"],
      VERIFY: ["type", "round", "recovered", "trustAfterRecovery", "signalAfterRecovery"]
    };
    const allowed = schemas[e.type];
    if (!allowed || Object.keys(e).some(key => !allowed.includes(key)) ||
        allowed.some(key => !Object.hasOwn(e, key))) { valid = false; break; }

    if (e.type === "AEGIS") {
      const a = ACTIONS.find(x => x.name === e.action);
      if (!a || awaitingHydra || awaitingVerify || e.round !== lastRound + 1 ||
          e.cost !== a.cost || e.info !== a.info || e.gain !== a.gain ||
          e.risk !== a.risk || a.cost > s.budget) { valid = false; break; }

      s.round = e.round;
      lastRound = e.round;
      s.budget -= a.cost;
      s.knowledge = Math.min(10, s.knowledge + a.info);
      s.trust = Math.max(0, Math.min(20, s.trust + a.gain - a.risk));
      pendingAction = a;
      awaitingHydra = true;
    } else if (e.type === "HYDRA") {
      if (!awaitingHydra || e.round !== lastRound ||
          typeof e.impact !== "number" || !Number.isFinite(e.impact) ||
          typeof e.deception !== "boolean" || typeof e.move !== "string") {
        valid = false; break;
      }

      // Recompute HYDRA's move from the original seed; recorded claims alone are not trusted.
      const expected = hydraResponse(s, pendingAction, random);
      if (e.move !== expected.move || e.impact !== expected.impact ||
          e.deception !== expected.deception) { valid = false; break; }

      s.trust = Math.max(0, s.trust - expected.impact);
      s.hiddenThreat = Math.max(0, s.hiddenThreat + (expected.deception ? 1 : 0) - Math.floor(s.knowledge / 5));
      s.signal = expected.move;
      awaitingHydra = false;
      pendingAction = null;
      awaitingVerify = s.round % 3 === 0 || s.trust < 5;
    } else if (e.type === "VERIFY") {
      if (awaitingHydra || !awaitingVerify || e.round !== lastRound ||
          typeof e.recovered !== "boolean") { valid = false; break; }

      const shouldRecover = s.trust < 5;
      const expectedTrust = shouldRecover ? 8 : s.trust;
      const expectedSignal = shouldRecover ? "rollback-verified" : s.signal;
      if (e.recovered !== shouldRecover || e.trustAfterRecovery !== expectedTrust ||
          e.signalAfterRecovery !== expectedSignal) { valid = false; break; }

      verified++;
      if (shouldRecover) {
        recoveredCount++;
        s.trust = 8;
        s.signal = "rollback-verified";
      }
      awaitingVerify = false;
    } else {
      valid = false; break;
    }
  }

  if (awaitingHydra || awaitingVerify) valid = false;
  const evidence = verified >= 2 && s.knowledge >= 5;
  const survival = s.trust >= 5;
  const score = Math.max(0, Math.min(100, Math.round(
    (survival ? 30 : 0) + (evidence ? 25 : 0) +
    Math.min(20, s.knowledge * 2) + Math.min(15, s.budget) +
    Math.min(10, recoveredCount * 5)
  )));
  return { valid, evidence, survival, score, final: s };
}
