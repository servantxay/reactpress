import slugify from '../lib/slugify';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreatePageInput, UpdatePageInput } from '@reactpress/shared';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height'],
    '*': ['class', 'id'],
  },
};

const PAGE_SELECT = {
  id: true,
  title: true,
  slug: true,
  status: true,
  order: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, username: true } },
};

export async function listPages(isAuthenticated: boolean) {
  const where: any = {};
  if (!isAuthenticated) where.status = 'PUBLISHED';

  return prisma.page.findMany({ where, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }], select: PAGE_SELECT });
}

export async function getPageBySlug(slug: string, isAuthenticated: boolean) {
  const where: any = { slug };
  if (!isAuthenticated) where.status = 'PUBLISHED';

  const page = await prisma.page.findFirst({ where, select: { ...PAGE_SELECT, content: true } });
  if (!page) throw new AppError(404, 'Page not found');
  return page;
}

export async function createPage(data: CreatePageInput, authorId: string) {
  const slug = data.slug || slugify(data.title);
  const content = sanitizeHtml(data.content, SANITIZE_OPTIONS);

  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) throw new AppError(409, 'Slug already in use');

  return prisma.page.create({
    data: { title: data.title, slug, content, status: data.status, authorId, parentId: data.parentId, order: data.order },
    select: { ...PAGE_SELECT, content: true },
  });
}

export async function updatePage(id: string, data: UpdatePageInput) {
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Page not found');

  const updates: any = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.slug !== undefined) {
    const conflict = await prisma.page.findFirst({ where: { slug: data.slug, id: { not: id } } });
    if (conflict) throw new AppError(409, 'Slug already in use');
    updates.slug = data.slug;
  }
  if (data.content !== undefined) updates.content = sanitizeHtml(data.content, SANITIZE_OPTIONS);
  if (data.status !== undefined) updates.status = data.status;
  if (data.parentId !== undefined) updates.parentId = data.parentId;
  if (data.order !== undefined) updates.order = data.order;

  return prisma.page.update({ where: { id }, data: updates, select: { ...PAGE_SELECT, content: true } });
}

export async function deletePage(id: string) {
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Page not found');
  await prisma.page.delete({ where: { id } });
}
