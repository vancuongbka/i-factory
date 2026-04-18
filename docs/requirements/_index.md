---
id: PROJECT-OVERVIEW
title: i-factory — Manufacturing Execution System
status: reverse-engineered
generated_at: 2026-04-18
stack:
  - NestJS 10 (REST API + WebSocket)
  - Next.js 15 App Router + React 19
  - PostgreSQL + TypeORM 0.3
  - Redis + BullMQ (async job queues)
  - Socket.io 4.7 (WebSocket)
  - Zod 3.23 (validation, shared schemas)
  - Passport (JWT + Local strategies)
  - TanStack Query 5 (frontend state)
  - Tailwind CSS 3.4
  - next-intl 3.26 (i18n: vi, en, ja)
  - Turborepo 2 + pnpm 9 (monorepo)
---

## Project Purpose

i-factory is a multi-factory Manufacturing Execution System (MES) that bridges the gap between production planning and shop-floor execution. It manages the full lifecycle of a production order — from BOM definition and routing setup through work order dispatch, real-time floor tracking, quality control, and inventory consumption — across one or more factories with strict tenant isolation.

Key capabilities inferred from code:
- Define products, bills of materials (with versioning & snapshots), and manufacturing routings
- Convert production orders into executable work orders with discrete steps auto-generated from routings
- Track work center and machine utilisation; enforce skill requirements on steps
- Record stock movements with full audit trail; alert on low-stock conditions
- Run QC inspections with defect logging (severity, root cause, corrective action)
- Generate async reports (production, work orders, inventory, QC) in CSV/JSON
- Broadcast real-time events (production updates, notifications) via WebSocket to factory rooms
- Sync master data from external ERP systems via async BullMQ jobs
- Support multiple languages (Vietnamese, English, Japanese) in the frontend

---

## Core Modules

| Module | Backend Path | Frontend Route | Description |
|--------|-------------|----------------|-------------|
| Auth | `modules/auth` | `(auth)/login` | JWT login, refresh token |
| Users | `modules/users` | `settings/users` | User CRUD, RBAC roles, multi-factory access |
| Factories | `modules/factories` | `factories/` | Factory registry, timezone, custom field config |
| Master Data — Products | `modules/master-data/products` | `master-data/products` | Product catalogue, categories, units of measure |
| Master Data — Work Centers | `modules/master-data/work-centers` | `master-data/work-centers` | Work centers, machines, skill definitions |
| Master Data — Routings | `modules/master-data/routings` | `master-data/routings` | Manufacturing process sequences and operations |
| Master Data — ERP Sync | `modules/master-data/erp-sync` | `master-data/erp-sync` | Async ERP data import (UPSERT/REPLACE) |
| BOM | `modules/bom` | `bom/` | Bills of materials, line items, revision history |
| Production | `modules/production` | `production/` | Production orders, lifecycle, WebSocket events |
| Work Orders | `modules/work-orders` | `work-orders/` | Work orders, steps, routing-based generation |
| Inventory | `modules/inventory` | `inventory/` | Materials, stock movements, warehouses |
| Quality Control | `modules/quality-control` | `quality-control/` | QC inspections, defects, approve/reject flow |
| Reports | `modules/reports` | `reports/` | Async report generation, download |
| Notifications | `modules/notifications` | `notifications/` | Persistent notifications + WebSocket broadcast |
| Dashboard | `modules/dashboard` | `dashboard/` | Aggregated KPI metrics per factory |
| Sync | `modules/sync` | — | Scheduled cross-factory master data sync |

---

## Requirements Summary Table

