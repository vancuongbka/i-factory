# iFactory — Modules Development Backlog

> Generated: 2026-04-13
> Status key: ✅ Complete | 🔶 Partial (read-only stub) | ❌ Empty stub

---

## Current State Overview

| Module | Backend | Frontend | Priority |
|---|---|---|---|
| Auth | ✅ Complete | ✅ Login page | — |
| Master Data (MDM) | ✅ Complete | ✅ Complete | — |
| BOM | ✅ Complete | ✅ Complete | — |
| Work Orders | ✅ Complete | ✅ Complete | — |
| Dashboard | — | ✅ Complete | — |
| Users | ✅ Complete | ✅ Complete | — |
| Factories | 🔶 Read-only | ❌ Empty | High |
| Production | ✅ Complete | ✅ Complete | — |
| Inventory | 🔶 Read-only | ❌ Empty | Medium |
| Quality Control | 🔶 Read-only | ❌ Empty | Medium |
| Reports | 🔶 Queue only | ❌ Empty | Medium |
| Notifications | 🔶 Broadcast only | ❌ Empty | Low |
| Sync | 🔶 Queue only | — | Low |

---

## Module 1 — Work Orders UI
**Backend**: ✅ Already complete (create, createFromProductionOrder, findAll, findById)
**Frontend**: ❌ Empty stubs at `/work-orders`, `/work-orders/new`, `/work-orders/[id]`

### What to build
**Pages & components:**
- `work-orders/page.tsx` → `WorkOrderTable` — list with status badge, WO number, linked production order, assigned work center
- `work-orders/new/page.tsx` → `CreateWorkOrderForm` — select production order, choose manual steps or auto-generate from routing
- `work-orders/[id]/page.tsx` → `WorkOrderDetailClient` — step list, step status update (Not Started → In Progress → Done), progress bar

**i18n keys:** `workOrders.title`, `workOrders.columns.*`, `workOrders.status.*`, `workOrders.steps.*`

---

## Module 2 — Factories Management
**Backend**: 🔶 Read-only (`findAll`, `findById`) — missing create/update/delete
**Frontend**: ❌ Empty stub at `/factories`

### Backend gaps
- `factories.service.ts`: add `create()`, `update()`, `remove()` (soft delete)
- `factories.controller.ts`: add `POST /factories`, `PATCH /factories/:id`, `DELETE /factories/:id`
- Guards: `SUPER_ADMIN` role for write operations

### Frontend
- `factories/page.tsx` → `FactoryTable` — list with code, name, location, status
- `factories/new/page.tsx` → `CreateFactoryForm`
- `factories/[id]/page.tsx` → factory detail + edit

---

## Module 3 — Production Orders
**Backend**: 🔶 Read-only (`findAll`, `findById`) — missing create/update/status transitions
**Frontend**: ❌ Empty stubs at `/production`, `/production/[id]`

### Backend gaps
- `production.service.ts`: add `create()`, `update()`, `cancel()`, `updateStatus()` (Planned → InProgress → Completed)
- `production.controller.ts`: add POST, PATCH, DELETE, and status-change endpoint
- Link to MDM: `productId` FK already on entity — wire `ProductService` to auto-populate `productName` and suggest `bomId`

### Frontend
- `production/page.tsx` → `ProductionOrderTable` — list with order number, product, quantity, status, due date
- `production/new/page.tsx` → `CreateProductionOrderForm` — select product (from MDM), set quantity + due date
- `production/[id]/page.tsx` → `ProductionOrderDetail` — show linked work orders, BOM snapshot, status timeline

---

## Module 4 — Users & Settings
**Backend**: 🔶 Read-only (`findAll`, `findById`) + `validateCredentials()` (has TODO for bcrypt)
**Frontend**: ❌ Empty stub at `/settings/users`

### Backend gaps
- `users.service.ts`: fix bcrypt TODO, add `create()`, `update()`, `remove()`, `changePassword()`
- `users.controller.ts`: add POST, PATCH, DELETE endpoints
- Role assignment: `SUPER_ADMIN` can assign any role; `FACTORY_ADMIN` can assign within their factory

### Frontend
- `settings/users/page.tsx` → `UserTable` — list with avatar, name, email, role, factory, status
- `settings/users/new/page.tsx` → `InviteUserForm`
- `settings/users/[id]/page.tsx` → user detail + edit role + deactivate

