import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { MediaQuery, UpdateMediaInput } from '@reactpress/shared';
import { env } from '../config/env';

export async function uploadMedia(file: Express.Multer.File, uploadedById: string, baseUrl: string) {
  let width: number | undefined;
  let height: number | undefined;

  // Extract dimensions for images and optimize
  if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
    try {
      const metadata = await sharp(file.path).metadata();
      width = metadata.width;
      height = metadata.height;

      // Optimize: convert large images to webp, resize if too large
      if (metadata.width && metadata.width > 2000) {
        const optimizedPath = file.path + '.webp';
        await sharp(file.path)
          .resize({ width: 2000, withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(optimizedPath);

        // Replace original with optimized
        fs.unlinkSync(file.path);
        fs.renameSync(optimizedPath, file.path);

        const newMeta = await sharp(file.path).metadata();
        width = newMeta.width;
        height = newMeta.height;
      }
    } catch {
      // Not a processable image, continue
    }
  }

  const url = `${baseUrl}/uploads/${file.filename}`;
  const stat = fs.statSync(file.path);

  const media = await prisma.media.create({
    data: {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: stat.size,
      url,
      width,
      height,
      uploadedById,
    },
  });

  return media;
}

export async function listMedia(query: MediaQuery) {
  const { page, limit, mimeType, search } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (mimeType) where.mimeType = { contains: mimeType };
  if (search) where.originalName = { contains: search, mode: 'insensitive' };

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, username: true } } },
    }),
    prisma.media.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateMedia(id: string, data: UpdateMediaInput, userId: string, userRole: string) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new AppError(404, 'Media not found');

  const canEdit = media.uploadedById === userId || userRole === 'ADMIN';
  if (!canEdit) throw new AppError(403, 'Insufficient permissions');

  return prisma.media.update({ where: { id }, data });
}

export async function deleteMedia(id: string, userId: string, userRole: string) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new AppError(404, 'Media not found');

  const canDelete = media.uploadedById === userId || userRole === 'ADMIN';
  if (!canDelete) throw new AppError(403, 'Insufficient permissions');

  const filePath = path.join(env.UPLOAD_DIR, media.filename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // File already gone
  }

  await prisma.media.delete({ where: { id } });
}
