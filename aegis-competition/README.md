# AEGIS Competition Lab v0.3

AEGIS is an offline, synthetic-only adversarial reasoning laboratory for controlled AI competition research.

## What changed in v0.3
- Extracted decision and replay logic into a shared ES module (engine.mjs) used by the UI.
- Made lookahead reproducible: hypothetical branches use independent deterministic random streams and do not consume the live match RNG.
- Reworked the judge to validate event order, action costs and attributes, adversary event shape, verification transitions, and recovery replay.
- Replaced unsafe HTML string rendering in the event log with DOM text nodes.
- Added explicit error handling and stopped displaying a pass when replay, evidence, or survival gates fail.
- Fixed the invalid source line present in v0.2.

## Architecture
- **AEGIS** — bounded 5-ply synthetic planner with budgeted actions.
- **HYDRA** — five synthetic adversary families: mirror, deceiver, switcher, noise, and meta.
- **JUDGE** — reconstructs state from the event stream and checks transition consistency.
- **Integrity** — SHA-256 chained event log generated after the match.
- **Recovery** — an explicit, replayed state transition rather than a score-only bonus.

## Important limits
This is a synthetic simulation, not a real penetration-testing agent. Its adversary is modelled, and its hash chain is generated for the current run; persistent signed logs and independent execution are still needed for stronger auditability. No external Gemini/Meta match has been performed by this repository.

## Promotion gate
Do not promote based on a UI label alone. Require reproducible seeds, valid independent replay, evidence-backed objectives, survival across all synthetic adversary families, a score of at least 80/100, and a separate authorized event interface. A high simulation score does not establish real-world penetration capability.
