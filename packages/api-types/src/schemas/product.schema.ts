import { z } from 'zod';
import { ProductType } from '../enums/product-type.enum';

// ── Category ─────────────────────────────────────────────────────────────────

export const createProductCategorySchema = z.object({
  factoryId: z.string().uuid(),
  code: z.string().min(2).max(50),
  name: z.string().min(1).max(100),
  parentId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateProductCategorySchema = createProductCategorySchema.partial();

export const productCategoryResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  parentId: z.string().uuid().nullable(),
  description: z.string().nullable(),
  sortOrder: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateProductCategoryDto = z.infer<typeof createProductCategorySchema>;
export type UpdateProductCategoryDto = z.infer<typeof updateProductCategorySchema>;
export type ProductCategoryResponse = z.infer<typeof productCategoryResponseSchema>;

// ── Unit of Measure ───────────────────────────────────────────────────────────

export const createUomSchema = z.object({
  factoryId: z.string().uuid(),
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  symbol: z.string().max(10),
  isBase: z.boolean().default(false),
});

export const updateUomSchema = createUomSchema.partial();

export const uomResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  isBase: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateUomDto = z.infer<typeof createUomSchema>;
export type UpdateUomDto = z.infer<typeof updateUomSchema>;
export type UomResponse = z.infer<typeof uomResponseSchema>;

// ── Product ───────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  factoryId: z.string().uuid(),
  sku: z.string().min(2).max(50),
  name: z.string().min(1).max(200),
  type: z.nativeEnum(ProductType),
  categoryId: z.string().uuid().optional(),
  uomId: z.string().uuid(),
  description: z.string().max(1000).optional(),
  technicalSpecs: z.record(z.unknown()).optional(),
  customFields: z.record(z.unknown()).optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  type: z.nativeEnum(ProductType),
  categoryId: z.string().uuid().nullable(),
  uomId: z.string().uuid(),
  description: z.string().nullable(),
  technicalSpecs: z.record(z.unknown()).nullable(),
  customFields: z.record(z.unknown()).nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
