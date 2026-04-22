---
id: REQ-003-MDM-Unit-of-Measure-Management
title: Unit of Measure Management
status: inferred
priority: medium
tags: [master-data, products, uom, measurement]
source_files:
  - apps/api/src/modules/master-data/products/products.controller.ts
  - apps/api/src/modules/master-data/products/products.service.ts
  - apps/api/src/modules/master-data/products/entities/unit-of-measure.entity.ts
  - packages/api-types/src/schemas/product.schema.ts
  - apps/web/src/app/(app)/master-data/uoms/page.tsx
  - apps/web/src/app/(app)/master-data/uoms/_components/uom-table.tsx
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

Units of measure (UOMs) define the standard measurement units used across the factory — kilograms, metres, pieces, litres, etc. Each product, BOM line item, material, and stock movement references a UOM. Maintaining a controlled list of UOMs ensures consistent measurement across all production and inventory records.

## Acceptance Criteria

- [ ] A UOM can be created with: `factoryId` (UUID, required), `code` (1–20 chars, required), `name` (1–100 chars, required), `symbol` (max 10 chars, required), `isBase` (boolean, default `false`).
- [ ] Creating, updating, or soft-deleting a UOM requires role `SUPER_ADMIN`, `FACTORY_ADMIN`, or `PRODUCTION_MANAGER`.
- [ ] The list endpoint returns only `isActive = true` UOMs for the factory, ordered by `code` ascending.
- [ ] A 404 `NotFoundException` is thrown when attempting to update or delete a UOM that does not exist within the factory scope.
- [ ] Soft-delete is used; hard deletion is not available.
- [ ] Deleting a UOM that is referenced by any product is blocked by a database `RESTRICT` foreign key constraint.
- [ ] `isActive` can be set to `false` via the PATCH endpoint to deactivate a UOM without deleting it.
- [ ] The frontend UOM table shows: code, name, symbol, isBase badge, isActive status, and an edit/delete action column.

## Inferred Business Rules

- **Factory isolation**: UOMs are scoped to a factory. A UOM defined in factory A cannot be used in factory B.
- **isBase flag semantics**: marking a UOM as `isBase` signals it is the fundamental unit for a measurement dimension (e.g., "kg" as base for weight). However, no unit conversion logic is implemented; `isBase` is informational only.
- **Deletion protection**: because products reference UOMs with `RESTRICT`, a UOM in active use cannot be soft-deleted. The UI must handle the resulting constraint error gracefully.
- **isActive as soft-visibility filter**: inactive UOMs are hidden from list results. The PATCH endpoint can toggle `isActive`, providing a non-destructive way to retire a UOM.
- **No code uniqueness constraint observed**: no unique index on `(factoryId, code)` was found in the entity definition. Duplicate codes within a factory may be accepted.

## Open Questions

1. **Code uniqueness**: is `code` expected to be unique per factory? There is no database constraint enforcing this, which could lead to ambiguous UOM selection.
2. **Unit conversion**: `isBase` exists but no conversion ratios or conversion logic are implemented. Is unit conversion (e.g., kg ↔ g) planned?
3. **Inactive UOM references**: if a UOM is deactivated but still referenced by existing products, those products remain linked to the inactive UOM. Should a check prevent deactivation when references exist?
4. **Symbol uniqueness**: two different UOMs could share the same symbol (e.g., "kg"). Is this intentional?
5. **BOM and movement UOM fields**: BOM items and stock movements store `unit` as a plain string (not a foreign key to UOM). This means UOM changes do not propagate to historical records. Is this intentional for immutability?

## Context for Claude

- **Stack**: NestJS, TypeORM, PostgreSQL, Zod, Next.js 15 App Router.
- **Entity**: `units_of_measure` table. No `@JoinColumn` unique constraint observed on `(factoryId, code)`.
- **FK dependency**: `products.uomId` → `units_of_measure.id` with `ON DELETE RESTRICT`.
- **Related**: MDM-001 (Products) requires a valid `uomId`. BOM items and inventory movements use `unit` as a plain string field, not a FK.
