# AEGIS Competition Lab v0.1

A self-contained, offline-first adversarial reasoning laboratory for the ChatGPT/Gemini/Meta competition.

## Safety boundary
This lab uses only synthetic nodes, states, signals, and attacks. It has no network scanner, exploit delivery, credential attack, persistence, or third-party targeting capability.

## Core idea
AEGIS treats an adversary like a chess opponent: it maintains candidate futures several plies ahead, models the adversary's incentives, tests information-gathering moves, and refuses to claim victory without independent verification.

### Components
- **AEGIS** — planner/defender using bounded minimax-style lookahead.
- **HYDRA** — synthetic adversary with deceptive and adaptive moves.
- **JUDGE** — independent verifier and scorer.
- **Memory** — immutable event log and state fingerprints.
- **Recovery** — rollback when a line becomes inconsistent.

## Levels
1. Baseline prediction
2. Deception
3. Adaptive counter-play
4. Noisy/incomplete information
5. Recovery after a false conclusion

The UI runs entirely in the browser and can be opened locally or through GitHub Pages.
