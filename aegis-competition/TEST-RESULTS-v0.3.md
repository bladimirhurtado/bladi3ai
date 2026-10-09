# AEGIS v0.3 Engine Test Results

## Latest confirmed CI result
- Date: 2026-10-09
- Tested revision: `ce504cf15521aec0bb9cf8744c13d7349df7822a`
- GitHub Actions: https://github.com/bladimirhurtado/bladi3ai/actions/runs/37970733172
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
- Malformed-input checks: 2
- Initial-state validation checks: 4
- Action-integrity checks: 1
- Adversarial JUDGE checks: 11
- Hash-chain checks: 2
- Signed-audit checks: 4

## Verified behaviors
- JUDGE rejects missing/empty event streams, malformed events, unknown/missing event fields, invalid initial seeds/modes, and altered replay baselines.
- HYDRA responses are recomputed from the seeded synthetic model instead of trusting logged claims.
- Required event ordering and verification/recovery transitions are checked.
- The action engine uses canonical action properties and ignores forged caller-supplied action attributes.
- Adversarial checks reject tampering, reordering, duplicate actions, missing HYDRA, omitted or duplicated VERIFY, non-finite impact, invalid deception types, injected fields, and forged recovery state.
- Signed audit records verify only with the separately trusted public key and reject modified events, modified record fields, and an untrusted key.

## Interpretation and limits
These results support reproducibility and replay consistency under the tested synthetic conditions. They do not demonstrate access to a real target, evasion of a real detector, or superiority over Gemini or Meta. The audit utility creates/verifies signatures but does not itself securely store private keys or automatically persist records. External competition readiness remains unverified until the organizer-defined interface and success condition are available.
