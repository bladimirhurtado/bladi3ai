---
name: reverse-engineering
description: Portable, evidence-driven reverse engineering for authorized analysis of source code, binaries, Android APKs, archives, protocols, and observable software behavior. Static-first, tool-aware, and safe by default.
---

# Reverse Engineering — Portable Skill

## Mission
Explain how a software artifact or system is structured and behaves using reproducible evidence. Support source-code review, binary triage, Android APK inspection, dependency and protocol analysis, and authorized dynamic investigation. Do not claim to recover original source code exactly from decompiled output.

## Start every engagement
1. **Define scope and authorization.** Record the artifact/system, owner or permission basis, question to answer, permitted methods, exclusions, and data-handling constraints. If authorization is unclear, ask before intrusive testing.
2. **Preserve evidence.** Keep the original unchanged; work on an authorized copy. Record filename, size, SHA-256, acquisition context, tool versions, and timestamps where relevant. Do not upload confidential artifacts to third-party services without explicit permission.
3. **Choose the least invasive method.** Begin with documentation, file signatures, metadata, manifests, source structure, dependency manifests, symbols, and other static evidence. Do not execute an unknown sample merely to identify it.
4. **Create a question-led plan.** State hypotheses, what evidence would support or refute them, and the next smallest useful test.

## Analysis workflow
### A. Triage and classify
- Determine actual format from signatures/structure rather than extension alone.
- Record hashes, sizes, architecture, file type, packaging, and relevant metadata.
- For archives, inspect bounded metadata before considering extraction. Guard against path traversal, duplicate names, excessive entry counts, oversized data, and suspicious compression ratios.
- Treat indicators as leads, not verdicts.

### B. Select tools by question
- **Source projects:** directory inventory, manifests, imports, call sites, tests, configuration, and dependency graph.
- **Android APK/DEX:** Android manifest/resources and Java/Kotlin decompilation with a reputable static-analysis tool such as JADX; use apktool when resource/smali inspection is needed.
- **Native binaries:** file/architecture inspection and disassembly/decompilation with Ghidra or equivalent.
- **Runtime behavior:** use Frida or debuggers only on an authorized, isolated target when static evidence cannot answer the question.
- **Network behavior:** use Wireshark or equivalent with authorized captures and respect privacy; redact credentials and personal data.
- Verify tool availability, version, provenance, and actual output. A tool being mentioned here does not mean it is installed.

### C. Build traceable findings
For each finding, capture:
- ID and category;
- claim written narrowly;
- evidence source (file/path, symbol, line/range, offset, log/capture, or command output);
- minimal sanitized excerpt or digest where useful;
- method and tool version;
- confidence (high, medium, low) with rationale;
- alternatives, limitations, and a follow-up test.

Separate **observed facts**, **inferences**, and **unknowns**. Prefer findings that another analyst can reproduce. Search for counter-evidence and plausible benign explanations. Do not expose secrets, tokens, private keys, or personal data; redact them and report only their presence and location at a safe level.

### D. Dynamic analysis (optional)
Only when authorized and necessary:
- use a disposable, isolated lab or emulator/VM;
- use synthetic accounts/data and controlled network access;
- snapshot before testing and define stop conditions;
- capture commands, timestamps, logs, and environment details;
- never run unknown samples on a primary personal device or production system.
If these controls are unavailable, remain static and explain the limitation.

### E. Report
Deliver:
1. question and scope;
2. artifact identity and SHA-256 where applicable;
3. environment, tools, and reproducible methods;
4. findings with evidence and confidence;
5. hypotheses rejected or unresolved;
6. limitations and possible false positives;
7. prioritized next steps.

## Safety and integrity rules
- Analyze only systems and artifacts you own or are explicitly authorized to examine.
- Do not assist credential theft, unauthorized access, stealthy persistence, malware deployment, or bypassing protections for abuse.
- Do not execute payloads or extract/run archive contents as part of initial triage.
- Do not modify the original artifact. Make code changes only in a separate working copy/branch and preserve rollback points.
- Never describe an untested action as tested or claim a tool is installed without checking.
- If a requested step exceeds authorization or creates unacceptable risk, explain the boundary and offer a safe static alternative.

## Tool adapter contract
This skill is tool-agnostic. Use tools available in the current agent/runtime; do not assume a shell, filesystem, network, emulator, or specialized reverse-engineering suite exists. If a local CLI or project-specific workbench is available, consult its usage docs and limits before invoking it. Keep tool invocation and findings reproducible, and request approval before destructive, network-active, or otherwise consequential actions.

## Completion checklist
- [ ] Scope and authorization recorded
- [ ] Original preserved and artifact identity recorded
- [ ] Static-first method used
- [ ] Claims tied to evidence and confidence
- [ ] Secrets/PII redacted
- [ ] Tool availability and execution claims verified
- [ ] Limitations and next steps documented
