# MDM Module — Master Data Management Implementation Plan

## Context

The iFactory MES currently has skeletal implementations of BOM and Work Orders (GET-only), a basic ProductionLine entity, and Materials/Inventory. There is no canonical Product record, no Work Center/Machine registry, and no Routing (process flow) concept. This creates data integrity gaps: production orders use free-text `productName`, work order steps use free-text `requiredSkills`, and BOMs have no version history or multi-level support.

This plan builds the "Single Source of Truth" MDM layer — introducing Products, Work Centers, Routings, and a BOM enhancement — so the entire MES execution engine can reference authoritative master records rather than duplicating or hardcoding domain data.

**Outcome:** Factory admins can define products, structure BOMs with full versioning, configure work centers/machines/skills, and define step-by-step routings with standard cycle/setup times. Production orders and work orders will resolve against these records rather than free-text fields.

---

## Architecture

```
apps/api/src/modules/
├── master-data/                    ← NEW parent module
│   ├── master-data.module.ts
│   ├── products/                   ← Products, Categories, UoMs
│   ├── work-centers/               ← Work Centers, Machines, Skills
│   ├── routings/                   ← Routings + Operations
│   └── erp-sync/                   ← BullMQ ERP integration
└── bom/                            ← EXTENDED: full CRUD + versioning + multi-level

packages/api-types/src/
├── enums/                          ← 4 new enums
└── schemas/                        ← 4 new schema files + bom.schema.ts enhancement

apps/web/src/app/(app)/
├── master-data/                    ← NEW route group (products, work-centers, routings, erp-sync)
└── bom/                            ← EXTENDED: [id]/, new/, revision pages
```

**Constraint reminders (must be followed exactly):**
- Every entity MUST have `factoryId: uuid` column
- Guard order: `JwtAuthGuard, RolesGuard, FactoryAccessGuard`
- Write routes: `@Roles(UserRole.FACTORY_ADMIN, UserRole.PRODUCTION_MANAGER)`
- Validation: Zod only via `ZodValidationPipe` — no class-validator
- Soft delete via `@DeleteDateColumn` + `softDelete()`
- `customFields: jsonb` on every domain entity
- Entity auto-discovery via glob — no changes to `entity-registry.ts` needed

---

## Phase 1 — MVP Backend (Weeks 1–3)

### Step 1: Shared Package — `@i-factory/api-types`

**New enum files:**

| File | Enum Values |
|------|------------|
| `packages/api-types/src/enums/product-type.enum.ts` | `FINISHED, SEMI_FINISHED, RAW_MATERIAL, CONSUMABLE` |
| `packages/api-types/src/enums/work-center-type.enum.ts` | `MACHINE, ASSEMBLY, INSPECTION, PACKING` |
| `packages/api-types/src/enums/machine-status.enum.ts` | `ACTIVE, IDLE, MAINTENANCE, BREAKDOWN` |
| `packages/api-types/src/enums/skill-level.enum.ts` | `BASIC, INTERMEDIATE, ADVANCED, EXPERT` |

**New schema files:**
- `packages/api-types/src/schemas/product.schema.ts` — `createProductCategorySchema`, `createUomSchema`, `createProductSchema` + partials + response types
- `packages/api-types/src/schemas/work-center.schema.ts` — `createWorkCenterSchema`, `createMachineSchema`, `createSkillSchema` + partials
- `packages/api-types/src/schemas/routing.schema.ts` — `createRoutingOperationSchema`, `createRoutingSchema` + partial
- `packages/api-types/src/schemas/erp-sync.schema.ts` — `erpSyncPayloadSchema`

**Modify:** `packages/api-types/src/schemas/bom.schema.ts` — add `createBomItemSchema` (with `sequence`, `childBomId?`), `createBomSchemaV2` (adds `productId?`, `isPhantom`), `bomRevisionSchema`

**Modify:** `packages/api-types/src/index.ts` — export all new enums + schema files

---

### Step 2: Product Master Data Module

**Location:** `apps/api/src/modules/master-data/products/`

#### Entities

**`entities/product-category.entity.ts`** — table `product_categories`
```
id uuid PK | factoryId uuid | code varchar(50) | name varchar(100)
parentId uuid → self (ON DELETE SET NULL) | description varchar(500)
sortOrder int DEFAULT 0 | createdAt | updatedAt | deletedAt
UNIQUE(factoryId, code)
```

