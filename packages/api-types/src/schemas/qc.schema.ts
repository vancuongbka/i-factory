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
  result: z.nativeEnum(QCResult).default(QCResult.PENDING),
  notes: z.string().max(1000).optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const updateQCInspectionSchema = createQCInspectionSchema
  .partial()
  .omit({ factoryId: true });

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

export const qcDefectResponseSchema = z.object({
  id: z.string().uuid(),
  inspectionId: z.string().uuid(),
  code: z.string().nullable().optional(),
  description: z.string(),
  severity: z.nativeEnum(DefectSeverity),
  quantity: z.number(),
  rootCause: z.string().nullable().optional(),
  correctiveAction: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const qcInspectionResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  workOrderId: z.string().uuid().nullable().optional(),
  productionOrderId: z.string().uuid().nullable().optional(),
  inspectorId: z.string().uuid(),
  inspectedAt: z.string().datetime(),
  sampleSize: z.number(),
  passedCount: z.number(),
  failedCount: z.number(),
  result: z.nativeEnum(QCResult),
  notes: z.string().nullable().optional(),
  defects: z.array(qcDefectResponseSchema).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateQCInspectionDto = z.infer<typeof createQCInspectionSchema>;
export type UpdateQCInspectionDto = z.infer<typeof updateQCInspectionSchema>;
export type CreateDefectDto = z.infer<typeof createDefectSchema>;
export type QCDefectResponse = z.infer<typeof qcDefectResponseSchema>;
export type QCInspectionResponse = z.infer<typeof qcInspectionResponseSchema>;
