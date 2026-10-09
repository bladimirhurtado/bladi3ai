import { createHash } from "node:crypto";
import { ACTIONS, MODES, rng, initial, predict, applyAction, judge } from "./engine.mjs";

function match(seed, mode) {
  const state = initial(seed, mode);
  const start = initial(seed, mode);
  const random = rng(seed);
  const events = [];
  for (let round = 0; round < 8 && state.budget > 0; round++) {
    const plan = predict(state, 3);
    let action = ACTIONS.find(item => item.name === plan.line[0]?.split(" → ")[0]) || ACTIONS[0];
    if (state.mode === "noise" && state.trust < 9 && state.budget >= 2) {
      action = ACTIONS.find(item => item.name === "verify");
    }
    if (action.cost > state.budget) action = [...ACTIONS].reverse().find(item => item.cost <= state.budget);
    if (!action) break;
    applyAction(state, action, random, events);
  }
  return { seed, mode, events, result: judge(events, start) };
}

function chain(events) {
  let previous = "GENESIS";
  const hashes = [];
  for (const event of events) {
    previous = createHash("sha256").update(previous + "|" + JSON.stringify(event)).digest("hex");
    hashes.push(previous);
  }
  return { head: previous, hashes };
}
function verifyChain(events, recorded) {
  const actual = chain(events);
  return actual.head === recorded.head &&
    actual.hashes.length === recorded.hashes.length &&
    actual.hashes.every((value, index) => value === recorded.hashes[index]);
}
function assert(condition, message) {
  if (!condition) throw new Error("FAIL: " + message);
}

let runs = 0, invalidReplays = 0, nondeterministic = 0, lowScores = 0;
let minScore = 101, maxScore = -1, scoreTotal = 0;
const firstMatch = match(1, "mirror");

for (let seed = 1; seed <= 200; seed++) {
  for (const mode of MODES) {
    const a = match(seed, mode);
    const b = match(seed, mode);
    runs++;
    if (!a.result.valid) invalidReplays++;
    if (JSON.stringify({ events: a.events, result: a.result }) !==
        JSON.stringify({ events: b.events, result: b.result })) nondeterministic++;
    if (a.result.score < 80 || !a.result.evidence || !a.result.survival) lowScores++;
    minScore = Math.min(minScore, a.result.score);
    maxScore = Math.max(maxScore, a.result.score);
    scoreTotal += a.result.score;
  }
}

assert(runs === 1000, "expected 1,000 synthetic matches");
assert(invalidReplays === 0, "valid match replay failures: " + invalidReplays);
assert(nondeterministic === 0, "same-seed deterministic mismatches: " + nondeterministic);
assert(lowScores === 0, "matches below promotion gate: " + lowScores);

// Engine must ignore forged caller-supplied action attributes and use the canonical definition.
const forgedState = initial(7, "mirror");
const forgedActionEvents = [];
applyAction(forgedState, { name: "scan", cost: 0, info: 0, gain: 99, risk: 0 }, rng(7), forgedActionEvents);
assert(forgedActionEvents[0].cost === 1 && forgedActionEvents[0].info === 4 &&
  forgedActionEvents[0].gain === 2 && forgedActionEvents[0].risk === 0,
  "forged action attributes must be ignored");
assert(forgedState.budget === 21, "canonical action cost must be charged");

// Adversarial JUDGE checks: tampering, event reordering, duplication and omission.
const original = firstMatch.events;
// Initial state is a trusted replay boundary and must be validated.
let invalidModeRejected = false;
try { initial(1, "unknown-mode"); } catch { invalidModeRejected = true; }
assert(invalidModeRejected, "unknown HYDRA mode must be rejected");
let invalidSeedRejected = false;
try { initial(-1, "mirror"); } catch { invalidSeedRejected = true; }
assert(invalidSeedRejected, "invalid seed must be rejected");
assert(!judge([], null).valid, "null initial state must fail");
assert(!judge([], { ...initial(1, "mirror"), trust: 13 }).valid, "altered initial baseline must fail");