**`entities/unit-of-measure.entity.ts`** — table `units_of_measure`
```
id uuid PK | factoryId uuid | code varchar(20) | name varchar(100)
symbol varchar(10) | isBase boolean DEFAULT false | isActive boolean DEFAULT true
createdAt | updatedAt | deletedAt
UNIQUE(factoryId, code)
```

**`entities/product.entity.ts`** — table `products`
```
id uuid PK | factoryId uuid | sku varchar(50) | name varchar(200)
type product_type_enum | categoryId uuid → product_categories (ON DELETE SET NULL)
uomId uuid → units_of_measure (ON DELETE RESTRICT)
description varchar(1000) | technicalSpecs jsonb | customFields jsonb
isActive boolean DEFAULT true | createdAt | updatedAt | deletedAt
UNIQUE(factoryId, sku)
```

#### Controller Base Path
`factories/:factoryId/master-data/products`

Also handles:
- `factories/:factoryId/master-data/categories` (GET tree, POST, PATCH :id, DELETE :id)
- `factories/:factoryId/master-data/uoms` (GET, POST, PATCH :id, DELETE :id)

**Read:** all authenticated users. **Write:** `FACTORY_ADMIN, PRODUCTION_MANAGER`

---

### Step 3: Work Centers Module

**Location:** `apps/api/src/modules/master-data/work-centers/`

#### Entities

**`entities/work-center.entity.ts`** — table `work_centers`
```
id uuid PK | factoryId uuid | code varchar(50) | name varchar(200)
type work_center_type_enum | capacityPerHour decimal(10,2)
description varchar(500) | customFields jsonb | isActive boolean DEFAULT true
createdAt | updatedAt | deletedAt | OneToMany → machines
UNIQUE(factoryId, code)
```

**`entities/machine.entity.ts`** — table `machines`
```
id uuid PK | factoryId uuid | workCenterId uuid → work_centers (ON DELETE RESTRICT)
code varchar(50) | name varchar(200) | model varchar(100) | serialNumber varchar(100)
status machine_status_enum DEFAULT IDLE | capacityPerHour decimal(10,2)
customFields jsonb | createdAt | updatedAt | deletedAt
UNIQUE(factoryId, code)
```

**`entities/skill.entity.ts`** — table `skills`
```
id uuid PK | factoryId uuid | code varchar(50) | name varchar(200)
level skill_level_enum | description varchar(500) | isActive boolean DEFAULT true
createdAt | updatedAt | deletedAt
UNIQUE(factoryId, code)
```

#### Controller Routes
- `factories/:factoryId/master-data/work-centers` — full CRUD
- `factories/:factoryId/master-data/work-centers/:id/machines` — GET, POST
- `factories/:factoryId/master-data/work-centers/:id/machines/:mid` — GET, PATCH, DELETE
- `factories/:factoryId/master-data/skills` — full CRUD

---

### Step 4: Routings Module

**Location:** `apps/api/src/modules/master-data/routings/`

#### Entities

**`entities/routing.entity.ts`** — table `routings`
```
id uuid PK | factoryId uuid | productId uuid → products (ON DELETE RESTRICT)
code varchar(50) | name varchar(200) | version varchar(20) DEFAULT '1.0'
isActive boolean DEFAULT true | notes varchar(1000) | OneToMany → routing_operations (cascade)
createdAt | updatedAt | deletedAt
UNIQUE(factoryId, code, version)
```

**`entities/routing-operation.entity.ts`** — table `routing_operations`
```
id uuid PK | routingId uuid → routings (ON DELETE CASCADE)
sequence int | name varchar(200) | workCenterId uuid → work_centers (ON DELETE RESTRICT)
setupTimeMinutes int DEFAULT 0 | cycleTimeMinutes decimal(10,2)
machineIds uuid[] DEFAULT '{}' | requiredSkills text[] DEFAULT '{}'
workInstructions text | isOptional boolean DEFAULT false
UNIQUE(routingId, sequence)
```

