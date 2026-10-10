# AEGIS v0.4 — Release Gate

## Gate status

- **Branch isolation:** implemented; v0.4 is separate from v0.3 and main.
- **Automated code gate:** use the latest GitHub Actions run on `aegis-competition-v0.4`; this file intentionally does not freeze a CI result to an older commit.
- **External competition gate:** **NOT PASSED**.
- **Live target execution:** **DISABLED BY DEFAULT** until the scope card is completed, reviewed, and kept outside version control.

## What must pass before a controlled live engagement

1. The latest v0.4 commit passes the JavaScript/JSON validation, synthetic engine tests, and scoped-runner tests.
2. An organizer-approved scope file identifies the engagement, written permission, exact origin, exact routes/actions, start/end time, limits, measurable success condition, and stop conditions.
3. A second reviewer confirms that every route and permitted action corresponds to the written rules.
4. The audit ledger location is private and writable; runtime credentials are supplied separately and only by allow-listed header names.
5. The operator verifies no existing runner owns the ledger lock and starts one action at a time.
6. Evidence is independently checked and exported to controlled storage during closeout.

## Stop conditions enforced by the initial live adapter

- Authorization missing, not yet active, or expired.
- Unconfirmed exact target, route, or unsupported method.
- An existing/stale ledger lock, changed scope fingerprint, invalid audit chain, or unresolved prior action.
- Action budget, per-action budget, request-rate limit, session duration, request timeout, or response size exceeded.
- Redirect, any non-success HTTP status, request failure, or organizer stop request.

## Explicit limitations

The current live adapter permits only GET, HEAD, and OPTIONS. It does not implement scanning, exploit delivery, credential attacks, persistence, stealth, or monitoring-evasion behavior. It does not establish the ability to defeat Gemini, Meta, or a real security control. If competition rules require another operation, do not improvise: define the narrow operation from the written scope, test it, and review it before use.

No v0.4 changes should be merged into `main` under this gate.
