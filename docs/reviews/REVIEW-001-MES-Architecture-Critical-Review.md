---
id: REVIEW-001-MES-Architecture-Critical-Review
title: i-factory MES — Critical Architecture & Requirements Review
reviewer: Senior Solutions Architect (Smart Manufacturing / ISA-95)
review_date: 2026-04-29
scope:
  - docs/requirements/_index.md
  - docs/requirements/REQ-005-MDM-Machine-Asset-Registry.md
  - docs/requirements/REQ-012-PROD-Production-Order-Management.md
  - docs/requirements/REQ-018-WO-Work-Order-Status-Lifecycle.md
  - docs/requirements/REQ-020-CNC-Daily-Planning-Monitoring.md
focus: [business-logic, edge-cases, oee-integrity, scalability, isa-95]
---

# i-factory — Critical Review

Findings below are grounded in the reviewed requirement documents. Where requirements explicitly leave gaps (their own "Open Questions" sections), this review escalates them to severity. Where shop-floor reality will diverge from the spec, edge cases are listed concretely.

---

## 1. Critical Vulnerabilities

### 1.1 No state machine on order/lifecycle status fields (multiple modules)
REQ-012 §47-49 and REQ-018 §41-43 admit it: any status can be PATCHed to any other value. `COMPLETED → DRAFT`, `CANCELLED → IN_PROGRESS` are wide open. In a regulated MES this is a **data integrity defect**, not a "future enhancement" — a single buggy frontend call corrupts an audit trail you legally cannot reconstruct.

> **Fix priority: P0.** Server-side guard with declarative transitions (XState, or a `WorkflowGuard` that loads `{from: [...], to: [...]}` rules per entity) — not ad-hoc `if` blocks scattered through services.

### 1.2 BOM versioning without snapshot binding
REQ-012 stores `bomId` as a plain UUID. REQ-021/024 confirm BOMs have revisions, but nothing in the production-order schema **freezes** which BOM revision was authoritative when the order was opened. If someone edits BOM v1.0 after the order is `IN_PROGRESS`, you've silently changed historical truth. The "BOM revision history snapshot" (REQ-024) exists at the BOM table level but the order doesn't pin a `bomRevisionId`.

> **Fix priority: P0.** `ProductionOrder.bomRevisionId` (FK, NOT NULL once status ≥ PLANNED) + JSONB embedded snapshot of resolved line items at confirmation. ISA-95 calls this the *Operations Definition* — it must be immutable per execution instance.

### 1.3 The `notes` silent-drop bug (REQ-012 §50)
Zod accepts `notes`, the entity has no column. Data loss is happening every API call. This is a regression test trigger, not just a TODO.

### 1.4 Inventory consumption is not coupled to production
REQ-035 lists movement types (`ISSUE`, `SCRAP`) but no requirement says "completing a work order step debits the BOM-defined materials from inventory." There is no **backflushing** logic, no WIP (Work-In-Progress) bucket, no reserved-stock model. A production order can run to `COMPLETED` while warehouse stock remains untouched — inventory becomes fiction.

> **Fix priority: P0.** Define material reservation at order confirmation, issue-on-pick or issue-on-step-complete (auto-backflush), and explicit WIP location movements. `ProductionLog.completedQty` should trigger a `StockMovement` saga.

### 1.5 No genealogy / lot traceability
REQ-035's "reference traceability" only links movements to source documents, not parent→child material genealogy. ISA-95 / IATF 16949 / FDA 21 CFR Part 11 all demand: *"Given finished serial X, list every input lot and operator action."* Your model cannot answer this. There is no `Lot` or `SerialUnit` entity, no parent-lot linkage on `ProductionLog`.

> **Fix priority: P1 now, P0 if any customer is in automotive/medical/food.**