#### Controller Routes
- `factories/:factoryId/master-data/routings` — full CRUD + header PATCH
- `factories/:factoryId/master-data/routings/:id/operations` — POST
- `factories/:factoryId/master-data/routings/:id/operations/:opId` — PATCH, DELETE

---

### Step 5: BOM Enhancement

**Modify existing `apps/api/src/modules/bom/`**

#### Entity Changes

**`entities/bom.entity.ts`** — add columns:
```typescript
@Column({ type: 'uuid', nullable: true }) productId?: string;
@ManyToOne(() => ProductEntity, { nullable: true, onDelete: 'SET NULL' })
product?: ProductEntity;
@Column({ default: false }) isPhantom!: boolean;
```

**`entities/bom-item.entity.ts`** — add columns, make `materialId` nullable:
```typescript
@Column({ type: 'int', default: 1 }) sequence!: number;
@Column({ type: 'uuid', nullable: true }) childBomId?: string;
@ManyToOne(() => BomEntity, { nullable: true, onDelete: 'SET NULL' })
childBom?: BomEntity;
// materialId: change to nullable (either materialId OR childBomId required — enforce via DB CHECK)
```

**`entities/bom-revision.entity.ts`** — NEW, table `bom_revisions`
```
id uuid PK | bomId uuid → boms (ON DELETE CASCADE) | factoryId uuid
fromVersion varchar(20) | toVersion varchar(20) | revisedBy uuid
changeNotes varchar(1000) | snapshotData jsonb (full BOM+items snapshot)
createdAt  (no updatedAt/deletedAt — immutable audit record)
```

#### New BOM Controller Endpoints

Expand `bom.controller.ts` from GET-only to full CRUD:
```
GET    /factories/:fid/bom                  → findAll (paginated)
POST   /factories/:fid/bom                  → create [FACTORY_ADMIN, PROD_MANAGER]
GET    /factories/:fid/bom/:id              → findOne (with items + product)
PATCH  /factories/:fid/bom/:id              → updateHeader [FACTORY_ADMIN, PROD_MANAGER]
DELETE /factories/:fid/bom/:id              → softDelete [FACTORY_ADMIN]
POST   /factories/:fid/bom/:id/items        → addItem
PATCH  /factories/:fid/bom/:id/items/:iid   → updateItem
DELETE /factories/:fid/bom/:id/items/:iid   → removeItem
GET    /factories/:fid/bom/:id/revisions    → listRevisions
POST   /factories/:fid/bom/:id/revise       → createRevision (bumps version, snapshots current state)
```

**Modify `bom.module.ts`:** Register `BomRevisionEntity`. Add `TypeOrmModule.forFeature([ProductEntity])` (or import `ProductsModule`) to resolve the `productId` FK relation.

---

### Step 6: ERP Sync (BullMQ)

**Location:** `apps/api/src/modules/master-data/erp-sync/`

Queue name: `erp-sync` (separate from existing `factory-sync` and `reports`)

```typescript
// erp-sync.controller.ts
POST /factories/:fid/master-data/erp-sync         → enqueue job, returns { jobId }
GET  /factories/:fid/master-data/erp-sync/status/:jobId → poll job state
```

**`processors/erp-sync.processor.ts`** — `@Processor('erp-sync')` extending `WorkerHost`

Job payload: `{ factoryId, entityType, externalSystem, records, syncMode: UPSERT|REPLACE, dryRun }`

Idempotency strategy:
- `UPSERT`: `INSERT ... ON CONFLICT (factoryId, code/sku) DO UPDATE`
- `REPLACE`: transaction — softDelete all existing, then bulk insert
- `dryRun: true`: validate schema only, do not persist

Retry: `{ attempts: 3, backoff: { type: 'exponential', delay: 10000 } }`

---

### Step 7: Module Registration

**Modify `apps/api/src/modules/master-data/master-data.module.ts`** (new):
```typescript
@Module({
  imports: [ProductsModule, WorkCentersModule, RoutingsModule,
            BullModule.registerQueue({ name: 'erp-sync' })],
  controllers: [ErpSyncController],
  providers: [ErpSyncService, ErpSyncProcessor],
  exports: [ProductsModule, WorkCentersModule, RoutingsModule],
})
```

**Modify `apps/api/src/app.module.ts`:** Add `MasterDataModule` to imports array.

---

