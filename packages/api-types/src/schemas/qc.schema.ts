import { z } from 'zod';

import { DefectSeverity, QCResult } from '../enums/qc-result.enum';

export const createQCInspectionSchema = z.object({
  factoryId: z.string().uuid(),
  workOrderId: z.string().uuid().optional(),
  productionOrderId: z.string().uuid().optional(),
  inspectorId: z.string().uuid(),
  inspectedAt: z.string().datetime(),
  sampleSize: z.number().positive(),
  passedCount: z.number().min(0),
  failedCount: z.number().min(0),
  result: z.nativeEnum(QCResult),
  notes: z.string().max(1000).optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const createDefectSchema = z.object({
  factoryId: z.string().uuid(),
  inspectionId: z.string().uuid(),
  code: z.string().max(50).optional(),
  description: z.string().min(1).max(500),
  severity: z.nativeEnum(DefectSeverity),
  quantity: z.number().positive(),
  rootCause: z.string().max(500).optional(),
  correctiveAction: z.string().max(500).optional(),
});

export type CreateQCInspectionDto = z.infer<typeof createQCInspectionSchema>;
export type CreateDefectDto = z.infer<typeof createDefectSchema>;
