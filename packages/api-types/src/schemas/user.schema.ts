import { z } from 'zod';

import { UserRole } from '../enums/user-role.enum';

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
  role: z.nativeEnum(UserRole),
  allowedFactories: z.array(z.string().uuid()).default([]),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.nativeEnum(UserRole),
  allowedFactories: z.array(z.string().uuid()),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
