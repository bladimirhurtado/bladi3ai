# AEGIS Competition Lab v0.4

AEGIS is a controlled competition-research project with a reproducible synthetic engine and a fail-closed adapter for explicitly authorized, narrowly scoped live HTTP checks.

## Current components

- `engine.mjs`: shared deterministic planning and synthetic match logic.
- `app.js`: browser interface for synthetic matches.
- `self-test.mjs`: repeatability, replay, and adversarial test harness.
- `audit-record.mjs`: Ed25519 signed audit-record utilities.
- `scoped-runner.mjs`: new controlled runner for organizer-approved, exact-route HTTP actions.
- `scoped-runner.test.mjs`: tests using mocked fetch responses; no external host is contacted.
- `engagement-scope.template.json`: intentionally non-runnable scope-card template.
- `REAL-COMPETITION-OPERATIONS.md`: authorization, execution, audit, and closeout procedure.

## Real actions, strictly scoped

The live adapter can issue actual HTTP requests only after the written authorization window, exact origin, exact action route, rate/action/time/response budgets, success criteria, and stop conditions are explicitly configured. Its first release permits only `GET`, `HEAD`, and `OPTIONS`; callers cannot supply arbitrary URLs, methods, bodies, or redirect destinations. Redirects, authorization denials, rate-limit responses, server errors, timeouts, oversized responses, malformed/tampered audit logs, and unresolved prior attempts stop execution. A per-ledger exclusive lock prevents concurrent runner processes; close cleanly with `await runner.close()`, and review stale lock files after a crash.

It intentionally does not provide network scanning, exploit delivery, credential guessing, persistence, stealth, or monitoring-evasion functions. Any future state-changing operation must be implemented narrowly against the competition's written rules and separately reviewed.

## Validation

Run using Node.js 22 or later:

```sh
node --check aegis-competition/engine.mjs
node --check aegis-competition/audit-record.mjs
node --check aegis-competition/self-test.mjs
node --check aegis-competition/scoped-runner.mjs
node aegis-competition/self-test.mjs
node aegis-competition/scoped-runner.test.mjs
```

The synthetic suite's prior report recorded 1,000 matches across five synthetic HYDRA modes (minimum 80, maximum 92, average 86.29). Those results describe only the previously tested revision and synthetic conditions; the new v0.4 branch must pass its own CI before being considered verified.

## Release gates

1. Verify the latest branch commit through CI.
2. Keep v0.1, v0.2, v0.3, and `main` unchanged as rollback/reference points.
3. Validate the runner only with mocked transports and loopback tests before any live use.
4. Do not enable a live scope unless written organizer authorization and the actual competition rules are on file.
5. Do not claim success against Gemini, Meta, or any external system without an independent authorized evaluation and reproducible evidence.
