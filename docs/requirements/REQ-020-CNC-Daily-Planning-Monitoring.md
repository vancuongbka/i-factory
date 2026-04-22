---
id: REQ-020-CNC-Daily-Planning-Monitoring
title: CNC Daily Planning & Real-time Monitoring
status: draft
priority: high
tags: [cnc, scheduling, gantt, real-time, monitoring, production-planning, websocket, machine-status]
source_files: []
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
related_requirements:
  - PROD-001  # Production Order Management
  - WO-001    # Work Order Retrieval
  - WO-004    # Work Order Status Lifecycle
  - MDM-005   # Machine Asset Registry
  - MDM-007   # Manufacturing Routing Definition
---

## 1. Module Overview

The CNC Daily Planning & Real-time Monitoring module provides shop-floor supervisors, CNC operators, and factory managers with a unified workspace for scheduling CNC machine time within a single factory day, allocating resources (parts, operators, tooling), and monitoring live production progress against the plan. It bridges the gap between the planned work order schedule (created in PROD-001 / WO-series) and actual shop-floor execution, surfacing deviations — machine downtime, scrapped pieces, setup overruns — in real time via WebSocket events.

The module introduces four new backend entities: `CncMachine`, `DailySchedule`, `ScheduleEntry`, and `ProductionLog`, all scoped to `factoryId`. It integrates with the existing `WorkOrder`, `ProductionOrder`, and `Machine` entities without modifying their schemas.

---

## 2. User Personas

### 2.1 Production Planner (`PRODUCTION_MANAGER` role)

**Goals**: Build the daily CNC schedule before each shift. Assign work orders to specific machines, set planned cycle counts, and resolve scheduling conflicts before production begins.

**Pain points**: Manual spreadsheet scheduling with no conflict detection. No visibility into current machine availability or operator leave.

**Key actions**:
- Create and publish a daily `DailySchedule` for a target date.
- Drag-and-drop `ScheduleEntry` blocks on the Gantt timeline.
- Adjust entry order and duration when machine downtime is reported.
- Export the finalized schedule as PDF/CSV.

### 2.2 CNC Operator (`OPERATOR` role)

**Goals**: Know exactly what to produce, on which machine, in which order. Log completed unit counts and report machine errors without leaving the shop floor.

**Pain points**: Paper-based job cards with outdated quantities. No easy way to signal a machine fault to the planner.

**Key actions**:
- View their personal queue — only entries assigned to their operator ID.
- Tap to mark a `ScheduleEntry` as **Setup** → **Running** → **Completed**.
- Log completed unit count at the end of each entry.
- Raise a `MachineDowntime` event (fault code + description) without needing supervisor access.

### 2.3 Factory Manager (`FACTORY_ADMIN` role)

**Goals**: Track factory-wide OEE (Overall Equipment Effectiveness) and identify bottlenecks across all machines for the current day and rolling 7-day window.

**Pain points**: No consolidated view of planned vs. actual throughput. Machine utilisation data lives in disparate systems.

**Key actions**:
- View the live dashboard — all machines, current status, today's OEE.
- Drill into any machine to see its timeline and production log.
- Acknowledge downtime events and record corrective actions.
- View trend charts: units/hour, downtime frequency, setup-to-run ratio.

---

## 3. Functional Requirements

### 3.1 Daily Schedule Management

