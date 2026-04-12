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

export const updateMaterialSchema = createMaterialSchema.partial().omit({ factoryId: true });

export const materialResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  unit: z.string(),
  currentStock: z.number(),
  minStockLevel: z.number(),
  maxStockLevel: z.number().nullable().optional(),
  warehouseId: z.string().uuid().nullable().optional(),
  isActive: z.boolean(),
  customFields: z.record(z.unknown()).nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createStockMovementSchema = z.object({
  factoryId: z.string().uuid(),
  materialId: z.string().uuid(),
  type: z.nativeEnum(MovementType),
  quantity: z.number().positive(),
  unit: z.string().max(20),
  referenceType: z.string().max(50).optional(),
  referenceId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export const stockMovementResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  materialId: z.string().uuid(),
  type: z.nativeEnum(MovementType),
  quantity: z.number(),
  unit: z.string(),
  referenceType: z.string().nullable().optional(),
  referenceId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type CreateMaterialDto = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialDto = z.infer<typeof updateMaterialSchema>;
export type MaterialResponse = z.infer<typeof materialResponseSchema>;
export type CreateStockMovementDto = z.infer<typeof createStockMovementSchema>;
export type StockMovementResponse = z.infer<typeof stockMovementResponseSchema>;
