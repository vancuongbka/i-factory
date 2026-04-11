---
name: MDM Module implementation progress
description: Phase 1 backend complete; Phase 2 frontend and Phase 3 MES integration pending
type: project
---

## MDM (Master Data Management) Module — Implementation Status

Full plan is at: `.claude/plans/logical-conjuring-umbrella.md`

---

### Phase 1 — MVP Backend ✅ COMPLETE (2026-04-11)

All files created and verified with zero TypeScript errors (`pnpm --filter @i-factory/api typecheck` clean).

**`@i-factory/api-types` additions:**
- `enums/product-type.enum.ts` — `FINISHED, SEMI_FINISHED, RAW_MATERIAL, CONSUMABLE`
- `enums/work-center-type.enum.ts` — `MACHINE, ASSEMBLY, INSPECTION, PACKING`
- `enums/machine-status.enum.ts` — `ACTIVE, IDLE, MAINTENANCE, BREAKDOWN`
- `enums/skill-level.enum.ts` — `BASIC, INTERMEDIATE, ADVANCED, EXPERT`
- `schemas/product.schema.ts` — categories, UoMs, products + partials + DTO types
- `schemas/work-center.schema.ts` — work centers, machines, skills + partials
- `schemas/routing.schema.ts` — routing operations + routings + update partial
- `schemas/erp-sync.schema.ts` — `erpSyncPayloadSchema` (entityType, syncMode UPSERT|REPLACE, dryRun, records)
- `schemas/bom.schema.ts` — extended with V2: `bomItemV2Schema` (materialId|childBomId, sequence), `createBomV2Schema` (productId, isPhantom, items), `createBomRevisionSchema`
- `index.ts` — all new enums and schemas exported

**Backend modules created:**
- `modules/master-data/products/` — products, categories, UoMs (CRUD)
- `modules/master-data/work-centers/` — work centers, machines, skills (CRUD)
- `modules/master-data/routings/` — routings + operations (CRUD)
- `modules/master-data/erp-sync/` — BullMQ processor (dryRun + TODO: UPSERT/REPLACE)
- `modules/master-data/master-data.module.ts` — parent module
- `modules/bom/entities/bom-revision.entity.ts` — immutable audit record
- `database/migrations/1775920000000-AddMasterDataMDM.ts` — all 9 new tables + 4 enums + alter boms/bom_items

**Key patterns established:**
- All updates: load entity → spread → `repo.save()` (avoids TypeORM `_QueryDeepPartialEntity` type error)
- BOM revision: saves snapshot in `snapshotData: jsonb`, bumps `version` via `bumpVersion()`
- ERP sync queue name: `'erp-sync'` (separate from `factory-sync` and `reports`)
- Guard order on all write routes: `JwtAuthGuard, RolesGuard, FactoryAccessGuard`
- Write roles: `[UserRole.FACTORY_ADMIN, UserRole.PRODUCTION_MANAGER]`

---

### Phase 2 — Frontend ⏳ PENDING

**Files to create (apps/web):**

Route pages:
- `app/(app)/master-data/layout.tsx`
- `app/(app)/master-data/products/page.tsx` + `new/page.tsx` + `[id]/page.tsx`
- `app/(app)/master-data/products/_components/` — product-table, create-product-form, product-detail
- `app/(app)/master-data/categories/page.tsx` + `_components/category-tree.tsx`
- `app/(app)/master-data/uoms/page.tsx` + `_components/uom-table.tsx`
- `app/(app)/master-data/work-centers/page.tsx` + `[id]/page.tsx` + `_components/` (work-center-table, machines-panel)
- `app/(app)/master-data/skills/page.tsx`
- `app/(app)/master-data/routings/page.tsx` + `new/page.tsx` + `[id]/page.tsx` + `_components/` (routing-table, routing-operations-editor with drag-reorder)
- `app/(app)/master-data/erp-sync/page.tsx` — form + status polling (refetchInterval)
- `app/(app)/bom/new/page.tsx`
- `app/(app)/bom/[id]/page.tsx` + `[id]/revisions/page.tsx`
- `app/(app)/bom/_components/` — bom-table, create-bom-form, bom-items-editor, bom-revision-log

React Query hooks:
- `hooks/use-products.ts`, `use-categories.ts`, `use-uoms.ts`
- `hooks/use-work-centers.ts`, `use-skills.ts`
- `hooks/use-routings.ts`
- `hooks/use-bom.ts` (list, get, create, update, remove, addItem, updateItem, removeItem, revisions, revise)

**Files to modify:**
- `lib/api-client.ts` — add `masterData.*` and full `bom.*` namespaces
- `components/layout/sidebar.tsx` — add "Master Data" nav group
- `messages/en.json` + `messages/vi.json` — add `masterData.*` and `bom.*` i18n keys

---

### Phase 3 — MES Integration ⏳ PENDING

- Add `productId uuid` FK to `ProductionOrderEntity` → products
- Add `workCenterId uuid` FK to `WorkOrderStepEntity` → work_centers
- Implement `WorkOrdersService.createFromProductionOrder()` — auto-generates WO steps from active routing
- `WorkOrdersModule` imports `MasterDataModule`
- Complete `ErpSyncProcessor` UPSERT/REPLACE logic (currently has TODO)
- Migration: `AddProductionIntegration.ts`

**Why:** Phase 3 is planned but not started — was explicitly scoped to Weeks 6–7 in the roadmap.
**How to apply:** Do not start Phase 3 changes until Phase 2 frontend is verified working.
