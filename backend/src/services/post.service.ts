import slugify from '../lib/slugify';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreatePostInput, UpdatePostInput, PostQuery } from '@reactpress/shared';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'iframe']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
    '*': ['class', 'id'],
  },
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
};

const POST_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, username: true, avatar: true } },
  featuredImage: { select: { id: true, url: true, alt: true } },
  categories: { select: { id: true, name: true, slug: true } },
  tags: { select: { id: true, name: true, slug: true } },
};

export async function listPosts(query: PostQuery, isAuthenticated: boolean) {
  const { page, limit, status, authorId, categoryId, tagId, search } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (!isAuthenticated) {
    where.status = 'PUBLISHED';
  } else if (status) {
    where.status = status;
  }

  if (authorId) where.authorId = authorId;
  if (categoryId) where.categories = { some: { id: categoryId } };
  if (tagId) where.tags = { some: { id: tagId } };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: POST_SELECT }),
    prisma.post.count({ where }),
  ]);

  return { posts, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPostBySlug(slug: string, isAuthenticated: boolean) {
  const where: any = { slug };
  if (!isAuthenticated) where.status = 'PUBLISHED';

  const post = await prisma.post.findFirst({
    where,
    select: { ...POST_SELECT, content: true },
  });

  if (!post) throw new AppError(404, 'Post not found');
  return post;
}

export async function createPost(data: CreatePostInput, authorId: string) {
  const slug = data.slug || slugify(data.title);
  const content = sanitizeHtml(data.content, SANITIZE_OPTIONS);

  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) throw new AppError(409, 'Slug already in use');

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug,
      content,
      excerpt: data.excerpt,
      status: data.status,
      authorId,
      featuredImageId: data.featuredImageId,
      categories: { connect: data.categoryIds.map((id) => ({ id })) },
      tags: { connect: data.tagIds.map((id) => ({ id })) },
      publishedAt: data.status === 'PUBLISHED' ? new Date() : undefined,
    },
    select: { ...POST_SELECT, content: true },
  });

  return post;
}

export async function updatePost(id: string, data: UpdatePostInput, userId: string, userRole: string) {
  const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true, status: true } });
  if (!existing) throw new AppError(404, 'Post not found');

  const isAuthor = existing.authorId === userId;
  const canEdit = userRole === 'ADMIN' || userRole === 'EDITOR' || isAuthor;
  if (!canEdit) throw new AppError(403, 'Insufficient permissions');

  const updates: any = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.slug !== undefined) {
    const slugConflict = await prisma.post.findFirst({ where: { slug: data.slug, id: { not: id } } });
    if (slugConflict) throw new AppError(409, 'Slug already in use');
    updates.slug = data.slug;
  }
  if (data.content !== undefined) updates.content = sanitizeHtml(data.content, SANITIZE_OPTIONS);
  if (data.excerpt !== undefined) updates.excerpt = data.excerpt;
  if (data.status !== undefined) {
    updates.status = data.status;
    if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      updates.publishedAt = new Date();
    }
  }
  if (data.featuredImageId !== undefined) updates.featuredImageId = data.featuredImageId;
  if (data.categoryIds !== undefined) updates.categories = { set: data.categoryIds.map((i) => ({ id: i })) };
  if (data.tagIds !== undefined) updates.tags = { set: data.tagIds.map((i) => ({ id: i })) };

  return prisma.post.update({ where: { id }, data: updates, select: { ...POST_SELECT, content: true } });
}

export async function deletePost(id: string, userId: string, userRole: string) {
  const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!existing) throw new AppError(404, 'Post not found');

  const canDelete = userRole === 'ADMIN' || userRole === 'EDITOR';
  if (!canDelete) throw new AppError(403, 'Insufficient permissions');

  await prisma.post.delete({ where: { id } });
}

export async function publishPost(id: string, userRole: string) {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Post not found');

  const canPublish = userRole === 'ADMIN' || userRole === 'EDITOR';
  if (!canPublish) throw new AppError(403, 'Insufficient permissions');

  return prisma.post.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: existing.publishedAt ?? new Date() },
    select: POST_SELECT,
  });
}
