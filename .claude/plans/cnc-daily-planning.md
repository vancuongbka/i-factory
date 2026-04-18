# CNC Daily Planning & Real-time Monitoring — Implementation Plan

## Context

This module adds CNC machine scheduling, real-time status monitoring, production logging, and downtime tracking to the iFactory MES. It targets factory-floor operators and production managers who need to plan daily CNC machine usage and track execution in real time.

---

## Architecture

```
apps/api/src/modules/cnc/
├── cnc.gateway.ts                          ← WebSocket /cnc namespace
├── cnc.module.ts
├── controllers/
│   ├── cnc-machines.controller.ts
│   ├── daily-schedules.controller.ts
│   ├── schedule-entries.controller.ts
│   ├── production-logs.controller.ts
│   └── machine-downtime.controller.ts
├── services/
│   ├── cnc-machines.service.ts
│   ├── daily-schedules.service.ts
│   ├── schedule-entries.service.ts
│   ├── production-logs.service.ts
│   └── machine-downtime.service.ts
└── processors/
    ├── cnc-shift-transition.processor.ts   ← auto-pause at shift end
    └── cnc-schedule-archive.processor.ts   ← nightly archiving

packages/api-types/src/
├── enums/
│   ├── cnc-machine-status.enum.ts
│   ├── schedule-entry-status.enum.ts
│   └── daily-schedule-status.enum.ts
└── schemas/cnc.schema.ts

apps/web/src/app/(app)/cnc/
├── machines/
│   ├── page.tsx                            ← list (server component)
│   ├── new/page.tsx
│   ├── [id]/page.tsx                       ← detail (Phase 5)
│   └── _components/
│       ├── cnc-machines-table.tsx
│       └── create-cnc-machine-form.tsx
├── monitoring/
│   └── page.tsx                            ← live dashboard (Phase 5)
└── planning/
    └── page.tsx                            ← Gantt view (Phase 6)
```

**WebSocket event naming convention:** `cnc:<past-tense-verb>`

---

## Phase 1 — Shared Package `@i-factory/api-types` ✅ COMPLETE

### New Enums
| File | Values |
|------|--------|
| `cnc-machine-status.enum.ts` | `IDLE, SETUP, RUNNING, PAUSED, ERROR, MAINTENANCE` |
| `schedule-entry-status.enum.ts` | `PENDING, SETUP, RUNNING, PAUSED, COMPLETED, ERROR` |
| `daily-schedule-status.enum.ts` | `DRAFT, PUBLISHED, IN_PROGRESS, COMPLETED, ARCHIVED` |

### New Schema File: `schemas/cnc.schema.ts`
- Machine DTOs: `CreateCncMachineDto`, `UpdateCncMachineDto`, `UpdateCncMachineStatusDto`
- Schedule DTOs: `CreateDailyScheduleDto`, `UpdateDailyScheduleDto`
- Entry DTOs: `CreateScheduleEntryDto`, `UpdateScheduleEntryDto`, `AdvanceEntryStatusDto`, `ReorderScheduleEntriesDto`
- Log DTOs: `CreateProductionLogDto`
- Downtime DTOs: `CreateCncDowntimeDto`, `ResolveCncDowntimeDto`
- Response types: `CncMachineResponse`, `DailyScheduleResponse`, `ScheduleEntryResponse`, `ProductionLogResponse`, `CncDowntimeResponse`, `CncKpiSummary`

---

## Phase 2 — Database Entities & Migration ✅ COMPLETE

### New Entities
| Entity | Table | Key Columns |
|--------|-------|-------------|
| `CncMachineEntity` | `cnc_machines` | code, name, model, maxSpindleRpm, numberOfAxes, currentStatus (enum), currentScheduleEntryId (uuid, no FK), factoryId |
| `DailyScheduleEntity` | `cnc_daily_schedules` | scheduleDate (date), title, status (enum), factoryId, createdBy |
| `ScheduleEntryEntity` | `cnc_schedule_entries` | scheduleId, machineId, plannedStart, plannedEnd, status (enum), sortOrder, targetQty, completedQty, factoryId |
| `ProductionLogEntity` | `production_logs` | entryId, machineId, loggedQty, operatorId, loggedAt, notes, factoryId |
| `MachineDowntimeEntity` | `machine_downtime` | machineId, reason, startedAt, resolvedAt, durationMinutes, resolvedBy, factoryId |

