---
id: REQ-014-PROD-Production-Line-Registry
title: Production Line Registry
status: inferred
priority: low
tags: [production, production-line, master-data, incomplete]
source_files:
  - apps/api/src/modules/production/entities/production-line.entity.ts
  - apps/api/src/modules/production/production.module.ts
  - apps/api/src/modules/production/production.service.ts
  - packages/api-types/src/schemas/production.schema.ts
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

A production line represents a named physical or logical line within a factory where production orders are executed. Each line belongs to a factory, carries a short code and a human-readable name, and can be activated or deactivated. Production orders reference a production line by UUID to indicate which line will execute the order. **This feature is incomplete — the entity and database table exist, but no REST API endpoints, service methods, or frontend UI for managing production lines have been implemented.**

## Acceptance Criteria

- [ ] A `production_lines` database table exists with columns: `id` (UUID PK), `factoryId` (UUID), `name` (VARCHAR 100), `code` (VARCHAR 50, nullable), `isActive` (BOOLEAN, default true), `createdAt`, `updatedAt`, `deletedAt`.
- [ ] `ProductionLineEntity` is registered in `ProductionModule` via `TypeOrmModule.forFeature`.
- [ ] Production orders can store a `productionLineId` UUID reference (FK to `production_lines` is implied, but no `@ManyToOne` or FK constraint is defined on `ProductionOrderEntity`).

> **NOTE**: All acceptance criteria above describe the current database-layer state only. No CRUD API, service logic, or frontend screens exist for production lines.

## Inferred Business Rules

- **Soft delete**: `ProductionLineEntity` has `@DeleteDateColumn`, so lines are intended to be soft-deleted, not hard-deleted.
- **`isActive` flag**: inactive lines can be preserved in history while being excluded from dropdowns or new order creation — but no filtering logic is implemented yet.
- **`code` is optional**: unlike other master-data entities (e.g. BOM `code`, Work Center `code`) where a short code is required, the production line `code` column is nullable.
- **No FK constraint on orders**: `ProductionOrderEntity.productionLineId` is a plain UUID column with no `@ManyToOne` relation to `ProductionLineEntity`. Referential integrity between orders and lines is not enforced.
- **Seeded data likely exists**: based on the seed file patterns in the repository, production lines are likely seeded directly via SQL. Manual seeding is the only way to create production lines until a CRUD API is implemented.

## Open Questions

1. **When will CRUD endpoints be added?** No controller, service methods, or frontend pages exist for production line management. Is this deferred to a later sprint, or is it expected to be managed by database seeding only?
2. **Should production line be its own module?** Currently `ProductionLineEntity` is registered inside `ProductionModule`. As the entity grows, should it be promoted to a `master-data/production-lines` sub-module similar to work centers?
3. **`productionLineId` validation**: production orders accept any UUID for `productionLineId`. Should validation confirm the referenced line exists and is active within the same factory?
4. **`isActive` filtering on production orders**: should a production order's creation be blocked if its referenced `productionLineId` points to an inactive line?
5. **Capacity tracking**: work centers track capacity (operator count, machine capacity). Should production lines also track capacity or shift schedules?
6. **Relationship to work orders**: work orders are linked to production orders but not directly to production lines. Should the work order execution be scoped to the production line of its parent order?

## Context for Claude

- **Stack**: NestJS, TypeORM, PostgreSQL.
- **Entity file**: `apps/api/src/modules/production/entities/production-line.entity.ts`.
- **Table name**: `production_lines`.
- **Module registration**: `TypeOrmModule.forFeature([ProductionOrderEntity, ProductionLineEntity])` — line entity is registered but no repository is injected into any service.
- **Related features**: PROD-001 (production orders reference `productionLineId`). Compare with MDM-004 (Work Center Management) for the pattern a full production line CRUD implementation would follow.
- **Incomplete flag**: this feature should be treated as a stub. Any implementation work requires adding a repository injection, service methods, controller routes, Zod schemas in `api-types`, and frontend pages.
