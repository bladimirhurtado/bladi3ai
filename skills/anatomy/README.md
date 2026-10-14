# Anatomy skill

This directory contains the upstream Anatomy agent skill by Ryan, preserved in this repository under its MIT license.

- Skill instructions: [SKILL.md](./SKILL.md)
- Agent metadata: [agents/openai.yaml](./agents/openai.yaml)
- License: [LICENSE](./LICENSE)
- Upstream project: https://github.com/wheresryan22/anatomy

## What it does

Creates detailed, interactive isometric SVG figures that explain technical ideas as recognizable physical objects, with carefully ordered parts, motion, live readouts, and optional WebGL effects.

## Runtime requirements

The upstream skill specifies Node.js 20.10+ and Chrome/Chromium for checks. Saving this skill in GitHub preserves it; an agent must also load it from a supported skills directory to use it automatically.

## Completeness note

The upstream skill references companion material under `references/`, `examples/`, and `kit/`. Those files must be present for the full upstream workflow. This repository copy is being assembled incrementally; do not treat it as a complete standalone runtime until those companion files and examples have been copied and verified.

## Attribution

Copyright (c) 2026 Ryan. Distributed under the MIT License; see [LICENSE](./LICENSE).
