import { z } from 'zod';

// ── Low-stock alert ────────────────────────────────────────────────────────

export const lowStockAlertSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  unit: z.string(),
  currentStock: z.number(),
  minStockLevel: z.number(),
});

// ── QC failure alert ───────────────────────────────────────────────────────

export const qcFailureAlertSchema = z.object({
  id: z.string().uuid(),
  result: z.string(),
  inspectedAt: z.string().datetime(),
  sampleSize: z.number(),
  failedCount: z.number(),
  notes: z.string().nullable().optional(),
});

// ── Machine downtime alert ─────────────────────────────────────────────────

export const machineDowntimeSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  status: z.string(),
});

// ── Throughput trend data point ────────────────────────────────────────────

export const throughputDataPointSchema = z.object({
  date: z.string(),
  completed: z.number(),
  planned: z.number(),
});

// ── Machine status distribution (for pie chart) ────────────────────────────

export const machineStatusCountSchema = z.object({
  status: z.string(),
  count: z.number(),
});

// ── Active work order row ──────────────────────────────────────────────────

export const activeWorkOrderRowSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  productName: z.string(),
  progress: z.number(),
  eta: z.string().datetime(),
  status: z.string(),
});

// ── Full dashboard response ────────────────────────────────────────────────

export const dashboardResponseSchema = z.object({
  /** Overall Equipment Effectiveness 0–100 */
  oee: z.number(),
  /** Yield rate from QC inspections 0–100 */
  yieldRate: z.number(),
  /** Sum of completedQuantity for IN_PROGRESS production orders */
  outputActual: z.number(),
  /** Sum of planned quantity for IN_PROGRESS production orders */
  outputPlanned: z.number(),
  /** Machine utilization counts */
  machines: z.object({ active: z.number(), total: z.number() }),

  alerts: z.object({
    lowStock: z.array(lowStockAlertSchema),
    qcFailures: z.array(qcFailureAlertSchema),
    machineDowntime: z.array(machineDowntimeSchema),
  }),

  /** Daily output trend for the last 7 days */
  throughputTrend: z.array(throughputDataPointSchema),
  /** Distribution of machine statuses for pie chart */
  machineStatusDistribution: z.array(machineStatusCountSchema),
  /** Currently IN_PROGRESS work orders */
  activeWorkOrders: z.array(activeWorkOrderRowSchema),
});

export type LowStockAlert = z.infer<typeof lowStockAlertSchema>;
export type QcFailureAlert = z.infer<typeof qcFailureAlertSchema>;
export type MachineDowntime = z.infer<typeof machineDowntimeSchema>;
export type ThroughputDataPoint = z.infer<typeof throughputDataPointSchema>;
export type MachineStatusCount = z.infer<typeof machineStatusCountSchema>;
export type ActiveWorkOrderRow = z.infer<typeof activeWorkOrderRowSchema>;
export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
