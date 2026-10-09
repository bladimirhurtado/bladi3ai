# AEGIS Competition Lab v0.3

AEGIS is an offline, synthetic-only adversarial reasoning laboratory for controlled AI competition research.

## What is implemented
- Shared decision/replay logic in `engine.mjs`, used by the browser UI and Node.js self-tests.
- Reproducible bounded planning: hypothetical branches use independent deterministic random streams.
- JUDGE validates strict event schemas, event order, canonical action attributes, recomputed synthetic HYDRA responses, verification transitions, and recovery replay.
- Action execution resolves canonical action definitions instead of trusting caller-supplied attributes.
- UI event logs use DOM text nodes rather than unsafe HTML strings.
- Error handling and the UI verdict require valid replay, evidence, survival, and the synthetic score threshold.
- Node.js CI runs 1,000 synthetic matches and adversarial tests on each branch push.
- `audit-record.mjs` creates and verifies signed audit records over an event-chain head.

## Architecture
- **AEGIS** — bounded 5-ply preview and 3-ply planning with budgeted actions.
- **HYDRA** — five synthetic adversary families: mirror, deceiver, switcher, noise, and meta.
- **JUDGE** — replays transitions and rejects malformed or inconsistent event streams.
- **Integrity** — SHA-256 event chain, plus a Node.js signing/verifying utility for audit records.
- **Recovery** — an explicit, replayed state transition rather than a score-only bonus.

## Signed audit record key handling
The audit utility requires an Ed25519 private/public key pair. Keep the private key outside the repository and protect it with secure key custody. Distribute or pin the trusted public key through a separate trusted channel; the public key embedded in a record is not trusted by itself. The utility verifies records but does not itself provide secure key storage or automatically persist records.

## Validation
Latest passing CI results are recorded in [TEST-RESULTS-v0.3.md](TEST-RESULTS-v0.3.md), with readiness limits in [GATE-STATUS-v0.3.md](GATE-STATUS-v0.3.md).

## Important limits
This is a synthetic simulation, not a real penetration-testing agent. A passing simulation score does not establish real-world penetration capability or detector evasion. No external Gemini/Meta match has been performed by this repository. External competition readiness remains unverified until the organizer defines the authorized target/interface, allowed techniques, detector interface, time limit, and measurable success condition.

## Promotion gate
Do not promote based on a UI label alone. Require reproducible seeds, valid independent replay, evidence-backed objectives, survival across synthetic adversary families, a score of at least 80/100, and a separate authorized event interface. Do not merge into `main` until the external gate is completed and explicitly reviewed.