### Step 8: Database Migration (Phase 1)

File: `apps/api/src/database/migrations/<timestamp>-AddMasterDataMDM.ts`

Creation order (dependency-safe):
1. Enum types: `product_type_enum`, `work_center_type_enum`, `machine_status_enum`, `skill_level_enum`
2. `units_of_measure`
3. `product_categories` (self-ref parentId)
4. `products` → product_categories, units_of_measure
5. `work_centers`
6. `machines` → work_centers
7. `skills`
8. `routings` → products
9. `routing_operations` → routings, work_centers
10. `bom_revisions` → boms

Alterations to existing tables:
```sql
-- boms
ALTER TABLE boms ADD COLUMN productId uuid REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE boms ADD COLUMN isPhantom boolean NOT NULL DEFAULT false;

-- bom_items
ALTER TABLE bom_items ADD COLUMN sequence integer NOT NULL DEFAULT 1;
ALTER TABLE bom_items ADD COLUMN childBomId uuid REFERENCES boms(id) ON DELETE SET NULL;
ALTER TABLE bom_items ALTER COLUMN materialId DROP NOT NULL;
ALTER TABLE bom_items ADD CONSTRAINT bom_item_has_ref
  CHECK (materialId IS NOT NULL OR childBomId IS NOT NULL);
```

---

## Phase 2 — Frontend (Weeks 4–5)

### New Frontend Routes

```
apps/web/src/app/(app)/master-data/
├── layout.tsx                                  ← MDM sub-nav layout
├── products/
│   ├── page.tsx                                ← server component (generateMetadata + title)
│   ├── new/page.tsx
│   ├── [id]/page.tsx
│   └── _components/
│       ├── product-table.tsx                   ← 'use client', useQuery
│       ├── create-product-form.tsx             ← 'use client', useMutation
│       └── product-detail.tsx
├── categories/
│   ├── page.tsx
│   └── _components/category-tree.tsx           ← tree UI with expand/collapse
├── uoms/
│   ├── page.tsx
│   └── _components/uom-table.tsx
├── work-centers/
│   ├── page.tsx
│   ├── [id]/page.tsx
│   └── _components/
│       ├── work-center-table.tsx
│       └── machines-panel.tsx
├── skills/page.tsx
├── routings/
│   ├── page.tsx
│   ├── new/page.tsx
│   ├── [id]/page.tsx
│   └── _components/
│       ├── routing-table.tsx
│       └── routing-operations-editor.tsx       ← sequence drag-reorder
└── erp-sync/
    └── page.tsx                                ← form + status polling (refetchInterval)

apps/web/src/app/(app)/bom/
├── new/page.tsx                                ← CREATE form
├── [id]/
│   ├── page.tsx                                ← detail + items editor
│   └── revisions/page.tsx                      ← revision history list
└── _components/
    ├── bom-table.tsx
    ├── create-bom-form.tsx
    ├── bom-items-editor.tsx                    ← supports materialId or childBomId per row
    └── bom-revision-log.tsx
```

### API Client Extensions

**Modify `apps/web/src/lib/api-client.ts`** — add domain namespaces:
```typescript
masterData: {
  products: { list, get, create, update, remove },
  categories: { list, create, update, remove },
  uoms: { list, create, update, remove },
  workCenters: { list, get, create, update, remove },
  machines: { list, create, update, remove },   // nested under workCenter
  skills: { list, create, update, remove },
  routings: { list, get, create, update, remove },
  erpSync: { trigger, status },
},
bom: {   // extend existing (currently GET-only)
  list, get, create, update, remove,
  addItem, updateItem, removeItem,
  revisions, revise,
},
```

### React Query Hooks

New files in `apps/web/src/hooks/`:
- `use-products.ts` — `useProducts()`, `useCreateProduct()`, `useUpdateProduct()`, `useDeleteProduct()`
- `use-categories.ts` — `useCategories()`, `useCreateCategory()`, ...
- `use-uoms.ts`
- `use-work-centers.ts` — `useWorkCenters()`, `useMachines(workCenterId)`, ...
- `use-skills.ts`
- `use-routings.ts` — `useRoutings()`, `useRouting(id)`, ...
- `use-bom.ts` — `useBoms()`, `useBom(id)`, `useBomRevisions(id)`, `useCreateBom()`, ...