---

## Module 5 — Inventory
**Backend**: 🔶 Read-only (`findAllMaterials`, `findLowStock`) — missing all write operations
**Frontend**: ❌ Empty stubs at `/inventory`, `/inventory/materials`, `/inventory/movements`

### Backend gaps
- Material CRUD: `create()`, `update()`, `remove()`
- Stock movements: `recordMovement()` — IN, OUT, ADJUSTMENT, TRANSFER
- Warehouse: optional warehouse/location entity for multi-location tracking
- Low-stock alerts: BullMQ job or threshold check on movement record

### Frontend
- `inventory/materials/page.tsx` → `MaterialTable` — list with SKU, current stock, UoM, min threshold, low-stock badge
- `inventory/movements/page.tsx` → `MovementLog` — chronological log of all IN/OUT/ADJUSTMENT entries with filters
- Shared: `RecordMovementModal` — quick form to log a movement from any page

---

## Module 6 — Quality Control
**Backend**: 🔶 Read-only (`findAll`) — no defect recording or audit
**Frontend**: ❌ Empty stubs at `/quality-control`, `/quality-control/inspections`

### Backend gaps
- `QcInspection` entity: linked to production order or work order step, inspector (user), pass/fail, defect count, notes
- `QcDefect` entity: defect type, severity, quantity, images (URL array)
- Service: `create()`, `update()`, `recordDefect()`, `approve()`, `reject()`
- Controller: full CRUD + status change

### Frontend
- `quality-control/inspections/page.tsx` → `InspectionTable` — list with linked order, inspector, result badge (Pass/Fail/Pending)
- `quality-control/inspections/[id]/page.tsx` → `InspectionDetail` — defect list, photos, approval action
- `quality-control/inspections/new/page.tsx` → `CreateInspectionForm` — select production order / WO step

---

## Module 7 — Reports
**Backend**: 🔶 Queue infrastructure only — jobs enqueued but no actual generation logic
**Frontend**: ❌ Minimal placeholder at `/reports`

### Backend gaps
- `ErpSyncProcessor`-style processor: implement report generation for each type
  - Production summary (by date range, factory, product)
  - Work order throughput
  - Inventory valuation
  - QC defect rate
- Output: generate CSV/Excel → upload to storage (S3/local) → store download URL in job result
- `GET /reports/:jobId/download` — redirect to signed URL

### Frontend
- `reports/page.tsx` → report request form: select report type, date range, factory filter
- Async polling: show progress bar after submit, display download link when `status = completed`

---

## Module 8 — Notifications
**Backend**: 🔶 Broadcast + read-only — no management, no preferences
**Frontend**: ❌ Empty stub at `/notifications`

### Backend gaps
- `NotificationEntity`: type, title, body, targetUserId, isRead, factoryId, createdAt
- Service: `createForUser()`, `markRead()`, `markAllRead()`, `deleteOld()`
- WebSocket: emit `notification:created` on save — already has `broadcast()`, needs per-user rooms
- Controller: add PATCH `/:id/read`, DELETE `/:id`

### Frontend
- `notifications/page.tsx` → `NotificationList` — grouped by date, unread highlighted, mark-read button
- Topbar bell: show unread count badge; dropdown preview of last 5 notifications with "View All" link

---

## Module 9 — Cross-Factory Sync
**Backend**: 🔶 Queue only — `scheduleSyncJob()` exists, no controller, no real sync logic
**Frontend**: — (admin-only, no dedicated route planned)

### Backend gaps
- Add `SyncController` with `POST /factories/:fid/sync/trigger`
- Implement actual sync strategies:
  - Master data replication (products, routings) to secondary factories
  - Production order cross-factory transfers
- Idempotency: same job ID → no duplicate sync

---

## Suggested Build Order

```
Sprint 1 — Core execution loop
  1. Work Orders UI        (API already complete — quickest win)
  2. Production Orders     (backend + frontend)
  3. Factories             (backend + frontend)

Sprint 2 — Operational data
  4. Users & Settings      (fix bcrypt + full CRUD)
  5. Inventory             (materials + movements)

Sprint 3 — Quality & Reporting
  6. Quality Control
  7. Reports

Sprint 4 — Supporting services
  8. Notifications
  9. Cross-Factory Sync
```
