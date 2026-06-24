import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must be at most 100 characters'),
});

export const updateUserSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100)
    .optional(),
  role: z.enum(['client', 'agent', 'super_admin']).optional(),
  isActive: z.boolean().optional(),
  preferences: z
    .object({
      notifications: z
        .object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});