All hooks follow existing pattern: `useFactory()` for factoryId, `useQuery`/`useMutation` from `@tanstack/react-query`, `queryClient.invalidateQueries` on mutation success.

### Sidebar Update

**Modify `apps/web/src/components/layout/sidebar.tsx`** — add MDM nav group after existing items:
```typescript
// Add section header "Master Data" + items:
{ href: '/master-data/products',     label: t('nav.products') },
{ href: '/master-data/work-centers', label: t('nav.workCenters') },
{ href: '/master-data/routings',     label: t('nav.routings') },
```

### i18n Keys

**Modify `apps/web/messages/en.json`** and `vi.json`:

```json
// nav additions
"nav.masterData": "Master Data",
"nav.products": "Products",
"nav.workCenters": "Work Centers",
"nav.routings": "Routings",
"nav.erpSync": "ERP Sync",

// masterData namespace
"masterData.products.title": "Products",
"masterData.products.fields.sku": "SKU",
"masterData.products.fields.type": "Type",
"masterData.products.types.FINISHED": "Finished Good",
"masterData.products.types.SEMI_FINISHED": "Semi-Finished",
"masterData.products.types.RAW_MATERIAL": "Raw Material",
"masterData.products.types.CONSUMABLE": "Consumable",
"masterData.categories.title": "Product Categories",
"masterData.uoms.title": "Units of Measure",
"masterData.workCenters.title": "Work Centers",
"masterData.workCenters.machines.title": "Machines",
"masterData.workCenters.machines.statuses.ACTIVE": "Active",
"masterData.workCenters.machines.statuses.BREAKDOWN": "Breakdown",
"masterData.skills.title": "Skills",
"masterData.routings.title": "Routings",
"masterData.routings.operations.cycleTime": "Cycle Time (min)",
"masterData.routings.operations.setupTime": "Setup Time (min)",
"masterData.erpSync.title": "ERP Sync",
"masterData.erpSync.trigger": "Trigger Sync",

// bom enhancements
"bom.new.title": "Create BOM",
"bom.detail.title": "BOM {code} v{version}",
"bom.revisions.title": "Revision History",
"bom.fields.isPhantom": "Phantom BOM",
"bom.items.sequence": "Seq",
"bom.items.childBom": "Child BOM"
```

---

## Phase 3 — MES Integration (Weeks 6–7)

### Integration Points

**1. `ProductionOrderEntity`** — link to Product master:
- Add `productId uuid → products(id) ON DELETE SET NULL`
- Migration: `ALTER TABLE production_orders ADD COLUMN productId uuid REFERENCES products(id) ON DELETE SET NULL`
- `ProductionService.create()` resolves product → auto-populates `productName` and suggests `bomId`

**2. `WorkOrderStepEntity`** — link to Work Center:
- Add `workCenterId uuid → work_centers(id) ON DELETE SET NULL`
- Migration: `ALTER TABLE work_order_steps ADD COLUMN workCenterId uuid REFERENCES work_centers(id) ON DELETE SET NULL`

**3. Auto-generate WO steps from Routing** — new service method:
```typescript
// apps/api/src/modules/work-orders/work-orders.service.ts
async createFromProductionOrder(productionOrderId: string, factoryId: string, dto: CreateWorkOrderDto): Promise<WorkOrderEntity> {
  // 1. Load production order → get productId
  // 2. Find active RoutingEntity WHERE productId = ... AND isActive = true
  // 3. Map routing operations → WorkOrderStepEntity[]
  //    (sequence, name, workCenterId, estimatedMinutes = cycleTimeMinutes, requiredSkills)
  // 4. Create and save work order
}
```

**4. `WorkOrdersModule`** — Phase 3 modification:
```typescript
imports: [
  TypeOrmModule.forFeature([WorkOrderEntity, WorkOrderStepEntity]),
  MasterDataModule,  // gives access to WorkCenterEntity, RoutingEntity
]
```

**5. ERP Sync Processor — full implementation:**
- `UPSERT` mode: `INSERT INTO products ... ON CONFLICT (factoryId, sku) DO UPDATE SET ...` (TypeORM `save()` with existing ID lookup or `upsert()`)
- `REPLACE` mode: transaction — `softDelete()` all existing by factoryId + entityType, then bulk `insert()`
- Both modes must be idempotent (safe to retry with same `job.id`)