**Circular dependency note:** `currentScheduleEntryId` on `CncMachineEntity` is a plain `uuid` column with no `@ManyToOne` decorator to avoid circular dep between `CncMachineEntity` ↔ `ScheduleEntryEntity`. FK is enforced only in migration SQL.

### Migration
`apps/api/src/database/migrations/<timestamp>-AddCncModule.ts`
- Creates 3 enum types: `cnc_machine_status_enum`, `schedule_entry_status_enum`, `daily_schedule_status_enum`
- Creates 5 tables in dependency order
- Indexes on `factoryId`, `scheduleDate`, `machineId`, `status`

---

## Phase 3 — Backend Services & Controllers ✅ COMPLETE

### WebSocket Gateway (`cnc.gateway.ts`)
- Namespace: `/cnc`
- Clients join `factory:{factoryId}` room on connect (from `handshake.auth.factoryId`)
- `emitToFactory(factoryId, event, data)` helper used by all services

### Services

#### `CncMachinesService`
- CRUD (create, findAll, findOne, update, softDelete)
- `updateStatus(id, factoryId, dto)` — emits `cnc:machine-status-updated`
- `getKpiSummary(factoryId, date)` — aggregates machine status counts + planned vs completed qty from production logs

#### `DailySchedulesService`
- CRUD + `publish(id, factoryId, userId)` — DRAFT→PUBLISHED, emits `cnc:schedule-published`
- `update()` and `remove()` guard: throw `UnprocessableEntityException` if not DRAFT

#### `ScheduleEntriesService` (most complex)
```typescript
const VALID_TRANSITIONS: Record<ScheduleEntryStatus, ScheduleEntryStatus[]> = {
  PENDING:   [SETUP],
  SETUP:     [RUNNING],
  RUNNING:   [PAUSED, COMPLETED, ERROR],
  PAUSED:    [RUNNING, ERROR],
  COMPLETED: [],
  ERROR:     [SETUP, RUNNING],
};
```
- `checkConflict()` — time-overlap query: `plannedStart < :end AND plannedEnd > :start`, scoped to machine+factory+active statuses
- `advanceStatus()` — validates transition, updates machine `currentStatus`/`currentScheduleEntryId`, queues delayed auto-pause BullMQ job on → RUNNING
- `enrichWithProgress()` — batch aggregates `completedQty` from `production_logs`, computes `cumulativeCompletedQty`, `progressPct`, `overrun`
- `reorder()` — bulk `sortOrder` updates via `Promise.all`

#### `ProductionLogsService`
- Append-only; validates entry is RUNNING before creating
- Emits `cnc:production-logged`

#### `MachineDowntimeService`
- `raise()` — creates record, sets machine → ERROR, emits `cnc:downtime-raised`
- `resolve()` — computes `durationMinutes = Math.round((resolvedAt - startedAt) / 60000)`, sets machine → IDLE, emits `cnc:downtime-resolved`

### Controllers

| Controller | Base Path | Key Routes |
|-----------|-----------|-----------|
| `CncMachinesController` | `factories/:fid/cnc/machines` | CRUD + `PATCH :id/status` + `GET /kpi/summary?date=` |
| `DailySchedulesController` | `factories/:fid/cnc/schedules` | CRUD + `GET by-date/:date` + `POST :id/publish` |
| `ScheduleEntriesController` | `factories/:fid/cnc` | `GET schedules/:sid/entries`, entries CRUD, `POST entries/:id/advance-status`, `POST entries/reorder` |
| `ProductionLogsController` | `factories/:fid/cnc` | `GET entries/:eid/logs`, `POST production-logs` |
| `MachineDowntimeController` | `factories/:fid/cnc` | `GET downtime/active`, `GET machines/:mid/downtime`, `POST downtime`, `PATCH downtime/:id/resolve` |

Guard order on all endpoints: `JwtAuthGuard, RolesGuard, FactoryAccessGuard`

`OPERATOR_ROLES = [UserRole.OPERATOR, UserRole.PRODUCTION_MANAGER, UserRole.FACTORY_ADMIN, UserRole.SUPER_ADMIN]` for advance-status, raise/resolve downtime, create production log.

