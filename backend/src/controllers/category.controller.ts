import { Request, Response, NextFunction } from 'express';
import slugify from '../lib/slugify';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: { _count: { select: { posts: true } } },
    });
    if (!category) throw new AppError(404, 'Category not found');
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, parentId } = req.body;
    const slug = req.body.slug || slugify(name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw new AppError(409, 'Slug already in use');

    const category = await prisma.category.create({
      data: { name, slug, description, parentId },
    });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Category not found');

    const updates: any = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.slug !== undefined) {
      const conflict = await prisma.category.findFirst({ where: { slug: req.body.slug, id: { not: req.params.id } } });
      if (conflict) throw new AppError(409, 'Slug already in use');
      updates.slug = req.body.slug;
    }
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.parentId !== undefined) updates.parentId = req.body.parentId;

    const category = await prisma.category.update({ where: { id: req.params.id }, data: updates });
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Category not found');
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