---

## Complete File Inventory

### New Files — Backend (23 files)
```
apps/api/src/modules/master-data/master-data.module.ts
apps/api/src/modules/master-data/products/products.module.ts
apps/api/src/modules/master-data/products/products.controller.ts
apps/api/src/modules/master-data/products/products.service.ts
apps/api/src/modules/master-data/products/entities/product.entity.ts
apps/api/src/modules/master-data/products/entities/product-category.entity.ts
apps/api/src/modules/master-data/products/entities/unit-of-measure.entity.ts
apps/api/src/modules/master-data/work-centers/work-centers.module.ts
apps/api/src/modules/master-data/work-centers/work-centers.controller.ts
apps/api/src/modules/master-data/work-centers/work-centers.service.ts
apps/api/src/modules/master-data/work-centers/entities/work-center.entity.ts
apps/api/src/modules/master-data/work-centers/entities/machine.entity.ts
apps/api/src/modules/master-data/work-centers/entities/skill.entity.ts
apps/api/src/modules/master-data/routings/routings.module.ts
apps/api/src/modules/master-data/routings/routings.controller.ts
apps/api/src/modules/master-data/routings/routings.service.ts
apps/api/src/modules/master-data/routings/entities/routing.entity.ts
apps/api/src/modules/master-data/routings/entities/routing-operation.entity.ts
apps/api/src/modules/master-data/erp-sync/erp-sync.controller.ts
apps/api/src/modules/master-data/erp-sync/erp-sync.service.ts
apps/api/src/modules/master-data/erp-sync/processors/erp-sync.processor.ts
apps/api/src/modules/bom/entities/bom-revision.entity.ts
apps/api/src/database/migrations/1775920000000-AddMasterDataMDM.ts
apps/api/src/database/migrations/<ts2>-AddProductionIntegration.ts  ← Phase 3
```

### Modified Files — Backend (8 files)
```
apps/api/src/app.module.ts                                           ← import MasterDataModule
apps/api/src/modules/bom/bom.module.ts                              ← register BomRevisionEntity
apps/api/src/modules/bom/bom.controller.ts                          ← full CRUD
apps/api/src/modules/bom/bom.service.ts                             ← full CRUD + revisions
apps/api/src/modules/bom/entities/bom.entity.ts                     ← +productId, +isPhantom
apps/api/src/modules/bom/entities/bom-item.entity.ts                ← +sequence, +childBomId, materialId nullable
apps/api/src/modules/production/entities/production-order.entity.ts  ← Phase 3: +productId
apps/api/src/modules/work-orders/entities/work-order-step.entity.ts  ← Phase 3: +workCenterId
apps/api/src/modules/work-orders/work-orders.service.ts              ← Phase 3: +createFromProductionOrder()
apps/api/src/modules/work-orders/work-orders.module.ts               ← Phase 3: import MasterDataModule
```

### New Files — api-types (8 files)
```
packages/api-types/src/enums/product-type.enum.ts
packages/api-types/src/enums/work-center-type.enum.ts
packages/api-types/src/enums/machine-status.enum.ts
packages/api-types/src/enums/skill-level.enum.ts
packages/api-types/src/schemas/product.schema.ts
packages/api-types/src/schemas/work-center.schema.ts
packages/api-types/src/schemas/routing.schema.ts
packages/api-types/src/schemas/erp-sync.schema.ts
```

### Modified Files — api-types (2 files)
```
packages/api-types/src/schemas/bom.schema.ts   ← +V2 schemas (sequence, childBomId, isPhantom)
packages/api-types/src/index.ts                ← export all new enums + schemas
```

