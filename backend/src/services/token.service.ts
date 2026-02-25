import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { UserRole } from '@reactpress/shared';

interface TokenPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  });
}

export function verifyRefreshToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
  return payload.sub;
}

export async function createRefreshToken(
  userId: string,
  userAgent?: string,
  ip?: string
): Promise<string> {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = await bcrypt.hash(rawToken, 10);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt, userAgent, ip },
  });

  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
  });
}

export async function rotateRefreshToken(
  oldToken: string,
  userAgent?: string,
  ip?: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  let userId: string;
  try {
    userId = verifyRefreshToken(oldToken);
  } catch {
    return null;
  }

  // Find the matching hashed token
  const stored = await prisma.refreshToken.findMany({
    where: { userId, revoked: false, expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  let matched: (typeof stored)[0] | undefined;
  for (const t of stored) {
    if (await bcrypt.compare(oldToken, t.tokenHash)) {
      matched = t;
      break;
    }
  }

  if (!matched) return null;

  // Revoke old token
  await prisma.refreshToken.update({
    where: { id: matched.id },
    data: { revoked: true },
  });

  const { user } = matched;
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role as UserRole,
  });

  const newRefreshToken = await createRefreshToken(user.id, userAgent, ip);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function revokeUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}
