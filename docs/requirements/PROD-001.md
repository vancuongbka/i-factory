---
id: PROD-001
title: Production Order Management
status: inferred
priority: high
tags: [production, production-order, crud, lifecycle, progress-tracking]
source_files:
  - apps/api/src/modules/production/production.controller.ts
  - apps/api/src/modules/production/production.service.ts
  - apps/api/src/modules/production/entities/production-order.entity.ts
  - packages/api-types/src/schemas/production.schema.ts
  - packages/api-types/src/enums/production-status.enum.ts
  - apps/web/src/app/(app)/production/page.tsx
  - apps/web/src/app/(app)/production/new/page.tsx
  - apps/web/src/app/(app)/production/[id]/page.tsx
  - apps/web/src/app/(app)/production/_components/production-table.tsx
  - apps/web/src/app/(app)/production/_components/create-production-form.tsx
  - apps/web/src/app/(app)/production/_components/production-detail-client.tsx
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

A production order is the primary document authorising and tracking the manufacture of a specific product quantity within a factory. It records planned and actual production dates, tracks how much has been completed versus what was ordered, and carries an optional link to the Bill of Materials and production line to be used. Production orders progress through a defined set of statuses from initial drafting through completion or cancellation.

## Acceptance Criteria

- [ ] A production order can be created with: `factoryId` (UUID, injected from route), `code` (2–50 chars, required), `productName` (1–200 chars, required), `quantity` (positive number, required), `unit` (max 20 chars, required), `plannedStartDate` (ISO datetime string, required), `plannedEndDate` (ISO datetime string, required), `productionLineId` (UUID, optional), `bomId` (UUID, optional), `notes` (max 1000 chars, optional), `customFields` (JSONB object, optional).
- [ ] Creating, updating, and deleting a production order requires role `SUPER_ADMIN`, `FACTORY_ADMIN`, or `PRODUCTION_MANAGER`.
- [ ] All requests are validated by `createProductionOrderSchema` / `updateProductionOrderSchema` via `ZodValidationPipe`.
- [ ] A newly created order has status `DRAFT` by default.
- [ ] `completedQuantity` defaults to `0` at creation.
- [ ] The list endpoint (`GET /factories/:factoryId/production`) returns all orders for the factory (including non-DRAFT), ordered by `createdAt` descending.
- [ ] The list endpoint does not filter by `isActive` or exclude soft-deleted records — TypeORM's soft-delete filter applies automatically via `@DeleteDateColumn`.
- [ ] The detail endpoint returns a 404 `NotFoundException` if the order is not found within the factory scope.
- [ ] Updates (`PATCH /:id`) apply any subset of fields from `updateProductionOrderSchema` (all fields optional); the status, actual dates, and `completedQuantity` can all be updated via this endpoint.
- [ ] Soft-delete sets `deletedAt`; no hard-delete endpoint is exposed.
- [ ] The frontend list view displays: code, productName, quantity with unit, status badge, plannedStartDate, plannedEndDate.
- [ ] The frontend detail view calculates and displays a completion percentage: `floor(completedQuantity / quantity * 100)`.
- [ ] The frontend detail view shows `actualStartDate` and `actualEndDate` (formatted to locale string), displaying `—` when null.
- [ ] When a linked product record is deleted from the catalogue, `productId` is set to `NULL` on the order (`ON DELETE SET NULL`); the order itself is not deleted.

## Inferred Business Rules

