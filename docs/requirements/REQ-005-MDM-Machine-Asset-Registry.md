---
id: REQ-005-MDM-Machine-Asset-Registry
title: Machine Asset Registry
status: inferred
priority: high
tags: [master-data, machines, assets, work-centers]
source_files:
  - apps/api/src/modules/master-data/work-centers/work-centers.controller.ts
  - apps/api/src/modules/master-data/work-centers/work-centers.service.ts
  - apps/api/src/modules/master-data/work-centers/entities/machine.entity.ts
  - packages/api-types/src/schemas/work-center.schema.ts
  - apps/web/src/app/(app)/master-data/work-centers/[id]/page.tsx
  - apps/web/src/app/(app)/master-data/work-centers/_components/machines-panel.tsx
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

The machine registry tracks every physical piece of equipment assigned to a work center. Each machine record captures its identity (code, name, model, serial number), current operational status, and capacity contribution. Machine IDs are referenced in routing operations to specify which equipment is required for a particular manufacturing step.

## Acceptance Criteria

- [ ] A machine can be created with: `factoryId` (UUID, required), `workCenterId` (UUID, required), `code` (2–50 chars, required), `name` (1–200 chars, required), `model` (max 100 chars, optional), `serialNumber` (max 100 chars, optional), `status` (enum, default `IDLE`), `capacityPerHour` (positive number, optional), `customFields` (JSONB object, optional).
- [ ] `status` must be one of: `ACTIVE`, `IDLE`, `MAINTENANCE`, `BREAKDOWN`.
- [ ] Creating and updating a machine requires role `SUPER_ADMIN`, `FACTORY_ADMIN`, or `PRODUCTION_MANAGER`.
- [ ] Soft-deleting a machine requires role `SUPER_ADMIN`, `FACTORY_ADMIN`, or `PRODUCTION_MANAGER` (same as write roles — stricter restriction not applied unlike work center delete).
- [ ] The machines list endpoint filters by both `workCenterId` and `factoryId`, ordered by `code` ascending.
- [ ] A 404 `NotFoundException` is thrown when a machine is not found within the factory scope.
- [ ] Soft-delete is used; hard deletion is not available.
- [ ] Machines are included in work center list and detail responses via the `machines` relation.
- [ ] The frontend machines panel on the work center detail page shows machine code, name, model, serial number, status badge, and a delete button with confirmation dialog.

## Inferred Business Rules

- **Work center ownership**: a machine always belongs to exactly one work center. Reassigning a machine to a different work center requires PATCH with a new `workCenterId`.
- **Default status is IDLE**: newly registered machines start as `IDLE`, reflecting they are available but not yet in active production.
- **Status transitions**: status changes are done via the generic PATCH endpoint. No state machine is enforced — any status can be set from any other status. For example, a machine can go directly from `BREAKDOWN` to `ACTIVE`.
- **machineIds in routing operations**: routing operations store an array of `machineIds` (UUIDs). When a machine is soft-deleted, existing routing operations retain the stale UUID in their array — no FK cascade exists on this array column.
- **Factory isolation**: machine queries always include `factoryId`, ensuring cross-factory isolation even though the route also scopes by `workCenterId`.
- **customFields extensibility**: supports factory-specific attributes such as maintenance schedules, certificates, or asset tags.

## Open Questions

1. **Machine deletion and routing operations**: `machineIds` in `routing_operations` is a UUID array with no FK constraint. Soft-deleting a machine leaves stale UUIDs in routing operations. Should a check prevent deletion when the machine is referenced?
2. **Machine deletion when work center is deleted**: if the parent work center is soft-deleted, what happens to its machines? No cascade or guard was observed.
3. **Status change business logic**: should transitioning to `MAINTENANCE` or `BREAKDOWN` trigger notifications or block work order scheduling? Currently status is a simple data field with no side effects.
4. **Code uniqueness**: no unique index on `(factoryId, code)` was found. Duplicate machine codes within a factory may be accepted.
5. **Serial number uniqueness**: no uniqueness constraint on `serialNumber`. Multiple records could be created for the same physical machine.
6. **Machine capacity vs. work center capacity**: both machine and work center have `capacityPerHour`. Is there a defined aggregation rule (e.g., work center capacity = sum of active machines' capacity)?

## Context for Claude

- **Stack**: NestJS, TypeORM, PostgreSQL, Zod, Next.js 15 App Router.
- **Entity**: `machines` table. FK `workCenterId` → `work_centers.id` with `ON DELETE RESTRICT` (from entity decorator `@ManyToOne(() => WorkCenterEntity, { onDelete: 'RESTRICT' })`).
- **Routing operations reference**: `routing_operations.machineIds` is a `uuid[]` array column with no FK enforcement.
- **Related**: MDM-004 (Work Centers) — machines are scoped to a work center. MDM-007 (Routings) — routing operations specify required `machineIds`.