### BullMQ Processors

#### `CncShiftTransitionProcessor` — queue: `cnc-shift-transition`
- Job name: `auto-pause`
- Idempotent: checks entry is still RUNNING before pausing; no-op if already completed/paused
- Updates machine status to IDLE on pause

#### `CncScheduleArchiveProcessor` — queue: `cnc-schedule-archive`
- Archives PUBLISHED/IN_PROGRESS/COMPLETED schedules where `scheduleDate < beforeDate`
- Optional `factoryId` filter
- Emits `cnc:schedule-archived` per affected factory
- Returns `{ archivedCount }`

### Module (`cnc.module.ts`)
- `BullModule.registerQueue` for `cnc-shift-transition` and `cnc-schedule-archive`
- `TypeOrmModule.forFeature` for all 5 CNC entities
- Exports: `CncMachinesService`, `DailySchedulesService`, `ScheduleEntriesService`
- Registered in `app.module.ts`

---

## Phase 4 — Frontend CNC Machines Admin & Shared Infrastructure ✅ COMPLETE

### API Client (`apps/web/src/lib/api-client.ts`)
Added `cnc` namespace with sub-namespaces:
- `machines`: list, get, create, update, remove, updateStatus, kpiSummary
- `schedules`: list, get, byDate, create, update, publish, remove
- `entries`: listBySchedule, get, create, update, remove, advanceStatus, reorder
- `productionLogs`: listByEntry, create
- `downtime`: active, listByMachine, raise, resolve

### TanStack Query Hooks
| File | Exports |
|------|---------|
| `use-cnc-machines.ts` | `useCncMachines`, `useCncMachine`, `useCncKpiSummary` (30s refetch), `useCreateCncMachine`, `useUpdateCncMachine`, `useDeleteCncMachine`, `useUpdateCncMachineStatus` |
| `use-cnc.ts` | 17 hooks — daily schedules (7), schedule entries (7), production logs (2), machine downtime (4) |
| `use-cnc-websocket.ts` | `useCncWebSocket()` — maps WS events to `queryClient.invalidateQueries` |

**TS2742 fix in `use-cnc-websocket.ts`:** Explicit return type `MutableRefObject<Socket | null>` and `import type { Socket } from 'socket.io-client'` required to avoid portability error with internal socket.io package path.

### WebSocket Event → Query Invalidation Map
| Event | Invalidated Query Keys |
|-------|----------------------|
| `cnc:machine-status-updated` | `['cnc-machines', fid]`, `['cnc-kpi', fid]` |
| `cnc:schedule-published` / `cnc:schedule-archived` | `['cnc-schedules', fid]` |
| `cnc:entry-status-advanced` | `['cnc-entries', fid]`, `['cnc-machines', fid]`, `['cnc-kpi', fid]` |
| `cnc:production-logged` | `['cnc-entries', fid]`, `['cnc-logs', fid]`, `['cnc-kpi', fid]` |
| `cnc:downtime-raised` / `cnc:downtime-resolved` | `['cnc-downtime', fid]`, `['cnc-machines', fid]` |

### Pages & Components
| File | Type | Description |
|------|------|-------------|
| `app/(app)/cnc/machines/page.tsx` | Server | List page with "New Machine" button, renders `<CncMachinesTable />` |
| `cnc/machines/_components/cnc-machines-table.tsx` | Client | Status badges (RUNNING=green, IDLE=gray, SETUP=blue, ERROR=red, MAINTENANCE=orange), eye + delete actions |
| `app/(app)/cnc/machines/new/page.tsx` | Server | Create page, renders `<CreateCncMachineForm />` |
| `cnc/machines/new/_components/create-cnc-machine-form.tsx` | Client | Controlled form: code*, name*, model, maxSpindleRpm, numberOfAxes; redirects to `/cnc/machines` on success |

### Sidebar (`sidebar.tsx`)
Added `cncGroup` nav group between `menuGroup` and `masterData`:
- `/cnc/machines` — CNC Machines
- `/cnc/monitoring` — Live Monitoring

### i18n (en.json + vi.json)
- Added `nav.cncGroup`, `nav.cncMachines`, `nav.cncMonitoring`
- Added full `cnc.*` namespace: machines (title, pageTitle, noResults, new, fields, columns, status labels, actions), schedules, entries, downtime, monitoring

