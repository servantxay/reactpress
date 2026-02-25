import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  role: true,
  avatar: true,
  bio: true,
  createdAt: true,
  _count: { select: { posts: true } },
};

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({ select: USER_SELECT, orderBy: { createdAt: 'desc' } });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: USER_SELECT });
    if (!user) throw new AppError(404, 'User not found');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    // Users can only update themselves; admins can update anyone
    const targetId = req.params.id;
    if (req.user!.id !== targetId && req.user!.role !== 'ADMIN') {
      throw new AppError(403, 'Insufficient permissions');
    }

    const { username, bio, avatar } = req.body;
    const updates: any = {};
    if (username !== undefined) {
      const conflict = await prisma.user.findFirst({ where: { username, id: { not: targetId } } });
      if (conflict) throw new AppError(409, 'Username already taken');
      updates.username = username;
    }
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await prisma.user.update({ where: { id: targetId }, data: updates, select: USER_SELECT });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
      select: USER_SELECT,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'User not found');

    const valid = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
    if (!valid) throw new AppError(401, 'Current password is incorrect');

    const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'User not found');
    if (existing.id === req.user!.id) throw new AppError(400, 'Cannot delete your own account');

    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
