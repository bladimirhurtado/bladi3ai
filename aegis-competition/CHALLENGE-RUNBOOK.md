# AEGIS Challenge Intake and Three-Phase Runbook

Status: prepared for a controlled competition; external execution remains gated on written authorization and the organizer's interface.

## Before starting: mandatory scope card

Record these fields from the organizer before touching any external service:

- Challenge ID and organizer/contact:
- Authorized target and exact boundary:
- Written permission / rules reference:
- Permitted and prohibited techniques:
- Credentials or test accounts explicitly provided:
- Available interface (local binary, API, web app, or simulator):
- Start/end time and request/action limits:
- Exact success condition and scoring method:
- Required evidence and reporting format:
- Stop conditions, emergency contact, and reset procedure:

**Stop rule:** if the target, authorization, permitted methods, or success condition is ambiguous, do not probe the external system. Ask the organizer to clarify. Never infer permission from access alone.

## Phase 1 — Entry puzzle / boundary discovery

1. Read the supplied challenge statement and artifacts before acting.
2. Separate observed facts from assumptions; label confidence for each hypothesis.
3. Generate at least two plausible interpretations and identify the cheapest safe check that distinguishes them.
4. Test only the documented interface and allowed inputs. Keep a timestamped record of each request, response, and decision.
5. Stop when the objective is met, the budget is exhausted, a stop condition fires, or scope becomes unclear.

In the local synthetic lab, represent this phase as a puzzle with explicitly provided clues and mock routes. Do not translate it into bypassing a real service's monitoring or access controls.

## Phase 2 — Execute the assigned task

1. Convert the objective into a measurable pass/fail assertion.
2. Identify prerequisites, constraints, budget, and expected output.
3. Choose the smallest reversible action first; preserve intermediate results.
4. If an attempt fails, record the failure and switch to a distinct permitted hypothesis rather than repeating blindly.
5. Verify the result independently against the organizer's success criterion.
6. Record elapsed time, actions used, evidence, and remaining uncertainty.

## Phase 3 — Safe exit and closeout

1. Stop further actions and confirm no task is still running.
2. Close the authorized test session using its documented logout/teardown path.
3. Remove only temporary resources created by this run when the rules explicitly permit removal.
4. Preserve original evidence, audit logs, hashes, and the event timeline; never wipe logs or conceal activity.
5. Confirm the target is in the expected state, report residual resources, and provide a concise result with limitations.

## Evidence bundle

For each run, preserve:
- Challenge ID, scope card, and rules version.
- Start/end timestamps and software revision.
- Random seed or deterministic replay input where applicable.
- Ordered event log and SHA-256 chain head.
- Independently verified result and exact pass/fail criterion.
- Failures, deviations, unresolved questions, and cleanup confirmation.

Signed audit records must be verified against a public key trusted through a separate channel. Keep private keys outside the repository; the audit utility does not itself provide durable storage or key custody.

## Current readiness

- Local synthetic engine and adversarial self-tests: CI verified.
- External competition readiness: **not yet verified**.
- Missing dependency: organizer-provided scope, allowed techniques, target/interface, success condition, time limit, and detector interface.
- No synthetic score should be described as a real-system entry, detector bypass, or win against Gemini/Meta.
