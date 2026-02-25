import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';
import { rotateRefreshToken } from '../services/token.service';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken, user } = await AuthService.login(
      req.body,
      req.headers['user-agent'],
      req.ip
    );
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      res.status(401).json({ error: 'No refresh token provided' });
      return;
    }

    const result = await rotateRefreshToken(token, req.headers['user-agent'], req.ip);
    if (!result) {
      res.clearCookie('refreshToken');
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.json({ accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await AuthService.logout(req.user!.id);
    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await AuthService.getMe(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
