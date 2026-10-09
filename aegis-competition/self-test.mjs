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

// Adversarial JUDGE checks: tampering, event reordering, duplication and omission.
const original = firstMatch.events;
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
  adversarialJudgeChecks: 4,
  hashChainChecks: 2
}, null, 2));
