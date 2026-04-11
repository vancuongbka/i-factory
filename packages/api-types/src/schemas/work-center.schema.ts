import { z } from 'zod';
import { WorkCenterType } from '../enums/work-center-type.enum';
import { MachineStatus } from '../enums/machine-status.enum';
import { SkillLevel } from '../enums/skill-level.enum';

// ── Work Center ───────────────────────────────────────────────────────────────

export const createWorkCenterSchema = z.object({
  factoryId: z.string().uuid(),
  code: z.string().min(2).max(50),
  name: z.string().min(1).max(200),
  type: z.nativeEnum(WorkCenterType),
  capacityPerHour: z.number().positive().optional(),
  description: z.string().max(500).optional(),
  customFields: z.record(z.unknown()).optional(),
  isActive: z.boolean().default(true),
});

export const updateWorkCenterSchema = createWorkCenterSchema.partial();

export const workCenterResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  type: z.nativeEnum(WorkCenterType),
  capacityPerHour: z.number().nullable(),
  description: z.string().nullable(),
  customFields: z.record(z.unknown()).nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateWorkCenterDto = z.infer<typeof createWorkCenterSchema>;
export type UpdateWorkCenterDto = z.infer<typeof updateWorkCenterSchema>;
export type WorkCenterResponse = z.infer<typeof workCenterResponseSchema>;

// ── Machine ───────────────────────────────────────────────────────────────────

export const createMachineSchema = z.object({
  factoryId: z.string().uuid(),
  workCenterId: z.string().uuid(),
  code: z.string().min(2).max(50),
  name: z.string().min(1).max(200),
  model: z.string().max(100).optional(),
  serialNumber: z.string().max(100).optional(),
  status: z.nativeEnum(MachineStatus).default(MachineStatus.IDLE),
  capacityPerHour: z.number().positive().optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const updateMachineSchema = createMachineSchema.partial();

export const machineResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  workCenterId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  model: z.string().nullable(),
  serialNumber: z.string().nullable(),
  status: z.nativeEnum(MachineStatus),
  capacityPerHour: z.number().nullable(),
  customFields: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateMachineDto = z.infer<typeof createMachineSchema>;
export type UpdateMachineDto = z.infer<typeof updateMachineSchema>;
export type MachineResponse = z.infer<typeof machineResponseSchema>;

// ── Skill ─────────────────────────────────────────────────────────────────────

export const createSkillSchema = z.object({
  factoryId: z.string().uuid(),
  code: z.string().min(2).max(50),
  name: z.string().min(1).max(200),
  level: z.nativeEnum(SkillLevel),
  description: z.string().max(500).optional(),
});

export const updateSkillSchema = createSkillSchema.partial();

export const skillResponseSchema = z.object({
  id: z.string().uuid(),
  factoryId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  level: z.nativeEnum(SkillLevel),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateSkillDto = z.infer<typeof createSkillSchema>;
export type UpdateSkillDto = z.infer<typeof updateSkillSchema>;
export type SkillResponse = z.infer<typeof skillResponseSchema>;
