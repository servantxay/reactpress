import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { signAccessToken, createRefreshToken, revokeUserRefreshTokens } from './token.service';
import { RegisterInput, LoginInput } from '@reactpress/shared';

export async function register(data: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });

  if (existing) {
    throw new AppError(409, existing.email === data.email ? 'Email already in use' : 'Username already taken');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: { email: data.email, username: data.username, passwordHash, role: 'SUBSCRIBER' },
    select: { id: true, email: true, username: true, role: true, createdAt: true },
  });

  return user;
}

export async function login(data: LoginInput, userAgent?: string, ip?: string) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) throw new AppError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw new AppError(401, 'Invalid email or password');

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role as any,
  });

  const refreshToken = await createRefreshToken(user.id, userAgent, ip);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, username: user.username, role: user.role, avatar: user.avatar },
  };
}

export async function logout(userId: string): Promise<void> {
  await revokeUserRefreshTokens(userId);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true, role: true, avatar: true, bio: true, createdAt: true },
  });

  if (!user) throw new AppError(404, 'User not found');
  return user;
}
