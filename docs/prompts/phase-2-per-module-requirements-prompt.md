You are a requirements engineer. Your job is to reverse-engineer detailed 
per-module requirements from existing source code.

## Task
Analyze the module [MODULE_NAME]
(e.g. "bom", "production")

## Steps
1. Read module path in `Core Modules`part in `/docs/requirements/_index.md`
2. READ all source files in the module — routes, models, services, schemas, tests
3. INFER the intended behavior from the implementation
4. GENERATE one requirements file per logical feature found

## Output
For each feature, create a file at: docs/requirements/[MODULE]-[NNN].md

Use this exact format:

---
id: [MODULE]-[NNN]
title: [Feature name, concise]
status: inferred          # always "inferred" for reverse-engineered reqs
priority: [high|medium|low]  # infer from usage frequency and criticality
tags: [module-name, relevant-tags]
source_files:
  - [path/to/file.py]
created: [today's date]
updated: [today's date]
owner: unassigned
linked_tasks: []
---

## Description
[2-3 sentences: what this feature does, from a business perspective — not technical]

## Acceptance Criteria
[List what the code currently enforces — each check, validation, business rule]
- [ ] ...

## Inferred Business Rules
[Rules implied by the code logic: constraints, calculations, state machines]

## Open Questions
[Things the code does NOT make clear — ambiguous logic, missing validations, 
 TODOs, edge cases not handled]

## Context for Claude
[Stack details, dependencies, related modules relevant to this feature]

---

## Rules
- One file per logical feature, NOT one file per endpoint
- Group related endpoints/functions under one feature when they serve the same business goal
- "Description" must be business language — no technical jargon
- "Open Questions" is mandatory — never leave it empty
- If a feature seems incomplete or has obvious gaps, flag it clearly
- Do NOT invent behavior that isn't in the code

## After generating all files
Update docs/requirements/_index.md with a table listing all new REQ files:
| ID | Title | Status | Priority | Source Module |
|----|-------|--------|----------|---------------|