# Status Badge Design Guide

## Problem

Tailwind's `-100` background variants (e.g. `bg-green-100`) are pastel colors designed for light mode.
On the dark background `#1a1a1a`, they appear nearly invisible — low contrast between badge and page.
Text colors like `text-green-700` are dark enough for light mode but become washed-out in dark mode.

## Solution Pattern

Every status badge uses a **dual-mode class string**:

```
{light-bg} {light-text}  dark:{dark-bg} dark:{dark-text}
```

| Mode | Background | Text |
|------|-----------|------|
| Light | `bg-{color}-100` | `text-{color}-800` |
| Dark | `dark:bg-{color}-900/60` | `dark:text-{color}-300` |

The `/60` opacity on dark backgrounds creates a translucent tinted layer that:
- Stands out against `#1a1a1a` without being overwhelming
- Preserves color identity at a glance

## Color Mapping

| Semantic | Tailwind Color | Statuses |
|----------|---------------|----------|
| Running / Completed / Pass | `green` | `IN_PROGRESS` (prod), `COMPLETED`, `PASS`, `RUNNING`, `healthy` |
| Planned / Assigned / Setup | `blue` | `PLANNED`, `ASSIGNED`, `SETUP` |
| In Progress (work order) | `yellow` | `IN_PROGRESS` (WO), `CONDITIONAL` |
| Paused / On-Hold / Maintenance | `orange` | `PAUSED`, `ON_HOLD`, `MAINTENANCE`, `lowPerformance` |
| Error / Cancelled / Rejected / Fail | `red` | `CANCELLED`, `REJECTED`, `ERROR`, `FAIL`, `failed` |
| Draft / Pending / Idle | `gray` | `DRAFT`, `PENDING`, `IDLE` |
| Queued (reports) | `amber` | `queued` |

## Full Class Reference

```ts
// Green
'bg-green-100 text-green-800  dark:bg-green-900/60  dark:text-green-300'

// Blue
'bg-blue-100 text-blue-800   dark:bg-blue-900/60   dark:text-blue-300'

// Yellow
'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300'

// Orange
'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300'

// Red
'bg-red-100 text-red-800     dark:bg-red-900/60    dark:text-red-400'

// Gray
'bg-gray-100 text-gray-800   dark:bg-gray-800      dark:text-gray-300'

// Gray (muted — cancelled/archived)
'bg-gray-100 text-gray-600   dark:bg-gray-800      dark:text-gray-500'

// Amber
'bg-amber-100 text-amber-800  dark:bg-amber-900/60  dark:text-amber-300'
```

> Red uses `-400` text in dark mode (not `-300`) because red-300 is too close to white on dark backgrounds.

## Badge with Border (CNC Monitoring)

For badges that also carry a border (e.g. `cnc-monitoring-dashboard`), add matching border variants:

```ts
// Example: RUNNING with border
'bg-green-100 text-green-800 border-green-200  dark:bg-green-900/60 dark:text-green-300 dark:border-green-800'
```

## Files

| File | Component |
|------|-----------|
| `packages/ui/src/components/status-chip.tsx` | `StatusChip` — shared chip for Production / WorkOrder / QC |
| `apps/web/src/app/(app)/production/_components/production-table.tsx` | `STATUS_STYLES` |
| `apps/web/src/app/(app)/work-orders/_components/work-orders-table.tsx` | `STATUS_STYLES` |
| `apps/web/src/app/(app)/cnc/machines/_components/cnc-machines-table.tsx` | `STATUS_STYLES` |
| `apps/web/src/app/(app)/cnc/machines/[id]/_components/cnc-machine-detail.tsx` | `STATUS_STYLES` |
| `apps/web/src/app/(app)/cnc/monitoring/_components/cnc-monitoring-dashboard.tsx` | `STATUS_STYLES` |
| `apps/web/src/app/(app)/dashboard/_components/machine-status-badge.tsx` | `MachineStatusBadge` |
| `apps/web/src/app/(app)/reports/_components/reports-client.tsx` | `StatusBadge` |
