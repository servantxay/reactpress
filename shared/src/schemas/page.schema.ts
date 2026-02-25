import { z } from 'zod';

export const PageStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const CreatePageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
    .optional(),
  content: z.string().default(''),
  status: PageStatusSchema.default('DRAFT'),
  parentId: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

export const UpdatePageSchema = CreatePageSchema.partial();

export type PageStatus = z.infer<typeof PageStatusSchema>;
export type CreatePageInput = z.infer<typeof CreatePageSchema>;
export type UpdatePageInput = z.infer<typeof UpdatePageSchema>;
