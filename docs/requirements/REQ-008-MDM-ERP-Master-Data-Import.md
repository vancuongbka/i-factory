---
id: REQ-008-MDM-ERP-Master-Data-Import
title: ERP Master Data Import
status: inferred
priority: medium
tags: [master-data, erp-sync, integration, bullmq, async]
source_files:
  - apps/api/src/modules/master-data/erp-sync/erp-sync.controller.ts
  - apps/api/src/modules/master-data/erp-sync/erp-sync.service.ts
  - apps/api/src/modules/master-data/erp-sync/processors/erp-sync.processor.ts
  - packages/api-types/src/schemas/erp-sync.schema.ts
  - apps/web/src/app/(app)/master-data/erp-sync/page.tsx
  - apps/web/src/app/(app)/master-data/erp-sync/_components/erp-sync-form.tsx
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

The ERP Master Data Import allows administrators to push batches of master data records from an external ERP system (such as SAP or Oracle) into i-factory without manual data entry. The import runs as a background job to avoid blocking the UI during large data loads. Two sync strategies are supported: UPSERT (merge external records with existing ones) and REPLACE (replace all factory data of a given type with the incoming set). A dry-run mode lets users validate the payload without committing any changes.

## Acceptance Criteria

- [ ] A sync job can be triggered with: `entityType` (required enum), `externalSystem` (required string, max 50 chars), `records` (required JSON array, 1–500 records), `syncMode` (enum, default `UPSERT`), `dryRun` (boolean, default `false`).
- [ ] `entityType` must be one of: `products`, `boms`, `routings`, `work-centers`.
- [ ] `syncMode` must be `UPSERT` or `REPLACE`.
- [ ] Triggering a sync job requires role `SUPER_ADMIN` or `FACTORY_ADMIN`.
- [ ] The trigger endpoint returns immediately with `{ jobId, status: 'queued', createdAt }` without waiting for the job to complete.
- [ ] The job is queued in BullMQ with up to 3 retry attempts using exponential backoff (initial delay 10 seconds).
- [ ] The job status endpoint (`GET /status/:jobId`) returns `{ jobId, status, createdAt }` where `status` is one of `queued`, `processing`, `completed`, `failed`.
- [ ] In **UPSERT mode**: records are upserted into the database using entity-specific conflict columns. Conflict columns per entity: `products` → `[factoryId, sku]`, `work-centers` → `[factoryId, code]`, `routings` → `[factoryId, code, version]`, `boms` → `[factoryId, code]`.
- [ ] In **REPLACE mode**: all existing records of the entity type for the factory are soft-deleted, then the new records are bulk-inserted, executed within a single database transaction.
- [ ] In **dry-run mode**: the job processes the payload (logging the operation), advances progress to 100%, but performs no database writes.
- [ ] The processor stamps `factoryId` onto every incoming record before persisting, overriding any `factoryId` value supplied in the payload.
- [ ] Job progress is reported at `10%` (on start) and `100%` (on completion).
- [ ] The frontend ERP sync form polls job status every 2 seconds while `status` is `queued` or `processing`, and stops polling when `status` is `completed` or `failed`.
- [ ] The frontend defaults `dryRun` to `true` (checked) to prevent accidental production data changes.

## Inferred Business Rules

- **BOM sync is not wired**: although `boms` is a valid `entityType` in the schema and UI, the `ErpSyncProcessor.repoFor()` method explicitly returns `null` for `'boms'` with a warning log. BOM sync payloads are accepted and queued but produce no database changes.
- **factoryId stamping overrides payload**: the processor ignores any `factoryId` in the incoming records and stamps the authenticated factory's ID. This prevents cross-factory data injection.
- **REPLACE uses soft-delete, not hard-delete**: the REPLACE strategy calls `em.softDelete()` to deactivate existing records before inserting new ones. The previous records are retained in the database with `deletedAt` set.
- **Records are unvalidated beyond schema structure**: the records array is typed as `Record<string, unknown>[]`. The processor passes them directly to `repo.upsert()` or `em.insert()`. No field-level validation of individual records against entity constraints is performed before the DB call.
- **Status polling has no TTL**: completed/failed jobs remain in BullMQ and can be polled indefinitely. No cleanup or expiry mechanism is visible.
- **externalSystem is metadata only**: the `externalSystem` field identifies the source (e.g., "SAP") and is included in the job payload, but is not persisted to the entity records. It is purely for logging and auditability.
- **No webhook or push notification on completion**: the frontend polls; there is no server-sent event or WebSocket event when a sync job completes.

## Open Questions

1. **BOM sync not implemented**: `entityType: 'boms'` is accepted by the API and shown in the UI but the processor skips it with a warning. This is a known gap flagged in the code itself. When will BOM sync be implemented?
2. **Record validation**: incoming records are passed directly to TypeORM without field-level Zod validation per entity type. Malformed records (missing required fields, wrong types) will cause a database error rather than a user-friendly validation error. Should per-entity record schemas be enforced?
3. **REPLACE and related entities**: in REPLACE mode, all existing records of the entity type are soft-deleted. For `routings`, this does not cascade-delete `routing_operations`. Orphaned operations may remain linked to soft-deleted routings.
4. **Authentication on status endpoint**: the `GET /status/:jobId` endpoint does not require any specific role (only `JwtAuthGuard` via the controller-level guard). Any authenticated user can poll any job ID if they know it. Should status be restricted to the user who triggered the job?
5. **Job ID enumeration**: job IDs are BullMQ-assigned sequential integers. A user who triggers one job can enumerate nearby job IDs to read other factory's sync status. Is this a concern?
6. **Maximum record size**: the schema caps `records` at 500 items. Is this a deliberate performance limit? What should happen when an ERP sends more than 500 records?
7. **Retry behaviour on partial failure**: with 3 retry attempts, if the job fails midway through an UPSERT, some records may already be written. Re-running the job re-upserts those records (idempotent for UPSERT). For REPLACE, a failed mid-transaction is rolled back. Is the UPSERT partial-write scenario acceptable?
8. **Audit trail**: there is no record of which user triggered a sync, what the original payload was, or what changes were made. Should sync jobs be logged to an audit table?

## Context for Claude

- **Stack**: NestJS, BullMQ (queue name: `'erp-sync'`), TypeORM, Zod, Next.js 15 App Router with TanStack Query.
- **Guard**: `JwtAuthGuard → RolesGuard → FactoryAccessGuard`. Trigger requires `SUPER_ADMIN` or `FACTORY_ADMIN`; status endpoint has no role restriction beyond JWT.
- **Retry config**: `{ attempts: 3, backoff: { type: 'exponential', delay: 10000 } }`.
- **Frontend polling**: `refetchInterval` returns `2000` while status is `queued`/`processing`, `false` otherwise.
- **Related**: MDM-001 (Products), MDM-004 (Work Centers), MDM-007 (Routings) — these are the entity types with working sync. BOM module (incomplete sync).
