import { z } from 'zod';

// ── Legacy schemas (kept for backward compat) ─────────────────────────────────

export const bomItemSchema = z.object({
  materialId: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.string().max(20),
  wastePercentage: z.number().min(0).max(100).default(0),
  notes: z.string().max(500).optional(),
});

export const createBomSchema = z.object({
  factoryId: z.string().uuid(),
  code: z.string().min(2).max(50),
  productName: z.string().min(1).max(200),
  version: z.string().max(20).default('1.0'),
  outputQuantity: z.number().positive(),
  outputUnit: z.string().max(20),
  items: z.array(bomItemSchema).min(1),
  notes: z.string().max(1000).optional(),
});

export const updateBomSchema = createBomSchema.partial();

export const bomResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  code: z.string(),
  productName: z.string(),
  version: z.string(),
  outputQuantity: z.number(),
  outputUnit: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BomItem = z.infer<typeof bomItemSchema>;
export type CreateBomDto = z.infer<typeof createBomSchema>;
export type UpdateBomDto = z.infer<typeof updateBomSchema>;
export type BomResponse = z.infer<typeof bomResponseSchema>;

// ── V2 schemas (MDM-aware, multi-level, versioned) ────────────────────────────

export const bomItemV2Schema = z
  .object({
    materialId: z.string().uuid().optional(),
    childBomId: z.string().uuid().optional(),
    sequence: z.number().int().positive().default(1),
    quantity: z.number().positive(),
    unit: z.string().max(20),
    wastePercentage: z.number().min(0).max(100).default(0),
    notes: z.string().max(500).optional(),
  })
  .refine((d) => d.materialId !== undefined || d.childBomId !== undefined, {
    message: 'Each BOM item must have either materialId or childBomId',
  });

export const createBomV2Schema = z.object({
  factoryId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  code: z.string().min(2).max(50),
  productName: z.string().min(1).max(200),
  version: z.string().max(20).default('1.0'),
  outputQuantity: z.number().positive(),
  outputUnit: z.string().max(20),
  isPhantom: z.boolean().default(false),
  items: z.array(bomItemV2Schema).min(1),
  notes: z.string().max(1000).optional(),
});

export const updateBomV2Schema = createBomV2Schema.omit({ items: true }).partial();

export const addBomItemSchema = bomItemV2Schema;

export const bomRevisionResponseSchema = z.object({
  id: z.string().uuid(),
  bomId: z.string().uuid(),
  factoryId: z.string().uuid(),
  fromVersion: z.string(),
  toVersion: z.string(),
  revisedBy: z.string().uuid(),
  changeNotes: z.string().nullable(),
  snapshotData: z.record(z.unknown()),
  createdAt: z.string().datetime(),
});

export const createBomRevisionSchema = z.object({
  changeNotes: z.string().max(1000).optional(),
});

export type BomItemV2 = z.infer<typeof bomItemV2Schema>;
export type CreateBomV2Dto = z.infer<typeof createBomV2Schema>;
export type UpdateBomV2Dto = z.infer<typeof updateBomV2Schema>;
export type AddBomItemDto = z.infer<typeof addBomItemSchema>;
export type BomRevisionResponse = z.infer<typeof bomRevisionResponseSchema>;
export type CreateBomRevisionDto = z.infer<typeof createBomRevisionSchema>;