| ID | Requirement | Priority |
|----|-------------|----------|
| CNC-FR-001 | A `DailySchedule` record can be created for a specific `factoryId` and `scheduleDate` (date only, no time component). Only one active schedule may exist per factory per day. | High |
| CNC-FR-002 | A schedule has a lifecycle: `DRAFT → PUBLISHED → IN_PROGRESS → COMPLETED → ARCHIVED`. Operators can only see entries from `PUBLISHED` schedules. | High |
| CNC-FR-003 | A `ScheduleEntry` can be added to a schedule, linking a `WorkOrder`, a `CncMachine`, a planned operator (`userId`), and a planned time window (`plannedStart`, `plannedEnd` as ISO datetime). | High |
| CNC-FR-004 | The planned cycle time per entry defaults to the routing operation `cycleTimeSeconds` on the linked work order step; planners may override it manually. | Medium |
| CNC-FR-005 | Conflict detection: the system must reject (HTTP 409) any `ScheduleEntry` whose `plannedStart`–`plannedEnd` window overlaps an existing active entry on the same machine within the same schedule. | High |
| CNC-FR-006 | Schedule entries can be reordered via a `PATCH /schedule-entries/:id` call that accepts a `sortOrder` integer; the backend recalculates `plannedStart`/`plannedEnd` for all entries on the same machine in sort order. | Medium |
| CNC-FR-007 | Publishing a schedule (`POST /daily-schedules/:id/publish`) is restricted to `PRODUCTION_MANAGER`, `FACTORY_ADMIN`, and `SUPER_ADMIN`. Once published, no new entries may be added; only status updates are allowed. | High |
| CNC-FR-008 | Archiving a schedule is triggered automatically at midnight (factory timezone) if its date has passed and status is not already `ARCHIVED`. A BullMQ scheduled job performs this. | Low |

### 3.2 Resource Allocation

| ID | Requirement | Priority |
|----|-------------|----------|
| CNC-FR-009 | Each `ScheduleEntry` records: assigned `CncMachine` (FK), assigned `userId` (operator), linked `WorkOrder` (FK), linked `ProductionOrder` (FK, via work order), planned unit quantity (`plannedQty`), planned setup time in minutes (`plannedSetupMinutes`), and planned cycle time per unit in seconds (`plannedCycleSeconds`). | High |
| CNC-FR-010 | Tooling / fixture requirements are stored as a JSONB array `toolingRequirements[]` on `ScheduleEntry`. Each item: `{ toolCode: string, description: string, requiredQty: number }`. | Medium |
| CNC-FR-011 | Operator availability: the system exposes a `GET /factories/:fid/cnc/operator-availability?date=YYYY-MM-DD` endpoint that returns all users with `OPERATOR` role for the factory. Availability status (Available / On Leave) is set manually by planners; no integration with an HR system is required in this phase. | Medium |
| CNC-FR-012 | Machine availability: the `GET /factories/:fid/cnc-machines/availability?date=YYYY-MM-DD` endpoint returns each machine's committed hours for the specified date, derived by summing `plannedEnd - plannedStart` across published schedule entries. | High |

### 3.3 Real-time Progress Monitoring

| ID | Requirement | Priority |
|----|-------------|----------|
| CNC-FR-013 | An operator can transition a `ScheduleEntry` through statuses: `PENDING → SETUP → RUNNING → PAUSED → COMPLETED`. Status `ERROR` is set when a `MachineDowntime` event is raised. Only the assigned operator or a planner-level role may advance the status. | High |
| CNC-FR-014 | Actual timestamps are recorded automatically: `actualSetupStart` (on transition to `SETUP`), `actualRunStart` (on transition to `RUNNING`), `actualEnd` (on transition to `COMPLETED`). | High |
| CNC-FR-015 | Operators log completed unit counts by submitting a `ProductionLog` entry: `{ scheduleEntryId, loggedAt, completedQty, scrapQty, operatorNotes }`. Cumulative `completedQty` across all logs for an entry is used to compute the progress percentage. | High |
| CNC-FR-016 | Progress percentage = `floor(SUM(completedQty) / plannedQty * 100)`, capped at 100. This is a computed value returned by the API — not stored in the database. | High |
| CNC-FR-017 | A `MachineDowntime` event can be raised by any user with `OPERATOR` or higher role: `{ cncMachineId, scheduleEntryId (optional), startedAt, faultCode, description }`. Raising a downtime event sets the referenced `ScheduleEntry` status to `ERROR` and the `CncMachine.currentStatus` to `ERROR`. | High |
| CNC-FR-018 | A downtime event is resolved by a `PRODUCTION_MANAGER` or higher: `PATCH /machine-downtime/:id/resolve` with `{ resolvedAt, rootCause, correctiveAction }`. Resolving restores `CncMachine.currentStatus` to `IDLE`. | High |
| CNC-FR-019 | Every status change on a `ScheduleEntry` or `CncMachine` broadcasts a WebSocket event to the factory room. Event naming follows the project convention: `cnc:entry-status-changed`, `cnc:machine-status-changed`, `cnc:log-added`, `cnc:downtime-raised`, `cnc:downtime-resolved`. | High |