- **Status values**: `DRAFT`, `PLANNED`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`, `CANCELLED`. The enum is defined in `packages/api-types/src/enums/production-status.enum.ts` with Vietnamese comments suggesting intended meaning but no server-side state machine enforcing valid transitions.
- **No status transition guard**: `status` can be changed to any value via a plain `PATCH` request. Moving from `COMPLETED` back to `DRAFT`, or from `CANCELLED` to `IN_PROGRESS`, is technically possible through the API without any guard.
- **`notes` field is a schema-only field**: `notes` is accepted by the Zod validation schema (`createProductionOrderSchema`) but there is no `notes` column on `ProductionOrderEntity`. The field would be silently ignored by TypeORM's `create()` call and never persisted.
- **`productId` is entity-only**: the entity has a `productId` column and a `ManyToOne` relation to `ProductEntity`, but `productId` is absent from both `createProductionOrderSchema` and `updateProductionOrderSchema`. There is no API path to set or update `productId`.
- **`completedQuantity` has no dedicated increment endpoint**: completed quantity can only be updated via generic `PATCH`. There is no `/complete-step` or `/record-output` sub-resource.
- **`bomId` and `productionLineId` are unvalidated UUID references**: the entity stores them as UUID columns with no FK constraints or `@ManyToOne` relations. Referential integrity to `boms` and `production_lines` is not enforced at the DB level.
- **Factory isolation**: all queries are scoped to `factoryId` from the route parameter, enforced by `FactoryAccessGuard`.
- **`customFields` JSONB**: present in both entity and schema, providing extensibility for factory-specific data without schema migration.

## Open Questions

1. **Status transition rules**: which transitions are valid? Should `COMPLETED → DRAFT` be blocked? Should setting `actualStartDate` be tied to transitioning to `IN_PROGRESS`? The current implementation has no guard.
2. **`notes` field missing from entity**: `notes` is in the Zod schema but not in `ProductionOrderEntity`. This is a bug — notes submitted via the API are silently dropped. Should a migration add a `notes` column?
3. **`productId` not in API schema**: there is no way to link a production order to a product master record via the API. Is `productId` intentionally excluded from the schema (set only by internal processes), or is this an oversight?
4. **`completedQuantity` update mechanism**: in a real MES, completed quantity should be incremented when a work order step is completed, not set manually via PATCH. Is this field expected to be updated by the work-orders module, or by operators via the UI?
5. **`actualStartDate` / `actualEndDate` not auto-set**: transitioning status to `IN_PROGRESS` does not auto-set `actualStartDate`; completing does not auto-set `actualEndDate`. Should these be set automatically on status change?
6. **`productionLineId` not validated**: a non-existent production line UUID can be stored in `productionLineId` — no FK exists. Should a lookup validate the UUID belongs to the same factory?
7. **`bomId` not validated**: same issue as `productionLineId` — any UUID string is accepted regardless of whether a BOM with that ID exists.
8. **Delete restricted to WRITE_ROLES**: production order deletion requires only `PRODUCTION_MANAGER`, the same as creating. Should deletion be restricted to higher roles (`SUPER_ADMIN`, `FACTORY_ADMIN`) to prevent accidental loss of operational records?
9. **Pagination on list**: the list endpoint returns all orders with no `page`/`limit` support. High-volume factories with thousands of orders will receive unbounded results.
10. **`plannedEndDate` before `plannedStartDate`**: no validation prevents a `plannedEndDate` earlier than `plannedStartDate`.

## Context for Claude

- **Stack**: NestJS, TypeORM, PostgreSQL, Zod, Next.js 15 App Router with TanStack Query.
- **Guard chain**: `JwtAuthGuard → RolesGuard → FactoryAccessGuard` on all endpoints. Write ops: `SUPER_ADMIN`, `FACTORY_ADMIN`, `PRODUCTION_MANAGER`.
- **Entity**: `production_orders` table. `productId → products.id` (`ON DELETE SET NULL`, lazy). `bomId` and `productionLineId` are plain UUID columns — no FK constraints.
- **Soft delete**: `@DeleteDateColumn` + `softDelete()`. TypeORM `find()` auto-excludes soft-deleted rows.
- **Hooks (frontend)**: `useProductionOrders()`, `useProductionOrder(id)`, `useCreateProductionOrder()`, `useDeleteProductionOrder()` in `apps/web/src/hooks/use-production-orders.ts`.
- **Related features**: PROD-002 (WebSocket events — currently unwired), PROD-003 (production line registry — no API exposed). Referenced by Work Orders module (`productionOrderId` FK on work order entity).
