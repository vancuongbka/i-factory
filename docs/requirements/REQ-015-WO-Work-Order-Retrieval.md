---
id: REQ-015-WO-Work-Order-Retrieval
title: Work Order Retrieval
status: inferred
priority: high
tags: [work-orders, read, list, detail]
source_files:
  - apps/api/src/modules/work-orders/work-orders.controller.ts
  - apps/api/src/modules/work-orders/work-orders.service.ts
  - apps/api/src/modules/work-orders/entities/work-order.entity.ts
  - apps/api/src/modules/work-orders/entities/work-order-step.entity.ts
  - apps/web/src/app/(app)/work-orders/page.tsx
  - apps/web/src/app/(app)/work-orders/[id]/page.tsx
  - apps/web/src/app/(app)/work-orders/_components/work-orders-table.tsx
  - apps/web/src/app/(app)/work-orders/_components/work-order-detail-client.tsx
  - apps/web/src/hooks/use-work-orders.ts
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

Operators and managers can view all work orders belonging to their factory in a paginated table, and drill into a single work order to see its full details including step-by-step progress. All queries are scoped to the authenticated user's active factory, ensuring tenant isolation.

## Acceptance Criteria

- [ ] `GET /factories/:factoryId/work-orders` returns all non-deleted work orders for the factory, each including their associated steps.
- [ ] `GET /factories/:factoryId/work-orders/:id` returns a single work order with steps; returns 404 if the work order does not exist or belongs to a different factory.
- [ ] Both endpoints require a valid JWT (`JwtAuthGuard`).
- [ ] Factory access is enforced (`FactoryAccessGuard`); a user without access to the requested factory receives a 403.
- [ ] Response includes: `id`, `code`, `productionOrderId`, `status`, `assignedTo`, `plannedStartDate`, `plannedEndDate`, `actualStartDate`, `actualEndDate`, `customFields`, `createdAt`, `updatedAt`, and nested `steps[]`.
- [ ] Each step in the response includes: `id`, `workOrderId`, `stepNumber`, `name`, `description`, `estimatedMinutes`, `requiredSkills`, `workCenterId`, `isCompleted`, `completedAt`.
- [ ] Soft-deleted work orders (`deletedAt IS NOT NULL`) are excluded from all responses.
- [ ] Frontend table displays: code, production order ID, colour-coded status badge, planned dates, and a step completion ratio (e.g. "2/5").
- [ ] Frontend detail page displays: header with code and status, planned/actual dates, a progress bar (% steps completed), and a steps table.

## Inferred Business Rules

- Every work order is tied to exactly one factory via `factoryId`; cross-factory access is never permitted.
- Steps are always returned together with their parent work order (eager load); there is no endpoint to fetch steps independently.
- The step completion ratio on the list view is computed client-side from the `steps[]` array returned by the list endpoint.
- The detail page progress bar percentage is also computed client-side: `(completedSteps / totalSteps) * 100`.

## Open Questions

1. **Pagination** — The list endpoint currently returns all work orders for the factory with no `page`/`limit` query params. For factories with large numbers of work orders this will become a performance problem. Is pagination planned?
2. **Sorting/filtering** — No filter parameters (e.g., by status, by assignedTo, by date range) are present in the controller. Is server-side filtering intentionally deferred?
3. **`assignedTo` resolution** — The field is returned as a raw UUID. The frontend does not appear to resolve it to a user display name. Should the API join to the users table and return a name, or is that the frontend's responsibility?
4. **Steps-only endpoint** — No `GET /work-orders/:id/steps` endpoint exists. If a consumer only needs step state updates (e.g. polling during execution), they must re-fetch the entire work order. Is a lightweight steps endpoint needed?

## Context for Claude

- Stack: NestJS + TypeORM, Next.js 15 App Router, TanStack Query 5.
- The list endpoint is `GET /factories/:factoryId/work-orders`; the detail endpoint is `GET /factories/:factoryId/work-orders/:id`.
- Data is fetched client-side via `useWorkOrders()` and `useWorkOrder(id)` hooks in `apps/web/src/hooks/use-work-orders.ts`.
- Guard order: `JwtAuthGuard → RolesGuard → FactoryAccessGuard` (REQ-055).
- Soft-delete pattern uses `@DeleteDateColumn` + TypeORM `softDelete()` (REQ-052).
- Response type: `WorkOrderWithSteps = WorkOrderResponse & { steps: WorkOrderStep[] }` from `@i-factory/api-types`.