| ID | Title | Module | Status | Priority |
|----|-------|--------|--------|----------|
| REQ-001 | User authentication via username + password returning JWT access and refresh tokens | Auth | complete | high |
| REQ-002 | Access token expiry (15 min) with refresh token rotation (7 days) | Auth | complete | high |
| REQ-003 | Role-based access control with seven distinct roles (SUPER_ADMIN → VIEWER) | Auth / Users | complete | high |
| REQ-004 | Multi-factory access control: users are granted access to a subset of factories via `allowedFactories[]` | Auth / Users | complete | high |
| REQ-005 | Single-factory mode: empty `allowedFactories[]` bypasses factory filtering | Auth / Users | complete | medium |
| REQ-006 | User CRUD (create, read, update, soft-delete) restricted to admin roles | Users | complete | high |
| REQ-007 | Factory registry with code, name, address, timezone, and custom field configuration | Factories | complete | high |
| REQ-008 | Public factory listing endpoint to support factory-selector bootstrapping | Factories | complete | medium |
| REQ-009 | Product master with SKU, type (FINISHED / SEMI_FINISHED / RAW_MATERIAL / CONSUMABLE), technical specs (JSONB) | Master Data | complete | high |
| REQ-010 | Hierarchical product categories (self-referencing parent-child with sort order) | Master Data | complete | medium |
| REQ-011 | Units of measure with symbol and base-unit flag | Master Data | complete | medium |
| REQ-012 | Work center management (types: MACHINE, ASSEMBLY, INSPECTION, PACKING) with capacity tracking | Master Data | complete | high |
| REQ-013 | Machine management under work centers with status (ACTIVE, IDLE, MAINTENANCE, BREAKDOWN) | Master Data | complete | high |
| REQ-014 | Worker skill catalogue with proficiency levels (BASIC → EXPERT) | Master Data | complete | medium |
| REQ-015 | Manufacturing routing definition: ordered operations referencing work centers, machines, skills, setup and cycle times | Master Data | complete | high |
| REQ-016 | Multiple routing versions per product | Master Data | complete | medium |
| REQ-017 | Optional routing operations (isOptional flag) | Master Data | complete | low |
| REQ-018 | Async ERP master data import supporting UPSERT and REPLACE sync modes for products, work centers, routings, and BOMs | Master Data | complete | medium |
| REQ-019 | ERP sync dry-run mode (validation without persistence) | Master Data | complete | medium |
| REQ-020 | ERP sync job status polling | Master Data | complete | medium |
| REQ-021 | Bill of Materials with versioning (`version` field, e.g., "1.0") | BOM | complete | high |
| REQ-022 | BOM line items referencing materials or nested child BOMs with quantity, unit, and waste percentage | BOM | complete | high |
| REQ-023 | Phantom BOM support (`isPhantom` flag) for costing purposes | BOM | complete | medium |
| REQ-024 | BOM revision history: stores full snapshot of BOM state at each revision with change notes | BOM | complete | medium |
| REQ-025 | Production order lifecycle management: DRAFT → PLANNED → IN_PROGRESS → PAUSED → COMPLETED / CANCELLED | Production | complete | high |
| REQ-026 | Production order tracks planned vs actual start/end dates and completed quantity | Production | complete | high |
| REQ-027 | Production order links to BOM and production line | Production | complete | medium |
| REQ-028 | Real-time production events broadcast to factory WebSocket room (`production:created`, `production:updated`, `production:completed`) | Production | complete | high |
| REQ-029 | Work order creation with explicit step definitions (number, name, work center, estimated time, required skills) | Work Orders | complete | high |
| REQ-030 | Auto-generation of work order steps from a manufacturing routing | Work Orders | complete | high |
| REQ-031 | Work order status lifecycle: PENDING → ASSIGNED → IN_PROGRESS → ON_HOLD → COMPLETED / REJECTED / CANCELLED | Work Orders | complete | high |
| REQ-032 | Work order assignment to an operator (assignedTo UUID) | Work Orders | complete | high |
| REQ-033 | Per-step completion tracking with timestamp | Work Orders | complete | medium |
| REQ-034 | Material master with current stock, min/max levels, and warehouse assignment | Inventory | complete | high |
| REQ-035 | Immutable stock movement audit trail (RECEIPT, ISSUE, TRANSFER, ADJUSTMENT, RETURN, SCRAP) with reference traceability | Inventory | complete | high |
| REQ-036 | Automatic stock quantity update on movement creation | Inventory | complete | high |
| REQ-037 | Low-stock alert endpoint (materials below `minStockLevel`) | Inventory | complete | high |
| REQ-038 | Warehouse master data per factory | Inventory | complete | medium |
| REQ-039 | QC inspection record with sample size, pass/fail counts, and overall result (PASS, FAIL, CONDITIONAL, PENDING) | QC | complete | high |
| REQ-040 | QC inspection linked to a work order and/or production order for traceability | QC | complete | high |
| REQ-041 | Defect logging per inspection: code, description, severity (CRITICAL, MAJOR, MINOR), quantity, root cause, corrective action | QC | complete | high |
| REQ-042 | Explicit approve (`PASS`) and reject (`FAIL`) actions on QC inspections | QC | complete | high |
| REQ-043 | Async report generation via BullMQ with progress tracking | Reports | complete | high |
| REQ-044 | Report types: production summary, work-order throughput, inventory stock, QC defect rates | Reports | complete | high |
| REQ-045 | Report export formats: CSV and JSON | Reports | complete | medium |
| REQ-046 | Report date-range filtering | Reports | complete | medium |
| REQ-047 | Report job status polling and file download endpoint | Reports | complete | high |
| REQ-048 | Persistent in-app notification records per factory (with optional per-user targeting) | Notifications | complete | medium |
| REQ-049 | Real-time notification delivery via WebSocket to factory room (`notification:created`) | Notifications | complete | high |
| REQ-050 | Read-status tracking on notifications | Notifications | partial | medium |
| REQ-051 | Aggregated KPI dashboard per factory (production counts, QC pass rate, low-stock count, work order stats) | Dashboard | complete | high |
| REQ-052 | Soft-delete on all primary entities using `deletedAt` column (no hard deletes) | Cross-cutting | complete | high |
| REQ-053 | JSONB `customFields` extensibility on Factory, Product, WorkCenter, Machine, Material, ProductionOrder, WorkOrder, QCInspection | Cross-cutting | complete | medium |
| REQ-054 | Zod schema validation on all API inputs; schemas shared between backend and frontend via `@i-factory/api-types` | Cross-cutting | complete | high |
| REQ-055 | Guard order on every protected route: JwtAuthGuard → RolesGuard → FactoryAccessGuard | Cross-cutting | complete | high |
| REQ-056 | BullMQ job monitoring dashboard at `/admin/queues` (Bull Board) with username/password auth | DevOps | complete | medium |
| REQ-057 | Scheduled cross-factory master data sync (configurable interval, FACTORY_SYNC_ENABLED flag) | Sync | complete | low |
| REQ-058 | Internationalization: Vietnamese, English, and Japanese UI via next-intl | Frontend | complete | medium |
| REQ-059 | Dark/light theme toggle in frontend (next-themes) | Frontend | complete | low |
| REQ-060 | ERP sync UI: form submission, async job status polling, progress display | Frontend | complete | medium |
| REQ-061 | BOM revision history view in frontend | Frontend | complete | medium |
| REQ-062 | Routing detail page with inline operation management | Frontend | complete | medium |
| REQ-063 | Work center detail page with embedded machine list | Frontend | complete | medium |
| REQ-064 | Notifications centre page displaying all factory notifications | Frontend | complete | medium |
| REQ-065 | Pagination support in list endpoints | Cross-cutting | partial | medium |
| REQ-066 | Swagger/OpenAPI documentation for the REST API | DevOps | partial | low |

