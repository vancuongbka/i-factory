import { z } from 'zod';

export const reportRequestSchema = z.object({
  factoryId: z.string().uuid(),
  type: z.enum(['production', 'inventory', 'qc', 'work-orders']),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  format: z.enum(['json', 'xlsx', 'pdf']).default('json'),
  filters: z.record(z.unknown()).optional(),
});

export const reportJobResponseSchema = z.object({
  jobId: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  downloadUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
});

export type ReportRequestDto = z.infer<typeof reportRequestSchema>;
export type ReportJobResponse = z.infer<typeof reportJobResponseSchema>;
