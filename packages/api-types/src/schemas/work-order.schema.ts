import { z } from 'zod';

import { WorkOrderStatus } from '../enums/work-order-status.enum';

export const createWorkOrderSchema = z.object({
  factoryId: z.string().uuid(),
  productionOrderId: z.string().uuid(),
  code: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  assignedTo: z.string().uuid().optional(),
  plannedStartDate: z.string().datetime(),
  plannedEndDate: z.string().datetime(),
  steps: z
    .array(
      z.object({
        stepNumber: z.number().int().positive(),
        name: z.string().min(1).max(200),
        description: z.string().max(500).optional(),
        estimatedMinutes: z.number().positive().optional(),
        requiredSkills: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  customFields: z.record(z.unknown()).optional(),
});

export const updateWorkOrderSchema = createWorkOrderSchema.partial().omit({ steps: true });

export const workOrderResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  productionOrderId: z.string().uuid(),
  code: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(WorkOrderStatus),
  assignedTo: z.string().uuid().nullable(),
  plannedStartDate: z.string().datetime(),
  plannedEndDate: z.string().datetime(),
  actualStartDate: z.string().datetime().nullable(),
  actualEndDate: z.string().datetime().nullable(),
  customFields: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateWorkOrderDto = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderDto = z.infer<typeof updateWorkOrderSchema>;
export type WorkOrderResponse = z.infer<typeof workOrderResponseSchema>;