### 3.4 Interactive Gantt / Timeline View (Frontend)

| ID | Requirement | Priority |
|----|-------------|----------|
| CNC-FR-020 | The planning page (`/cnc/planning`) displays a horizontal Gantt chart scoped to the selected factory and date. The Y-axis lists all active CNC machines; the X-axis covers 00:00–23:59 in the factory timezone. Each `ScheduleEntry` renders as a coloured block within its machine row. | High |
| CNC-FR-021 | Block colours map to entry status: `PENDING` = grey, `SETUP` = amber, `RUNNING` = green, `PAUSED` = yellow, `COMPLETED` = blue, `ERROR` = red. | High |
| CNC-FR-022 | Clicking a Gantt block opens a side panel showing entry details: work order number, part name, planned vs. actual times, assigned operator, tooling requirements, and cumulative production log entries. | High |
| CNC-FR-023 | Drag-and-drop on the Gantt chart repositions an entry (`DRAFT` or `PUBLISHED` schedule only). Dropping triggers the conflict detection check (CNC-FR-005) before persisting. If a conflict is detected, the block snaps back and an error toast is shown. | Medium |
| CNC-FR-024 | A date-picker and factory selector in the page header allow navigating between days and factories. The Gantt view re-fetches data via TanStack Query on date/factory change. | High |
| CNC-FR-025 | A read-only "Monitoring" toggle switches the same page to live mode: auto-refreshes every 10 seconds via WebSocket subscription. In monitoring mode, drag-and-drop is disabled. | High |

### 3.5 Live Machine Status Dashboard (Frontend)

