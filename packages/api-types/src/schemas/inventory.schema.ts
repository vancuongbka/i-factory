import { z } from 'zod';

import { MovementType } from '../enums/movement-type.enum';

export const createMaterialSchema = z.object({
  factoryId: z.string().uuid(),
  code: z.string().min(2).max(50),
  name: z.string().min(1).max(200),
  unit: z.string().max(20),
  minStockLevel: z.number().min(0).default(0),
  maxStockLevel: z.number().min(0).optional(),
  currentStock: z.number().min(0).default(0),
  warehouseId: z.string().uuid().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const createStockMovementSchema = z.object({
  factoryId: z.string().uuid(),
  materialId: z.string().uuid(),
  type: z.nativeEnum(MovementType),
  quantity: z.number().positive(),
  unit: z.string().max(20),
  referenceType: z.string().max(50).optional(), // 'work-order', 'production-order', etc.
  referenceId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export type CreateMaterialDto = z.infer<typeof createMaterialSchema>;
export type CreateStockMovementDto = z.infer<typeof createStockMovementSchema>;