### 1.6 OEE definitions in BR-013 are not "robust enough for high-precision manufacturing"
Quoting REQ-020:
- `Availability = actualRunTime / plannedRunTime` — **wrong denominator.** SEMI E10 / ISA-95 convention is `Run Time / Planned Production Time`, where Planned Production Time = scheduled time − planned stops (lunch, planned maintenance). Your formula will look great when you schedule less.
- `Performance = (completedQty × theoreticalCycleTime) / actualRunTime` — silently includes scrap units in the numerator (since `completedQty` is "good units" per BR-012). Industry definition uses **Total Count** (good + scrap). You'll under-report performance and double-penalize on the Quality factor.
- `Quality = completedQty / (completedQty + scrapQty)` — this is **First-Pass Yield**, not Quality. Rework units are invisible. Mixing FPY into OEE produces an unaudited number.
- **Setup time is undefined.** SEMI E10 treats it as scheduled downtime; many factories treat it as availability loss. The spec doesn't pick a side, so OEE will be inconsistent across shifts.

> **Fix priority: P0 before any customer demos OEE.** Pin the standard you're conforming to (recommend SEMI E10 + Nakajima's classic six losses) and document it in the requirement.

### 1.7 WebSocket emits happen in-process (no outbox)
REQ-013 / CNC-FR-019 imply emit happens during the request handler. If the DB commit succeeds and the gateway throws (or the pod crashes between commit and emit), the event is lost forever and clients diverge. Repeated for every `cnc:*`, `production:*`, `notification:created`.

> **Fix priority: P1.** Transactional outbox pattern: write events to a `domain_events` table inside the same TX, a worker drains it. Pairs naturally with BullMQ.

### 1.8 No idempotency on operator-driven mutations
`POST /cnc/production-logs`, `POST /cnc/machine-downtime`, `PATCH .../status` will all double-execute on a flaky tablet network if the operator double-taps. With `completedQty` accumulating into OEE and inventory, this is a silent reliability bug.

> **Fix priority: P1.** `Idempotency-Key` header → unique index. Standard pattern.

### 1.9 No token revocation (Open Question #10 in `_index.md`)
A deactivated user keeps a valid 15-minute access token. For SUPER_ADMIN role downgrades or terminations this is a compliance issue, not a UX issue.

---

## 2. Edge Case Scenarios

