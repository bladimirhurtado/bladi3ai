# AEGIS v0.4 — Real Competition Operations

## Purpose

This branch begins the transition from a synthetic reasoning lab to a controlled competition runner. Real competition interactions must be bound to the organizer's written scope; they must not be guessed from a challenge URL, a login page, or network reachability.

The runner can issue real HTTP requests, but only to an exact organizer-approved origin and exact predeclared routes. Its initial live adapter deliberately permits only `GET`, `HEAD`, and `OPTIONS`. It does not scan, exploit, guess credentials, follow redirects, mutate remote state, or retry failures automatically. If the competition requires state-changing actions, that adapter must be designed and reviewed against the written rules before being enabled.

## Required configuration

Start from `engagement-scope.template.json` and create a private, engagement-specific copy outside the repository. Never commit tokens, credentials, or real private target details.

Before changing `authorization.confirmed` to `true`, the operator must possess:
- Written permission from the organizer and a reference to that permission.
- The exact target origin and route list, not a wildcard or a broad network range.
- A named approver, authorization start time, and expiry time.
- The action budget, request-rate limit, time limit, and maximum response size.
- A measurable success criterion, required evidence, and stop conditions.

The scope template is intentionally non-runnable. The runner must fail closed until each mandatory field is completed.

## Execution model

1. Review the organizer's rules and complete the scope card.
2. Have a second person review the scope, routes, budgets, and stop conditions.
3. Supply any required secret at runtime through a secret manager or local environment; allow-list its header name in the private scope file. Do not put secret values in JSON, logs, commits, or screenshots.
4. Store the JSONL audit file in a private writable location outside version control.
5. Construct the runner explicitly and invoke one named action at a time. The caller cannot pass an arbitrary URL, HTTP method, request body, or redirect destination.
6. Inspect the returned status and evidence before authorizing the next action. There are no automatic retries.
7. Stop immediately on a redirect, timeout, response-size limit, authentication denial, rate-limit response, server-side error, unclear scope, or organizer stop request.
8. At closeout, preserve the audit log and hash chain, verify the result independently, and report failures and uncertainties.

## Audit behavior

Each action attempt is written to a SHA-256 chained JSONL audit ledger before the network request is sent. The ledger includes the engagement ID, action ID, exact route, timestamp, result status, response byte count and response hash; it does not store authentication headers or full response bodies. The exact response body is returned to the caller for task-specific verification, subject to the configured size ceiling.

The runner obtains an exclusive lock next to the ledger, preventing two runner processes from issuing actions against the same engagement ledger concurrently. On clean exit, call `await runner.close()`; this writes a closeout event and releases the lock. A crash can leave a stale lock. Do not delete it blindly: verify that no runner process remains and review the ledger first, then remove the stale lock under operator control.\n\nOn restart, the runner replays and verifies the ledger, restores its action counters, and fails closed if the ledger is malformed, tampered with, has invalid timestamps, or contains an action whose outcome is unresolved. A hash chain is tamper-evident, not immutable storage: copy completed evidence to a separately controlled location after the engagement. Use operating-system permissions and suitable storage controls.

## What is not yet enabled

- State-changing HTTP methods or arbitrary request bodies.
- Dynamic discovery, scanning, exploit delivery, credential attacks, persistence, stealth, or attempts to evade monitoring.
- Any action outside the exact manifest routes.
- Automatic retries or redirect following.
- Claims of success without independent evidence.

These are explicit release boundaries, not temporary UI labels. If the organizer's task truly requires additional behavior, implement only the narrow operation permitted by the written rules, add its own tests, and require review before using it.

## Local verification

Run the tests with Node.js 22 or later:

```sh
node --check aegis-competition/scoped-runner.mjs
node aegis-competition/scoped-runner.test.mjs
node aegis-competition/self-test.mjs
```

The scoped-runner tests use a mocked fetch transport and loopback URLs; they do not contact an external host. A passing test suite verifies the guardrails and reproducibility of the harness, not the target's security or the ability to defeat another AI system.
