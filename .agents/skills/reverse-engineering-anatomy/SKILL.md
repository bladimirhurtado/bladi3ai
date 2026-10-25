---
name: reverse-engineering-anatomy
description: Combine evidence-driven, authorized reverse engineering with Anatomy-style visual explanations of software structure, API flows, and verified behavior.
---

# Reverse Engineering + Anatomy

## Purpose
Analyze a software system or artifact with reproducible evidence, then explain the verified architecture through an Anatomy-style technical illustration. This skill composes the existing `reverse-engineering` and upstream `anatomy` skills; it does not replace, copy over, or weaken either original.

## Mandatory workflow
1. Read `.agents/skills/reverse-engineering/SKILL.md` and `.agents/skills/anatomy/SKILL.md`. Follow both.
2. Establish ownership/authorization, scope, permitted operations, data handling, and stop conditions. Do not bypass access controls or administrative restrictions.
3. Preserve the source and record commit/hash/version. Start with documentation and static inspection. Never claim a tool was run unless its output exists.
4. State the question, hypotheses, evidence needed, and smallest useful test.
5. Map the observed components and interfaces. Label each statement as:
   - **Observed**: directly supported by source, docs, output, or a reproducible test.
   - **Inferred**: plausible interpretation with evidence and confidence.
   - **Unknown**: not established yet.
6. Create an evidence ledger: finding ID, claim, source path/API/response, method, confidence, counter-evidence, and next check. Redact tokens, credentials, and personal data.
7. Use Anatomy to explain the architecture as a crafted visual technical object. Keep component geometry and connections consistent with the evidence; do not draw a speculative dependency as fact. Include a visible legend for observed/inferred/unknown and useful labels/readouts. Reuse the original Anatomy examples and helpers where suitable instead of copying its package.
8. Test the diagram and the underlying behavior separately. A visually correct diagram is not proof that the software works.
9. Report changed files, actual test commands/results, unresolved dependencies, security/privacy implications, and rollback path.

## Integration and account-access projects
- Prefer official provider APIs and documented OAuth flows with minimum necessary scopes.
- Do not request passwords or commit OAuth secrets/tokens. Use environment variables or a secret manager.
- Never bypass administrator policy, OAuth consent, MFA, app verification, or provider restrictions. If a connector is disabled, a separate authorized integration may be designed, but it does not re-enable the disabled connector.
- Separate local prototypes from hosted production integrations. A local client does not automatically give ChatGPT access; that requires a separately authorized, reachable integration supported by the runtime.
- Require explicit confirmation for consequential actions such as sending messages, deleting files, or changing account data.
- If a blocker appears, identify its root cause and offer a safe alternative skill/tool, recording what it can and cannot solve. Do not keep retrying the same blocked path.

## Completion criteria
- [ ] Scope and authorization defined.
- [ ] Original artifact/source preserved.
- [ ] Findings traceable to evidence and uncertainty labelled.
- [ ] Anatomy figure reflects verified components and has a legend.
- [ ] Tests run and results accurately reported.
- [ ] Secrets and personal data protected.
- [ ] Remaining external prerequisites are named, not hidden.
