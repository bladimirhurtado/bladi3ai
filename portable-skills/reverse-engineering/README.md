# Portable Reverse Engineering Skill

This directory contains a self-contained, tool-agnostic SKILL.md for authorized reverse-engineering work. It is designed to be copied into compatible agent projects without requiring Bladi 3AI's repository layout or CLI.

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
