import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function getSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: '1' } });
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { siteTitle, siteDescription, siteUrl, postsPerPage, allowRegistration } = req.body;

    const settings = await prisma.settings.upsert({
      where: { id: '1' },
      create: { id: '1', siteTitle, siteDescription, siteUrl, postsPerPage, allowRegistration },
      update: {
        ...(siteTitle !== undefined && { siteTitle }),
        ...(siteDescription !== undefined && { siteDescription }),
        ...(siteUrl !== undefined && { siteUrl }),
        ...(postsPerPage !== undefined && { postsPerPage }),
        ...(allowRegistration !== undefined && { allowRegistration }),
      },
    });

    res.json({ settings });
  } catch (err) {
    next(err);
  }
}
