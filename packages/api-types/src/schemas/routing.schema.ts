import { z } from 'zod';

// ── Routing Operation ─────────────────────────────────────────────────────────

export const createRoutingOperationSchema = z.object({
  sequence: z.number().int().positive(),
  name: z.string().min(1).max(200),
  workCenterId: z.string().uuid(),
  setupTimeMinutes: z.number().int().min(0).default(0),
  cycleTimeMinutes: z.number().positive(),
  machineIds: z.array(z.string().uuid()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  workInstructions: z.string().optional(),
  isOptional: z.boolean().default(false),
});

export const updateRoutingOperationSchema = createRoutingOperationSchema.partial();

export const routingOperationResponseSchema = z.object({
  id: z.string().uuid(),
  routingId: z.string().uuid(),
  sequence: z.number(),
  name: z.string(),
  workCenterId: z.string().uuid(),
  setupTimeMinutes: z.number(),
  cycleTimeMinutes: z.number(),
  machineIds: z.array(z.string().uuid()),
  requiredSkills: z.array(z.string()),
  workInstructions: z.string().nullable(),
  isOptional: z.boolean(),
});

export type CreateRoutingOperationDto = z.infer<typeof createRoutingOperationSchema>;
export type UpdateRoutingOperationDto = z.infer<typeof updateRoutingOperationSchema>;
export type RoutingOperationResponse = z.infer<typeof routingOperationResponseSchema>;

// ── Routing ───────────────────────────────────────────────────────────────────

export const createRoutingSchema = z.object({
  factoryId: z.string().uuid(),
  productId: z.string().uuid(),
  code: z.string().min(2).max(50),
  name: z.string().min(1).max(200),
  version: z.string().max(20).default('1.0'),
  isActive: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
  operations: z.array(createRoutingOperationSchema).min(1),
});

export const updateRoutingSchema = createRoutingSchema.omit({ operations: true }).partial();

export const routingResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  productId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  version: z.string(),
  isActive: z.boolean(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateRoutingDto = z.infer<typeof createRoutingSchema>;
export type UpdateRoutingDto = z.infer<typeof updateRoutingSchema>;
export type RoutingResponse = z.infer<typeof routingResponseSchema>;
