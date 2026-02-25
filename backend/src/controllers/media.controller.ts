import { Request, Response, NextFunction } from 'express';
import * as MediaService from '../services/media.service';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';

export async function listMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await MediaService.listMedia(req.query as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError(422, 'No file uploaded');

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const media = await MediaService.uploadMedia(req.file, req.user!.id, baseUrl);
    res.status(201).json({ media });
  } catch (err) {
    next(err);
  }
}

export async function updateMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const media = await MediaService.updateMedia(req.params.id, req.body, req.user!.id, req.user!.role);
    res.json({ media });
  } catch (err) {
    next(err);
  }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction) {
  try {
    await MediaService.deleteMedia(req.params.id, req.user!.id, req.user!.role);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
