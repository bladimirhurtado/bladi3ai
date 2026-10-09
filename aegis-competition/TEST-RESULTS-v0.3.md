# AEGIS v0.3 Engine Test Results

## Latest confirmed CI result
- Date: 2026-10-09
- Tested revision: `902d5174f257a2c1212d527bfcf86034c12e310e`
- GitHub Actions: https://github.com/bladimirhurtado/bladi3ai/actions/runs/37970354750
- Runtime: Node.js 22.23.3
- Status: PASS

## Method
GitHub Actions independently executed the shared engine self-test under Node.js. The harness ran 200 seeds against each of five synthetic HYDRA modes (1,000 seed/mode matches), repeating each match to check deterministic event streams and results.

## Results
- Simulated matches: 1,000
- Invalid event replays: 0
- Nondeterministic repeats: 0
- Matches below the score gate: 0
- Minimum score: 80/100
- Maximum score: 92/100
- Average score: 86.29/100
- Action-integrity checks: 1
- Adversarial JUDGE checks: 11
- Hash-chain checks: 2

## Changes verified by the test suite
- JUDGE rejects malformed event streams and unknown/missing event fields.
- HYDRA responses are recomputed from the seeded synthetic model instead of trusting logged claims.
- Required event ordering and verification/recovery transitions are checked.
- The action engine uses canonical action properties and ignores forged caller-supplied action attributes.
- The test suite rejects tampering, reordering, duplicate actions, missing HYDRA, omitted or duplicated VERIFY, non-finite impact, invalid deception types, injected fields, and forged recovery state.
- The event-chain test accepts the original chain and detects an altered event.

## Interpretation and limits
These results support reproducibility and replay consistency under the tested synthetic conditions. They do not demonstrate access to a real target, evasion of a real detector, or superiority over Gemini or Meta. The SHA-256 chain is not a digital signature; a trusted head must be preserved independently to detect later replacement. External competition readiness remains unverified until the organizer-defined test interface and success condition are available.
