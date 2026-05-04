# AGENTS.md

## Overview

This is a SpecFlow/Speckit-based agent workflow repository using OpenCode. El repositorio está ubicado en `/Users/nandoski/BackIng_`.

## Commands

Execute workflow commands via `/speckit.<command>`:

- `/speckit.constitution` — Create/update project constitution
- `/speckit.specify` — Generate feature specification
- `/speckit.plan` — Execute implementation planning
- `/speckit.tasks` — Break plan into tasks
- `/speckit.analyze` — Cross-artifact consistency analysis
- `/speckit.checklist` — Create verification checklist
- `/speckit.implement` — Execute implementation
- `/speckit.clarify` — Interactive clarification

## Templates

Templates are in `.specify/templates/`:

- `constitution-template.md` — Constitution base
- `spec-template.md` — Feature specification
- `plan-template.md` — Implementation plan
- `tasks-template.md` — Task breakdown
- `agent-file-template.md` — Agent context file
- `checklist-template.md` — Verification checklist

## Execution Flow

```
/speckit.specify → /speckit.plan → /speckit.tasks → /speckit.checklist → /speckit.implement
                  ↑                                      ↓
                  └──────── /speckit.analyze (after tasks) ──┘
```

## Important Paths

- **Working directory**: `/Users/nandoski/BackIng_`
- **Specs**: `specs/` — Feature specifications
- **Scripts**: `.specify/scripts/bash/` — Workflow scripts
- **Constitution**: `.specify/memory/constitution.md` — Project principles

## Scripts

- `.specify/scripts/bash/create-new-feature.sh` — Creates new feature branch and spec (use `--json --short-name`)
- `.specify/scripts/bash/setup-plan.sh --json` — Gets feature directory and branch info

## Constitution

Project principles in `.specify/memory/constitution.md` are **non-negotiable**.

## Context Files

Generated from plans via `.specify/scripts/bash/update-agent-context.sh` (e.g., CLAUDE.md, .cursorrules).
