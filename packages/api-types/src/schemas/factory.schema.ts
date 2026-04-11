import { z } from 'zod';

export const createFactorySchema = z.object({
  code: z.string().min(2).max(20).toUpperCase(),
  name: z.string().min(2).max(100),
  address: z.string().max(255).optional(),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
  customFieldsConfig: z.record(z.unknown()).optional(),
});

export const updateFactorySchema = createFactorySchema.partial();

export const factoryResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  address: z.string().nullable(),
  timezone: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateFactoryDto = z.infer<typeof createFactorySchema>;
export type UpdateFactoryDto = z.infer<typeof updateFactorySchema>;
export type FactoryResponse = z.infer<typeof factoryResponseSchema>;