---

## Per-Module Requirement Files

### Master Data Module (MDM)

| ID | Title | Status | Priority | Source Module |
|----|-------|--------|----------|---------------|
| [MDM-001](MDM-001.md) | Product Catalogue Management | inferred | high | master-data/products |
| [MDM-002](MDM-002.md) | Product Category Hierarchy | inferred | medium | master-data/products |
| [MDM-003](MDM-003.md) | Unit of Measure Management | inferred | medium | master-data/products |
| [MDM-004](MDM-004.md) | Work Center Management | inferred | high | master-data/work-centers |
| [MDM-005](MDM-005.md) | Machine Asset Registry | inferred | high | master-data/work-centers |
| [MDM-006](MDM-006.md) | Worker Skill Catalogue | inferred | medium | master-data/work-centers |
| [MDM-007](MDM-007.md) | Manufacturing Routing Definition | inferred | high | master-data/routings |
| [MDM-008](MDM-008.md) | ERP Master Data Import | inferred | medium | master-data/erp-sync |

### BOM Module

| ID | Title | Status | Priority | Source Module |
|----|-------|--------|----------|---------------|
| [BOM-001](BOM-001.md) | BOM Header Management | inferred | high | bom |
| [BOM-002](BOM-002.md) | BOM Line Item Management | inferred | high | bom |
| [BOM-003](BOM-003.md) | BOM Revision & Version Control | inferred | medium | bom |

