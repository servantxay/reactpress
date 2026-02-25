import { z } from 'zod';

export const PostStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
    .optional(),
  content: z.string().default(''),
  excerpt: z.string().max(500).optional(),
  status: PostStatusSchema.default('DRAFT'),
  featuredImageId: z.string().optional(),
  categoryIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export const PostQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: PostStatusSchema.optional(),
  authorId: z.string().optional(),
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
  search: z.string().optional(),
});

export type PostStatus = z.infer<typeof PostStatusSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type PostQuery = z.infer<typeof PostQuerySchema>;
