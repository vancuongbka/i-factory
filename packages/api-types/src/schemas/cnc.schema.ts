import { z } from 'zod';

import { CncMachineStatus } from '../enums/cnc-machine-status.enum';
import { DailyScheduleStatus } from '../enums/daily-schedule-status.enum';
import { ScheduleEntryStatus } from '../enums/schedule-entry-status.enum';

// ── Tooling requirement item ───────────────────────────────────────────────

const toolingRequirementSchema = z.object({
  toolCode: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  requiredQty: z.number().int().positive(),
});

// ── CNC Machine ───────────────────────────────────────────────────────────

export const createCncMachineSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  model: z.string().max(100).optional(),
  maxSpindleRpm: z.number().int().positive().optional(),
  numberOfAxes: z.number().int().positive().optional(),
  machineId: z.string().uuid().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const updateCncMachineSchema = createCncMachineSchema.partial();

export const cncMachineResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  machineId: z.string().uuid().nullable(),
  code: z.string(),
  name: z.string(),
  model: z.string().nullable(),
  maxSpindleRpm: z.number().nullable(),
  numberOfAxes: z.number().nullable(),
  currentStatus: z.nativeEnum(CncMachineStatus),
  currentScheduleEntryId: z.string().uuid().nullable(),
  lastStatusChangedAt: z.string().datetime().nullable(),
  customFields: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateCncMachineDto = z.infer<typeof createCncMachineSchema>;
export type UpdateCncMachineDto = z.infer<typeof updateCncMachineSchema>;
export type CncMachineResponse = z.infer<typeof cncMachineResponseSchema>;

// ── CNC Machine Availability ───────────────────────────────────────────────

export const cncMachineAvailabilitySchema = z.object({
  machineId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  currentStatus: z.nativeEnum(CncMachineStatus),
  committedMinutes: z.number(),
});

export type CncMachineAvailability = z.infer<typeof cncMachineAvailabilitySchema>;

// ── Daily Schedule ─────────────────────────────────────────────────────────

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

export const createDailyScheduleSchema = z.object({
  scheduleDate: z.string().regex(dateOnlyRegex, 'Must be YYYY-MM-DD'),
  shiftCount: z.number().int().min(1).max(3).default(1),
  shift1Start: z.string().regex(timeRegex, 'Must be HH:MM').optional(),
  shift2Start: z.string().regex(timeRegex, 'Must be HH:MM').optional(),
  shift3Start: z.string().regex(timeRegex, 'Must be HH:MM').optional(),
  notes: z.string().max(1000).optional(),
});

export const updateDailyScheduleSchema = createDailyScheduleSchema
  .partial()
  .omit({ scheduleDate: true });

