---
id: REQ-004-MDM-Work-Center-Management
title: Work Center Management
status: inferred
priority: high
tags: [master-data, work-centers, capacity, production]
source_files:
  - apps/api/src/modules/master-data/work-centers/work-centers.controller.ts
  - apps/api/src/modules/master-data/work-centers/work-centers.service.ts
  - apps/api/src/modules/master-data/work-centers/entities/work-center.entity.ts
  - packages/api-types/src/schemas/work-center.schema.ts
  - apps/web/src/app/(app)/master-data/work-centers/page.tsx
  - apps/web/src/app/(app)/master-data/work-centers/[id]/page.tsx
  - apps/web/src/app/(app)/master-data/work-centers/_components/work-center-table.tsx
  - apps/web/src/app/(app)/master-data/work-centers/_components/work-center-detail-client.tsx
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

Work centers represent the physical departments or production stations in a factory — machining cells, assembly lines, inspection booths, packing areas. They are the organisational unit that routing operations and work order steps are assigned to. Each work center carries capacity information used for planning, and it groups the machines that operate within it.

## Acceptance Criteria

- [ ] A work center can be created with: `factoryId` (UUID, required), `code` (2–50 chars, required), `name` (1–200 chars, required), `type` (required enum), `capacityPerHour` (positive number, optional), `description` (max 500 chars, optional), `customFields` (JSONB object, optional), `isActive` (boolean, default `true`).
- [ ] `type` must be one of: `MACHINE`, `ASSEMBLY`, `INSPECTION`, `PACKING`.
- [ ] Creating and updating a work center requires role `SUPER_ADMIN`, `FACTORY_ADMIN`, or `PRODUCTION_MANAGER`.
- [ ] Soft-deleting a work center requires role `SUPER_ADMIN` or `FACTORY_ADMIN`.
- [ ] The list endpoint returns only `isActive = true` work centers for the factory, ordered by `code` ascending, with `machines` relation eagerly loaded.
- [ ] The detail endpoint returns a single work center with its `machines` relation loaded, regardless of `isActive` status.
- [ ] A 404 `NotFoundException` is thrown when a work center is not found within the factory scope.
- [ ] Soft-delete is used; hard deletion is not available.
- [ ] Deleting a work center that is referenced by a routing operation is blocked by a `RESTRICT` FK on `routing_operations.workCenterId`.
- [ ] The frontend detail page shows the work center's attributes alongside an embedded machines panel (MDM-005).

## Inferred Business Rules

- **Factory isolation**: all work center operations are scoped to `factoryId`.
- **capacityPerHour as planning input**: the field is optional and informational; no automated capacity scheduling or constraint checking is implemented against it in this codebase.
- **isActive gate on list**: inactive work centers are hidden from the list (used by routing operation dropdowns in the UI), preventing new assignments to deactivated stations. Existing routing operations that already reference an inactive work center are not blocked.
- **Deletion blocked by routing operations**: a work center cannot be soft-deleted if routing operations reference it. The UI must handle the resulting FK constraint error.
- **Machine containment**: machines are always children of a work center. Deleting a work center while machines still exist — behaviour depends on the machine FK (see MDM-005).
- **customFields extensibility**: work centers support arbitrary JSONB metadata for factory-specific attributes (e.g., maintenance schedule, ISO certification).

## Open Questions

1. **Code uniqueness**: no unique index on `(factoryId, code)` was found. Is the code expected to be unique per factory?
2. **Deletion when machines exist**: the work center soft-delete does not appear to guard against existing machines. What happens to machines when their parent work center is soft-deleted? Are they cascade-deleted or orphaned?
3. **Capacity utilisation**: `capacityPerHour` is stored but no utilisation calculation is implemented. Is real-time or scheduled capacity tracking planned?
4. **Inactive work center in existing routings**: if a work center is deactivated, existing routing operations that reference it are not blocked. Should a validation prevent routing creation/editing from selecting inactive work centers?
5. **Work center type and validation**: `type` is an enum in the schema and used for display, but no business logic branches on the type value in the current codebase. Are different behaviours (e.g., inspection-specific QC checks) planned per type?

## Context for Claude

- **Stack**: NestJS, TypeORM, PostgreSQL, Zod, Next.js 15 App Router.
- **Entity**: `work_centers` table. One-to-many to `machines` (cascade not confirmed — see MDM-005). Referenced by `routing_operations.workCenterId` (RESTRICT).
- **Guard chain**: `JwtAuthGuard → RolesGuard → FactoryAccessGuard`.
- **Related**: MDM-005 (Machine Asset Registry) — machines live under work centers. MDM-007 (Manufacturing Routing) — routing operations reference work centers.