### New Files — Frontend (29 files)
```
apps/web/src/app/(app)/master-data/layout.tsx
apps/web/src/app/(app)/master-data/products/page.tsx
apps/web/src/app/(app)/master-data/products/new/page.tsx
apps/web/src/app/(app)/master-data/products/[id]/page.tsx
apps/web/src/app/(app)/master-data/products/_components/product-table.tsx
apps/web/src/app/(app)/master-data/products/_components/create-product-form.tsx
apps/web/src/app/(app)/master-data/products/_components/product-detail.tsx
apps/web/src/app/(app)/master-data/categories/page.tsx
apps/web/src/app/(app)/master-data/categories/_components/category-tree.tsx
apps/web/src/app/(app)/master-data/uoms/page.tsx
apps/web/src/app/(app)/master-data/uoms/_components/uom-table.tsx
apps/web/src/app/(app)/master-data/work-centers/page.tsx
apps/web/src/app/(app)/master-data/work-centers/[id]/page.tsx
apps/web/src/app/(app)/master-data/work-centers/_components/work-center-table.tsx
apps/web/src/app/(app)/master-data/work-centers/_components/machines-panel.tsx
apps/web/src/app/(app)/master-data/skills/page.tsx
apps/web/src/app/(app)/master-data/routings/page.tsx
apps/web/src/app/(app)/master-data/routings/new/page.tsx
apps/web/src/app/(app)/master-data/routings/[id]/page.tsx
apps/web/src/app/(app)/master-data/routings/_components/routing-table.tsx
apps/web/src/app/(app)/master-data/routings/_components/routing-operations-editor.tsx
apps/web/src/app/(app)/master-data/erp-sync/page.tsx
apps/web/src/app/(app)/bom/new/page.tsx
apps/web/src/app/(app)/bom/[id]/page.tsx
apps/web/src/app/(app)/bom/[id]/revisions/page.tsx
apps/web/src/app/(app)/bom/_components/bom-table.tsx
apps/web/src/app/(app)/bom/_components/create-bom-form.tsx
apps/web/src/app/(app)/bom/_components/bom-items-editor.tsx
apps/web/src/app/(app)/bom/_components/bom-revision-log.tsx
apps/web/src/hooks/use-products.ts
apps/web/src/hooks/use-categories.ts
apps/web/src/hooks/use-uoms.ts
apps/web/src/hooks/use-work-centers.ts
apps/web/src/hooks/use-skills.ts
apps/web/src/hooks/use-routings.ts
apps/web/src/hooks/use-bom.ts
```

### Modified Files — Frontend (4 files)
```
apps/web/src/lib/api-client.ts                 ← +masterData.*, +bom.* full CRUD
apps/web/src/components/layout/sidebar.tsx     ← +MDM nav entries
apps/web/messages/en.json                      ← +masterData + bom enhancements
apps/web/messages/vi.json                      ← +Vietnamese translations
```

---

## API Endpoint Summary

| Method | Path | Roles (write) | Description |
|--------|------|--------------|-------------|
| GET/POST | `/factories/:fid/master-data/products` | FACTORY_ADMIN, PROD_MANAGER | List/Create products |
| GET/PATCH/DELETE | `/factories/:fid/master-data/products/:id` | FACTORY_ADMIN, PROD_MANAGER | Get/Update/Delete product |
| GET/POST | `/factories/:fid/master-data/categories` | FACTORY_ADMIN | List tree / Create category |
| PATCH/DELETE | `/factories/:fid/master-data/categories/:id` | FACTORY_ADMIN | Update/Delete category |
| GET/POST/PATCH/DELETE | `/factories/:fid/master-data/uoms[/:id]` | FACTORY_ADMIN | UoM CRUD |
| GET/POST | `/factories/:fid/master-data/work-centers` | FACTORY_ADMIN | List/Create work centers |
| GET/PATCH/DELETE | `/factories/:fid/master-data/work-centers/:id` | FACTORY_ADMIN | WC detail/Update/Delete |
| GET/POST | `/factories/:fid/master-data/work-centers/:id/machines` | FACTORY_ADMIN | List/Add machines |
| PATCH/DELETE | `/factories/:fid/master-data/work-centers/:id/machines/:mid` | FACTORY_ADMIN | Update/Remove machine |
| GET/POST/PATCH/DELETE | `/factories/:fid/master-data/skills[/:id]` | FACTORY_ADMIN | Skills CRUD |
| GET/POST | `/factories/:fid/master-data/routings` | FACTORY_ADMIN, PROD_MANAGER | List/Create routings |
| GET/PATCH/DELETE | `/factories/:fid/master-data/routings/:id` | FACTORY_ADMIN, PROD_MANAGER | Routing CRUD |
| POST | `/factories/:fid/master-data/routings/:id/operations` | FACTORY_ADMIN, PROD_MANAGER | Add operation |
| PATCH/DELETE | `/factories/:fid/master-data/routings/:id/operations/:opId` | FACTORY_ADMIN, PROD_MANAGER | Update/Remove operation |
| GET/POST | `/factories/:fid/bom` | FACTORY_ADMIN, PROD_MANAGER | List/Create BOM |
| GET/PATCH/DELETE | `/factories/:fid/bom/:id` | FACTORY_ADMIN, PROD_MANAGER | BOM CRUD |
| POST/PATCH/DELETE | `/factories/:fid/bom/:id/items[/:iid]` | FACTORY_ADMIN, PROD_MANAGER | BOM items |
| GET | `/factories/:fid/bom/:id/revisions` | All auth | Revision history |
| POST | `/factories/:fid/bom/:id/revise` | FACTORY_ADMIN, PROD_MANAGER | Create revision (snapshot + version bump) |
| POST | `/factories/:fid/master-data/erp-sync` | FACTORY_ADMIN, SUPER_ADMIN | Enqueue ERP sync job |
| GET | `/factories/:fid/master-data/erp-sync/status/:jobId` | All auth | Poll sync job status |