---

## Phase 5 — Frontend Live Monitoring Dashboard 🔲 PENDING

**Effort: M**

### Deliverables

**`apps/web/src/app/(app)/cnc/monitoring/page.tsx`** (server component)
- `generateMetadata` with `cnc.monitoring.pageTitle`
- Renders `<CncMonitoringDashboard />`

**`apps/web/src/app/(app)/cnc/monitoring/_components/cnc-monitoring-dashboard.tsx`** (client component)
- Mounts `useCncWebSocket()` for real-time updates
- Uses `useCncMachines()` + `useCncKpiSummary()` (already has 30s auto-refresh)
- KPI summary cards: total machines, running, idle, error, planned qty, completed qty
- Machine grid: one card per machine showing name, currentStatus badge, current entry title (if any)
- Status badge auto-updates via WS invalidation (no manual refresh needed)

**`apps/web/src/app/(app)/cnc/machines/[id]/page.tsx`** (server component)
- Machine detail with `useCncMachine(id)`, downtime history `useMachineDowntime(machineId)`, raise/resolve downtime buttons

**i18n additions:**
- `cnc.monitoring.kpi.running`, `cnc.monitoring.kpi.idle`, `cnc.monitoring.kpi.error`, `cnc.monitoring.kpi.planned`, `cnc.monitoring.kpi.completed`
- `cnc.monitoring.machineCard.noEntry`
- `cnc.machines.detail.pageTitle`, `cnc.machines.detail.downtimeHistory`

---

## Phase 6 — Frontend Interactive Gantt Planning View 🔲 PENDING

**Effort: XL**

**Prerequisite:** ADR decision on Gantt library (options: `@visx/timeline`, custom SVG, `react-gantt-chart`, `dhtmlx-gantt`). Recommend ADR before implementation.

**`apps/web/src/app/(app)/cnc/planning/page.tsx`**
- Date picker → loads `useDailyScheduleByDate(date)`
- Gantt chart with machines on Y-axis, time on X-axis
- Drag-to-place new entries; on drop → `checkConflict` API call → show error if conflict
- Entry color-coded by status
- Click entry → side panel with `useScheduleEntry(id)`, `useAdvanceEntryStatus`, `useProductionLogs(entryId)`, `useCreateProductionLog`

**Sidebar addition:** `/cnc/planning` — "Planning" nav item in `cncGroup`

---

## Phase 7 — Integration & Polish 🔲 PENDING

**Effort: S**

1. **Swagger annotations** — `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth` on all 5 CNC controllers
2. **Notifications integration** — `CncGateway` or a `CncNotificationsService` that calls `NotificationsService.create()` for key events (downtime raised, entry error)
3. **Archive scheduler** — `@Cron` decorator in a `CncSchedulerService` to enqueue `cnc-schedule-archive` job nightly at 00:05
4. **Acceptance test pass:**
   - Create machine → POST schedule → publish → add entry → advance to RUNNING → log production → verify KPI updates
   - Raise downtime → machine status → ERROR → resolve → machine status → IDLE
   - WS: connect to `/cnc` with valid token + factoryId → trigger machine status update → verify invalidation fires

---

## WebSocket Events Reference

| Event | Payload | Trigger |
|-------|---------|---------|
| `cnc:machine-status-updated` | `{ machineId, status, factoryId }` | `updateStatus()` |
| `cnc:schedule-published` | `{ scheduleId, factoryId }` | `publish()` |
| `cnc:schedule-archived` | `{ count, factoryId }` | archive processor |
| `cnc:entry-status-advanced` | `{ entryId, status, machineId, factoryId }` | `advanceStatus()` |
| `cnc:production-logged` | `{ logId, entryId, factoryId }` | `createLog()` |
| `cnc:downtime-raised` | `{ downtimeId, machineId, factoryId }` | `raise()` |
| `cnc:downtime-resolved` | `{ downtimeId, machineId, durationMinutes, factoryId }` | `resolve()` |

---

## Complete File Inventory

### ✅ Completed Files

