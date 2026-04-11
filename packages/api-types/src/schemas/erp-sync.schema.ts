import { z } from 'zod';

export const erpSyncPayloadSchema = z.object({
  entityType: z.enum(['products', 'boms', 'routings', 'work-centers']),
  externalSystem: z.string().max(50),
  records: z.array(z.record(z.unknown())).min(1).max(500),
  syncMode: z.enum(['UPSERT', 'REPLACE']).default('UPSERT'),
  dryRun: z.boolean().default(false),
});

export const erpSyncJobResponseSchema = z.object({
  jobId: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  createdAt: z.string().datetime(),
});

export type ErpSyncPayload = z.infer<typeof erpSyncPayloadSchema>;
export type ErpSyncJobResponse = z.infer<typeof erpSyncJobResponseSchema>;
