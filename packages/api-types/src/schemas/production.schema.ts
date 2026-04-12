import { z } from 'zod';

import { ProductionStatus } from '../enums/production-status.enum';

export const createProductionOrderSchema = z.object({
  factoryId: z.string().uuid(),
  code: z.string().min(2).max(50),
  productName: z.string().min(1).max(200),
  quantity: z.number().positive(),
  unit: z.string().max(20),
  plannedStartDate: z.string().datetime(),
  plannedEndDate: z.string().datetime(),
  productionLineId: z.string().uuid().optional(),
  bomId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const updateProductionOrderSchema = createProductionOrderSchema.partial();

export const productionOrderResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  code: z.string(),
  productName: z.string(),
  quantity: z.number(),
  unit: z.string(),
  status: z.nativeEnum(ProductionStatus),
  plannedStartDate: z.string().datetime(),
  plannedEndDate: z.string().datetime(),
  actualStartDate: z.string().datetime().nullable(),
  actualEndDate: z.string().datetime().nullable(),
  completedQuantity: z.number().default(0),
  productionLineId: z.string().uuid().nullable().optional(),
  bomId: z.string().uuid().nullable().optional(),
  customFields: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateProductionOrderDto = z.infer<typeof createProductionOrderSchema>;
export type UpdateProductionOrderDto = z.infer<typeof updateProductionOrderSchema>;
export type ProductionOrderResponse = z.infer<typeof productionOrderResponseSchema>;