| ID | Requirement | Priority |
|----|-------------|----------|
| CNC-FR-026 | The monitoring page (`/cnc/monitoring`) shows a card grid — one card per CNC machine in the factory. Each card displays: machine code, machine name, current status badge, current entry's part name, and today's progress % for the running entry. | High |
| CNC-FR-027 | Machine status badge colours: `RUNNING` = green, `IDLE` = grey, `SETUP` = amber, `ERROR` = red, `MAINTENANCE` = blue. | High |
| CNC-FR-028 | Cards update in real time via the `cnc:machine-status-changed` WebSocket event — no polling required. | High |
| CNC-FR-029 | Clicking a machine card navigates to `/cnc/machines/:id` — a detail page showing the machine's Gantt row for today, full production log, and open downtime events. | Medium |
| CNC-FR-030 | A summary bar at the top of `/cnc/monitoring` shows factory-level KPIs for today: total machines, currently running count, idle count, error count, and overall factory progress % (sum completedQty / sum plannedQty across all entries in today's published schedule). | High |

---

## 4. Data Entities

### 4.1 `CncMachine`

Extends the existing `Machine` entity concept from MDM-005 with CNC-specific operational fields. Stored in table `cnc_machines`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `factoryId` | uuid | FK → `factories.id`, NOT NULL, indexed | Tenant scope |
| `machineId` | uuid | FK → `machines.id`, nullable | Optional link to MDM machine asset |
| `code` | varchar(50) | NOT NULL, UNIQUE (factoryId, code) | Shop-floor identifier e.g. `CNC-01` |
| `name` | varchar(200) | NOT NULL | Display name |
| `model` | varchar(100) | nullable | Manufacturer model designation |
| `maxSpindleRpm` | integer | nullable | Capacity metadata |
| `numberOfAxes` | integer | nullable | e.g. 3, 4, 5 |
| `currentStatus` | enum | NOT NULL, default `IDLE` | `RUNNING`, `IDLE`, `SETUP`, `ERROR`, `MAINTENANCE` |
| `currentScheduleEntryId` | uuid | FK → `schedule_entries.id`, nullable | Live: which entry is running now |
| `lastStatusChangedAt` | timestamptz | nullable | For OEE calculations |
| `customFields` | jsonb | nullable | Factory-specific metadata |
| `createdAt` | timestamptz | NOT NULL, default `now()` | |
| `updatedAt` | timestamptz | NOT NULL | |
| `deletedAt` | timestamptz | nullable | Soft-delete |

### 4.2 `DailySchedule`

One schedule per factory per day. Stored in table `daily_schedules`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `factoryId` | uuid | FK → `factories.id`, NOT NULL, indexed | |
| `scheduleDate` | date | NOT NULL | Date in factory timezone, UNIQUE with factoryId |
| `status` | enum | NOT NULL, default `DRAFT` | `DRAFT`, `PUBLISHED`, `IN_PROGRESS`, `COMPLETED`, `ARCHIVED` |
| `shiftCount` | smallint | NOT NULL, default 1 | Number of shifts covered (1–3) |
| `shift1Start` | time | nullable | e.g. `06:00` |
| `shift2Start` | time | nullable | e.g. `14:00` |
| `shift3Start` | time | nullable | e.g. `22:00` |
| `notes` | text | nullable | Planner notes |
| `publishedAt` | timestamptz | nullable | Set when status → PUBLISHED |
| `publishedBy` | uuid | FK → `users.id`, nullable | |
| `createdBy` | uuid | FK → `users.id`, NOT NULL | |
| `createdAt` | timestamptz | NOT NULL, default `now()` | |
| `updatedAt` | timestamptz | NOT NULL | |
| `deletedAt` | timestamptz | nullable | Soft-delete |

### 4.3 `ScheduleEntry`

A single machine–work-order block within a day's schedule. Stored in table `schedule_entries`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `dailyScheduleId` | uuid | FK → `daily_schedules.id`, NOT NULL, indexed | Parent schedule |
| `factoryId` | uuid | FK → `factories.id`, NOT NULL, indexed | Denormalised for fast queries |
| `cncMachineId` | uuid | FK → `cnc_machines.id`, NOT NULL | Target machine |
| `workOrderId` | uuid | FK → `work_orders.id`, NOT NULL | Linked work order |
| `productionOrderId` | uuid | FK → `production_orders.id`, NOT NULL | Denormalised from work order |
| `assignedOperatorId` | uuid | FK → `users.id`, nullable | Assigned CNC operator |
| `sortOrder` | integer | NOT NULL, default 0 | Position in machine's daily queue |
| `status` | enum | NOT NULL, default `PENDING` | `PENDING`, `SETUP`, `RUNNING`, `PAUSED`, `COMPLETED`, `ERROR` |
| `plannedStart` | timestamptz | NOT NULL | Planned start datetime |
| `plannedEnd` | timestamptz | NOT NULL | Planned end datetime |
| `plannedQty` | integer | NOT NULL | Units to produce |
| `plannedSetupMinutes` | integer | NOT NULL, default 0 | Expected setup duration |
| `plannedCycleSeconds` | integer | NOT NULL | Cycle time per unit (seconds) |
| `actualSetupStart` | timestamptz | nullable | Auto-set on SETUP transition |
| `actualRunStart` | timestamptz | nullable | Auto-set on RUNNING transition |
| `actualEnd` | timestamptz | nullable | Auto-set on COMPLETED transition |
| `toolingRequirements` | jsonb | nullable | `[{ toolCode, description, requiredQty }]` |
| `partName` | varchar(200) | NOT NULL | Denormalised from work order for display |
| `notes` | text | nullable | |
| `createdAt` | timestamptz | NOT NULL, default `now()` | |
| `updatedAt` | timestamptz | NOT NULL | |
| `deletedAt` | timestamptz | nullable | Soft-delete |

**Indexes**: composite index on `(dailyScheduleId, cncMachineId, status)` for Gantt queries; index on `(factoryId, plannedStart)` for monitoring queries.

### 4.4 `ProductionLog`

Immutable unit-completion records submitted by operators during a running entry. Stored in table `production_logs`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `scheduleEntryId` | uuid | FK → `schedule_entries.id`, NOT NULL, indexed | |
| `factoryId` | uuid | FK → `factories.id`, NOT NULL, indexed | Denormalised |
| `cncMachineId` | uuid | FK → `cnc_machines.id`, NOT NULL | Denormalised for machine-level reporting |
| `operatorId` | uuid | FK → `users.id`, NOT NULL | The user who submitted this log |
| `loggedAt` | timestamptz | NOT NULL, default `now()` | |
| `completedQty` | integer | NOT NULL, CHECK > 0 | Good units produced in this log |
| `scrapQty` | integer | NOT NULL, default 0, CHECK >= 0 | Rejected / scrapped units |
| `cycleTimeActualSeconds` | integer | nullable | Measured cycle time for this batch |
| `operatorNotes` | text | nullable | |

**Note**: `ProductionLog` is append-only. No update or delete endpoint is exposed. Corrections are made via a new log entry with negative `completedQty` is **not** supported — instead a supervisor submits an `ADJUSTMENT` log type (future extension).

### 4.5 `MachineDowntime`

Fault events that interrupt schedule entries. Stored in table `machine_downtime`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK | |
| `factoryId` | uuid | FK → `factories.id`, NOT NULL, indexed | |
| `cncMachineId` | uuid | FK → `cnc_machines.id`, NOT NULL, indexed | |
| `scheduleEntryId` | uuid | FK → `schedule_entries.id`, nullable | Entry that was interrupted |
| `raisedBy` | uuid | FK → `users.id`, NOT NULL | Who raised the event |
| `startedAt` | timestamptz | NOT NULL | When machine stopped |
| `resolvedAt` | timestamptz | nullable | Set on resolution |
| `resolvedBy` | uuid | FK → `users.id`, nullable | |
| `faultCode` | varchar(50) | NOT NULL | Structured code e.g. `SPINDLE_OVERHEAT` |
| `description` | text | NOT NULL | Free-text description |
| `rootCause` | text | nullable | Filled on resolution |
| `correctiveAction` | text | nullable | Filled on resolution |
| `durationMinutes` | integer | nullable | Computed on resolution: `resolvedAt - startedAt` |

---

## 5. Business Rules

### 5.1 Machine Downtime Handling

**BR-001 — Automatic entry pause on downtime**: When a `MachineDowntime` event is raised against a machine that has a `ScheduleEntry` in `RUNNING` or `SETUP` status, the entry status is automatically set to `ERROR` and `CncMachine.currentStatus` is set to `ERROR`. No manual status change is needed.

**BR-002 — Downtime duration propagation**: On downtime resolution, the backend calculates `durationMinutes` and appends it to the `ScheduleEntry.notes` as a structured annotation: `[DOWNTIME: {durationMinutes}m — {faultCode}]`. The planner must manually extend `plannedEnd` of affected entries; automatic rescheduling is not performed in this phase.

**BR-003 — Overlapping downtime events**: A machine may not have two unresolved `MachineDowntime` events simultaneously. Attempting to raise a second fault while one is open returns HTTP 409.

**BR-004 — Downtime in COMPLETED entry**: Raising a downtime event against a machine whose current entry is already `COMPLETED` does not change the entry status. The downtime event is recorded against the machine but `scheduleEntryId` is set to null.

### 5.2 Shift Transitions

**BR-005 — Entries spanning shift boundaries**: A `ScheduleEntry` may span two shift boundaries (e.g., 13:30–14:30 spans shift 1 and shift 2). No validation prevents this. The planner is responsible for assigning the correct operator for each shift. The UI highlights entries that span a shift boundary with a dashed border.

**BR-006 — End-of-shift auto-pause**: If a `ScheduleEntry` remains in `RUNNING` status at the shift boundary time defined in `DailySchedule.shift2Start` or `shift3Start`, the system transitions its status to `PAUSED` via a BullMQ cron job that fires at each defined shift boundary. The assigned operator for the next shift must explicitly resume (`RUNNING`) the entry.

**BR-007 — Cross-midnight entries not allowed**: `plannedEnd` must be on the same calendar date as `plannedStart` (factory timezone). An entry may not cross midnight. This is validated at the API level (HTTP 422 if violated).

### 5.3 Schedule Conflict Resolution

**BR-008 — Conflict definition**: A scheduling conflict exists when two `ScheduleEntry` records for the same `cncMachineId` within the same `dailyScheduleId` have overlapping `[plannedStart, plannedEnd)` intervals.

**BR-009 — Conflict detection on create and update**: Both `POST /schedule-entries` and `PATCH /schedule-entries/:id` (when modifying `plannedStart`, `plannedEnd`, or `cncMachineId`) run the overlap check before persisting. The check uses a half-open interval comparison: `newStart < existingEnd AND newEnd > existingStart`.

**BR-010 — Conflict resolution strategies**: The system does not auto-resolve conflicts. The planner must either (a) shorten the conflicting entry, (b) move it to another machine, or (c) shift its time window. The API surfaces conflict details in the 409 response body: `{ conflictingEntryId, conflictingEntryWorkOrderCode, overlapStartsAt, overlapEndsAt }`.

**BR-011 — Operator double-booking warning**: Assigning the same operator to two overlapping entries is a soft warning (HTTP 200 with a `warnings[]` array in the response), not a hard error. This is intentional: operators can supervise two machines simultaneously in some configurations.

### 5.4 Progress and OEE Calculation

**BR-012 — Progress capped at 100%**: If `SUM(completedQty) > plannedQty` (operator over-produced), progress is shown as 100% and an `overrun` flag is set to true in the API response. The extra quantity is recorded in the logs and visible in the detail view.

**BR-013 — OEE components** (available date: future phase): Availability = `actualRunTime / plannedRunTime`, Performance = `(completedQty × theoreticalCycleTime) / actualRunTime`, Quality = `completedQty / (completedQty + scrapQty)`. OEE = Availability × Performance × Quality. These are computed on demand by the reporting endpoint and not stored.

**BR-014 — Completed entry is immutable**: Once a `ScheduleEntry` reaches `COMPLETED`, its status cannot be reverted. Additional `ProductionLog` entries may still be submitted (for late scrap reporting) but new status transitions are blocked (HTTP 409).

### 5.5 Access Control

**BR-015 — Write access by role**:
| Action | Minimum Role |
|--------|-------------|
| Create / update / delete `DailySchedule` | `PRODUCTION_MANAGER` |
| Publish schedule | `PRODUCTION_MANAGER` |
| Add / remove `ScheduleEntry` on DRAFT schedule | `PRODUCTION_MANAGER` |
| Advance `ScheduleEntry` status | Assigned operator (`OPERATOR`) OR `PRODUCTION_MANAGER`+ |
| Submit `ProductionLog` | `OPERATOR` (only assigned operator) OR `PRODUCTION_MANAGER`+ |
| Raise `MachineDowntime` | `OPERATOR`+ |
| Resolve `MachineDowntime` | `PRODUCTION_MANAGER`+ |
| View all schedules and logs | `VIEWER`+ |

**BR-016 — Operator log submission restriction**: An `OPERATOR`-role user may only submit `ProductionLog` entries for `ScheduleEntry` records assigned to their `userId`. Attempting to log for another operator's entry returns HTTP 403.

---

## 6. API Endpoints

### Backend routes (all prefixed `/factories/:factoryId`)

```
# Daily Schedules
GET    /cnc/daily-schedules?date=YYYY-MM-DD        # list (filter by date, status)
POST   /cnc/daily-schedules                         # create
GET    /cnc/daily-schedules/:id                     # detail with entries
PATCH  /cnc/daily-schedules/:id                     # update (DRAFT only)
POST   /cnc/daily-schedules/:id/publish             # publish
DELETE /cnc/daily-schedules/:id                     # soft-delete (DRAFT only)

# Schedule Entries
POST   /cnc/schedule-entries                        # create entry (conflict check)
PATCH  /cnc/schedule-entries/:id                    # update (time, operator, tooling)
PATCH  /cnc/schedule-entries/:id/status             # advance status
DELETE /cnc/schedule-entries/:id                    # soft-delete (DRAFT schedule only)

# Production Logs
POST   /cnc/production-logs                         # submit log entry
GET    /cnc/production-logs?scheduleEntryId=&date=  # retrieve logs

# Machine Downtime
POST   /cnc/machine-downtime                        # raise event
PATCH  /cnc/machine-downtime/:id/resolve            # resolve event
GET    /cnc/machine-downtime?machineId=&resolved=   # list events

# CNC Machines
GET    /cnc/cnc-machines                            # list with currentStatus
POST   /cnc/cnc-machines                            # create
PATCH  /cnc/cnc-machines/:id                        # update
DELETE /cnc/cnc-machines/:id                        # soft-delete
GET    /cnc/cnc-machines/availability?date=         # availability summary

# Operator Availability
GET    /cnc/operator-availability?date=             # list operators + availability flags
PATCH  /cnc/operator-availability/:userId           # set availability for date
```

### WebSocket events (emitted to factory room `factory:{factoryId}`)

| Event | Payload | Trigger |
|-------|---------|---------|
| `cnc:schedule-published` | `{ scheduleId, scheduleDate }` | Schedule published |
| `cnc:entry-status-changed` | `{ entryId, machineId, oldStatus, newStatus, updatedAt }` | Entry status transition |
| `cnc:log-added` | `{ entryId, machineId, completedQty, scrapQty, cumulativeQty, progressPct }` | ProductionLog created |
| `cnc:machine-status-changed` | `{ machineId, machineCode, oldStatus, newStatus, updatedAt }` | Machine status change |
| `cnc:downtime-raised` | `{ machineId, machineCode, downtimeId, faultCode, startedAt }` | Downtime event raised |
| `cnc:downtime-resolved` | `{ machineId, machineCode, downtimeId, durationMinutes, resolvedAt }` | Downtime resolved |

---

## 7. Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/cnc/planning` | `CncPlanningPage` | Gantt editor — create and manage the daily schedule |
| `/cnc/monitoring` | `CncMonitoringPage` | Live machine card grid dashboard |
| `/cnc/machines` | `CncMachineListPage` | Machine registry CRUD |
| `/cnc/machines/:id` | `CncMachineDetailPage` | Single machine timeline + production log + downtime history |
| `/cnc/planning/:scheduleId` | `ScheduleDetailPage` | Full Gantt for a specific published schedule (read-only for operators) |

### Key frontend hooks (TanStack Query)

```ts
useDailySchedule(factoryId, date)          // GET daily schedule + entries for date
useScheduleEntries(scheduleId)             // entries list with real-time WS merge
useCncMachines(factoryId)                  // machine list with live status
useProductionLogs(scheduleEntryId)         // logs for one entry
useMachineDowntime(factoryId, { resolved }) // open/resolved downtime events
usePublishSchedule()                        // mutation: publish
useAdvanceEntryStatus()                    // mutation: status transition
useSubmitProductionLog()                   // mutation: log units
useRaiseDowntime()                         // mutation: raise fault
useResolveDowntime()                       // mutation: resolve fault
```

---

## 8. Acceptance Criteria

### Schedule creation & conflict detection
- [ ] A planner can create a `DailySchedule` for today with `status = DRAFT`.
- [ ] Adding a `ScheduleEntry` that overlaps an existing entry on the same machine returns HTTP 409 with conflict details.
- [ ] Dragging an entry to a conflicting time slot on the Gantt reverts the drag and shows an error toast.
- [ ] Publishing a DRAFT schedule sets `status = PUBLISHED` and emits `cnc:schedule-published`.

### Operator workflow
- [ ] An operator sees only schedule entries assigned to their userId on the monitoring page.
- [ ] Transitioning to `SETUP` auto-sets `actualSetupStart`; `RUNNING` sets `actualRunStart`; `COMPLETED` sets `actualEnd`.
- [ ] Submitting a `ProductionLog` with `completedQty = 5, scrapQty = 1` increases the entry's progress by 5 units.
- [ ] An operator cannot submit a log for an entry they are not assigned to (HTTP 403).

### Machine downtime
- [ ] Raising a downtime event on a `RUNNING` entry transitions the entry to `ERROR` and the machine to `ERROR`.
- [ ] A second unresolved downtime event on the same machine is rejected with HTTP 409.
- [ ] Resolving a downtime event sets `resolvedAt`, computes `durationMinutes`, and emits `cnc:downtime-resolved`.
- [ ] After resolution, `CncMachine.currentStatus` reverts to `IDLE`.

### Real-time updates
- [ ] The monitoring dashboard updates machine status cards in < 500 ms of the underlying status change.
- [ ] The Gantt view reflects a new `ProductionLog` entry within 1 second when in live monitoring mode.
- [ ] Factory-scoped WebSocket isolation: events from factory A are not received by a client subscribed to factory B.

### Shift transitions
- [ ] A running entry spanning shift 1 → shift 2 is automatically paused at `shift2Start` by the BullMQ job.
- [ ] An entry with `plannedEnd` past midnight is rejected with HTTP 422.

---

## 9. Open Questions

1. **Gantt library choice**: The React ecosystem offers several Gantt/timeline libraries (DHTMLX, react-gantt-task, Frappe Gantt, custom SVG). The team must decide whether to use an off-the-shelf library or build a lightweight custom component. The custom approach gives full control over the drag-and-drop conflict logic but carries a significant build cost.

2. **CNC vs generic machines**: This SRS scopes the module to CNC machines specifically, but the data model is generic enough to apply to any machine type. Should `CncMachine` be renamed to `SchedulableMachine` to allow future extension to assembly or inspection stations?

3. **ProductionLog correction mechanism**: Currently, once a log is submitted it is immutable. Operators will inevitably record wrong quantities. A supervisor-only `ADJUSTMENT` log type or a soft-delete + resubmit mechanism is needed — the approach must be defined before implementation.

4. **OEE storage vs. computation**: Computing OEE on the fly for reports over large date ranges will be slow. A materialised daily OEE summary per machine (refreshed by a BullMQ job at end-of-day archive) is likely needed. This should be planned now to avoid schema changes later.

5. **Tooling / fixture inventory link**: `toolingRequirements` is a JSONB array today. If tooling is subject to inventory control (tracked stock), it should reference the `materials` table. Is tooling within scope of inventory tracking for this phase?

6. **Shift-boundary pause job reliability**: The BullMQ cron job that pauses running entries at shift boundaries must be idempotent and handle the case where the scheduler pod is down at the boundary time. A delayed job triggered at schedule-publish time (one job per shift boundary per machine) is more reliable than a system-wide cron scan.

7. **Mobile / operator terminal**: The operator workflow (status transitions, production log submission) should be accessible on a tablet or kiosk. Should the frontend be responsive-first for `/cnc/monitoring` and the entry status update flow, or is a dedicated mobile route (`/cnc/operator`) needed?

8. **Historical schedule reporting**: Can a Factory Manager retrieve and compare schedules from previous weeks (planned vs. actual throughput, OEE trend)? The `ARCHIVED` status preserves records but no reporting endpoint has been defined. Clarify scope before sprint planning.

---

## 10. Context for Claude

- **Stack**: NestJS 10, TypeORM, PostgreSQL, BullMQ (Redis), Socket.io, Next.js 15 App Router, TanStack Query 5, Tailwind CSS, Zod, next-intl.
- **Guard chain**: `JwtAuthGuard → RolesGuard → FactoryAccessGuard` on all endpoints.
- **New entities**: `cnc_machines`, `daily_schedules`, `schedule_entries`, `production_logs`, `machine_downtime` — all require TypeORM migrations.
- **WebSocket room**: events emitted to `factory:{factoryId}` (existing pattern from `modules/notifications`).
- **BullMQ queues to add**: `cnc-shift-transitions` (cron), `cnc-schedule-archive` (cron).
- **Frontend module path**: `apps/web/src/app/(app)/cnc/`.
- **Backend module path**: `apps/api/src/modules/cnc/`.
- **Shared Zod schemas**: add to `packages/api-types/src/schemas/cnc.schema.ts`; enums to `packages/api-types/src/enums/`.
- **i18n namespace**: `cnc` — keys for machine statuses, entry statuses, fault codes, form labels.
- **Related modules**: integrates with `modules/work-orders` (reads work orders), `modules/production` (reads production orders), `modules/master-data/work-centers` (reads machine assets), `modules/notifications` (emits downtime notification to factory manager).
