---
id: REQ-016-WO-Manual-Work-Order-Creation
title: Manual Work Order Creation with Explicit Steps
status: inferred
priority: high
tags: [work-orders, create, steps, manual]
source_files:
  - apps/api/src/modules/work-orders/work-orders.controller.ts
  - apps/api/src/modules/work-orders/work-orders.service.ts
  - packages/api-types/src/schemas/work-order.schema.ts
  - apps/web/src/app/(app)/work-orders/new/page.tsx
  - apps/web/src/app/(app)/work-orders/_components/create-work-order-form.tsx
  - apps/web/src/hooks/use-work-orders.ts
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

A production manager can manually create a work order by supplying a code, linking it to a production order, setting planned dates, and defining each manufacturing step explicitly. This path is used when no routing exists for the product or when a custom step sequence is required.

## Acceptance Criteria

- [ ] `POST /factories/:factoryId/work-orders` accepts a JSON body validated against `createWorkOrderSchema`.
- [ ] Required fields: `productionOrderId`, `code`, `plannedStartDate`, `plannedEndDate`.
- [ ] Optional fields: `description`, `assignedTo` (UUID), `customFields` (JSONB), `steps[]` (defaults to empty array).
- [ ] Each step in `steps[]` must include: `stepNumber` (INT), `name` (string ≤ 200 chars).
- [ ] Each step may include: `description`, `estimatedMinutes` (INT), `requiredSkills` (string[]), `workCenterId` (UUID).
- [ ] The work order is created with `status = PENDING`.
- [ ] The work order is scoped to `factoryId` from the route parameter.
- [ ] Only users with role `SUPER_ADMIN`, `FACTORY_ADMIN`, or `PRODUCTION_MANAGER` can create work orders.
- [ ] Frontend form provides a "Manual" mode toggle that shows a dynamic step list (add/remove rows).
- [ ] Frontend redirects to the work orders list page on successful creation.
- [ ] TanStack Query cache for work orders is invalidated after a successful create.

## Inferred Business Rules

- `steps[]` is optional; a work order can be created with zero steps. However, `createFromProductionOrder` (WO-003) validates that at least one step exists — suggesting that a zero-step work order is considered incomplete in that flow.
- `stepNumber` provides an explicit ordering; the UI auto-increments it as rows are added but the value is user-editable.
- `requiredSkills` is stored as a `TEXT[]` column (PostgreSQL array); the frontend accepts comma-separated input and splits on comma before submission.
- The `code` field (VARCHAR 50) has no uniqueness constraint observed in migrations; duplicate codes within the same factory may be possible.
- `estimatedMinutes` represents the total time budget for the step (cycle time + setup time intent, matching routing operation semantics).

## Open Questions

1. **Code uniqueness** — No unique index on `(factoryId, code)` was found in migrations. Should work order codes be unique per factory?
2. **Production order validation** — The service does not appear to verify that the referenced `productionOrderId` exists in the same factory before creating the work order. Should this be validated?
3. **Planned date validation** — No check that `plannedStartDate < plannedEndDate` is present in the Zod schema or service. Should this be enforced?
4. **Zero-step work orders** — Creating a work order with an empty `steps[]` is currently allowed. Is this intentional for a "draft" state, or should at least one step be required?
5. **`assignedTo` validation** — The UUID is stored without verifying it corresponds to a real user or that the user has access to this factory.

## Context for Claude

- Stack: NestJS + TypeORM, Zod validation via `createWorkOrderSchema` in `@i-factory/api-types`.
- Endpoint: `POST /factories/:factoryId/work-orders`.
- Role guard allows: `SUPER_ADMIN`, `FACTORY_ADMIN`, `PRODUCTION_MANAGER`.
- Frontend mutation hook: `useCreateWorkOrder()` in `apps/web/src/hooks/use-work-orders.ts`.
- Guard order: `JwtAuthGuard → RolesGuard → FactoryAccessGuard`.
- Related: WO-003 (routing-based creation), WO-004 (status lifecycle after creation).
