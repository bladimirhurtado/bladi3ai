# AEGIS v0.3 Engine Test Results

Last confirmed CI result: 2026-10-08, revision `b3aa7711f310e08ead29e5e4eab5d1a8e6365889`.

## Confirmed baseline method
GitHub Actions ran the shared engine self-test independently under Node.js 22. It exercised 200 seeds across each of five synthetic HYDRA modes (1,000 seed/mode matches), running each match twice to compare determinism.

## Confirmed baseline results
- Status: PASS
- Simulated matches: 1,000
- Invalid event replays: 0
- Nondeterministic repeats: 0
- Matches below the score gate: 0
- Minimum score: 80/100
- Maximum score: 92/100
- Average score: 86.29/100
- Adversarial JUDGE checks: 4
- Hash-chain checks: 2

The corresponding GitHub Actions run completed successfully: https://github.com/bladimirhurtado/bladi3ai/actions/runs/37968505365

## New hardening under test
The current branch adds closed event schemas to JUDGE and expands adversarial cases to cover null events, missing HYDRA, duplicate VERIFY, non-finite impact, invalid deception type, injected unknown fields, and forged recovery state. These are not reported as passing until CI completes successfully on the latest revision.

## Interpretation and limits
The baseline demonstrates reproducibility and replay consistency for the tested synthetic conditions only. It does not demonstrate access to a real target, evasion of a real detector, or superiority over Gemini or Meta. The SHA-256 chain detects tampering only when its trusted head is preserved; it is not a signed or independently witnessed audit record.
