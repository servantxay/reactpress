import { z } from 'zod';

export const UpdateMediaSchema = z.object({
  alt: z.string().max(255).optional(),
  originalName: z.string().max(255).optional(),
});

export const MediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  mimeType: z.string().optional(),
  search: z.string().optional(),
});

export type UpdateMediaInput = z.infer<typeof UpdateMediaSchema>;
export type MediaQuery = z.infer<typeof MediaQuerySchema>;
