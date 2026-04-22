---
id: REQ-007-MDM-Manufacturing-Routing-Definition
title: Manufacturing Routing Definition
status: inferred
priority: high
tags: [master-data, routings, operations, production-planning]
source_files:
  - apps/api/src/modules/master-data/routings/routings.controller.ts
  - apps/api/src/modules/master-data/routings/routings.service.ts
  - apps/api/src/modules/master-data/routings/entities/routing.entity.ts
  - apps/api/src/modules/master-data/routings/entities/routing-operation.entity.ts
  - packages/api-types/src/schemas/routing.schema.ts
  - apps/web/src/app/(app)/master-data/routings/page.tsx
  - apps/web/src/app/(app)/master-data/routings/new/page.tsx
  - apps/web/src/app/(app)/master-data/routings/[id]/page.tsx
  - apps/web/src/app/(app)/master-data/routings/_components/create-routing-form.tsx
  - apps/web/src/app/(app)/master-data/routings/_components/routing-detail-client.tsx
  - apps/web/src/app/(app)/master-data/routings/_components/routing-operations-editor.tsx
  - apps/web/src/app/(app)/master-data/routings/_components/routing-table.tsx
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

A manufacturing routing defines the ordered sequence of production operations needed to produce a specific product. Each operation specifies where in the factory it occurs (work center), how long it takes (setup time + cycle time), which machines are involved, and what worker skills are required. Routings are versioned, allowing factories to maintain multiple process variants for the same product (e.g., standard vs. expedited). When a work order is created from a routing, the operations are automatically converted into executable work order steps.

## Acceptance Criteria

- [ ] A routing can be created with: `factoryId` (UUID, required), `productId` (UUID, required), `code` (2–50 chars, required), `name` (1–200 chars, required), `version` (max 20 chars, default `'1.0'`), `isActive` (boolean, default `true`), `notes` (max 1000 chars, optional), and at least one `operations` entry.
- [ ] Each operation in the initial creation array requires: `sequence` (positive integer), `name` (1–200 chars), `workCenterId` (UUID), `cycleTimeMinutes` (positive number), `setupTimeMinutes` (non-negative integer, default `0`), `machineIds` (UUID array, default `[]`), `requiredSkills` (string array, default `[]`), `workInstructions` (string, optional), `isOptional` (boolean, default `false`).
- [ ] A routing must be created with a minimum of 1 operation (enforced by Zod `min(1)` on the `operations` array).
- [ ] Creating and updating a routing requires role `SUPER_ADMIN`, `FACTORY_ADMIN`, or `PRODUCTION_MANAGER`.
- [ ] Soft-deleting a routing requires role `SUPER_ADMIN` or `FACTORY_ADMIN`.
- [ ] The list endpoint returns all routings for the factory (no `isActive` filter on list), with `operations` and `product` relations loaded, ordered by `code` ascending.
- [ ] The detail endpoint returns a routing with `operations` and `product` relations loaded.
- [ ] After creation, the API returns the full routing including all created operations (the service re-fetches by ID after saving).
- [ ] Operations can be added to an existing routing individually via `POST /:id/operations`.
- [ ] Operations can be updated individually via `PATCH /:id/operations/:opId`.
- [ ] Operations can be removed individually via `DELETE /:id/operations/:opId` — this is a **hard delete** (not soft-delete).
- [ ] Updating the routing header via `PATCH /:id` does not affect its operations (the `updateRoutingSchema` omits the `operations` field).
- [ ] Soft-deleting a routing is blocked by `RESTRICT` FK if the routing's `productId` references a product that would be affected... *(actually the RESTRICT is on routing→product direction — see below)*.
- [ ] A 404 `NotFoundException` is thrown for routing or operation not found in factory scope.
- [ ] The frontend operations editor renders operations sorted by `sequence` ascending and auto-calculates the next `sequence` number as `max(existing sequences) + 1`.

## Inferred Business Rules

- **Product-to-routing relationship**: a routing must be linked to a product (`productId` is required and non-nullable). Deleting a product that has a routing is blocked by `ON DELETE RESTRICT` on the routing entity.
- **Multiple routings per product**: there is no unique constraint on `(factoryId, productId)` — a product can have multiple routings (different versions or process variants).
- **Routing versioning**: the `version` field (e.g., `'1.0'`, `'2.0'`) allows maintaining different process versions. The conflict column for ERP sync is `(factoryId, code, version)`, implying `(code + version)` is the natural composite key.
- **Operations are cascade-deleted with the routing**: `RoutingOperationEntity` has `onDelete: 'CASCADE'` on its `routing` ManyToOne. Soft-deleting the routing entity, however, does not cascade — the DB cascade only fires on hard delete.
- **Operation hard-delete**: `removeOperation` calls `this.operationRepo.delete()`, not `softDelete()`. Operations are hard-deleted when removed individually, unlike all other master data entities.
- **Sequence is manually managed**: the sequence number is assigned by the caller and not auto-incremented or validated for gaps/duplicates by the service.
- **isOptional operations**: operations can be flagged as optional, indicating they can be skipped during execution. No enforcement logic for this flag was found in the work order generation code.
- **Work order from routing**: the work orders module's `from-routing` endpoint consumes routing operations to generate work order steps. Changing a routing after work orders have been generated does not retroactively update those steps.

## Open Questions

1. **Routing soft-delete and cascade to operations**: soft-deleting a routing sets `deletedAt` on the `routings` row but does NOT set `deletedAt` on related `routing_operations` (TypeORM soft-delete doesn't cascade). Should operations also be logically deleted when their routing is soft-deleted?
2. **Operation hard-delete vs. soft-delete inconsistency**: all other master data uses soft-delete, but individual routing operations use hard-delete. Is this intentional (operations have no audit value once removed) or an oversight?
3. **Sequence uniqueness and gaps**: the service does not validate that sequence numbers are unique within a routing or contiguous. Can two operations have the same sequence? The frontend auto-calculates `max + 1` but backend has no check.
4. **Multiple active routings per product**: a product can have multiple active routings simultaneously. Which routing should the work order creation use by default? Currently the caller must specify the routing.
5. **Routing activation/deactivation**: `isActive` can be toggled via PATCH but the list endpoint returns all routings regardless of `isActive` status (unlike products and work centers). Is this intentional — planners always need to see all versions?
6. **Operation update via the editor**: the frontend `RoutingOperationsEditor` only supports add and delete of operations. There is no edit action for existing operations in the UI. Is in-place editing planned?
7. **machineIds validation**: the operation schema accepts an array of UUIDs for `machineIds` but does not validate that those UUIDs correspond to machines in the same factory. Stale or cross-factory machine IDs can be stored.
8. **Notes and work instructions length**: `workInstructions` is `text` (unlimited), but `notes` on the routing header is capped at 1000 chars. Is this difference intentional?

## Context for Claude

- **Stack**: NestJS, TypeORM, PostgreSQL, Zod, Next.js 15 App Router.
- **Entities**: `routings` (soft-delete) → `routing_operations` (hard-delete on individual remove; cascade on parent hard-delete). `routings.productId` FK with `RESTRICT`.
- **Guard chain**: `JwtAuthGuard → RolesGuard → FactoryAccessGuard`.
- **Work order integration**: `apps/api/src/modules/work-orders` contains a `from-routing` endpoint that reads routing operations and converts them to `WorkOrderStepEntity` records.
- **Related**: MDM-001 (Products) — routing must reference a product. MDM-004 (Work Centers) — operations reference work centers. MDM-005 (Machines) — operations reference machine UUIDs. MDM-006 (Skills) — operations reference skill names as strings.