export const dailyScheduleResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  scheduleDate: z.string(),
  status: z.nativeEnum(DailyScheduleStatus),
  shiftCount: z.number(),
  shift1Start: z.string().nullable(),
  shift2Start: z.string().nullable(),
  shift3Start: z.string().nullable(),
  notes: z.string().nullable(),
  publishedAt: z.string().datetime().nullable(),
  publishedBy: z.string().uuid().nullable(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateDailyScheduleDto = z.infer<typeof createDailyScheduleSchema>;
export type UpdateDailyScheduleDto = z.infer<typeof updateDailyScheduleSchema>;
export type DailyScheduleResponse = z.infer<typeof dailyScheduleResponseSchema>;

// ── Schedule Entry ─────────────────────────────────────────────────────────

export const createScheduleEntrySchema = z
  .object({
    dailyScheduleId: z.string().uuid(),
    cncMachineId: z.string().uuid(),
    workOrderId: z.string().uuid(),
    productionOrderId: z.string().uuid(),
    assignedOperatorId: z.string().uuid().optional(),
    sortOrder: z.number().int().min(0).default(0),
    plannedStart: z.string().datetime(),
    plannedEnd: z.string().datetime(),
    plannedQty: z.number().int().positive(),
    plannedSetupMinutes: z.number().int().min(0).default(0),
    plannedCycleSeconds: z.number().int().positive(),
    partName: z.string().min(1).max(200),
    toolingRequirements: z.array(toolingRequirementSchema).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((d) => new Date(d.plannedEnd) > new Date(d.plannedStart), {
    message: 'plannedEnd must be after plannedStart',
    path: ['plannedEnd'],
  });

export const updateScheduleEntrySchema = z
  .object({
    cncMachineId: z.string().uuid().optional(),
    assignedOperatorId: z.string().uuid().nullable().optional(),
    sortOrder: z.number().int().min(0).optional(),
    plannedStart: z.string().datetime().optional(),
    plannedEnd: z.string().datetime().optional(),
    plannedQty: z.number().int().positive().optional(),
    plannedSetupMinutes: z.number().int().min(0).optional(),
    plannedCycleSeconds: z.number().int().positive().optional(),
    partName: z.string().min(1).max(200).optional(),
    toolingRequirements: z.array(toolingRequirementSchema).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine(
    (d) => {
      if (d.plannedStart && d.plannedEnd) {
        return new Date(d.plannedEnd) > new Date(d.plannedStart);
      }
      return true;
    },
    { message: 'plannedEnd must be after plannedStart', path: ['plannedEnd'] },
  );

export const advanceEntryStatusSchema = z.object({
  status: z.nativeEnum(ScheduleEntryStatus),
});

export const reorderScheduleEntriesSchema = z.object({
  cncMachineId: z.string().uuid(),
  sortedEntryIds: z.array(z.string().uuid()).min(1),
});

export const scheduleEntryResponseSchema = z.object({
  id: z.string().uuid(),
  dailyScheduleId: z.string().uuid(),
  factoryId: z.string().uuid(),
  cncMachineId: z.string().uuid(),
  workOrderId: z.string().uuid(),
  productionOrderId: z.string().uuid(),
  assignedOperatorId: z.string().uuid().nullable(),
  sortOrder: z.number(),
  status: z.nativeEnum(ScheduleEntryStatus),
  plannedStart: z.string().datetime(),
  plannedEnd: z.string().datetime(),
  plannedQty: z.number(),
  plannedSetupMinutes: z.number(),
  plannedCycleSeconds: z.number(),
  actualSetupStart: z.string().datetime().nullable(),
  actualRunStart: z.string().datetime().nullable(),
  actualEnd: z.string().datetime().nullable(),
  toolingRequirements: z.array(toolingRequirementSchema).nullable(),
  partName: z.string(),
  notes: z.string().nullable(),
  // Computed fields — not stored in DB
  cumulativeCompletedQty: z.number(),
  progressPct: z.number().min(0).max(100),
  overrun: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateScheduleEntryDto = z.infer<typeof createScheduleEntrySchema>;
export type UpdateScheduleEntryDto = z.infer<typeof updateScheduleEntrySchema>;
export type AdvanceEntryStatusDto = z.infer<typeof advanceEntryStatusSchema>;
export type ReorderScheduleEntriesDto = z.infer<typeof reorderScheduleEntriesSchema>;
export type ScheduleEntryResponse = z.infer<typeof scheduleEntryResponseSchema>;
export type ToolingRequirement = z.infer<typeof toolingRequirementSchema>;

// ── Production Log ─────────────────────────────────────────────────────────

export const createProductionLogSchema = z.object({
  scheduleEntryId: z.string().uuid(),
  completedQty: z.number().int().positive(),
  scrapQty: z.number().int().min(0).default(0),
  cycleTimeActualSeconds: z.number().int().positive().optional(),
  operatorNotes: z.string().max(1000).optional(),
});

export const productionLogResponseSchema = z.object({
  id: z.string().uuid(),
  scheduleEntryId: z.string().uuid(),
  factoryId: z.string().uuid(),
  cncMachineId: z.string().uuid(),
  operatorId: z.string().uuid(),
  loggedAt: z.string().datetime(),
  completedQty: z.number(),
  scrapQty: z.number(),
  cycleTimeActualSeconds: z.number().nullable(),
  operatorNotes: z.string().nullable(),
});

export type CreateProductionLogDto = z.infer<typeof createProductionLogSchema>;
export type ProductionLogResponse = z.infer<typeof productionLogResponseSchema>;

// ── Machine Downtime (CNC) ─────────────────────────────────────────────────
// Named with Cnc prefix to avoid collision with dashboard.schema.ts MachineDowntime

export const createCncDowntimeSchema = z.object({
  cncMachineId: z.string().uuid(),
  scheduleEntryId: z.string().uuid().optional(),
  startedAt: z.string().datetime(),
  faultCode: z.string().min(1).max(50),
  description: z.string().min(1).max(2000),
});

export const resolveCncDowntimeSchema = z.object({
  resolvedAt: z.string().datetime(),
  rootCause: z.string().max(2000).optional(),
  correctiveAction: z.string().max(2000).optional(),
});

export const cncDowntimeResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  cncMachineId: z.string().uuid(),
  scheduleEntryId: z.string().uuid().nullable(),
  raisedBy: z.string().uuid(),
  startedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().nullable(),
  resolvedBy: z.string().uuid().nullable(),
  faultCode: z.string(),
  description: z.string(),
  rootCause: z.string().nullable(),
  correctiveAction: z.string().nullable(),
  durationMinutes: z.number().nullable(),
});

export type CreateCncDowntimeDto = z.infer<typeof createCncDowntimeSchema>;
export type ResolveCncDowntimeDto = z.infer<typeof resolveCncDowntimeSchema>;
export type CncDowntimeResponse = z.infer<typeof cncDowntimeResponseSchema>;

// ── Operator Availability ──────────────────────────────────────────────────

export const setOperatorAvailabilitySchema = z.object({
  date: z.string().regex(dateOnlyRegex, 'Must be YYYY-MM-DD'),
  isAvailable: z.boolean(),
});

export const operatorAvailabilityResponseSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string(),
  date: z.string(),
  isAvailable: z.boolean(),
});

export type SetOperatorAvailabilityDto = z.infer<typeof setOperatorAvailabilitySchema>;
export type OperatorAvailabilityResponse = z.infer<typeof operatorAvailabilityResponseSchema>;

// ── Conflict error body (409 response) ────────────────────────────────────

export const conflictErrorBodySchema = z.object({
  conflictingEntryId: z.string().uuid(),
  conflictingEntryWorkOrderCode: z.string(),
  overlapStartsAt: z.string().datetime(),
  overlapEndsAt: z.string().datetime(),
});

export type ConflictErrorBody = z.infer<typeof conflictErrorBodySchema>;

// ── CNC KPI summary (monitoring page summary bar) ─────────────────────────

export const cncKpiSummarySchema = z.object({
  totalMachines: z.number(),
  runningCount: z.number(),
  idleCount: z.number(),
  errorCount: z.number(),
  setupCount: z.number(),
  maintenanceCount: z.number(),
  factoryProgressPct: z.number().min(0).max(100),
  totalPlannedQty: z.number(),
  totalCompletedQty: z.number(),
});

export type CncKpiSummary = z.infer<typeof cncKpiSummarySchema>;
