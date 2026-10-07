# AEGIS Competition Lab v0.2

AEGIS is an offline, synthetic adversarial reasoning laboratory built for a controlled AI competition.

## Offensive doctrine
AEGIS does not merely defend. It seeks initiative, information advantage, forced choices, and favorable future branches. It models an adversary several moves ahead and includes a meta-adversary designed to punish predictable reconnaissance.

## Architecture
- **AEGIS** — offensive planner with bounded 5-ply lookahead, information actions, resource budget, and recovery.
- **HYDRA** — five synthetic adversary families: mirror, deceiver, switcher, noise, meta.
- **JUDGE** — replays the event stream from the initial seed/state instead of trusting AEGIS's final claims.
- **Integrity** — SHA-256 chained event log.
- **Recovery** — verification and rollback when confidence collapses.

## What v0.2 fixes
v0.1 was too predictable: HYDRA responses were mostly deterministic, the judge depended on AEGIS's final state, recovery was simplistic, and there was no reproducible event replay or tamper-evident log.

v0.2 adds hidden adversary modes, second-order/meta pressure, budget constraints, independent replay scoring, and cryptographic event-chain integrity.

## Competition boundary
The lab is intentionally synthetic and local. It does not scan networks, deliver exploits, attack credentials, persist on hosts, or target third parties.

## Promotion gate
A candidate is not considered ready merely because the UI says PASS. It must:
1. reproduce from a seed,
2. survive every synthetic adversary family,
3. pass independent replay,
4. preserve event-chain integrity,
5. score at least 80/100,
6. expose failures instead of masking them.

The next stage is external competition using only the event's authorized interface and rules.