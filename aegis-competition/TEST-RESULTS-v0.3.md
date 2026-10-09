# AEGIS v0.3 Engine Test Results

Date: 2026-10-08

## Method
The engine module source fetched from branch aegis-competition-v0.3 was syntax-checked and executed in an isolated JavaScript runtime. The test harness ran 200 seeds against each of the five synthetic HYDRA modes, for 1,000 matches total. Each seed/mode combination was run twice to compare event streams and scores.

This was an in-session execution of the source, not an independent Node.js or CI run.

## Results
- Total simulated matches: 1,000
- Invalid event replays: 0
- Non-reproducible repeated runs: 0
- Minimum score: 80/100
- Maximum score: 92/100
- Average score: 86.28/100

| Synthetic mode | Runs | Invalid replays | Minimum | Maximum |
| --- | ---: | ---: | ---: | ---: |
| mirror | 200 | 0 | 81 | 81 |
| deceiver | 200 | 0 | 86 | 86 |
| switcher | 200 | 0 | 91 | 91 |
| noise | 200 | 0 | 80 | 92 |
| meta | 200 | 0 | 88 | 88 |

## Interpretation and limits
These results show that the current shared engine produced reproducible synthetic runs and internally consistent event replay under the tested conditions. They do not show that AEGIS can penetrate a real security system, evade a real detector, or outperform Gemini/Meta. The event replay validates recorded transition consistency, not the truthfulness of an adversary's recorded observations. A separate Node.js/CI run and independent review are still required.
