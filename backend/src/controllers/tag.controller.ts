import { Request, Response, NextFunction } from 'express';
import slugify from '../lib/slugify';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function listTags(_req: Request, res: Response, next: NextFunction) {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
    res.json({ tags });
  } catch (err) {
    next(err);
  }
}

export async function createTag(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const slug = req.body.slug || slugify(name);

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) throw new AppError(409, 'Slug already in use');

    const tag = await prisma.tag.create({ data: { name, slug } });
    res.status(201).json({ tag });
  } catch (err) {
    next(err);
  }
}

export async function updateTag(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.tag.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Tag not found');

    const updates: any = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.slug !== undefined) {
      const conflict = await prisma.tag.findFirst({ where: { slug: req.body.slug, id: { not: req.params.id } } });
      if (conflict) throw new AppError(409, 'Slug already in use');
      updates.slug = req.body.slug;
    }

    const tag = await prisma.tag.update({ where: { id: req.params.id }, data: updates });
    res.json({ tag });
  } catch (err) {
    next(err);
  }
}

export async function deleteTag(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.tag.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Tag not found');
    await prisma.tag.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
