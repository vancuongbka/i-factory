# CLAUDE.md — i-factory (Manufacturing Execution System)

## Project Purpose

MES for multi-factory environments. Manages: Production orders, Work Orders, BOM, Inventory, QC inspections, Async reports, WebSocket notifications, Cross-factory sync.

## Monorepo Layout

```
i-factory/
├── apps/
│   ├── api/          # NestJS REST API + WebSocket (port 3001)
│   └── web/          # Next.js 15 App Router (port 3000)
└── packages/
    ├── api-types/    # Zod schemas + TypeScript types + enums
    ├── database/     # TypeORM DataSource + entity registry
    ├── ui/           # Shared React components
    ├── utils/        # Pure TS utilities
    └── config/       # Shared ESLint + TypeScript configs
```

**Package dependency rules:**
- `apps/api` → `@i-factory/api-types`, `@i-factory/database`, `@i-factory/utils`
- `apps/web` → `@i-factory/api-types`, `@i-factory/ui`, `@i-factory/utils`
- `packages/*` → must NOT import from `apps/*`
- `packages/api-types` → imports nothing else from the monorepo

## Domain Modules

| Domain | Backend Module | Frontend Route |
|--------|---------------|----------------|
| Auth | `modules/auth` | `(auth)/login` |
| Users | `modules/users` | `settings/users` |
| Factories | `modules/factories` | `factories/` |
| Production | `modules/production` | `production/` |
| Work Orders | `modules/work-orders` | `work-orders/` |
| BOM | `modules/bom` | `bom/` |
| Inventory | `modules/inventory` | `inventory/` |
| QC | `modules/quality-control` | `quality-control/` |
| Reports | `modules/reports` | `reports/` |
| Notifications | `modules/notifications` | `notifications/` |
| Sync | `modules/sync` | — |
| Health | `health/` | — |

## Constraints & Rules

1. **Zod only for validation** — never use `class-validator` or `class-transformer`.
2. **Multi-factory filtering mandatory** — every DB query filters by `factoryId`. Guard order: `JwtAuthGuard, RolesGuard, FactoryAccessGuard`.
3. **Soft delete mandatory** — use `@DeleteDateColumn` + `softDelete()`. Never hard-delete.
4. **JSONB for custom fields** — `customFields: jsonb` column per entity.
5. **BullMQ jobs must be idempotent** — safe to retry with the same payload.
6. **TypeScript strict mode** — `"strict": true` everywhere. Never use `any`.
7. **Import convention** — package names for cross-package; relative paths within same app/package.
8. **Migrations mandatory** — never `synchronize: true` in production.
9. **Commit convention** — Conventional Commits: `feat(work-orders): add step assignment API`
10. **WebSocket event naming** — `<domain>:<past-tense-verb>`: `production:order-created`
11. **English only** — all comments, JSDoc, Swagger decorators, and docs must be in English.

## Detail Docs (read on demand)

- **Setup / Running / Env vars / Dev tools** → `docs/claude/setup.md`
- **NestJS backend conventions** → `docs/claude/backend.md`
- **Next.js frontend + i18n conventions** → `docs/claude/frontend.md`
- **Shared packages API reference** → `docs/claude/packages.md`
- **Architecture Decision Records** → `docs/adr/`

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **i-factory** (3083 symbols, 5328 relationships, 57 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/i-factory/context` | Codebase overview, check index freshness |
| `gitnexus://repo/i-factory/clusters` | All functional areas |
| `gitnexus://repo/i-factory/processes` | All execution flows |
| `gitnexus://repo/i-factory/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