| # | Scenario | What breaks today |
|---|----------|-------------------|
| E1 | **Cross-midnight production runs (24/7 lines)** | BR-007 outright forbids `plannedEnd` past midnight. Continuous-process factories cannot use the system. |
| E2 | **DST transitions** | `scheduleDate` is a `date` (no TZ); `plannedStart`/`plannedEnd` are `timestamptz`. On the spring-forward day, a 7am–3pm shift loses an hour and shift-boundary cron fires at the wrong wall-clock moment. |
| E3 | **IoT/sensor offline mid-run** | `ProductionLog` is operator-submitted, but a real CNC integration will inevitably mix sensor + manual entries. There is no `source` discriminator (`sensor|manual|adjustment`), no late-arriving-data semantics, no out-of-order event handling. |
| E4 | **Manual override of sensor data** | No audit columns on `ProductionLog` for "originally reported X by sensor S, overridden to Y by user U at time T". Once you ingest IoT data, you cannot defend the number to an auditor. |
| E5 | **Network partition between shop floor and API** | Operator tablet queues 30 status transitions offline. On reconnect, your status guard will reject most of them out-of-order (assuming you add one — see §1.1). No documented offline-first / event-sourced operator client. |
| E6 | **TOCTOU race in conflict detection (CNC-FR-005, BR-009)** | Two planners drag conflicting blocks at the same instant. The "check then insert" pattern allows both to pass validation pre-commit. Needs an exclusion constraint (`EXCLUDE USING gist (cnc_machine_id WITH =, tstzrange(planned_start, planned_end) WITH &&)`) at the DB layer. |
| E7 | **WebSocket subscription stale after permission change** | A user's `allowedFactories[]` is updated to remove factory B, but their existing socket is already joined to room `factory:B`. Events keep flowing until reconnect. |
| E8 | **Concurrent PATCH on same Production Order** | No optimistic lock (`@VersionColumn`). Planner edits quantity while supervisor changes status — last write silently wins. |
| E9 | **Operator double-booked across two machines (BR-011)** | Treated as soft warning. Fine — but the warning has no channel (no notification record, no UI persistence). Planners will miss it. |
| E10 | **Downtime resolved with rootCause referencing a deleted operator** | `resolvedBy` FK is nullable but not protected on user soft-delete. Common in turnover. |
| E11 | **Production order quantity edited mid-run** | Nothing recalculates `progress%` denominator references on existing schedule entries; nothing prevents lowering quantity below `completedQuantity`. |
| E12 | **`completedQty > plannedQty` (BR-012 "overrun")** | OK for display, but inventory backflush (when you build §1.4) needs to decide: do you consume materials for the overrun, or scrap them? Spec doesn't say. |
| E13 | **ERP sync REPLACE mode mid-production** | REQ-018 says REPLACE mode is supported. If REPLACE wipes a Product or BOM that has open production orders, FK-less references go stale silently. No referential safety net. |
| E14 | **BullMQ scheduler pod down at shift boundary** | CNC-FR-008 / BR-006 use a cron pattern. Open Question #6 already flags this. The `delayed-job-per-boundary-per-machine-at-publish-time` design they propose is correct — adopt it. |
| E15 | **Reports written to `./uploads/reports/` indefinitely** | Open Question #2 in `_index.md`. Disk fills, no GDPR-style purge, no signed URL TTL. |
| E16 | **Timezone of factory vs. timezone of API server** | `scheduleDate` is a date with no TZ. Determining "today" in a multi-region deployment without anchoring to `factory.timezone` will produce off-by-one-day bugs at midnight. |
| E17 | **Rework loop** | A WO failing QC (`REJECTED`) — does it get re-opened, cloned, or do completed units get re-routed? No requirement covers it. Real factories rework constantly. |
| E18 | **Partial / split delivery on a Production Order** | Quantity 1000 → ship 600 now, 400 later. No partial-fulfillment model on the order. |
| E19 | **Phantom BOMs and effective-date BOMs** | `isPhantom` exists (REQ-023), but there's no `effectiveFrom`/`effectiveTo` on BOM revisions. Engineering changes scheduled for next week cannot be staged. |
| E20 | **Concurrent stock movements** | REQ-036 says "automatic stock quantity update on movement creation." If implemented as `UPDATE materials SET stock = stock + ...` without row-level locking or as a derived column, two concurrent issues against the same material race. The audit log will be correct; the `currentStock` will drift. |

---

## 3. Architectural Recommendations

### 3.1 Split the write model: high-frequency telemetry ≠ transactional MES data
`ProductionLog`, future IoT telemetry, and `MachineDowntime` are append-only, time-series, and will dominate write volume by 2-3 orders of magnitude. Keeping them in vanilla PostgreSQL beside `ProductionOrder` is an OEE-dashboard time bomb.

> **Recommendation:** TimescaleDB hypertable on `production_logs` (and a future `machine_telemetry` table) partitioned by `(factoryId, time)`. Continuous aggregates pre-compute hourly OEE per machine — your reporting endpoint reads from the aggregate, not from raw logs. Same Postgres connection, same ORM with caveats, no microservice split.

### 3.2 Materialized OEE summaries (Open Question #4 in REQ-020 already raised this)
Compute hourly + daily OEE per machine via continuous aggregate or BullMQ end-of-shift job into a `machine_oee_daily` table. Dashboards query the summary; "drill-down to raw events" reads logs. Don't compute OEE on demand over 90-day ranges.

