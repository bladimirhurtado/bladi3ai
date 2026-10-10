# AEGIS v0.4 — Project State

Updated: 2026-10-10
Repository: `bladimirhurtado/bladi3ai`
Working branch: `aegis-competition-v0.4`
Preserved baseline: `aegis-competition-v0.3`

## Intent

Treat the competition as a real, rule-bound operational engagement—not as a game. Synthetic results are useful for engineering but are not evidence of performance against a real service or another AI. All live action must follow the organizer's written authorization, exact scope, rules, limits, success criteria, and stop conditions.

## Version preservation

- `main` remains untouched.
- `aegis-competition-v0.1`, `aegis-competition-v0.2`, and `aegis-competition-v0.3` remain preserved.
- Current work is isolated in `aegis-competition-v0.4`.
- Draft PR #1 targets v0.3 for automated CI validation only. It must not be merged as part of this work without a separate review decision.

## Implemented on v0.4

- New Node.js scoped HTTP runner with strict, exact-route allowlisting.
- Written-authorization window, organizer, engagement ID, success criteria, and stop conditions are mandatory.
- Initial live action methods restricted to GET, HEAD, and OPTIONS; arbitrary URLs, request bodies, redirect following, automatic retries, scanning, exploit delivery, credential guessing, persistence, and monitoring-evasion behaviors are not implemented.
- Total action, per-action, rate, session-duration, request-timeout, and response-size limits.
- One active runner per audit ledger, enforced by an exclusive lock.
- SHA-256 chained JSONL audit written before network requests.
- Audit records bind to the scope-manifest fingerprint; changed target/routes/limits cannot reuse the same ledger.
- Startup verifies hash links, engagement identity, scope fingerprint, and timestamps; tampered ledgers or unresolved prior attempts fail closed.
- Tests use mocked fetch responses and loopback URLs rather than an external service.
- Workflow validation includes both the original synthetic/adversarial tests and the new scoped-runner tests.

## Operational caveats

- A hash chain is tamper-evident, not immutable. Export completed evidence to separately controlled storage.
- A crash may leave a lock file. Inspect the process and audit ledger before manually removing a stale lock; do not delete it blindly.
- The live adapter currently does not support state-changing HTTP operations. Any such capability must be specified from the real competition rules and separately reviewed.
- Do not store secrets, tokens, or real target details in the repository.
- A passing CI run demonstrates software checks in the tested revision; it does not establish victory over Gemini/Meta, real-system access, or external competition readiness.

## Current release gate

Use the latest GitHub Actions run on `aegis-competition-v0.4` to verify the current code revision before any handoff. External competition readiness remains blocked until the organizer's exact written scope and conditions are supplied and independently reviewed.