**Backend — New (12 files)**
```
apps/api/src/modules/cnc/cnc.gateway.ts
apps/api/src/modules/cnc/cnc.module.ts
apps/api/src/modules/cnc/controllers/cnc-machines.controller.ts
apps/api/src/modules/cnc/controllers/daily-schedules.controller.ts
apps/api/src/modules/cnc/controllers/schedule-entries.controller.ts
apps/api/src/modules/cnc/controllers/production-logs.controller.ts
apps/api/src/modules/cnc/controllers/machine-downtime.controller.ts
apps/api/src/modules/cnc/services/cnc-machines.service.ts
apps/api/src/modules/cnc/services/daily-schedules.service.ts
apps/api/src/modules/cnc/services/schedule-entries.service.ts
apps/api/src/modules/cnc/services/production-logs.service.ts
apps/api/src/modules/cnc/services/machine-downtime.service.ts
apps/api/src/modules/cnc/processors/cnc-shift-transition.processor.ts
apps/api/src/modules/cnc/processors/cnc-schedule-archive.processor.ts
```

**Backend — Modified (1 file)**
```
apps/api/src/app.module.ts                      ← +CncModule
```

**api-types — New (4 files)**
```
packages/api-types/src/enums/cnc-machine-status.enum.ts
packages/api-types/src/enums/schedule-entry-status.enum.ts
packages/api-types/src/enums/daily-schedule-status.enum.ts
packages/api-types/src/schemas/cnc.schema.ts
```

**api-types — Modified (2 files)**
```
packages/api-types/src/enums/index.ts          ← +3 CNC enums
packages/api-types/src/index.ts                ← +CNC schemas
```

**Frontend — New (7 files)**
```
apps/web/src/hooks/use-cnc-machines.ts
apps/web/src/hooks/use-cnc.ts
apps/web/src/hooks/use-cnc-websocket.ts
apps/web/src/app/(app)/cnc/machines/page.tsx
apps/web/src/app/(app)/cnc/machines/_components/cnc-machines-table.tsx
apps/web/src/app/(app)/cnc/machines/new/page.tsx
apps/web/src/app/(app)/cnc/machines/new/_components/create-cnc-machine-form.tsx
```

**Frontend — Modified (4 files)**
```
apps/web/src/lib/api-client.ts                 ← +cnc namespace
apps/web/src/components/layout/sidebar.tsx     ← +cncGroup
apps/web/messages/en.json                      ← +cnc.*, nav keys
apps/web/messages/vi.json                      ← +Vietnamese cnc.*
```

### 🔲 Pending Files

**Phase 5 — Frontend Monitoring (4 files)**
```
apps/web/src/app/(app)/cnc/monitoring/page.tsx
apps/web/src/app/(app)/cnc/monitoring/_components/cnc-monitoring-dashboard.tsx
apps/web/src/app/(app)/cnc/machines/[id]/page.tsx
apps/web/src/app/(app)/cnc/machines/[id]/_components/cnc-machine-detail.tsx
```

**Phase 6 — Frontend Gantt (2+ files)**
```
apps/web/src/app/(app)/cnc/planning/page.tsx
apps/web/src/app/(app)/cnc/planning/_components/cnc-gantt-chart.tsx
```

**Phase 7 — Polish (1 file)**
```
apps/api/src/modules/cnc/cnc-scheduler.service.ts  ← @Cron nightly archive
```

---

## Verification Plan

### Backend (Phases 1–3)
1. `npx tsc --noEmit` in `apps/api` → 0 errors ✅
2. Start API → no module resolution errors
3. Swagger at `http://localhost:3001/api/docs` → CNC endpoint groups visible
4. Create machine → list machines → update status → verify WS event fires
5. Create schedule → publish → add entry → advance PENDING→SETUP→RUNNING → verify machine `currentStatus` updated
6. Log production → verify `cnc:production-logged` WS event + KPI summary updated
7. Raise downtime → machine → ERROR → resolve → machine → IDLE, `durationMinutes` computed correctly

### Frontend (Phase 4)
1. `npx tsc --noEmit` in `apps/web` → 0 errors ✅
2. Navigate to `/cnc/machines` → table renders (empty state OK)
3. Click "New Machine" → fill form → submit → redirects to list
4. Sidebar shows "CNC" group with "CNC Machines" and "Live Monitoring" links
