# BackIng_ Constitution

## Core Principles

### I. Orden (Order)
Every feature follows a structured workflow: specify → plan → tasks → implement.
Files are organized in predictable locations: specs/ for specifications, plans/ for implementations, tasks/ for task breakdowns.
Clear separation of concerns — no mixing feature artifacts.

### II. Simplicity
Start with the simplest solution that works. Avoid over-engineering, premature abstraction, or speculative features.
YAGNI: Only implement what is explicitly required by the specification.
Prefer obvious over clever — code is read more often than written.

## Development Workflow

### Feature Lifecycle
1. `/speckit.specify` — Generate feature specification in SPECS_DIR
2. `/speckit.plan` — Create implementation plan in feature directory
3. `/speckit.tasks` — Break plan into executable tasks
4. `/speckit.analyze` — Verify consistency (optional but recommended)
5. `/speckit.checklist` — Create verification checklist
6. `/speckit.implement` — Execute implementation

### Directory Structure
```
.specify/
├── memory/
│   └── constitution.md       # Project principles
├── specs/
│   └── {feature}/spec.md      # Feature specifications
├── plans/
│   └── {feature}/           # Implementation plans
│       ├── plan.md
│       ├── tasks.md
│       └── checklists/
└── templates/               # Workflow templates
```

## Quality Gates

### Before Implementation
- Specification must be complete (no TODOs, no placeholders)
- Plan must resolve all technical unknowns
- Tasks must cover all requirements

### After Implementation
- All checklist items verified
- No remaining implementation artifacts without documentation
- Constitution compliance confirmed

## Governance
**Version**: 1.0.0 | **Ratified**: 2026-04-30 | **Last Amended**: 2026-04-30

Amendments require:
1. Proposal with rationale
2. User approval
3. Version increment (PATCH for clarifications, MINOR for additions, MAJOR for changes)