### Production Module

| ID | Title | Status | Priority | Source Module |
|----|-------|--------|----------|---------------|
| [PROD-001](PROD-001.md) | Production Order Management | inferred | high | production |
| [PROD-002](PROD-002.md) | Production Order Real-time WebSocket Events | inferred | high | production |
| [PROD-003](PROD-003.md) | Production Line Registry | inferred | low | production |

### Work Orders Module

| ID | Title | Status | Priority | Source Module |
|----|-------|--------|----------|---------------|
| [WO-001](WO-001.md) | Work Order Retrieval | inferred | high | work-orders |
| [WO-002](WO-002.md) | Manual Work Order Creation with Explicit Steps | inferred | high | work-orders |
| [WO-003](WO-003.md) | Routing-Based Work Order Generation | inferred | high | work-orders |
| [WO-004](WO-004.md) | Work Order Status Lifecycle and Operator Assignment | inferred | high | work-orders |
| [WO-005](WO-005.md) | Work Order Step Completion Tracking | inferred | medium | work-orders |

### CNC Daily Planning & Real-time Monitoring Module

| ID | Title | Status | Priority | Source Module |
|----|-------|--------|----------|---------------|
| [CNC-001](CNC-001.md) | CNC Daily Planning & Real-time Monitoring | draft | high | cnc |

---

## Open Questions

1. **Pagination completeness** — List endpoints support query builder pagination internally, but it is not consistently exposed via `page`/`limit` query params across all controllers. Unclear if pagination is intentionally omitted for some endpoints or is simply incomplete.

2. **Report file lifecycle** — Reports are written to `./uploads/reports/` with no observed cleanup logic. It is unclear whether files are automatically purged after download, after a TTL, or never.

3. **`CONDITIONAL` QC result** — The `QCResult.CONDITIONAL` enum value exists in the schema and entity but there is no dedicated API action to set this status. It is unclear whether it is set manually via the generic PATCH endpoint or was planned as a distinct workflow.

4. **`notification:read` WebSocket event** — The event is referenced in the NotificationsGateway but no HTTP endpoint to mark a notification as read was found. The `isRead` flag exists on the entity but the write path may be missing or is via WebSocket only.

5. **Production line management** — `ProductionLine` entity exists and is referenced by `ProductionOrder`, but no dedicated CRUD API for production lines was found. Lines may be seeded or managed outside this system.

6. **`assignedTo` user resolution** — Work orders store `assignedTo` as a UUID but there is no observed join to the users table when fetching work orders. The frontend may need to resolve usernames separately.

7. **Multi-factory sync scope** — `FactorySyncProcessor` exists but its sync payload and entity scope are not fully documented in code. It is unclear which entities are synced and in which direction.

8. **ERP sync source** — The `ErpSyncProcessor` receives an external payload but the upstream ERP system, authentication, and polling mechanism are not implemented in this codebase. Integration is assumed to be handled outside the system (push model).

9. **Work order from-routing endpoint method** — The `POST /factories/:factoryId/work-orders/:productionOrderId/from-routing` route uses `:productionOrderId` as a path segment, which is unconventional. The intent seems correct but the route may cause controller matching ambiguity with the generic `/:id` route depending on parameter ordering.

10. **Token invalidation on logout** — No logout endpoint or token blacklist/revocation mechanism was found. Refresh tokens are stateless JWTs with no server-side storage, so forced invalidation (e.g., on role change or account deactivation) is not currently possible.
