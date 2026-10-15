# Reverse Engineering Workbench Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver a safe, read-only, dependency-free first version of Bladi 3AI's reverse-engineering workbench with repeatable file triage, documentation, tests, and CI checks.

**Architecture:** A Python standard-library CLI inspects a user-selected file without executing it or extracting archive contents. A small core module returns structured metadata; the CLI renders JSON or human-readable output. Unit tests use temporary synthetic files and malformed archives. Documentation and the existing skill explain when to use specialized external tools for deeper analysis.

**Tech Stack:** Python 3 standard library, unittest, GitHub Actions, Markdown.

**Spec:** `docs/reverse-engineering/SPEC.md`

## Global Constraints

- Work on `feat/reverse-engineering-workbench`; preserve all existing files and original Anatomy assets.
- No third-party Python dependencies.
- Never execute, extract, upload, or modify the inspected sample.
- Treat filenames/extensions as hints, not proof of file type or safety.
- Do not include file contents, secrets, tokens, or personal data in reports.
- ZIP/APK inspection must be bounded and must not write archive entries to disk.
- Tests use synthetic temporary fixtures only; CI must not download or execute real samples.
- Clearly label results as preliminary triage, not a malware verdict or full decompilation.
- Do not claim external tools are installed or that Android/device validation occurred unless actually performed.

## Review Focus

1. Missing, unreadable, non-regular, empty, or oversized inputs return controlled errors.
2. ZIP metadata may be malicious or malformed; inspection must be bounded and never extract entries.
3. Absolute paths, parent traversal, duplicate archive names, and suspicious compression ratios are reported without writing files.
4. File extensions can be spoofed; detected format should be based on signatures/structure where possible and remain a best-effort guess.
5. JSON output must be valid, stable, and redact sample contents; errors must have predictable exit codes.
6. CLI invocation from repository root and another working directory must not depend on the current directory for imports.
7. CI validation must continue to run existing skill validation and installer checks.

---

### Task 1: Add tests for the triage core

**Files:**
- Create: `tests/test_re_triage.py`

**Interfaces:**
- Consumes: planned `scripts/re_triage.py` functions `inspect_file(path, max_bytes=...)` and `main(argv=None)`.
- Produces: test expectations for stable JSON fields, SHA-256, size, signature hints, ZIP entry summaries, suspicious path detection, and controlled error handling.

- [x] **Step 1: Write unit tests first** for normal files, empty files, missing files, size limits, misleading extensions, valid synthetic ZIP/APK-like ZIP, corrupt ZIP, traversal/absolute/duplicate entry names, and JSON output.
- [ ] **Step 2: Run tests before implementation** and confirm they fail because the module/API is absent. (Not captured as a failing test run; final suite was verified in CI.)
- [x] **Step 3: Keep fixtures synthetic** using Python's `tempfile` and `zipfile`; do not check in binary samples.

### Task 2: Implement the read-only triage CLI

**Files:**
- Create: `scripts/re_triage.py`
- Test: `tests/test_re_triage.py`

**Interfaces:**
- `inspect_file(path: str | Path, max_bytes: int = DEFAULT_MAX_BYTES) -> dict`
- `main(argv: Sequence[str] | None = None) -> int`

- [x] **Step 1: Implement file validation** (exists, regular file, size bound, stable error handling).
- [x] **Step 2: Calculate SHA-256 and basic metadata** in bounded chunks; inspect only a limited signature prefix.
- [x] **Step 3: Add best-effort format hints** for common signatures without claiming safety.
- [x] **Step 4: Inspect ZIP central-directory metadata only** with entry-count and total-metadata limits; never extract, never read entry payloads, never write to disk.
- [x] **Step 5: Report suspicious archive paths** (absolute paths, drive prefixes, parent traversal), duplicate names, and unusually high declared compression ratios as signals only.
- [x] **Step 6: Add stable JSON output, readable text output, `--help`, and nonzero exit codes on controlled failures.**
- [x] **Step 7: Run focused tests** and ensure they pass.

### Task 3: Document reports and tool selection

**Files:**
- Create: `docs/reverse-engineering/REPORT-TEMPLATE.md`
- Create: `docs/reverse-engineering/USAGE.md`
- Create: `.agents/skills/ingenieria-inversa-educativa/re-tooling.md`
- Modify: `.agents/skills/ingenieria-inversa-educativa/SKILL.md`

- [x] **Step 1: Create report template** separating observed evidence, inference, confidence, alternative explanations, limitations, and next steps.
- [x] **Step 2: Document CLI usage** with harmless examples, JSON schema fields, exit codes, limits, and no-extraction guarantee.
- [x] **Step 3: Document official tool choices** for Ghidra, JADX, Frida, and Wireshark, including prerequisites, when useful, and limitations.
- [x] **Step 4: Expand the skill** with authorization/scope, preservation, static triage, specialist analysis, optional isolated dynamic analysis, evidence validation, and report steps.
- [x] **Step 5: Verify** examples match the implemented CLI exactly.

### Task 4: Integrate validation and catalog

**Files:**
- Modify: `.github/workflows/validate-skills.yml`
- Modify: `.agents/skills/README.md` (only if the existing catalog needs more detail)

- [x] **Step 1: Inspect current workflow** and preserve all existing jobs/checks.
- [x] **Step 2: Add Python test execution** using a supported Python 3 version and `python -m unittest discover -s tests -v`.
- [x] **Step 3: Add Python syntax check** for the CLI and test module.
- [x] **Step 4: Run existing skill validator and installer smoke checks** unchanged.
- [ ] **Step 5: Confirm CI does not install Ghidra/JADX/Frida/Wireshark and does not process external samples.**

### Task 5: Verify and report

**Files:** no new product files; inspect all changed files.

- [x] **Step 1: Run the full test suite** and skill validation commands available in the repository.
- [x] **Step 2: Inspect the final diff** for accidental deletions, unrelated edits, unsafe sample handling, and secrets.
- [x] **Step 3: Confirm help output and a benign temporary-file run**; record exact output/exit codes.
- [x] **Step 4: Check GitHub Actions results** for the final branch/PR commit.
- [x] **Step 5: Report verified facts, untested areas, and the next practical validation step. Do not merge to `main` unless explicitly requested or following the repository's established approved workflow.**

## Verification Commands

```bash
python -m unittest discover -s tests -v
python -m py_compile scripts/re_triage.py tests/test_re_triage.py
python scripts/re_triage.py --help
python scripts/validate-skills.py
bash -n scripts/install-skills-toolkit.sh
bash scripts/install-skills-toolkit.sh --help
```

## Completion Criteria

The first version is ready for review only when all tests and CI checks pass, the CLI is read-only and does not extract or execute samples, the documentation matches actual behavior, and the report clearly states that this is static triage rather than a complete reverse-engineering engine.


## Execution record

- Latest verified branch commit: `2682cbf0f1c78265cd77e0022c796ab1596ca26c`.
- GitHub Actions `Validate reusable skills`: success (run 24); skill validation, unit tests, Python syntax, CLI help, synthetic-file JSON smoke test, installer syntax and installer help all succeeded.
- GitHub Actions `Validate Bladi 3AI`: success (run 53).
- Repository comparison against `main`: 13 commits ahead, 0 behind; 10 intended files changed, no deletions.
- Limitation: the planned TDD red-phase run (running tests before the implementation existed) was not captured; the final tests and CI passed.
- No real APK/binary samples were processed, and no specialist reverse-engineering tools or Android device were tested.
