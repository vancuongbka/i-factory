You are a requirements analyst. Analyze this entire codebase and generate a 
high-level project requirements document.

## Task
Read all source files, then create `/docs/requirements/_index.md`

## Output format
---
id: PROJECT-OVERVIEW
title: [Project name extracted from code]
status: reverse-engineered
generated_at: [today's date]
stack: [list tech stack found]
---

## Project Purpose
[Infer from code what this system does]

## Core Modules
[List major modules/domains found]

## Requirements Summary Table
| ID | Title | Module | Status | Priority |
|----|-------|--------|--------|----------|
[Fill rows — generate IDs as REQ-001, REQ-002...]

## Open Questions
[List anything ambiguous or unclear in the codebase]

## Rules
- Infer requirements FROM behavior in code, not from comments alone
- If a feature is partially implemented, mark status: partial
- Do NOT invent requirements not evidenced by code
- Priority: mark as high if it's in main flow, medium if supporting, low if utility