assert(judge(original, initial(1, "mirror")).valid, "baseline replay must pass");
const tampered = structuredClone(original);
const hydra = tampered.find(event => event.type === "HYDRA");
assert(hydra, "test fixture must contain HYDRA event");
hydra.impact = (hydra.impact + 1) % 10;
assert(!judge(tampered, initial(1, "mirror")).valid, "forged HYDRA impact must fail");

const reordered = structuredClone(original);
[reordered[0], reordered[1]] = [reordered[1], reordered[0]];
assert(!judge(reordered, initial(1, "mirror")).valid, "reordered events must fail");

const duplicated = structuredClone(original);
duplicated.splice(1, 0, structuredClone(duplicated[0]));
assert(!judge(duplicated, initial(1, "mirror")).valid, "duplicated action event must fail");

const verifyIndex = original.findIndex(event => event.type === "VERIFY");
assert(verifyIndex >= 0, "test fixture must contain verification event");
const omitted = structuredClone(original);
omitted.splice(verifyIndex, 1);
assert(!judge(omitted, initial(1, "mirror")).valid, "omitted required verification must fail");

// Additional malformed-input and state-transition adversarial checks.
const malformed = structuredClone(original);
malformed[0] = null;
assert(!judge(malformed, initial(1, "mirror")).valid, "null event must fail");

const missingHydra = structuredClone(original);
const missingHydraIndex = missingHydra.findIndex(event => event.type === "HYDRA");
missingHydra.splice(missingHydraIndex, 1);
assert(!judge(missingHydra, initial(1, "mirror")).valid, "missing HYDRA event must fail");

const duplicateVerify = structuredClone(original);
const duplicateVerifyIndex = duplicateVerify.findIndex(event => event.type === "VERIFY");
assert(duplicateVerifyIndex >= 0, "test fixture must contain VERIFY event");
duplicateVerify.splice(duplicateVerifyIndex + 1, 0, structuredClone(duplicateVerify[duplicateVerifyIndex]));
assert(!judge(duplicateVerify, initial(1, "mirror")).valid, "duplicate VERIFY must fail");

const nonFiniteImpact = structuredClone(original);
nonFiniteImpact.find(event => event.type === "HYDRA").impact = Number.NaN;
assert(!judge(nonFiniteImpact, initial(1, "mirror")).valid, "non-finite impact must fail");

const invalidDeception = structuredClone(original);
invalidDeception.find(event => event.type === "HYDRA").deception = "true";
assert(!judge(invalidDeception, initial(1, "mirror")).valid, "non-boolean deception must fail");

const extraField = structuredClone(original);
extraField[0].unrecognized = "injected";
assert(!judge(extraField, initial(1, "mirror")).valid, "unknown event field must fail");

let recoverySource = null;
for (let seed = 1; seed <= 200 && !recoverySource; seed++) {
  for (const mode of MODES) {
    const candidate = match(seed, mode);
    if (candidate.events.some(event => event.type === "VERIFY" && event.recovered)) {
      recoverySource = candidate;
      break;
    }
  }
}
assert(recoverySource, "test corpus must contain at least one recovery event");
const falseRecovery = structuredClone(recoverySource.events);
const recoveryEvent = falseRecovery.find(event => event.type === "VERIFY" && event.recovered);
recoveryEvent.trustAfterRecovery = 19;
assert(!judge(falseRecovery, initial(recoverySource.seed, recoverySource.mode)).valid, "forged recovery state must fail");

const recordedChain = chain(original);
assert(verifyChain(original, recordedChain), "untampered hash chain must verify");
const chainTamper = structuredClone(original);
chainTamper[0].action = "pressure";
assert(!verifyChain(chainTamper, recordedChain), "tampered event must fail hash-chain verification");

console.log(JSON.stringify({
  status: "PASS",
  runs,
  invalidReplays,
  nondeterministic,
  lowScores,
  minScore,
  maxScore,
  averageScore: Number((scoreTotal / runs).toFixed(2)),
  initialStateChecks: 4,
  actionIntegrityChecks: 1,
  adversarialJudgeChecks: 11,
  hashChainChecks: 2
}, null, 2));
