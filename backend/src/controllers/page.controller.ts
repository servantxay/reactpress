import { Request, Response, NextFunction } from 'express';
import * as PageService from '../services/page.service';

export async function listPages(req: Request, res: Response, next: NextFunction) {
  try {
    const pages = await PageService.listPages(!!req.user);
    res.json({ pages });
  } catch (err) {
    next(err);
  }
}

export async function getPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await PageService.getPageBySlug(req.params.slug, !!req.user);
    res.json({ page });
  } catch (err) {
    next(err);
  }
}

export async function createPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await PageService.createPage(req.body, req.user!.id);
    res.status(201).json({ page });
  } catch (err) {
    next(err);
  }
}

export async function updatePage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await PageService.updatePage(req.params.id, req.body);
    res.json({ page });
  } catch (err) {
    next(err);
  }
}

export async function deletePage(req: Request, res: Response, next: NextFunction) {
  try {
    await PageService.deletePage(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
