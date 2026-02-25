import { z } from 'zod';

export const UserRoleSchema = z.enum(['ADMIN', 'EDITOR', 'AUTHOR', 'SUBSCRIBER']);

export const UpdateUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

export const UpdateUserRoleSchema = z.object({
  role: UserRoleSchema,
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
