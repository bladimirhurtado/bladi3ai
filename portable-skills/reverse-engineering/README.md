# Portable Reverse Engineering Skill

This package includes a self-contained, tool-agnostic `SKILL.md` **and a tested installer** for authorized reverse-engineering work. It can be copied into compatible agent projects without requiring Bladi 3AI's internal workbench or CLI.

## Quick install

From a checkout of this repository, run:

```bash
python3 scripts/install-portable-skill.py /path/to/your/project
```

Default destination: `/path/to/your/project/.agents/skills/reverse-engineering/`. Choose a common alternative with `--agent claude` (for `.claude/skills/`) or `--agent generic` (for `skills/`). Use `--dry-run` to preview. Existing destinations are never overwritten by default; `--force` makes a timestamped backup before replacing them.

Run installer tests from the repository root with:

```bash
python3 -m unittest discover -s tests -p 'test_portable_installer.py' -v
```

The installer uses only Python's standard library and copies the skill instructions; it does not install external analysis tools or grant permissions.

## Install into a project

Copy the whole reverse-engineering directory into the skill-discovery directory supported by your agent. Common conventions include:

- .agents/skills/reverse-engineering/SKILL.md
- .claude/skills/reverse-engineering/SKILL.md
- skills/reverse-engineering/SKILL.md

These are conventions, not a guarantee: check the target agent's current documentation and configured skill paths. Some agents require explicit registration or a restart/reload.

## Use in another project

1. Copy the directory or add this repository as a submodule/subtree if that suits the project's workflow.
2. Confirm the agent discovers the skill and can read its SKILL.md.
3. Check which local tools and permissions actually exist; the skill does not install or grant access to JADX, Ghidra, Frida, Wireshark, shells, filesystems, or devices.
4. Keep project-specific commands in a local adapter or companion instructions rather than hard-coding Bladi 3AI paths into this portable core.
5. Test it on a benign, synthetic sample before relying on it for real work.

## Relationship to Bladi 3AI

The original project-specific skill remains at .agents/skills/ingenieria-inversa-educativa/. This portable package is an exportable counterpart, not a replacement. The Bladi 3AI workbench CLI and docs remain project-specific and optional.

## Safety

Use only on artifacts and systems you own or are authorized to analyze. Begin with static inspection, preserve originals, redact secrets, and do not run unknown samples on a primary device.