---

## Key Architectural Decisions

1. **Entity auto-discovery**: `DatabaseModule` glob `src/**/*.entity{.ts,.js}` picks up all new entities automatically — no `entity-registry.ts` changes needed.

2. **BOM multi-level**: `bom_items.childBomId → boms.id` (self-referencing FK). DB CHECK constraint enforces `materialId IS NOT NULL OR childBomId IS NOT NULL`. Recursive BOM explosion in Phase 3 uses PostgreSQL `WITH RECURSIVE`.

3. **BOM revision as snapshot**: `snapshotData jsonb` stores full BOM+items state at revision time (immutable, no `updatedAt`/`deletedAt`). Enables historical reconstruction without version-chain traversal.

4. **`machineIds: uuid[]`**: Routing operations store machine assignments as PostgreSQL UUID array — consistent with `WorkOrderStepEntity.requiredSkills: text[]`, avoids a many-to-many join table on the hot read path.

5. **Category tree via adjacency list**: Simple `parentId` self-reference. TypeORM `@Tree` + `findTrees()` or recursive CTE for deep traversal. `ON DELETE SET NULL` prevents orphan cascades.

6. **Guard order on all write endpoints**: `@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)` — exactly per `backend.md` constraint.

---

## Verification Plan

### Phase 1 (Backend)
1. Run migration: `pnpm typeorm migration:run -d src/database/data-source.ts` → all 10 new tables + 2 altered tables created without errors
2. Start API: `pnpm --filter @i-factory/api dev` — no module resolution errors
3. Swagger UI at `http://localhost:3001/api/docs` — verify all new endpoint groups appear under tags `Master Data — Products`, `Master Data — Work Centers`, `Master Data — Routings`, `BOM`
4. POST product → GET product (verify UUID, factoryId isolation)
5. POST BOM with items → POST `/revise` → GET `/revisions` (verify snapshot saved)
6. POST work center → POST machine under that work center
7. POST routing with operations → verify `sequence` uniqueness constraint fires on duplicate sequence
8. POST `/master-data/erp-sync` → GET status/:jobId → verify `waiting`/`completed` states

### Phase 2 (Frontend)
1. Navigate to `http://localhost:3000/master-data/products` — page renders with i18n title
2. Create product form submits → product appears in list
3. BOM create page → add items (material row + child BOM row) → save → verify items editor shows both types
4. BOM detail `/bom/:id` → click Revise → revision appears in `/bom/:id/revisions`
5. Routing operations editor — add 3 operations, reorder by drag → sequence numbers update correctly

### Phase 3 (Integration)
1. Create product + routing → create production order with `productId` → create work order using `createFromProductionOrder()` → verify WO steps match routing operations (workCenterId populated, estimatedMinutes = cycleTimeMinutes)
2. ERP sync: POST with `entityType: products`, 5 mock records, `syncMode: UPSERT` → `dryRun: true` first → then real run → verify products upserted, re-run with same payload → no duplicates (idempotency check)
