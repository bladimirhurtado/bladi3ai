# AEGIS v0.2 Internal Gate

## Attack matrix
- Predictable reconnaissance → META punishes repeated scan behavior.
- Deception → DECEIVER injects bait/switch responses.
- Alternating strategy → SWITCHER changes pressure by round.
- Noisy environment → NOISE varies impact and signal.
- Resource starvation → every action consumes budget.
- False victory → JUDGE replays events independently.
- State tampering → SHA-256 event chain exposes modified history.
- Confidence collapse → verification and rollback are mandatory.
- Over-analysis → bounded 5-ply search.

## Hard rule
A passing UI message is not evidence. The replayable event stream and independent judge are the evidence.

## Status
v0.2 architecture: implemented. External Gemini/Meta testing has not been performed by this repository and must not be claimed until an authorized event interface exists.