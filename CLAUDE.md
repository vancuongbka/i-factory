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