### 3.3 Domain-event outbox + BullMQ
A `domain_events` table written inside the same TX as the entity change. A BullMQ worker (or a Postgres LISTEN/NOTIFY consumer) drains it and (a) emits Socket.io events, (b) calls downstream services, (c) writes to an audit log. Solves §1.7, §3.4 (Saga durability), and §3.5 (cross-factory sync) in one pattern.

### 3.4 State machines as first-class modules
Pull `production-order.state-machine.ts`, `work-order.state-machine.ts`, `schedule-entry.state-machine.ts` into a small shared library. Use XState (which serialises cleanly to JSON for the frontend). Each transition is a service method that:
1. Validates current state against target.
2. Auto-sets timestamps (`actualStartDate` on `IN_PROGRESS`, etc. — closes Open Questions #1, #2 on REQ-012 and REQ-018).
3. Writes a `state_transitions` audit row.
4. Emits a domain event via outbox.

This single pattern resolves five separate "no transition guard" complaints across modules.

### 3.5 BOM snapshot at confirmation
On `PLANNED → IN_PROGRESS`, resolve the BOM revision and write a JSONB snapshot of all line items into `ProductionOrder.bomSnapshot`. All consumption logic reads the snapshot, never the live BOM. This is not an optimisation — it's the correctness guarantee.

### 3.6 Deduplicate the factoryId denormalisation
`ScheduleEntry` has `factoryId` denormalised "for fast queries." Fine, but you need a CHECK that `daily_schedules.factoryId = schedule_entries.factoryId` (Postgres composite FK works for this), or sooner or later a bad UPDATE will create a cross-factory orphan that bypasses `FactoryAccessGuard`.

### 3.7 Module decoupling: Production should not import from Inventory
Inventory consumption belongs to a `production-execution` module that listens to `WorkOrderStepCompleted` events and emits `StockMovementRequested` to inventory. Avoid the temptation to inject `InventoryService` into `WorkOrderService` — you'll regret it within six months.

### 3.8 Token revocation
Two-line fix: a `users.tokensInvalidatedAt` column. JWT validation rejects tokens with `iat < tokensInvalidatedAt`. Bump on logout, password change, role change, deactivate. Doesn't require a Redis blacklist.

### 3.9 Pagination as a cross-cutting concern
Open Question #1 in `_index.md` says it's "inconsistent." Make it impossible to omit: `PaginatedQueryDto` base + a Nest interceptor that caps response array length. List endpoints that return >X rows without pagination params should fail in development, warn in prod.

### 3.10 Idempotency middleware
Global Nest interceptor: if `Idempotency-Key` header present, hash request body, store `(userId, key) → response` for 24h in Redis. Replays return the cached response. ~80 LOC, eliminates the entire double-tap class of bugs.

---

## 4. Compliance / Standard Alignment (ISA-95 / Industry 4.0)

### Where you're aligned

| Aspect | Status |
|--------|--------|
| Level-3 (MES) scope between Level-4 ERP and Level-2 SCADA | Clear positioning. |
| Role separation (`PRODUCTION_MANAGER`, `OPERATOR`, `VIEWER`) | Maps to Personnel model. |
| Multi-factory tenancy via `factoryId` | Maps to Site/Area concept. |
| Async ERP master-data import | Conceptually correct (Level 3 ↔ Level 4 boundary). |
| WebSocket factory rooms | Reasonable real-time pattern for operator HMI. |

### Where you diverge from ISA-95 / IEC 62264

**Equipment hierarchy is too shallow.** ISA-95 expects: *Enterprise → Site → Area → Process Cell / Production Line / Production Unit → Work Center → Work Unit*. You collapse to Factory → WorkCenter → Machine. This blocks reporting at Area or Line level. *Recommendation:* even if the UI hides them, model `Site`, `Area`, and `ProductionLine` as first-class. You already have `ProductionLine` floating around (Open Question #5 in `_index.md`) — promote it.

**No Operations Definition vs Operations Schedule vs Operations Performance separation.** ISA-95 §5 distinguishes:
- *Operations Definition* (the routing template + BOM revision)
- *Operations Schedule* (your `DailySchedule` / `ScheduleEntry`)
- *Operations Performance* (your `ProductionLog` + `MachineDowntime`)

Today these three layers are intermingled in your work-order entities. The pain shows up when ERP wants to send an Operations Schedule and receive an Operations Performance — there's no clean payload boundary. *Recommendation:* a thin DTO layer per ISA-95 message type, even if the storage is shared.

**No Material Lot / Sublot / Material Genealogy.** ISA-95 Part 4 Material Information Model is missing entirely. Without it: no recall traceability, no IATF 16949, no FDA 21 CFR Part 820. The current `Material` entity is a SKU master, not a lot/genealogy structure. **This is the single biggest gap if any customer is in regulated industries.**

**No Personnel Information Model maturity.** Worker Skill catalogue (REQ-006) is a start, but ISA-95 expects qualifications with effective dates, certifications, and shift assignments — REQ-020 admits operator availability is "manual" with no HR integration.

**No B2MML (Business-to-Manufacturing Markup Language).** Your ERP sync uses custom UPSERT/REPLACE JSON. B2MML is the canonical XML schema. *Pragmatic recommendation:* don't adopt B2MML now, but design the DTOs so they're 1:1 mappable to its structure (Operations Definition, Material Definition, etc.). Future integrators will thank you.

**ISA-88 batch model not addressed.** Procedure → Unit Procedure → Operation → Phase. Irrelevant for discrete CNC, **critical for any process manufacturing** (chemicals, pharma, F&B). If the roadmap touches those industries, the schedule entry / work order model needs rethinking — they don't have "completed quantity," they have "batch consumed" and "phase parameters."

**Audit trail (21 CFR Part 11 / EU Annex 11).** Soft-delete is necessary but not sufficient. Regulated industries require:
- Reason-for-change captured on every mutation
- Electronic signature (re-auth) on critical transitions (e.g., releasing a batch)
- Immutable, tamper-evident audit log (ideally hash-chained)

None of this is in the requirements today. If you're targeting regulated customers, prioritise it; if you're explicitly avoiding regulated markets, *say so* in the project README so it's a deliberate scoping decision.

**Industry 4.0 / RAMI 4.0 readiness.** Your current architecture is a solid Level-3 MES but doesn't expose the Asset Administration Shell (AAS) interfaces that newer customers will expect (OPC UA companion specs, AAS-compliant data twins). Not a near-term must, but if your sales motion includes "Smart Factory" or "Digital Twin" language, plan an OPC UA northbound gateway in the architecture roadmap.

---

## TL;DR — what to fix before the next sprint

1. **Lock down state machines** for ProductionOrder, WorkOrder, ScheduleEntry. Auto-set actual timestamps on transitions. (§1.1, §3.4)
2. **Pin BOM revisions to production orders + JSONB snapshot.** (§1.2, §3.5)
3. **Fix the `notes` silent-drop bug** in REQ-012. (§1.3)
4. **Define material consumption coupling** (reservation, backflush, WIP). (§1.4)
5. **Rewrite OEE definitions to SEMI E10 / Nakajima** with explicit setup-time treatment. (§1.6)
6. **Add idempotency middleware + outbox pattern** before you scale operator clients. (§1.7, §1.8, §3.3)
7. **Add Postgres exclusion constraint** for schedule conflicts. (E6)
8. **Decide regulated-industry scope** — if yes, plan lot genealogy + 21 CFR Part 11 now, not later. (§1.5, §4)

The codebase is in better shape than most reverse-engineered MES projects. The hard work isn't fixing bugs; it's resisting the temptation to ship the OEE module before the calculation definitions are airtight. Wrong-but-confident OEE numbers destroy customer trust faster than missing features.
