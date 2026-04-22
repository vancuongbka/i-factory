---
id: REQ-002-MDM-Product-Category-Hierarchy
title: Product Category Hierarchy
status: inferred
priority: medium
tags: [master-data, products, categories, taxonomy]
source_files:
  - apps/api/src/modules/master-data/products/products.controller.ts
  - apps/api/src/modules/master-data/products/products.service.ts
  - apps/api/src/modules/master-data/products/entities/product-category.entity.ts
  - packages/api-types/src/schemas/product.schema.ts
  - apps/web/src/app/(app)/master-data/categories/page.tsx
  - apps/web/src/app/(app)/master-data/categories/_components/category-tree.tsx
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

Product categories provide a hierarchical taxonomy for organising the product catalogue. Categories support a single level of parent-child nesting, allowing factories to group products by type, process, or material family. The frontend renders categories as a visual tree, and each product can optionally be assigned to one category.

## Acceptance Criteria

- [ ] A category can be created with: `factoryId` (UUID, required), `code` (2–50 chars, required), `name` (1–100 chars, required), `parentId` (UUID, optional), `description` (max 500 chars, optional), `sortOrder` (non-negative integer, default `0`).
- [ ] Categories are returned ordered by `sortOrder ASC`, then `name ASC`.
- [ ] The list endpoint eagerly loads `children` relations, enabling a tree view in a single API call.
- [ ] The detail endpoint (used internally by update/delete) loads both `children` and `parent` relations.
- [ ] Creating, updating, or deleting a category requires role `SUPER_ADMIN`, `FACTORY_ADMIN`, or `PRODUCTION_MANAGER`.
- [ ] Soft-deleting a category sets `deletedAt` rather than removing the record; soft-deleted categories are excluded from list results via TypeORM's `@DeleteDateColumn` filter.
- [ ] Deleting a category sets `categoryId = NULL` on all products that reference it (`ON DELETE SET NULL`).
- [ ] The frontend category tree component renders root categories (where `parentId` is null) with their immediate children indented beneath them.
- [ ] The frontend create form allows selecting an existing category as parent via a dropdown populated from the current factory's category list.
- [ ] A 404 `NotFoundException` is returned when attempting to update or delete a category that does not exist in the given factory scope.

## Inferred Business Rules

- **Two-level hierarchy in practice**: the data model supports unlimited depth (self-referencing FK), but the frontend tree component renders only roots and their direct children. Deeper nesting is stored but not displayed.
- **Factory isolation**: all category operations are scoped to `factoryId`. Categories from other factories are never returned.
- **No code uniqueness enforcement observed**: the schema requires `code` to be 2–50 chars, but no unique index on `(factoryId, code)` was found in the entity. Duplicate codes within a factory may be allowed.
- **sortOrder as manual ordering**: the `sortOrder` field allows administrators to control display order. It defaults to `0`; items with the same `sortOrder` fall back to alphabetical by `name`.
- **Orphan prevention on parent delete**: when a parent category is soft-deleted, its `parentId`-linked children are not automatically re-parented or deleted. They remain with a `parentId` pointing to a soft-deleted record, which could break tree rendering.

## Open Questions

1. **Deep hierarchy support**: the DB model supports unlimited nesting, but the UI only renders two levels. Is deeper nesting intentional for future use, or should the schema be constrained to two levels?
2. **Orphaned children on parent delete**: if a parent category is soft-deleted, its children retain their `parentId` but the parent is hidden. Should children be re-parented to the root, also soft-deleted, or should deletion of a parent be blocked if children exist?
3. **Code uniqueness**: is `code` expected to be unique per factory? No database constraint enforces this.
4. **Category update in UI**: the frontend `CategoryTree` component only supports create and delete. There is no edit form for updating a category's name, code, or parent. Is an update UI planned?
5. **sortOrder management**: there is no drag-and-drop or explicit ordering UI. How are administrators expected to manage `sortOrder`?
6. **Cascade delete vs. soft-delete interaction**: TypeORM's `softDelete()` sets `deletedAt`, but the `ON DELETE SET NULL` cascade on products is a database-level constraint. When restoring a soft-deleted category, will the previously cleared `categoryId` on products be restored?

## Context for Claude

- **Stack**: NestJS, TypeORM, PostgreSQL, Zod, Next.js 15 App Router.
- **Entity**: `product_categories` table with self-referencing `parentId` FK (`ON DELETE SET NULL`).
- **Frontend**: `CategoryTree` component at `apps/web/src/app/(app)/master-data/categories/_components/category-tree.tsx` renders a flat-grouped two-level tree using client-side filtering of the full list.
- **Related**: MDM-001 (Product Catalogue) references categories. Removing a category clears product's `categoryId`.
