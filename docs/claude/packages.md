# Shared Packages — i-factory

## `@i-factory/api-types`
- Zod schemas for all domains (single source of truth for validation)
- TypeScript types: `z.infer<typeof schema>`
- Enums: `WorkOrderStatus`, `ProductionStatus`, `QCResult`, `UserRole`, `MovementType`
- Zero framework dependencies — usable in NestJS and Next.js

## `@i-factory/database`
- TypeORM `DataSource` config (`data-source.ts`)
- Entity registry — single import point for all entities
- Migration CLI: `typeorm migration:run -d packages/database/src/data-source.ts`

## `@i-factory/ui`
- Shared React components: `KpiCard`, `StatusChip`, `Timeline`, `FactorySelector`
- Recharts wrappers: `ProductionTrendChart`, `DefectRateChart`

## `@i-factory/utils`
- `formatDate(date, locale?)` — defaults to `vi-VN`
- `formatVND(amount)` — Vietnamese Dong
- `buildPaginationMeta(total, page, limit)`
- `mergeSyncPayload(local, remote, strategy)` — cross-factory merge

## `@i-factory/config`
- `eslint/base.js`, `eslint/nextjs.js`, `eslint/nestjs.js`
- `typescript/base.json`, `typescript/nextjs.json`, `typescript/nestjs.json`
