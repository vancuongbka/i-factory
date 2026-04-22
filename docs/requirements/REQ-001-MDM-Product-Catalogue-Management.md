---
id: REQ-001-MDM-Product-Catalogue-Management
title: Product Catalogue Management
status: inferred
priority: high
tags: [master-data, products, inventory]
source_files:
  - apps/api/src/modules/master-data/products/products.controller.ts
  - apps/api/src/modules/master-data/products/products.service.ts
  - apps/api/src/modules/master-data/products/entities/product.entity.ts
  - packages/api-types/src/schemas/product.schema.ts
  - apps/web/src/app/(app)/master-data/products/page.tsx
  - apps/web/src/app/(app)/master-data/products/new/page.tsx
  - apps/web/src/app/(app)/master-data/products/[id]/page.tsx
  - apps/web/src/app/(app)/master-data/products/_components/create-product-form.tsx
  - apps/web/src/app/(app)/master-data/products/_components/product-detail.tsx
  - apps/web/src/app/(app)/master-data/products/_components/product-table.tsx
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

The product catalogue is the central registry of all items a factory manufactures, uses, or consumes. Each product record defines what the item is (type, SKU, name), how it is measured (unit of measure), where it fits in the product taxonomy (category), and any technical or custom metadata. This master record is referenced by BOMs, production orders, and routings, so its accuracy is foundational to the entire manufacturing workflow.

## Acceptance Criteria

- [ ] A product can be created with: `factoryId` (UUID, required), `sku` (2–50 chars, required), `name` (1–200 chars, required), `type` (required enum), `uomId` (UUID, required), `categoryId` (UUID, optional), `description` (max 1000 chars, optional), `technicalSpecs` (JSONB object, optional), `customFields` (JSONB object, optional), `isActive` (boolean, default `true`).
- [ ] `type` must be one of: `FINISHED`, `SEMI_FINISHED`, `RAW_MATERIAL`, `CONSUMABLE`.
- [ ] Creating, updating, or soft-deleting a product requires role `SUPER_ADMIN`, `FACTORY_ADMIN`, or `PRODUCTION_MANAGER`. Hard-delete is not available.
- [ ] Soft-deleting a product requires role `SUPER_ADMIN` or `FACTORY_ADMIN` (stricter than create/update).
- [ ] The product list endpoint returns only records where `isActive = true` for the given factory, ordered by `sku` ascending, with `category` and `uom` relations eagerly loaded.
- [ ] The product detail endpoint returns a single product with `category` and `uom` relations regardless of `isActive` status.
- [ ] A 404 `NotFoundException` is thrown when a product is not found within the requesting factory's scope.
- [ ] All mutation endpoints validate the request body against the Zod `createProductSchema` / `updateProductSchema` before reaching the service.
- [ ] Every request passes through `JwtAuthGuard → RolesGuard → FactoryAccessGuard` in that order.
- [ ] Deleting a category that is linked to products sets `categoryId` to `NULL` on those products (ON DELETE SET NULL).
- [ ] Deleting a UOM that is linked to products is blocked by a `RESTRICT` foreign key constraint.

## Inferred Business Rules

- **Factory isolation**: every read and write operation is scoped to a `factoryId` derived from the route parameter. A user may only access products belonging to factories in their `allowedFactories` list (enforced by `FactoryAccessGuard`).
- **SKU uniqueness**: the schema enforces a minimum length of 2 but there is no explicit database unique constraint observed in the entity. Duplicate SKUs within the same factory are theoretically possible.
- **isActive as soft visibility gate**: the list endpoint filters `isActive = true`, but the detail endpoint does not. This means a deactivated product can still be fetched by ID but is hidden from list views.
- **UOM deletion protection**: a UOM cannot be deleted if any product references it (`RESTRICT`). The UI must surface this constraint to prevent confusing 500 errors.
- **Category nullability on delete**: removing a category does not orphan products — their `categoryId` is cleared automatically.
- **Soft-delete only**: `softDelete()` is used exclusively; records are never hard-deleted. Restore is not exposed via API.

## Open Questions

1. **SKU uniqueness enforcement**: no unique index or service-level check on `(factoryId, sku)` was found. Is duplicate SKU within a factory intentional or a gap?
2. **isActive toggle**: `isActive` can be set via the PATCH endpoint, but there is no dedicated activate/deactivate action. Should there be a semantic endpoint (e.g., `PATCH /products/:id/deactivate`) or is the generic PATCH sufficient?
3. **List endpoint and inactive products**: inactive products are excluded from the list. Is there a use case (e.g., production history) where showing deactivated products is required? Should a `?includeInactive=true` query param be supported?
4. **Pagination**: the list endpoint has no `page`/`limit` parameters. For large catalogues this will return unbounded result sets. Is pagination planned?
5. **technicalSpecs schema**: stored as free-form JSONB with no enforced structure. Is there a plan to define a per-product-type schema for technical specs?
6. **Product-to-BOM and Routing references**: no cascade or guard when deleting a product that is referenced by a BOM (`bomId`) or routing (`productId`). The routing entity has `onDelete: RESTRICT`, but BOM product linkage was not confirmed.

## Context for Claude

- **Stack**: NestJS controller/service pattern, TypeORM with PostgreSQL, Zod for request validation, Next.js 15 App Router frontend with TanStack Query.
- **Guard chain**: `JwtAuthGuard → RolesGuard → FactoryAccessGuard` on every endpoint.
- **Write roles**: `SUPER_ADMIN`, `FACTORY_ADMIN`, `PRODUCTION_MANAGER`. Delete is further restricted to `SUPER_ADMIN`, `FACTORY_ADMIN`.
- **Relations**: Product → ProductCategory (nullable, SET NULL on delete), Product → UnitOfMeasure (required, RESTRICT on delete).
- **Related modules**: BOM (`modules/bom`), Production (`modules/production`), Work Orders (`modules/work-orders`) all reference products. MDM-002 covers categories; MDM-003 covers UOMs.
